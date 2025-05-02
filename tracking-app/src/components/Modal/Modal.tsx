import React from "react";
import EventDisplay from "@/components/EventDisplay/EventDisplay";
import {
  ModalOverlay,
  ModalContainer,
  ModalHeader,
  CloseButton,
  ModalContent,
} from "./Modal.styles"; // Import styled components

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

    return Object.entries(grouped); // [ [variationNumber, events[]], ... ]
  };

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      {/* Prevent clicks inside the container from closing the modal */}
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        {/* Header Section */}
        <ModalHeader>
          {/* You can add a title here if needed */}
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
