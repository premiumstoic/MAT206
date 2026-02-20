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
        {[2, 3, 4].map((week) => (
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
