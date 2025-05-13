import React, { useEffect, useState } from "react";
import { useExperience } from "../ExperienceContext/ExperienceContext";

interface DataLayerLogicProps {
  client: string;
  experienceNumber: string;
  eventDescriptions: string[];
  controlType: string;
  trigger: boolean;
  setTrigger: (value: boolean) => void;
  onDataGenerated: (data: { controlEvents: string[]; variationEvents: string[]; controlEventsWithCopied: { code: string; codeCopied: boolean }[]; variationEventsWithCopied: { code: string; codeCopied: boolean }[] }) => void;
  selectedStatus: Record<string, boolean>;
  setSelectedStatus: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

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
  { name: "Sephora", code: "SA" },
];

const DataLayerLogic: React.FC<DataLayerLogicProps> = ({ client, experienceNumber, eventDescriptions, controlType, trigger, setTrigger, onDataGenerated, selectedStatus, setSelectedStatus }) => {
  const { numVariants } = useExperience();

  const [activeBorders, setActiveBorders] = useState<Record<string, boolean>>({});
  const [localEventData, setLocalEventData] = useState<{
    controlEvents: string[];
    variationEvents: string[];
  }>({
    controlEvents: [],
    variationEvents: [],
  });

  const clientData = clients.find((c) => c.name === client || c.code === client);
  const clientCode = clientData ? clientData.code : client;
  const fullClient = `${clientCode}${experienceNumber}`;

  const getRandomLetter = (usedLetters: Set<string>): string => {
    const letters = "QRSTUVWXYZ";
    let letter;
    do {
      letter = letters[Math.floor(Math.random() * letters.length)];
    } while (usedLetters.has(letter));
    usedLetters.add(letter);
    return letter;
  };

  const toggleSelection = (key: string) => {
    setSelectedStatus((prev) => ({ ...prev, [key]: !prev[key] }));
    setActiveBorders((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    if (!trigger) return;

    const usedLetters = new Set<string>();
    const descriptionLetters = new Map<string, string>();

    eventDescriptions.forEach((description) => {
      if (!descriptionLetters.has(description)) {
        descriptionLetters.set(description, getRandomLetter(usedLetters));
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

    if (onDataGenerated) {
      const controlEventsWithCopied = newControlEvents.map((event, idx) => ({
        code: event,
        codeCopied: !!selectedStatus[`control-${idx}`],
      }));

      const variationEventsWithCopied = newVariationEvents.map((event, idx) => ({
        code: event,
        codeCopied: !!selectedStatus[`variation-${idx}`],
      }));

      onDataGenerated({
        controlEvents: newControlEvents,
        variationEvents: newVariationEvents,
        controlEventsWithCopied,
        variationEventsWithCopied,
      });
    }

    Promise.resolve().then(() => setTrigger(false));
  }, [trigger, numVariants, client, experienceNumber, eventDescriptions, selectedStatus]);

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

        onDataGenerated({
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
    <div key={key} style={{ position: "relative" }} data-copied={!!selectedStatus[key]}>
      <input
        type="checkbox"
        checked={!!selectedStatus[key]}
        onChange={() => toggleSelection(key)}
        style={{
          position: "absolute",
          top: "-10px",
          right: "0px",
          width: "20px",
          height: "20px",
          cursor: "pointer",
        }}
        title={selectedStatus[key] ? "Unselect" : "Select"}
      />
      <pre
        style={{
          backgroundColor: "#1e1e1e",
          color: "#f5f5f5",
          padding: "16px",
          borderRadius: "8px",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          maxHeight: "300px",
          overflowY: "auto",
          border: activeBorders[key] ? "2px solid #007bff" : "2px solid transparent",
          boxShadow: activeBorders[key] ? "0 0 10px #007bff, 0 0 20px #007bff" : "none",
          transition: "box-shadow 0.3s ease, border 0.3s ease",
        }}
      >
        {event}
      </pre>
      <button
        onClick={() => copyToClipboard(event, key)}
        style={{
          position: "absolute",
          right: "16px",
          bottom: "48px",
          padding: "8px 12px",
          fontSize: "14px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
        title={"Copy Code"}
      >
        Copy Code
      </button>
    </div>
  );

  return (
    <div>
      {localEventData.controlEvents.length > 0 && (
        <>
          <h3>Control Events</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
              gap: "16px",
              padding: "10px",
            }}
          >
            {localEventData.controlEvents.map((event, index) => renderEventBlock(event, `control-${index}`))}
          </div>
        </>
      )}

      {Array.from({ length: numVariants }, (_, variantIdx) => {
        const start = variantIdx * eventDescriptions.length;
        const end = start + eventDescriptions.length;
        const events = localEventData.variationEvents.slice(start, end);
        if (events.length === 0) return null;
        return (
          <React.Fragment key={variantIdx + 1}>
            <h3>{`Variation ${variantIdx + 1} Events`}</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                gap: "16px",
                padding: "10px",
              }}
            >
              {events.map((event, idx) =>
                renderEventBlock(event, `variation-${start + idx}`)
              )}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default DataLayerLogic;