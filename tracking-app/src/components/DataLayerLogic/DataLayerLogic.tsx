import React, { useEffect, useState } from "react";
import { useExperience } from "../ExperienceContext/ExperienceContext";

interface DataLayerLogicProps {
  client: string;
  experienceNumber: string;
  eventDescriptions: string[];
  controlType: string;
  trigger: boolean;
  setTrigger: (value: boolean) => void;
  onDataGenerated: (data: { controlEvents: string[]; variationEvents: string[] }) => void;
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

    eventDescriptions.forEach((description) => {
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
    });

    for (let variantIndex = 1; variantIndex <= numVariants; variantIndex++) {
      eventDescriptions.forEach((description) => {
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
      });
    }

    setLocalEventData({
      controlEvents: newControlEvents,
      variationEvents: newVariationEvents,
    });

    if (onDataGenerated) {
      onDataGenerated({
        controlEvents: newControlEvents,
        variationEvents: newVariationEvents,
      });
    }

    setTimeout(() => setTrigger(false), 100);
  }, [trigger, numVariants, eventDescriptions, client, experienceNumber, setTrigger, onDataGenerated]);

  const copyToClipboard = (event: string, key: string) => {
    navigator.clipboard.writeText(event).then(() => {
      setActiveBorders((prev) => ({ ...prev, [key]: true }));
      setSelectedStatus((prev) => ({ ...prev, [key]: true }));
      console.log(`Code copied locally for key: ${key}`);
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

      {localEventData.variationEvents.length > 0 && (
        <>
          <h3>Variation Events</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
              gap: "16px",
              padding: "10px",
            }}
          >
            {localEventData.variationEvents.map((event, index) => renderEventBlock(event, `variation-${index}`))}
          </div>
        </>
      )}
    </div>
  );
};

export default DataLayerLogic;
