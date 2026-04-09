"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ── Constants ─────────────────────────────────────────────────────────────
const R_GAS = 8.31446261815324; // J/(mol·K)

// ── Glossy Color Palette ──────────────────────────────────────────────────
const GRAIN_COLORS = [
  "#E06C75","#61AFEF","#98C379","#D19A66","#C678DD","#56B6C2",
  "#E5C07B","#BE5046","#7EC8E3","#A3BE8C","#EBCB8B","#B48EAD",
  "#88C0D0","#BF616A","#D08770","#5E81AC","#8FBCBB","#A3507A",
  "#4C9A8F","#CF9E6E","#6C8EBF","#D4A5A5","#9ACD32","#FF7F50",
  "#87CEEB","#DDA0DD","#F0E68C","#20B2AA","#FF6347","#778899",
];

// ── Sutherland–Hodgman Polygon Clipping ───────────────────────────────────
function clipPolygon(subjectPoly, cx, cy, cw, sx, sy) {
  // Clip subjectPoly by the half-plane:
  //   pow_dist to (sx,sy,sw=cw) <= pow_dist to clip seed (cx,cy,0-weight)
  //   Actually we clip by: all points closer (power-distance) to the "subject" seed
  //   The bisector of two power-Voronoi seeds (s1,w1) and (s2,w2) is:
  //   2(s2x-s1x)x + 2(s2y-s1y)y = (s2x²+s2y² - w2) - (s1x²+s1y² - w1)
  //   A point is on the s1 side if: 2(s2x-s1x)x + 2(s2y-s1y)y <= RHS
  const a = 2 * (cx - sx);
  const b = 2 * (cy - sy);
  const rhs = (cx * cx + cy * cy - 0) - (sx * sx + sy * sy - cw);
  // cw is the weight of the subject seed; clipping seed has weight 0 in general...
  // Actually let me redo this properly for the general case.
  // We'll call this from the main loop with proper args.
  // For now, this is a placeholder structure.
  if (subjectPoly.length === 0) return [];

  const out = [];
  for (let i = 0; i < subjectPoly.length; i++) {
    const cur = subjectPoly[i];
    const nxt = subjectPoly[(i + 1) % subjectPoly.length];
    const curVal = a * cur[0] + b * cur[1] - rhs;
    const nxtVal = a * nxt[0] + b * nxt[1] - rhs;
    if (curVal <= 0) {
      out.push(cur);
      if (nxtVal > 0) {
        const t = curVal / (curVal - nxtVal);
        out.push([cur[0] + t * (nxt[0] - cur[0]), cur[1] + t * (nxt[1] - cur[1])]);
      }
    } else if (nxtVal <= 0) {
      const t = curVal / (curVal - nxtVal);
      out.push([cur[0] + t * (nxt[0] - cur[0]), cur[1] + t * (nxt[1] - cur[1])]);
    }
  }
  return out;
}

/** Clip polygon by power-Voronoi bisector between seed_i and seed_j.
 *  Keeps the side belonging to seed_i.
 *  Power distance: d_pow(p, s) = |p - s|^2 - w_s
 *  Bisector: 2(xj-xi)*x + 2(yj-yi)*y = (xj²+yj²-wj) - (xi²+yi²-wi)
 *  Points on seed_i's side satisfy: LHS <= RHS
 */
function clipByBisector(poly, xi, yi, wi, xj, yj, wj) {
  if (poly.length === 0) return [];
  const a = 2 * (xj - xi);
  const b = 2 * (yj - yi);
  const rhs = (xj * xj + yj * yj - wj) - (xi * xi + yi * yi - wi);

  const out = [];
  for (let k = 0; k < poly.length; k++) {
    const cur = poly[k];
    const nxt = poly[(k + 1) % poly.length];
    const cv = a * cur[0] + b * cur[1] - rhs;
    const nv = a * nxt[0] + b * nxt[1] - rhs;
    if (cv <= 0) {
      out.push(cur);
      if (nv > 0) {
        const t = cv / (cv - nv);
        out.push([cur[0] + t * (nxt[0] - cur[0]), cur[1] + t * (nxt[1] - cur[1])]);
      }
    } else if (nv <= 0) {
      const t = cv / (cv - nv);
      out.push([cur[0] + t * (nxt[0] - cur[0]), cur[1] + t * (nxt[1] - cur[1])]);
    }
  }
  return out;
}

/** Compute the polygon area (signed, but we take abs). */
function polyArea(poly) {
  let area = 0;
  for (let i = 0; i < poly.length; i++) {
    const j = (i + 1) % poly.length;
    area += poly[i][0] * poly[j][1];
    area -= poly[j][0] * poly[i][1];
  }
  return Math.abs(area) / 2;
}

/** Compute the centroid of a polygon. */
function polyCentroid(poly) {
  let cx = 0, cy = 0, area = 0;
  for (let i = 0; i < poly.length; i++) {
    const j = (i + 1) % poly.length;
    const cross = poly[i][0] * poly[j][1] - poly[j][0] * poly[i][1];
    cx += (poly[i][0] + poly[j][0]) * cross;
    cy += (poly[i][1] + poly[j][1]) * cross;
    area += cross;
  }
  area /= 2;
  if (Math.abs(area) < 1e-12) return [0, 0];
  cx /= (6 * area);
  cy /= (6 * area);
  return [cx, cy];
}

/** Compute the Power-Voronoi cell for seed i, clipped to domain rect. */
function computeCell(seeds, i, W, H) {
  let poly = [[0, 0], [W, 0], [W, H], [0, H]];
  const si = seeds[i];
  for (let j = 0; j < seeds.length; j++) {
    if (j === i || !seeds[j].active) continue;
    poly = clipByBisector(poly, si.x, si.y, si.w, seeds[j].x, seeds[j].y, seeds[j].w);
    if (poly.length === 0) return [];
  }
  return poly;
}

// ── Seed Initialization ──────────────────────────────────────────────────
function initSeeds(nSeeds, W, H, spreadPct) {
  const relSpread = spreadPct / 100;
  const meanCellArea = (W * H) / nSeeds;

  // Grid-like jittered placement
  const cols = Math.round(Math.sqrt(nSeeds * (W / H)));
  const rows = Math.round(nSeeds / cols);
  const dx = W / cols;
  const dy = H / rows;

  const seeds = [];
  let id = 0;
  for (let r = 0; r < rows && seeds.length < nSeeds; r++) {
    for (let c = 0; c < cols && seeds.length < nSeeds; c++) {
      const jx = (Math.random() - 0.5) * dx * 0.6;
      const jy = (Math.random() - 0.5) * dy * 0.6;
      const x = Math.max(1, Math.min(W - 1, dx * (c + 0.5) + jx));
      const y = Math.max(1, Math.min(H - 1, dy * (r + 0.5) + jy));
      const rr = Math.random() * 2 - 1; // -1 to 1
      const w = rr * relSpread * meanCellArea;
      seeds.push({
        x, y, w,
        color: GRAIN_COLORS[id % GRAIN_COLORS.length],
        active: true,
        id: id++,
      });
    }
  }
  // Fill remaining if grid didn't produce enough
  while (seeds.length < nSeeds) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const rr = Math.random() * 2 - 1;
    const w = rr * relSpread * meanCellArea;
    seeds.push({
      x, y, w,
      color: GRAIN_COLORS[seeds.length % GRAIN_COLORS.length],
      active: true,
      id: id++,
    });
  }
  return seeds;
}

// ── Component ─────────────────────────────────────────────────────────────
export default function PowerVoronoiSimulation() {
  // Parameters
  const [nSeeds, setNSeeds] = useState(300);
  const [spreadPct, setSpreadPct] = useState(30);
  const [temperature, setTemperature] = useState(1173);
  const [Qm, setQm] = useState(200);
  const [gamma, setGamma] = useState(0.7);
  const [M0, setM0] = useState(1e-4);
  const [umPerPx, setUmPerPx] = useState(1.0);
  const [dt, setDt] = useState(1.0);
  const [recomputeN, setRecomputeN] = useState(10);
  const [epsW, setEpsW] = useState(1.0);
  const [minArea, setMinArea] = useState(5.0);
  const [maxSeeds, setMaxSeeds] = useState(1000);

  const [running, setRunning] = useState(false);

  // Refs
  const canvasRef = useRef(null);
  const plotAreaRef = useRef(null);
  const plotCountRef = useRef(null);
  const seedsRef = useRef(null);
  const runningRef = useRef(false);
  const rafRef = useRef(null);
  const simTimeRef = useRef(0);
  const stepRef = useRef(0);
  const calibCRef = useRef(1);
  const statsRef = useRef({ grainCount: 0, meanArea: 0, meanSides: 0, K: 0, M: 0, C: 1 });
  const historyRef = useRef({ time: [], meanArea: [], count: [] });

  // Params ref for animation loop
  const paramsRef = useRef({});
  useEffect(() => {
    paramsRef.current = { nSeeds, spreadPct, temperature, Qm, gamma, M0, umPerPx, dt, recomputeN, epsW, minArea, maxSeeds };
  }, [nSeeds, spreadPct, temperature, Qm, gamma, M0, umPerPx, dt, recomputeN, epsW, minArea, maxSeeds]);

  // ── Canvas Size ───────────────────────────────────────────────────────
  const getCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return { W: 600, H: 400 };
    return { W: canvas.width, H: canvas.height };
  }, []);

  // ── Drawing ─────────────────────────────────────────────────────────
  const drawGrains = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !seedsRef.current) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const seeds = seedsRef.current;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#1E222A";
    ctx.fillRect(0, 0, W, H);

    for (let i = 0; i < seeds.length; i++) {
      if (!seeds[i].active) continue;
      const poly = computeCell(seeds, i, W, H);
      if (poly.length < 3) continue;

      // Fill
      ctx.fillStyle = seeds[i].color;
      ctx.beginPath();
      ctx.moveTo(poly[0][0], poly[0][1]);
      for (let k = 1; k < poly.length; k++) ctx.lineTo(poly[k][0], poly[k][1]);
      ctx.closePath();
      ctx.fill();

      // Border
      ctx.strokeStyle = "rgba(0,0,0,0.4)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Number of sides label at centroid
      const [cx, cy] = polyCentroid(poly);
      const nSides = poly.length;
      ctx.font = "bold 10px var(--font-mono, monospace)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.strokeText(nSides, cx, cy);
      ctx.fillStyle = "#1E222A";
      ctx.fillText(nSides, cx, cy);
    }
  }, []);

  const drawPlots = useCallback(() => {
    const h = historyRef.current;
    // Mean Area plot
    const c1 = plotAreaRef.current;
    if (c1 && h.time.length > 1) {
      const ctx = c1.getContext("2d");
      const W = c1.width, H = c1.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "rgba(30,34,42,0.6)";
      ctx.fillRect(0, 0, W, H);
      const vals = h.meanArea;
      const mn = Math.min(...vals), mx = Math.max(...vals), rng = mx - mn || 1;
      ctx.strokeStyle = "#98C379";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < vals.length; i++) {
        const x = (i / (vals.length - 1)) * W;
        const y = H - ((vals[i] - mn) / rng) * (H - 10) - 5;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "10px monospace";
      ctx.fillText("Mean Area (µm²)", 4, 12);
    }
    // Count plot
    const c2 = plotCountRef.current;
    if (c2 && h.time.length > 1) {
      const ctx = c2.getContext("2d");
      const W = c2.width, H = c2.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "rgba(30,34,42,0.6)";
      ctx.fillRect(0, 0, W, H);
      const vals = h.count;
      const mn = Math.min(...vals), mx = Math.max(...vals), rng = mx - mn || 1;
      ctx.strokeStyle = "#E06C75";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < vals.length; i++) {
        const x = (i / (vals.length - 1)) * W;
        const y = H - ((vals[i] - mn) / rng) * (H - 10) - 5;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "10px monospace";
      ctx.fillText("Grain Count", 4, 12);
    }
  }, []);

  // ── Stats Update ────────────────────────────────────────────────────
  const [statsDisplay, setStatsDisplay] = useState({ time: "0.0", count: 0, meanArea: "0.0", meanSides: "0.0", K: "0", M: "0", C: "0" });

  const updateStats = useCallback(() => {
    const seeds = seedsRef.current;
    if (!seeds) return;
    const { W, H } = getCanvasSize();
    const { umPerPx: um } = paramsRef.current;

    const active = seeds.filter(s => s.active);
    const count = active.length;
    if (count === 0) return;

    let totalSides = 0;
    let totalArea = 0;
    for (const s of active) {
      const poly = computeCell(seeds, seeds.indexOf(s), W, H);
      totalSides += poly.length;
      totalArea += polyArea(poly);
    }
    const meanAreaPx = totalArea / count;
    const meanAreaUm = meanAreaPx * um * um;
    const meanSides = totalSides / count;

    const s = statsRef.current;
    s.grainCount = count;
    s.meanArea = meanAreaUm;
    s.meanSides = meanSides;

    const h = historyRef.current;
    h.time.push(simTimeRef.current);
    h.meanArea.push(meanAreaUm);
    h.count.push(count);
    if (h.time.length > 500) { h.time.shift(); h.meanArea.shift(); h.count.shift(); }

    setStatsDisplay({
      time: simTimeRef.current.toFixed(1),
      count,
      meanArea: meanAreaUm.toFixed(1),
      meanSides: meanSides.toFixed(2),
      K: s.K.toExponential(2),
      M: s.M.toExponential(2),
      C: calibCRef.current.toExponential(2),
    });
  }, [getCanvasSize]);

  // ── Init ────────────────────────────────────────────────────────────
  const doInit = useCallback((spread) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    const w = parent.clientWidth;
    const h = Math.round(w * 0.6);
    canvas.width = w;
    canvas.height = h;

    const { nSeeds: n } = paramsRef.current;
    const sp = spread !== undefined ? spread : paramsRef.current.spreadPct;
    seedsRef.current = initSeeds(Math.min(n, paramsRef.current.maxSeeds), w, h, sp);
    simTimeRef.current = 0;
    stepRef.current = 0;
    calibCRef.current = 1;
    historyRef.current = { time: [], meanArea: [], count: [] };
    updateStats();
    drawGrains();
    drawPlots();
  }, [drawGrains, drawPlots, updateStats]);

  useEffect(() => {
    doInit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Simulation Step ─────────────────────────────────────────────────
  const simStep = useCallback(() => {
    const seeds = seedsRef.current;
    if (!seeds) return;
    const { W, H } = getCanvasSize();
    const p = paramsRef.current;
    const um = p.umPerPx;

    // Arrhenius mobility
    const QmJ = p.Qm * 1000; // kJ -> J
    const M = p.M0 * Math.exp(-QmJ / (R_GAS * p.temperature));
    const K = (Math.PI / 3) * p.gamma * M;
    statsRef.current.K = K;
    statsRef.current.M = M;

    // Recompute calibration factor C every N steps
    if (stepRef.current % p.recomputeN === 0) {
      const active = seeds.filter(s => s.active);
      if (active.length > 0) {
        let sumDaDw = 0;
        let validCount = 0;
        for (const s of active) {
          const idx = seeds.indexOf(s);
          const areaOrig = polyArea(computeCell(seeds, idx, W, H));
          const origW = s.w;
          s.w = origW + p.epsW;
          const areaPerturbed = polyArea(computeCell(seeds, idx, W, H));
          s.w = origW;
          const dadw = (areaPerturbed - areaOrig) / p.epsW;
          if (Math.abs(dadw) > 1e-12) {
            sumDaDw += dadw;
            validCount++;
          }
        }
        if (validCount > 0) {
          const meanDaDw = sumDaDw / validCount;
          if (Math.abs(meanDaDw) > 1e-12) {
            const newC = 1 / meanDaDw;
            // Damped update
            calibCRef.current = 0.8 * calibCRef.current + 0.2 * newC;
          }
        }
      }
    }

    const C = calibCRef.current;

    // Update weights via von Neumann-Mullins
    const active = seeds.filter(s => s.active);
    for (const s of active) {
      const idx = seeds.indexOf(s);
      const poly = computeCell(seeds, idx, W, H);
      const nSides = poly.length;
      if (nSides < 3) continue;

      // dA in SI (m²)
      const dA_SI = K * (nSides - 6) * p.dt;
      // Convert to px²: 1 µm = (1/um) px, so 1 m = 1e6 µm = 1e6/um px
      // 1 m² = (1e6/um)² px²
      const dA_px = dA_SI * (1e6 / um) * (1e6 / um);

      s.w += C * dA_px;
    }

    // Remove dead grains
    for (let i = seeds.length - 1; i >= 0; i--) {
      if (!seeds[i].active) continue;
      const poly = computeCell(seeds, i, W, H);
      const areaPx = polyArea(poly);
      const areaUm = areaPx * um * um;
      if (areaUm < p.minArea || poly.length < 3) {
        seeds[i].active = false;
      }
    }

    simTimeRef.current += p.dt;
    stepRef.current++;
  }, [getCanvasSize]);

  // ── Animation Loop ──────────────────────────────────────────────────
  useEffect(() => {
    runningRef.current = running;
    if (running) {
      const tick = () => {
        if (!runningRef.current) return;
        simStep();
        updateStats();
        drawGrains();
        drawPlots();
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [running, simStep, updateStats, drawGrains, drawPlots]);

  // ── Slider Live Regenerate ──────────────────────────────────────────
  const handleSpreadChange = useCallback((val) => {
    setSpreadPct(val);
    setRunning(false);
    // Defer init so paramsRef picks up new value
    setTimeout(() => doInit(val), 0);
  }, [doInit]);

  // ── Styles ──────────────────────────────────────────────────────────
  const fieldStyle = { border: "1px solid var(--color-pencil)", borderRadius: "var(--radius-sm)", padding: "0.5rem 0.75rem", background: "white", boxShadow: "var(--shadow-soft)", marginBottom: "0.5rem" };
  const legendStyle = { font: "700 0.7rem var(--font-sans)", color: "var(--color-amber)", padding: "0 4px", textTransform: "uppercase", letterSpacing: "0.05em" };
  const ctrlGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: "0.75rem", rowGap: "0.25rem" };
  const lblStyle = { display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 4, fontSize: "0.65rem", fontWeight: 700, color: "var(--color-secondary)", textTransform: "uppercase", whiteSpace: "nowrap" };
  const inputStyle = { fontFamily: "var(--font-mono)", fontSize: "0.75rem", padding: "2px 4px", border: "1px solid var(--color-pencil)", borderRadius: 4, background: "var(--color-cream)", color: "var(--color-charcoal)", width: "60px", textAlign: "right" };
  const btnStyle = { fontFamily: "var(--font-mono)", fontSize: "0.75rem", fontWeight: 700, padding: "6px 12px", borderRadius: 6, border: "none", cursor: "pointer", transition: "all 0.2s" };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", alignItems: "flex-start" }}>

      {/* Controls */}
      <div style={{ flex: "1 1 240px", minWidth: 230, maxWidth: 320 }}>

        <fieldset style={fieldStyle}>
          <legend style={legendStyle}>🎮 Actions</legend>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button onClick={() => setRunning(r => !r)} style={{ ...btnStyle, background: running ? "#E06C75" : "var(--color-amber)", color: "white" }}>
              {running ? "⏸ Pause" : "▶ Start"}
            </button>
            <button onClick={() => { setRunning(false); doInit(); }} style={{ ...btnStyle, background: "var(--color-cream)", color: "var(--color-charcoal)", border: "1px solid var(--color-pencil)" }}>
              🔄 Reset
            </button>
          </div>
        </fieldset>

        <fieldset style={fieldStyle}>
          <legend style={legendStyle}>🎚️ Size Spread</legend>
          <label style={{ ...lblStyle, gap: 6 }}>
            Initial size spread: <strong style={{ color: "var(--color-charcoal)" }}>{spreadPct}%</strong>
            <input type="range" min="0" max="100" value={spreadPct}
              onChange={e => handleSpreadChange(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--color-amber)" }} />
          </label>
        </fieldset>

        <fieldset style={fieldStyle}>
          <legend style={legendStyle}>🔬 Simulation</legend>
          <div style={ctrlGrid}>
            <label style={lblStyle}>Seeds <input type="number" min="3" max="1000" value={nSeeds} onChange={e => setNSeeds(Number(e.target.value))} style={inputStyle} /></label>
            <label style={lblStyle}>Temperature (K) <input type="number" min="1" value={temperature} onChange={e => setTemperature(Number(e.target.value))} style={inputStyle} /></label>
            <label style={lblStyle}>Q<sub>m</sub> (kJ/mol) <input type="number" value={Qm} onChange={e => setQm(Number(e.target.value))} style={inputStyle} /></label>
            <label style={lblStyle}>γ (J/m²) <input type="number" step="0.1" value={gamma} onChange={e => setGamma(Number(e.target.value))} style={inputStyle} /></label>
            <label style={lblStyle}>M₀ (m⁴/Js) <input type="text" value={M0} onChange={e => setM0(Number(e.target.value))} style={inputStyle} /></label>
            <label style={lblStyle}>µm/px <input type="number" step="0.1" min="0.01" value={umPerPx} onChange={e => setUmPerPx(Number(e.target.value))} style={inputStyle} /></label>
            <label style={lblStyle}>dt (s) <input type="number" step="0.1" min="0.01" value={dt} onChange={e => setDt(Number(e.target.value))} style={inputStyle} /></label>
            <label style={lblStyle}>Recompute C / N <input type="number" min="1" value={recomputeN} onChange={e => setRecomputeN(Number(e.target.value))} style={inputStyle} /></label>
            <label style={lblStyle}>ε for dA/dw <input type="number" step="0.1" value={epsW} onChange={e => setEpsW(Number(e.target.value))} style={inputStyle} /></label>
            <label style={lblStyle}>Min area (µm²) <input type="number" step="0.5" value={minArea} onChange={e => setMinArea(Number(e.target.value))} style={inputStyle} /></label>
          </div>
        </fieldset>

        <fieldset style={fieldStyle}>
          <legend style={legendStyle}>📊 Statistics</legend>
          <div style={{ fontSize: "0.8rem", color: "var(--color-secondary)", lineHeight: 2 }}>
            <div>Time: <strong style={{ color: "var(--color-charcoal)" }}>{statsDisplay.time} s</strong></div>
            <div>Active Grains: <strong style={{ color: "var(--color-charcoal)" }}>{statsDisplay.count}</strong></div>
            <div>Mean Area: <strong style={{ color: "var(--color-charcoal)" }}>{statsDisplay.meanArea} µm²</strong></div>
            <div>Mean Sides: <strong style={{ color: "var(--color-charcoal)" }}>{statsDisplay.meanSides}</strong></div>
            <div style={{ fontSize: "0.7rem", marginTop: "0.25rem", fontFamily: "var(--font-mono)", color: "var(--color-secondary)" }}>
              K={statsDisplay.K} &nbsp; M={statsDisplay.M} &nbsp; C={statsDisplay.C}
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 110px" }}>
              <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--color-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>Mean Area</div>
              <canvas ref={plotAreaRef} width="200" height="80" style={{ width: "100%", height: 80, borderRadius: 6, display: "block" }} />
            </div>
            <div style={{ flex: "1 1 110px" }}>
              <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--color-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>Grain Count</div>
              <canvas ref={plotCountRef} width="200" height="80" style={{ width: "100%", height: 80, borderRadius: 6, display: "block" }} />
            </div>
          </div>
        </fieldset>
      </div>

      {/* Canvas */}
      <div style={{ flex: "1 1 400px", minWidth: 240, position: "sticky", top: "2rem" }}>
        <div className="polaroid" style={{ margin: 0, width: "100%" }}>
          <div style={{ width: "100%", overflow: "hidden", background: "#1E222A", borderRadius: "2px" }}>
            <canvas ref={canvasRef} style={{ display: "block", width: "100%" }} />
          </div>
          <div className="polaroid-caption">
            Power-Voronoi Grain Growth · {seedsRef.current ? seedsRef.current.filter(s => s.active).length : nSeeds} Grains
          </div>
        </div>
      </div>
    </div>
  );
}
