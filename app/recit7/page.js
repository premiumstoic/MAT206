import PowerVoronoiSimulation from "./Simulation";
import CodeBlock from "./CodeBlock";

export const metadata = {
    title: "Week 7: Power-Voronoi Grain Growth — MAT206",
    description:
        "Simulate 2D grain growth using a power-Voronoi geometric model with von Neumann-Mullins kinetics and Arrhenius mobility.",
};

export default function Recit7Page() {
    return (
        <div className="reading-column" style={{ padding: "3rem 1.5rem 4rem" }}>

            {/* Title */}
            <div className="journal-title-block">
                <span className="assignment-label">Assignment 07</span>
                <h1>
                    Power-Voronoi
                    <br />
                    Grain Growth
                </h1>
                <p className="tagline">
                    A geometric macroscopic simulation linking Arrhenius mobility to von&nbsp;Neumann–Mullins coarsening.
                </p>
            </div>

            {/* Context */}
            <div className="context-callout">
                <h3>Context</h3>
                <p>
                    Unlike the Monte Carlo lattice model of Week&nbsp;6, this simulation takes a
                    <strong> continuous geometric</strong> approach. Each grain is represented by a seed
                    point and a <em>weight</em> in a <strong>Power-Voronoi diagram</strong>.
                    Grain boundary migration is governed by the <strong>von&nbsp;Neumann–Mullins
                    relation</strong>, which predicts that a grain&rsquo;s area change depends only on
                    the number of sides it has: grains with fewer than 6 sides shrink,
                    grains with more than 6 sides grow, and 6-sided grains are metastable.
                </p>
            </div>

            <div className="wavy-divider" />

            {/* Step 01 — Power-Voronoi */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">01</span>
                    <h2>Power-Voronoi Geometry</h2>
                </div>
                <div className="step-content">
                    <p>
                        In a standard Voronoi diagram, each cell contains the points closest to a
                        particular seed. A <strong>Power-Voronoi</strong> (or Laguerre) diagram generalizes
                        this by assigning each seed a <em>weight</em> w<sub>i</sub>. The <em>power
                        distance</em> from a point <strong>p</strong> to a seed <strong>s<sub>i</sub></strong> is:
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", margin: "1.5rem 0" }}>
                        <span className="equation-pill">d<sub>pow</sub>(p, s<sub>i</sub>) = |p − s<sub>i</sub>|² − w<sub>i</sub></span>
                    </div>
                    <p>
                        The cell of seed i contains all points whose power distance to i is less
                        than to every other seed. Increasing a seed&rsquo;s weight makes its cell grow;
                        decreasing it makes the cell shrink. We compute each cell via
                        <strong> Sutherland–Hodgman polygon clipping</strong> against the bisector
                        half-planes of competing seeds.
                    </p>
                </div>
            </section>

            <div className="wavy-divider" />

            {/* Step 02 — Materials Kinetics */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">02</span>
                    <h2>Materials Kinetics</h2>
                </div>
                <div className="step-content">
                    <p>
                        Grain boundary mobility follows the <strong>Arrhenius equation</strong>:
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", margin: "1.5rem 0" }}>
                        <span className="equation-pill">M(T) = M₀ · exp(−Q<sub>m</sub> / RT)</span>
                    </div>
                    <p>
                        The <strong>von Neumann–Mullins relation</strong> gives the target area change per timestep:
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", margin: "1.5rem 0" }}>
                        <span className="equation-pill">dA/dt = K(n − 6) &nbsp; where &nbsp; K = (π/3) · γ · M</span>
                    </div>
                    <p>
                        This means grains with <strong>n &lt; 6 sides shrink</strong>, grains with <strong>n &gt; 6
                        sides grow</strong>, and <strong>6-sided grains are metastable</strong>.
                    </p>
                </div>
            </section>

            <div className="wavy-divider" />

            {/* Step 03 — The Numerical Trick */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">03</span>
                    <h2>The Numerical Weight Update</h2>
                </div>
                <div className="step-content">
                    <p>
                        Instead of solving local curvature explicitly, we use the power-Voronoi
                        weights to control grain area. The <strong>key trick</strong> is a numerical
                        sensitivity estimate:
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", margin: "1.5rem 0" }}>
                        <span className="equation-pill">dA/dw ≈ (A(w + ε) − A(w)) / ε</span>
                    </div>
                    <p>
                        From this we derive a global calibration factor C = 1 / mean(dA/dw), and
                        update each grain&rsquo;s weight as:
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", margin: "1.5rem 0" }}>
                        <span className="equation-pill">Δw = C × ΔA<sub>px</sub></span>
                    </div>
                    <p>
                        The calibration factor C is recomputed every N steps with damping to
                        prevent numerical instability.
                    </p>
                </div>
            </section>

            <div className="wavy-divider" />

            {/* Sandbox */}
            <section className="step-block">
                <div className="step-header">
                    <h2 style={{ fontFamily: "var(--font-serif)" }}>Interactive Sandbox</h2>
                </div>
                <p className="step-content" style={{ marginBottom: "1.5rem" }}>
                    Use the <strong>Initial size spread</strong> slider to control heterogeneity &mdash;
                    dragging it live-regenerates the microstructure instantly. Press <strong>Start</strong> to
                    watch grains with fewer than 6 sides shrink and vanish.
                </p>

                <PowerVoronoiSimulation />
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
                        <p className="q-text">How does the initial heterogeneity affect early-stage growth?</p>
                        <div className="q-answer">
                            <p>If the initial size spread is large, the early stages exhibit extremely rapid, almost &ldquo;abnormal&rdquo; coarsening. The initial state contains very small grains next to very large grains. Since dA/dt &prop; (n &minus; 6), small grains (n &lt; 6) rapidly collapse while large grains (n &gt; 6) consume them. However, as the most unstable grains vanish, the microstructure self-corrects toward a smoother, steady-state &ldquo;normal&rdquo; grain size distribution.</p>
                        </div>
                    </div>

                    <div className="question-card">
                        <span className="q-badge">Question 2</span>
                        <p className="q-text">Which grains shrink and which grow? Does it match dA/dt = K(n−6)?</p>
                        <div className="q-answer">
                            <p>Yes, the simulation precisely follows the geometric prediction. Grains with <strong>3, 4, or 5 sides</strong> consistently lose area and eventually vanish. Grains with exactly <strong>6 sides</strong> are metastable. Grains with <strong>7 or more sides</strong> consistently grow. This confirms that boundary curvature (forced by the 120° angle requirement at triple junctions) dictates growth purely by topological side count.</p>
                        </div>
                    </div>

                    <div className="question-card">
                        <span className="q-badge">Question 3</span>
                        <p className="q-text">What happens to the coarsening rate when Temperature increases?</p>
                        <div className="q-answer">
                            <p>Increasing the temperature dramatically accelerates the coarsening rate. The boundary mobility follows M(T) = M₀ exp(−Q<sub>m</sub> / RT). As T increases, the fraction −Q<sub>m</sub>/RT becomes a smaller negative number (closer to zero), so the exponential rapidly approaches 1, resulting in exponentially higher mobility and faster boundary migration.</p>
                        </div>
                    </div>

                    <div className="question-card">
                        <span className="q-badge">Question 4</span>
                        <p className="q-text">How does increasing Activation Energy (Q<sub>m</sub>) change the evolution rate?</p>
                        <div className="q-answer">
                            <p>Increasing Q<sub>m</sub> drastically slows down evolution. Q<sub>m</sub> represents the energy barrier atoms must overcome to jump across the boundary. In exp(−Q<sub>m</sub> / RT), a larger Q<sub>m</sub> makes the exponent a much larger negative number, driving the exponential closer to zero and severely restricting boundary mobility.</p>
                        </div>
                    </div>

                    <div className="question-card">
                        <span className="q-badge">Question 5</span>
                        <p className="q-text">Changing M₀ vs. changing Q<sub>m</sub>: Scale vs. Thermal Sensitivity</p>
                        <div className="q-answer">
                            <p><strong>Changing M₀</strong> (pre-exponential factor): M₀ is a linear multiplier. It alters the overall baseline scale of mobility across all temperatures equally. Doubling M₀ exactly doubles the simulation speed.</p>
                            <p style={{ marginTop: "0.75rem" }}><strong>Changing Q<sub>m</sub></strong> (activation energy): Q<sub>m</sub> sits inside the exponent and governs thermal sensitivity. It dictates how strongly the material responds to changes in temperature. A high Q<sub>m</sub> means sluggish behavior at low T but a steep spike in mobility as T increases.</p>
                        </div>
                    </div>

                    <div className="question-card">
                        <span className="q-badge">Question 6</span>
                        <p className="q-text">Compare the effects of γ and M₀. Do they produce similar changes?</p>
                        <div className="q-answer">
                            <p>Yes, changing either γ or M₀ produces identical qualitative changes. Both act as simple linear multipliers in K = (π/3) · γ · M. Since M ∝ M₀, doubling either γ or M₀ simply doubles K, which mathematically doubles ΔA in the timestep calculation, scaling the geometric evolution equally.</p>
                        </div>
                    </div>

                </div>
            </section>

            <div className="wavy-divider" />

            {/* Code */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">04</span>
                    <h2>Under the Hood: Weight Update</h2>
                </div>
                <div className="step-content">
                    <p>
                        The core weight-update loop using the von Neumann–Mullins relation and
                        numerical calibration:
                    </p>
                    <CodeBlock code={`// Arrhenius mobility
const QmJ = Qm * 1000; // kJ → J
const M = M0 * Math.exp(-QmJ / (R * T));
const K = (Math.PI / 3) * gamma * M;

// Calibration factor (every N steps)
let sumDaDw = 0, count = 0;
for (const s of activeSeeds) {
  const areaOrig = polyArea(computeCell(seeds, s, W, H));
  s.w += eps_w;
  const areaPerturbed = polyArea(computeCell(seeds, s, W, H));
  s.w -= eps_w;
  const dadw = (areaPerturbed - areaOrig) / eps_w;
  sumDaDw += dadw; count++;
}
const C = 1 / (sumDaDw / count); // global calibration

// von Neumann-Mullins weight update
for (const s of activeSeeds) {
  const nSides = computeCell(seeds, s, W, H).length;
  const dA_SI = K * (nSides - 6) * dt;   // m²
  const dA_px = dA_SI * (1e6/um)*(1e6/um); // → px²
  s.w += C * dA_px;
}`} />
                </div>
            </section>

        </div>
    );
}
