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

  const groupEventsByVariation = (rawEvents: string[]) => {
    const grouped: Record<string, any[]> = {};

    rawEvents.forEach((eventStr) => {
      try {
        const event = JSON.parse(eventStr);
        const labelMatch = event.eventLabel.match(/\(Variation (\d+)\)/);
        const variation = labelMatch ? labelMatch[1] : "Unknown";

        if (!grouped[variation]) grouped[variation] = [];
        grouped[variation].push(event);
      } catch (error) {
        console.error("Error parsing event string:", eventStr, error);
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
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: "2rem",
          borderRadius: "8px",
          maxWidth: "90vw",
          width: "90%",
          maxHeight: "90%",
          overflowY: "auto",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "none",
            border: "none",
            fontSize: "1.5rem",
            cursor: "pointer",
          }}
        >
          &times;
        </button>

        {content?.controlEvents && (
          <EventDisplay
            title="Control Events"
            events={content.controlEvents}
            onCopy={copyToClipboard}
          />
        )}

        {Array.isArray(content?.variationEvents) &&
          groupEventsByVariation(content.variationEvents).map(
            ([variation, events]) => (
              <EventDisplay
                key={variation}
                title={`Variation ${variation}`}
                events={events}
                onCopy={copyToClipboard}
              />
            )
          )}
      </div>
    </div>
  );
};

export default Modal;
