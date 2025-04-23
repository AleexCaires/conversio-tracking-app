import React, { useState } from "react";
import { ChildrenWrapper } from "./EventDisplay.styles";

interface Event {
  eventAction: string;
  eventCategory: string;
  eventLabel: string;
  eventSegment: string;
}

interface EventDisplayProps {
  title: string;
  events: (Event | string)[];
  onCopy: (text: string) => void;
}

const EventDisplay: React.FC<EventDisplayProps> = ({ title, events, onCopy }) => {
  const [copiedState, setCopiedState] = useState<Record<string, boolean>>({});

  if (!events || events.length === 0) return null;

  const parsedEvents: Event[] = events.map((event) =>
    typeof event === "string" ? JSON.parse(event) : event
  );

  const handleCopy = (index: number, type: "code" | "segment", text: string) => {
    const key = `${index}-${type}`;
    onCopy(text);
    setCopiedState((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedState((prev) => ({ ...prev, [key]: false }));
    }, 2000);
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      <h3 style={{ marginBottom: "1rem", fontSize: "1.25rem", color: "#222" }}>
        {title}
      </h3>

      <ChildrenWrapper>
        {parsedEvents.map((event, index) => {
          const eventCode = `window.dataLayer.push({
  event: 'conversioEvent',
  conversio: ${JSON.stringify(event, null, 2)}
});`;

          const codeKey = `${index}-code`;
          const segmentKey = `${index}-segment`;

          return (
            <div key={index} style={{ marginBottom: "2rem" }}>
              <h4 style={{ marginBottom: "0.5rem", color: "#444" }}>
                Event {index + 1}
              </h4>

              <pre
                style={{
                  background: "#1e1e1e",
                  color: "#f5f5f5",
                  padding: "1rem",
                  borderRadius: "0.5rem",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  maxHeight: "300px",
                  overflowY: "auto",
                }}
              >
                {eventCode}
              </pre>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem" }}>
                <button
                  onClick={() => handleCopy(index, "code", eventCode)}
                  style={{
                    padding: "0.5rem 1rem",
                    fontSize: "0.9rem",
                    backgroundColor: copiedState[codeKey] ? "#0056b3" : "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "0.25rem",
                    cursor: "pointer",
                    transition: "background 0.3s ease",
                  }}
                >
                  {copiedState[codeKey] ? "Copied!" : "Copy Code"}
                </button>

                <button
                  onClick={() => handleCopy(index, "segment", event.eventSegment)}
                  style={{
                    padding: "0.5rem 1rem",
                    fontSize: "0.9rem",
                    backgroundColor: copiedState[segmentKey] ? "#1c7c3e" : "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "0.25rem",
                    cursor: "pointer",
                    transition: "background 0.3s ease",
                  }}
                >
                  {copiedState[segmentKey] ? "Segment Copied!" : "Copy Segment"}
                </button>
              </div>
            </div>
          );
        })}
      </ChildrenWrapper>
    </div>
  );
};

export default EventDisplay;
