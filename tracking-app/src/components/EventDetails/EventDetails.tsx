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

  // Clear generated data and copied status if core details change
  useEffect(() => {
    setSuccessMessage("");
    setEventData({ controlEvents: [], variationEvents: [] }); // Clear generated code
    setSelectedStatus({}); // Clear copied status
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
    setSelectedStatus({}); // Clear selection when re-triggering
    setTrigger(true);
  };

  // Callback for DataLayerLogic to update generated event data
  const handleDataGenerated = (data: { controlEvents: string[]; variationEvents: string[] }) => {
    setEventData(data);
  };

  const saveElementData = async () => {
    // Prepare payload including copied status
    const mapWithCopied = (events: string[], prefix: string) =>
      events.map((eventCode, idx) => ({
        code: eventCode, // The generated code string
        codeCopied: !!selectedStatus[`${prefix}-${idx}`], // Copied status from local state
      }));

    const elementDataPayload = {
      client: selectedClient,
      experienceNumber,
      experienceName,
      eventDescriptions, // Send original descriptions
      numVariants,
      // Send events with their copied status
      controlEventsWithCopied: mapWithCopied(eventData.controlEvents, "control"),
      variationEventsWithCopied: mapWithCopied(eventData.variationEvents, "variation"),
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
        body: JSON.stringify({ elementData: elementDataPayload }), // Send the prepared payload
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
          {eventDescriptions.map((desc, idx) => (
            <EventDescriptionRow key={idx}>
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
        eventDescriptions={eventDescriptions}
        controlType="Dummy Control"
        trigger={trigger}
        setTrigger={setTrigger}
        onDataGenerated={handleDataGenerated} // Pass callback
        selectedStatus={selectedStatus} // Pass state down
        setSelectedStatus={setSelectedStatus} // Pass setter down
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
