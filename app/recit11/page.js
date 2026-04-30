import NucleationSimulation from "./Simulation";
import CodeBlock from "./CodeBlock";

export const metadata = {
  title: "Week 11: Water Droplet Nucleation — MAT206",
  description:
    "Simulate 2D water droplet nucleation and growth using the Antoine equation, classical nucleation theory, and Arrhenius kinetics.",
};

export default function Recit11Page() {
  return (
    <>
      <div className="reading-column" style={{ padding: "3rem 1.5rem 0" }}>
        <div className="journal-title-block">
          <span className="assignment-label">Assignment 11</span>
          <h1>Water Droplet<br />Nucleation</h1>
          <p className="tagline">
            Classical nucleation theory meets Arrhenius growth kinetics in a mean-field condensation simulation.
          </p>
        </div>

        <div className="context-callout">
          <h3>Context</h3>
          <p>
            When air becomes <strong>supersaturated</strong> (p &gt; p<sub>sat</sub>), water
            molecules can condense into liquid droplets. The formation of a new droplet requires
            overcoming a <strong>nucleation barrier</strong> — the energetic cost of creating a
            new surface. This simulation models both <strong>homogeneous</strong> nucleation
            (spontaneous formation in bulk air) and <strong>heterogeneous</strong> nucleation
            (formation on dust particles), followed by <strong>diffusion-controlled growth</strong>.
          </p>
        </div>

        <div className="wavy-divider" />

        {/* Step 01 */}
        <section className="step-block">
          <div className="step-header">
            <span className="step-number">01</span>
            <h2>Thermodynamics</h2>
          </div>
          <div className="step-content">
            <p>
              The saturation pressure of water follows the <strong>Antoine equation</strong>:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", margin: "1.5rem 0" }}>
              <span className="equation-pill">log₁₀(p<sub>sat</sub>) = A − B / (C + T)</span>
            </div>
            <p>
              When the actual partial pressure p exceeds p<sub>sat</sub>, the air is
              <strong> supersaturated</strong>. The chemical potential difference driving condensation is:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", margin: "1.5rem 0" }}>
              <span className="equation-pill">Δμ = k<sub>B</sub>T · ln(p / p<sub>sat</sub>)</span>
            </div>
            <p>
              The volumetric driving force is |Δg<sub>v</sub>| = n<sub>l</sub> × |Δμ|, where
              n<sub>l</sub> is the number density of liquid water molecules (~3.34 × 10²⁸ m⁻³).
            </p>
          </div>
        </section>

        <div className="wavy-divider" />

        {/* Step 02 */}
        <section className="step-block">
          <div className="step-header">
            <span className="step-number">02</span>
            <h2>Nucleation Theory</h2>
          </div>
          <div className="step-content">
            <p>
              <strong>Homogeneous nucleation</strong> occurs spontaneously in the bulk. The energy
              barrier and critical radius are:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", margin: "1.5rem 0" }}>
              <span className="equation-pill">ΔG<sub>hom</sub> = 16πγ³ / (3|Δg<sub>v</sub>|²)</span>
              <span className="equation-pill">r<sub>hom</sub> = 2γ / |Δg<sub>v</sub>|</span>
            </div>
            <p>
              <strong>Heterogeneous nucleation</strong> occurs on pre-existing dust particles.
              The wetting factor f(θ) reduces the barrier:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", margin: "1.5rem 0" }}>
              <span className="equation-pill">f(θ) = (2 − 3cos θ + cos³θ) / 4</span>
              <span className="equation-pill">ΔG<sub>het</sub> = f(θ) × ΔG<sub>hom</sub></span>
            </div>
            <p>
              Each timestep, the simulation performs one probabilistic nucleation test:
              P = clamp(A · dt · exp(−ΔG / k<sub>B</sub>T), 0, 1).
            </p>
          </div>
        </section>

        <div className="wavy-divider" />

        {/* Step 03 */}
        <section className="step-block">
          <div className="step-header">
            <span className="step-number">03</span>
            <h2>Growth Kinetics</h2>
          </div>
          <div className="step-content">
            <p>
              Once nucleated, droplets grow via Arrhenius-controlled diffusion:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", margin: "1.5rem 0" }}>
              <span className="equation-pill">M(T) = M₀ · exp(−Q / k<sub>B</sub>T)</span>
              <span className="equation-pill">Δr = M(T) × |Δg<sub>v</sub>| × dt</span>
            </div>
            <p>
              Droplets that reach the <strong>rain threshold</strong> radius fade out and are
              removed from the system, simulating precipitation.
            </p>
          </div>
        </section>

        <div className="wavy-divider" />
      </div>

      {/* Sandbox — Full Width */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "1rem 1.5rem 2.5rem" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontFamily: "var(--font-serif)", textAlign: "center", marginBottom: "0.5rem" }}>Interactive Sandbox</h2>
          <p style={{ textAlign: "center", color: "var(--color-secondary)", fontSize: "0.9rem", maxWidth: 600, margin: "0 auto" }}>
            Adjust atmosphere, temperature, surface energy, and contact angle. Watch droplets
            nucleate on dust or in mid-air, grow, and eventually rain out.
          </p>
        </div>
        <NucleationSimulation />
      </section>

      {/* Q&A + Code */}
      <div className="reading-column" style={{ padding: "0 1.5rem 4rem" }}>
        <div className="wavy-divider" />

        <section>
          <h2 className="explore-section-title">🔬 Exploration Questions</h2>
          <p className="explore-subtitle">
            Run the simulation with different parameters to answer these physical analysis questions.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            <div className="question-card">
              <span className="q-badge">Question 1</span>
              <p className="q-text">Effect of increasing Temperature at fixed vapor pressure</p>
              <div className="q-answer">
                <p>Increasing temperature exponentially increases p<sub>sat</sub> via the Antoine equation. Since the air can hold more water, the relative humidity (p/p<sub>sat</sub>) drops. The chemical potential difference Δμ decreases or goes negative, nucleation tendency plummets, and the system may cross from supersaturated to undersaturated.</p>
              </div>
            </div>

            <div className="question-card">
              <span className="q-badge">Question 2</span>
              <p className="q-text">Moving from Dry to Tropical Air at fixed Temperature</p>
              <div className="q-answer">
                <p>Tropical air has a higher vapor partial pressure p. Since p<sub>sat</sub> is fixed by temperature, p/p<sub>sat</sub> increases, boosting Δμ and |Δg<sub>v</sub>|. This drastically reduces the critical radius r* = 2γ/|Δg<sub>v</sub>| and the nucleation barrier, leading to a massive spike in nucleation probability.</p>
              </div>
            </div>

            <div className="question-card">
              <span className="q-badge">Question 3</span>
              <p className="q-text">Crossing from Undersaturated to Supersaturated</p>
              <div className="q-answer">
                <p>In undersaturated conditions (p ≤ p<sub>sat</sub>), Δμ is zero or negative — droplets evaporate. Upon crossing into supersaturation, Δμ becomes positive, condensation becomes thermodynamically favorable, the system gains a finite critical radius, and thermal fluctuations can overcome the barrier to form stable droplets.</p>
              </div>
            </div>

            <div className="question-card">
              <span className="q-badge">Question 4</span>
              <p className="q-text">Effect of Surface Energy (γ) and Contact Angle (θ)</p>
              <div className="q-answer">
                <p><strong>Increasing γ</strong>: Surface energy is the penalty for creating a droplet. It linearly increases r* (∝ γ) and massively increases the barrier (ΔG* ∝ γ³).</p>
                <p style={{ marginTop: "0.5rem" }}><strong>Contact Angle</strong>: Heterogeneous nucleation is strongly favored at low θ (hydrophilic dust). As θ → 0°, f(θ) → 0, meaning the barrier virtually disappears and water condenses on dust almost instantly.</p>
              </div>
            </div>

            <div className="question-card">
              <span className="q-badge">Question 5</span>
              <p className="q-text">Kinetic Parameters: A, M₀, and Q</p>
              <div className="q-answer">
                <p><strong>Prefactor A</strong>: Shifts the statistical frequency of nucleation attempts without changing the thermodynamic barrier.</p>
                <p style={{ marginTop: "0.5rem" }}><strong>M₀</strong>: Only affects post-nucleation growth rate — not whether a droplet nucleates.</p>
                <p style={{ marginTop: "0.5rem" }}><strong>Activation Energy Q</strong>: Increasing Q slows growth exponentially (M ∝ exp(−Q/kT)), especially at low T.</p>
              </div>
            </div>

            <div className="question-card">
              <span className="q-badge">Question 6</span>
              <p className="q-text">Complex Scenarios: Favorable Thermodynamics with No Rain?</p>
              <div className="q-answer">
                <p><strong>Favorable thermodynamics, no droplets</strong>: If γ is exceptionally high, ΔG* prevents nucleation despite favorable Δg<sub>v</sub>.</p>
                <p style={{ marginTop: "0.5rem" }}><strong>Ready nucleation, no rain</strong>: Many tiny droplets nucleate but if M₀ is extremely low or Q is very high, growth is negligible and droplets never reach the rain threshold.</p>
              </div>
            </div>

          </div>
        </section>

        <div className="wavy-divider" />

        <section className="step-block">
          <div className="step-header">
            <span className="step-number">04</span>
            <h2>Under the Hood: Nucleation &amp; Growth</h2>
          </div>
          <div className="step-content">
            <p>The core nucleation test and growth loop:</p>
            <CodeBlock code={`// Antoine equation → saturation pressure
const pS = Math.pow(10, 8.07131 - 1730.63/(233.426 + T_C)) * 133.322;
const dmu = kB * T * Math.log(p / pS);
const dgv = n_liquid * dmu;

// Nucleation barriers
const dG_hom = 16*Math.PI*gamma**3 / (3*dgv**2);
const r_crit = 2*gamma / dgv;  // meters
const f_theta = (2 - 3*Math.cos(theta) + Math.cos(theta)**3) / 4;
const dG_het = f_theta * dG_hom;

// Probability test
const P_hom = clamp(A * dt * Math.exp(-dG_hom / (kB*T)), 0, 1);
const P_het = clamp(A * dt * Math.exp(-dG_het / (kB*T)), 0, 1);
if (Math.random() < P_hom) spawnHomogeneous(r_crit);
if (Math.random() < P_het) spawnOnDust(r_crit);

// Growth (Arrhenius)
const M = M0 * Math.exp(-Q / (kB * T));
for (const drop of droplets) {
  drop.r += Math.min(M * dgv * dt, maxDr);
  if (drop.r / scale >= rainThreshold) fadeOut(drop);
}`} />
          </div>
        </section>
      </div>
    </>
  );
}
