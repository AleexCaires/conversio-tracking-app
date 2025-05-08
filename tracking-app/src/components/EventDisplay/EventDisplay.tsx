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
  const [activeBorders, setActiveBorders] = useState<Record<string, boolean>>({}); // Track active borders for multiple events

  if (!events || events.length === 0) return null;

  const parsedEvents: Event[] = events.map((event) => {
    if (typeof event === "string") {
      const parsed = JSON.parse(event);
      // Check if the event is Adobe-specific
      if (parsed.event === "targetClickEvent" && parsed.eventData?.click) {
        const { clickAction, clickLocation, clickText } = parsed.eventData.click;
        return {
          eventAction: clickAction || "N/A",
          eventCategory: clickLocation || "N/A",
          eventLabel: clickText || "N/A",
          eventSegment: "", // Adobe-specific events do not have eventSegment
        };
      }
      return parsed;
    } else if (event.event === "targetClickEvent" && event.eventData?.click) {
      // Handle Adobe-specific events passed as objects
      const { clickAction, clickLocation, clickText } = event.eventData.click;
      return {
        eventAction: clickAction || "N/A",
        eventCategory: clickLocation || "N/A",
        eventLabel: clickText || "N/A",
        eventSegment: "", // Adobe-specific events do not have eventSegment
      };
    }
    return event;
  });

  // Collect all eventLabels, filtering out dots and empty/whitespace-only labels
  const eventLabels = parsedEvents.map((event) => event.eventLabel).filter((label) => label && label.trim() !== "." && label.trim() !== "");

  const handleCopy = (index: number, type: "code" | "segment", text: string) => {
    const key = `${index}-${type}`;
    const borderColor = type === "code" ? "blue" : "pink"; // Set border color based on type

    onCopy(text);
    setCopiedState((prev) => ({ ...prev, [key]: true }));
    setActiveBorders((prev) => ({ ...prev, [key]: true })); // Add the key to active borders
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      <h3 style={{ marginBottom: "1rem", fontSize: "1.25rem", color: "#222" }}>{title}</h3>

      {/* Show all eventLabels below the title */}
      {eventLabels.length > 0 && (
        <div style={{ marginBottom: "1rem", color: "#555", fontSize: "1rem" }}>
          <strong>Event Labels:</strong>
          <ul style={{ margin: 0, paddingLeft: "1.25rem", listStyle: "none" }}>
            {eventLabels.map((label, idx) => (
              <li
                key={idx}
                style={{
                  lineHeight: "2", // Increased line height
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span style={{ marginRight: "0.5em" }}>{idx + 1}.</span>
                {label}
              </li>
            ))}
          </ul>
        </div>
      )}

      <ChildrenWrapper>
        {parsedEvents.map((event, index) => {
          const eventCode =
            event.eventCategory === "Conversio CRO" && event.eventSegment
              ? `window.dataLayer.push({
  event: "conversioEvent",
    conversio: {
      "eventCategory": "${event.eventCategory}",
      "eventAction": "${event.eventAction}",
      "eventLabel": "${event.eventLabel}",
      "eventSegment": "${event.eventSegment}"
    }
});`
              : `adobeDataLayer.push({
  event: "targetClickEvent",
  eventData: {
    click: {
      clickLocation: "${event.eventCategory}",
      clickAction: "${event.eventAction}",
      clickText: "${event.eventLabel}"
    }
  }
});`;

          const codeKey = `${index}-code`;
          const segmentKey = `${index}-segment`;

          return (
            <div key={index} style={{ marginBottom: "2rem" }}>
              {/* Show eventLabel above the code block, if present */}
              {event.eventLabel && event.eventLabel.trim() !== "." && event.eventLabel.trim() !== "" && <div style={{ marginBottom: "0.5rem", color: "#444", fontWeight: 500 }}>{event.eventLabel}</div>}

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
                  border: activeBorders[codeKey] ? "2px solid #007bff" : activeBorders[segmentKey] ? "2px solid #28a745" : "2px solid transparent",
                  boxShadow: activeBorders[codeKey] ? "0 0 10px #007bff, 0 0 20px #007bff" : activeBorders[segmentKey] ? "0 0 10px #28a745, 0 0 20px #28a745" : "none",
                  transition: "box-shadow 0.3s ease, border 0.3s ease",
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

                {event.eventSegment && (
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
                )}
              </div>
            </div>
          );
        })}
      </ChildrenWrapper>
    </div>
  );
};

export default EventDisplay;
