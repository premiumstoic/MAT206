import GrainGrowthSimulation from "./Simulation";
import CodeBlock from "./CodeBlock";

export const metadata = {
    title: "Week 6: Monte Carlo Grain Growth — MAT206",
    description:
        "Simulate 2D grain growth using a Monte Carlo lattice model with curvature-driven boundary migration and Glauber kinetics.",
};

export default function Recit6Page() {
    return (
        <div className="reading-column" style={{ padding: "3rem 1.5rem 4rem" }}>

            {/* Title */}
            <div className="journal-title-block">
                <span className="assignment-label">Assignment 06</span>
                <h1>
                    Monte Carlo
                    <br />
                    Grain Growth
                </h1>
                <p className="tagline">
                    How curvature-driven boundary migration makes small grains vanish and large grains dominate.
                </p>
            </div>

            {/* Context */}
            <div className="context-callout">
                <h3>Context</h3>
                <p>
                    Polycrystalline materials consist of many small crystallites (&ldquo;grains&rdquo;) separated by
                    grain boundaries. Over time, the system reduces its total boundary energy by migrating
                    these boundaries &mdash; small, highly-curved grains shrink and are eventually consumed by
                    their larger neighbors. This process is called <strong>grain growth</strong> (or grain coarsening)
                    and can be simulated effectively with a Monte Carlo lattice model using Glauber kinetics.
                </p>
            </div>

            <div className="wavy-divider" />

            {/* Step 01 — Lattice Model */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">01</span>
                    <h2>The Lattice Model</h2>
                </div>
                <div className="step-content">
                    <p>
                        Each cell in a 2D grid is assigned a discrete <strong>orientation</strong> (e.g., 1 of 3 or 6 possible
                        values). Each orientation represents a different crystallographic direction of that grain.
                        Cells sharing the same orientation belong to the same grain; boundaries form where
                        neighboring cells differ.
                    </p>
                    <p>
                        We use an <strong>8-neighbor Moore neighborhood</strong> with <strong>periodic boundary conditions</strong> (the grid wraps
                        around like a torus), so every cell always has exactly 8 neighbors regardless of its position.
                    </p>
                </div>
            </section>

            <div className="wavy-divider" />

            {/* Step 02 — Energy & Acceptance */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">02</span>
                    <h2>Energy &amp; Glauber Acceptance</h2>
                </div>
                <div className="step-content">
                    <p>
                        The local energy of a cell is defined by its interactions with its 8 neighbors:
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", margin: "1.5rem 0" }}>
                        <span className="equation-pill">E<sub>cell</sub> = &Sigma; (E<sub>bulk</sub> if same, E<sub>grain</sub> if different)</span>
                    </div>
                    <p>
                        For a proposed orientation flip, we compute the change in energy:
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", margin: "1.5rem 0" }}>
                        <span className="equation-pill">&Delta;E = E<sub>final</sub> &minus; E<sub>initial</sub></span>
                    </div>
                    <p>
                        The move is accepted with <strong>Glauber probability</strong>:
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", margin: "1.5rem 0" }}>
                        <span className="equation-pill">P<sub>accept</sub> = 1 / (1 + exp(&Delta;E / T))</span>
                    </div>
                    <p>
                        This ensures detailed balance and drives the system toward lower energy states
                        while still allowing thermal fluctuations.
                    </p>
                </div>
            </section>

            <div className="wavy-divider" />

            {/* Step 03 — MC Trial Logic */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">03</span>
                    <h2>MC Trial Logic</h2>
                </div>
                <div className="step-content">
                    <p>Each Monte Carlo trial follows this procedure:</p>
                    <ol style={{ paddingLeft: "1.5rem", lineHeight: 2, marginTop: "0.75rem" }}>
                        <li>Pick a random cell on the grid.</li>
                        <li>Examine its 8 neighbors (with periodic wrapping).</li>
                        <li><strong>Optimization:</strong> If all 8 neighbors have the <em>same</em> orientation as the cell, skip immediately &mdash; no useful work can be done.</li>
                        <li>Build an <strong>invasion pool</strong> of only the <em>different</em> neighbor orientations.</li>
                        <li>Randomly choose one invading orientation from the pool.</li>
                        <li>Compute &Delta;E and apply the Glauber acceptance criterion.</li>
                    </ol>
                </div>
            </section>

            <div className="wavy-divider" />

            {/* Sandbox */}
            <section className="step-block">
                <div className="step-header">
                    <h2 style={{ fontFamily: "var(--font-serif)" }}>Interactive Sandbox</h2>
                </div>
                <p className="step-content" style={{ marginBottom: "1.5rem" }}>
                    Use <strong>Regenerate</strong> for Voronoi-seeded large domains, or <strong>Mix</strong> for fully random tiny grains.
                    Click any cell on the canvas to manually cycle its orientation.
                </p>

                <GrainGrowthSimulation />
            </section>

            <div className="wavy-divider" />

            {/* Exploration Questions */}
            <section>
                <h2 className="explore-section-title">🔬 Exploration Questions</h2>
                <p className="explore-subtitle">
                    Run the simulation with different parameters to answer these physical analysis questions.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                    <div className="question-card">
                        <span className="q-badge">Question 1</span>
                        <p className="q-text">What is the effect of having bulk/boundary energy difference being too big or very close?</p>
                        <div className="q-answer">
                            <p><strong>Energies very close:</strong> If the bulk and grain energies are nearly identical, &Delta;E for any proposed flip is very small. The Glauber acceptance probability tends toward 50%. Boundaries lose structural integrity and dissolve into random, fuzzy noise because thermal fluctuations easily overpower the weak boundary energy penalty.</p>
                            <p style={{ marginTop: "0.75rem" }}><strong>Energies far apart:</strong> If the difference is massive, &Delta;E becomes very large. Unfavorable moves get an acceptance probability of virtually 0%, while favorable moves get exactly 100%. The system becomes entirely deterministic. Without the random &ldquo;thermal jiggling&rdquo; that allows boundaries to escape local energy traps, the microstructure will quickly freeze and stop evolving.</p>
                        </div>
                    </div>

                    <div className="question-card">
                        <span className="q-badge">Question 2</span>
                        <p className="q-text">Which curvature wins (negative or positive)? Why?</p>
                        <div className="q-answer">
                            <p>Convex surfaces (curving outward, typical of small grains) <strong>lose</strong> and are consumed by concave surfaces (curving inward, typical of large grains).</p>
                            <p style={{ marginTop: "0.75rem" }}>A cell protruding outward on a convex boundary is surrounded by a higher number of <em>unlike</em> neighbors. This gives it a higher local energy penalty. To minimize energy, the protruding cell is highly likely to flip its orientation to match the surrounding grain. Consequently, grain boundaries inherently migrate toward their center of curvature.</p>
                        </div>
                    </div>

                    <div className="question-card">
                        <span className="q-badge">Question 3</span>
                        <p className="q-text">What happens to the grain size? Why?</p>
                        <div className="q-answer">
                            <p>The average grain size <strong>continuously increases</strong> over time. Because boundaries migrate toward their center of curvature, small, highly-curved grains act like shrinking balloons until they completely disappear. As these smaller grains are eliminated, the total number of distinct grains decreases. Since the total simulation area remains constant, dividing the same area by a smaller number of grains yields a larger average grain size.</p>
                        </div>
                    </div>

                    <div className="question-card">
                        <span className="q-badge">Question 4</span>
                        <p className="q-text">Does low or high temperature change these tendencies?</p>
                        <div className="q-answer">
                            <p>Yes. Temperature dictates the strictness of the energy rules.</p>
                            <p style={{ marginTop: "0.75rem" }}><strong>High Temperature:</strong> Increases the denominator in &Delta;E/T, driving the acceptance probability closer to 50% for all moves. This introduces more random &ldquo;noise&rdquo; and allows boundaries to occasionally move against the energy gradient.</p>
                            <p style={{ marginTop: "0.5rem" }}><strong>Low Temperature:</strong> Makes the system highly directional, only accepting moves that strictly lower the local energy.</p>
                        </div>
                    </div>

                    <div className="question-card">
                        <span className="q-badge">Question 5</span>
                        <p className="q-text">Does the temperature change the grain size change rate?</p>
                        <div className="q-answer">
                            <p>Yes, a higher temperature actually <strong>increases</strong> the overall rate of grain growth. While low temperatures make the system strictly favor lower energy states, boundaries in a lattice are jagged. Smoothing a boundary often requires a temporary, unfavorable energy increase to get over a local energy &ldquo;bump.&rdquo; At very low temperatures, the system lacks the thermal energy to overcome these barriers, causing boundaries to freeze in local minima. A higher temperature provides the necessary thermal &ldquo;jiggling&rdquo; to escape these traps, allowing grains to grow much faster.</p>
                        </div>
                    </div>

                </div>
            </section>

            <div className="wavy-divider" />

            {/* Code */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">04</span>
                    <h2>Under the Hood: MC Trial</h2>
                </div>
                <div className="step-content">
                    <p>
                        The core Monte Carlo trial with the skip optimization and Glauber acceptance:
                    </p>
                    <CodeBlock code={`// Pick random cell
const r = Math.floor(Math.random() * rows);
const c = Math.floor(Math.random() * cols);
const ori = grid[r * cols + c];

// Check 8 neighbors (periodic)
let allSame = true;
const neighborOris = [];
for (const [dr, dc] of MOORE) {
    const nr = ((r + dr) % rows + rows) % rows;
    const nc = ((c + dc) % cols + cols) % cols;
    const nOri = grid[nr * cols + nc];
    neighborOris.push(nOri);
    if (nOri !== ori) allSame = false;
}

// Skip homogeneous sites (huge perf win)
if (allSame) continue;

// Build invasion pool (only different orientations)
const pool = neighborOris.filter(o => o !== ori);
const invading = pool[Math.floor(Math.random() * pool.length)];

// ΔE = E_final - E_initial
let eInit = 0, eFin = 0;
for (const n of neighborOris) {
    eInit += (n === ori)      ? bulkE : grainE;
    eFin  += (n === invading) ? bulkE : grainE;
}
const dE = eFin - eInit;

// Glauber acceptance (numerically stable)
const ratio = dE / T;
const pAccept = ratio > 50 ? 0 
              : ratio < -50 ? 1 
              : 1 / (1 + Math.exp(ratio));

if (Math.random() < pAccept) {
    grid[r * cols + c] = invading;
}`} />
                </div>
            </section>

        </div>
    );
}
