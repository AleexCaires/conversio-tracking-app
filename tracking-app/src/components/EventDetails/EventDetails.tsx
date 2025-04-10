"use client";

import React, { useState, useEffect } from "react";
import {
  Section,
  Heading,
  FieldGroupInitial,
  Label,
  Input,
  EventDescriptionRow,
  EventInput,
  EventRow,
  EventCol,
  EventColEnd
} from "./EventDetails.styles";
import { useExperience } from "../ExperienceContext/ExperienceContext";
import DataLayerLogic from "../DataLayerLogic/DataLayerLogic"; // Import the DataLayerLogic component

interface EventDetailsProps {
  onEventDescriptionsChange: (descriptions: string[]) => void;
  onControlTypeChange: (controlType: string) => void;
  onTriggerDataLayer: () => void;
}

const EventDetails: React.FC<EventDetailsProps> = ({
  onEventDescriptionsChange,
  onControlTypeChange,
  onTriggerDataLayer,
}) => {
  const [numEvents, setNumEvents] = useState(2);
  const [eventDescriptions, setEventDescriptions] = useState<string[]>(Array(2).fill(""));
  const [selectedDummy, setSelectedDummy] = useState<boolean[]>(Array(2).fill(false));

  const { numVariants } = useExperience();
  const [selectedVariations, setSelectedVariations] = useState<boolean[][]>(
    Array(numVariants).fill(null).map(() => Array(numEvents).fill(false))
  );

  const [trigger, setTrigger] = useState(false); // Trigger state to control event logic execution

  useEffect(() => {
    setEventDescriptions((prev) =>
      numEvents > prev.length
        ? [...prev, ...Array(numEvents - prev.length).fill("")]
        : prev.slice(0, numEvents)
    );

    setSelectedDummy((prev) =>
      numEvents > prev.length
        ? [...prev, ...Array(numEvents - prev.length).fill(false)]
        : prev.slice(0, numEvents)
    );

    setSelectedVariations(
      Array(numVariants)
        .fill(null)
        .map((_, variantIdx) => {
          const current = selectedVariations[variantIdx] || [];
          return numEvents > current.length
            ? [...current, ...Array(numEvents - current.length).fill(false)]
            : current.slice(0, numEvents);
        })
    );
  }, [numEvents, numVariants]);

  const handleNumEventsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setNumEvents(isNaN(value) ? 0 : value);
  };

  const handleDescriptionChange = (index: number, value: string) => {
    const updated = [...eventDescriptions];
    updated[index] = value;
    setEventDescriptions(updated);
  };

  const toggleSelectAllDummy = () => {
    setSelectedDummy(Array(numEvents).fill(true));
  };

  const toggleDummyCheckbox = (index: number) => {
    const updated = [...selectedDummy];
    updated[index] = !updated[index];
    setSelectedDummy(updated);
  };

  const toggleSelectAllVariant = (variantIndex: number) => {
    const updated = [...selectedVariations];
    updated[variantIndex] = Array(numEvents).fill(true);
    setSelectedVariations(updated);
  };

  const toggleVariantCheckbox = (variantIndex: number, eventIndex: number) => {
    const updated = [...selectedVariations];
    updated[variantIndex][eventIndex] = !updated[variantIndex][eventIndex];
    setSelectedVariations(updated);
  };

  // Function to handle the trigger logic when button is clicked
  const handleTriggerDataLayer = () => {
    setTrigger(true); // Set the trigger state to true to run event logic
    onTriggerDataLayer(); // Call the prop function to trigger DataLayer logic in the parent
  };

  return (
    <Section>
      <Heading>Event Details</Heading>

      <FieldGroupInitial>
        <div>
          <Label htmlFor="numEvents">No. of Events:</Label>
          <Input
            type="number"
            id="numEvents"
            value={numEvents}
            min={1}
            max={20}
            onChange={handleNumEventsChange}
          />
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
              <EventInput
                type="text"
                value={desc}
                onChange={(e) => handleDescriptionChange(idx, e.target.value)}
              />
            </EventDescriptionRow>
          ))}
        </EventCol>
      </EventRow>

      {/* Button to trigger DataLayerLogic */}
      <button onClick={handleTriggerDataLayer} style={{ marginTop: "1rem" }}>
        Trigger DataLayer Logic
      </button>

      {/* Pass the required props to DataLayerLogic */}
      <DataLayerLogic
        client="Finisterre"
        experienceNumber="010"
        eventDescriptions={eventDescriptions}
        controlType="Dummy Control" 
        trigger={trigger}
        setTrigger={setTrigger}
      />
    </Section>
  );
};

export default EventDetails;
