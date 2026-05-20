"use client";

import { useState } from "react";
import chatData from "./chatData.json";

function formatText(text) {
  if (!text) return null;

  const lines = text.split("\n");
  const elements = [];
  let inCodeBlock = false;
  let codeLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${i}`} className="chat-code-block">
            <code>{codeLines.join("\n")}</code>
          </pre>
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    if (!line.trim()) {
      elements.push(<br key={`br-${i}`} />);
      continue;
    }

    let processed = line;
    processed = processed.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    processed = processed.replace(/\*(.+?)\*/g, "<em>$1</em>");
    processed = processed.replace(/`([^`]+)`/g, '<code class="chat-inline-code">$1</code>');

    elements.push(
      <span
        key={`line-${i}`}
        dangerouslySetInnerHTML={{ __html: processed }}
        style={{ display: "block" }}
      />
    );
  }

  if (inCodeBlock && codeLines.length > 0) {
    elements.push(
      <pre key="code-final" className="chat-code-block">
        <code>{codeLines.join("\n")}</code>
      </pre>
    );
  }

  return elements;
}

function MessageBubble({ text, role, index }) {
  const [expanded, setExpanded] = useState(false);
  const isUser = role === "user";
  const charLimit = isUser ? 300 : 500;
  const isLong = text.length > charLimit;
  const displayText = isLong && !expanded ? text.slice(0, charLimit) + "..." : text;

  return (
    <div className={`chat-message ${isUser ? "chat-user" : "chat-model"}`}>
      <div className="chat-avatar">
        {isUser ? (
          <div className="chat-avatar-user">A</div>
        ) : (
          <div className="chat-avatar-gemini">G</div>
        )}
      </div>
      <div className="chat-bubble-wrapper">
        <span className="chat-sender">{isUser ? "Ahmet" : "Gemini"}</span>
        <div className={`chat-bubble ${isUser ? "chat-bubble-user" : "chat-bubble-model"}`}>
          <div className="chat-text">{formatText(displayText)}</div>
          {isLong && (
            <button
              className="chat-expand-btn"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChatHistory() {
  const [visibleCount, setVisibleCount] = useState(8);
  const total = chatData.length;
  const pairs = chatData.slice(0, visibleCount);

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-header-dot" />
        <div className="chat-header-dot" />
        <div className="chat-header-dot" />
        <span className="chat-header-title">
          Gemini &mdash; Recitation Conversations
        </span>
        <span className="chat-header-count">
          {total} messages
        </span>
      </div>

      <div className="chat-body">
        {pairs.map((pair, i) => (
          <div key={i} className="chat-pair">
            {pair.user && (
              <MessageBubble text={pair.user} role="user" index={i} />
            )}
            {pair.model && (
              <MessageBubble text={pair.model} role="model" index={i} />
            )}
          </div>
        ))}

        {visibleCount < total && (
          <div className="chat-load-more">
            <button
              className="chat-load-btn"
              onClick={() =>
                setVisibleCount((c) => Math.min(c + 8, total))
              }
            >
              Load more messages ({total - visibleCount} remaining)
            </button>
          </div>
        )}

        {visibleCount >= total && (
          <div className="chat-end">
            End of conversation
          </div>
        )}
      </div>
    </div>
  );
}
