import Link from "next/link";

const assignments = [
  {
    week: 1,
    slug: "recit1",
    title: "Monte Carlo Simulation",
    description:
      "Build a 2D Monte Carlo simulation to model atomic diffusion and phase changes using the Boltzmann distribution.",
    status: "active",
    featured: true,
    image: "/images/monte_carlo_card.png",
  },
  {
    week: 2,
    slug: "recit2",
    title: "Grand Canonical MC",
    description:
      "Model gas-liquid phase transitions using the Grand Canonical Ensemble with chemical potential and particle exchange.",
    status: "active",
    featured: true,
    image: "/images/grand_canonical_card.png",
  },
  {
    week: 3,
    slug: "recit3",
    title: "Binary Phase Transformation",
    description:
      "Simulate a binary A/B mixture with vacancies, exploring phase separation, coordination flips, and Glauber dynamics.",
    status: "active",
    featured: true,
    image: "/images/binary_phase_card.png",
  },
  {
    week: 4,
    slug: "recit4",
    title: "2D Particle Diffusion",
    description:
      "Model Brownian motion with Arrhenius kinetics in spatially heterogeneous environments. Explore diffusion barriers and temperature effects.",
    status: "active",
    featured: true,
    image: "/images/kinetics_card.png",
  },
  {
    week: 5,
    slug: "recit5",
    title: "Wulff Construction",
    description:
      "Determine the equilibrium crystal shape from surface energies. Manipulate broken-bond penalties and generate Wulff envelopes.",
    status: "active",
    featured: true,
    image: "/images/wulff_card.png",
  },
  {
    week: 6,
    slug: "recit6",
    title: "Grain Growth",
    description:
      "Simulate curvature-driven grain boundary migration using Monte Carlo Glauber kinetics on a 2D lattice with periodic boundaries.",
    status: "active",
    featured: true,
    image: "/images/grain_growth_card.png",
  },
  {
    week: 7,
    slug: "recit7",
    title: "Power-Voronoi Growth",
    description:
      "Simulate geometric grain coarsening with power-Voronoi tessellation, von Neumann–Mullins kinetics, and Arrhenius mobility.",
    status: "active",
    featured: true,
    image: "/images/power_voronoi_card.png",
  },
];

function StatusBadge({ status }) {
  const labels = {
    active: "Available",
    completed: "Completed",
    upcoming: "Coming Soon",
  };
  return <span className={`card-badge ${status}`}>{labels[status]}</span>;
}

export default function HomePage() {
  return (
    <div className="page-container">
      {/* Hero */}
      <section className="page-hero">
        <h1>
          <span className="highlighter-underline">Kinetics of Materials</span>
        </h1>
        <p className="subtitle">Ahmet&rsquo;s Weekly Assignments · Spring 2026</p>
      </section>

      {/* Assignment Grid */}
      <section className="card-grid" style={{ paddingBottom: "4rem" }}>
        {assignments.map((a) => (
          <Link
            key={a.slug}
            href={`/${a.slug}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <article
              className={`assignment-card ${a.featured ? "featured" : ""}`}
            >
              <div className="card-header">
                <StatusBadge status={a.status} />
                <h3 className="card-title">
                  Week {a.week}: {a.title}
                </h3>
                <p className="card-description">{a.description}</p>
              </div>

              {a.image && (
                <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                  <img
                    src={a.image}
                    alt={a.title}
                    style={{
                      width: "100%",
                      height: "140px",
                      objectFit: "cover",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid rgba(225,226,230,0.5)"
                    }}
                  />
                </div>
              )}

              <div className="card-footer">
                <button className="card-button primary" tabIndex={-1}>
                  Open Assignment →
                </button>
              </div>
            </article>
          </Link>
        ))}

        {/* Placeholder for future weeks */}
        {[5].map((week) => (
          <article
            key={week}
            className="assignment-card"
            style={{ opacity: 0.5, pointerEvents: "none" }}
          >
            <div className="card-header">
              <StatusBadge status="upcoming" />
              <h3 className="card-title">Week {week}</h3>
              <p className="card-description">
                Coming soon...
              </p>
            </div>
            <div className="card-footer">
              <button className="card-button secondary" tabIndex={-1}>
                Locked
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
