"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ── Orientation Color Palettes ────────────────────────────────────────────
const PALETTE_3 = ["#E06C75", "#61AFEF", "#98C379"];
const PALETTE_6 = ["#E06C75", "#61AFEF", "#98C379", "#D19A66", "#C678DD", "#56B6C2"];

// ── Helpers ───────────────────────────────────────────────────────────────

/** Positive modulo (JS % can return negatives) */
function pmod(n, m) { return ((n % m) + m) % m; }

/** 8-neighbor Moore offsets */
const MOORE = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];

/** Periodic distance squared (torus) */
function periodicDist2(r1, c1, r2, c2, rows, cols) {
    const dr = Math.min(Math.abs(r1 - r2), rows - Math.abs(r1 - r2));
    const dc = Math.min(Math.abs(c1 - c2), cols - Math.abs(c1 - c2));
    return dr * dr + dc * dc;
}

/** Generate Voronoi-like seeds and assign each cell to the nearest seed */
function generateVoronoi(rows, cols, numOrientations) {
    const grid = new Uint8Array(rows * cols);
    const seeds = [];
    for (let o = 0; o < numOrientations; o++) {
        seeds.push({ r: Math.floor(Math.random() * rows), c: Math.floor(Math.random() * cols), o });
    }
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            let minDist = Infinity;
            let best = 0;
            for (const s of seeds) {
                const d = periodicDist2(r, c, s.r, s.c, rows, cols);
                if (d < minDist) { minDist = d; best = s.o; }
            }
            grid[r * cols + c] = best;
        }
    }
    return grid;
}

/** Completely random grid */
function generateMix(rows, cols, numOrientations) {
    const grid = new Uint8Array(rows * cols);
    for (let i = 0; i < grid.length; i++) {
        grid[i] = Math.floor(Math.random() * numOrientations);
    }
    return grid;
}

/** Calculate total energy of the system */
function calcTotalEnergy(grid, rows, cols, bulkE, grainE) {
    let total = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const ori = grid[r * cols + c];
            for (const [dr, dc] of MOORE) {
                const nr = pmod(r + dr, rows);
                const nc = pmod(c + dc, cols);
                total += grid[nr * cols + nc] === ori ? bulkE : grainE;
            }
        }
    }
    // Each pair counted twice
    return total / 2;
}

/** Count boundary sites (cells with at least one unlike neighbor) */
function countBoundarySites(grid, rows, cols) {
    let count = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const ori = grid[r * cols + c];
            for (const [dr, dc] of MOORE) {
                const nr = pmod(r + dr, rows);
                const nc = pmod(c + dc, cols);
                if (grid[nr * cols + nc] !== ori) { count++; break; }
            }
        }
    }
    return count;
}

/** Estimate number of distinct grains using flood-fill with periodic boundaries */
function countGrains(grid, rows, cols) {
    const visited = new Uint8Array(rows * cols);
    let grains = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const idx = r * cols + c;
            if (visited[idx]) continue;
            grains++;
            // BFS
            const queue = [idx];
            visited[idx] = 1;
            const ori = grid[idx];
            while (queue.length > 0) {
                const cur = queue.pop();
                const cr = Math.floor(cur / cols);
                const cc = cur % cols;
                for (const [dr, dc] of MOORE) {
                    const nr = pmod(cr + dr, rows);
                    const nc = pmod(cc + dc, cols);
                    const nIdx = nr * cols + nc;
                    if (!visited[nIdx] && grid[nIdx] === ori) {
                        visited[nIdx] = 1;
                        queue.push(nIdx);
                    }
                }
            }
        }
    }
    return grains;
}

// ── Component ─────────────────────────────────────────────────────────────

export default function GrainGrowthSimulation() {
    // State
    const [rows, setRows] = useState(40);
    const [cols, setCols] = useState(60);
    const [bulkE, setBulkE] = useState(-50);
    const [grainE, setGrainE] = useState(50);
    const [temperature, setTemperature] = useState(100);
    const [interval, setInterval_] = useState(1);
    const [trialsPerFrame, setTrialsPerFrame] = useState(100);
    const [numOrientations, setNumOrientations] = useState(3);
    const [running, setRunning] = useState(false);

    // Stats
    const [pctBoundary, setPctBoundary] = useState(0);
    const [meanGrainSize, setMeanGrainSize] = useState(0);
    const [stepCount, setStepCount] = useState(0);

    // Refs
    const gridRef = useRef(null);
    const canvasRef = useRef(null);
    const energyCanvasRef = useRef(null);
    const energyHistoryRef = useRef([]);
    const runningRef = useRef(false);
    const timerRef = useRef(null);
    const paramsRef = useRef({ rows, cols, bulkE, grainE, temperature, trialsPerFrame, numOrientations });

    // Keep params ref current
    useEffect(() => {
        paramsRef.current = { rows, cols, bulkE, grainE, temperature, trialsPerFrame, numOrientations };
    }, [rows, cols, bulkE, grainE, temperature, trialsPerFrame, numOrientations]);

    // ── Drawing ───────────────────────────────────────────────────────────
    const drawGrid = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !gridRef.current) return;
        const ctx = canvas.getContext("2d");
        const { rows: R, cols: C } = paramsRef.current;
        const palette = paramsRef.current.numOrientations === 6 ? PALETTE_6 : PALETTE_3;
        const cellW = canvas.width / C;
        const cellH = canvas.height / C * (C / R) || canvas.height / R;
        // Compute actual cell size
        const cw = canvas.width / C;
        const ch = canvas.height / R;
        const grid = gridRef.current;

        for (let r = 0; r < R; r++) {
            for (let c = 0; c < C; c++) {
                ctx.fillStyle = palette[grid[r * C + c] % palette.length];
                ctx.fillRect(c * cw, r * ch, cw + 0.5, ch + 0.5);
            }
        }
    }, []);

    const drawEnergyPlot = useCallback(() => {
        const canvas = energyCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const W = canvas.width;
        const H = canvas.height;
        const history = energyHistoryRef.current;

        ctx.clearRect(0, 0, W, H);
        // Background
        ctx.fillStyle = "rgba(30,34,42,0.6)";
        ctx.fillRect(0, 0, W, H);

        if (history.length < 2) return;

        const minE = Math.min(...history);
        const maxE = Math.max(...history);
        const range = maxE - minE || 1;

        ctx.strokeStyle = "#61AFEF";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < history.length; i++) {
            const x = (i / (history.length - 1)) * W;
            const y = H - ((history[i] - minE) / range) * (H - 10) - 5;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Labels
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.font = "10px var(--font-mono, monospace)";
        ctx.fillText(`max: ${maxE.toFixed(0)}`, 4, 12);
        ctx.fillText(`min: ${minE.toFixed(0)}`, 4, H - 4);
    }, []);

    // ── Init ──────────────────────────────────────────────────────────────
    const initGrid = useCallback((mode = "voronoi") => {
        const { rows: R, cols: C, numOrientations: N } = paramsRef.current;
        gridRef.current = mode === "voronoi" ? generateVoronoi(R, C, N) : generateMix(R, C, N);
        energyHistoryRef.current = [];
        setStepCount(0);
        updateStats();
        drawGrid();
        drawEnergyPlot();
    }, [drawGrid, drawEnergyPlot]);

    const updateStats = useCallback(() => {
        const { rows: R, cols: C, bulkE: bE, grainE: gE } = paramsRef.current;
        const grid = gridRef.current;
        if (!grid) return;
        const totalCells = R * C;
        const boundary = countBoundarySites(grid, R, C);
        setPctBoundary(((boundary / totalCells) * 100).toFixed(1));
        const grains = countGrains(grid, R, C);
        setMeanGrainSize((totalCells / grains).toFixed(1));
        const energy = calcTotalEnergy(grid, R, C, bE, gE);
        energyHistoryRef.current.push(energy);
        // Cap history at 500 points
        if (energyHistoryRef.current.length > 500) energyHistoryRef.current.shift();
    }, []);

    // ── MC Step ───────────────────────────────────────────────────────────
    const mcStep = useCallback(() => {
        const { rows: R, cols: C, bulkE: bE, grainE: gE, temperature: T, trialsPerFrame: trials, numOrientations: N } = paramsRef.current;
        const grid = gridRef.current;
        if (!grid) return;

        for (let t = 0; t < trials; t++) {
            // 1. Pick random cell
            const r = Math.floor(Math.random() * R);
            const c = Math.floor(Math.random() * C);
            const idx = r * C + c;
            const ori = grid[idx];

            // 2. Check 8 neighbors
            const neighborOris = [];
            let allSame = true;
            for (const [dr, dc] of MOORE) {
                const nr = pmod(r + dr, R);
                const nc = pmod(c + dc, C);
                const nOri = grid[nr * C + nc];
                neighborOris.push(nOri);
                if (nOri !== ori) allSame = false;
            }

            // 3. Optimization: skip if all neighbors match
            if (allSame) continue;

            // 4. Build invasion pool (only different orientations)
            const invasionPool = neighborOris.filter(o => o !== ori);
            const invading = invasionPool[Math.floor(Math.random() * invasionPool.length)];

            // 5. Calculate ΔE
            let eInitial = 0, eFinal = 0;
            for (const nOri of neighborOris) {
                eInitial += (nOri === ori) ? bE : gE;
                eFinal += (nOri === invading) ? bE : gE;
            }
            const dE = eFinal - eInitial;

            // 6. Glauber acceptance
            const ratio = dE / T;
            let pAccept;
            if (ratio > 50) pAccept = 0;
            else if (ratio < -50) pAccept = 1;
            else pAccept = 1 / (1 + Math.exp(ratio));

            if (Math.random() < pAccept) {
                grid[idx] = invading;
            }
        }

        setStepCount(prev => prev + trials);
    }, []);

    // ── Simulation Loop ───────────────────────────────────────────────────
    useEffect(() => {
        runningRef.current = running;
        if (running) {
            const tick = () => {
                if (!runningRef.current) return;
                mcStep();
                updateStats();
                drawGrid();
                drawEnergyPlot();
                timerRef.current = setTimeout(tick, paramsRef.current.interval || 1);
            };
            tick();
        } else {
            if (timerRef.current) clearTimeout(timerRef.current);
        }
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [running, mcStep, updateStats, drawGrid, drawEnergyPlot]);

    // ── Canvas Sizing ─────────────────────────────────────────────────────
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const parent = canvas.parentElement;
        const w = parent.clientWidth;
        // Aspect ratio from grid
        const h = Math.round(w * (rows / cols));
        canvas.width = cols * 2;  // 2x resolution
        canvas.height = rows * 2;
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";

        // Energy canvas
        const ec = energyCanvasRef.current;
        if (ec) {
            ec.width = 240;
            ec.height = 100;
        }

        initGrid("voronoi");
    }, [rows, cols, numOrientations, initGrid]);

    // ── Click to Cycle ────────────────────────────────────────────────────
    const handleCanvasClick = useCallback((e) => {
        const canvas = canvasRef.current;
        if (!canvas || !gridRef.current) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const { rows: R, cols: C, numOrientations: N } = paramsRef.current;
        const c = Math.floor((x / rect.width) * C);
        const r = Math.floor((y / rect.height) * R);
        if (r >= 0 && r < R && c >= 0 && c < C) {
            const idx = r * C + c;
            gridRef.current[idx] = (gridRef.current[idx] + 1) % N;
            drawGrid();
        }
    }, [drawGrid]);

    // ── Styles ────────────────────────────────────────────────────────────
    const fieldStyle = { border: "1px solid var(--color-pencil)", borderRadius: "var(--radius-md)", padding: "1.25rem", background: "white", boxShadow: "var(--shadow-soft)", marginBottom: "1rem" };
    const legendStyle = { font: "700 0.8rem var(--font-sans)", color: "var(--color-amber)", padding: "0 6px", textTransform: "uppercase", letterSpacing: "0.06em" };
    const ctrlGrid = { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" };
    const lblStyle = { display: "flex", flexDirection: "column", gap: 4, fontSize: "0.72rem", fontWeight: 700, color: "var(--color-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" };
    const inputStyle = { fontFamily: "var(--font-mono)", fontSize: "0.85rem", padding: "6px 8px", border: "1px solid var(--color-pencil)", borderRadius: 6, background: "var(--color-cream)", color: "var(--color-charcoal)" };
    const btnStyle = { fontFamily: "var(--font-mono)", fontSize: "0.8rem", fontWeight: 700, padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", transition: "all 0.2s" };

    return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", alignItems: "flex-start" }}>

            {/* Controls */}
            <div style={{ flex: "1 1 280px", minWidth: 260, maxWidth: 340 }}>

                <fieldset style={fieldStyle}>
                    <legend style={legendStyle}>🔬 Grid</legend>
                    <div style={ctrlGrid}>
                        <label style={lblStyle}>Rows <input type="number" min="5" max="200" value={rows} onChange={e => { setRows(Number(e.target.value)); setRunning(false); }} style={inputStyle} /></label>
                        <label style={lblStyle}>Cols <input type="number" min="5" max="200" value={cols} onChange={e => { setCols(Number(e.target.value)); setRunning(false); }} style={inputStyle} /></label>
                    </div>
                    <label style={{ ...lblStyle, marginTop: "0.75rem" }}>
                        Orientations
                        <select value={numOrientations} onChange={e => { setNumOrientations(Number(e.target.value)); setRunning(false); }} style={{ ...inputStyle, cursor: "pointer" }}>
                            <option value={3}>3 Orientations</option>
                            <option value={6}>6 Orientations</option>
                        </select>
                    </label>
                </fieldset>

                <fieldset style={fieldStyle}>
                    <legend style={legendStyle}>⚡ Energy & Temperature</legend>
                    <div style={ctrlGrid}>
                        <label style={lblStyle}>Bulk Energy <input type="number" value={bulkE} onChange={e => setBulkE(Number(e.target.value))} style={inputStyle} /></label>
                        <label style={lblStyle}>Grain Energy <input type="number" value={grainE} onChange={e => setGrainE(Number(e.target.value))} style={inputStyle} /></label>
                        <label style={lblStyle}>Temperature <input type="number" min="1" value={temperature} onChange={e => setTemperature(Number(e.target.value))} style={inputStyle} /></label>
                        <label style={lblStyle}>Trials / Frame <input type="number" min="1" value={trialsPerFrame} onChange={e => setTrialsPerFrame(Number(e.target.value))} style={inputStyle} /></label>
                    </div>
                    <label style={{ ...lblStyle, marginTop: "0.75rem" }}>
                        Time Interval (ms)
                        <input type="number" min="1" value={interval} onChange={e => setInterval_(Number(e.target.value))} style={inputStyle} />
                    </label>
                </fieldset>

                <fieldset style={fieldStyle}>
                    <legend style={legendStyle}>🎮 Actions</legend>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        <button onClick={() => setRunning(r => !r)} style={{ ...btnStyle, background: running ? "#E06C75" : "var(--color-amber)", color: "white" }}>
                            {running ? "⏸ Pause" : "▶ Start"}
                        </button>
                        <button onClick={() => { setRunning(false); initGrid("voronoi"); }} style={{ ...btnStyle, background: "var(--color-cream)", color: "var(--color-charcoal)", border: "1px solid var(--color-pencil)" }}>
                            🌱 Regenerate
                        </button>
                        <button onClick={() => { setRunning(false); initGrid("mix"); }} style={{ ...btnStyle, background: "var(--color-cream)", color: "var(--color-charcoal)", border: "1px solid var(--color-pencil)" }}>
                            🎲 Mix
                        </button>
                    </div>
                </fieldset>

                <fieldset style={fieldStyle}>
                    <legend style={legendStyle}>📊 Statistics</legend>
                    <div style={{ fontSize: "0.82rem", color: "var(--color-secondary)", lineHeight: 2 }}>
                        <div>MC Trials: <strong style={{ color: "var(--color-charcoal)" }}>{stepCount.toLocaleString()}</strong></div>
                        <div>Boundary Sites: <strong style={{ color: "var(--color-charcoal)" }}>{pctBoundary}%</strong></div>
                        <div>Mean Grain Size: <strong style={{ color: "var(--color-charcoal)" }}>{meanGrainSize} cells</strong></div>
                    </div>
                    <div style={{ marginTop: "0.75rem" }}>
                        <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--color-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Total Energy</div>
                        <canvas ref={energyCanvasRef} style={{ width: "100%", height: 100, borderRadius: 6, display: "block" }} />
                    </div>
                </fieldset>
            </div>

            {/* Canvas */}
            <div style={{ flex: "1 1 500px", minWidth: 300, position: "sticky", top: "2rem" }}>
                <div className="polaroid" style={{ margin: 0, width: "100%" }}>
                    <div style={{ width: "100%", overflow: "hidden", background: "#1E222A", borderRadius: "2px" }}>
                        <canvas ref={canvasRef} onClick={handleCanvasClick} style={{ display: "block", cursor: "crosshair", imageRendering: "pixelated" }} />
                    </div>
                    <div className="polaroid-caption">
                        Monte Carlo Grain Growth · {numOrientations} Orientations
                    </div>
                </div>
            </div>
        </div>
    );
}
