"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ── Constants ─────────────────────────────────────────────────────────────
const kB = 8.617333262145e-5; // eV/K

const PARTICLE_COLORS = [
  "#E06C75","#61AFEF","#98C379","#D19A66","#C678DD","#56B6C2",
  "#E5C07B","#BE5046","#7EC8E3","#A3BE8C","#EBCB8B","#B48EAD",
  "#88C0D0","#BF616A","#D08770","#5E81AC","#8FBCBB","#A3507A",
  "#4C9A8F","#CF9E6E","#6C8EBF","#D4A5A5","#9ACD32","#FF7F50",
  "#87CEEB","#DDA0DD","#F0E68C","#20B2AA","#FF6347","#778899",
];

// ── Canvas Size ───────────────────────────────────────────────────────────
const CANVAS_W = 800;
const CANVAS_H = 600;

export default function OstwaldSimulation() {
  // ── Parameters ────────────────────────────────────────────────────────
  const [nParticles, setNParticles] = useState(200);
  const [rMin, setRMin] = useState(2);
  const [rMax, setRMax] = useState(15);
  const [rThreshold, setRThreshold] = useState(1.0);
  const [M0, setM0] = useState(500);
  const [Q, setQ] = useState(0.5);
  const [temperature, setTemperature] = useState(1000);
  const [dt, setDt] = useState(0.5);
  const [brownian, setBrownian] = useState(true);

  // ── Simulation State ──────────────────────────────────────────────────
  const [running, setRunning] = useState(false);
  const [statsDisplay, setStatsDisplay] = useState({
    time: "0.0", count: 0, avgR: "0.0", Rc: "0.0", M: "0.00e+0",
  });

  const canvasRef = useRef(null);
  const plotAvgRef = useRef(null);
  const plotRcRef = useRef(null);
  const particlesRef = useRef([]);
  const simTimeRef = useRef(0);
  const historyRef = useRef({ time: [], avgR: [], Rc: [], count: [] });
  const runRef = useRef(false);
  const rafRef = useRef(null);

  // ── Initialization ────────────────────────────────────────────────────
  const doInit = useCallback(() => {
    const particles = [];
    for (let i = 0; i < nParticles; i++) {
      const r = rMin + Math.random() * (rMax - rMin);
      particles.push({
        x: r + Math.random() * (CANVAS_W - 2 * r),
        y: r + Math.random() * (CANVAS_H - 2 * r),
        r,
        color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
        active: true,
      });
    }
    particlesRef.current = particles;
    simTimeRef.current = 0;
    historyRef.current = { time: [], avgR: [], Rc: [], count: [] };
    updateStats();
    draw();
    drawPlots();
  }, [nParticles, rMin, rMax]);

  // ── Draw ──────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    const W = cvs.width, H = cvs.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#1E222A";
    ctx.fillRect(0, 0, W, H);

    const particles = particlesRef.current;
    for (const p of particles) {
      if (!p.active) continue;
      // Glossy particle
      const grad = ctx.createRadialGradient(
        p.x - p.r * 0.3, p.y - p.r * 0.3, p.r * 0.1,
        p.x, p.y, p.r
      );
      grad.addColorStop(0, "rgba(255,255,255,0.35)");
      grad.addColorStop(0.5, p.color);
      grad.addColorStop(1, "rgba(0,0,0,0.2)");

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.strokeStyle = "rgba(0,0,0,0.25)";
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }, []);

  // ── Update Stats ──────────────────────────────────────────────────────
  const updateStats = useCallback(() => {
    const active = particlesRef.current.filter(p => p.active);
    const count = active.length;
    if (count === 0) {
      setStatsDisplay({ time: simTimeRef.current.toFixed(1), count: 0, avgR: "—", Rc: "—", M: "—" });
      return;
    }
    const avgR = active.reduce((s, p) => s + p.r, 0) / count;
    const sumInvR = active.reduce((s, p) => s + 1 / p.r, 0);
    const Rc = count / sumInvR;
    const Mob = M0 * Math.exp(-Q / (kB * temperature));

    const hist = historyRef.current;
    hist.time.push(simTimeRef.current);
    hist.avgR.push(avgR);
    hist.Rc.push(Rc);
    hist.count.push(count);
    if (hist.time.length > 500) { hist.time.shift(); hist.avgR.shift(); hist.Rc.shift(); hist.count.shift(); }

    setStatsDisplay({
      time: simTimeRef.current.toFixed(1),
      count,
      avgR: avgR.toFixed(2),
      Rc: Rc.toFixed(2),
      M: Mob.toExponential(2),
    });
  }, [M0, Q, temperature]);

  // ── Plot Helper ───────────────────────────────────────────────────────
  const drawSinglePlot = useCallback((cvs, vals1, color1, vals2, color2) => {
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    const W = cvs.width, H = cvs.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#2C313A";
    ctx.fillRect(0, 0, W, H);

    if (vals1.length < 2) return;
    const all = [...vals1, ...(vals2 || [])];
    const mn = Math.min(...all), mx = Math.max(...all);
    const rng = mx - mn || 1;

    function drawLine(vals, color) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < vals.length; i++) {
        const x = (i / (vals.length - 1)) * W;
        const y = H - ((vals[i] - mn) / rng) * (H - 8) - 4;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    drawLine(vals1, color1);
    if (vals2 && vals2.length > 1) drawLine(vals2, color2);
  }, []);

  const drawPlots = useCallback(() => {
    const h = historyRef.current;
    drawSinglePlot(plotAvgRef.current, h.avgR, "#98c379", h.Rc, "#e5c07b");
    drawSinglePlot(plotRcRef.current, h.count, "#e06c75", null, null);
  }, [drawSinglePlot]);

  // ── Simulation Step ───────────────────────────────────────────────────
  const simStep = useCallback(() => {
    const particles = particlesRef.current;
    const active = particles.filter(p => p.active);
    if (active.length <= 1) return;

    const Mob = M0 * Math.exp(-Q / (kB * temperature));

    // Number of substeps — adaptive based on smallest particle
    const rSmallest = Math.min(...active.map(p => p.r));
    const nSub = Math.max(10, Math.ceil(dt * Mob / (rSmallest * rSmallest) * 2));
    const dtSub = dt / nSub;

    for (let sub = 0; sub < nSub; sub++) {
      const alive = particles.filter(p => p.active);
      if (alive.length <= 1) break;

      // Compute critical radius
      const sumInvR = alive.reduce((s, p) => s + 1 / p.r, 0);
      const Rc = alive.length / sumInvR;

      // Update radii
      for (const p of alive) {
        const dr = dtSub * (Mob / (p.r * p.r)) * (p.r / Rc - 1);
        p.r += dr;
        if (p.r < rThreshold) {
          p.active = false;
        }
      }
    }

    // Brownian jiggle (cosmetic only)
    if (brownian) {
      for (const p of particles) {
        if (!p.active) continue;
        const jitter = 0.3;
        p.x += (Math.random() - 0.5) * jitter;
        p.y += (Math.random() - 0.5) * jitter;
        // Keep inside bounds
        p.x = Math.max(p.r, Math.min(CANVAS_W - p.r, p.x));
        p.y = Math.max(p.r, Math.min(CANVAS_H - p.r, p.y));
      }
    }

    simTimeRef.current += dt;
  }, [M0, Q, temperature, dt, rThreshold, brownian]);

  // ── Animation Loop ────────────────────────────────────────────────────
  useEffect(() => {
    if (running) {
      runRef.current = true;
      const loop = () => {
        if (!runRef.current) return;
        simStep();
        updateStats();
        draw();
        drawPlots();
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    } else {
      runRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
    return () => {
      runRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [running, simStep, updateStats, draw, drawPlots]);

  // ── Initial mount ─────────────────────────────────────────────────────
  useEffect(() => {
    doInit();
  }, [doInit]);

  // ── Styles ────────────────────────────────────────────────────────────
  const panelBorder = "1px solid var(--color-pencil)";
  const panelRadius = "10px";
  const panelPad = "1rem 1.25rem";
  const panelShadow = "0 1px 4px rgba(0,0,0,0.06)";

  const cardStyle = { border: panelBorder, borderRadius: panelRadius, padding: panelPad, background: "white", boxShadow: panelShadow };
  const legendStyle = { font: "700 0.7rem var(--font-sans)", color: "var(--color-amber)", padding: "0 6px", textTransform: "uppercase", letterSpacing: "0.06em" };
  const ctrlGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: "1rem", rowGap: "0.35rem" };
  const lblStyle = { display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 6, fontSize: "0.68rem", fontWeight: 700, color: "var(--color-secondary)", textTransform: "uppercase", whiteSpace: "nowrap" };
  const inputStyle = { fontFamily: "var(--font-mono)", fontSize: "0.78rem", padding: "3px 6px", border: "1px solid var(--color-pencil)", borderRadius: 5, background: "var(--color-cream)", color: "var(--color-charcoal)", width: "64px", textAlign: "right" };
  const btnStyle = { fontFamily: "var(--font-mono)", fontSize: "0.8rem", fontWeight: 700, padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer", transition: "all 0.15s ease" };

  return (
    <div style={{
      border: panelBorder,
      borderRadius: "14px",
      background: "var(--color-cream)",
      boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
      overflow: "hidden",
    }}>

      {/* ─── Dashboard Top: Two Equal Columns ─── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        alignItems: "stretch",
        gap: 0,
      }}>

        {/* ══ Left Column: Controls ══ */}
        <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem", borderRight: panelBorder }}>

          {/* Actions */}
          <fieldset style={{ ...cardStyle, margin: 0 }}>
            <legend style={legendStyle}>🎮 Actions</legend>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.25rem" }}>
              <button onClick={() => setRunning(r => !r)} style={{ ...btnStyle, background: running ? "#E06C75" : "var(--color-amber)", color: "white", flex: 1 }}>
                {running ? "⏸ Pause" : "▶ Start"}
              </button>
              <button onClick={() => { setRunning(false); doInit(); }} style={{ ...btnStyle, background: "white", color: "var(--color-charcoal)", border: panelBorder, flex: 1 }}>
                🔄 Reset
              </button>
            </div>
          </fieldset>

          {/* Simulation Params */}
          <fieldset style={{ ...cardStyle, margin: 0, flexGrow: 1 }}>
            <legend style={legendStyle}>🔬 Parameters</legend>
            <div style={{ ...ctrlGrid, marginTop: "0.35rem" }}>
              <label style={lblStyle}>N <input type="number" min="2" max="2000" value={nParticles} onChange={e => setNParticles(Number(e.target.value))} style={inputStyle} /></label>
              <label style={lblStyle}>T (K) <input type="number" min="1" value={temperature} onChange={e => setTemperature(Number(e.target.value))} style={inputStyle} /></label>
              <label style={lblStyle}>R min <input type="number" step="0.5" min="0.5" value={rMin} onChange={e => setRMin(Number(e.target.value))} style={inputStyle} /></label>
              <label style={lblStyle}>R max <input type="number" step="1" min="1" value={rMax} onChange={e => setRMax(Number(e.target.value))} style={inputStyle} /></label>
              <label style={lblStyle}>R threshold <input type="number" step="0.1" min="0.1" value={rThreshold} onChange={e => setRThreshold(Number(e.target.value))} style={inputStyle} /></label>
              <label style={lblStyle}>M₀ <input type="number" value={M0} onChange={e => setM0(Number(e.target.value))} style={inputStyle} /></label>
              <label style={lblStyle}>Q (eV) <input type="number" step="0.1" value={Q} onChange={e => setQ(Number(e.target.value))} style={inputStyle} /></label>
              <label style={lblStyle}>dt <input type="number" step="0.1" min="0.01" value={dt} onChange={e => setDt(Number(e.target.value))} style={inputStyle} /></label>
            </div>
            <label style={{ ...lblStyle, marginTop: "0.5rem", justifyContent: "flex-start", gap: 8 }}>
              <input type="checkbox" checked={brownian} onChange={e => setBrownian(e.target.checked)} style={{ accentColor: "var(--color-amber)" }} />
              Brownian Jiggle
            </label>
          </fieldset>
        </div>

        {/* ══ Right Column: Statistics & Plots ══ */}
        <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>

          <fieldset style={{ ...cardStyle, margin: 0, flexGrow: 1, display: "flex", flexDirection: "column" }}>
            <legend style={legendStyle}>📊 Live Statistics</legend>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem 1.5rem", marginTop: "0.35rem" }}>
              <div style={{ fontSize: "0.78rem", color: "var(--color-secondary)" }}>Time <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--color-charcoal)", fontFamily: "var(--font-mono)" }}>{statsDisplay.time}<span style={{ fontSize: "0.7rem", fontWeight: 500 }}> s</span></div></div>
              <div style={{ fontSize: "0.78rem", color: "var(--color-secondary)" }}>Active Particles <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--color-charcoal)", fontFamily: "var(--font-mono)" }}>{statsDisplay.count}</div></div>
              <div style={{ fontSize: "0.78rem", color: "var(--color-secondary)" }}>Avg Radius <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--color-charcoal)", fontFamily: "var(--font-mono)" }}>{statsDisplay.avgR}<span style={{ fontSize: "0.7rem", fontWeight: 500 }}> px</span></div></div>
              <div style={{ fontSize: "0.78rem", color: "var(--color-secondary)" }}>Critical R<sub>c</sub> <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--color-charcoal)", fontFamily: "var(--font-mono)" }}>{statsDisplay.Rc}<span style={{ fontSize: "0.7rem", fontWeight: 500 }}> px</span></div></div>
            </div>

            <div style={{ fontSize: "0.65rem", marginTop: "0.5rem", fontFamily: "var(--font-mono)", color: "var(--color-secondary)", borderTop: "1px solid var(--color-pencil)", paddingTop: "0.4rem" }}>
              M = {statsDisplay.M}
            </div>
          </fieldset>

          {/* Plots */}
          <fieldset style={{ ...cardStyle, margin: 0, flexGrow: 1, display: "flex", flexDirection: "column" }}>
            <legend style={legendStyle}>📈 Live Plots</legend>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", flexGrow: 1, marginTop: "0.25rem" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.62rem", fontWeight: 700, color: "var(--color-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>
                  <span style={{ color: "#98c379" }}>■</span> Avg R &nbsp; <span style={{ color: "#e5c07b" }}>■</span> R<sub>c</sub>
                </div>
                <canvas ref={plotAvgRef} width="400" height="100" style={{ width: "100%", height: "100%", minHeight: 80, borderRadius: 6, display: "block" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.62rem", fontWeight: 700, color: "var(--color-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>Particle Count</div>
                <canvas ref={plotRcRef} width="400" height="100" style={{ width: "100%", height: "100%", minHeight: 80, borderRadius: 6, display: "block" }} />
              </div>
            </div>
          </fieldset>
        </div>
      </div>

      {/* ─── Full-Width Canvas ─── */}
      <div style={{ borderTop: panelBorder, background: "#1E222A" }}>
        <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} style={{ display: "block", width: "100%" }} />
        <div style={{
          textAlign: "center",
          padding: "0.5rem",
          fontSize: "0.75rem",
          fontStyle: "italic",
          fontFamily: "var(--font-serif)",
          color: "var(--color-secondary)",
          background: "var(--color-cream)",
          borderTop: panelBorder,
        }}>
          Ostwald Ripening · {particlesRef.current ? particlesRef.current.filter(p => p.active).length : nParticles} Particles
        </div>
      </div>
    </div>
  );
}
