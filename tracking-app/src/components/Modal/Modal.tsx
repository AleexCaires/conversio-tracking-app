import React from "react";
import EventDisplay from "@/components/EventDisplay/EventDisplay";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: any;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, content }) => {
  if (!isOpen) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const groupEventsByVariation = (rawEvents: any[]) => {
    const grouped: Record<string, any[]> = {};

    rawEvents.forEach((event) => {
      try {
        // If the event is a string, parse it as JSON
        const parsedEvent = typeof event === "string" ? JSON.parse(event) : event;

        let variation = "Unknown";

        // Handle Adobe-specific events
        if (parsedEvent.event === "targetClickEvent" && parsedEvent.eventData?.click) {
          const clickText = parsedEvent.eventData.click.clickText;
          const labelMatch = clickText?.match(/\(Variation (\d+)\)/);
          variation = labelMatch ? labelMatch[1] : "Unknown";
        } else if (parsedEvent.eventLabel) {
          // Handle standard events
          const labelMatch = parsedEvent.eventLabel.match(/\(Variation (\d+)\)/);
          variation = labelMatch ? labelMatch[1] : "Unknown";
        }

        if (!grouped[variation]) grouped[variation] = [];
        grouped[variation].push(parsedEvent);
      } catch (error) {
        console.error("Error processing event:", event, error);
      }
    });

    return Object.entries(grouped); // [ [variationNumber, events[]], ... ]
  };

  return (
    <div
      onClick={handleOverlayClick}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center", // Center horizontally
        alignItems: "center", // Center vertically
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "8px",
          maxWidth: "90vw", // Max width relative to viewport width
          width: "90%", // Use percentage or fixed width as needed
          maxHeight: "90vh", // Max height relative to viewport height
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header Section (Not Scrollable) */}
        <div
          style={{
            padding: "1rem 2rem",
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            position: "relative",
            flexShrink: 0,
          }}
        >
          {/* You can add a title here if needed */}
          <button
            onClick={onClose}
            style={{
              // Removed absolute positioning, using flexbox alignment now
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              lineHeight: 1, // Ensure button doesn't take extra vertical space
            }}
          >
            &times;
          </button>
        </div>

        {/* Content Section (Scrollable) */}
        <div
          style={{
            padding: "1rem 2rem 2rem 2rem",
            overflowY: "auto",
            flexGrow: 1,
          }}
        >
          {content?.controlEvents && <EventDisplay title="Control Events" events={content.controlEvents} onCopy={copyToClipboard} />}

          {Array.isArray(content?.variationEvents) && groupEventsByVariation(content.variationEvents).map(([variation, events]) => <EventDisplay key={variation} title={`Variation ${variation}`} events={events} onCopy={copyToClipboard} />)}
        </div>
      </div>
    </div>
  );
};

export default Modal;
