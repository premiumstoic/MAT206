import BinaryPhaseSimulation from "./Simulation";
import CodeBlock from "./CodeBlock";

export const metadata = {
    title: "Week 3: Binary Phase Transformation — MAT206",
    description:
        "Simulate a binary (A/B) mixture on a 2D lattice using Monte Carlo Glauber dynamics, exploring phase separation, coordination flips, and kinetic rate-limiting steps.",
};

export default function Recit3Page() {
    return (
        <div className="reading-column" style={{ padding: "3rem 1.5rem 4rem" }}>

            {/* Title */}
            <div className="journal-title-block">
                <span className="assignment-label">Assignment 03</span>
                <h1>
                    2D Binary Phase
                    <br />
                    Transformation
                </h1>
                <p className="tagline">
                    Two elements, two crystal structures, one thermodynamic competition.
                </p>
            </div>

            {/* Context */}
            <div className="context-callout">
                <h3>Context</h3>
                <p>
                    This simulation models how a mixture of two atomic species (A and B) and
                    vacancies evolve on a 2D lattice. Unlike Weeks 1–2 which dealt with a single
                    species, now the system must balance <strong>phase separation</strong> (AA and
                    BB clusters forming, AB mixing penalized) with <strong>crystal structure
                        competition</strong> (4-coordination vs 8-coordination). Two distinct kinetic
                    mechanisms — <strong>diffusion</strong> and <strong>coordination flips</strong>{" "}
                    — drive the system toward its ground state.
                </p>
            </div>

            <div className="wavy-divider" />

            {/* Step 01 — Mechanisms */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">01</span>
                    <h2>Two Kinetic Mechanisms</h2>
                </div>
                <div className="step-content">
                    <p>
                        The simulation models two distinct physical processes, each with a separate
                        probability controlled by the <strong>Diffusion / Flip slider</strong>:
                    </p>
                    <ul style={{ marginTop: "0.75rem", paddingLeft: "1.5rem", lineHeight: 1.9 }}>
                        <li>
                            <strong>Diffusion (Swap Move):</strong> An atom physically migrates to an
                            adjacent vacant lattice site. This represents <em>mass transport</em>.
                            The atom carries its type (A or B), but may adopt a new coordination for the
                            energy calculation.
                        </li>
                        <li style={{ marginTop: "0.5rem" }}>
                            <strong>Flip (Coordination Change):</strong> The atom stays physically
                            stationary but switches its crystal packing configuration between
                            4-coordination and 8-coordination. This represents a local{" "}
                            <em>structural phase transformation</em>.
                        </li>
                    </ul>
                    <p style={{ marginTop: "1rem" }}>
                        The default 80/20 setting (80% diffusion, 20% flip) simulates a{" "}
                        <strong>reaction-limited</strong> process: atoms move around easily, but the
                        structural transformation is the bottleneck — analogous to the slow oxidation
                        of iron.
                    </p>
                </div>
            </section>

            <div className="wavy-divider" />

            {/* Step 02 — Thermodynamics */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">02</span>
                    <h2>Thermodynamics &amp; Interaction Energies</h2>
                </div>
                <div className="step-content">
                    <p>
                        Evolution is driven by minimizing the system&apos;s internal energy. The local
                        energy of any atom depends on its immediate neighbors via three pairwise
                        interaction energies:
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", margin: "1.25rem 0" }}>
                        {[
                            { label: "E_AA", val: "−10", desc: "Weakly attractive" },
                            { label: "E_BB", val: "−50", desc: "Strongly attractive" },
                            { label: "E_AB", val: "+50", desc: "Highly repulsive" },
                        ].map(({ label, val, desc }) => (
                            <div key={label} style={{ background: "var(--color-card)", borderRadius: "var(--radius-sm)", padding: "0.75rem 1rem", boxShadow: "var(--shadow-soft)", textAlign: "center" }}>
                                <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.8rem", color: "var(--color-amber)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
                                <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.4rem", fontWeight: 700, color: "var(--color-charcoal)", margin: "4px 0" }}>{val}</div>
                                <div style={{ fontSize: "0.78rem", color: "var(--color-secondary)" }}>{desc}</div>
                            </div>
                        ))}
                    </div>
                    <p>
                        Because same-species interactions are <em>negative</em> (favorable) and
                        cross-species interactions are <em>positive</em> (unfavorable), the system
                        thermodynamically drives toward <strong>phase separation</strong>: A atoms
                        cluster with A, B with B, and the two species actively repel each other.
                        B clusters are more tightly bound (lower energy per bond).
                    </p>
                </div>
            </section>

            <div className="wavy-divider" />

            {/* Step 03 — Glauber Dynamics */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">03</span>
                    <h2>Glauber Dynamics</h2>
                </div>
                <div className="step-content">
                    <p>
                        Each proposed move (diffusion or flip) is accepted or rejected using{" "}
                        <strong>Glauber dynamics</strong>, which incorporates temperature as a measure
                        of thermal noise. For a proposed move with energy change ΔE:
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "center", margin: "1.5rem 0" }}>
                        <span className="equation-pill">q = exp(−ΔE / T)</span>
                        <span className="equation-pill">p = q / (1 + q)</span>
                    </div>
                    <ul style={{ paddingLeft: "1.5rem", lineHeight: 1.9 }}>
                        <li>
                            <strong>Low T:</strong> The system strictly obeys energy gradients. Only
                            energy-lowering moves occur.
                        </li>
                        <li>
                            <strong>High T:</strong> Thermal noise dominates. q → 1 and p → 0.5,
                            so moves are accepted ~50% of the time regardless of ΔE — the system
                            behaves like a random walk (maximum entropy / mixing).
                        </li>
                    </ul>
                </div>
            </section>

            <div className="wavy-divider" />

            {/* Step 04 — Crystal Coordination */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">04</span>
                    <h2>Crystal Coordination: 4 vs 8</h2>
                </div>
                <div className="step-content">
                    <p>
                        The 2D lattice serves as an analog for 3D crystal structures:
                    </p>
                    <ul style={{ marginTop: "0.75rem", paddingLeft: "1.5rem", lineHeight: 1.9 }}>
                        <li>
                            <strong>4-Coordination:</strong> The atom only interacts with neighbors
                            directly Up, Down, Left, and Right. Analogous to a simple 2D square
                            lattice or BCC-like packing.
                        </li>
                        <li>
                            <strong>8-Coordination:</strong> The atom interacts with all eight
                            directions — the four cardinal neighbors <em>plus</em> four diagonals.
                            Analogous to FCC-like close packing.
                        </li>
                        <li>
                            <strong>&ldquo;Both&rdquo; Mode:</strong> Atoms can switch between coordination
                            states via flip moves. This allows two distinct thermodynamic phases to
                            coexist in the same grid. Coordination state is shown by the outline
                            color on each cell.
                        </li>
                    </ul>
                </div>
            </section>

            <div className="wavy-divider" />

            {/* Step 05 — The Algorithm */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">05</span>
                    <h2>The Algorithm</h2>
                </div>
                <div className="step-content">
                    <p>
                        At every timestep, the simulation performs <em>N</em> parallel MC attempts.
                        For each attempt:
                    </p>
                    <ol style={{ marginTop: "0.75rem", paddingLeft: "1.5rem", lineHeight: 2 }}>
                        <li>
                            Roll a random number against the Diffusion/Flip slider to choose move
                            type. (If the coordination mode is forced to 4 or 8, all moves
                            are diffusion moves.)
                        </li>
                        <li>
                            <strong>Diffusion:</strong> Pick two random sites. One must be filled,
                            one must be empty. Calculate the atom&apos;s energy at its current site
                            (E_current) and at the proposed empty site (E_proposed) using selected
                            coordination. Apply Glauber rule — accept with probability{" "}
                            <code>p = q / (1 + q)</code>.
                        </li>
                        <li>
                            <strong>Flip:</strong> (Only if &ldquo;Both&rdquo; mode active.) Pick one random
                            filled site. Calculate its energy under current coordination and under
                            the opposite coordination. Apply Glauber rule. If accepted, update the
                            cell&apos;s coordination label.
                        </li>
                        <li>
                            Periodic boundary conditions wrap the grid edges — an atom at the right
                            edge sees the left edge as its neighbor.
                        </li>
                    </ol>
                </div>
            </section>

            <div className="wavy-divider" />

            {/* Interactive Sandbox */}
            <section className="step-block">
                <div className="step-header">
                    <h2 style={{ fontFamily: "var(--font-serif)" }}>Interactive Sandbox</h2>
                </div>
                <p className="step-content" style={{ marginBottom: "1.5rem" }}>
                    Click any cell to cycle it: <strong>A → B → Empty → A</strong>. Use the
                    coordination dropdown and Diffusion/Flip slider to explore different kinetic
                    regimes. The dashboard below the grid tracks coordination state in real time.
                </p>
                <BinaryPhaseSimulation />
            </section>

            <div className="wavy-divider" />

            {/* Exploration Questions */}
            <section>
                <h2 className="explore-section-title">🔬 Exploration Questions</h2>
                <p className="explore-subtitle">
                    Each question targets a distinct physical phenomenon. Adjust the controls in the sandbox above
                    and document what you observe.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                    <div className="question-card">
                        <span className="q-badge">Question 1 — Baseline</span>
                        <p className="q-text">Set the simulation to a single element (set B count to 0) and force 4-coordination. What do you observe, and how does it compare to Week 1?</p>
                        <div className="q-answer">
                            <p>With only A atoms and 4-coordination, the system reduces exactly to the Week 1 Canonical MC simulation. Because E_AA = −10 (attractive), A atoms will slowly cluster together at low temperature. At high temperature, they remain well-mixed. The phase landscape is identical — only one species, one crystal structure, one thermodynamic phase.</p>
                        </div>
                        <div className="q-tip">Set Init. B = 0, Coordination = 4-coord, T = 50. Watch clustering behavior.</div>
                    </div>

                    <div className="question-card">
                        <span className="q-badge">Question 2 — Energy Variations</span>
                        <p className="q-text">Change E_AB to be smaller (less repulsive, e.g. 0 or negative). How does the phase separation behavior change?</p>
                        <div className="q-answer">
                            <p><strong>E_AB = 0:</strong> A and B atoms are thermodynamically neutral toward each other. Phase separation is now entirely driven by the preference of each species to be near its own kind (E_AA and E_BB), not by an A-B repulsion. Clusters still form, but the driving force is weaker.</p>
                            <p style={{ marginTop: "0.75rem" }}><strong>E_AB &lt; 0 (attractive):</strong> The system is now driven to <em>mix</em>. A and B atoms prefer each other's company, forming an ordered alloy pattern (alternating A-B-A-B) rather than phase-separated clusters. This is analogous to an ordered intermetallic compound.</p>
                        </div>
                        <div className="q-tip">Try E_AB = 0, then E_AB = −50. Compare the final microstructures at low T.</div>
                    </div>

                    <div className="question-card">
                        <span className="q-badge">Question 3 — Temperature Extremes</span>
                        <p className="q-text">Compare the system behavior at very low temperature (T = 5) versus very high temperature (T = 500). What is the driving force in each case?</p>
                        <div className="q-answer">
                            <p><strong>Low T ≈ 5:</strong> The Glauber probability is very sensitive to ΔE. Only moves that significantly lower energy are accepted. The system strictly phase-separates: large, compact A-rich and B-rich domains form with sharp interfaces. B clusters are the densest (E_BB = −50). The system is <em>enthalpy-dominated</em>.</p>
                            <p style={{ marginTop: "0.75rem" }}><strong>High T ≈ 500:</strong> Thermal noise overwhelms interaction energies. All moves are accepted ~50% of the time, regardless of ΔE. The grid becomes a random mixture of A and B — <em>entropy-dominated</em>. This is the disordered, high-temperature solid solution phase.</p>
                        </div>
                        <div className="q-tip">Run at T = 5, then T = 500. Note how quickly each reaches apparent equilibrium.</div>
                    </div>

                    <div className="question-card">
                        <span className="q-badge">Question 4 — Crystal Segregation</span>
                        <p className="q-text">In &ldquo;Both&rdquo; coordination mode at low temperature, which crystal structure does each species prefer? Does temperature change the outcome?</p>
                        <div className="q-answer">
                            <p>With the default energies, 8-coordination amplifies all interactions (8 neighbors vs 4). Species with strong same-species bonds (B, with E_BB = −50) will strongly prefer 8-coordination because it multiplies their bond count — maximizing energy savings. A atoms, with weaker bonds (E_AA = −10) and a high cross-species penalty, may settle into either coordination depending on the local environment.</p>
                            <p style={{ marginTop: "0.75rem" }}>At high T, both coordination states are equally populated (~50/50) because entropy equalizes them. At low T, the thermodynamically favored structure dominates. Watch the dashboard to track the % 8-coord A vs % 8-coord B over time.</p>
                        </div>
                        <div className="q-tip">Set Coordination = Both, T = 50. Run to equilibrium and check the dashboard stats.</div>
                    </div>

                    <div className="question-card">
                        <span className="q-badge">Question 5 — Pure Phases</span>
                        <p className="q-text">Is it possible to achieve a purely 4-coord or purely 8-coord system when &ldquo;Both&rdquo; is active? What conditions would achieve this?</p>
                        <div className="q-answer">
                            <p>In principle, yes — but it requires extreme conditions. A purely 4-coord system would require the 8-coord state to be thermodynamically unfavorable for every single atom, which only happens if 4-coord interactions are systematically more energetically favorable. With the default parameters this is unlikely since 8-coord provides more bonds.</p>
                            <p style={{ marginTop: "0.75rem" }}>However, due to entropy, even at moderate T there will always be fluctuations that put some atoms in the minority coordination state. A "pure" phase would only be approached asymptotically at T → 0, or by brute-forcing the energetics so one state is overwhelmingly preferred.</p>
                        </div>
                        <div className="q-tip">Try setting E_AA very negative (e.g. −200) with only A atoms and Coordination = Both at very low T. Check if the dashboard reaches 100% 4-coord.</div>
                    </div>

                </div>
            </section>

            <div className="wavy-divider" />

            {/* Code Explanation 06 */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">06</span>
                    <h2>Under the Hood: Grid &amp; Periodic Boundaries</h2>
                </div>
                <div className="step-content">
                    <p>
                        The grid stores objects with both a <code>type</code> (A/B/Empty) and a{" "}
                        <code>coord</code> (4 or 8). Periodic boundary conditions use the modulo
                        operator to wrap neighbor lookups:
                    </p>
                    <CodeBlock code={`// Each cell: { type: 0=Empty | 1=A | 2=B, coord: 4 | 8 }
function createGrid(n, m, initA, initB) {
    const flat = Array(n * m).fill(null).map((_, i) => {
        if (i < initA) return { type: A, coord: 4 };
        if (i < initA + initB) return { type: B, coord: 4 };
        return { type: EMPTY, coord: 4 };
    });
    // Shuffle (Fisher-Yates)
    for (let i = flat.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [flat[i], flat[j]] = [flat[j], flat[i]];
    }
    return chunk(flat, n); // reshape into m rows
}

// Periodic 4-coord neighbors
function neighbors4(r, c, rows, cols) {
    return [
        [(r - 1 + rows) % rows, c],  // up (wraps)
        [(r + 1) % rows, c],          // down (wraps)
        [r, (c - 1 + cols) % cols],  // left (wraps)
        [r, (c + 1) % cols],          // right (wraps)
    ];
}`} />
                </div>
            </section>

            <div className="wavy-divider" />

            {/* Code Explanation 07 */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">07</span>
                    <h2>Under the Hood: Glauber Dynamics</h2>
                </div>
                <div className="step-content">
                    <p>
                        The energy of a single atom is computed by summing its pairwise interaction
                        energies with all neighbors under a given coordination. The Glauber probability
                        is then used to accept or reject the move:
                    </p>
                    <CodeBlock code={`function cellEnergy(grid, r, c, coord, eAA, eBB, eAB) {
    const type = grid[r][c].type;
    if (type === EMPTY) return 0;
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

// In the diffusion step:
const eCurrent  = cellEnergy(grid, filledR, filledC, coord, ...);
const eProposed = cellEnergy(grid, emptyR,  emptyC,  coord, ...);
const p = glauberProb(eCurrent, eProposed, T);
if (Math.random() <= p) { /* swap */ }`} />
                </div>
            </section>

            <div className="wavy-divider" />

            {/* Code Explanation 08 */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">08</span>
                    <h2>Under the Hood: The Flip Move</h2>
                </div>
                <div className="step-content">
                    <p>
                        The flip move is unique to this simulation — the atom stays in place but
                        its coordination label changes. The energy is recomputed under the new
                        coordination to determine if the structural change is favorable:
                    </p>
                    <CodeBlock code={`// Flip: one random filled site changes coordination
const r = Math.floor(Math.random() * rows);
const c = Math.floor(Math.random() * cols);
const cell = grid[r][c];
if (cell.type === EMPTY) continue;   // skip vacancies

const curCoord = cell.coord;         // 4 or 8
const newCoord = curCoord === 4 ? 8 : 4;  // toggle

const eCurrent  = cellEnergy(grid, r, c, curCoord, eAA, eBB, eAB);
const eProposed = cellEnergy(grid, r, c, newCoord, eAA, eBB, eAB);

const p = glauberProb(eCurrent, eProposed, T);
if (Math.random() <= p) {
    // Atom stays put — only its coordination changes
    grid[r][c] = { type: cell.type, coord: newCoord };
}`} />
                </div>
            </section>

        </div>
    );
}
