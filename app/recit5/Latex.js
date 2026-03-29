"use client";
import { useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

/**
 * Renders a LaTeX math string using KaTeX.
 * @param {string} children - The raw LaTeX source (without $ delimiters).
 * @param {boolean} [block=false] - If true, renders in display mode (centered block).
 */
export default function Latex({ children, block = false }) {
    const ref = useRef(null);

    useEffect(() => {
        if (ref.current) {
            try {
                katex.render(children, ref.current, {
                    displayMode: block,
                    throwOnError: false,
                    strict: false,
                });
            } catch (e) {
                console.warn("KaTeX render error:", e);
                ref.current.textContent = children;
            }
        }
    }, [children, block]);

    return <span ref={ref} />;
}
