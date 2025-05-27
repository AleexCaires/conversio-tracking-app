import React, { useState, useEffect, useMemo } from "react";
import { ChildrenWrapper } from "./EventDisplay.styles";
import { Event as TypedEvent } from "@/types"; // Import the Event type from your types file

// Update your Event interface to match the one from types/index.ts
// or remove it entirely if you're using the imported type
interface Event {
  eventAction?: string; // Make this optional to match the type
  eventCategory?: string; // Make this optional to match the type
  eventLabel?: string; // Make this optional to match the type
  eventSegment?: string; // Make this optional to match the type
  triggerEvent?: boolean;
  codeCopied?: boolean;
  event?: string;
  eventData?: {
    click?: {
      clickAction?: string;
      clickLocation?: string;
      clickText?: string;
      triggerEvent?: boolean;
    };
    triggerEvent?: boolean;
  };
  conversio?: {
    conversio_experiences?: string;
    conversio_events?: string;
    conversio_segment?: string;
  };
}

interface EventDisplayProps {
  title: string;
  events: (TypedEvent | string)[]; // Update to use TypedEvent instead of local Event
  onCopy: (text: string) => void;
}

const EventDisplay: React.FC<EventDisplayProps> = ({ title, events, onCopy }) => {
  const [activeBorders, setActiveBorders] = useState<Record<string, boolean>>({});
  const [copiedState, setCopiedState] = useState<Record<string, boolean>>({});

  const parseEvent = useMemo(() => {
    return (event: Event | string): Event => {
      if (typeof event === "string") {
        const parsed: Event = JSON.parse(event);
        if ("event" in parsed && parsed.event === "targetClickEvent" && parsed.eventData?.click) {
          const { clickAction, clickLocation, clickText } = parsed.eventData.click;
          const triggerEvent =
            typeof parsed.triggerEvent !== "undefined"
              ? Boolean(parsed.triggerEvent)
              : typeof parsed.eventData?.triggerEvent !== "undefined"
              ? Boolean(parsed.eventData?.triggerEvent)
              : typeof parsed.eventData?.click?.triggerEvent !== "undefined"
              ? Boolean(parsed.eventData?.click?.triggerEvent)
              : false;
          return {
            eventAction: clickAction || "N/A",
            eventCategory: clickLocation || "N/A",
            eventLabel: clickText || "N/A",
            eventSegment: "",
            triggerEvent,
          };
        }
        return {
          ...parsed,
          triggerEvent: Boolean(parsed.triggerEvent),
        };
      } else if (event && typeof event === "object") {
        const eventObj = event as Event & { event?: string; eventData?: Event["eventData"] };
        if (eventObj.event === "targetClickEvent" && eventObj.eventData?.click) {
          const { clickAction, clickLocation, clickText } = eventObj.eventData.click;
          const triggerEvent =
            typeof eventObj.triggerEvent !== "undefined"
              ? Boolean(eventObj.triggerEvent)
              : typeof eventObj.eventData?.triggerEvent !== "undefined"
              ? Boolean(eventObj.eventData?.triggerEvent)
              : typeof eventObj.eventData?.click?.triggerEvent !== "undefined"
              ? Boolean(eventObj.eventData?.click?.triggerEvent)
              : false;
          return {
            eventAction: clickAction || "N/A",
            eventCategory: clickLocation || "N/A",
            eventLabel: clickText || "N/A",
            eventSegment: "",
            triggerEvent,
          };
        }
        return {
          ...eventObj,
          triggerEvent: Boolean(eventObj.triggerEvent),
        };
      }
      return event as Event;
    };
  }, []);

  const parsedEvents: Event[] = useMemo(() => events.map(parseEvent), [events, parseEvent]);

  const getInitialCopiedState = useMemo(() => {
    const state: Record<string, boolean> = {};
    parsedEvents.forEach((event, idx) => {
      const eventWithCopied = event as Event & { codeCopied?: boolean };
      const checked = !!eventWithCopied.codeCopied;
      state[`${idx}-code`] = checked;
    });
    return state;
  }, [parsedEvents]);

  useEffect(() => {
    setCopiedState(getInitialCopiedState);
  }, [getInitialCopiedState]);

  if (!events || events.length === 0) return null;

  const getEventLabel = (event: Event): string => {
    // Sephora: use conversio_experiences as label
    if (event.conversio && event.conversio.conversio_experiences) {
      return event.conversio.conversio_experiences;
    }
    // Standard: use eventLabel with fallback to prevent undefined
    return event.eventLabel ?? '';
  };

  // const getVariationNumber = (event: Event): string => {
  //   // Sephora: extract from conversio_experiences
  //   if (event.conversio && event.conversio.conversio_experiences) {
  //     const match = event.conversio.conversio_experiences.match(/\(Variation (\d+)\)/);
  //     if (match) return match[1];
  //     // If not a variation, check for Control
  //     if (event.conversio.conversio_experiences.includes("Control")) return "Control";
  //   }
  //   // Standard: extract from eventLabel
  //   if (event.eventLabel) {
  //     const match = event.eventLabel.match(/\(Variation (\d+)\)/);
  //     if (match) return match[1];
  //     if (event.eventLabel.includes("Control")) return "Control";
  //   }
  //   // Fallback: if not found, try to infer by position or return "Control"
  //   return "Control";
  // };

  const eventLabels = parsedEvents
    .map((event) => ({
      label: getEventLabel(event),
      triggerEvent: event.triggerEvent,
    }))
    .filter((item) => item.label && item.label.trim() !== "." && item.label.trim() !== "");

  const handleCopy = (index: number, type: "code" | "segment", text: string) => {
    const key = `${index}-${type}`;
    onCopy(text);
    setCopiedState((prev) => ({ ...prev, [key]: true }));
    setActiveBorders((prev) => ({ ...prev, [key]: true }));
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      <h3 style={{ marginBottom: "1rem", fontSize: "1.25rem", color: "#222" }}>{title}</h3>

      {eventLabels.length > 0 && (
        <div style={{ marginBottom: "1rem", color: "#555", fontSize: "1rem" }}>
          <strong>Event Labels:</strong>
          <ul style={{ margin: 0, paddingLeft: "1.25rem", listStyle: "none" }}>
            {eventLabels.map((item, idx) => (
              <li
                key={idx}
                style={{
                  lineHeight: "2",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span style={{ marginRight: "0.5em" }}>{idx + 1}.</span>
                {item.label}
                {item.triggerEvent && <span style={{ color: "#d35400", fontWeight: 600, marginLeft: "0.5em" }}>(Trigger Event)</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <ChildrenWrapper>
        {parsedEvents.map((event, index) => {
          // Detect Sephora event by presence of conversio property
          const isSephoraFormat = !!event.conversio;
          
          // Get segment value based on format (Sephora or standard)
          const segmentValue = isSephoraFormat 
            ? event.conversio?.conversio_segment 
            : event.eventSegment;

          // Detect Adobe Target event
          const isAdobeTarget = !event.eventSegment && event.eventCategory && event.eventLabel;

          let eventCode;

          if (isSephoraFormat && event.conversio) {
            const sephoraData = event.conversio;
            eventCode = `window.dataLayer.push({
  "event": "conversioEvent", 
  "conversio": {
    "conversio_experiences": "${sephoraData.conversio_experiences || ''}",
    "conversio_events": "${sephoraData.conversio_events || ''}",
    "conversio_segment": "${sephoraData.conversio_segment || ''}"
  }
});`;
          } else if (isAdobeTarget) {
            eventCode = `adobeDataLayer.push({
  event: "targetClickEvent",
  eventData: {
    click: {
      clickLocation: "${event.eventCategory}",
      clickAction: "${event.eventAction}",
      clickText: "${event.eventLabel}"
    }
  }
});`;
          } else {
            eventCode = `window.dataLayer.push({
  event: "conversioEvent",
    conversio: {
      "eventCategory": "${event.eventCategory}",
      "eventAction": "${event.eventAction}",
      "eventLabel": "${event.eventLabel}",
      "eventSegment": "${event.eventSegment}"
    }
});`;
          }

          const codeKey = `${index}-code`;
          const segmentKey = `${index}-segment`;

          return (
            <div key={index} style={{ marginBottom: "2rem" }} data-copied={!!copiedState[codeKey]}>
              {event.eventLabel && event.eventLabel.trim() !== "." && event.eventLabel.trim() !== "" && (
                <div style={{ marginBottom: "0.5rem", color: "#444", fontWeight: 500 }}>
                  {isSephoraFormat ? event.conversio?.conversio_experiences : event.eventLabel}
                  {event.triggerEvent && <span style={{ color: "#d35400", fontWeight: 600, marginLeft: "0.5em" }}>(Trigger Event)</span>}
                </div>
              )}

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

                {segmentValue && (
                  <button
                    onClick={() => handleCopy(index, "segment", segmentValue)}
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
