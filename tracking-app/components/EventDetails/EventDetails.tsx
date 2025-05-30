"use client";

import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Section, Heading, FieldGroupInitial, Label, Input, EventDescriptionRow, EventInput, EventRow, EventCol,SectionWrapper ,TriggerEventWrapper,TriggerButton} from "./EventDetails.styles";
import { useExperience } from "../ExperienceContext/ExperienceContext";
import DataLayerLogic from "../DataLayerLogic/DataLayerLogic";
import { EditData, EventGroup, Event } from "@/types";

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
  const [numEvents, setNumEvents] = useState(2);
  const [eventDescriptions, setEventDescriptions] = useState<string[]>(Array(2).fill(""));
  const [trigger, setTrigger] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [triggerEventEnabled, setTriggerEventEnabled] = useState(false);
  const [triggerEventDescription, setTriggerEventDescription] = useState("");
  const [showDataLayerLogic, setShowDataLayerLogic] = useState(true);

  const [eventData, setEventData] = useState<EventData>({
    controlEvents: [],
    variationEvents: [],
  });
  const [selectedStatus, setSelectedStatus] = useState<Record<string, boolean>>({});

  const { 
    selectedClient, 
    experienceNumber, 
    numVariants, 
    experienceName,
    resetExperience,
  } = useExperience();

  // Add effect to retrigger data generation when number of variants changes
  useEffect(() => {
    // Only run when we have valid data and we're in edit mode
    if (isEditMode && 
        eventDescriptions.length > 0 && 
        selectedClient && 
        experienceNumber && 
        numVariants > 0) {
      console.log("Retriggering data generation due to numVariants change:", numVariants);
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
    setSuccessMessage("");
    setEventData({ controlEvents: [], variationEvents: [] });
    if (!isEditMode) {
      setSelectedStatus({});
    }
  }, [selectedClient, experienceNumber, numVariants, experienceName, isEditMode]);

  useEffect(() => {
    if (isEditMode && editData && Array.isArray(editData.events)) {
      console.log("Processing edit data for EventDetails:", editData);
      
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
        const label = event.eventLabel || event.eventData?.click?.clickText;
        if (label) {
          // Extract the description part (after the last pipe)
          const lastPipeIndex = label.lastIndexOf('|');
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
      
      console.log("Initialized selectedStatus:", newSelectedStatus);
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

  const handleTriggerDataLayer = () => {
    setSelectedStatus({});
    setTrigger(true);
    setShowDataLayerLogic(true); // Always show when explicitly triggered
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
    };

    console.log("Saving Element Data:", elementDataPayload);

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

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
        
        setSuccessMessage(successMsg);
        
        if (isEditMode && window) {
          window.history.replaceState({}, '', '/');
        }
        
        cleanAllFields(successMsg);
      } else {
        const errorData = await res.json();
        setErrorMessage(errorData.message || "An error occurred while saving.");
      }
    } catch {
      setErrorMessage("Failed to save element data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to clean all form fields (used after successful save)
  const cleanAllFields = (successMessage?: string) => {
    console.log("Cleaning all fields...");
    
    // Reset Experience context (will reset ExperienceDetails)
    resetExperience();
    
    // Reset EventDetails fields
    setNumEvents(2);
    setEventDescriptions(Array(2).fill(""));
    setTrigger(false);
    setErrorMessage("");
    if (successMessage) {
      setSuccessMessage(successMessage); // Preserve success message if provided
    }
    setTriggerEventEnabled(false);
    setTriggerEventDescription("");
    
    // Only hide DataLayerLogic if it's triggered by cancel
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
        variationEventsWithCopied: []
      });
    }, 50);
  };

  // Expose a reset method and triggerDataGeneration to parent components
  useImperativeHandle(ref, () => ({
    reset: () => {
      cleanAllFields();
    },
    triggerDataGeneration: () => {
      setTrigger(true);
      setShowDataLayerLogic(true);
    }
  }));

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
          <label style={{ display: "flex", alignItems: "center" }}>
            <input 
              type="checkbox" 
              checked={triggerEventEnabled} 
              onChange={(e) => setTriggerEventEnabled(e.target.checked)} 
              style={{ marginRight: "0.5rem" }} 
            />
            Trigger Event
          </label>
          
          {triggerEventEnabled && (
            <div>
              <EventInput 
                type="text" 
                value={triggerEventDescription} 
                onChange={(e) => setTriggerEventDescription(e.target.value)} 
                placeholder="Trigger Event Description" 
              />
            </div>
          )}
        </TriggerEventWrapper>
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
        <DataLayerLogic
          client={selectedClient}
          experienceNumber={experienceNumber}
          eventDescriptions={triggerEventEnabled ? [triggerEventDescription, ...eventDescriptions] : eventDescriptions}
          trigger={trigger}
          setTrigger={setTrigger}
          onDataGenerated={handleDataGenerated}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
        />
      )}

      <div style={{ marginTop: "1rem" }}>
        <button onClick={saveElementData} disabled={isLoading || eventData.controlEvents.length === 0}>
          {isLoading ? "Saving..." : "Save Element"}
        </button>
      </div>

      {successMessage && <div style={{ color: "green", marginTop: "1rem" }}>{successMessage}</div>}
      {errorMessage && <div style={{ color: "red", marginTop: "1rem" }}>{errorMessage}</div>}
    </Section>
    </SectionWrapper>
  );
});

EventDetails.displayName = 'EventDetails';

export default EventDetails;
