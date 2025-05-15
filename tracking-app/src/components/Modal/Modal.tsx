import React from "react";
import EventDisplay from "@/components/EventDisplay/EventDisplay";
import { ModalOverlay, ModalContainer, ModalHeader, CloseButton, ModalContent } from "./Modal.styles";
import { FaTrash, FaEdit } from "react-icons/fa"; // Add FaEdit icon import
import { useRouter } from "next/navigation"; // Import useRouter
import { clients } from "@/lib/clients";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: any;
  experienceNumber?: string;
  experienceName?: string;
  client?: string; // <-- add this if needed
  onRefresh?: () => void; // Add refresh callback
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  content, // This is the full 'item' from historyComp, containing 'item.events' (grouped)
  experienceNumber,
  experienceName,
  client, // This is item.client
  onRefresh,
}) => {
  const router = useRouter(); // Add router

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

  // Prepare flat event arrays for EventDisplay from the grouped content.events
  const controlEventsForDisplay = content?.events?.find((g: any) => g.label === "Dummy Control" || g.label === "Control")?.events || [];
  
  const variationEventsForDisplay = content?.events
    ?.filter((g: any) => typeof g.label === 'string' && g.label.startsWith("Variation "))
    ?.flatMap((g: any) => g.events || []) || [];

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

  // Add edit handler function
  const handleEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    
    if (!experienceNumber || !clientValue) {
      alert("Missing required information for editing.");
      return;
    }

    // Store only essential data needed for edit
    const editPayloadToStore = {
      id: experienceNumber,
      client: clientValue,
      name: experienceName || "",
      events: content.events
    };
    
    localStorage.setItem("editExperienceData", JSON.stringify(editPayloadToStore));
    router.push(`/?edit=${experienceNumber}`);
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
          {/* Add edit button */}
          <button
            onClick={handleEdit}
            type="button"
            style={{
              background: "none",
              border: "none",
              color: "#4CAF50",
              cursor: "pointer",
              marginRight: "0.5rem",
              fontSize: "1.2rem",
              display: "flex",
              alignItems: "center",
              zIndex: 2,
            }}
            title="Edit this experience"
          >
            <FaEdit />
          </button>
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
          <EventDisplay title="Control Events" events={controlEventsForDisplay} onCopy={copyToClipboard} />
          {/* groupEventsByVariation expects a flat array of event objects */}
          {Array.isArray(variationEventsForDisplay) && groupEventsByVariation(variationEventsForDisplay).map(([variation, events]) => <EventDisplay key={variation} title={`Variation ${variation}`} events={events} onCopy={copyToClipboard} />)}
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default Modal;

