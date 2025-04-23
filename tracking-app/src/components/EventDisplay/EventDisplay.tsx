import React, { useState } from "react";
import { ChildrenWrapper } from './EventDisplay.styles';

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
  if (!events || events.length === 0) return null;

  const [copiedState, setCopiedState] = useState<Record<string, boolean>>({});

  const handleCopy = (index: number, type: "code" | "segment", text: string) => {
    const key = `${index}-${type}`;
    onCopy(text);
    setCopiedState((prev) => ({ ...prev, [key]: true }));
    // Not disabling button so user can copy again
  };

  const parsedEvents: Event[] = events.map((event) =>
    typeof event === "string" ? JSON.parse(event) : event
  );

  const sortedEvents = [...parsedEvents].sort((a, b) => {
    const labelA = a.eventLabel || "";
    const labelB = b.eventLabel || "";
    return labelA.localeCompare(labelB);
  });

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>{title}</h3>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          padding: "10px",
        }}
      >
        <ChildrenWrapper>
          {sortedEvents.map((event, index) => {
            const eventCode = `window.dataLayer.push({
  'event': 'conversioEvent',
  'conversio': ${JSON.stringify(event, null, 2)}
});`;

            const codeKey = `${index}-code`;
            const segmentKey = `${index}-segment`;

            return (
              <div key={index}>
                <h4 style={{ marginBottom: "10px", color: "#333" }}>
                  Event {index + 1}
                </h4>
                <div>
                  <pre
                    style={{
                      backgroundColor: "#1e1e1e",
                      color: "#f5f5f5",
                      padding: "16px",
                      borderRadius: "8px",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      maxHeight: "300px",
                      overflowY: "auto",
                    }}
                  >
                    {eventCode}
                  </pre>
                  <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => handleCopy(index, "code", eventCode)}
                      style={{
                        padding: "8px 12px",
                        fontSize: "14px",
                        backgroundColor: copiedState[codeKey] ? "#0056b3" : "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      {copiedState[codeKey] ? "Copied!" : "Copy Code"}
                    </button>
                    <button
                      onClick={() => handleCopy(index, "segment", event.eventSegment)}
                      style={{
                        padding: "8px 12px",
                        fontSize: "14px",
                        backgroundColor: copiedState[segmentKey] ? "#1c7c3e" : "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      {copiedState[segmentKey] ? "Segment Copied!" : "Copy Segment"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </ChildrenWrapper>
      </div>
    </div>
  );
};

export default EventDisplay;
