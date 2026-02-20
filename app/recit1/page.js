import MonteCarloSimulation from "./Simulation";

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
                    <br />
                    Prompting Guide
                </h1>
                <p className="tagline">
                    Navigating the energy landscape of atomic diffusion.
                </p>
            </div>

            {/* Context */}
            <div className="context-callout">
                <h3>Context</h3>
                <p>
                    Use this document to guide the AI in your Antigravity IDE. Feed it the
                    &ldquo;System Context&rdquo; first, then provide Prompts 1 through 5
                    sequentially. <strong>Wait for the AI to finish and verify the code
                        works before moving to the next prompt.</strong>
                </p>
            </div>

            <div className="wavy-divider" />

            {/* Step 1 */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">01</span>
                    <h2>The Grid, Interactivity &amp; Visuals</h2>
                </div>
                <div className="step-content">
                    <p>
                        Build the UI skeleton and grid rendering logic. Create a canvas that
                        stretches to fit the screen, with inputs for grid dimensions
                        (<code>n</code> width and <code>m</code> height), initial filled
                        cells, and a Regenerate button. Clicking a cell toggles it between
                        filled and empty. A live counter shows the current number of filled
                        cells, and color pickers allow customizing cell colors.
                    </p>
                </div>
            </section>

            <div className="wavy-divider" />

            {/* Step 2 */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">02</span>
                    <h2>The Simulation Loop &amp; Random Selection</h2>
                </div>
                <div className="step-content">
                    <p>
                        Add the simulation heartbeat. A configurable time step controls how
                        often the loop runs. Each tick picks two random cells — if both are
                        the same type (filled or empty), nothing happens. If one is filled
                        and the other empty, we have a valid pair for the next step.
                    </p>
                </div>
            </section>

            <div className="wavy-divider" />

            {/* Step 3 */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">03</span>
                    <h2>Thermodynamics &amp; Energy Calculation</h2>
                </div>
                <div className="step-content">
                    <p>
                        Add the physics. The <code>A-A Interaction Energy</code> defines how
                        strongly filled neighbors attract. For Cach valid pair, calculate{" "}
                        <strong>E1</strong> (current energy of the filled cell) and{" "}
                        <strong>E2</strong> (theoretical energy if it moved to the empty
                        cell&rsquo;s position) by counting filled neighbors.
                    </p>
                </div>
            </section>

            <div className="wavy-divider" />

            {/* Step 4 */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">04</span>
                    <h2>The Monte Carlo Swap</h2>
                </div>
                <div className="step-content">
                    <p>
                        The final probability logic. Using E1, E2, and Temperature (T):
                    </p>
                    <div style={{ display: "flex", justifyContent: "center", margin: "1.5rem 0" }}>
                        <span className="equation-pill">
                            q = exp((E1 − E2) / T) &nbsp;&nbsp;·&nbsp;&nbsp; p = q / (1 + q)
                        </span>
                    </div>
                    <p>
                        Generate a random number — if it&rsquo;s ≤ p, execute the swap:
                        the filled cell becomes empty and the empty cell becomes filled. The
                        canvas redraws to reflect the change.
                    </p>
                </div>
            </section>

            <div className="wavy-divider" />

            {/* Step 5: Scientific Notes */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">05</span>
                    <h2>Scientific Notes</h2>
                </div>
                <div className="step-content">
                    <p>
                        <strong>Melting &amp; Freezing:</strong> At low temperatures, the
                        Boltzmann probability strongly favors energy-lowering swaps, causing
                        atoms to cluster together (freezing/condensation). At high
                        temperatures, randomness dominates and atoms mix freely
                        (melting/boiling).
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
        </div>
    );
}
