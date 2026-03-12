import DiffusionSimulation from "./Simulation";
import CodeBlock from "./CodeBlock";

export const metadata = {
    title: "Week 4: 2D Particle Diffusion — MAT206",
    description:
        "Simulate Brownian motion of particles in spatially heterogeneous environments. Explore Arrhenius kinetics, Gaussian random walks, and the effect of environmental barriers on diffusion.",
};

export default function Recit4Page() {
    return (
        <div className="reading-column" style={{ padding: "3rem 1.5rem 4rem" }}>

            {/* Title */}
            <div className="journal-title-block">
                <span className="assignment-label">Assignment 04</span>
                <h1>
                    2D Particle Diffusion
                    <br />
                    &amp; Reaction Kinetics
                </h1>
                <p className="tagline">
                    Continuous random walks driven by temperature, activation energy, and spatial environment.
                </p>
            </div>

            {/* Context */}
            <div className="context-callout">
                <h3>Context</h3>
                <p>
                    Previous weeks modeled diffusion on a <em>discrete lattice</em> — atoms teleporting
                    from site to site. This week we switch to a <strong>continuous space model</strong>:
                    each particle undergoes Brownian motion using a Gaussian random walk, sampling its
                    displacement from a Normal distribution at every timestep. The diffusion coefficient
                    is no longer fixed — it is calculated from temperature and activation energy via the
                    Arrhenius equation, and it varies by spatial environment.
                </p>
            </div>

            <div className="wavy-divider" />

            {/* Step 01 — Continuous Random Walk */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">01</span>
                    <h2>Continuous Random Walk (Brownian Motion)</h2>
                </div>
                <div className="step-content">
                    <p>
                        At every timestep Δt, each particle&apos;s displacement is sampled independently
                        from a Gaussian distribution with mean 0 and variance <code>2·D·Δt</code>:
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "center", margin: "1.5rem 0" }}>
                        <span className="equation-pill">Δx ~ N(0, 2·D·Δt)</span>
                        <span className="equation-pill">Δy ~ N(0, 2·D·Δt)</span>
                    </div>
                    <p>
                        The standard deviation of each step is therefore <code>σ = √(2·D·Δt)</code>.
                        A larger <em>D</em> or larger <em>Δt</em> means bigger steps and faster apparent
                        diffusion. Because we use a true Gaussian (via Box-Muller), particles have a small
                        but non-zero probability of taking very large steps — just like real thermal fluctuations.
                    </p>
                    <p>
                        The key insight: the <strong>Mean Squared Displacement (MSD)</strong> grows linearly
                        with time: <code>&lt;r²&gt; = 4·D·t</code>. This is the hallmark of Fickian (normal) diffusion.
                    </p>
                </div>
            </section>

            <div className="wavy-divider" />

            {/* Step 02 — Arrhenius */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">02</span>
                    <h2>Arrhenius Kinetics</h2>
                </div>
                <div className="step-content">
                    <p>
                        The diffusion coefficient <em>D</em> is not a fixed constant — it depends on
                        temperature via the <strong>Arrhenius equation</strong>:
                    </p>
                    <div style={{ display: "flex", justifyContent: "center", margin: "1.5rem 0" }}>
                        <span className="equation-pill">D = D₀ · exp(−Eₐ / (R · T))</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem", margin: "1.25rem 0" }}>
                        {[
                            { sym: "D₀", desc: "Pre-exponential factor (µm²/s). Sets the maximum possible diffusivity at infinite temperature." },
                            { sym: "Eₐ", desc: "Activation energy (J/mol). Higher Eₐ means diffusion is more strongly suppressed at low T." },
                            { sym: "R", desc: "Ideal gas constant = 8.314 J/mol/K." },
                            { sym: "T", desc: "Temperature (Kelvin). The single most powerful lever for controlling diffusion speed." },
                        ].map(({ sym, desc }) => (
                            <div key={sym} style={{ background: "var(--color-card)", borderRadius: "var(--radius-sm)", padding: "0.75rem 1rem", boxShadow: "var(--shadow-soft)" }}>
                                <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.9rem", color: "var(--color-amber)" }}>{sym}</div>
                                <div style={{ fontSize: "0.82rem", color: "var(--color-secondary)", marginTop: "4px" }}>{desc}</div>
                            </div>
                        ))}
                    </div>
                    <p>
                        Crucially, D is expressed in physical units (µm²/s), but the canvas renders in
                        pixels. The conversion uses a user-defined scale <em>a</em> (µm/pixel):
                    </p>
                    <div style={{ display: "flex", justifyContent: "center", margin: "1rem 0" }}>
                        <span className="equation-pill">D_pixels = D_µm / a²</span>
                    </div>
                </div>
            </section>

            <div className="wavy-divider" />

            {/* Step 03 — Environments */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">03</span>
                    <h2>Spatial Heterogeneity: Two Environments</h2>
                </div>
                <div className="step-content">
                    <p>
                        The canvas is divided into two environments with independent Arrhenius parameters.
                        A particle&apos;s displacement at each step is determined by its
                        <strong> current location</strong> at the start of the step — not its destination.
                    </p>
                    <ul style={{ paddingLeft: "1.5rem", lineHeight: 2, marginTop: "0.75rem" }}>
                        <li>
                            <strong>Environment 1 (Background):</strong> The default environment covering the entire
                            canvas. Defaults to D₀ = 50, Eₐ = 12,000 J/mol.
                        </li>
                        <li>
                            <strong>Environment 2 (Overlay):</strong> A user-defined subregion with its own D₀ and
                            Eₐ. Default: D₀ = 10, Eₐ = 18,000 J/mol — a <em>slower</em> region. Can be shaped as
                            a Band (Top / Bottom / Left / Right), a central Membrane, or a Center Circle.
                        </li>
                    </ul>
                    <p style={{ marginTop: "0.75rem" }}>
                        Env 2 behaves like a <strong>diffusion barrier</strong> or a distinct material
                        phase. You can visualize it as a membrane dividing two compartments, or a crystal
                        grain with different atomic bonding.
                    </p>
                </div>
            </section>

            <div className="wavy-divider" />

            {/* Step 04 — Boundaries */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">04</span>
                    <h2>Reflecting Boundary Conditions</h2>
                </div>
                <div className="step-content">
                    <p>
                        Particles are confined to the canvas. If a step would take a particle outside the
                        valid domain (accounting for its radius <em>r</em>), the overshoot is reflected:
                    </p>
                    <div style={{ display: "flex", justifyContent: "center", margin: "1.25rem 0" }}>
                        <span className="equation-pill">x_final = x_boundary − overshoot</span>
                    </div>
                    <p>
                        This simulates a <em>perfectly reflecting wall</em>. The particle bounces back into
                        the domain with the same kinetic energy — no particle is lost, and no particle
                        is frozen at the boundary.
                    </p>
                </div>
            </section>

            <div className="wavy-divider" />

            {/* Step 05 — Box-Muller */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">05</span>
                    <h2>Box-Muller Transform</h2>
                </div>
                <div className="step-content">
                    <p>
                        JavaScript&apos;s <code>Math.random()</code> generates uniform numbers in [0, 1].
                        To sample from a Gaussian distribution, we use the{" "}
                        <strong>Box-Muller transform</strong>:
                    </p>
                    <CodeBlock code={`function randGauss(sigma) {
    // Box-Muller: transform two uniform samples
    // into one Gaussian sample
    let u = 0, v = 0;
    while (u === 0) u = Math.random(); // avoid log(0)
    while (v === 0) v = Math.random();
    return sigma * Math.sqrt(-2 * Math.log(u))
                 * Math.cos(2 * Math.PI * v);
}`} />
                    <p style={{ marginTop: "1rem" }}>
                        The standard deviation is set to <code>σ = √(2·D_pixels·dt)</code>, so{" "}
                        <code>randGauss(σ)</code> samples the correct Brownian step size.
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
                    The <em>D</em> and <em>σ</em> values displayed under each environment update in real time.
                    Temperature, D₀, Eₐ, and Environment 2 geometry changes apply immediately without resetting.
                    Changes to the <em>Initial Distribution</em> require a Reset.
                </p>
                <DiffusionSimulation />
            </section>

            <div className="wavy-divider" />

            {/* Exploration Questions */}
            <section>
                <h2 className="explore-section-title">🔬 Exploration Questions</h2>
                <p className="explore-subtitle">
                    Each question targets a distinct aspect of diffusion physics. Adjust the sandbox controls
                    above to explore each phenomenon.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                    <div className="question-card">
                        <span className="q-badge">Question 1 — Temperature Sensitivity</span>
                        <p className="q-text">What happens to particle speed as you dramatically increase or decrease temperature?</p>
                        <div className="q-answer">
                            <p>Increasing T exponentially increases D (Arrhenius), so particles move much faster and spread across the canvas rapidly. At very high T, the exponential term approaches 1 (D → D₀), and motion becomes nearly D₀-limited.</p>
                            <p style={{ marginTop: "0.75rem" }}>Decreasing T sharply reduces D. Below a threshold temperature, Eₐ overwhelms the thermal energy and particles become nearly frozen. This is the basis for diffusion-limited processes in cold or viscous media.</p>
                        </div>
                        <div className="q-tip">Set Env 1 to D₀ = 50, Eₐ = 12000. Compare T = 100 K vs T = 1000 K visually.</div>
                    </div>

                    <div className="question-card">
                        <span className="q-badge">Question 2 — Membrane Barrier</span>
                        <p className="q-text">Initialize all particles on the Left side, then set Env 2 to "Membrane" with high Eₐ. How does the membrane affect particle crossing?</p>
                        <div className="q-answer">
                            <p>With low temperature or a very high Eₐ,₂, the membrane region has a near-zero D. Particles that wander into the membrane diffuse so slowly that very few cross to the other side — the membrane acts as a near-impermeable barrier.</p>
                            <p style={{ marginTop: "0.75rem" }}>At higher temperatures, the energy difference between the two sides shrinks (because both D values go up, but proportionally), and particles begin to cross the membrane. This models <em>ion channels</em> or <em>grain boundaries</em> in materials science.</p>
                        </div>
                        <div className="q-tip">Init Dist = Left, Env 2 = Membrane 10%, Eₐ,₂ = 50000, T = 300. Run and watch how many particles cross.</div>
                    </div>

                    <div className="question-card">
                        <span className="q-badge">Question 3 — Activation Energy Comparison</span>
                        <p className="q-text">Give Env 1 and Env 2 the same D₀ but different Eₐ values. What does the interface between the two regions look like at equilibrium?</p>
                        <div className="q-answer">
                            <p>With the same D₀, the pre-factor is identical. However, a higher Eₐ in Env 2 means D₂ is more suppressed by temperature. At equilibrium, particle density in the slower region will be higher — particles entering are slower to leave, so they accumulate.</p>
                            <p style={{ marginTop: "0.75rem" }}>This is directly analogous to how atoms accumulate in low-diffusivity grain boundaries, or how species accumulate in membranes with high permeation barriers.</p>
                        </div>
                        <div className="q-tip">D₀,₁ = D₀,₂ = 10. Set Eₐ,₁ = 5000, Eₐ,₂ = 40000. Use Env 2 = Left Band at 30%, Init = Uniform.</div>
                    </div>

                    <div className="question-card">
                        <span className="q-badge">Question 4 — Scale Factor (µm / pixel)</span>
                        <p className="q-text">What is the physical effect of changing the µm/pixel scale factor?</p>
                        <div className="q-answer">
                            <p>The scale factor <em>a</em> converts D from physical units to pixel units: D_pixels = D_µm / a². A smaller <em>a</em> means each pixel represents fewer micrometers — the system is "zoomed in". This increases D_pixels, making particles appear to move faster on screen even though the physical diffusivity hasn&apos;t changed.</p>
                            <p style={{ marginTop: "0.75rem" }}>Increasing <em>a</em> (zooming out) reduces D_pixels, slowing apparent motion. This is a purely geometric effect and does not change the underlying thermodynamics — only the visual rendering.</p>
                        </div>
                        <div className="q-tip">Keep everything else constant. Change µm/pixel from 0.05 to 0.5 and observe apparent speed change.</div>
                    </div>

                    <div className="question-card">
                        <span className="q-badge">Question 5 — Initialization Asymmetry</span>
                        <p className="q-text">Initialize particles on one side and observe equilibration. Does the system reach a truly uniform distribution? How does Env 2 affect this?</p>
                        <div className="q-answer">
                            <p>Without Env 2 (or with both environments having equal D), the system equilibrates toward a <em>uniform</em> particle distribution — entropy drives mixing. The boundary condition is irrelevant at late times.</p>
                            <p style={{ marginTop: "0.75rem" }}>However, with Env 2 having a much lower D, the final distribution is <em>not uniform</em>. Particles accumulate in the slow region. This is analogous to a Maxwell-Boltzmann distribution for energy levels — the particle density is inversely proportional to diffusivity in each region at steady state.</p>
                        </div>
                        <div className="q-tip">Init Dist = Left Side. First try no Env 2, then try Env 2 = Right Band with very high Eₐ. Compare final distributions.</div>
                    </div>

                </div>
            </section>

            <div className="wavy-divider" />

            {/* Code: Simulation Step */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">06</span>
                    <h2>Under the Hood: The Simulation Loop</h2>
                </div>
                <div className="step-content">
                    <p>
                        Each animation frame, all particles are updated in a single loop. The diffusion
                        coefficient is determined by the particle&apos;s current location (Env 1 or Env 2),
                        then the Gaussian step is applied and reflected at walls:
                    </p>
                    <CodeBlock code={`// Per frame, for each particle:
const sigma = inEnv2(p.x, p.y, geo) ? sigma2 : sigma1;

const nx = p.x + randGauss(sigma);  // proposed new x
const ny = p.y + randGauss(sigma);  // proposed new y

// Reflecting boundary conditions (accounting for radius r):
p.x = reflect(nx, r, W - r);
p.y = reflect(ny, r, H - r);

function reflect(val, min, max) {
    if (val < min) return min + (min - val); // bounce off min wall
    if (val > max) return max - (val - max); // bounce off max wall
    return val;
}`} />
                </div>
            </section>

            <div className="wavy-divider" />

            {/* Code: Env 2 geometry */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">07</span>
                    <h2>Under the Hood: Environment 2 Geometry</h2>
                </div>
                <div className="step-content">
                    <p>
                        Environment 2 supports six shapes — all derived from the user-defined
                        percentage <em>p</em>. Point-in-region tests use simple arithmetic:
                    </p>
                    <CodeBlock code={`function getEnv2Rect(location, pct, W, H) {
    const p = pct / 100;
    switch (location) {
        case "top":      return { type:"rect", x:0,  y:0,        w:W, h:H*p };
        case "bottom":   return { type:"rect", x:0,  y:H*(1-p),  w:W, h:H*p };
        case "left":     return { type:"rect", x:0,  y:0,        w:W*p, h:H };
        case "right":    return { type:"rect", x:W*(1-p), y:0,   w:W*p, h:H };
        case "membrane": {
            const mw = W * p;
            return { type:"rect", x:(W-mw)/2, y:0, w:mw, h:H };
        }
        case "center": {
            const maxR = Math.min(W, H) / 2;
            return { type:"circle", cx:W/2, cy:H/2, r:maxR*p };
        }
    }
}

// Point-in-region test:
function inEnv2(x, y, env2) {
    if (env2.type === "rect")
        return x>=env2.x && x<=env2.x+env2.w && y>=env2.y && y<=env2.y+env2.h;
    const dx=x-env2.cx, dy=y-env2.cy;
    return dx*dx + dy*dy <= env2.r*env2.r;
}`} />
                </div>
            </section>

        </div>
    );
}
