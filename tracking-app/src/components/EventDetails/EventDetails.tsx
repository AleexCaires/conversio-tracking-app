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

interface EventDetailsProps {
  onEventDescriptionsChange: (descriptions: string[]) => void; // Prop to notify parent of event description changes
  onControlTypeChange: (controlType: string) => void; // Prop to notify parent of control type changes
  onTriggerDataLayer: () => void; // Prop to trigger DataLayerLogic
}

const EventDetails: React.FC<EventDetailsProps> = ({
  onEventDescriptionsChange,
  onControlTypeChange,
  onTriggerDataLayer,
}) => {
  const [numEvents, setNumEvents] = useState(2);
  const [eventDescriptions, setEventDescriptions] = useState<string[]>(Array(2).fill(""));
  const [selectedDummy, setSelectedDummy] = useState<boolean[]>(Array(2).fill(false));

  const { numVariants } = useExperience(); // Get number of variants from context
  const [selectedVariations, setSelectedVariations] = useState<boolean[][]>(
    Array(numVariants).fill(null).map(() => Array(numEvents).fill(false))
  );

  // Update when numEvents or numVariants changes
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

  // Notify parent of event description changes
  useEffect(() => {
    if (typeof onEventDescriptionsChange === "function") {
      onEventDescriptionsChange(eventDescriptions);
    } else {
      console.error("onEventDescriptionsChange is not a function");
    }
  }, [eventDescriptions, onEventDescriptionsChange]);

  // Notify parent of control type changes based on selected dummy checkboxes
  useEffect(() => {
    const selectedControlType = selectedDummy.some((isSelected) => isSelected)
      ? "Dummy Control"
      : "Variation 1"; // Default to "Variation 1" if no dummy is selected
    onControlTypeChange(selectedControlType);
  }, [selectedDummy, onControlTypeChange]);

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

        <EventColEnd>
          <div>
            <strong>Dummy Control:</strong>
            <button onClick={toggleSelectAllDummy} style={{ marginLeft: "1rem" }}>
              Select All
            </button>
            {eventDescriptions.map((_, idx) => (
              <div key={`dummy-${idx}`}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedDummy[idx]}
                    onChange={() => toggleDummyCheckbox(idx)}
                  />
                  {` Use Event ${idx + 1}`}
                </label>
              </div>
            ))}
          </div>
          {Array(numVariants)
            .fill(null)
            .map((_, variantIdx) => (
              <div key={`variation-group-${variantIdx}`}>
                <strong>{`Variation ${variantIdx + 1}:`}</strong>
                <button
                  onClick={() => toggleSelectAllVariant(variantIdx)}
                  style={{ marginLeft: "1rem" }}
                >
                  Select All
                </button>
                {eventDescriptions.map((_, eventIdx) => (
                  <div key={`variation-${variantIdx}-${eventIdx}`}>
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedVariations[variantIdx]?.[eventIdx] || false}
                        onChange={() => toggleVariantCheckbox(variantIdx, eventIdx)}
                      />
                      {` Use Event ${eventIdx + 1}`}
                    </label>
                  </div>
                ))}
              </div>
            ))}
        </EventColEnd>
      </EventRow>

      {/* Add a button to trigger DataLayerLogic */}
      <button onClick={onTriggerDataLayer} style={{ marginTop: "1rem" }}>
        Trigger DataLayer Logic
      </button>
    </Section>
  );
};

export default EventDetails;