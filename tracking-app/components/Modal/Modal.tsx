import React, { useState } from "react";
import EventDisplay from "../EventDisplay/EventDisplay";
import { ModalOverlay, ModalContainer, ModalHeader, CloseButton, ModalContent, HeaderTitle, EditButton, DeleteButton, ToggleWrapper, ToggleLabel, StyledSegmentIcon, StyledCodeIcon, IconWrapper, ActiveIndicatorIcon } from "./Modal.styles";
import EditIcon from "../Icons/EditIcon";
import DeleteIcon from "../Icons/DeleteIcon";
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
  const [showMode, setShowMode] = useState<"labels" | "code">("code");

  if (!isOpen) return null;

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

        // Check for experience events first
        if (event.event === "conversioExperience" && event.conversio) {
          // Check for experience segment to determine variation
          const segment = event.conversio.experience_segment || "";
          if (segment.includes(".XV")) {
            // Extract variation number from segment (e.g., SA123.XV1 -> 1)
            const match = segment.match(/\.XV(\d+)$/);
            variation = match && match[1] ? match[1] : "Unknown";
          } else {
            // Check label as fallback
            const label = event.conversio.experienceLabel || event.conversio.experience_label || "";
            if (label.includes("Variation")) {
              const varMatch = label.match(/Variation\s+(\d+)/);
              variation = varMatch && varMatch[1] ? varMatch[1] : "Unknown";
            }
          }
        }
        // Sephora/SA: variation number is in conversio.event_label
        else if ((event.event === "conversioEvent" || event.event === undefined) && event.conversio && typeof event.conversio.event_label === "string") {
          const labelMatch = event.conversio.event_label.match(/\(Variation (\d+)\)/);
          variation = labelMatch ? labelMatch[1] : "Unknown";
        }
        // Adobe-specific events
        else if (event.event === "targetClickEvent" && event.eventData?.click) {
          const clickText = event.eventData.click.clickText;
          const labelMatch = clickText?.match(/\(Variation (\d+)\)/);
          variation = labelMatch ? labelMatch[1] : "Unknown";
        }
        // Standard events
        else if (event.eventLabel) {
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
  const controlEventsForDisplay: Event[] = content?.events?.find((g: EventGroup) => g.label === "Dummy Control" || g.label === "Control")?.events || [];

  const variationEventsForDisplay: Event[] = content?.events?.filter((g: EventGroup) => typeof g.label === "string" && g.label.startsWith("Variation "))?.flatMap((g: EventGroup) => g.events || []) || [];

  // Add delete handler
  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    // Use the content._id directly since it's already the full identifier
    const documentId = content?._id || experienceNumber;

    if (!documentId) {
      alert("Missing document ID.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this experience?")) return;

    try {
      //console.log("Deleting experience with ID:", documentId);
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
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <HeaderTitle>
            {(experienceNumber || experienceName) && (
              <span>
                {experienceNumber ? <strong>{experienceNumber}</strong> : ""}
                {experienceNumber && experienceName ? " - " : ""}
                {experienceName ? experienceName : ""}
              </span>
            )}
            <EditButton onClick={handleEdit} type="button" title="Edit this experience">
              <EditIcon width="1.2rem" height="1.2rem" />
            </EditButton>
            {/* Add bin icon button */}
            <DeleteButton onClick={handleDelete} type="button" title="Delete this experience">
              <DeleteIcon width="1.2rem" height="1.2rem" />
            </DeleteButton>
            <CloseButton onClick={onClose}>&times;</CloseButton>
          </HeaderTitle>
        </ModalHeader>

        {/* Content Section */}
        <ModalContent>
          <ToggleWrapper>
            <ToggleLabel>Event Labels</ToggleLabel>
            <IconWrapper>
              <StyledSegmentIcon $active={showMode === "labels"} title="Show only event labels" onClick={() => setShowMode("labels")} />
              {showMode === "labels" && <ActiveIndicatorIcon />}
            </IconWrapper>
            <IconWrapper>
              <StyledCodeIcon $active={showMode === "code"} title="Show event code" onClick={() => setShowMode("code")} />
              {showMode === "code" && <ActiveIndicatorIcon />}
            </IconWrapper>
          </ToggleWrapper>
          <EventDisplay title="Control Events" events={controlEventsForDisplay} onCopy={copyToClipboard} showMode={showMode} />
          {Array.isArray(variationEventsForDisplay) && groupEventsByVariation(variationEventsForDisplay).map(([variation, events]) => <EventDisplay key={variation} title={`Variation ${variation}`} events={events} onCopy={copyToClipboard} showMode={showMode} />)}
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default Modal;
