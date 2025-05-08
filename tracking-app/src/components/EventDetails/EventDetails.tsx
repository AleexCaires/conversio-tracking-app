"use client";

import React, { useState, useEffect } from "react";
import { Section, Heading, FieldGroupInitial, Label, Input, EventDescriptionRow, EventInput, EventRow, EventCol } from "./EventDetails.styles";
import { useExperience } from "../ExperienceContext/ExperienceContext";
import DataLayerLogic from "../DataLayerLogic/DataLayerLogic";

const EventDetails: React.FC = () => {
  const [numEvents, setNumEvents] = useState(2);
  const [eventDescriptions, setEventDescriptions] = useState<string[]>(Array(2).fill(""));
  const [trigger, setTrigger] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [triggerEventEnabled, setTriggerEventEnabled] = useState(false); // replaces triggerEventType
  const [triggerEventDescription, setTriggerEventDescription] = useState(""); // unchanged

  // Lifted state
  const [eventData, setEventData] = useState<{ controlEvents: string[]; variationEvents: string[] }>({
    controlEvents: [],
    variationEvents: [],
  });
  const [selectedStatus, setSelectedStatus] = useState<Record<string, boolean>>({});

  const { selectedClient, experienceNumber, numVariants, experienceName } = useExperience();

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
  ];

  const clientCode = clients.find((c) => c.name === selectedClient)?.code || selectedClient;
  const fullClient = `${clientCode}${experienceNumber}`;

  useEffect(() => {
    setEventDescriptions((prev) => (numEvents > prev.length ? [...prev, ...Array(numEvents - prev.length).fill("")] : prev.slice(0, numEvents)));
  }, [numEvents]);

  useEffect(() => {
    setSuccessMessage("");
    setEventData({ controlEvents: [], variationEvents: [] });
    setSelectedStatus({});
  }, [selectedClient, experienceNumber, eventDescriptions, numVariants, experienceName]);

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
  };

  const handleDataGenerated = (data: { controlEvents: string[]; variationEvents: string[] }) => {
    setEventData(data);
  };

  const saveElementData = async () => {
    const mapWithCopied = (events: string[], prefix: string) =>
      events.map((eventCode, idx) => ({
        code: eventCode,
        codeCopied: !!selectedStatus[`${prefix}-${idx}`],
      }));

    // Compose eventDescriptions with trigger event if enabled
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
        setSuccessMessage(data.message || "Element saved successfully!");
      } else {
        const errorData = await res.json();
        setErrorMessage(errorData.message || "An error occurred while saving.");
      }
    } catch (error) {
      setErrorMessage("Failed to save element data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isTriggerButtonDisabled = !selectedClient || !experienceNumber || eventDescriptions.some((desc) => desc.trim() === "");

  return (
    <Section>
      <Heading>Event Details</Heading>

      <FieldGroupInitial>
        <div>
          <Label htmlFor="numEvents">No. of Events:</Label>
          <Input type="number" id="numEvents" value={numEvents} min={1} max={20} onChange={handleNumEventsChange} />
        </div>
        <div>
          <Label>Event Category Name:</Label>
          <Input type="text" value="Conversio CRO" readOnly />
        </div>
      </FieldGroupInitial>

      <EventRow>
        <EventCol>
          {/* Trigger Event Checkbox */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "flex", alignItems: "center" }}>
              <input type="checkbox" checked={triggerEventEnabled} onChange={(e) => setTriggerEventEnabled(e.target.checked)} style={{ marginRight: "0.5rem" }} />
              Add Trigger Event
            </label>
          </div>

          {/* Trigger Event Input (conditionally rendered) */}
          {triggerEventEnabled && (
            <EventDescriptionRow>
              <Label>Trigger Event Description:</Label>
              <EventInput type="text" value={triggerEventDescription} onChange={(e) => setTriggerEventDescription(e.target.value)} placeholder="Describe the trigger event" />
            </EventDescriptionRow>
          )}

          {/* Existing event descriptions */}
          {eventDescriptions.map((desc, idx) => (
            <EventDescriptionRow key={idx}>
              {/* Show trigger event label if first event and trigger enabled */}
              {triggerEventEnabled && idx === 0 && <div style={{ marginBottom: "0.25rem", color: "#d35400", fontWeight: 600 }}>Trigger Event</div>}
              <Label>{`Event ${idx + 1} Description:`}</Label>
              <EventInput type="text" value={desc} onChange={(e) => handleDescriptionChange(idx, e.target.value)} />
            </EventDescriptionRow>
          ))}
        </EventCol>
      </EventRow>

      <button onClick={handleTriggerDataLayer} style={{ marginTop: "1rem" }} disabled={isTriggerButtonDisabled}>
        Trigger DataLayer Logic
      </button>

      <DataLayerLogic
        client={selectedClient}
        experienceNumber={experienceNumber}
        eventDescriptions={triggerEventEnabled ? [triggerEventDescription, ...eventDescriptions] : eventDescriptions}
        controlType="Dummy Control"
        trigger={trigger}
        setTrigger={setTrigger}
        onDataGenerated={handleDataGenerated}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
      />

      <div style={{ marginTop: "1rem" }}>
        <button onClick={saveElementData} disabled={isLoading || eventData.controlEvents.length === 0}>
          {isLoading ? "Saving..." : "Save Element"}
        </button>
      </div>

      {successMessage && <div style={{ color: "green", marginTop: "1rem" }}>{successMessage}</div>}
      {errorMessage && <div style={{ color: "red", marginTop: "1rem" }}>{errorMessage}</div>}
    </Section>
  );
};

export default EventDetails;
