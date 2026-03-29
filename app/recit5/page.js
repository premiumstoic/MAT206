import WulffSimulation from "./Simulation";
import CodeBlock from "./CodeBlock";
import Latex from "./Latex";

export const metadata = {
    title: "Week 5: Wulff Construction — MAT206",
    description:
        "Explore the Wulff Construction for a 2D square lattice to determine the equilibrium crystal shape based on surface energies and broken bonds.",
};

export default function Recit5Page() {
    return (
        <div className="reading-column" style={{ padding: "3rem 1.5rem 4rem" }}>

            {/* Title */}
            <div className="journal-title-block">
                <span className="assignment-label">Assignment 05</span>
                <h1>
                    Wulff Construction
                    <br />
                    &amp; Equilibrium Crystal Shape
                </h1>
                <p className="tagline">
                    How surface energies and broken bonds dictate the macroscopic shape of a crystal.
                </p>
            </div>

            {/* Context */}
            <div className="context-callout">
                <h3>Context</h3>
                <p>
                    A crystal in vacuum will naturally adopt a shape that minimizes its total surface free energy. 
                    The <strong>Wulff Construction</strong> provides a geometric method to find this equilibrium shape. 
                    By calculating the surface energy (<Latex>{"\\gamma"}</Latex>) for every crystallographic direction and drawing 
                    planes perpendicular to those directions at a distance proportional to <Latex>{"\\gamma"}</Latex>, the inner envelope 
                    of all those planes defines the equilibrium crystal shape (ECS).
                </p>
            </div>

            <div className="wavy-divider" />

            {/* Step 01 — Broken Bonds */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">01</span>
                    <h2>Broken-Bond Model</h2>
                </div>
                <div className="step-content">
                    <p>
                        In a simple lattice model, the surface energy of a face is proportional to the number of 
                        atomic bonds broken to create that face. We consider two types of square lattice 
                        coordinations:
                    </p>
                    <ul style={{ paddingLeft: "1.5rem", lineHeight: 2, marginTop: "0.75rem" }}>
                        <li>
                            <strong>4-coord (Nearest Neighbors only):</strong> A horizontal or vertical cut breaks 
                            1 bond per lattice spacing. A diagonal cut breaks <Latex>{"\\sqrt{2}"}</Latex> bonds per lattice spacing.
                        </li>
                        <li>
                            <strong>8-coord (Nearest + Next-Nearest Neighbors):</strong> A straight cut breaks more 
                            bonds (3 per lattice spacing), but a diagonal cut breaks a proportionally smaller number 
                            (<Latex>{"3/\\sqrt{2}"}</Latex>).
                        </li>
                    </ul>
                    <p style={{ marginTop: "1rem" }}>
                        The user can specify an arbitrary penalty energy for horizontal (<Latex>{"E_h"}</Latex>), vertical (<Latex>{"E_v"}</Latex>), 
                        and diagonal (<Latex>{"E_d"}</Latex>) bonds. The distance to the bounding crystal facet is then:
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", margin: "1.5rem 0" }}>
                        <span className="equation-pill"><Latex>{"d = m_{hv} \\cdot E_h \\cdot S"}</Latex> &nbsp; (x-axis bounds)</span>
                        <span className="equation-pill"><Latex>{"e = m_{hv} \\cdot E_v \\cdot S"}</Latex> &nbsp; (y-axis bounds)</span>
                        <span className="equation-pill"><Latex>{"r = m_{diag} \\cdot E_d \\cdot S"}</Latex> &nbsp; (diagonal bounds)</span>
                    </div>
                </div>
            </section>

            <div className="wavy-divider" />

            {/* Step 02 — Wulff construction */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">02</span>
                    <h2>The Inner Envelope</h2>
                </div>
                <div className="step-content">
                    <p>
                        The distance values (<Latex>{"d, e, r"}</Latex>) define half-spaces (or allowed "bands"). The crystal exists 
                        in the region where <em>all</em> of these spatial inequalities are satisfied simultaneously:
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", margin: "1.5rem 0" }}>
                        <div style={{ background: "var(--color-card)", padding: "1rem", borderRadius: "10px", boxShadow: "var(--shadow-soft)", textAlign: "center" }}>
                            <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--color-amber)", marginBottom: "4px" }}>Vertical</div>
                            <div><Latex>{"x \\le d"}</Latex> <br/> <Latex>{"x \\ge -d"}</Latex></div>
                        </div>
                        <div style={{ background: "var(--color-card)", padding: "1rem", borderRadius: "10px", boxShadow: "var(--shadow-soft)", textAlign: "center" }}>
                            <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--color-amber)", marginBottom: "4px" }}>Horizontal</div>
                            <div><Latex>{"y \\le e"}</Latex> <br/> <Latex>{"y \\ge -e"}</Latex></div>
                        </div>
                        <div style={{ background: "var(--color-card)", padding: "1rem", borderRadius: "10px", boxShadow: "var(--shadow-soft)", textAlign: "center" }}>
                            <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--color-amber)", marginBottom: "4px" }}>Diagonal 1</div>
                            <div><Latex>{"x + y \\le r"}</Latex> <br/> <Latex>{"x + y \\ge -r"}</Latex></div>
                        </div>
                        <div style={{ background: "var(--color-card)", padding: "1rem", borderRadius: "10px", boxShadow: "var(--shadow-soft)", textAlign: "center" }}>
                            <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--color-amber)", marginBottom: "4px" }}>Diagonal 2</div>
                            <div><Latex>{"x - y \\le r"}</Latex> <br/> <Latex>{"x - y \\ge -r"}</Latex></div>
                        </div>
                    </div>
                    <p>
                        The resulting geometric intersection of these 8 inequalities forms a convex polygon known 
                        as the equilibrium shape.
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
                    Adjust the interfacial energies and coordination numbers below. The crystal shape (solid orange) 
                    and the allowed half-spaces (transparent blue bands) update instantly.
                </p>
                
                <WulffSimulation />
            </section>

            <div className="wavy-divider" />

            {/* Exploration Questions */}
            <section>
                <h2 className="explore-section-title">🔬 Exploration Questions</h2>
                <p className="explore-subtitle">
                    Use the sandbox above to probe how thermodynamic variables shape the crystal.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                    <div className="question-card">
                        <span className="q-badge">Question 1</span>
                        <p className="q-text">Do 4 and 8 coordination have the same shape? If not, why?</p>
                        <div className="q-answer">
                            <p>No, they have different shapes (assuming identical generic energy inputs like 1.0). In 4-coordination, the diagonal cuts break relatively more bonds (<Latex>{"m_{diag} \\approx 1.414"}</Latex> vs <Latex>{"m_{hv} = 1"}</Latex>). Because diagonals cost more energy, they get "pushed" further out from the origin, leaving a square shape dominated by horizontal and vertical facets.</p>
                            <p style={{ marginTop: "0.75rem" }}>In 8-coordination, the penalty ratio flips (<Latex>{"m_{hv} = 3"}</Latex> vs <Latex>{"m_{diag} \\approx 2.12"}</Latex>). The diagonal facets become relatively cheaper to form, so they sit closer to the origin, carving off the corners of the square and creating an octagon.</p>
                        </div>
                    </div>

                    <div className="question-card">
                        <span className="q-badge">Question 2</span>
                        <p className="q-text">For E<sub>h</sub> = E<sub>v</sub> = E<sub>d</sub>, why does the shape still not become a perfect circle?</p>
                        <div className="q-answer">
                            <p>The Wulff construction draws <em>flat planes</em> perpendicular to defined crystallographic vectors. We are only evaluating three discrete sets of planes (horizontal, vertical, and 45-degree diagonal). Thus we get an intersection of straight lines (a polygon), not a continuous set of tangent lines from all possible angles. A true circle requires evaluating an infinite number of crystal orientations.</p>
                        </div>
                    </div>

                    <div className="question-card">
                        <span className="q-badge">Question 3</span>
                        <p className="q-text">What happens if you give a very big energy to one type of interface?</p>
                        <div className="q-answer">
                            <p>If you give a very high energy to, say, <Latex>{"E_d"}</Latex> (the diagonal planes), the distance <Latex>{"r"}</Latex> becomes very large. The diagonal bands map so far away from the origin that they no longer intersect the inner envelope formed by the horizontal and vertical planes. That specific facet "grows out" of existence, and you get a perfect square.</p>
                        </div>
                    </div>

                    <div className="question-card">
                        <span className="q-badge">Question 4</span>
                        <p className="q-text">Does lowering energy increase or decrease the presence of a specific direction?</p>
                        <div className="q-answer">
                            <p>Lowering the energy of a specific direction means the distance vector for that facet becomes shorter (it moves <em>closer</em> to the origin). Because the crystal shape is defined by the <em>inner</em> envelope, planes that are closer to the origin cut off the planes that are further away. Therefore, lowering the energy <strong>increases</strong> the presence (surface area) of that specific facet in the final equilibrium shape.</p>
                        </div>
                    </div>

                    <div className="question-card">
                        <span className="q-badge">Question 5</span>
                        <p className="q-text">Does increasing an interfacial energy make that orientation more or less favorable in the final equilibrium shape?</p>
                        <div className="q-answer">
                            <p>Increasing the energy makes the orientation <strong>less favorable</strong>. The distance to that plane grows, pushing it outward. If the energy is increased enough, the plane will be entirely superseded by other, lower-energy planes and will disappear completely from the crystal habit.</p>
                        </div>
                    </div>

                </div>
            </section>

            <div className="wavy-divider" />

            {/* Code */}
            <section className="step-block">
                <div className="step-header">
                    <span className="step-number">03</span>
                    <h2>Under the Hood: Polygon Intersection</h2>
                </div>
                <div className="step-content">
                    <p>
                        Drawing the semi-transparent allowed bands is trivial. But drawing the solid inner "Wulff shape" 
                        requires finding the geometric intersection of 8 distinct half-spaces. The simplest algorithm 
                        in 2D space is to find all <Latex>{"O(N^2)"}</Latex> hyper-plane intersections, and simply filter out any 
                        point that violates any inequality:
                    </p>
                    <CodeBlock code={`// 1. Find all pair-wise line intersections (8C2 = 28 points)
const points = [];
for (let i = 0; i < lines.length; i++) {
    for (let j = i + 1; j < lines.length; j++) {
        const pt = getIntersection(lines[i], lines[j]);
        if (pt) points.push(pt);
    }
}

// 2. Filter: Keep only points satisfying ALL 8 inequalities
const validPoints = points.filter(pt => {
    for (const ineq of inequalities) {
        if (!satisfiesInequality(pt, ineq)) return false;
    }
    return true;
});

// 3. Sort points radially to draw a convex polygon
validPoints.sort((a, b) => Math.atan2(a.y, a.x) - Math.atan2(b.y, b.x));

// 4. Draw!
ctx.beginPath();
validPoints.forEach((pt, i) => i===0 ? ctx.moveTo(pt.x,pt.y) : ctx.lineTo(pt.x,pt.y));
ctx.fill();`} />
                </div>
            </section>

        </div>
    );
}
