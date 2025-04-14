import React, { useEffect, useState } from "react";
import { useExperience } from "../ExperienceContext/ExperienceContext";
interface DataLayerLogicProps {
  client: string;
  experienceNumber: string;
  eventDescriptions: string[];
  controlType: string;
  trigger: boolean;
  setTrigger: (value: boolean) => void;
  onDataGenerated?: (data: any) => void; // New callback prop
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

const DataLayerLogic: React.FC<DataLayerLogicProps> = ({
  client,
  experienceNumber,
  eventDescriptions,
  controlType,
  trigger,
}) => {
  const { numVariants } = useExperience();

  const [eventData, setEventData] = useState<{
    controlEvents: string[];
    variationEvents: string[];
  }>({
    controlEvents: [],
    variationEvents: [],
  });

  // Find the client code based on the client name
  const clientData = clients.find((c) => c.name === client);
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

    const newControlEvents: string[] = [];
    const newVariationEvents: string[] = [];

    // Always generate Dummy Control events
    eventDescriptions.forEach((description) => {
      const eventSegment = generateEventSegment(description, "ECO");

      const dataLayerObject = {
        event: "conversioEvent",
        conversio: {
          eventCategory: "Conversio CRO",
          eventAction: `${fullClient} | Event Tracking`,
          eventLabel: `${fullClient} | (Control Original) | ${description}`,
          eventSegment: eventSegment,
        },
      };

      newControlEvents.push(`window.dataLayer.push({
    'event': 'conversioEvent',
    'conversio' : {
        'eventCategory': 'Conversio CRO',
        'eventAction': '${fullClient} | Event Tracking',
        'eventLabel': '${fullClient} | (Control Original) | ${description}',
        'eventSegment': '${eventSegment}'
    }
});`);

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
            eventSegment: eventSegment,
          },
        };

        newVariationEvents.push(`window.dataLayer.push({
    'event': 'conversioEvent',
    'conversio' : {
        'eventCategory': 'Conversio CRO',
        'eventAction': '${fullClient} | Event Tracking',
        'eventLabel': '${fullClient} | (Variation ${variantIndex}) | ${description}',
        'eventSegment': '${eventSegment}'
    }
});`);

        if (typeof window !== "undefined" && window.dataLayer) {
          window.dataLayer.push(dataLayerObject);
        } else {
          console.log(`Variation ${variantIndex} dataLayer object:`, dataLayerObject);
        }
      });
    }

    // Update state with the generated event data
    setEventData({
      controlEvents: newControlEvents,
      variationEvents: newVariationEvents,
    });
  }, [trigger, numVariants, eventDescriptions, client, experienceNumber]);

  // Function to copy code to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Code copied to clipboard!");
    });
  };

  return (
    <div>
      <h3>Control Events</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", // Use grid to allow events to share a line if there's enough space
          gap: "16px",
          padding: "10px",
        }}
      >
        {eventData.controlEvents.map((event, index) => (
          <div key={index} style={{ position: "relative" }}>
            <pre
              style={{
                backgroundColor: "#1e1e1e", // Dark background for dark mode
                color: "#f5f5f5", // Light text for readability
                padding: "16px",
                borderRadius: "8px",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                maxHeight: "300px", // Fixed height for code block
                overflowY: "auto", // Scroll if content exceeds
              }}
            >
              {event}
            </pre>
            <button
              onClick={() => copyToClipboard(event)}
              style={{
                position: "absolute",
                right: "16px",
                bottom: "16px",
                padding: "8px 12px",
                fontSize: "14px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Copy Code
            </button>
          </div>
        ))}
      </div>

      <h3>Variation Events</h3>
      {Array.from({ length: numVariants }).map((_, variantIndex) => (
        <div
          key={variantIndex}
          style={{
            marginTop: "20px", // Space between each variation block
          }}
        >
          {/* Variation Title (h4) */}
          <h4>Variation {variantIndex + 1}</h4>

          {/* Grid of variation events */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", // Use grid to allow events to share a line if there's enough space
              gap: "16px",
              padding: "10px",
            }}
          >
            {eventData.variationEvents
              .filter((_, index) => index % numVariants === variantIndex)
              .map((event, index) => (
                <div key={index} style={{ position: "relative" }}>
                  <pre
                    style={{
                      backgroundColor: "#1e1e1e", // Dark background for dark mode
                      color: "#f5f5f5", // Light text for readability
                      padding: "16px",
                      borderRadius: "8px",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      maxHeight: "300px", // Fixed height for code block
                      overflowY: "auto", // Scroll if content exceeds
                    }}
                  >
                    {event}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(event)}
                    style={{
                      position: "absolute",
                      right: "16px",
                      bottom: "16px",
                      padding: "8px 12px",
                      fontSize: "14px",
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Copy Code
                  </button>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};


export default DataLayerLogic;
