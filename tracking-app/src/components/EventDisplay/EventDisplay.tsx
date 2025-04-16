import React from "react";

interface Event {
  eventAction: string;
  eventCategory: string;
  eventLabel: string;
  eventSegment: string;
}

interface EventDisplayProps {
  title: string;
  events: (Event | string)[]; // Allow events to be either objects or JSON strings
  onCopy: (text: string) => void;
}

const EventDisplay: React.FC<EventDisplayProps> = ({ title, events, onCopy }) => {
  if (!events || events.length === 0) return null;

  // Parse events if they are JSON strings
  const parsedEvents: Event[] = events.map((event) =>
    typeof event === "string" ? JSON.parse(event) : event
  );

  // Sort events based on their order in the array or any specific property
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

        {sortedEvents.map((event, index) => {
          const eventCode = `window.dataLayer.push({
    'event': 'conversioEvent',
    'conversio': ${JSON.stringify(event, null, 2)}
});`;

          return (

            <div
              key={index}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "16px",
                backgroundColor: "#f9f9f9",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              }}
            >
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
              <button
                onClick={() => onCopy(eventCode)} // Pass the full eventCode to the onCopy function
                style={{
                  marginTop: "10px",
                  padding: "8px 12px",
                  fontSize: "14px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Copy Code
              </button>
              </div>
            </div>
            
          );
        })}
      </div>
    </div>
  );
};

export default EventDisplay;


