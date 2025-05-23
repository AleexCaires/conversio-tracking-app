import React from "react";
import EventDisplay from "../EventDisplay/EventDisplay";
import { ModalOverlay, ModalContainer, ModalHeader, CloseButton, ModalContent } from "./Modal.styles";
import { FaTrash, FaEdit } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { clients } from "../../lib/clients";
import { ModalContent as ModalContentType, Event, EventGroup } from "@/types";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: ModalContentType | null;
  experienceNumber?: string;
  experienceName?: string;
  client?: string;
  onRefresh?: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, content, experienceNumber, experienceName, client, onRefresh }) => {
  const router = useRouter();

  if (!isOpen) return null;

  // Extract client code from experienceNumber if not provided directly
  const extractClientCode = (expNumber: string | undefined): string => {
    if (!expNumber) return "";

    const possibleClientCodes = [expNumber.substring(0, 2), expNumber.substring(0, 3)];

    for (const code of possibleClientCodes) {
      if (clients.some((c) => c.code === code)) {
        return code;
      }
    }

    return "";
  };

  const clientValue = client || content?.client || extractClientCode(experienceNumber) || "";

  console.log("Client value:", clientValue, "Experience number:", experienceNumber);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const groupEventsByVariation = (rawEvents: Event[]): [string, Event[]][] => {
    const grouped: Record<string, Event[]> = {};

    rawEvents.forEach((event: Event) => {
      try {
        let variation = "Unknown";

        // Handle Adobe-specific events
        if (event.event === "targetClickEvent" && event.eventData?.click) {
          const clickText = event.eventData.click.clickText;
          const labelMatch = clickText?.match(/\(Variation (\d+)\)/);
          variation = labelMatch ? labelMatch[1] : "Unknown";
        } else if (event.eventLabel) {
          // Handle standard events
          const labelMatch = event.eventLabel.match(/\(Variation (\d+)\)/);
          variation = labelMatch ? labelMatch[1] : "Unknown";
        }

        if (!grouped[variation]) grouped[variation] = [];
        grouped[variation].push(event);
      } catch (error) {
        console.error("Error processing event:", event, error);
      }
    });

    return Object.entries(grouped);
  };

  // Prepare flat event arrays for EventDisplay from the grouped content.events
  // Ensure eventAction is always a string (fallback to empty string if undefined)
  const controlEventsForDisplay: Event[] = (content?.events?.find((g: EventGroup) => g.label === "Dummy Control" || g.label === "Control")?.events || []).map((e) => ({
    ...e,
    eventAction: e.eventAction ?? "",
  }));

  const variationEventsForDisplay: Event[] = (content?.events?.filter((g: EventGroup) => typeof g.label === "string" && g.label.startsWith("Variation "))?.flatMap((g: EventGroup) => g.events || []) || []).map((e) => ({
    ...e,
    eventAction: e.eventAction ?? "",
  }));

  // Add delete handler
  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    // Use the content._id directly since it's already the full identifier
    const documentId = content?._id || experienceNumber;

    console.log("Delete clicked. Values:", { documentId, clientValue, experienceNumber });

    if (!documentId) {
      alert("Missing document ID.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this experience?")) return;

    try {
      console.log("Deleting experience with ID:", documentId);
      const res = await fetch("/api/delete-element", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client: clientValue,
          experienceNumber: documentId, // Pass the full _id
        }),
      });

      if (res.ok) {
        if (onRefresh) {
          onRefresh();
        }
        onClose();
      } else {
        alert("Failed to delete.");
      }
    } catch (err) {
      console.error("Delete error:", err);
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

    if (!content) {
      alert("No content available for editing.");
      return;
    }

    const editPayloadToStore = {
      id: experienceNumber,
      client: clientValue,
      name: experienceName || "",
      events: content.events,
    };

    // Only access localStorage on client side
    if (typeof window !== "undefined") {
      localStorage.setItem("editExperienceData", JSON.stringify(editPayloadToStore));
    }

    // Close the modal first, then navigate
    onClose();

    // Use setTimeout to ensure modal closes before navigation
    setTimeout(() => {
      router.push(`/?edit=${experienceNumber}`);
    }, 100);
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
          <EventDisplay
            title="Control Events"
            events={controlEventsForDisplay.map((e) => ({
              ...e,
              eventAction: e.eventAction ?? "",
              eventCategory: e.eventCategory ?? "",
              eventLabel: e.eventLabel ?? "",
              eventSegment: e.eventSegment ?? "",
            }))}
            onCopy={copyToClipboard}
          />
          {Array.isArray(variationEventsForDisplay) &&
            groupEventsByVariation(variationEventsForDisplay).map(([variation, events]) => (
              <EventDisplay
                key={variation}
                title={`Variation ${variation}`}
                events={events.map((e) => ({
                  ...e,
                  eventAction: e.eventAction ?? "",
                  eventCategory: e.eventCategory ?? "",
                  eventLabel: e.eventLabel ?? "",
                  eventSegment: e.eventSegment ?? "",
                }))}
                onCopy={copyToClipboard}
              />
            ))}
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default Modal;
