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
    navigator.clipboard.writeText(text).then(() => {
      alert("Code copied to clipboard!");
    });
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Close the modal only if the user clicks on the overlay, not the modal content
    if (e.target === e.currentTarget) {
      onClose();
    }
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
          }}>
          &times;
        </button>

        {content?.controlEvents && (
          <EventDisplay
            title="Control Events"
            events={content.controlEvents}
            onCopy={copyToClipboard}
          />
        )}

        {content?.variationEvents && (
          <EventDisplay
            title="Variation Events"
            events={content.variationEvents}
            onCopy={copyToClipboard}
          />
        )}
      </div>
    </div>
  );
};

export default Modal;