"use client";

import { useRef, useState, useEffect, useCallback } from "react";

// ─── Constants ──────────────────────────────────────────────────
const EMPTY = 0, A = 1, B = 2;
const COORD_4 = 4, COORD_8 = 8;

const DEFAULTS = {
    n: 40, m: 40,
    initA: 400, initB: 400,
    eAA: -10, eBB: -50, eAB: 50,
    temperature: 100,
    timeStepMs: 1,
    attemptsPerStep: 100,
    diffProb: 0.8,           // 0–1 probability of diffusion vs flip
    coordMode: "4",          // "4" | "8" | "both"
};

// ─── Grid helpers ────────────────────────────────────────────────
function createGrid(n, m, initA, initB) {
    const total = n * m;
    const nA = Math.min(initA, total);
    const nB = Math.min(initB, total - nA);
    // Build flat array then shuffle
    const flat = Array(total).fill(null).map((_, i) => {
        if (i < nA) return { type: A, coord: COORD_4 };
        if (i < nA + nB) return { type: B, coord: COORD_4 };
        return { type: EMPTY, coord: COORD_4 };
    });
    for (let i = flat.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [flat[i], flat[j]] = [flat[j], flat[i]];
    }
    const grid = [];
    for (let r = 0; r < m; r++) {
        grid[r] = flat.slice(r * n, (r + 1) * n);
    }
    return grid;
}

// Periodic boundary neighbor indices
function neighbors4(r, c, rows, cols) {
    return [
        [(r - 1 + rows) % rows, c],
        [(r + 1) % rows, c],
        [r, (c - 1 + cols) % cols],
        [r, (c + 1) % cols],
    ];
}
function neighbors8(r, c, rows, cols) {
    return [
        [(r - 1 + rows) % rows, c],
        [(r + 1) % rows, c],
        [r, (c - 1 + cols) % cols],
        [r, (c + 1) % cols],
        [(r - 1 + rows) % rows, (c - 1 + cols) % cols],
        [(r - 1 + rows) % rows, (c + 1) % cols],
        [(r + 1) % rows, (c - 1 + cols) % cols],
        [(r + 1) % rows, (c + 1) % cols],
    ];
}

function getNeighbors(r, c, coord, rows, cols) {
    return coord === COORD_8 ? neighbors8(r, c, rows, cols) : neighbors4(r, c, rows, cols);
}

function cellEnergy(grid, r, c, coord, eAA, eBB, eAB) {
    const type = grid[r][c].type;
    if (type === EMPTY) return 0;
    const rows = grid.length, cols = grid[0].length;
    let e = 0;
    for (const [nr, nc] of getNeighbors(r, c, coord, rows, cols)) {
        const ntype = grid[nr][nc].type;
        if (ntype === EMPTY) continue;
        if (type === A && ntype === A) e += eAA;
        else if (type === B && ntype === B) e += eBB;
        else e += eAB;
    }
    return e;
}

function glauberProb(eCurrent, eProposed, T) {
    const dE = eProposed - eCurrent;
    const q = Math.exp(-dE / T);
    return q / (1 + q);
}

// ─── Main component ─────────────────────────────────────────────
export default function BinaryPhaseSimulation() {
    const [n, setN] = useState(DEFAULTS.n);
    const [m, setM] = useState(DEFAULTS.m);
    const [initA, setInitA] = useState(DEFAULTS.initA);
    const [initB, setInitB] = useState(DEFAULTS.initB);
    const [eAA, setEAA] = useState(DEFAULTS.eAA);
    const [eBB, setEBB] = useState(DEFAULTS.eBB);
    const [eAB, setEAB] = useState(DEFAULTS.eAB);
    const [temperature, setTemperature] = useState(DEFAULTS.temperature);
    const [timeStepMs, setTimeStepMs] = useState(DEFAULTS.timeStepMs);
    const [attemptsPerStep, setAttemptsPerStep] = useState(DEFAULTS.attemptsPerStep);
    const [diffProb, setDiffProb] = useState(DEFAULTS.diffProb);
    const [coordMode, setCoordMode] = useState(DEFAULTS.coordMode);

    // Colors
    const [colorA, setColorA] = useState("#4A90E2");
    const [colorB, setColorB] = useState("#E85D5D");
    const [colorEmpty, setColorEmpty] = useState("#FDFBF7");
    const [color4, setColor4] = useState("#EBA352");
    const [color8, setColor8] = useState("#7C4DFF");

    const [running, setRunning] = useState(false);
    const [step, setStep] = useState(0);
    const [stats, setStats] = useState({ countA: 0, countB: 0, countEmpty: 0, pct4: 0, pct8: 0, pct4A: 0, pct4B: 0, pct8A: 0, pct8B: 0 });

    const canvasRef = useRef(null);
    const gridRef = useRef(null);
    const intervalRef = useRef(null);
    const stepRef = useRef(0);
    const paramsRef = useRef({});

    // Keep params sync
    useEffect(() => {
        paramsRef.current = { n, m, eAA, eBB, eAB, temperature, diffProb, coordMode, colorA, colorB, colorEmpty, color4, color8 };
    }, [n, m, eAA, eBB, eAB, temperature, diffProb, coordMode, colorA, colorB, colorEmpty, color4, color8]);

    // ── Stats ──────────────────────────────────────────────────
    const computeStats = useCallback((grid) => {
        const rows = grid.length, cols = grid[0].length;
        let cA = 0, cB = 0, cEmpty = 0;
        let n4A = 0, n4B = 0, n8A = 0, n8B = 0;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = grid[r][c];
                if (cell.type === EMPTY) { cEmpty++; continue; }
                if (cell.type === A) cA++; else cB++;
                if (cell.coord === COORD_4) { if (cell.type === A) n4A++; else n4B++; }
                else { if (cell.type === A) n8A++; else n8B++; }
            }
        }
        const filled = cA + cB;
        return {
            countA: cA, countB: cB, countEmpty: cEmpty,
            pct4: filled ? ((n4A + n4B) / filled * 100).toFixed(1) : "0.0",
            pct8: filled ? ((n8A + n8B) / filled * 100).toFixed(1) : "0.0",
            pct4A: filled ? (n4A / filled * 100).toFixed(1) : "0.0",
            pct4B: filled ? (n4B / filled * 100).toFixed(1) : "0.0",
            pct8A: filled ? (n8A / filled * 100).toFixed(1) : "0.0",
            pct8B: filled ? (n8B / filled * 100).toFixed(1) : "0.0",
        };
    }, []);

    // ── Draw ───────────────────────────────────────────────────
    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const grid = gridRef.current;
        if (!canvas || !grid) return;
        const { colorA: cA, colorB: cB, colorEmpty: cE, color4: c4, color8: c8 } = paramsRef.current;
        const ctx = canvas.getContext("2d");
        const rows = grid.length, cols = grid[0].length;
        const cW = canvas.width / cols, cH = canvas.height / rows;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = grid[r][c];
                ctx.fillStyle = cell.type === A ? cA : cell.type === B ? cB : cE;
                ctx.fillRect(c * cW, r * cH, cW, cH);

                // Outline for coordination (only if filled)
                if (cell.type !== EMPTY && paramsRef.current.coordMode === "both") {
                    ctx.strokeStyle = cell.coord === COORD_4 ? c4 : c8;
                    ctx.lineWidth = Math.max(1, cW * 0.12);
                    ctx.strokeRect(c * cW + ctx.lineWidth / 2, r * cH + ctx.lineWidth / 2, cW - ctx.lineWidth, cH - ctx.lineWidth);
                }
            }
        }

        // subtle grid lines
        ctx.strokeStyle = "rgba(200,200,200,0.2)";
        ctx.lineWidth = 0.5;
        for (let r = 0; r <= rows; r++) { ctx.beginPath(); ctx.moveTo(0, r * cH); ctx.lineTo(canvas.width, r * cH); ctx.stroke(); }
        for (let c = 0; c <= cols; c++) { ctx.beginPath(); ctx.moveTo(c * cW, 0); ctx.lineTo(c * cW, canvas.height); ctx.stroke(); }
    }, []);

    // ── Regenerate ─────────────────────────────────────────────
    const regenerate = useCallback(() => {
        if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
        setRunning(false);
        stepRef.current = 0;
        setStep(0);

        const grid = createGrid(n, m, initA, initB);
        gridRef.current = grid;

        const canvas = canvasRef.current;
        if (canvas) {
            const size = Math.min(canvas.parentElement.clientWidth, 560);
            canvas.width = size; canvas.height = size;
        }
        draw();
        setStats(computeStats(grid));
    }, [n, m, initA, initB, draw, computeStats]);

    useEffect(() => { regenerate(); }, []); // eslint-disable-line
    useEffect(() => { draw(); }, [colorA, colorB, colorEmpty, color4, color8, coordMode, draw]);

    // ── Canvas click → cycle state ────────────────────────────
    const handleClick = useCallback((e) => {
        const canvas = canvasRef.current;
        const grid = gridRef.current;
        if (!canvas || !grid) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left, y = e.clientY - rect.top;
        const cols = grid[0].length, rows = grid.length;
        const c = Math.floor((x / canvas.width) * cols);
        const r = Math.floor((y / canvas.height) * rows);
        if (r < 0 || r >= rows || c < 0 || c >= cols) return;
        const cell = grid[r][c];
        // Cycle: A → B → Empty → A
        cell.type = cell.type === A ? B : cell.type === B ? EMPTY : A;
        draw();
        setStats(computeStats(grid));
    }, [draw, computeStats]);

    // ── Simulation step ────────────────────────────────────────
    const simulationStep = useCallback(() => {
        const grid = gridRef.current;
        if (!grid) return;
        const { eAA: ea, eBB: eb, eAB: eab, temperature: T, diffProb: dp, coordMode: cm } = paramsRef.current;
        const rows = grid.length, cols = grid[0].length;
        const attempts = attemptsPerStep;

        for (let attempt = 0; attempt < attempts; attempt++) {
            const isModeForced = cm !== "both"; // 4-only or 8-only forces all diffusion
            const isDiffusion = isModeForced || Math.random() < dp;

            if (isDiffusion) {
                // ── Diffusion: pick two random sites ──────────────
                const r1 = Math.floor(Math.random() * rows), c1 = Math.floor(Math.random() * cols);
                const r2 = Math.floor(Math.random() * rows), c2 = Math.floor(Math.random() * cols);
                if (r1 === r2 && c1 === c2) continue;

                const cell1 = grid[r1][c1], cell2 = grid[r2][c2];
                // One must be filled, one must be empty
                const oneEmpty = (cell1.type === EMPTY) !== (cell2.type === EMPTY);
                if (!oneEmpty) continue;

                const [filledR, filledC, emptyR, emptyC] =
                    cell1.type !== EMPTY ? [r1, c1, r2, c2] : [r2, c2, r1, c1];

                // Choose coordination for this move
                let coord;
                if (cm === "both") coord = Math.random() < 0.5 ? COORD_4 : COORD_8;
                else coord = cm === "8" ? COORD_8 : COORD_4;

                const eCurrent = cellEnergy(grid, filledR, filledC, coord, ea, eb, eab);

                // Temporarily swap to compute proposed energy
                const savedFilled = { ...grid[filledR][filledC] };
                const savedEmpty = { ...grid[emptyR][emptyC] };
                grid[emptyR][emptyC] = { type: savedFilled.type, coord };
                grid[filledR][filledC] = { type: EMPTY, coord: savedFilled.coord };

                const eProposed = cellEnergy(grid, emptyR, emptyC, coord, ea, eb, eab);

                // Revert
                grid[filledR][filledC] = savedFilled;
                grid[emptyR][emptyC] = savedEmpty;

                const p = glauberProb(eCurrent, eProposed, T);
                if (Math.random() <= p) {
                    grid[emptyR][emptyC] = { type: savedFilled.type, coord };
                    grid[filledR][filledC] = { type: EMPTY, coord: savedFilled.coord };
                }
            } else {
                // ── Flip: pick one random FILLED site ─────────────
                if (cm !== "both") continue; // guard (shouldn't happen)
                const r = Math.floor(Math.random() * rows), c = Math.floor(Math.random() * cols);
                const cell = grid[r][c];
                if (cell.type === EMPTY) continue;

                const curCoord = cell.coord || COORD_4;
                const newCoord = curCoord === COORD_4 ? COORD_8 : COORD_4;

                const eCurrent = cellEnergy(grid, r, c, curCoord, ea, eb, eab);
                const eProposed = cellEnergy(grid, r, c, newCoord, ea, eb, eab);

                const p = glauberProb(eCurrent, eProposed, T);
                if (Math.random() <= p) {
                    grid[r][c] = { type: cell.type, coord: newCoord };
                }
            }
        }

        stepRef.current++;
        draw();
        if (stepRef.current % 20 === 0) {
            setStep(stepRef.current);
            setStats(computeStats(grid));
        }
    }, [attemptsPerStep, draw, computeStats]);

    // ── Start / Pause ──────────────────────────────────────────
    const toggleRunning = useCallback(() => {
        if (running) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            setRunning(false);
            setStep(stepRef.current);
            setStats(computeStats(gridRef.current));
        } else {
            intervalRef.current = setInterval(simulationStep, timeStepMs);
            setRunning(true);
        }
    }, [running, timeStepMs, simulationStep, computeStats]);

    useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

    // ── Render ─────────────────────────────────────────────────
    const total = n * m;
    const filled = stats.countA + stats.countB;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* Controls */}
            <div style={{ background: "white", padding: "1.25rem", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-soft)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "1rem" }}>
                    <CI label="Width (n)" value={n} set={setN} type="number" min={2} max={100} />
                    <CI label="Height (m)" value={m} set={setM} type="number" min={2} max={100} />
                    <CI label="Init. A count" value={initA} set={setInitA} type="number" min={0} />
                    <CI label="Init. B count" value={initB} set={setInitB} type="number" min={0} />
                    <CI label="E_AA" value={eAA} set={setEAA} type="number" />
                    <CI label="E_BB" value={eBB} set={setEBB} type="number" />
                    <CI label="E_AB" value={eAB} set={setEAB} type="number" />
                    <CI label="Temperature" value={temperature} set={setTemperature} type="number" min={1} />
                    <CI label="Timestep (ms)" value={timeStepMs} set={setTimeStepMs} type="number" min={1} max={2000} />
                    <CI label="MC attempts" value={attemptsPerStep} set={setAttemptsPerStep} type="number" min={1} max={5000} />
                    <CI label="A Color" value={colorA} set={setColorA} type="color" />
                    <CI label="B Color" value={colorB} set={setColorB} type="color" />
                    <CI label="Empty Color" value={colorEmpty} set={setColorEmpty} type="color" />
                    <CI label="4-coord outline" value={color4} set={setColor4} type="color" />
                    <CI label="8-coord outline" value={color8} set={setColor8} type="color" />
                </div>

                {/* Diffusion/Flip Slider */}
                <div style={{ marginTop: "1.25rem" }}>
                    <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Diffusion ↔ Flip: <strong style={{ color: "var(--color-charcoal)" }}>{Math.round(diffProb * 100)}% Diffusion / {Math.round((1 - diffProb) * 100)}% Flip</strong>
                    </label>
                    <input type="range" min={0} max={1} step={0.01} value={diffProb}
                        onChange={e => setDiffProb(Number(e.target.value))}
                        style={{ width: "100%", marginTop: "6px", accentColor: "var(--color-amber)" }} />
                </div>

                {/* Coordination mode */}
                <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                    <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Coordination:</label>
                    {["4", "8", "both"].map(mode => (
                        <label key={mode} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.85rem", cursor: "pointer", fontWeight: coordMode === mode ? 700 : 400 }}>
                            <input type="radio" name="coord" value={mode} checked={coordMode === mode} onChange={() => setCoordMode(mode)} style={{ accentColor: "var(--color-amber)" }} />
                            {mode === "both" ? "Both" : `${mode}-coord`}
                        </label>
                    ))}
                </div>
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <button className="card-button primary" style={{ width: "auto", padding: "10px 24px" }} onClick={regenerate}>🔄 Reset</button>
                <button className="card-button primary" style={{ width: "auto", padding: "10px 24px", background: running ? "#dc2626" : "var(--color-amber)" }} onClick={toggleRunning}>
                    {running ? "⏸ Pause" : "▶ Start"}
                </button>
            </div>

            {/* Canvas */}
            <div className="polaroid">
                <div style={{ aspectRatio: "1", width: "100%", overflow: "hidden", background: "#f5f3ef", borderRadius: "2px" }}>
                    <canvas ref={canvasRef} style={{ width: "100%", height: "100%", cursor: "crosshair" }} onClick={handleClick} />
                </div>
                <div className="polaroid-caption">
                    Step: <strong>{step}</strong> · A: <strong>{stats.countA}</strong> · B: <strong>{stats.countB}</strong> · Filled: <strong>{total > 0 ? (filled / total * 100).toFixed(1) : 0}%</strong> · T = {temperature}
                </div>
            </div>

            {/* Live Dashboard */}
            <div style={{ background: "white", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-soft)", padding: "1.25rem" }}>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1rem", marginBottom: "1rem", color: "var(--color-charcoal)" }}>📊 Live Statistics Dashboard</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.75rem" }}>
                    <Stat label="Total A" value={stats.countA} color={colorA} />
                    <Stat label="Total B" value={stats.countB} color={colorB} />
                    <Stat label="Filled Fraction" value={`${total > 0 ? (filled / total * 100).toFixed(1) : 0}%`} />
                    {coordMode === "both" && <>
                        <Stat label="4-coord (all)" value={`${stats.pct4}%`} color={color4} />
                        <Stat label="4-coord A" value={`${stats.pct4A}%`} />
                        <Stat label="4-coord B" value={`${stats.pct4B}%`} />
                        <Stat label="8-coord (all)" value={`${stats.pct8}%`} color={color8} />
                        <Stat label="8-coord A" value={`${stats.pct8A}%`} />
                        <Stat label="8-coord B" value={`${stats.pct8B}%`} />
                    </>}
                </div>
            </div>
        </div>
    );
}

// ─── Small helper components ─────────────────────────────────────
function CI({ label, value, set, type = "number", ...rest }) {
    return (
        <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.72rem", fontWeight: 700, color: "var(--color-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {label}
            <input type={type} value={value}
                onChange={e => set(type === "number" ? Number(e.target.value) : e.target.value)}
                style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", padding: type === "color" ? "2px" : "5px 7px", border: "1px solid var(--color-pencil)", borderRadius: "6px", background: "var(--color-cream)", color: "var(--color-charcoal)", height: type === "color" ? "34px" : "auto", cursor: type === "color" ? "pointer" : "text" }}
                {...rest} />
        </label>
    );
}

function Stat({ label, value, color }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--color-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "1rem", fontWeight: 700, color: color || "var(--color-charcoal)" }}>{value}</span>
        </div>
    );
}
