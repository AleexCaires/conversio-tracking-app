"use client";

import React, { useState, useEffect, useImperativeHandle, forwardRef, useRef } from "react";
import { Section, Heading, FieldGroupInitial, Label, Input, EventDescriptionRow, EventInput, EventRow, EventCol, SectionWrapper, TriggerEventWrapper, TriggerButton, SaveToDBbtn, StickyButtonContainer, SelectAllButton } from "./EventDetails.styles";
import { useExperience } from "../ExperienceContext/ExperienceContext";
import DataLayerLogic from "../DataLayerLogic/DataLayerLogic";
import { EditData, EventGroup, Event } from "@/types";
import { useRouter } from "next/navigation"; // Import useRouter

interface EventDetailsProps {
  editData?: EditData;
  isEditMode?: boolean;
}

interface EventData {
  controlEvents: string[];
  variationEvents: string[];
}

interface EventDataWithCopied {
  controlEvents: string[];
  variationEvents: string[];
  controlEventsWithCopied: { code: string; codeCopied: boolean }[];
  variationEventsWithCopied: { code: string; codeCopied: boolean }[];
}

const EventDetails = forwardRef<{ reset: () => void; triggerDataGeneration: () => void }, EventDetailsProps>(({ editData, isEditMode }, ref) => {
  const router = useRouter(); // Initialize useRouter
  const [numEvents, setNumEvents] = useState(2);
  const [eventDescriptions, setEventDescriptions] = useState<string[]>(Array(2).fill(""));
  const [trigger, setTrigger] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // const [errorMessage, setErrorMessage] = useState("");
  // const [successMessage, setSuccessMessage] = useState("");
  const [triggerEventEnabled, setTriggerEventEnabled] = useState(false);
  const [triggerEventDescription, setTriggerEventDescription] = useState("");
  const [showDataLayerLogic, setShowDataLayerLogic] = useState(false); // Changed initial state to false

  const [eventData, setEventData] = useState<EventData>({
    controlEvents: [],
    variationEvents: [],
  });
  const [selectedStatus, setSelectedStatus] = useState<Record<string, boolean>>({});

  const { selectedClient, experienceNumber, numVariants, experienceName, resetExperience } = useExperience();

  // Add effect to retrigger data generation when number of variants changes
  useEffect(() => {
    // Only run when we have valid data and we're in edit mode
    if (isEditMode && eventDescriptions.length > 0 && selectedClient && experienceNumber && numVariants > 0) {
      //console.log("Retriggering data generation due to numVariants change:", numVariants);
      // Set a small delay to let React update state first
      setTimeout(() => {
        setTrigger(true);
      }, 50);
    }
  }, [numVariants, isEditMode, selectedClient, experienceNumber, eventDescriptions.length, setTrigger]);

  useEffect(() => {
    setEventDescriptions((prev) => (numEvents > prev.length ? [...prev, ...Array(numEvents - prev.length).fill("")] : prev.slice(0, numEvents)));
  }, [numEvents]);

  useEffect(() => {
    setEventData({ controlEvents: [], variationEvents: [] });
    if (!isEditMode) {
      setSelectedStatus({});
    }
  }, [selectedClient, experienceNumber, numVariants, experienceName, isEditMode]);

  useEffect(() => {
    if (isEditMode && editData && Array.isArray(editData.events)) {
      //console.log("Processing edit data for EventDetails:", editData);

      const allEvents: Event[] = [];
      editData.events.forEach((group: EventGroup) => {
        if (Array.isArray(group.events)) {
          allEvents.push(...group.events);
        }
      });

      // Find trigger event if any
      const triggerEvent = allEvents.find((event: Event) => event.triggerEvent === true);
      let triggerDescription = "";
      const standardDescriptions: string[] = [];

      // Process all events to get descriptions
      allEvents.forEach((event: Event) => {
        // Add support for Sephora's event_label
        const label = event.conversio?.event_label || event.eventLabel || event.eventData?.click?.clickText;
        if (label) {
          // Extract the description part (after the last pipe)
          const lastPipeIndex = label.lastIndexOf("|");
          if (lastPipeIndex !== -1) {
            const description = label.substring(lastPipeIndex + 1).trim();
            if (description) {
              if (event.triggerEvent) {
                triggerDescription = description;
              } else if (!standardDescriptions.includes(description)) {
                standardDescriptions.push(description);
              }
            }
          }
        }
      });

      // Update state based on extracted data
      if (triggerEvent && triggerDescription) {
        setTriggerEventEnabled(true);
        setTriggerEventDescription(triggerDescription);
      }

      if (standardDescriptions.length > 0) {
        setEventDescriptions(standardDescriptions);
        setNumEvents(standardDescriptions.length);
      }

      // Initialize selectedStatus based on codeCopied
      const newSelectedStatus: Record<string, boolean> = {};

      // Process Control events
      const controlGroup = editData.events.find((g: EventGroup) => g.label === "Dummy Control" || g.label === "Control");
      if (controlGroup && Array.isArray(controlGroup.events)) {
        controlGroup.events.forEach((event: Event, idx: number) => {
          newSelectedStatus[`control-${idx}`] = !!event.codeCopied;
        });
      }

      // Process Variation events
      let variationOffset = 0;
      editData.events.forEach((group: EventGroup) => {
        if (group.label && group.label.startsWith("Variation ") && Array.isArray(group.events)) {
          group.events.forEach((event: Event, idx: number) => {
            newSelectedStatus[`variation-${variationOffset + idx}`] = !!event.codeCopied;
          });
          variationOffset += group.events.length;
        }
      });

      //console.log("Initialized selectedStatus:", newSelectedStatus);
      setSelectedStatus(newSelectedStatus);

      // Trigger data layer logic after a short delay
      setTimeout(() => {
        setTrigger(true);
      }, 200);
    }
  }, [isEditMode, editData]);

  const handleNumEventsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setNumEvents(isNaN(value) ? 0 : value);
  };

  const handleDescriptionChange = (index: number, value: string) => {
    const updated = [...eventDescriptions];
    updated[index] = value;
    setEventDescriptions(updated);
  };

  const eventsHeaderRef = useRef<HTMLDivElement>(null);

  const handleTriggerDataLayer = () => {
    setSelectedStatus({});
    setTrigger(true);
    setShowDataLayerLogic(true);
    
    // Add setTimeout to ensure DOM elements are rendered before scrolling
    setTimeout(() => {
      if (eventsHeaderRef.current) {
        // Get the position of the element
        const elementPosition = eventsHeaderRef.current.getBoundingClientRect().top;
        // Calculate the offset position accounting for the header height
        const offsetPosition = elementPosition + window.pageYOffset - 92;
        
        // Scroll to the calculated position
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  const handleDataGenerated = (data: EventDataWithCopied) => {
    setEventData({
      controlEvents: data.controlEvents,
      variationEvents: data.variationEvents,
    });
  };

  // Define isTriggerButtonDisabled - this was missing
  const isTriggerButtonDisabled = !selectedClient || !experienceNumber || eventDescriptions.some((desc) => desc.trim() === "");

  const saveElementData = async () => {
    const mapWithCopied = (events: string[], prefix: string) =>
      events.map((eventCode, idx) => ({
        code: eventCode,
        codeCopied: !!selectedStatus[`${prefix}-${idx}`],
      }));

    const eventDescriptionsToSave = triggerEventEnabled ? [triggerEventDescription, ...eventDescriptions] : [...eventDescriptions];

    const elementDataPayload = {
      client: selectedClient,
      experienceNumber,
      experienceName,
      eventDescriptions: eventDescriptionsToSave,
      numVariants,
      controlEventsWithCopied: mapWithCopied(eventData.controlEvents, "control"),
      variationEventsWithCopied: mapWithCopied(eventData.variationEvents, "variation"),
      triggerEvent: triggerEventEnabled
        ? {
            enabled: true,
            description: triggerEventDescription,
          }
        : {
            enabled: false,
            description: "",
          },
      includeExperienceEvent: isSpecialClient && specialEventEnabled, // Add this flag to the payload
    };

    setIsLoading(true);

    try {
      const res = await fetch("/api/save-elements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ elementData: elementDataPayload }),
      });

      if (res.ok) {
        const data = await res.json();
        const successMsg = data.message || "Element saved successfully!";
        //console.log("Element saved successfully:", successMsg);

        if (isEditMode) {
          window.history.replaceState({}, "", "/");
        }

        cleanAllFields(successMsg);

        // Navigate to /historyComp after successful save
        router.push("/historyComp");
      } else {
        const errorData = await res.json();
        console.log(errorData.message || "An error occurred while saving.");
      }
    } catch {
      console.log("Failed to save element data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to clean all form fields (used after successful save)
  const cleanAllFields = (successMessage?: string) => {
    //console.log("Cleaning all fields...");

    // Reset Experience context (will reset ExperienceDetails)
    resetExperience();

    // Reset EventDetails fields
    setNumEvents(2);
    setEventDescriptions(Array(2).fill(""));
    setTrigger(false);
    setTriggerEventEnabled(false);
    setTriggerEventDescription("");

    // Hide DataLayerLogic when fields are cleaned, unless it's after a successful save
    if (!successMessage) {
      setShowDataLayerLogic(false);
    }

    // Reset event data
    setEventData({
      controlEvents: [],
      variationEvents: [],
    });

    // Reset selected status
    setSelectedStatus({});

    // Clear any generated events
    setTimeout(() => {
      handleDataGenerated({
        controlEvents: [],
        variationEvents: [],
        controlEventsWithCopied: [],
        variationEventsWithCopied: [],
      });
    }, 50);
  };

  // Expose a reset method and triggerDataGeneration to parent components
  useImperativeHandle(ref, () => ({
    reset: () => {
      cleanAllFields(); // This will set showDataLayerLogic to false
    },
    triggerDataGeneration: () => {
      setTrigger(true);
      setShowDataLayerLogic(true);
    },
  }));

  const isSpecialClient = selectedClient === "SA" || selectedClient === "LF";
  // Initialize with true if special client is selected
  const [specialEventEnabled, setSpecialEventEnabled] = useState(isSpecialClient);
  
  // Add effect to update specialEventEnabled when client changes
  useEffect(() => {
    // Auto-select the experience event checkbox when special client is selected
    if (selectedClient === "SA" || selectedClient === "LF") {
      setSpecialEventEnabled(true);
    } else {
      setSpecialEventEnabled(false);
    }
  }, [selectedClient]);

  // When saving or building, just pass the flag, don't add to eventDescriptions
  const getAllEventDescriptions = () => {
    let descs = [...eventDescriptions];
    if (triggerEventEnabled) {
      descs = [triggerEventDescription, ...descs];
    }
    return descs;
  };

  const selectAllEvents = () => {
    const newSelectedStatus = { ...selectedStatus };
    
    // Select all control events
    eventData.controlEvents.forEach((_, idx) => {
      newSelectedStatus[`control-${idx}`] = true;
    });
    
    // Select all variation events
    eventData.variationEvents.forEach((_, idx) => {
      newSelectedStatus[`variation-${idx}`] = true;
    });
    
    // Update the selected status
    setSelectedStatus(newSelectedStatus);
    
    // Update the data with new copied status
    const controlEventsWithCopied = eventData.controlEvents.map(() => ({
      code: "",
      codeCopied: true,
    }));
    
    const variationEventsWithCopied = eventData.variationEvents.map(() => ({
      code: "",
      codeCopied: true,
    }));
    
    handleDataGenerated({
      controlEvents: eventData.controlEvents,
      variationEvents: eventData.variationEvents,
      controlEventsWithCopied,
      variationEventsWithCopied,
    });
  };

  return (
    <SectionWrapper>
      <Section>
        <Heading>Event Details</Heading>

        <FieldGroupInitial>
          <div>
            <Label htmlFor="numEvents">No. of Events:</Label>
            <Input type="number" id="numEvents" value={numEvents} min={1} max={20} onChange={handleNumEventsChange} />
          </div>
          <TriggerEventWrapper>
            <label style={{ display: "flex", alignItems: "center", marginRight: "1rem" }}>
              <input type="checkbox" checked={triggerEventEnabled} onChange={(e) => setTriggerEventEnabled(e.target.checked)} style={{ marginRight: "0.5rem" }} />
              Trigger Event
            </label>
            {triggerEventEnabled && (
              <div>
                <EventInput type="text" value={triggerEventDescription} onChange={(e) => setTriggerEventDescription(e.target.value)} placeholder="Trigger Event Description" />
              </div>
            )}
          </TriggerEventWrapper>
          {isSpecialClient && (
            <div style={{ display: "flex", alignItems: "center", marginLeft: "2rem" }}>
              <label style={{ display: "flex", alignItems: "center", marginRight: "1rem" }}>
                <input
                  type="checkbox"
                  checked={specialEventEnabled}
                  onChange={(e) => setSpecialEventEnabled(e.target.checked)}
                  style={{ marginRight: "0.5rem" }}
                />
                Experience Tracking Event
              </label>
            </div>
          )}
        </FieldGroupInitial>

        <EventRow>
          <EventCol>
            {eventDescriptions.map((desc, idx) => (
              <EventDescriptionRow key={idx}>
                <Label>{`Event ${idx + 1} Description:`}</Label>
                <EventInput type="text" value={desc} onChange={(e) => handleDescriptionChange(idx, e.target.value)} />
              </EventDescriptionRow>
            ))}
          </EventCol>
        </EventRow>

        <TriggerButton onClick={handleTriggerDataLayer} disabled={isTriggerButtonDisabled}>
          Build Events
        </TriggerButton>

        {showDataLayerLogic && (
          <>
            {/* Add ref to this container that wraps the events section */}
            <div ref={eventsHeaderRef}>
              <DataLayerLogic
                client={selectedClient}
                experienceNumber={experienceNumber}
                eventDescriptions={getAllEventDescriptions()}
                trigger={trigger}
                setTrigger={setTrigger}
                onDataGenerated={handleDataGenerated}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
                includeExperienceEvent={isSpecialClient && specialEventEnabled}
                experienceName={experienceName}
              />
            </div>
            
            <StickyButtonContainer>
              <SelectAllButton 
                onClick={selectAllEvents} 
                disabled={eventData.controlEvents.length === 0 && eventData.variationEvents.length === 0}
              >
                Select All Events
              </SelectAllButton>
              
              <SaveToDBbtn onClick={saveElementData} disabled={isLoading || eventData.controlEvents.length === 0}>
                {isLoading ? "Saving..." : "Save to database"}
              </SaveToDBbtn>
            </StickyButtonContainer>
          </>
        )}

      </Section>
    </SectionWrapper>
  );
});

// Add this line to fix the warning
EventDetails.displayName = "EventDetails";

export default EventDetails;
