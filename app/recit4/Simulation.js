"use client";

import { useRef, useState, useEffect, useCallback } from "react";

// ── Constants ──────────────────────────────────────────────────────
const R = 8.314462618; // J/mol/K

const DEFAULTS = {
    numParticles: 200,
    particleRadius: 3,
    particleColor: "#4A90E2",
    scale: 0.1,          // µm per pixel
    temperature: 300,    // K
    dt: 0.01,            // seconds
    // Env 1
    d0_1: 50,
    ea_1: 12000,
    // Env 2
    env2location: "membrane",
    env2pct: 20,
    d0_2: 10,
    ea_2: 18000,
    env2color: "rgba(255,100,100,0.25)",
    env2show: true,
    // Init
    initDist: "uniform",
    initFillPct: 50,
};

// ── Box-Muller Gaussian RNG ────────────────────────────────────────
function randGauss(sigma) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// ── Arrhenius D (µm²/s) → pixels²/step ──────────────────────────
function computeD(d0, ea, temp, scale, dt) {
    const dMicrons = d0 * Math.exp(-ea / (R * temp));
    const dPixels = dMicrons / (scale * scale);
    return dPixels * dt;
}

// ── Environment 2 geometry ─────────────────────────────────────────
function getEnv2Rect(location, pct, W, H) {
    const p = pct / 100;
    switch (location) {
        case "top":      return { type: "rect", x: 0, y: 0, w: W, h: H * p };
        case "bottom":   return { type: "rect", x: 0, y: H * (1 - p), w: W, h: H * p };
        case "left":     return { type: "rect", x: 0, y: 0, w: W * p, h: H };
        case "right":    return { type: "rect", x: W * (1 - p), y: 0, w: W * p, h: H };
        case "membrane": {
            const mw = W * p;
            return { type: "rect", x: (W - mw) / 2, y: 0, w: mw, h: H };
        }
        case "center": {
            const maxR = Math.min(W, H) / 2;
            return { type: "circle", cx: W / 2, cy: H / 2, r: maxR * p };
        }
        default:         return null;
    }
}

function inEnv2(x, y, env2) {
    if (!env2) return false;
    if (env2.type === "rect") {
        return x >= env2.x && x <= env2.x + env2.w && y >= env2.y && y <= env2.y + env2.h;
    }
    if (env2.type === "circle") {
        const dx = x - env2.cx, dy = y - env2.cy;
        return dx * dx + dy * dy <= env2.r * env2.r;
    }
    return false;
}

// ── Particle initialization ────────────────────────────────────────
function spawnParticles(count, dist, fillPct, radius, W, H, env2geo) {
    const particles = [];
    const p = fillPct / 100;

    for (let i = 0; i < count; i++) {
        let x, y, tries = 0;
        do {
            tries++;
            switch (dist) {
                case "left":   x = Math.random() * W * p;          y = Math.random() * H; break;
                case "right":  x = W * (1 - p) + Math.random() * W * p; y = Math.random() * H; break;
                case "top":    x = Math.random() * W;  y = Math.random() * H * p; break;
                case "bottom": x = Math.random() * W;  y = H * (1 - p) + Math.random() * H * p; break;
                case "center": {
                    const maxR = Math.min(W, H) / 2 * p;
                    const angle = Math.random() * 2 * Math.PI;
                    const r = Math.sqrt(Math.random()) * maxR;
                    x = W / 2 + r * Math.cos(angle);
                    y = H / 2 + r * Math.sin(angle);
                    break;
                }
                case "outside_env2": {
                    x = radius + Math.random() * (W - 2 * radius);
                    y = radius + Math.random() * (H - 2 * radius);
                    if (env2geo && inEnv2(x, y, env2geo)) { x = -1; } // force retry
                    break;
                }
                default: // uniform
                    x = radius + Math.random() * (W - 2 * radius);
                    y = radius + Math.random() * (H - 2 * radius);
            }
            // Clamp to valid area
            x = Math.max(radius, Math.min(W - radius, x));
            y = Math.max(radius, Math.min(H - radius, y));
        } while (dist === "outside_env2" && env2geo && inEnv2(x, y, env2geo) && tries < 5000);

        particles.push({ x, y });
    }
    return particles;
}

// ── Reflect helper ────────────────────────────────────────────────
function reflect(val, min, max) {
    if (val < min) return min + (min - val);
    if (val > max) return max - (val - max);
    return val;
}

// ── Main Component ────────────────────────────────────────────────
export default function DiffusionSimulation() {
    const [numParticles, setNumParticles]   = useState(DEFAULTS.numParticles);
    const [particleRadius, setParticleRadius] = useState(DEFAULTS.particleRadius);
    const [particleColor, setParticleColor] = useState(DEFAULTS.particleColor);
    const [scale, setScale]                 = useState(DEFAULTS.scale);
    const [temperature, setTemperature]     = useState(DEFAULTS.temperature);
    const [dt, setDt]                       = useState(DEFAULTS.dt);

    const [d0_1, setD0_1] = useState(DEFAULTS.d0_1);
    const [ea_1, setEa_1] = useState(DEFAULTS.ea_1);

    const [env2location, setEnv2location] = useState(DEFAULTS.env2location);
    const [env2pct, setEnv2pct]           = useState(DEFAULTS.env2pct);
    const [d0_2, setD0_2]                 = useState(DEFAULTS.d0_2);
    const [ea_2, setEa_2]                 = useState(DEFAULTS.ea_2);
    const [env2color, setEnv2color]       = useState("#ff6464");
    const [env2opacity, setEnv2opacity]   = useState(0.25);
    const [env2show, setEnv2show]         = useState(true);

    const [initDist, setInitDist]         = useState(DEFAULTS.initDist);
    const [initFillPct, setInitFillPct]   = useState(DEFAULTS.initFillPct);

    const [running, setRunning]           = useState(false);
    const [stepCount, setStepCount]       = useState(0);

    const canvasRef    = useRef(null);
    const particlesRef = useRef([]);
    const rafRef       = useRef(null);
    const runningRef   = useRef(false);
    const stepRef      = useRef(0);

    // Live params ref (avoids stale closure in rAF loop)
    const paramsRef = useRef({});
    useEffect(() => {
        paramsRef.current = {
            numParticles, particleRadius, particleColor,
            scale, temperature, dt,
            d0_1, ea_1, d0_2, ea_2,
            env2location, env2pct, env2color, env2opacity, env2show,
        };
    }, [numParticles, particleRadius, particleColor, scale, temperature, dt,
        d0_1, ea_1, d0_2, ea_2, env2location, env2pct, env2color, env2opacity, env2show]);

    // ── Draw frame ──────────────────────────────────────────────
    const drawFrame = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const W = canvas.width, H = canvas.height;
        const { particleColor: pc, particleRadius: pr, env2location: e2l,
                env2pct: e2p, env2color: e2c, env2opacity: e2o, env2show: e2s } = paramsRef.current;

        ctx.clearRect(0, 0, W, H);

        // Env 2 overlay
        if (e2s) {
            const geo = getEnv2Rect(e2l, e2p, W, H);
            if (geo) {
                ctx.fillStyle = hexToRgba(e2c, e2o);
                if (geo.type === "rect") {
                    ctx.fillRect(geo.x, geo.y, geo.w, geo.h);
                } else {
                    ctx.beginPath();
                    ctx.arc(geo.cx, geo.cy, geo.r, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        // Particles
        const particles = particlesRef.current;
        ctx.fillStyle = pc;
        ctx.beginPath();
        for (const p of particles) {
            ctx.moveTo(p.x + pr, p.y);
            ctx.arc(p.x, p.y, pr, 0, Math.PI * 2);
        }
        ctx.fill();
    }, []);

    // ── Simulation loop ──────────────────────────────────────────
    const simulationLoop = useCallback(() => {
        if (!runningRef.current) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const W = canvas.width, H = canvas.height;
        const { scale: a, temperature: T, dt: deltaT,
                d0_1: D01, ea_1: EA1, d0_2: D02, ea_2: EA2,
                env2location: e2l, env2pct: e2p, particleRadius: pr } = paramsRef.current;

        const Dvar1 = computeD(D01, EA1, T, a, deltaT);
        const Dvar2 = computeD(D02, EA2, T, a, deltaT);
        const sigma1 = Math.sqrt(2 * Dvar1);
        const sigma2 = Math.sqrt(2 * Dvar2);
        const geo = getEnv2Rect(e2l, e2p, W, H);
        const minX = pr, maxX = W - pr, minY = pr, maxY = H - pr;

        const particles = particlesRef.current;
        for (const p of particles) {
            const sigma = inEnv2(p.x, p.y, geo) ? sigma2 : sigma1;
            const nx = reflect(p.x + randGauss(sigma), minX, maxX);
            const ny = reflect(p.y + randGauss(sigma), minY, maxY);
            p.x = nx;
            p.y = ny;
        }

        drawFrame();
        stepRef.current++;
        if (stepRef.current % 30 === 0) setStepCount(stepRef.current);
        rafRef.current = requestAnimationFrame(simulationLoop);
    }, [drawFrame]);

    // ── Reset ─────────────────────────────────────────────────────
    const reset = useCallback(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        runningRef.current = false;
        setRunning(false);
        stepRef.current = 0;
        setStepCount(0);

        const canvas = canvasRef.current;
        if (!canvas) return;
        const W = canvas.width, H = canvas.height;
        const geo = getEnv2Rect(env2location, env2pct, W, H);
        particlesRef.current = spawnParticles(
            numParticles, initDist, initFillPct, particleRadius, W, H, geo
        );
        drawFrame();
    }, [numParticles, initDist, initFillPct, particleRadius, env2location, env2pct, drawFrame]);

    // ── Toggle Start / Pause ──────────────────────────────────────
    const toggleRunning = useCallback(() => {
        if (runningRef.current) {
            cancelAnimationFrame(rafRef.current);
            runningRef.current = false;
            setRunning(false);
        } else {
            runningRef.current = true;
            setRunning(true);
            rafRef.current = requestAnimationFrame(simulationLoop);
        }
    }, [simulationLoop]);

    // Init canvas and particles on mount
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const container = canvas.parentElement;
        const size = Math.min(container.clientWidth - 4, 600);
        canvas.width = size;
        canvas.height = size;
        const geo = getEnv2Rect(DEFAULTS.env2location, DEFAULTS.env2pct, size, size);
        particlesRef.current = spawnParticles(
            DEFAULTS.numParticles, DEFAULTS.initDist, DEFAULTS.initFillPct,
            DEFAULTS.particleRadius, size, size, geo
        );
        drawFrame();
    }, []); // eslint-disable-line

    useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

    // Redraw when colors/env change (non-physics)
    useEffect(() => { drawFrame(); }, [env2color, env2opacity, env2show, particleColor, drawFrame]);

    // ── Render ─────────────────────────────────────────────────
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* Control Panels */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>

                {/* General Settings */}
                <fieldset style={fieldStyle}>
                    <legend style={legendStyle}>⚙️ General Settings</legend>
                    <div style={ctrlGrid}>
                        <CI label="Particles" value={numParticles} set={setNumParticles} min={1} max={2000} />
                        <CI label="Radius (px)" value={particleRadius} set={setParticleRadius} min={1} max={20} />
                        <CI label="µm / pixel" value={scale} set={setScale} step={0.01} min={0.01} />
                        <CI label="Temp (K)" value={temperature} set={setTemperature} min={1} max={5000} />
                        <CI label="dt (s)" value={dt} set={setDt} step={0.001} min={0.001} />
                        <CI label="Particle Color" value={particleColor} set={setParticleColor} type="color" />
                    </div>
                </fieldset>

                {/* Initialization */}
                <fieldset style={fieldStyle}>
                    <legend style={legendStyle}>🎯 Initialization</legend>
                    <div style={ctrlGrid}>
                        <label style={lblStyle}>
                            Distribution
                            <select value={initDist} onChange={e => setInitDist(e.target.value)} style={selectStyle}>
                                <option value="uniform">Uniform (All)</option>
                                <option value="left">Left Side</option>
                                <option value="right">Right Side</option>
                                <option value="top">Top</option>
                                <option value="bottom">Bottom</option>
                                <option value="center">Center Circle</option>
                                <option value="outside_env2">Outside Env 2</option>
                            </select>
                        </label>
                        <CI label="Fill %" value={initFillPct} set={setInitFillPct} min={1} max={100} />
                    </div>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-secondary)", marginTop: "0.5rem" }}>
                        Changes here require a <strong>Reset</strong>.
                    </p>
                </fieldset>

                {/* Env 1 */}
                <fieldset style={fieldStyle}>
                    <legend style={legendStyle}>🌐 Environment 1 (Background)</legend>
                    <div style={ctrlGrid}>
                        <CI label="D₀,₁ (µm²/s)" value={d0_1} set={setD0_1} min={0.001} step={1} />
                        <CI label="Eₐ,₁ (J/mol)" value={ea_1} set={setEa_1} min={0} step={100} />
                    </div>
                    <DCalc d0={d0_1} ea={ea_1} T={temperature} a={scale} dt={dt} label="D₁" />
                </fieldset>

                {/* Env 2 */}
                <fieldset style={fieldStyle}>
                    <legend style={legendStyle}>🔲 Environment 2 (Overlay)</legend>
                    <div style={ctrlGrid}>
                        <label style={lblStyle}>
                            Location
                            <select value={env2location} onChange={e => setEnv2location(e.target.value)} style={selectStyle}>
                                <option value="top">Top Band</option>
                                <option value="bottom">Bottom Band</option>
                                <option value="left">Left Band</option>
                                <option value="right">Right Band</option>
                                <option value="membrane">Membrane (Center)</option>
                                <option value="center">Center Circle</option>
                            </select>
                        </label>
                        <CI label="Coverage %" value={env2pct} set={setEnv2pct} min={1} max={100} />
                        <CI label="D₀,₂ (µm²/s)" value={d0_2} set={setD0_2} min={0.001} step={1} />
                        <CI label="Eₐ,₂ (J/mol)" value={ea_2} set={setEa_2} min={0} step={100} />
                        <CI label="Overlay Color" value={env2color} set={setEnv2color} type="color" />
                        <CI label="Opacity" value={env2opacity} set={setEnv2opacity} step={0.05} min={0} max={1} />
                    </div>
                    <DCalc d0={d0_2} ea={ea_2} T={temperature} a={scale} dt={dt} label="D₂" />
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "0.75rem", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
                        <input type="checkbox" checked={env2show} onChange={e => setEnv2show(e.target.checked)} style={{ accentColor: "var(--color-amber)" }} />
                        Show overlay
                    </label>
                </fieldset>

            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <button className="card-button primary" style={{ width: "auto", padding: "10px 24px" }} onClick={reset}>🔄 Reset</button>
                <button className="card-button primary" style={{ width: "auto", padding: "10px 24px", background: running ? "#dc2626" : "var(--color-amber)" }} onClick={toggleRunning}>
                    {running ? "⏸ Pause" : "▶ Start"}
                </button>
            </div>

            {/* Canvas */}
            <div className="polaroid">
                <div style={{ width: "100%", aspectRatio: "1", overflow: "hidden", background: "#f5f3ef", borderRadius: "2px" }}>
                    <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
                </div>
                <div className="polaroid-caption">
                    Step: <strong>{stepCount}</strong> · Particles: <strong>{numParticles}</strong> · T = <strong>{temperature} K</strong> · dt = <strong>{dt} s</strong>
                </div>
            </div>
        </div>
    );
}

// ── Helpers ──────────────────────────────────────────────────────
function hexToRgba(hex, opacity) {
    if (!hex || !hex.startsWith("#")) return `rgba(255,100,100,${opacity})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${opacity})`;
}

function DCalc({ d0, ea, T, a, dt, label }) {
    const dMicrons = d0 * Math.exp(-ea / (R * T));
    const dPixels = dMicrons / (a * a);
    return (
        <div style={{ fontSize: "0.72rem", marginTop: "0.5rem", color: "var(--color-secondary)", fontFamily: "var(--font-mono)" }}>
            {label} = {dMicrons.toExponential(2)} µm²/s · σ = {Math.sqrt(2 * dPixels * dt).toFixed(3)} px/step
        </div>
    );
}

const fieldStyle = { border: "1px solid var(--color-pencil)", borderRadius: "var(--radius-md)", padding: "1rem", background: "white", boxShadow: "var(--shadow-soft)" };
const legendStyle = { font: "700 0.8rem var(--font-sans)", color: "var(--color-amber)", padding: "0 6px", textTransform: "uppercase", letterSpacing: "0.06em" };
const ctrlGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "0.75rem" };
const lblStyle = { display: "flex", flexDirection: "column", gap: 4, fontSize: "0.72rem", fontWeight: 700, color: "var(--color-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" };
const selectStyle = { fontFamily: "var(--font-mono)", fontSize: "0.78rem", padding: "5px 7px", border: "1px solid var(--color-pencil)", borderRadius: 6, background: "var(--color-cream)", color: "var(--color-charcoal)", cursor: "pointer" };

function CI({ label, value, set, type = "number", step, min, max }) {
    return (
        <label style={lblStyle}>
            {label}
            <input type={type} value={value}
                step={step}
                min={min} max={max}
                onChange={e => set(type === "number" ? Number(e.target.value) : e.target.value)}
                style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", padding: type === "color" ? "2px" : "5px 7px", border: "1px solid var(--color-pencil)", borderRadius: 6, background: "var(--color-cream)", color: "var(--color-charcoal)", height: type === "color" ? 34 : "auto", cursor: type === "color" ? "pointer" : "text" }} />
        </label>
    );
}
