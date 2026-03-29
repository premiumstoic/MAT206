"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ── Math Helpers ──────────────────────────────────────────────────────────

// Intersection of two lines: A1*x + B1*y = C1 and A2*x + B2*y = C2
function getIntersection(l1, l2) {
    const det = l1.A * l2.B - l2.A * l1.B;
    if (Math.abs(det) < 1e-9) return null; // parallel
    const x = (l2.B * l1.C - l1.B * l2.C) / det;
    const y = (l1.A * l2.C - l2.A * l1.C) / det;
    return { x, y };
}

// Check if a point satisfies an inequality: A*x + B*y <= C
function satisfiesInequality(pt, ineq, eps = 1e-7) {
    if (!pt) return false;
    return (ineq.A * pt.x + ineq.B * pt.y) <= ineq.C + eps;
}

// ── Component ─────────────────────────────────────────────────────────────

export default function WulffSimulation() {
    // ── State ──────────────────────────────────────────────────────────────
    const [coord, setCoord] = useState("4");
    const [eh, setEh]       = useState(1.0);
    const [ev, setEv]       = useState(1.0);
    const [ed, setEd]       = useState(1.0);
    const [scale, setScale] = useState(50);
    
    const [bandColor, setBandColor] = useState("#4A90E2");
    const [bandAlpha, setBandAlpha] = useState(0.15);
    const [wulffColor, setWulffColor] = useState("#EBA352");

    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    // ── Drawing Logic ──────────────────────────────────────────────────────
    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const W = canvas.width;
        const H = canvas.height;
        const cx = W / 2;
        const cy = H / 2;

        ctx.clearRect(0, 0, W, H);

        // 1. Draw Grid
        ctx.strokeStyle = "rgba(136, 119, 99, 0.1)";
        ctx.lineWidth = 1;
        const gridStep = 20;
        ctx.beginPath();
        for (let x = cx % gridStep; x < W; x += gridStep) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
        for (let y = cy % gridStep; y < H; y += gridStep) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
        ctx.stroke();

        // 2. Draw Axes
        ctx.strokeStyle = "rgba(44, 48, 58, 0.4)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, cy); ctx.lineTo(W, cy);
        ctx.moveTo(cx, 0); ctx.lineTo(cx, H);
        ctx.stroke();

        ctx.fillStyle = "rgba(44, 48, 58, 0.6)";
        ctx.font = "12px var(--font-mono)";
        ctx.fillText("(0,0)", cx + 5, cy + 15);

        // 3. Physics Math
        let m_hv = 1;
        let m_diag = Math.sqrt(2);
        if (coord === "8") {
            m_hv = 3;
            m_diag = 3 / Math.sqrt(2);
        }

        const S = scale;
        const d = m_hv * eh * S; // Vertical boundary distance (x = ±d)
        const e = m_hv * ev * S; // Horizontal boundary distance (y = ±e)
        const r = m_diag * ed * S; // Diagonal boundary distance (|x ± y| = r) => dist to origin is r / sqrt(2)
        
        // Note on r: The prompt says "x + y = ±r" and "x - y = ±r".
        // The perpendicular distance from origin to x + y = r is r / sqrt(2).
        // Let's use the exact algebraic bounds requested by the prompt.

        const bandRgba = (hex, a) => {
            const hexClean = hex.replace("#", "");
            const red = parseInt(hexClean.substring(0, 2), 16);
            const green = parseInt(hexClean.substring(2, 4), 16);
            const blue = parseInt(hexClean.substring(4, 6), 16);
            return `rgba(${red},${green},${blue},${a})`;
        };

        const fillColor = bandRgba(bandColor, bandAlpha);
        ctx.fillStyle = fillColor;

        // 4. Draw Allowed Bands
        // Vert: -d <= x <= d
        ctx.beginPath();
        ctx.rect(cx - d, 0, 2 * d, H);
        ctx.fill();

        // Horiz: -e <= y <= e
        // Since y increases downwards in canvas, we map y -> -y visually, but symmetry makes it identical
        ctx.beginPath();
        ctx.rect(0, cy - e, W, 2 * e);
        ctx.fill();

        // Diag 1: -r <= x + y <= r  ->  y = -x ± r
        // Canvas coords: let's map math (X, Y) to canvas (X_c = cx + X, Y_c = cy - Y)
        // Math: Y = -X + r => cy - Y_c = -(X_c - cx) + r => Y_c = cy + X_c - cx - r
        // It's easier to compute boundary points and draw polygons.
        ctx.beginPath();
        // line: x + y = r => canvas: (X_c - cx) + (cy - Y_c) = r => Y_c = cx - X_c + cy - r
        ctx.moveTo(0, cy + cx - r);
        ctx.lineTo(W, cy + cx - W - r);
        // line: x + y = -r => Y_c = cx - X_c + cy + r
        ctx.lineTo(W, cy + cx - W + r);
        ctx.lineTo(0, cy + cx + r);
        ctx.closePath();
        ctx.fill();

        // Diag 2: -r <= x - y <= r  ->  y = x ± r
        ctx.beginPath();
        // line: x - y = r => canvas: (X_c - cx) - (cy - Y_c) = r => Y_c = cy - X_c + cx + r
        ctx.moveTo(0, cy - 0 + cx + r);
        ctx.lineTo(W, cy - W + cx + r);
        // line: x - y = -r => Y_c = cy - X_c + cx - r
        ctx.lineTo(W, cy - W + cx - r);
        ctx.lineTo(0, cy - 0 + cx - r);
        ctx.closePath();
        ctx.fill();

        // 5. Compute Wulff Shape (Polygon Intersection)
        // The 8 bounding lines: A*x + B*y = C
        const lines = [
            { A: 1,  B: 0,  C: d },   // x = d
            { A: -1, B: 0,  C: d },   // -x = d  => x = -d
            { A: 0,  B: 1,  C: e },   // y = e
            { A: 0,  B: -1, C: e },   // -y = e  => y = -e
            { A: 1,  B: 1,  C: r },   // x + y = r
            { A: -1, B: -1, C: r },   // -x - y = r => x + y = -r
            { A: 1,  B: -1, C: r },   // x - y = r
            { A: -1, B: 1,  C: r },   // -x + y = r => x - y = -r
        ];

        // The 8 inequalities defining the allowed region: A*x + B*y <= C
        const inequalities = [
            { A: 1,  B: 0,  C: d },
            { A: -1, B: 0,  C: d },
            { A: 0,  B: 1,  C: e },
            { A: 0,  B: -1, C: e },
            { A: 1,  B: 1,  C: r },
            { A: -1, B: -1, C: r },
            { A: 1,  B: -1, C: r },
            { A: -1, B: 1,  C: r },
        ];

        // Find all pair-wise intersections
        const points = [];
        for (let i = 0; i < lines.length; i++) {
            for (let j = i + 1; j < lines.length; j++) {
                const pt = getIntersection(lines[i], lines[j]);
                if (pt) points.push(pt);
            }
        }

        // Filter: Keep only points satisfying ALL inequalities
        const validPoints = points.filter(pt => {
            for (const ineq of inequalities) {
                if (!satisfiesInequality(pt, ineq)) return false;
            }
            return true;
        });

        // Remove duplicates (due to numerical precision/multiple lines crossing at same point)
        const uniquePoints = [];
        for (const pt of validPoints) {
            const isDup = uniquePoints.some(upt => Math.abs(upt.x - pt.x) < 1e-5 && Math.abs(upt.y - pt.y) < 1e-5);
            if (!isDup) uniquePoints.push(pt);
        }

        // Sort by polar angle
        uniquePoints.sort((a, b) => Math.atan2(a.y, a.x) - Math.atan2(b.y, b.x));

        // 6. Draw Wulff Shape
        if (uniquePoints.length > 2) {
            ctx.fillStyle = wulffColor;
            ctx.strokeStyle = "rgba(44, 48, 58, 0.9)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            
            for (let i = 0; i < uniquePoints.length; i++) {
                const pt = uniquePoints[i];
                // Convert Math (x,y) to Canvas (x,y)
                // Math: +y is up. Canvas: +y is down.
                const cx_pt = cx + pt.x;
                const cy_pt = cy - pt.y;
                
                if (i === 0) ctx.moveTo(cx_pt, cy_pt);
                else ctx.lineTo(cx_pt, cy_pt);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }

    }, [coord, eh, ev, ed, scale, bandColor, bandAlpha, wulffColor]);

    // Handle Resize
    useEffect(() => {
        const handleResize = () => {
            if (!containerRef.current || !canvasRef.current) return;
            // 80vh max to keep it nicely contained, or use container width
            const parent = containerRef.current.parentElement;
            const size = Math.min(parent.clientWidth - 4, window.innerHeight * 0.75, 700);
            
            canvasRef.current.width = size;
            canvasRef.current.height = size;
            draw();
        };

        handleResize(); // Init
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [draw]);


    // ── UI Control Styles ─────────────────────────────────────────────────
    const fieldStyle = { border: "1px solid var(--color-pencil)", borderRadius: "var(--radius-md)", padding: "1.25rem", background: "white", boxShadow: "var(--shadow-soft)", marginBottom: "1rem" };
    const legendStyle = { font: "700 0.8rem var(--font-sans)", color: "var(--color-amber)", padding: "0 6px", textTransform: "uppercase", letterSpacing: "0.06em" };
    const ctrlGrid = { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" };
    const lblStyle = { display: "flex", flexDirection: "column", gap: 6, fontSize: "0.75rem", fontWeight: 700, color: "var(--color-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" };
    const inputStyle = { fontFamily: "var(--font-mono)", fontSize: "0.85rem", padding: "6px 8px", border: "1px solid var(--color-pencil)", borderRadius: 6, background: "var(--color-cream)", color: "var(--color-charcoal)" };

    return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", alignItems: "flex-start" }}>
            
            {/* Controls */}
            <div style={{ flex: "1 1 300px", minWidth: 280 }}>
                <fieldset style={fieldStyle}>
                    <legend style={legendStyle}>💎 Crystal Structure</legend>
                    <label style={{ ...lblStyle, marginBottom: "1rem" }}>
                        Coordination Type
                        <select value={coord} onChange={e => setCoord(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                            <option value="4">4-Coordination (Square)</option>
                            <option value="8">8-Coordination (Square + Diag)</option>
                        </select>
                    </label>
                    <div style={{ fontSize: "0.8rem", color: "var(--color-secondary)", lineHeight: 1.6, background: "var(--color-cream)", padding: "10px", borderRadius: 6 }}>
                        Broken-bond multipliers:<br />
                        Hv = <strong>{coord === "4" ? "1" : "3"}</strong> · Diag ≈ <strong>{coord === "4" ? "1.414" : "2.121"}</strong>
                    </div>
                </fieldset>

                <fieldset style={fieldStyle}>
                    <legend style={legendStyle}>⚡ Interfacial Energies</legend>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <label style={{ ...lblStyle, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                            <span>Horizontal (E_h)</span>
                            <input type="number" step="0.1" min="0" value={eh} onChange={e => setEh(Number(e.target.value))} style={{ ...inputStyle, width: "100px", textAlign: "right" }} />
                        </label>
                        <input type="range" min="0" max="5" step="0.1" value={eh} onChange={e => setEh(Number(e.target.value))} style={{ accentColor: "var(--color-cyan)" }} />

                        <label style={{ ...lblStyle, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                            <span>Vertical (E_v)</span>
                            <input type="number" step="0.1" min="0" value={ev} onChange={e => setEv(Number(e.target.value))} style={{ ...inputStyle, width: "100px", textAlign: "right" }} />
                        </label>
                        <input type="range" min="0" max="5" step="0.1" value={ev} onChange={e => setEv(Number(e.target.value))} style={{ accentColor: "var(--color-cyan)" }} />

                        <label style={{ ...lblStyle, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                            <span>Diagonal (E_d)</span>
                            <input type="number" step="0.1" min="0" value={ed} onChange={e => setEd(Number(e.target.value))} style={{ ...inputStyle, width: "100px", textAlign: "right" }} />
                        </label>
                        <input type="range" min="0" max="5" step="0.1" value={ed} onChange={e => setEd(Number(e.target.value))} style={{ accentColor: "var(--color-cyan)" }} />
                    </div>
                </fieldset>

                <fieldset style={fieldStyle}>
                    <legend style={legendStyle}>🎨 Visuals</legend>
                    <div style={ctrlGrid}>
                        <label style={lblStyle}>
                            Scale (S)
                            <input type="number" step="5" min="10" value={scale} onChange={e => setScale(Number(e.target.value))} style={inputStyle} />
                        </label>
                        <label style={lblStyle}>
                            Band Alpha
                            <input type="number" step="0.05" min="0" max="1" value={bandAlpha} onChange={e => setBandAlpha(Number(e.target.value))} style={inputStyle} />
                        </label>
                        <label style={lblStyle}>
                            Band Color
                            <input type="color" value={bandColor} onChange={e => setBandColor(e.target.value)} style={{ ...inputStyle, padding: "2px", height: "34px", width: "100%", cursor: "pointer" }} />
                        </label>
                        <label style={lblStyle}>
                            Wulff Color
                            <input type="color" value={wulffColor} onChange={e => setWulffColor(e.target.value)} style={{ ...inputStyle, padding: "2px", height: "34px", width: "100%", cursor: "pointer" }} />
                        </label>
                    </div>
                </fieldset>
            </div>

            {/* Canvas */}
            <div ref={containerRef} style={{ flex: "1 1 500px", display: "flex", justifyContent: "center", alignItems: "flex-start", position: "sticky", top: "2rem" }}>
                <div className="polaroid" style={{ margin: 0, width: "100%" }}>
                    <div style={{ width: "100%", aspectRatio: "1", overflow: "hidden", background: "#fdfbf7", borderRadius: "2px" }}>
                        <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
                    </div>
                    <div className="polaroid-caption">
                        Equilibrium Crystal Shape (Wulff Construction)
                    </div>
                </div>
            </div>

        </div>
    );
}
