"use client";

import { useRef, useState, useEffect, useCallback } from "react";

// ─── Default parameter values ────────────────────────────────────
const DEFAULTS = {
    n: 50,
    m: 50,
    filled: 0,
    timeStep: 1,
    chemicalPotential: -100,
    interactionEnergy: -50,
    temperature: 100,
};

// ─── Grid helpers ────────────────────────────────────────────────
function createGrid(n, m, filledCount) {
    const grid = Array.from({ length: m }, () => Array(n).fill(0));
    let placed = 0;
    while (placed < filledCount && placed < n * m) {
        const r = Math.floor(Math.random() * m);
        const c = Math.floor(Math.random() * n);
        if (grid[r][c] === 0) {
            grid[r][c] = 1;
            placed++;
        }
    }
    return grid;
}

function countFilledNeighbors(grid, r, c, rows, cols) {
    let count = 0;
    if (r > 0 && grid[r - 1][c] === 1) count++;
    if (r < rows - 1 && grid[r + 1][c] === 1) count++;
    if (c > 0 && grid[r][c - 1] === 1) count++;
    if (c < cols - 1 && grid[r][c + 1] === 1) count++;
    return count;
}

// ─── Main component ─────────────────────────────────────────────
export default function GrandCanonicalSimulation() {
    // State
    const [n, setN] = useState(DEFAULTS.n);
    const [m, setM] = useState(DEFAULTS.m);
    const [filled, setFilled] = useState(DEFAULTS.filled);
    const [timeStep, setTimeStep] = useState(DEFAULTS.timeStep);
    const [chemPot, setChemPot] = useState(DEFAULTS.chemicalPotential);
    const [epsilon, setEpsilon] = useState(DEFAULTS.interactionEnergy);
    const [temperature, setTemperature] = useState(DEFAULTS.temperature);
    const [filledColor, setFilledColor] = useState("#4A90E2");
    const [emptyColor, setEmptyColor] = useState("#FDFBF7");

    const [running, setRunning] = useState(false);
    const [filledCount, setFilledCount] = useState(0);
    const [steps, setSteps] = useState(0);

    // Refs
    const canvasRef = useRef(null);
    const gridRef = useRef(null);
    const intervalRef = useRef(null);
    const stepsRef = useRef(0);
    const filledCountRef = useRef(0);
    const paramsRef = useRef({
        n, m, chemPot, epsilon, temperature, filledColor, emptyColor,
    });

    // Keep params ref in sync
    useEffect(() => {
        paramsRef.current = {
            n, m, chemPot, epsilon, temperature, filledColor, emptyColor,
        };
    }, [n, m, chemPot, epsilon, temperature, filledColor, emptyColor]);

    // ── Drawing ────────────────────────────────────────────────────
    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const grid = gridRef.current;
        if (!canvas || !grid) return;

        const ctx = canvas.getContext("2d");
        const rows = grid.length;
        const cols = grid[0].length;
        const cellW = canvas.width / cols;
        const cellH = canvas.height / rows;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                ctx.fillStyle =
                    grid[r][c] === 1
                        ? paramsRef.current.filledColor
                        : paramsRef.current.emptyColor;
                ctx.fillRect(c * cellW, r * cellH, cellW, cellH);
            }
        }

        // Grid lines
        ctx.strokeStyle = "rgba(225,226,230,0.35)";
        ctx.lineWidth = 0.5;
        for (let r = 0; r <= rows; r++) {
            ctx.beginPath();
            ctx.moveTo(0, r * cellH);
            ctx.lineTo(canvas.width, r * cellH);
            ctx.stroke();
        }
        for (let c = 0; c <= cols; c++) {
            ctx.beginPath();
            ctx.moveTo(c * cellW, 0);
            ctx.lineTo(c * cellW, canvas.height);
            ctx.stroke();
        }
    }, []);

    // ── Regenerate ─────────────────────────────────────────────────
    const regenerate = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setRunning(false);
        stepsRef.current = 0;
        setSteps(0);

        const grid = createGrid(n, m, filled);
        gridRef.current = grid;

        // Count actual filled
        let count = 0;
        for (let r = 0; r < m; r++)
            for (let c = 0; c < n; c++)
                if (grid[r][c] === 1) count++;
        filledCountRef.current = count;
        setFilledCount(count);

        // Resize canvas
        const canvas = canvasRef.current;
        if (canvas) {
            const container = canvas.parentElement;
            const size = Math.min(container.clientWidth, 560);
            canvas.width = size;
            canvas.height = size;
        }
        draw();
    }, [n, m, filled, draw]);

    // Init on mount
    useEffect(() => {
        regenerate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Redraw when colors change
    useEffect(() => {
        draw();
    }, [filledColor, emptyColor, draw]);

    // ── Canvas click → toggle cell ─────────────────────────────────
    const handleCanvasClick = useCallback(
        (e) => {
            const canvas = canvasRef.current;
            const grid = gridRef.current;
            if (!canvas || !grid) return;

            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const cols = grid[0].length;
            const rows = grid.length;
            const c = Math.floor((x / canvas.width) * cols);
            const r = Math.floor((y / canvas.height) * rows);

            if (r >= 0 && r < rows && c >= 0 && c < cols) {
                if (grid[r][c] === 1) {
                    grid[r][c] = 0;
                    filledCountRef.current--;
                } else {
                    grid[r][c] = 1;
                    filledCountRef.current++;
                }
                setFilledCount(filledCountRef.current);
                draw();
            }
        },
        [draw]
    );

    // ── Simulation step (Grand Canonical MC) ───────────────────────
    const simulationStep = useCallback(() => {
        const grid = gridRef.current;
        if (!grid) return;

        const { epsilon: eps, chemPot: mu, temperature: T } = paramsRef.current;
        const rows = grid.length;
        const cols = grid[0].length;

        // 1. Pick a random cell
        const r = Math.floor(Math.random() * rows);
        const c = Math.floor(Math.random() * cols);

        // 2. Count filled neighbors
        const n_f = countFilledNeighbors(grid, r, c, rows, cols);

        // 3. Current state
        const s = grid[r][c]; // 0 or 1

        // 4. Compute grand potential for current and proposed states
        //    Ω = n_f * ε * s − μ * s
        const omega_current = n_f * eps * s - mu * s;

        // Proposed state: toggle s
        const s_new = 1 - s;
        const omega_proposed = n_f * eps * s_new - mu * s_new;

        // 5. Weight q = exp((Ω_current − Ω_proposed) / T)
        const q = Math.exp((omega_current - omega_proposed) / T);

        // 6. Probability p = q / (1 + q)
        const p = q / (1 + q);

        // 7. Accept or reject
        if (Math.random() <= p) {
            grid[r][c] = s_new;
            if (s_new === 1) {
                filledCountRef.current++;
            } else {
                filledCountRef.current--;
            }
        }

        stepsRef.current++;

        // Batch UI updates
        if (stepsRef.current % 50 === 0) {
            setSteps(stepsRef.current);
            setFilledCount(filledCountRef.current);
        }
        draw();
    }, [draw]);

    // ── Start / Pause ──────────────────────────────────────────────
    const toggleRunning = useCallback(() => {
        if (running) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            setRunning(false);
            // Flush latest counts
            setSteps(stepsRef.current);
            setFilledCount(filledCountRef.current);
        } else {
            intervalRef.current = setInterval(simulationStep, timeStep);
            setRunning(true);
        }
    }, [running, timeStep, simulationStep]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    // ── Render ─────────────────────────────────────────────────────
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {/* Controls Panel */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                    gap: "1rem",
                    background: "white",
                    padding: "1.25rem",
                    borderRadius: "var(--radius-md)",
                    boxShadow: "var(--shadow-soft)",
                }}
            >
                <ControlInput label="Width (n)" value={n} onChange={setN} type="number" min={2} max={100} />
                <ControlInput label="Height (m)" value={m} onChange={setM} type="number" min={2} max={100} />
                <ControlInput label="Initial Filled" value={filled} onChange={setFilled} type="number" min={0} max={n * m} />
                <ControlInput label="Time Step (ms)" value={timeStep} onChange={setTimeStep} type="number" min={1} max={1000} />
                <ControlInput label="Chem. Pot. (μ)" value={chemPot} onChange={setChemPot} type="number" />
                <ControlInput label="Interact. (ε)" value={epsilon} onChange={setEpsilon} type="number" />
                <ControlInput label="Temperature" value={temperature} onChange={setTemperature} type="number" min={1} />
                <ControlInput label="Filled Color" value={filledColor} onChange={setFilledColor} type="color" />
                <ControlInput label="Empty Color" value={emptyColor} onChange={setEmptyColor} type="color" />
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <button className="card-button primary" style={{ width: "auto", padding: "10px 24px" }} onClick={regenerate}>
                    🔄 Regenerate
                </button>
                <button className="card-button primary" style={{ width: "auto", padding: "10px 24px", background: running ? "#dc2626" : "var(--color-amber)" }} onClick={toggleRunning}>
                    {running ? "⏸ Pause" : "▶ Start"}
                </button>
            </div>

            {/* Canvas (Polaroid style) */}
            <div className="polaroid">
                <div style={{ aspectRatio: "1", width: "100%", position: "relative", overflow: "hidden", background: "#f5f3ef", borderRadius: "2px" }}>
                    <canvas
                        ref={canvasRef}
                        style={{ width: "100%", height: "100%", cursor: "crosshair" }}
                        onClick={handleCanvasClick}
                    />
                </div>
                <div className="polaroid-caption">
                    Filled: <strong>{filledCount}</strong> / {n * m} · Steps: <strong>{steps}</strong> · T = {temperature}K · μ = {chemPot}
                </div>
            </div>
        </div>
    );
}

// ─── Tiny reusable input ─────────────────────────────────────────
function ControlInput({ label, value, onChange, type = "number", ...props }) {
    return (
        <label
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "var(--color-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
            }}
        >
            {label}
            <input
                type={type}
                value={value}
                onChange={(e) =>
                    onChange(type === "number" ? Number(e.target.value) : e.target.value)
                }
                style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.85rem",
                    padding: type === "color" ? "2px" : "6px 8px",
                    border: "1px solid var(--color-pencil)",
                    borderRadius: "6px",
                    background: "var(--color-cream)",
                    color: "var(--color-charcoal)",
                    height: type === "color" ? "36px" : "auto",
                    cursor: type === "color" ? "pointer" : "text",
                }}
                {...props}
            />
        </label>
    );
}
