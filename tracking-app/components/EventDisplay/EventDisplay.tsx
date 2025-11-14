import React, { useState, useEffect, useMemo } from "react";
import { ChildrenWrapper, EventDisplayWrapper, EventTitle, EventLabelsWrapper, EventLabelsList, EventLabelItem, EventLabelIndex, TriggerEventText, EventItemWrapper, EventItemLabel, CodeWrapper, ButtonsWrapper, CopyButtonStyled } from "./EventDisplay.styles";
import { Event as TypedEvent } from "@/types";
import CopyIcon from "../Icons/CopyIcon";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import styled from "styled-components";

interface EventDisplayProps {
  title: string;
  events: (TypedEvent | string)[];
  onCopy: (text: string) => void;
  showMode: "labels" | "code";
}

// Add a styled component for the Experience Event label
const ExperienceEventLabel = styled.span`
  color: #ed9c4a;
  font-weight: 500;
`;

const EventDisplay: React.FC<EventDisplayProps> = ({ title, events, onCopy, showMode }) => {
  const [activeBorders, setActiveBorders] = useState<Record<string, boolean>>({});
  const [copiedState, setCopiedState] = useState<Record<string, boolean>>({});

  const parseEvent = useMemo(() => {
    return (event: TypedEvent | string): TypedEvent => {
      if (typeof event === "string") {
        const parsed: TypedEvent = JSON.parse(event);
        if ("event" in parsed && parsed.event === "targetClickEvent" && parsed.eventData?.click) {
          const { clickAction, clickLocation, clickText } = parsed.eventData.click;
          const triggerEvent =
            typeof parsed.triggerEvent !== "undefined"
              ? Boolean(parsed.triggerEvent)
              : typeof parsed.eventData?.triggerEvent !== "undefined"
              ? Boolean(parsed.eventData?.triggerEvent)
              : typeof parsed.eventData?.click?.triggerEvent !== "undefined"
              ? Boolean(parsed.eventData?.click?.triggerEvent)
              : false;
          return {
            eventAction: clickAction || "N/A",
            eventCategory: clickLocation || "N/A",
            eventLabel: clickText || "N/A",
            eventSegment: "",
            triggerEvent,
          };
        }
        return {
          ...parsed,
          triggerEvent: Boolean(parsed.triggerEvent),
        };
      } else if (event && typeof event === "object") {
        const eventObj = event as TypedEvent & { event?: string; eventData?: TypedEvent["eventData"] };
        if (eventObj.event === "targetClickEvent" && eventObj.eventData?.click) {
          const { clickAction, clickLocation, clickText } = eventObj.eventData.click;
          const triggerEvent =
            typeof eventObj.triggerEvent !== "undefined"
              ? Boolean(eventObj.triggerEvent)
              : typeof eventObj.eventData?.triggerEvent !== "undefined"
              ? Boolean(eventObj.eventData?.triggerEvent)
              : typeof eventObj.eventData?.click?.triggerEvent !== "undefined"
              ? Boolean(eventObj.eventData?.click?.triggerEvent)
              : false;
          return {
            eventAction: clickAction || "N/A",
            eventCategory: clickLocation || "N/A",
            eventLabel: clickText || "N/A",
            eventSegment: "",
            triggerEvent,
          };
        }
        return {
          ...eventObj,
          triggerEvent: Boolean(eventObj.triggerEvent),
        };
      }
      return event as TypedEvent;
    };
  }, []);

  const parsedEvents: TypedEvent[] = useMemo(() => events.map(parseEvent), [events, parseEvent]);

  const getInitialCopiedState = useMemo(() => {
    const state: Record<string, boolean> = {};
    parsedEvents.forEach((_, idx) => {
      state[`${idx}-code`] = false;
      state[`${idx}-label`] = false;
    });
    return state;
  }, [parsedEvents]);

  useEffect(() => {
    setCopiedState(getInitialCopiedState);
  }, [getInitialCopiedState]);

  const generateExperienceEventCode = (event: TypedEvent, isSnakeCase: boolean, sanitizeFn: (str?: string) => string): string => {
    if (!event.conversio) return "";

    const categoryValue = event.conversio.experienceCategory ?? event.conversio.experience_category ?? "Conversio Experience";
    const actionValue = sanitizeFn(event.conversio.experienceAction ?? event.conversio.experience_action ?? "");
    const labelValue = sanitizeFn(event.conversio.experienceLabel ?? event.conversio.experience_label ?? "");
    const segmentValue = event.conversio.experience_segment ?? "";

    const conversioObject: Record<string, string> = {};
    if (isSnakeCase) {
      conversioObject.experience_category = categoryValue;
      conversioObject.experience_action = actionValue;
      conversioObject.experience_label = labelValue;
      conversioObject.experience_segment = segmentValue;
    } else {
      conversioObject.experienceCategory = categoryValue;
      conversioObject.experienceAction = actionValue;
      conversioObject.experienceLabel = labelValue;
      conversioObject.experience_segment = segmentValue; // Note: this key is snake_case in both formats
    }

    const payload = {
      event: "conversioExperience",
      conversio: conversioObject,
    };

    // Use JSON.stringify to ensure correct formatting and escaping
    const payloadString = JSON.stringify(payload, null, 2);

    return `function waitForDataLayer(callback) {
  let checkInterval = setInterval(() => {
    if (window.dataLayer && Array.isArray(window.dataLayer)) {
      clearInterval(checkInterval);
      callback();
    }
  }, 100);
}

waitForDataLayer(() => {
  window.dataLayer.push(${payloadString});
});`;
  };

  // Now do the early return after all hooks
  if (!events || events.length === 0) return null;

  const getEventLabel = (event: TypedEvent): string => {
    if (event.event === "conversioExperience" && event.conversio) {
      return event.conversio.experienceLabel || event.conversio.experience_label || "Experience Tracking Event";
    }
    if (event.conversio && event.conversio.event_label) {
      const label = event.conversio.event_label;
      const firstPart = label.split(" | ")[0]; // e.g., "SA1111ECOQ" or "FN222"

      // Extract only the base segment (letters + numbers, no prefix/suffix)
      // e.g., "SA1111ECOQ" -> "SA1111", "FN222" -> "FN222"
      const baseMatch = firstPart.match(/^[A-Z]+\d+/);
      const baseSegment = baseMatch ? baseMatch[0] : firstPart;

      const rest = label.substring(firstPart.length); // Get " | (Control Original) | Description"
      return baseSegment + rest;
    }
    return event.eventLabel ?? "";
  };

  const eventLabels = parsedEvents
    .map((event) => ({
      label: getEventLabel(event),
      triggerEvent: event.triggerEvent,
    }))
    .filter((item) => item.label && item.label.trim() !== "." && item.label.trim() !== "");

  const handleCopy = (index: number, type: "code" | "segment" | "label", text: string) => {
    const key = `${index}-${type}`;
    onCopy(text);
    setCopiedState((prev) => ({ ...prev, [key]: true }));
    setActiveBorders((prev) => ({ ...prev, [key]: true }));
  };

  return (
    <EventDisplayWrapper>
      <EventTitle>{title}</EventTitle>

      {showMode === "labels" && eventLabels.length > 0 && (
        <EventLabelsWrapper>
          <strong>Event Labels:</strong>
          <EventLabelsList>
            {eventLabels.map((item, idx) => {
              const event = parsedEvents[idx];
              const rawSegment = event.conversio?.event_segment || event.eventSegment || event.conversio?.experience_segment || "";
              const baseMatch = rawSegment.match(/^[A-Za-z]+\d+/);
              const baseSegment = baseMatch ? baseMatch[0] : rawSegment;
              const sanitizeUsingBase = (str?: string) => {
                if (!str) return "";
                if (rawSegment && baseSegment && str.includes(rawSegment)) {
                  return str.replace(new RegExp(rawSegment, "g"), baseSegment);
                }
                return str;
              };
              const clientPrefix = (rawSegment || "").slice(0, 2);

              const isExperienceEvent = event.event === "conversioExperience" || event.experienceEvent;
              const isSnakeCaseFormat = !!(event.conversio && (event.conversio.event_category || event.conversio.experience_category)) || ["SA", "VX"].includes(clientPrefix);
              const isAdobeTarget = !event.eventSegment && event.eventCategory && event.eventLabel;

              let eventCode: string;

              if (isExperienceEvent) {
                eventCode = generateExperienceEventCode(event, isSnakeCaseFormat, sanitizeUsingBase);
              } else if (isSnakeCaseFormat && event.conversio) {
                const actionVal = sanitizeUsingBase(event.conversio.event_action ?? "");
                const labelVal = sanitizeUsingBase(event.conversio.event_label ?? "");
                eventCode = `window.dataLayer.push({\n  event: "conversioEvent",\n  conversio: {\n    event_category: "${event.conversio.event_category ?? ""}",\n    event_action: "${actionVal}",\n    event_label: "${labelVal}",\n    event_segment: "${
                  event.conversio.event_segment ?? ""
                }"\n  }\n});`;
              } else if (isAdobeTarget) {
                eventCode = `adobeDataLayer.push({
  event: "targetClickEvent",
  eventData: {
    click: {
      clickLocation: "${event.eventCategory}",
      clickAction: "${event.eventAction}",
      clickText: "${event.eventLabel}"
    }
  }
});`;
              } else {
                eventCode = `window.dataLayer.push({
  event: "conversioEvent",
  conversio: {
    "eventCategory": "${event.eventCategory}",
    "eventAction": "${event.eventAction}",
    "eventLabel": "${event.eventLabel}",
    "eventSegment": "${event.eventSegment}"
  }
});`;
              }

              let displayCode = eventCode;
              if (isExperienceEvent) {
                displayCode = generateExperienceEventCode(event, isSnakeCaseFormat, sanitizeUsingBase);
              }

              const labelKey = `${idx}-label`;
              const codeToDisplay = displayCode;

              return (
                <EventLabelItem key={idx}>
                  <EventLabelIndex>{idx + 1}.</EventLabelIndex>
                  {item.label}
                  {item.triggerEvent && <TriggerEventText>(Trigger Event)</TriggerEventText>}
                  {isExperienceEvent && <ExperienceEventLabel style={{ marginLeft: "0.5em" }}>(Experience Tracking Event)</ExperienceEventLabel>}
                  <CopyButtonStyled
                    onClick={() => {
                      handleCopy(idx, "label", codeToDisplay);
                    }}
                    $copied={copiedState[labelKey]}
                    title="Copy code"
                    style={{ marginLeft: "auto", padding: "0.3rem 0.6rem", height: "1.8rem", fontSize: "0.75rem", flexShrink: 0 }}
                  >
                    {copiedState[labelKey] ? (
                      "✓ Copied!"
                    ) : (
                      <>
                        <CopyIcon width="0.9em" height="0.9em" />
                      </>
                    )}
                  </CopyButtonStyled>
                </EventLabelItem>
              );
            })}
          </EventLabelsList>
        </EventLabelsWrapper>
      )}

      {showMode === "code" && (
        <ChildrenWrapper>
          {parsedEvents.map((event, index) => {
            // derive raw and base segments and sanitizer to ensure actions/labels use base (e.g. SA2131) not full segment (e.g. SA2131ECOG)
            const rawSegment = event.conversio?.event_segment || event.eventSegment || event.conversio?.experience_segment || "";
            const baseMatch = rawSegment.match(/^[A-Za-z]+\d+/);
            const baseSegment = baseMatch ? baseMatch[0] : rawSegment;
            const sanitizeUsingBase = (str?: string) => {
              if (!str) return "";
              if (rawSegment && baseSegment && str.includes(rawSegment)) {
                return str.replace(new RegExp(rawSegment, "g"), baseSegment);
              }
              return str;
            };
            const clientPrefix = (rawSegment || "").slice(0, 2); // e.g. SA, VX, LF

            const isExperienceEvent = event.event === "conversioExperience" || event.experienceEvent;

            const isSnakeCaseFormat = !!(event.conversio && (event.conversio.event_category || event.conversio.experience_category)) || ["SA", "VX"].includes(clientPrefix);

            const segmentValue = isExperienceEvent ? event.conversio?.experience_segment : isSnakeCaseFormat ? event.conversio?.event_segment : event.eventSegment;

            const isAdobeTarget = !event.eventSegment && event.eventCategory && event.eventLabel;

            let eventCode: string;

            if (isExperienceEvent) {
              eventCode = generateExperienceEventCode(event, isSnakeCaseFormat, sanitizeUsingBase);
            } else if (isSnakeCaseFormat && event.conversio) {
              // SA & VX regular conversioEvent snake_case - sanitize action/label to use base segment
              const actionVal = sanitizeUsingBase(event.conversio.event_action ?? "");
              const labelVal = sanitizeUsingBase(event.conversio.event_label ?? "");
              eventCode = `window.dataLayer.push({\n  event: "conversioEvent",\n  conversio: {\n    event_category: "${event.conversio.event_category ?? ""}",\n    event_action: "${actionVal}",\n    event_label: "${labelVal}",\n    event_segment: "${event.conversio.event_segment ?? ""}"\n  }\n});`;
            } else if (isAdobeTarget) {
              eventCode = `adobeDataLayer.push({
  event: "targetClickEvent",
  eventData: {
    click: {
      clickLocation: "${event.eventCategory}",
      clickAction: "${event.eventAction}",
      clickText: "${event.eventLabel}"
    }
  }
});`;
            } else {
              // Standard camelCase (non SA/VX)
              eventCode = `window.dataLayer.push({
  event: "conversioEvent",
  conversio: {
    "eventCategory": "${event.eventCategory}",
    "eventAction": "${event.eventAction}",
    "eventLabel": "${event.eventLabel}",
    "eventSegment": "${event.eventSegment}"
  }
});`;
            }

            // ===== NEW: build display version for experience events using waitForDataLayer wrapper =====
            let displayCode = eventCode;
            if (isExperienceEvent) {
              displayCode = generateExperienceEventCode(event, isSnakeCaseFormat, sanitizeUsingBase);
            }
            const codeKey = `${index}-code`;
            const segmentKey = `${index}-segment`;

            return (
              <EventItemWrapper key={index}>
                <EventItemLabel title={isExperienceEvent ? "Experience Tracking Event" : getEventLabel(event) + (event.triggerEvent ? " (Trigger Event)" : "")}>
                  {isExperienceEvent ? (
                    <ExperienceEventLabel>Experience Tracking Event</ExperienceEventLabel>
                  ) : (
                    <>
                      {getEventLabel(event)}
                      {event.triggerEvent && <TriggerEventText>(Trigger Event)</TriggerEventText>}
                    </>
                  )}
                </EventItemLabel>
                <CodeWrapper>
                  <SyntaxHighlighter
                    language="javascript"
                    style={vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      padding: "1rem",
                      borderRadius: "0.5rem",
                      fontSize: "14px",
                      lineHeight: "1.5",
                      border: activeBorders[codeKey] ? "2px solid #007bff" : activeBorders[segmentKey] ? "2px solid #28a745" : "1px solid #e5e7eb",
                      boxShadow: activeBorders[codeKey] ? "0 0 10px #007bff, 0 0 20px #007bff" : activeBorders[segmentKey] ? "0 0 10px #28a745, 0 0 20px #28a745" : "none",
                      transition: "box-shadow 0.3s ease, border 0.3s ease",
                      width: "470px",
                      maxWidth: "470px",
                      height: "190px",
                      overflow: "hidden",
                    }}
                    showLineNumbers={false}
                    wrapLines={true}
                  >
                    {displayCode}
                  </SyntaxHighlighter>
                  <ButtonsWrapper>
                    {segmentValue && (
                      <CopyButtonStyled onClick={() => handleCopy(index, "segment", segmentValue)} $copied={copiedState[segmentKey]} $isSegment>
                        {copiedState[segmentKey] ? (
                          "Segment Copied!"
                        ) : (
                          <>
                            <CopyIcon width="1em" height="1em" /> Segment
                          </>
                        )}
                      </CopyButtonStyled>
                    )}
                    <CopyButtonStyled onClick={() => handleCopy(index, "code", displayCode)} $copied={copiedState[codeKey]}>
                      {copiedState[codeKey] ? (
                        "Copied!"
                      ) : (
                        <>
                          <CopyIcon width="1em" height="1em" /> Code
                        </>
                      )}
                    </CopyButtonStyled>
                  </ButtonsWrapper>
                </CodeWrapper>
              </EventItemWrapper>
            );
          })}
        </ChildrenWrapper>
      )}
    </EventDisplayWrapper>
  );
};

export default EventDisplay;
