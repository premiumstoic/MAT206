import MonteCarloSimulation from "./Simulation";
import CodeBlock from "./CodeBlock";

export const metadata = {
    title: "Week 1: Monte Carlo Simulation — MAT206",
    description:
        "Build a 2D Monte Carlo simulation to model atomic diffusion and phase changes based on the Boltzmann distribution.",
};

export default function Recit1Page() {
    return (
        <div className="reading-column" style={{ padding: "3rem 1.5rem 4rem" }}>
            {/* Title Block */}
            <div className="journal-title-block">
                <span className="assignment-label">Assignment 01</span>
                <h1>
                    Monte Carlo Simulation
                </h1>
                <p className="tagline">
                    Navigating the energy landscape of atomic diffusion.
                </p>
            </div>

            {/* Context */}
            <div className="context-callout">
                <h3>Context</h3>
                <p>
                    This assignment explores the fundamentals of statistical mechanics by
                    modeling atomic diffusion and phase transitions on a 2D grid. Using a
                    Monte Carlo approach, we can observe how macroscopic phenomena, such as
                    melting and freezing, emerge from simple probabilistic rules governing
                    individual atoms at the microscopic level.
                </p>
            </div>

            <div className="wavy-divider" />

            {/* Step 1 */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">01</span>
                    <h2>System Representation</h2>
                </div>
                <div className="step-content">
                    <p>
                        The physical system is represented as a 2D grid where each cell can
                        either be occupied by an atom (filled) or empty. The overall grid
                        dimensions and the initial density of atoms define the starting state
                        of our material.
                    </p>
                </div>
            </section>

            <div className="wavy-divider" />

            {/* Step 2 */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">02</span>
                    <h2>The Simulation Loop</h2>
                </div>
                <div className="step-content">
                    <p>
                        The simulation progresses through discrete time steps. At each tick,
                        the algorithm randomly selects two cells. If both cells are identical
                        (e.g., both filled or both empty), no action is taken. However, if one
                        is occupied and the other is empty, they become a candidate pair for
                        atomic movement (a &ldquo;swap&rdquo;).
                    </p>
                </div>
            </section>

            <div className="wavy-divider" />

            {/* Step 3 */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">03</span>
                    <h2>Thermodynamics &amp; Energy</h2>
                </div>
                <div className="step-content">
                    <p>
                        The physical behavior is dictated by the <code>A-A Interaction Energy</code>,
                        which defines the attractive force between neighboring atoms. For each
                        candidate swap, we calculate two values:
                        <strong> E1</strong> (the current energy based on existing neighbors) and
                        <strong> E2</strong> (the theoretical energy if the atom were to move to the
                        empty cell).
                    </p>
                </div>
            </section>

            <div className="wavy-divider" />

            {/* Step 4 */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">04</span>
                    <h2>The Monte Carlo Step</h2>
                </div>
                <div className="step-content">
                    <p>
                        The decision to swap is governed by the Boltzmann distribution. Using
                        the energy difference and the system&rsquo;s Temperature (T), we calculate a probability:
                    </p>
                    <div style={{ display: "flex", justifyContent: "center", margin: "1.5rem 0" }}>
                        <span className="equation-pill">
                            q = exp((E1 − E2) / T) &nbsp;&nbsp;·&nbsp;&nbsp; p = q / (1 + q)
                        </span>
                    </div>
                    <p>
                        A random number between 0 and 1 is generated. If it is less than or equal to
                        <code>p</code>, the swap is executed, representing an atom successfully diffusing
                        to a new position.
                    </p>
                </div>
            </section>

            <div className="wavy-divider" />

            {/* Step 5: Scientific Notes */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">05</span>
                    <h2>Scientific Observations</h2>
                </div>
                <div className="step-content">
                    <p>
                        <strong>Melting &amp; Freezing:</strong> At low temperatures, the
                        Boltzmann probability strongly favors energy-lowering swaps, causing
                        atoms to cluster together (condensation/freezing). At high
                        temperatures, randomness dominates and atoms mix freely
                        (boiling/melting).
                    </p>
                    <p style={{ marginTop: "1rem" }}>
                        <strong>Thermodynamic Equilibrium:</strong> Over many steps the
                        system reaches a dynamic balance where the rate of clustering equals
                        the rate of dispersal. The macroscopic state appears stable even
                        though individual atoms continue to move.
                    </p>
                    <p
                        style={{
                            marginTop: "1rem",
                            color: "var(--color-cyan)",
                            fontWeight: 600,
                        }}
                    >
                        &ldquo;In the equation we did not add an entropy term, but the
                        simulation reaches equilibrium. Where is the entropy?&rdquo;
                    </p>
                    <p style={{ marginTop: "0.5rem" }}>
                        The entropy is implicitly provided by the <em>random number
                            generator</em>. Each random trial represents a microstate
                        exploration. Temperature scales the probability threshold,
                        effectively controlling how many high-energy microstates become
                        accessible — which is exactly what entropy quantifies
                        statistically.
                    </p>
                </div>
            </section>

            <div className="wavy-divider" />

            {/* Interactive Simulation */}
            <section className="step-block">
                <div className="step-header">
                    <h2 style={{ fontFamily: "var(--font-serif)" }}>
                        Interactive Sandbox
                    </h2>
                </div>
                <MonteCarloSimulation />
            </section>

            <div className="wavy-divider" />

            {/* Code Explanation - Part 1 */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">06</span>
                    <h2>Under the Hood: Grid &amp; State Initialization</h2>
                </div>
                <div className="step-content">
                    <p>
                        The interactive simulation above is powered by a React component that manages the grid state and executes the Monte Carlo loop at a configurable time step. The grid itself is generated efficiently:
                    </p>
                    <CodeBlock code={`function createGrid(n, m, filledCount) {
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
}`} />
                    <p style={{ marginTop: "1rem" }}>
                        This <code>createGrid</code> helper takes the desired dimensions (<code>n &times; m</code>) and the target number of initially filled cells. It loops until precisely the requested number of molecules have been randomly scattered, leaving the rest of the cells at <code>0</code>.
                    </p>
                </div>
            </section>

            <div className="wavy-divider" />

            {/* Code Explanation - Part 2 */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">07</span>
                    <h2>Under the Hood: The Simulation Loop</h2>
                </div>
                <div className="step-content">
                    <p>
                        Once initialized, a timer repeatedly invokes a <code>simulationStep</code> function. In each tick, we pick two random coordinates:
                    </p>
                    <CodeBlock code={`// Pick two random cells
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
}`} />
                    <p style={{ marginTop: "1rem" }}>
                        We must evaluate a potential <strong>swap</strong> between one filled cell (a molecule) and one empty cell (a vacancy). If both spots are the same type, moving something makes no difference, so we skip the step to save computation.
                    </p>
                </div>
            </section>

            <div className="wavy-divider" />

            {/* Code Explanation - Part 3 */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">08</span>
                    <h2>Under the Hood: Energy Computation</h2>
                </div>
                <div className="step-content">
                    <p>
                        We calculate the thermodynamic energy of the system for both the current configuration (<code>E1</code>) and the theoretical new configuration (<code>E2</code>).
                        To determine this, we measure how many filled neighbors surround the cells in question:
                    </p>
                    <CodeBlock code={`function countFilledNeighbors(grid, r, c, m, n) {
    let count = 0;
    if (r > 0 && grid[r - 1][c] === 1) count++;
    if (r < m - 1 && grid[r + 1][c] === 1) count++;
    if (c > 0 && grid[r][c - 1] === 1) count++;
    if (c < n - 1 && grid[r][c + 1] === 1) count++;
    return count;
}`} />
                    <p>
                        With the <code>countFilledNeighbors</code> function in hand, we derive the exact system energies involved in the transaction using the A-A Interaction Energy coefficient (<code>E</code>):
                    </p>
                    <CodeBlock code={`// E1: current energy of filled cell at its position
const E1 = countFilledNeighbors(grid, filledR, filledC, rows, cols) * E;

// E2: theoretical energy if the filled cell moved to the empty position
let neighborsAtEmpty = countFilledNeighbors(grid, emptyR, emptyC, rows, cols);

// Correct the count if the empty cell was adjacent to the filled one!
if (Math.abs(filledR - emptyR) + Math.abs(filledC - emptyC) === 1) {
    neighborsAtEmpty--;
}
const E2 = neighborsAtEmpty * E;`} />
                    <p style={{ marginTop: "1rem" }}>
                        <em>Note:</em> The simulation intentionally adjusts the <code>E2</code> count down by 1 if the target swap is adjacent to the original cell, as it should no longer count its former self as an attracting neighbor once it leaves!
                    </p>
                </div>
            </section>

            <div className="wavy-divider" />

            {/* Code Explanation - Full Source */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">09</span>
                    <h2>Complete Source Code</h2>
                </div>
                <div className="step-content">
                    <p>
                        For completeness, here is the entirely self-contained <code>Simulation.js</code> React component powering the Monte Carlo sandbox you interacted with above. You are welcome to study it or use it as a foundation for your own explorations.
                    </p>
                    <CodeBlock maxHeight="600px" code={`"use client";

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
    const paramsRef = useRef({
        n, m, aaEnergy, temperature, filledColor, emptyColor
    });

    // Keep params ref in sync
    useEffect(() => {
        paramsRef.current = {
            n, m, aaEnergy, temperature, filledColor, emptyColor
        };
    }, [n, m, aaEnergy, temperature, filledColor, emptyColor]);

    // ── Drawing ────────────────────────────────────────────────────
    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const grid = gridRef.current;
        if (!canvas || !grid) return;

        const ctx = canvas.getContext("2d");
        const { n: cols, m: rows } = {
            n: grid[0].length, m: grid.length
        };
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
        setSteps(0);

        const grid = createGrid(n, m, filled);
        gridRef.current = grid;
        setFilledCount(filled);

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
    }, []);

    // Redraw when colors change
    useEffect(() => {
        draw();
    }, [filledColor, emptyColor, draw]);

    // ── Canvas click → toggle cell ─────────────────────────────────
    const handleCanvasClick = useCallback((e) => {
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
            setFilledCount((prev) =>
                prev + (grid[r][c] === 1 ? 1 : -1)
            );
            draw();
        }
    }, [draw]);

    // ── Simulation step (Monte Carlo swap) ─────────────────────────
    const simulationStep = useCallback(() => {
        const grid = gridRef.current;
        if (!grid) return;

        const { aaEnergy: E, temperature: T } = paramsRef.current;
        const rows = grid.length;
        const cols = grid[0].length;

        const r1 = Math.floor(Math.random() * rows);
        const c1 = Math.floor(Math.random() * cols);
        const r2 = Math.floor(Math.random() * rows);
        const c2 = Math.floor(Math.random() * cols);

        if (grid[r1][c1] === grid[r2][c2]) return;

        let filledR, filledC, emptyR, emptyC;
        if (grid[r1][c1] === 1) {
            filledR = r1; filledC = c1;
            emptyR = r2; emptyC = c2;
        } else {
            filledR = r2; filledC = c2;
            emptyR = r1; emptyC = c1;
        }

        const E1 = countFilledNeighbors(
            grid, filledR, filledC, rows, cols
        ) * E;

        let neighborsAtEmpty = countFilledNeighbors(
            grid, emptyR, emptyC, rows, cols
        );
        if (
            Math.abs(filledR - emptyR) +
            Math.abs(filledC - emptyC) === 1
        ) {
            neighborsAtEmpty--;
        }
        const E2 = neighborsAtEmpty * E;

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
            intervalRef.current = setInterval(
                simulationStep, timeStep
            );
            setRunning(true);
        }
    }, [running, timeStep, simulationStep]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (intervalRef.current)
                clearInterval(intervalRef.current);
        };
    }, []);

    // ── Render (JSX omitted for brevity) ──────────────────────────
    return ( /* ... controls, canvas, buttons ... */ );
}`} />
                </div>
            </section>
        </div>
    );
}
