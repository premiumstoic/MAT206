"use client";

import { useRef, useState, useEffect, useCallback } from "react";

// ─── Default parameter values ────────────────────────────────────
const DEFAULTS = {
    n: 30,
    m: 30,
    filled: 150,
    timeStep: 10,
    aaEnergy: -50,
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

function countFilledNeighbors(grid, r, c, m, n) {
    let count = 0;
    if (r > 0 && grid[r - 1][c] === 1) count++;
    if (r < m - 1 && grid[r + 1][c] === 1) count++;
    if (c > 0 && grid[r][c - 1] === 1) count++;
    if (c < n - 1 && grid[r][c + 1] === 1) count++;
    return count;
}

// ─── Main component ─────────────────────────────────────────────
export default function MonteCarloSimulation() {
    // State
    const [n, setN] = useState(DEFAULTS.n);
    const [m, setM] = useState(DEFAULTS.m);
    const [filled, setFilled] = useState(DEFAULTS.filled);
    const [timeStep, setTimeStep] = useState(DEFAULTS.timeStep);
    const [aaEnergy, setAaEnergy] = useState(DEFAULTS.aaEnergy);
    const [temperature, setTemperature] = useState(DEFAULTS.temperature);
    const [filledColor, setFilledColor] = useState("#EBA352");
    const [emptyColor, setEmptyColor] = useState("#FDFBF7");

    const [running, setRunning] = useState(false);
    const [filledCount, setFilledCount] = useState(0);
    const [steps, setSteps] = useState(0);

    // Refs
    const canvasRef = useRef(null);
    const gridRef = useRef(null);
    const intervalRef = useRef(null);
    const paramsRef = useRef({ n, m, aaEnergy, temperature, filledColor, emptyColor });

    // Keep params ref in sync
    useEffect(() => {
        paramsRef.current = { n, m, aaEnergy, temperature, filledColor, emptyColor };
    }, [n, m, aaEnergy, temperature, filledColor, emptyColor]);

    // ── Drawing ────────────────────────────────────────────────────
    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const grid = gridRef.current;
        if (!canvas || !grid) return;

        const ctx = canvas.getContext("2d");
        const { n: cols, m: rows } = { n: grid[0].length, m: grid.length };
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
        // Stop any running sim
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setRunning(false);
        setSteps(0);

        const grid = createGrid(n, m, filled);
        gridRef.current = grid;
        setFilledCount(filled);

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
                grid[r][c] = grid[r][c] === 1 ? 0 : 1;
                setFilledCount((prev) => prev + (grid[r][c] === 1 ? 1 : -1));
                draw();
            }
        },
        [draw]
    );

    // ── Simulation step (Monte Carlo swap) ─────────────────────────
    const simulationStep = useCallback(() => {
        const grid = gridRef.current;
        if (!grid) return;

        const { aaEnergy: E, temperature: T } = paramsRef.current;
        const rows = grid.length;
        const cols = grid[0].length;

        // Pick two random cells
        const r1 = Math.floor(Math.random() * rows);
        const c1 = Math.floor(Math.random() * cols);
        const r2 = Math.floor(Math.random() * rows);
        const c2 = Math.floor(Math.random() * cols);

        // Skip if same type
        if (grid[r1][c1] === grid[r2][c2]) return;

        // Identify which is filled and which is empty
        let filledR, filledC, emptyR, emptyC;
        if (grid[r1][c1] === 1) {
            filledR = r1; filledC = c1; emptyR = r2; emptyC = c2;
        } else {
            filledR = r2; filledC = c2; emptyR = r1; emptyC = c1;
        }

        // E1: current energy of filled cell at its position
        const E1 = countFilledNeighbors(grid, filledR, filledC, rows, cols) * E;

        // E2: theoretical energy if the filled cell moved to the empty position
        // We need to count filled neighbors around the empty cell, but not counting
        // the filled cell itself (if adjacent)
        let neighborsAtEmpty = countFilledNeighbors(grid, emptyR, emptyC, rows, cols);
        // If the filled cell is a neighbor of the empty cell, subtract 1
        if (Math.abs(filledR - emptyR) + Math.abs(filledC - emptyC) === 1) {
            neighborsAtEmpty--;
        }
        const E2 = neighborsAtEmpty * E;

        // Boltzmann probability
        const q = Math.exp((E1 - E2) / T);
        const p = q / (1 + q);

        if (Math.random() <= p) {
            grid[filledR][filledC] = 0;
            grid[emptyR][emptyC] = 1;
        }

        setSteps((prev) => prev + 1);
        draw();
    }, [draw]);

    // ── Start / Pause ──────────────────────────────────────────────
    const toggleRunning = useCallback(() => {
        if (running) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            setRunning(false);
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
                <ControlInput label="A-A Energy" value={aaEnergy} onChange={setAaEnergy} type="number" />
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
                    Filled Cells: <strong>{filledCount}</strong> · Steps: <strong>{steps}</strong> · T = {temperature}K
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
