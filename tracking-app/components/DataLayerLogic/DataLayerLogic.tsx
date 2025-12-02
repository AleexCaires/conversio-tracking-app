import React, { useEffect, useState, useCallback } from "react";
import { useExperience } from "../ExperienceContext/ExperienceContext";
import { clients } from "../../lib/clients";
import { Client } from "@/types";
import CopyIcon from "../Icons/CopyIcon";
import { EventBlockWrapper, SelectCheckbox, CopyButton, EventsGrid, EventsSectionTitle } from "./DataLayerLogic.styles";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

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
  includeExperienceEvent?: boolean;
  experienceName?: string;
  triggerEventInfo?: { enabled: boolean; description?: string };
}

const DataLayerLogic: React.FC<DataLayerLogicProps> = ({ client, experienceNumber, eventDescriptions, trigger, setTrigger, onDataGenerated, selectedStatus, setSelectedStatus, includeExperienceEvent, experienceName, triggerEventInfo }) => {
  const { numVariants } = useExperience();
  const [activeBorders, setActiveBorders] = useState<Record<string, boolean>>({});
  const [localEventData, setLocalEventData] = useState<LocalEventData>({
    controlEvents: [],
    variationEvents: [],
  });

  const clientData: Client | undefined = clients.find((c: Client) => c.name === client || c.code === client);
  const clientCode = clientData ? clientData.code : client;
  const fullClient = `${clientCode}${experienceNumber}`;

  const getRandomLetter = useCallback((usedLetters: Set<string>): string => {
    // Single-letter pool only (no double letters) - Q removed for regular events
    const letters = "GHIJKLMNOPRSTUVWXYZ"; // 19 letters (Q removed)
    const nextIndex = usedLetters.size;
    if (nextIndex < letters.length) {
      const letter = letters[nextIndex];
      usedLetters.add(letter);
      return letter;
    }
    if (process.env.NODE_ENV !== "production") {
      console.warn("[DataLayerLogic] More than 19 unique event descriptions – reusing last letter (Z). Extend letters if needed.");
    }
    return "Z";
  }, []);

  const toggleSelection = (key: string) => {
    setSelectedStatus((prev) => ({ ...prev, [key]: !prev[key] }));
    setActiveBorders((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const memoizedOnDataGenerated = useCallback(onDataGenerated, [onDataGenerated]);

  useEffect(() => {
    if (!trigger) return;

    setLocalEventData({
      controlEvents: [],
      variationEvents: [],
    });

    const usedLetters = new Set<string>();
    const descriptionLetters = new Map<string, string>();

    eventDescriptions.forEach((description, index) => {
      if (!descriptionLetters.has(description)) {
        // Check if this is a trigger event
        // Trigger events always get Q, but ONLY if triggerEventInfo indicates a trigger event is enabled
        const isTriggerEvent = triggerEventInfo?.enabled && index === 0;

        if (isTriggerEvent) {
          // Trigger events always get Q
          descriptionLetters.set(description, "Q");
        } else {
          // Regular events get sequential letters from the pool
          descriptionLetters.set(description, getRandomLetter(usedLetters));
        }
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
    let newVariationEvents: string[] = [];

    // Insert special event at the top if needed (for Control)
    if (includeExperienceEvent && (clientCode === "SA" || clientCode === "LF" || clientCode === "VX")) {
      const expId = `${fullClient}`;
      const expName = experienceName || "";

      // Different format for Sephora
      if (clientCode === "SA" || clientCode === "VX") {
        newControlEvents.push(
          `window.dataLayer.push({
event: "conversioExperience",
conversio: {
    experience_category: "Conversio Experience",
    experience_action: "${expId} | A/B/n | ${expName}",
    experience_label: "${expId} | Control Original",
    experience_segment: "${expId}.XCO"
}
});`
        );
      } else {
        // Original format for Liverpool
        newControlEvents.push(
          `window.dataLayer.push({
    'event': 'conversioExperience',
    'conversio' : {
        'experienceCategory': 'Conversio Experience',
        'experienceAction': '${expId} | ${expName}',
        'experienceLabel': '${expId} | Control Original',
        'experience_segment': '${expId}.XCO'
    }
});`
        );
      }
    }

    // Always generate normal control events
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
      } else if (clientCode === "SA" || clientCode === "VX") {
        newControlEvents.push(`window.dataLayer.push({
    event: "conversioEvent", 
    conversio: {
      event_category: "Conversio CRO",
      event_action: "${fullClient} | Event Tracking",
      event_label: "${fullClient} | (Control Original) | ${description}",
      event_segment: "${eventSegment}"
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

    // Always generate normal variation events
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
        } else if (clientCode === "SA" || clientCode === "VX") {
          newVariationEvents.push(`window.dataLayer.push({
    event: "conversioEvent", 
    conversio: {
      event_category: "Conversio CRO",
      event_action: "${fullClient} | Event Tracking",
      event_label: "${fullClient} | (Variation ${variantIndex}) | ${description}",
      event_segment: "${eventSegment}"
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

    // Insert special event for each variation if needed
    // Create a new array to hold all variation events in the correct order
    const finalVariationEvents: string[] = [];

    if (includeExperienceEvent && (clientCode === "SA" || clientCode === "LF" || clientCode === "VX")) {
      const expId = `${fullClient}`;
      const expName = experienceName || "";

      // Loop through each variation
      for (let variantIndex = 1; variantIndex <= numVariants; variantIndex++) {
        // Add the experience event first for this variation with different format for Sephora
        if (clientCode === "SA" || clientCode === "VX") {
          finalVariationEvents.push(
            `window.dataLayer.push({
event: "conversioExperience",
conversio: {
    experience_category: "Conversio Experience",
    experience_action: "${expId} | A/B/n | ${expName}",
    experience_label: "${expId} | Variation ${variantIndex}",
    experience_segment: "${expId}.XV${variantIndex}"
}
});`
          );
        } else {
          // Original format for Liverpool
          finalVariationEvents.push(
            `window.dataLayer.push({
    'event': 'conversioExperience',
    'conversio' : {
        'experienceCategory': 'Conversio Experience',
        'experienceAction': '${expId} | ${expName}',
        'experienceLabel': '${expId} | Variation ${variantIndex}',
        'experience_segment': '${expId}.XV${variantIndex}'
    }
});`
          );
        }

        // Then add all the normal events for this variation
        const startIdx = (variantIndex - 1) * eventDescriptions.length;
        const endIdx = startIdx + eventDescriptions.length;
        for (let i = startIdx; i < endIdx; i++) {
          finalVariationEvents.push(newVariationEvents[i]);
        }
      }

      // Replace the variation events with our correctly ordered final array
      newVariationEvents = finalVariationEvents;
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
  }, [trigger, numVariants, client, experienceNumber, eventDescriptions, selectedStatus, clientCode, fullClient, memoizedOnDataGenerated, setTrigger, getRandomLetter, includeExperienceEvent, experienceName, triggerEventInfo]);

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
      <SelectCheckbox checked={!!selectedStatus[key]} onChange={() => toggleSelection(key)} title={selectedStatus[key] ? "Unselect" : "Select"} />
      <SyntaxHighlighter
        language="javascript"
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: "12px",
          borderRadius: "6px",
          fontSize: "14px",
          lineHeight: "1.5",
          border: activeBorders[key] ? "2px solid #22c55e" : "1px solid #e5e7eb",
        }}
        showLineNumbers={false}
        wrapLines={true}
      >
        {event}
      </SyntaxHighlighter>
      <CopyButton onClick={() => copyToClipboard(event, key)} title={"Copy Code"}>
        {selectedStatus[key] ? (
          "Copied!"
        ) : (
          <>
            <CopyIcon width="1em" height="1em" /> Code
          </>
        )}
      </CopyButton>
    </EventBlockWrapper>
  );

  return (
    <div>
      {localEventData.controlEvents.length > 0 && (
        <>
          <EventsSectionTitle>Control Events</EventsSectionTitle>
          <EventsGrid>{localEventData.controlEvents.map((event, index) => renderEventBlock(event, `control-${index}`))}</EventsGrid>
        </>
      )}

      {includeExperienceEvent && (clientCode === "SA" || clientCode === "LF" || clientCode === "VX")
        ? // Special rendering for clients with experience events
          Array.from({ length: numVariants }, (_, variantIdx) => {
            // For special clients with experience events, calculate positions differently
            const eventsPerVariation = eventDescriptions.length + 1; // +1 for the experience event
            const start = variantIdx * eventsPerVariation;
            const end = start + eventsPerVariation;
            const events = localEventData.variationEvents.slice(start, end);

            if (events.length === 0) return null;
            return (
              <React.Fragment key={variantIdx + 1}>
                <EventsSectionTitle>{`Variation ${variantIdx + 1} Events`}</EventsSectionTitle>
                <EventsGrid>{events.map((event, idx) => renderEventBlock(event, `variation-${start + idx}`))}</EventsGrid>
              </React.Fragment>
            );
          })
        : // Regular rendering for standard clients
          Array.from({ length: numVariants }, (_, variantIdx) => {
            const start = variantIdx * eventDescriptions.length;
            const end = start + eventDescriptions.length;
            const events = localEventData.variationEvents.slice(start, end);
            if (events.length === 0) return null;
            return (
              <React.Fragment key={variantIdx + 1}>
                <EventsSectionTitle>{`Variation ${variantIdx + 1} Events`}</EventsSectionTitle>
                <EventsGrid>{events.map((event, idx) => renderEventBlock(event, `variation-${start + idx}`))}</EventsGrid>
              </React.Fragment>
            );
          })}
    </div>
  );
};

export default DataLayerLogic;
