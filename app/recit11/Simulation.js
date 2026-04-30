"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const kB_J = 1.380649e-23;
const N_A = 6.02214076e23;
const eV_to_J = 1.602176634e-19;
const rho_w = 997;
const M_w = 0.018015;
const n_l = rho_w / M_w * N_A;

const ATMOS = [
  { label: "Dry Air", p: 400, dewC: -7 },
  { label: "Average Air", p: 1200, dewC: 10 },
  { label: "Humid Air", p: 2500, dewC: 21 },
  { label: "Tropical Air", p: 4500, dewC: 31 },
];

function pSat(T_C) {
  const logP = 8.07131 - 1730.63 / (233.426 + T_C);
  return Math.pow(10, logP) * 133.322;
}

const CW = 800, CH = 600;

export default function NucleationSimulation() {
  const [gamma, setGamma] = useState(0.072);
  const [gammaUnit, setGammaUnit] = useState("J/m²");
  const [atmoIdx, setAtmoIdx] = useState(1);
  const [tempC, setTempC] = useState(15);
  const [theta, setTheta] = useState(60);
  const [prefA, setPrefA] = useState(1e10);
  const [M0, setM0] = useState(1e-15);
  const [Qact, setQact] = useState(40);
  const [maxDr, setMaxDr] = useState(5);
  const [rainR, setRainR] = useState(40);
  const [scale, setScale] = useState(10);
  const [dustN, setDustN] = useState(30);
  const [physDt, setPhysDt] = useState(0.001);
  const [uiMs, setUiMs] = useState(30);
  const [enHom, setEnHom] = useState(true);
  const [enHet, setEnHet] = useState(true);
  const [running, setRunning] = useState(false);
  const [stats, setStats] = useState({ homCount:0, hetCount:0, failCount:0, rainCount:0, pSatV:0, dmu:0, dgv:0, rHom:0, rHet:0, time:0 });

  const canvasRef = useRef(null);
  const dropsRef = useRef([]);
  const dustRef = useRef([]);
  const cRef = useRef({ hom:0, het:0, fail:0, rain:0 });
  const tRef = useRef(0);
  const runRef = useRef(false);
  const intRef = useRef(null);

  const gEff = gammaUnit === "eV/Å²" ? gamma * eV_to_J / 1e-20 : gamma;

  const doInit = useCallback(() => {
    const dust = [];
    for (let i = 0; i < dustN; i++) dust.push({ x: 10 + Math.random() * (CW - 20), y: 10 + Math.random() * (CH - 20) });
    dustRef.current = dust;
    dropsRef.current = [];
    cRef.current = { hom:0, het:0, fail:0, rain:0 };
    tRef.current = 0;
    updateStats();
    draw();
  }, [dustN]);

  const draw = useCallback(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    ctx.clearRect(0, 0, CW, CH);
    ctx.fillStyle = "#0d1117";
    ctx.fillRect(0, 0, CW, CH);
    for (const d of dustRef.current) { ctx.fillStyle = "rgba(160,140,100,0.7)"; ctx.beginPath(); ctx.arc(d.x, d.y, 2, 0, Math.PI * 2); ctx.fill(); }
    for (const drop of dropsRef.current) {
      if (drop.fading && drop.opacity <= 0) continue;
      const rPx = drop.r_nm / scale;
      if (rPx < 0.5) {
        // Sub-pixel indicator: bright cyan 1px dot
        ctx.fillStyle = "rgba(0,255,255,0.8)";
        ctx.fillRect(drop.x - 0.5, drop.y - 0.5, 1, 1);
      } else {
        const g = ctx.createRadialGradient(drop.x - rPx * 0.25, drop.y - rPx * 0.25, rPx * 0.1, drop.x, drop.y, rPx);
        const a = drop.fading ? drop.opacity : 0.55;
        g.addColorStop(0, `rgba(180,220,255,${Math.min(a + 0.2, 0.9)})`);
        g.addColorStop(0.6, `rgba(80,160,240,${a})`);
        g.addColorStop(1, `rgba(30,80,180,${a * 0.5})`);
        ctx.beginPath(); ctx.arc(drop.x, drop.y, rPx, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
      }
    }
  }, [scale]);

  const updateStats = useCallback(() => {
    const T_K = tempC + 273.15;
    const p = ATMOS[atmoIdx].p;
    const pS = pSat(tempC);
    const ss = p > pS;
    const dmu = ss ? kB_J * T_K * Math.log(p / pS) : 0;
    const dgv = n_l * dmu;
    const g = gammaUnit === "eV/Å²" ? gamma * eV_to_J / 1e-20 : gamma;
    const rH = dgv > 0 ? (2 * g / dgv) * 1e9 : Infinity;
    const cc = cRef.current;
    setStats({ homCount: cc.hom, hetCount: cc.het, failCount: cc.fail, rainCount: cc.rain, pSatV: pS, dmu, dgv, rHom: rH, rHet: rH, time: tRef.current });
  }, [tempC, atmoIdx, gamma, gammaUnit]);

  const simStep = useCallback(() => {
    const T_K = tempC + 273.15;
    const p = ATMOS[atmoIdx].p;
    const pS = pSat(tempC);
    const ss = p > pS;
    const dmu = ss ? kB_J * T_K * Math.log(p / pS) : 0;
    const dgv = n_l * dmu;
    const g = gammaUnit === "eV/Å²" ? gamma * eV_to_J / 1e-20 : gamma;
    const cc = cRef.current;

    if (ss && dgv > 0) {
      const rCrit = 2 * g / dgv;
      const dG_hom = (16 * Math.PI * g * g * g) / (3 * dgv * dgv);
      const tRad = theta * Math.PI / 180;
      const cosT = Math.cos(tRad);
      const fT = (2 - 3 * cosT + cosT * cosT * cosT) / 4;
      const dG_het = fT * dG_hom;

      if (enHom) {
        const P = Math.min(1, Math.max(0, prefA * physDt * Math.exp(-dG_hom / (kB_J * T_K))));
        if (Math.random() < P) {
          const rI = rCrit * 1e9;
          dropsRef.current.push({ x: 10 + Math.random() * (CW - 20), y: 10 + Math.random() * (CH - 20), r_nm: rI, type: "hom", fading: false, opacity: 1 });
          cc.hom++;
        } else cc.fail++;
      }
      if (enHet && dustRef.current.length > 0) {
        const P = Math.min(1, Math.max(0, prefA * physDt * Math.exp(-dG_het / (kB_J * T_K))));
        if (Math.random() < P) {
          const d = dustRef.current[Math.floor(Math.random() * dustRef.current.length)];
          const rI = rCrit * 1e9;
          dropsRef.current.push({ x: d.x, y: d.y, r_nm: rI, type: "het", fading: false, opacity: 1 });
          cc.het++;
        } else cc.fail++;
      }
    }

    const Q_J = (Qact * 1000) / N_A;
    const Mob = M0 * Math.exp(-Q_J / (kB_J * T_K));
    for (const drop of dropsRef.current) {
      if (drop.fading) { drop.opacity -= 0.03; continue; }
      if (dgv > 0) { let dr = Mob * dgv * physDt * 1e9; drop.r_nm += Math.min(dr, maxDr); }
      if (drop.r_nm / scale >= rainR) { drop.fading = true; cc.rain++; }
    }
    dropsRef.current = dropsRef.current.filter(d => !(d.fading && d.opacity <= 0));
    tRef.current += physDt;
  }, [tempC, atmoIdx, gamma, gammaUnit, theta, prefA, M0, Qact, physDt, maxDr, rainR, scale, enHom, enHet]);

  useEffect(() => {
    if (running) {
      runRef.current = true;
      intRef.current = setInterval(() => { if (!runRef.current) return; simStep(); updateStats(); draw(); }, uiMs);
    } else {
      runRef.current = false;
      if (intRef.current) clearInterval(intRef.current);
    }
    return () => { runRef.current = false; if (intRef.current) clearInterval(intRef.current); };
  }, [running, simStep, updateStats, draw, uiMs]);

  useEffect(() => { doInit(); }, [doInit]);

  const pb = "1px solid var(--color-pencil)";
  const cs = { border: pb, borderRadius: "10px", padding: "1rem 1.25rem", background: "white", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" };
  const ls = { font: "700 0.7rem var(--font-sans)", color: "var(--color-amber)", padding: "0 6px", textTransform: "uppercase", letterSpacing: "0.06em" };
  const cg = { display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: "1rem", rowGap: "0.35rem" };
  const ll = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, fontSize: "0.65rem", fontWeight: 700, color: "var(--color-secondary)", textTransform: "uppercase", whiteSpace: "nowrap" };
  const is = { fontFamily: "var(--font-mono)", fontSize: "0.74rem", padding: "3px 6px", border: "1px solid var(--color-pencil)", borderRadius: 5, background: "var(--color-cream)", color: "var(--color-charcoal)", width: "72px", textAlign: "right" };
  const ss = { ...is, width: "auto", textAlign: "left", minWidth: 80 };
  const bs = { fontFamily: "var(--font-mono)", fontSize: "0.8rem", fontWeight: 700, padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer", transition: "all 0.15s ease" };
  const isSS = ATMOS[atmoIdx].p > pSat(tempC);

  return (
    <div style={{ border: pb, borderRadius: "14px", background: "var(--color-cream)", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "stretch", gap: 0 }}>

        {/* Left */}
        <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.6rem", borderRight: pb }}>
          <fieldset style={{ ...cs, margin: 0 }}><legend style={ls}>🎮 Actions</legend>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
              <button onClick={() => setRunning(r => !r)} style={{ ...bs, background: running ? "#E06C75" : "var(--color-amber)", color: "white", flex: 1 }}>{running ? "⏸ Pause" : "▶ Start"}</button>
              <button onClick={() => { setRunning(false); doInit(); }} style={{ ...bs, background: "white", color: "var(--color-charcoal)", border: pb, flex: 1 }}>🔄 Reset</button>
            </div>
          </fieldset>

          <fieldset style={{ ...cs, margin: 0 }}><legend style={ls}>🌡️ Thermodynamics</legend>
            <div style={{ ...cg, marginTop: "0.25rem" }}>
              <label style={ll}>γ <input type="text" value={gamma} onChange={e => setGamma(Number(e.target.value))} style={is} /></label>
              <label style={ll}>Unit <select value={gammaUnit} onChange={e => setGammaUnit(e.target.value)} style={ss}><option value="J/m²">J/m²</option><option value="eV/Å²">eV/Å²</option></select></label>
              <label style={ll}>Atmos. <select value={atmoIdx} onChange={e => setAtmoIdx(Number(e.target.value))} style={ss}>{ATMOS.map((a, i) => <option key={i} value={i}>{a.label}</option>)}</select></label>
              <label style={ll}>T (°C) <input type="number" value={tempC} onChange={e => setTempC(Number(e.target.value))} style={is} /></label>
            </div>
            <div style={{ fontSize: "0.6rem", color: "var(--color-secondary)", marginTop: 4 }}>
              p = {ATMOS[atmoIdx].p} Pa · Dew pt ≈ {ATMOS[atmoIdx].dewC}°C · {isSS ? <span style={{ color: "#98c379" }}>Supersaturated ✓</span> : <span style={{ color: "#e06c75" }}>Undersaturated ✗</span>}
            </div>
          </fieldset>

          <fieldset style={{ ...cs, margin: 0 }}><legend style={ls}>⚗️ Nucleation &amp; Kinetics</legend>
            <div style={{ ...cg, marginTop: "0.25rem" }}>
              <label style={ll}>θ (°) <input type="number" min="0" max="180" value={theta} onChange={e => setTheta(Number(e.target.value))} style={is} /></label>
              <label style={ll}>A <input type="text" value={prefA} onChange={e => setPrefA(Number(e.target.value))} style={is} /></label>
              <label style={ll}>M₀ <input type="text" value={M0} onChange={e => setM0(Number(e.target.value))} style={is} /></label>
              <label style={ll}>Q (kJ/mol) <input type="number" value={Qact} onChange={e => setQact(Number(e.target.value))} style={is} /></label>
              <label style={ll}>Max Δr (nm) <input type="number" value={maxDr} step="1" onChange={e => setMaxDr(Number(e.target.value))} style={is} /></label>
              <label style={ll}>Rain R (px) <input type="number" value={rainR} onChange={e => setRainR(Number(e.target.value))} style={is} /></label>
              <label style={ll}>nm/px <input type="number" value={scale} step="1" min="1" onChange={e => setScale(Number(e.target.value))} style={is} /></label>
              <label style={ll}>Dust # <input type="number" value={dustN} min="0" onChange={e => setDustN(Number(e.target.value))} style={is} /></label>
              <label style={ll}>dt (s) <input type="text" value={physDt} onChange={e => setPhysDt(Number(e.target.value))} style={is} /></label>
              <label style={ll}>UI (ms) <input type="number" value={uiMs} min="10" onChange={e => setUiMs(Number(e.target.value))} style={is} /></label>
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 6 }}>
              <label style={{ ...ll, fontSize: "0.62rem" }}><input type="checkbox" checked={enHom} onChange={e => setEnHom(e.target.checked)} style={{ accentColor: "var(--color-amber)" }} /> Homogeneous</label>
              <label style={{ ...ll, fontSize: "0.62rem" }}><input type="checkbox" checked={enHet} onChange={e => setEnHet(e.target.checked)} style={{ accentColor: "var(--color-amber)" }} /> Heterogeneous</label>
            </div>
          </fieldset>
        </div>

        {/* Right */}
        <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          <fieldset style={{ ...cs, margin: 0 }}><legend style={ls}>📊 Event Counters</legend>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem 1rem", marginTop: "0.25rem" }}>
              {[["Hom. Nucleated", stats.homCount], ["Het. Nucleated", stats.hetCount], ["Failed Attempts", stats.failCount], ["Rain Removed", stats.rainCount]].map(([l, v]) => (
                <div key={l} style={{ fontSize: "0.72rem", color: "var(--color-secondary)" }}>{l}<div style={{ fontSize: "1.05rem", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--color-charcoal)" }}>{v}</div></div>
              ))}
            </div>
          </fieldset>

          <fieldset style={{ ...cs, margin: 0, flexGrow: 1 }}><legend style={ls}>🔬 Live Thermodynamics</legend>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.35rem 1rem", marginTop: "0.25rem" }}>
              {[
                ["Time", stats.time.toFixed(3), "s"],
                ["p_sat", stats.pSatV.toFixed(0), "Pa"],
                ["Δμ", stats.dmu.toExponential(2), "J"],
                ["|Δg_v|", stats.dgv.toExponential(2), "J/m³"],
                ["r_hom", stats.rHom === Infinity ? "∞" : stats.rHom.toFixed(2), "nm"],
                ["r_het", stats.rHet === Infinity ? "∞" : stats.rHet.toFixed(2), "nm"],
              ].map(([l, v, u]) => (
                <div key={l} style={{ fontSize: "0.72rem", color: "var(--color-secondary)" }}>
                  {l.includes("_") ? <>{l.split("_")[0]}<sub>{l.split("_")[1]}</sub></> : l}
                  <div style={{ fontSize: "1rem", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--color-charcoal)" }}>{v}<span style={{ fontSize: "0.65rem", fontWeight: 400 }}> {u}</span></div>
                </div>
              ))}
            </div>
          </fieldset>
        </div>
      </div>

      <div style={{ borderTop: pb, background: "#0d1117" }}>
        <canvas ref={canvasRef} width={CW} height={CH} style={{ display: "block", width: "100%" }} />
        <div style={{ textAlign: "center", padding: "0.5rem", fontSize: "0.75rem", fontStyle: "italic", fontFamily: "var(--font-serif)", color: "var(--color-secondary)", background: "var(--color-cream)", borderTop: pb }}>
          Water Droplet Nucleation · {dropsRef.current.filter(d => !d.fading).length} Active Droplets · {dustRef.current.length} Dust
        </div>
      </div>
    </div>
  );
}
