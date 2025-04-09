"use client";

import React, { useEffect } from "react";
import { useExperience } from "../ExperienceContext/ExperienceContext"; // Import the useExperience hook

interface DataLayerLogicProps {
  client: string; // Value from the client dropdown
  eventDescriptions: string[]; // Array of event descriptions from EventDetails
  controlType: string; // Control type (e.g., "Dummy Control")
  trigger: boolean; // Trigger to execute the logic
}

const DataLayerLogic: React.FC<DataLayerLogicProps> = ({
  client,
  eventDescriptions,
  controlType,
  trigger,
}) => {
  const { numVariants } = useExperience(); // Use the hook to get numVariants

  // Helper function to generate a random letter from the last 10 letters of the alphabet
  const getRandomLetter = (usedLetters: Set<string>): string => {
    const letters = "QRSTUVWXYZ";
    let letter;
    do {
      letter = letters[Math.floor(Math.random() * letters.length)];
    } while (usedLetters.has(letter));
    usedLetters.add(letter);
    return letter;
  };

  useEffect(() => {
    const usedLetters = new Set<string>(); // Track used letters for uniqueness

    // Generate dataLayer objects for each event description
    eventDescriptions.forEach((description, idx) => {
      const eventSegment =
        controlType === "Dummy Control"
          ? `${client}ECO${getRandomLetter(usedLetters)}`
          : `${client}V${idx + 1}${getRandomLetter(usedLetters)}`;

      const dataLayerObject = {
        event: "conversioEvent",
        conversio: {
          eventCategory: "Conversio CRO",
          eventAction: `${client} | Event Tracking`,
          eventLabel: `${client} | (${controlType}) | ${description}`,
          eventSegment: eventSegment,
        },
      };

      // Push the object to the dataLayer
      if (typeof window !== "undefined" && window.dataLayer) {
        window.dataLayer.push(dataLayerObject);
      } else {
        console.log("dataLayer object:", dataLayerObject); // Fallback for debugging
      }
    });
  }, [trigger]); // Execute logic only when the trigger changes

  return null;
};

export default DataLayerLogic;