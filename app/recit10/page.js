import OstwaldSimulation from "./Simulation";
import CodeBlock from "./CodeBlock";

export const metadata = {
    title: "Week 10: Ostwald Ripening — MAT206",
    description:
        "Simulate 2D Ostwald ripening of circular particles using Arrhenius mobility, critical radius kinetics, and numerical substepping.",
};

export default function Recit10Page() {
    return (
        <>
            {/* ═══ Theory Section (narrow reading column) ═══ */}
            <div className="reading-column" style={{ padding: "3rem 1.5rem 0" }}>

                {/* Title */}
                <div className="journal-title-block">
                    <span className="assignment-label">Assignment 10</span>
                    <h1>
                        Ostwald
                        <br />
                        Ripening
                    </h1>
                    <p className="tagline">
                        Mean-field coarsening of circular particles driven by curvature and Arrhenius kinetics.
                    </p>
                </div>

                {/* Context */}
                <div className="context-callout">
                    <h3>Context</h3>
                    <p>
                        <strong>Ostwald ripening</strong> is the process by which larger particles in a
                        dispersion grow at the expense of smaller ones. The driving force is the reduction
                        of total interfacial energy: smaller particles have higher surface curvature and
                        therefore higher chemical potential. In this <strong>mean-field model</strong>,
                        each particle interacts only through a global <strong>critical radius</strong>
                        &nbsp;R<sub>c</sub>&nbsp;&mdash; particles larger than R<sub>c</sub> grow,
                        particles smaller than R<sub>c</sub> shrink and eventually dissolve.
                    </p>
                </div>

                <div className="wavy-divider" />

                {/* Step 01 — Thermodynamics & Kinetics */}
                <section className="step-block">
                    <div className="step-header">
                        <span className="step-number">01</span>
                        <h2>Thermodynamics &amp; Kinetics</h2>
                    </div>
                    <div className="step-content">
                        <p>
                            Atomic mobility follows the <strong>Arrhenius equation</strong> with the
                            Boltzmann constant k<sub>B</sub> = 8.617 &times; 10<sup>&minus;5</sup>&nbsp;eV/K:
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", margin: "1.5rem 0" }}>
                            <span className="equation-pill">M(T) = M₀ · exp(−Q / k<sub>B</sub>T)</span>
                        </div>
                        <p>
                            The <strong>critical radius</strong> is the harmonic mean of all particle radii:
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", margin: "1.5rem 0" }}>
                            <span className="equation-pill">R<sub>c</sub> = ( (1/N) · Σ(1/r<sub>i</sub>) )<sup>−1</sup></span>
                        </div>
                        <p>
                            The rate of change of each particle&rsquo;s radius follows the
                            diffusion-controlled growth law:
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", margin: "1.5rem 0" }}>
                            <span className="equation-pill">dr<sub>i</sub>/dt = (M / r<sub>i</sub>²) · (r<sub>i</sub> / R<sub>c</sub> − 1)</span>
                        </div>
                        <p>
                            Particles with r &gt; R<sub>c</sub> grow (positive dr/dt), while those
                            with r &lt; R<sub>c</sub> shrink (negative dr/dt) and eventually dissolve
                            when they fall below the minimum threshold.
                        </p>
                    </div>
                </section>

                <div className="wavy-divider" />

                {/* Step 02 — Numerical Substepping */}
                <section className="step-block">
                    <div className="step-header">
                        <span className="step-number">02</span>
                        <h2>Numerical Substepping</h2>
                    </div>
                    <div className="step-content">
                        <p>
                            The 1/r<sub>i</sub><sup>2</sup> term in the growth equation makes small
                            particles evolve extremely rapidly. A na&iuml;ve single-step Euler integration
                            with a large dt will overshoot and cause the simulation to diverge.
                        </p>
                        <p>
                            The solution is <strong>adaptive substepping</strong>: inside each user-visible
                            dt, we divide the integration into many smaller sub-steps. The number of
                            sub-steps scales inversely with the smallest particle&rsquo;s radius squared,
                            ensuring that even the fastest-shrinking particle is integrated smoothly:
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", margin: "1.5rem 0" }}>
                            <span className="equation-pill">n<sub>sub</sub> = max(10, ⌈dt · M / r<sub>min</sub>² · 2⌉)</span>
                        </div>
                        <p>
                            Particles whose radius falls below R<sub>min</sub> during any sub-step
                            are immediately removed from the system so they no longer affect R<sub>c</sub>.
                        </p>
                    </div>
                </section>

                <div className="wavy-divider" />
            </div>

            {/* ═══ Sandbox — Full Width Breakout ═══ */}
            <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "1rem 1.5rem 2.5rem" }}>
                <div style={{ marginBottom: "1.5rem" }}>
                    <h2 style={{ fontFamily: "var(--font-serif)", textAlign: "center", marginBottom: "0.5rem" }}>Interactive Sandbox</h2>
                    <p style={{ textAlign: "center", color: "var(--color-secondary)", fontSize: "0.9rem", maxWidth: 600, margin: "0 auto" }}>
                        Adjust temperature, activation energy, and initial size distribution.
                        Press <strong>Start</strong> to watch small particles dissolve while large ones grow.
                    </p>
                </div>
                <OstwaldSimulation />
            </section>

            {/* ═══ Q&A + Code (back to narrow reading column) ═══ */}
            <div className="reading-column" style={{ padding: "0 1.5rem 4rem" }}>
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
                            <p className="q-text">Effect of Temperature (T), Activation Energy (Q), and M₀ &mdash; which has a faster effect?</p>
                            <div className="q-answer">
                                <p><strong>Temperature (T) and Activation Energy (Q)</strong>: These parameters dictate the atomic mobility via the Arrhenius equation M = M₀ exp(&minus;Q / k<sub>B</sub>T). Because they reside inside the exponent, a change in T or Q has an <strong>exponential</strong> effect on the ripening speed. Increasing T rapidly accelerates coarsening, while increasing Q rapidly suppresses it.</p>
                                <p style={{ marginTop: "0.75rem" }}><strong>Pre-exponential factor (M₀)</strong>: This acts as a simple <strong>linear multiplier</strong>. Doubling M₀ doubles the rate.</p>
                                <p style={{ marginTop: "0.75rem" }}>Conclusion: T and Q have a much more profound, faster effect on the system&rsquo;s kinetics due to their exponential nature compared to the linear scaling of M₀.</p>
                            </div>
                        </div>

                        <div className="question-card">
                            <span className="q-badge">Question 2</span>
                            <p className="q-text">How do different initial size ranges affect the outcome?</p>
                            <div className="q-answer">
                                <p><strong>Broad/Bimodal Distribution</strong>: A wide range of initial sizes means there is a massive driving force between the highly-curved small particles and the flatter large particles. This causes very rapid initial coarsening as the smallest particles quickly dissolve.</p>
                                <p style={{ marginTop: "0.75rem" }}><strong>Homogeneous Distribution (Max = Min)</strong>: If all particles start at exactly the same size, the system is perfectly uniform. Mathematically, every particle&rsquo;s radius r exactly equals R<sub>c</sub>. Therefore, r/R<sub>c</sub> &minus; 1 = 0, and the growth rate dr/dt = 0. The system is temporarily <strong>metastable</strong> and &ldquo;stuck.&rdquo; However, in a real physical system (or a simulation with floating-point noise / Brownian motion), a tiny fluctuation will eventually cause one particle to become slightly smaller or larger, breaking the symmetry and kicking off the ripening process.</p>
                            </div>
                        </div>

                        <div className="question-card">
                            <span className="q-badge">Question 3</span>
                            <p className="q-text">Ultimate Fate: Do they evolve into one particle or reach a critical size?</p>
                            <div className="q-answer">
                                <p>If allowed to run for an infinite amount of time, the system will mathematically evolve into <strong>one single massive particle</strong>. Ostwald ripening is driven purely by the minimization of total surface/interfacial energy. The absolute lowest energy state for a conserved volume of material is a single sphere, which has the minimum possible surface-area-to-volume ratio. The critical radius R<sub>c</sub> does not stop growing; it continuously scales upward until only one particle remains.</p>
                            </div>
                        </div>

                    </div>
                </section>

                <div className="wavy-divider" />

                {/* Code */}
                <section className="step-block">
                    <div className="step-header">
                        <span className="step-number">03</span>
                        <h2>Under the Hood: Radius Update</h2>
                    </div>
                    <div className="step-content">
                        <p>
                            The core radius-update loop with adaptive substepping and the Arrhenius
                            kinetics engine:
                        </p>
                        <CodeBlock code={`// Arrhenius mobility
const kB = 8.617333262145e-5; // eV/K
const M = M0 * Math.exp(-Q / (kB * T));

// Adaptive substepping
const rSmallest = Math.min(...active.map(p => p.r));
const nSub = Math.max(10, Math.ceil(dt * M / (rSmallest**2) * 2));
const dtSub = dt / nSub;

for (let sub = 0; sub < nSub; sub++) {
  const alive = particles.filter(p => p.active);
  if (alive.length <= 1) break;

  // Critical radius (harmonic mean)
  const sumInvR = alive.reduce((s, p) => s + 1/p.r, 0);
  const Rc = alive.length / sumInvR;

  // Update each particle
  for (const p of alive) {
    p.r += dtSub * (M / p.r**2) * (p.r / Rc - 1);
    if (p.r < Rmin) p.active = false; // dissolve
  }
}`} />
                    </div>
                </section>

            </div>
        </>
    );
}
