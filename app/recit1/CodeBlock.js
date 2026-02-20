"use client";

import { Highlight, themes } from "prism-react-renderer";

export default function CodeBlock({ code, maxHeight }) {
    return (
        <Highlight theme={themes.nightOwl} code={code.trim()} language="javascript">
            {({ style, tokens, getLineProps, getTokenProps }) => (
                <pre
                    style={{
                        ...style,
                        padding: "1.25rem",
                        borderRadius: "8px",
                        overflowX: "auto",
                        fontSize: "0.85rem",
                        marginTop: "1rem",
                        lineHeight: 1.6,
                        ...(maxHeight
                            ? { maxHeight, overflowY: "auto" }
                            : {}),
                    }}
                >
                    {tokens.map((line, i) => {
                        const lineProps = getLineProps({ line, key: i });
                        return (
                            <div key={i} {...lineProps}>
                                <span
                                    style={{
                                        display: "inline-block",
                                        width: "2.5em",
                                        textAlign: "right",
                                        marginRight: "1.25em",
                                        color: "rgba(255,255,255,0.25)",
                                        userSelect: "none",
                                        fontSize: "0.8em",
                                    }}
                                >
                                    {i + 1}
                                </span>
                                {line.map((token, key) => (
                                    <span key={key} {...getTokenProps({ token, key })} />
                                ))}
                            </div>
                        );
                    })}
                </pre>
            )}
        </Highlight>
    );
}
