import "./globals.css";

export const metadata = {
  title: "MAT206 — Kinetics of Materials",
  description:
    "Weekly assignments for the Kinetics of Materials course. Interactive simulations and scientific explorations.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Background Marginalia Sketches */}
        <div className="marginalia-container" aria-hidden="true">
          {/* Top-right: Energy landscape sketch */}
          <svg
            style={{
              position: "absolute",
              top: "80px",
              right: "-50px",
              width: "380px",
              height: "380px",
              color: "var(--color-pencil)",
              transform: "rotate(12deg)",
            }}
            fill="none"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 100 Q 60 40 100 100 T 180 100 M 40 120 Q 80 60 120 120 T 180 120"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="40" cy="80" r="3" fill="currentColor" />
            <circle cx="60" cy="70" r="3" fill="currentColor" />
            <circle cx="80" cy="85" r="3" fill="currentColor" />
            <circle cx="100" cy="65" r="3" fill="currentColor" />
          </svg>

          {/* Bottom-left: Lattice structure */}
          <svg
            style={{
              position: "absolute",
              bottom: "0",
              left: "-20px",
              width: "500px",
              height: "500px",
              color: "var(--color-pencil)",
            }}
            fill="none"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M40 40 L 160 40 L 160 160 L 40 160 Z M 40 40 L 160 160 M 160 40 L 40 160"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <circle cx="40" cy="40" r="4" fill="currentColor" />
            <circle cx="160" cy="40" r="4" fill="currentColor" />
            <circle cx="160" cy="160" r="4" fill="currentColor" />
            <circle cx="40" cy="160" r="4" fill="currentColor" />
            <circle cx="100" cy="100" r="4" fill="currentColor" />
          </svg>
        </div>

        {/* Main Content */}
        <div style={{ position: "relative", zIndex: 10, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <header className="site-header">
            <div className="site-header-inner">
              <a href="/" style={{ textDecoration: "none" }}>
                <div className="site-logo">
                  <div className="site-logo-icon">⚛️</div>
                  <span className="site-logo-text">MAT206</span>
                </div>
              </a>
              <nav className="site-nav">
                <a href="/" className="active">
                  Assignments
                </a>
              </nav>
            </div>
          </header>

          {/* Page Content */}
          <main style={{ flex: 1 }}>{children}</main>

          {/* Footer */}
          <footer className="site-footer">
            MAT206 — Kinetics of Materials · Spring 2026
          </footer>
        </div>
      </body>
    </html>
  );
}
