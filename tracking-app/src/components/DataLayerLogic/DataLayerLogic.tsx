"use client";

import React, { useEffect } from "react";
import { useExperience } from "../ExperienceContext/ExperienceContext";

interface DataLayerLogicProps {
  client: string; // e.g., "Finisterre"
  experienceNumber: string; // e.g., "010"
  eventDescriptions: string[]; // e.g., ["CTA Click", "Banner Impression"]
  controlType: string; // e.g., "Dummy Control"
  trigger: boolean; // toggled to re-run logic
}

const DataLayerLogic: React.FC<DataLayerLogicProps> = ({
  client,
  experienceNumber,
  eventDescriptions,
  controlType,
  trigger,
}) => {
  const { numVariants } = useExperience();

  // Format client code: First 2 letters of client (uppercase) + experience number
  const fullClient = `${client.slice(0, 2).toUpperCase()}${experienceNumber}`;

  // Helper to get a unique random letter from the last 10 letters of the alphabet
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
    if (!trigger) return;

    const usedLetters = new Set<string>();
    const descriptionLetters = new Map<string, string>();

    // Generate a random letter for each event description
    eventDescriptions.forEach((description) => {
      if (!descriptionLetters.has(description)) {
        descriptionLetters.set(description, getRandomLetter(usedLetters));
      }
    });

    // Helper to generate event segment based on control/variation type and shared letter
    const generateEventSegment = (description: string, variantPrefix: string) => {
      const sharedLetter = descriptionLetters.get(description);
      if (variantPrefix === "ECO") {
        // For Dummy Control, use 'ECO' prefix
        return `${fullClient}${variantPrefix}${sharedLetter}`;
      }
      // For variations, use 'EV' followed by variant number (e.g., EV1, EV2)
      return `${fullClient}E${variantPrefix}${sharedLetter}`;
    };

    // Always generate Dummy Control events
    eventDescriptions.forEach((description) => {
      const eventSegment = generateEventSegment(description, "ECO");

      const dataLayerObject = {
        event: "conversioEvent",
        conversio: {
          eventCategory: "Conversio CRO",
          eventAction: `${fullClient} | Event Tracking`,
          eventLabel: `${fullClient} | (Dummy Control) | ${description}`,
          eventSegment,
        },
      };

      if (typeof window !== "undefined" && window.dataLayer) {
        window.dataLayer.push(dataLayerObject);
      } else {
        console.log("Dummy Control dataLayer object:", dataLayerObject);
      }
    });

    // Generate variation events based on the number of variants
    for (let variantIndex = 1; variantIndex <= numVariants; variantIndex++) {
      eventDescriptions.forEach((description) => {
        const eventSegment = generateEventSegment(description, `V${variantIndex}`);

        const dataLayerObject = {
          event: "conversioEvent",
          conversio: {
            eventCategory: "Conversio CRO",
            eventAction: `${fullClient} | Event Tracking`,
            eventLabel: `${fullClient} | (Variation ${variantIndex}) | ${description}`,
            eventSegment,
          },
        };

        if (typeof window !== "undefined" && window.dataLayer) {
          window.dataLayer.push(dataLayerObject);
        } else {
          console.log(`Variation ${variantIndex} dataLayer object:`, dataLayerObject);
        }
      });
    }
  }, [trigger, numVariants, eventDescriptions, client, experienceNumber]);

  return null;
};

export default DataLayerLogic;
