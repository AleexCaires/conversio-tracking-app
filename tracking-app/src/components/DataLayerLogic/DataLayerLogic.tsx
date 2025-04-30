import React, { useEffect, useState } from "react";
import { useExperience } from "../ExperienceContext/ExperienceContext";

interface DataLayerLogicProps {
  client: string;
  experienceNumber: string;
  eventDescriptions: string[];
  controlType: string;
  trigger: boolean;
  setTrigger: (value: boolean) => void;
  onDataGenerated?: (data: any) => void;
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

const DataLayerLogic: React.FC<DataLayerLogicProps> = ({ client, experienceNumber, eventDescriptions, controlType, trigger, setTrigger, onDataGenerated }) => {
  const { numVariants } = useExperience();

  const [eventData, setEventData] = useState<{
    controlEvents: string[];
    variationEvents: string[];
  }>({
    controlEvents: [],
    variationEvents: [],
  });

  const [activeBorders, setActiveBorders] = useState<Record<string, boolean>>({}); // Track active borders

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

    console.log("Trigger activated:", trigger);
    console.log("Event Descriptions:", eventDescriptions);

    if (eventDescriptions.length === 0) {
      console.warn("No event descriptions provided.");
      return;
    }

    const usedLetters = new Set<string>();
    const descriptionLetters = new Map<string, string>();

    eventDescriptions.forEach((description) => {
      if (!descriptionLetters.has(description)) {
        descriptionLetters.set(description, getRandomLetter(usedLetters));
      }
    });

    console.log("Description Letters Map:", descriptionLetters);

    const generateEventSegment = (description: string, variantPrefix: string) => {
      const sharedLetter = descriptionLetters.get(description);
      if (sharedLetter) {
        if (variantPrefix === "ECO") {
          return `${fullClient}${variantPrefix}${sharedLetter}`;
        }
        return `${fullClient}E${variantPrefix}${sharedLetter}`;
      }
      console.warn("No shared letter found for description:", description);
      return "";
    };

    const newControlEvents: string[] = [];
    const newVariationEvents: string[] = [];

    eventDescriptions.forEach((description) => {
      const eventSegment = generateEventSegment(description, "ECO");
      console.log("Generated Event Segment (Control):", eventSegment);

      if (clientCode === "LT") {
        // Adobe-specific dataLayer object
        const adobeDataLayerObject = {
          event: "targetClickEvent",
          eventData: {
            click: {
              clickLocation: "Conversio CRO",
              clickAction: `${fullClient} | Event Tracking`,
              clickText: `${fullClient} (Control Original) | ${description}`,
            },
          },
        };

        // Push to adobeDataLayer
        if (typeof window !== "undefined" && window.adobeDataLayer) {
          window.adobeDataLayer.push(adobeDataLayerObject);
        } else {
          console.log("Dummy Adobe Control dataLayer object:", adobeDataLayerObject);
        }

        // Add to newControlEvents for UI rendering
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
        // Standard dataLayer object
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
      }
    });

    for (let variantIndex = 1; variantIndex <= numVariants; variantIndex++) {
      eventDescriptions.forEach((description) => {
        const eventSegment = generateEventSegment(description, `V${variantIndex}`);
        console.log("Generated Event Segment (Variation):", eventSegment);

        if (clientCode === "LT") {
          // Adobe-specific dataLayer object
          const adobeDataLayerObject = {
            event: "targetClickEvent",
            eventData: {
              click: {
                clickLocation: "Conversio CRO",
                clickAction: `${fullClient} | Event Tracking`,
                clickText: `${fullClient} (Variation ${variantIndex}) | ${description}`,
              },
            },
          };

          // Push to adobeDataLayer
          if (typeof window !== "undefined" && window.adobeDataLayer) {
            window.adobeDataLayer.push(adobeDataLayerObject);
          } else {
            console.log(`Variation ${variantIndex} Adobe dataLayer object:`, adobeDataLayerObject);
          }

          // Add to newVariationEvents for UI rendering
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
          // Standard dataLayer object
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
        }
      });
    }

    console.log("New Control Events:", newControlEvents);
    console.log("New Variation Events:", newVariationEvents);

    setEventData({
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
  }, [trigger, numVariants, eventDescriptions, client, experienceNumber]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);

    // Update the active border for the copied event
    setActiveBorders((prev) => ({ ...prev, [key]: true }));
  };

  return (
    <div>
      {eventData.controlEvents.length > 0 && (
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
            {eventData.controlEvents.map((event, index) => {
              const key = `control-${index}`;
              return (
                <div key={key} style={{ position: "relative" }}>
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
                      border: activeBorders[key]
                        ? "2px solid #007bff" // Blue border for active
                        : "2px solid transparent",
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
              );
            })}
          </div>
        </>
      )}

      {eventData.variationEvents.length > 0 && (
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
            {eventData.variationEvents.map((event, index) => {
              const key = `variation-${index}`;
              return (
                <div key={key} style={{ position: "relative" }}>
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
                      border: activeBorders[key]
                        ? "2px solid #007bff" // Blue border for active
                        : "2px solid transparent",
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
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default DataLayerLogic;
