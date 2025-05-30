import React, { useEffect, useState, useCallback } from "react";
import { useExperience } from "../ExperienceContext/ExperienceContext";
import { clients } from "../../lib/clients";
import { Client } from "@/types";
import {
  EventBlockWrapper,
  SelectCheckbox,
  EventCodePre,
  CopyButton,
  EventsGrid,
  EventsSectionTitle
} from "./DataLayerLogic.styles";

interface EventDataWithCopied {
  controlEvents: string[];
  variationEvents: string[];
  controlEventsWithCopied: { code: string; codeCopied: boolean }[];
  variationEventsWithCopied: { code: string; codeCopied: boolean }[];
}

interface LocalEventData {
  controlEvents: string[];
  variationEvents: string[];
}

interface DataLayerLogicProps {
  client: string;
  experienceNumber: string;
  eventDescriptions: string[];
  trigger: boolean;
  setTrigger: (value: boolean) => void;
  onDataGenerated: (data: EventDataWithCopied) => void;
  selectedStatus: Record<string, boolean>;
  setSelectedStatus: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

const DataLayerLogic: React.FC<DataLayerLogicProps> = ({ client, experienceNumber, eventDescriptions, trigger, setTrigger, onDataGenerated, selectedStatus, setSelectedStatus }) => {
  const { numVariants } = useExperience();

  const [activeBorders, setActiveBorders] = useState<Record<string, boolean>>({});
  const [localEventData, setLocalEventData] = useState<LocalEventData>({
    controlEvents: [],
    variationEvents: [],
  });

  const clientData: Client | undefined = clients.find((c: Client) => c.name === client || c.code === client);
  const clientCode = clientData ? clientData.code : client;
  const fullClient = `${clientCode}${experienceNumber}`;

  const getRandomLetter = useCallback((usedLetters: Set<string>, seed: string): string => {
    const letters = "QRSTUVWXYZ";
    // Create a simple hash from the seed to make it deterministic
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    const availableLetters = letters.split("").filter((letter) => !usedLetters.has(letter));
    if (availableLetters.length === 0) return "Q"; // fallback

    const index = Math.abs(hash) % availableLetters.length;
    const letter = availableLetters[index];
    usedLetters.add(letter);
    return letter;
  }, []);

  const toggleSelection = (key: string) => {
    setSelectedStatus((prev) => ({ ...prev, [key]: !prev[key] }));
    setActiveBorders((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Memoize the onDataGenerated callback to prevent unnecessary re-renders
  const memoizedOnDataGenerated = useCallback(onDataGenerated, [onDataGenerated]);

  useEffect(() => {
    if (!trigger) return;

    // Clear existing events when trigger is activated
    setLocalEventData({
      controlEvents: [],
      variationEvents: [],
    });

    const usedLetters = new Set<string>();
    const descriptionLetters = new Map<string, string>();

    eventDescriptions.forEach((description, index) => {
      if (!descriptionLetters.has(description)) {
        // Use description + index as seed for deterministic results
        const seed = `${description}-${index}-${fullClient}`;
        descriptionLetters.set(description, getRandomLetter(usedLetters, seed));
      }
    });

    const generateEventSegment = (description: string, variantPrefix: string) => {
      const sharedLetter = descriptionLetters.get(description);
      if (sharedLetter) {
        if (variantPrefix === "ECO") {
          return `${fullClient}${variantPrefix}${sharedLetter}`;
        }
        return `${fullClient}E${variantPrefix}${sharedLetter}`;
      }
      return "";
    };

    const newControlEvents: string[] = [];
    const newVariationEvents: string[] = [];

    for (let idx = 0; idx < eventDescriptions.length; idx++) {
      const description = eventDescriptions[idx];
      const eventSegment = generateEventSegment(description, "ECO");
      if (clientCode === "LT") {
        newControlEvents.push(`adobeDataLayer.push({
    event: 'targetClickEvent',
    eventData: {
        click: {
            clickLocation: 'Conversio CRO',
            clickAction: '${fullClient} | Event Tracking',
            clickText: '${fullClient} (Control Original) | ${description}'
        }
    }
});`);
      } else if (clientCode === "SA") {
        newControlEvents.push(`window.dataLayer.push({
    "event": "conversioEvent", 
    "conversio": {
        "conversio_experiences": "${fullClient} | (Control Original) | ${description}",
        "conversio_events": "${fullClient} | Event Tracking",
        "conversio_segment": "${eventSegment}"
    }
});`);
      } else {
        newControlEvents.push(`window.dataLayer.push({
    'event': 'conversioEvent',
    'conversio' : {
        'eventCategory': 'Conversio CRO',
        'eventAction': '${fullClient} | Event Tracking',
        'eventLabel': '${fullClient} | (Control Original) | ${description}',
        'eventSegment': '${eventSegment}'
    }
});`);
      }
    }

    for (let variantIndex = 1; variantIndex <= numVariants; variantIndex++) {
      for (let idx = 0; idx < eventDescriptions.length; idx++) {
        const description = eventDescriptions[idx];
        const eventSegment = generateEventSegment(description, `V${variantIndex}`);
        if (clientCode === "LT") {
          newVariationEvents.push(`adobeDataLayer.push({
    event: 'targetClickEvent',
    eventData: {
        click: {
            clickLocation: 'Conversio CRO',
            clickAction: '${fullClient} | Event Tracking',
            clickText: '${fullClient} (Variation ${variantIndex}) | ${description}'
        }
    }
});`);
        } else if (clientCode === "SA") {
          newVariationEvents.push(`window.dataLayer.push({
    "event": "conversioEvent", 
    "conversio": {
        "conversio_experiences": "${fullClient} | (Variation ${variantIndex}) | ${description}",
        "conversio_events": "${fullClient} | Event Tracking",
        "conversio_segment": "${eventSegment}"
    }
});`);
        } else {
          newVariationEvents.push(`window.dataLayer.push({
    'event': 'conversioEvent',
    'conversio' : {
        'eventCategory': 'Conversio CRO',
        'eventAction': '${fullClient} | Event Tracking',
        'eventLabel': '${fullClient} | (Variation ${variantIndex}) | ${description}',
        'eventSegment': '${eventSegment}'
    }
});`);
        }
      }
    }

    setLocalEventData({
      controlEvents: newControlEvents,
      variationEvents: newVariationEvents,
    });

    const controlEventsWithCopied = newControlEvents.map((event, idx) => ({
      code: event,
      codeCopied: !!selectedStatus[`control-${idx}`],
    }));

    const variationEventsWithCopied = newVariationEvents.map((event, idx) => ({
      code: event,
      codeCopied: !!selectedStatus[`variation-${idx}`],
    }));

    memoizedOnDataGenerated({
      controlEvents: newControlEvents,
      variationEvents: newVariationEvents,
      controlEventsWithCopied,
      variationEventsWithCopied,
    });

    Promise.resolve().then(() => setTrigger(false));
  }, [trigger, numVariants, client, experienceNumber, eventDescriptions, selectedStatus, clientCode, fullClient, memoizedOnDataGenerated, setTrigger, getRandomLetter]);

  useEffect(() => {
    // Reset local event data when eventDescriptions is reset (e.g., after cancel edit)
    if ((!eventDescriptions || eventDescriptions.length === 0) && !trigger) {
      setLocalEventData({
        controlEvents: [],
        variationEvents: [],
      });
      setActiveBorders({});
      setSelectedStatus({});
    }
  }, [eventDescriptions, trigger, setSelectedStatus, onDataGenerated]);

  const copyToClipboard = (event: string, key: string) => {
    navigator.clipboard.writeText(event).then(() => {
      setActiveBorders((prev) => ({ ...prev, [key]: true }));
      setSelectedStatus((prev) => {
        const newSelectedStatus = { ...prev, [key]: true };
        const controlEventsWithCopied = localEventData.controlEvents.map((evt, idx) => ({
          code: evt,
          codeCopied: !!newSelectedStatus[`control-${idx}`],
        }));
        const variationEventsWithCopied = localEventData.variationEvents.map((evt, idx) => ({
          code: evt,
          codeCopied: !!newSelectedStatus[`variation-${idx}`],
        }));
        memoizedOnDataGenerated({
          controlEvents: localEventData.controlEvents,
          variationEvents: localEventData.variationEvents,
          controlEventsWithCopied,
          variationEventsWithCopied,
        });
        return newSelectedStatus;
      });
      setTimeout(() => {
        setActiveBorders((prev) => ({ ...prev, [key]: false }));
      }, 2000);
    });
  };

  const renderEventBlock = (event: string, key: string) => (
    <EventBlockWrapper key={key} data-copied={!!selectedStatus[key]} $activeBorder={!!activeBorders[key]}>
      <SelectCheckbox
        checked={!!selectedStatus[key]}
        onChange={() => toggleSelection(key)}
        title={selectedStatus[key] ? "Unselect" : "Select"}
      />
      <EventCodePre $activeBorder={!!activeBorders[key]}>
        {event}
      </EventCodePre>
      <CopyButton
        onClick={() => copyToClipboard(event, key)}
        title={"Copy Code"}
      >
        Copy Code
      </CopyButton>
    </EventBlockWrapper>
  );

  return (
    <div>
      {localEventData.controlEvents.length > 0 && (
        <>
          <EventsSectionTitle>Control Events</EventsSectionTitle>
          <EventsGrid>
            {localEventData.controlEvents.map((event, index) => renderEventBlock(event, `control-${index}`))}
          </EventsGrid>
        </>
      )}
      {Array.from({ length: numVariants }, (_, variantIdx) => {
        const start = variantIdx * eventDescriptions.length;
        const end = start + eventDescriptions.length;
        const events = localEventData.variationEvents.slice(start, end);
        if (events.length === 0) return null;
        return (
          <React.Fragment key={variantIdx + 1}>
            <EventsSectionTitle>{`Variation ${variantIdx + 1} Events`}</EventsSectionTitle>
            <EventsGrid>
              {events.map((event, idx) => renderEventBlock(event, `variation-${start + idx}`))}
            </EventsGrid>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default DataLayerLogic;
