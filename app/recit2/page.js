import GrandCanonicalSimulation from "./Simulation";
import CodeBlock from "./CodeBlock";

export const metadata = {
    title: "Week 2: Grand Canonical MC — MAT206",
    description:
        "Build an open-system Monte Carlo simulation using the Grand Canonical Ensemble to model gas-liquid phase transitions.",
};

export default function Recit2Page() {
    return (
        <div className="reading-column" style={{ padding: "3rem 1.5rem 4rem" }}>
            {/* Title Block */}
            <div className="journal-title-block">
                <span className="assignment-label">Assignment 02</span>
                <h1>
                    Grand Canonical
                    <br />
                    Monte Carlo Simulation
                </h1>
                <p className="tagline">
                    An open system exchanging particles with a reservoir.
                </p>
            </div>

            {/* Context */}
            <div className="context-callout">
                <h3>Context</h3>
                <p>
                    This simulation models a region near the triple point in a P-T phase
                    diagram using the <strong>Grand Canonical Ensemble</strong>. Unlike the
                    canonical (NVT) ensemble from Week 1 where particle count is fixed,
                    the grand canonical ensemble allows the system to exchange particles
                    with an external reservoir. The flow of particles is governed by the{" "}
                    <strong>chemical potential (μ)</strong>, which acts as the
                    thermodynamic &ldquo;pressure dial&rdquo; of the reservoir.
                </p>
            </div>

            <div className="wavy-divider" />

            {/* Step 01 — System & Parameters */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">01</span>
                    <h2>System Representation &amp; Parameters</h2>
                </div>
                <div className="step-content">
                    <p>
                        The physical system is again a 2D grid. Each cell is either{" "}
                        <strong>filled</strong> (atom present, s = 1) or{" "}
                        <strong>empty</strong> (vacancy, s = 0). However, this time the
                        system is <em>open</em> — atoms can appear or disappear at any
                        cell, representing exchange with a particle reservoir.
                    </p>
                    <p style={{ marginTop: "1rem" }}>
                        The key parameters are:
                    </p>
                    <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem", color: "var(--color-secondary)", lineHeight: 1.8, fontSize: "0.95rem" }}>
                        <li>
                            <strong>Chemical Potential (μ)</strong> — Controls particle
                            flow. High μ pumps atoms in (high pressure → liquid).
                            Low/negative μ sucks atoms out (low pressure → gas).
                        </li>
                        <li>
                            <strong>Interaction Energy (ε)</strong> — The bond strength
                            between nearest-neighbor filled cells. Negative values mean
                            attractive bonds.
                        </li>
                        <li>
                            <strong>Temperature (T)</strong> — Scales the statistical
                            weight of state changes. (k_B = 1).
                        </li>
                    </ul>
                </div>
            </section>

            <div className="wavy-divider" />

            {/* Step 02 — Grand Potential */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">02</span>
                    <h2>The Grand Potential</h2>
                </div>
                <div className="step-content">
                    <p>
                        In the grand canonical ensemble, the relevant thermodynamic
                        potential is the <strong>grand potential (Ω)</strong>. For a single
                        cell with state <code>s</code> (0 or 1), it is:
                    </p>
                    <div style={{ display: "flex", justifyContent: "center", margin: "1.5rem 0" }}>
                        <span className="equation-pill">
                            Ω = n_f · ε · s − μ · s
                        </span>
                    </div>
                    <p>
                        Where <code>n_f</code> is the number of filled nearest neighbors
                        (up, down, left, right — max 4), <code>ε</code> is the interaction
                        energy, <code>s</code> is the cell state, and <code>μ</code> is
                        the chemical potential.
                    </p>
                    <p style={{ marginTop: "1rem" }}>
                        Notice that when a cell is empty (s = 0), Ω = 0 regardless of
                        neighbors. The grand potential only contributes when a cell is
                        occupied, coupling both the local bonding environment and the
                        reservoir pressure.
                    </p>
                </div>
            </section>

            <div className="wavy-divider" />

            {/* Step 03 — The Monte Carlo Step */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">03</span>
                    <h2>The Monte Carlo Step</h2>
                </div>
                <div className="step-content">
                    <p>
                        Unlike Week 1 where we pick <em>two</em> cells and attempt a swap,
                        here we pick <strong>one random cell</strong> and propose to{" "}
                        <em>toggle</em> its state (fill → empty or empty → fill).
                    </p>
                    <p style={{ marginTop: "1rem" }}>
                        <strong>The algorithm for each step:</strong>
                    </p>
                    <ol style={{ marginTop: "0.5rem", paddingLeft: "1.5rem", color: "var(--color-secondary)", lineHeight: 2, fontSize: "0.95rem" }}>
                        <li>Pick a random cell at position (r, c).</li>
                        <li>Count its filled neighbors n_f.</li>
                        <li>Calculate Ω_current for the cell&apos;s present state.</li>
                        <li>Calculate Ω_proposed for the toggled state.</li>
                        <li>Compute the weight: <code>q = exp((Ω_current − Ω_proposed) / T)</code></li>
                        <li>Compute the probability: <code>p = q / (1 + q)</code></li>
                        <li>Draw a random number. If ≤ p, toggle the cell.</li>
                    </ol>
                </div>
            </section>

            <div className="wavy-divider" />

            {/* Step 04 — Phase Transitions */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">04</span>
                    <h2>Phase Transitions: Gas ↔ Liquid</h2>
                </div>
                <div className="step-content">
                    <p>
                        The chemical potential μ acts as the &ldquo;pressure knob&rdquo; of the
                        reservoir. By tuning μ, you can drive macroscopic phase
                        transitions:
                    </p>
                    <ul style={{ marginTop: "0.75rem", paddingLeft: "1.5rem", color: "var(--color-secondary)", lineHeight: 1.8, fontSize: "0.95rem" }}>
                        <li>
                            <strong>High μ (positive)</strong> — Reservoir pushes atoms
                            into the system. The grid fills up → <strong>liquid phase</strong>.
                        </li>
                        <li>
                            <strong>Low μ (very negative)</strong> — Reservoir pulls atoms
                            out. The grid empties → <strong>gas phase</strong>.
                        </li>
                        <li>
                            <strong>Critical μ</strong> — At the right balance between μ,
                            ε, and T, both phases coexist. You can observe droplets
                            nucleating and dissolving — the system fluctuates between gas
                            and liquid.
                        </li>
                    </ul>
                    <p style={{ marginTop: "1rem" }}>
                        A <strong>completely empty grid = gas phase</strong> and a{" "}
                        <strong>completely filled grid = liquid phase</strong>. The
                        simulation maps to a region around the triple point in a P-T
                        diagram.
                    </p>
                </div>
            </section>

            <div className="wavy-divider" />

            {/* Step 05 — Scientific Observations */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">05</span>
                    <h2>Scientific Observations</h2>
                </div>
                <div className="step-content">
                    <p>
                        <strong>Nucleation &amp; Growth:</strong> When μ is near the
                        critical value, you&apos;ll see small clusters (nuclei) form and
                        dissolve. Occasionally, a nucleus grows large enough to become
                        thermodynamically stable and triggers a full phase transition —
                        this is <em>nucleation</em>.
                    </p>
                    <p style={{ marginTop: "1rem" }}>
                        <strong>Hysteresis:</strong> Slowly ramping μ up and then back
                        down, you may notice the system doesn&apos;t reverse at the same
                        μ value. This asymmetry is a signature of a first-order phase
                        transition — the system must overcome an energy barrier to
                        nucleate.
                    </p>
                    <p style={{ marginTop: "1rem" }}>
                        <strong>Surface Tension:</strong> At low temperature with a large
                        droplet, the interface between filled and empty regions is sharp
                        and roughly circular — minimizing surface area. This is surface
                        tension in action, arising naturally from the ε interaction.
                    </p>
                </div>
            </section>

            <div className="wavy-divider" />

            {/* Interactive Sandbox */}
            <section className="step-block">
                <div className="step-header">
                    <h2 style={{ fontFamily: "var(--font-serif)" }}>
                        Interactive Sandbox
                    </h2>
                </div>
                <GrandCanonicalSimulation />
            </section>

            <div className="wavy-divider" />

            {/* Exploration Questions */}
            <section>
                <h2 className="explore-section-title">🔬 Exploration Questions</h2>
                <p className="explore-subtitle">
                    Use the interactive sandbox above to investigate these questions.
                    Adjust the parameters, observe, and reason about the physics.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                    {/* Q1 */}
                    <div className="question-card">
                        <span className="q-badge">Question 1</span>
                        <p className="q-text">
                            What happens when you increase the chemical potential (μ) from very negative to very positive?
                        </p>
                        <div className="q-answer">
                            <p>
                                <strong>Very negative μ</strong> (e.g. −300): The reservoir strongly favors removing atoms. Even filled cells with many neighbors tend to empty out. The grid rapidly approaches a <strong>gas phase</strong> — nearly completely empty.
                            </p>
                            <p style={{ marginTop: "0.75rem" }}>
                                <strong>Very positive μ</strong> (e.g. +100): The reservoir pushes atoms into every available cell. Empty cells are quickly filled. The grid converges to a <strong>liquid phase</strong> — nearly completely full.
                            </p>
                            <p style={{ marginTop: "0.75rem" }}>
                                At intermediate μ values (near the critical point), you&apos;ll see dynamic coexistence — droplets forming, dissolving, and reforming.
                            </p>
                        </div>
                        <div className="q-tip">Try μ = −300, then μ = +100, then μ = −100 at T = 100, ε = −50. Watch the phase transitions.</div>
                    </div>

                    {/* Q2 */}
                    <div className="question-card">
                        <span className="q-badge">Question 2</span>
                        <p className="q-text">
                            How does the interaction energy (ε) affect the sharpness of the phase transition?
                        </p>
                        <div className="q-answer">
                            <p>
                                <strong>Strongly negative ε</strong> (e.g. −100): Bonds between neighbors are very strong. Clusters have sharp, well-defined boundaries. The transition between gas and liquid is abrupt and happens over a narrow range of μ — a hallmark of a <strong>first-order phase transition</strong>.
                            </p>
                            <p style={{ marginTop: "0.75rem" }}>
                                <strong>Weakly negative ε</strong> (e.g. −10): Bonds are weak, so the distinction between phases is blurred. The transition is gradual, and you may see a smooth crossover instead of a sharp jump. At very small |ε|/T, the system behaves almost independently per cell.
                            </p>
                        </div>
                        <div className="q-tip">Compare ε = −100 vs ε = −10 at the same T and μ. Notice the cluster edges.</div>
                    </div>

                    {/* Q3 */}
                    <div className="question-card">
                        <span className="q-badge">Question 3</span>
                        <p className="q-text">
                            Start with an empty grid and slowly increase μ. Then slowly decrease it back. Do you see the same transition point?
                        </p>
                        <div className="q-answer">
                            <p>
                                <strong>No — this is hysteresis.</strong> When increasing μ, the system may remain in the gas phase past the equilibrium transition point because forming the first nucleus (a small stable cluster) requires overcoming an energy barrier. Once a large enough nucleus forms, the system rapidly fills.
                            </p>
                            <p style={{ marginTop: "0.75rem" }}>
                                Going back, the filled (liquid) state persists to lower μ values before the system empties again. The forward and backward transition points differ — this is a signature of a <strong>first-order phase transition</strong> with <strong>metastable states</strong>.
                            </p>
                        </div>
                        <div className="q-tip">Try this with ε = −50, T = 50. Slowly ramp μ from −200 to 0 and back.</div>
                    </div>

                    {/* Q4 */}
                    <div className="question-card">
                        <span className="q-badge">Question 4</span>
                        <p className="q-text">
                            How does this Grand Canonical simulation differ from the Week 1 Canonical simulation?
                        </p>
                        <div className="q-answer">
                            <p>
                                <strong>Canonical (Week 1):</strong> The system has a fixed number of particles. Two cells are picked and potentially swapped. The total filled count never changes. This models a closed system — useful for studying diffusion and equilibrium at constant composition.
                            </p>
                            <p style={{ marginTop: "0.75rem" }}>
                                <strong>Grand Canonical (Week 2):</strong> The system exchanges particles with a reservoir. One cell is picked and potentially toggled. The filled count fluctuates. This models an open system — ideal for studying phase transitions (gas ↔ liquid) controlled by external pressure (μ).
                            </p>
                        </div>
                        <div className="q-tip">Run both simulations side by side (open recit1 in another tab) to compare their behavior.</div>
                    </div>

                    {/* Q5 */}
                    <div className="question-card">
                        <span className="q-badge">Question 5</span>
                        <p className="q-text">
                            At low temperature with a stable droplet, observe the interface. What do you notice about its shape?
                        </p>
                        <div className="q-answer">
                            <p>
                                At low T, the droplet develops a <strong>roughly circular interface</strong>. This is <strong>surface tension</strong> in action — the system minimizes the interface length (perimeter) because every exposed surface atom has fewer neighbors, which costs energy. A circle minimizes perimeter for a given area.
                            </p>
                            <p style={{ marginTop: "0.75rem" }}>
                                At high T, the interface becomes rough and fractal-like because thermal fluctuations are strong enough to overcome the energy cost of creating extra surface. This is the <strong>roughening transition</strong>.
                            </p>
                        </div>
                        <div className="q-tip">Set T = 20, ε = −50, μ = −100, fill half the grid, and watch the droplet shape evolve.</div>
                    </div>

                </div>
            </section>

            <div className="wavy-divider" />

            {/* Code Explanation - Part 1: State & Grid */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">06</span>
                    <h2>Under the Hood: State &amp; Grid Initialization</h2>
                </div>
                <div className="step-content">
                    <p>
                        The simulation starts by creating a grid and managing state
                        with React hooks. The new parameters — chemical potential (μ)
                        and interaction energy (ε) — replace the single A-A energy
                        from Week 1:
                    </p>
                    <CodeBlock code={`// ─── Default parameter values ────────────────────────
const DEFAULTS = {
    n: 50,
    m: 50,
    filled: 0,
    timeStep: 1,
    chemicalPotential: -100,
    interactionEnergy: -50,
    temperature: 100,
};

// ─── Grid creation ───────────────────────────────────
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
}`} />
                </div>
            </section>

            <div className="wavy-divider" />

            {/* Code Explanation - Part 2: Grand Canonical Step */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">07</span>
                    <h2>Under the Hood: The Grand Canonical Step</h2>
                </div>
                <div className="step-content">
                    <p>
                        The core difference from Week 1: we pick <strong>one cell</strong>{" "}
                        and compute the grand potential for both its current state and the
                        toggled state. The weight q and probability p determine whether to
                        accept the toggle:
                    </p>
                    <CodeBlock code={`const simulationStep = useCallback(() => {
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

    // 4. Grand potential: Ω = n_f · ε · s − μ · s
    const omega_current  = n_f * eps * s     - mu * s;
    const omega_proposed = n_f * eps * (1-s) - mu * (1-s);

    // 5. Weight: q = exp((Ω_current − Ω_proposed) / T)
    const q = Math.exp((omega_current - omega_proposed) / T);

    // 6. Probability: p = q / (1 + q)
    const p = q / (1 + q);

    // 7. Accept or reject the toggle
    if (Math.random() <= p) {
        grid[r][c] = 1 - s;
        // Update filled count tracking
    }
}, [draw]);`} />
                    <p style={{ marginTop: "1rem" }}>
                        <em>Key insight:</em> When a cell is empty (s = 0), Ω_current = 0.
                        The proposed filled state gives Ω = n_f · ε − μ. If μ is large
                        and positive, Ω_proposed is very negative (favorable), so the
                        cell is very likely to fill — atoms flow in from the reservoir.
                    </p>
                </div>
            </section>

            <div className="wavy-divider" />

            {/* Code Explanation - Part 3: Neighbor Counting */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">08</span>
                    <h2>Under the Hood: Neighbor Counting</h2>
                </div>
                <div className="step-content">
                    <p>
                        The energy calculation depends on counting filled nearest
                        neighbors. We use strict boundary conditions (walls) — cells at
                        the grid edge simply have fewer neighbors:
                    </p>
                    <CodeBlock code={`function countFilledNeighbors(grid, r, c, rows, cols) {
    let count = 0;
    if (r > 0     && grid[r - 1][c] === 1) count++;
    if (r < rows - 1 && grid[r + 1][c] === 1) count++;
    if (c > 0     && grid[r][c - 1] === 1) count++;
    if (c < cols - 1 && grid[r][c + 1] === 1) count++;
    return count;
}`} />
                    <p style={{ marginTop: "1rem" }}>
                        <em>Note:</em> Unlike Week 1, there is no adjacency correction
                        needed here. We toggle a single cell rather than swapping two, so
                        we simply count the neighbors as they are.
                    </p>
                </div>
            </section>

        </div>
    );
}
