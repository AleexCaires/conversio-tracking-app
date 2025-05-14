import React from "react";
import EventDisplay from "@/components/EventDisplay/EventDisplay";
import { ModalOverlay, ModalContainer, ModalHeader, CloseButton, ModalContent } from "./Modal.styles"; // Import styled components
import { FaTrash } from "react-icons/fa"; // Add this import at the top

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: any;
  experienceNumber?: string;
  experienceName?: string;
  client?: string; // <-- add this if needed
  onRefresh?: () => void; // Add refresh callback
}

// Add clients array definition
const clients = [
  { name: "Finisterre", code: "FN" },
  { name: "Liverpool FC", code: "LF" },
  { name: "Phase Eight", code: "PH" },
  { name: "Hobbs", code: "HO" },
  { name: "Whistles", code: "WC" },
  { name: "Laithwaites", code: "LT" },
  { name: "Accessorize", code: "AS" },
  { name: "Monsoon", code: "MS" },
  { name: "Ocado", code: "OPT" },
  { name: "Team Sport", code: "TS" },
  { name: "Sephora", code: "SA" },
];

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  content,
  experienceNumber,
  experienceName,
  client,
  onRefresh, // Add refresh callback
}) => {
  if (!isOpen) return null;

  // Extract client code from experienceNumber if not provided directly
  // This assumes experienceNumber format is like "FN123" or "LT456" 
  const extractClientCode = (expNumber: string | undefined): string => {
    if (!expNumber) return "";
    
    // Try to get first 2 or 3 characters as the client code
    const possibleClientCodes = [
      expNumber.substring(0, 2), // Try 2-character code
      expNumber.substring(0, 3), // Try 3-character code
    ];
    
    // Check if any extracted code matches our known client codes
    for (const code of possibleClientCodes) {
      if (clients.some(c => c.code === code)) {
        return code;
      }
    }
    
    return "";
  };
  
  // Try to get client value from multiple sources
  const clientValue =
    client ||
    content?.client ||
    content?.selectedClient ||
    extractClientCode(experienceNumber) || // Extract from experienceNumber
    "";
    
  console.log("Client value:", clientValue, "Experience number:", experienceNumber); // Debug

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Check if the click target is the overlay itself
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

    return Object.entries(grouped);
  };

  // Add delete handler
  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent modal close on click
    console.log("Delete clicked. Values:", { clientValue, experienceNumber }); // Add debug
    
    if (!experienceNumber) {
      alert("Missing experience number.");
      return;
    }
    
    if (!clientValue) {
      alert("Missing client code. Cannot delete.");
      return;
    }
    
    if (!window.confirm("Are you sure you want to delete this experience?")) return;
    try {
      console.log("Deleting experience:", { client: clientValue, experienceNumber }); // Debug
      const res = await fetch("/api/delete-element", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client: clientValue, experienceNumber }),
      });
      if (res.ok) {
        // Call refresh callback if provided before closing modal
        if (onRefresh) {
          onRefresh();
        }
        onClose();
      } else {
        alert("Failed to delete.");
      }
    } catch (err) {
      alert("Error deleting.");
    }
  };

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      {/* Prevent clicks inside the container from closing the modal */}
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        {/* Header Section */}
        <ModalHeader>
          <div style={{ flex: 1, fontWeight: 600, fontSize: "1.1rem", textAlign: "left" }}>
            {(experienceNumber || experienceName) && (
              <span style={{ color: "inherit" }}>
                {experienceNumber ? experienceNumber : ""}
                {experienceNumber && experienceName ? " - " : ""}
                {experienceName ? experienceName : ""}
              </span>
            )}
          </div>
          {/* Add bin icon button */}
          <button
            onClick={handleDelete}
            type="button"
            style={{
              background: "none",
              border: "none",
              color: "#d32f2f",
              cursor: "pointer",
              marginRight: "0.5rem",
              fontSize: "1.2rem",
              display: "flex",
              alignItems: "center",
              zIndex: 2,
            }}
            title="Delete this experience"
          >
            <FaTrash />
          </button>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>

        {/* Content Section */}
        <ModalContent>
          {content?.controlEvents && <EventDisplay title="Control Events" events={content.controlEvents} onCopy={copyToClipboard} />}

          {Array.isArray(content?.variationEvents) && groupEventsByVariation(content.variationEvents).map(([variation, events]) => <EventDisplay key={variation} title={`Variation ${variation}`} events={events} onCopy={copyToClipboard} />)}
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default Modal;

