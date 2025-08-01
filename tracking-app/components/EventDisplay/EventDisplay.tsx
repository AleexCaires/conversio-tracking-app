import React, { useState, useEffect, useMemo } from "react";
import { ChildrenWrapper, EventDisplayWrapper, EventTitle, EventLabelsWrapper, EventLabelsList, EventLabelItem, EventLabelIndex, TriggerEventText, EventItemWrapper, EventItemLabel, CodeWrapper, ButtonsWrapper, CopyButtonStyled } from "./EventDisplay.styles";
import { Event as TypedEvent } from "@/types";
import CopyIcon from "../Icons/CopyIcon";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import styled from "styled-components";

interface EventDisplayProps {
  title: string;
  events: (TypedEvent | string)[];
  onCopy: (text: string) => void;
  showMode: "labels" | "code";
}

// Add a styled component for the Experience Event label
const ExperienceEventLabel = styled.span`
  color: #ED9C4A;
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
    });
    return state;
  }, [parsedEvents]);

  useEffect(() => {
    setCopiedState(getInitialCopiedState);
  }, [getInitialCopiedState]);

  // Now do the early return after all hooks
  if (!events || events.length === 0) return null;

  const getEventLabel = (event: TypedEvent): string => {
    if (event.event === "conversioExperience" && event.conversio) {
      return event.conversio.experienceLabel || "";
    }
    if (event.conversio && event.conversio.event_label) {
      return event.conversio.event_label;
    }
    return event.eventLabel ?? "";
  };

  const eventLabels = parsedEvents
    .map((event) => ({
      label: getEventLabel(event),
      triggerEvent: event.triggerEvent,
    }))
    .filter((item) => item.label && item.label.trim() !== "." && item.label.trim() !== "");

  const handleCopy = (index: number, type: "code" | "segment", text: string) => {
    const key = `${index}-${type}`;
    onCopy(text);
    setCopiedState((prev) => ({ ...prev, [key]: true }));
    setActiveBorders((prev) => ({ ...prev, [key]: true }));
  };

  // Add a helper function to identify which variation an experience event belongs to
  // const getVariationFromExperienceEvent = (event: TypedEvent): string | null => {
  //   if (!event.conversio || !event.event || event.event !== "conversioExperience") {
  //     return null;
  //   }
    
  //   const segment = event.conversio.experience_segment || "";
    
  //   // Check for control
  //   if (segment.includes(".XCO")) {
  //     return "Control";
  //   }
    
  //   // Check for variations (XV1, XV2, etc.)
  //   const match = segment.match(/\.XV(\d+)$/);
  //   if (match && match[1]) {
  //     return `Variation ${match[1]}`;
  //   }
    
  //   // Check label as fallback
  //   const label = event.conversio.experienceLabel || event.conversio.experience_label || "";
  //   if (label.includes("Control")) {
  //     return "Control";
  //   }
  //   if (label.includes("Variation")) {
  //     const varMatch = label.match(/Variation\s+(\d+)/);
  //     if (varMatch && varMatch[1]) {
  //       return `Variation ${varMatch[1]}`;
  //     }
  //   }
    
  //   return null;
  // };

  return (
    <EventDisplayWrapper>
      <EventTitle>{title}</EventTitle>

      {showMode === "labels" && eventLabels.length > 0 && (
        <EventLabelsWrapper>
          <strong>Event Labels:</strong>
          <EventLabelsList>
            {eventLabels.map((item, idx) => (
              <EventLabelItem key={idx}>
                <EventLabelIndex>{idx + 1}.</EventLabelIndex>
                {item.label}
                {item.triggerEvent && <TriggerEventText>(Trigger Event)</TriggerEventText>}
              </EventLabelItem>
            ))}
          </EventLabelsList>
        </EventLabelsWrapper>
      )}

      {showMode === "code" && (
        <ChildrenWrapper>
          {parsedEvents.map((event, index) => {
            const isSephoraFormat = !!(event.conversio && event.conversio.event_category);
            const isExperienceEvent = event.event === "conversioExperience" || event.experienceEvent;
            const segmentValue = isExperienceEvent ? 
              event.conversio?.experience_segment : 
              isSephoraFormat ? 
                event.conversio?.event_segment : 
                event.eventSegment;
            const isAdobeTarget = !event.eventSegment && event.eventCategory && event.eventLabel;

            let eventCode: string;

            if (isExperienceEvent && event.conversio) {
              // Check if it's a Sephora event by checking clientId in the event segment
              const isSephoraEvent = event.conversio.experience_segment?.startsWith('SA');
              
              if (isSephoraEvent) {
                // Use snake_case format for Sephora events
                eventCode = `window.dataLayer.push({
event: "conversioExperience",
conversio: {
    experience_category: "Conversio Experience",
    experience_action: "${event.conversio.experienceAction ?? event.conversio.experience_action ?? ""}",
    experience_label: "${event.conversio.experienceLabel ?? event.conversio.experience_label ?? ""}",
    experience_segment: "${event.conversio.experience_segment ?? ""}"
}
});`;
              } else {
                // Regular format for other clients (Liverpool)
                eventCode = `window.dataLayer.push({
  event: "conversioExperience",
  conversio: {
    experienceCategory: "${event.conversio.experienceCategory ?? ""}",
    experienceAction: "${event.conversio.experienceAction ?? ""}",
    experienceLabel: "${event.conversio.experienceLabel ?? ""}",
    experience_segment: "${event.conversio.experience_segment ?? ""}"
  }
});`;
              }
            } else if (isSephoraFormat && event.conversio) {
              eventCode = `window.dataLayer.push({\n  event: "conversioEvent",\n  conversio: {\n    event_category: "${event.conversio.event_category ?? ""}",\n    event_action: "${event.conversio.event_action ?? ""}",\n    event_label: "${event.conversio.event_label ?? ""}",\n    event_segment: "${
                event.conversio.event_segment ?? ""
              }"\n  }\n});`;
            } else if (isAdobeTarget) {
              eventCode = `adobeDataLayer.push({\n  event: "targetClickEvent",\n  eventData: {\n    click: {\n      clickLocation: "${event.eventCategory}",\n      clickAction: "${event.eventAction}",\n      clickText: "${event.eventLabel}"\n    }\n  }\n});`;
            } else {
              eventCode = `window.dataLayer.push({\n  event: "conversioEvent",\n  conversio: {\n    \"eventCategory\": \"${event.eventCategory}\",\n    \"eventAction\": \"${event.eventAction}\",\n    \"eventLabel\": \"${event.eventLabel}\",\n    \"eventSegment\": \"${event.eventSegment}\"\n  }\n});`;
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
                      padding: '1rem',
                      borderRadius: '0.5rem',
                      fontSize: '14px',
                      lineHeight: '1.5',
                      border: activeBorders[codeKey] 
                        ? '2px solid #007bff' 
                        : activeBorders[segmentKey] 
                        ? '2px solid #28a745' 
                        : '1px solid #e5e7eb',
                      boxShadow: activeBorders[codeKey]
                        ? '0 0 10px #007bff, 0 0 20px #007bff'
                        : activeBorders[segmentKey]
                        ? '0 0 10px #28a745, 0 0 20px #28a745'
                        : 'none',
                      transition: 'box-shadow 0.3s ease, border 0.3s ease',
                      width: '470px',
                      maxWidth:'470px',
                      height: '190px',
                      overflow: 'hidden'
                    }}
                    showLineNumbers={false}
                    wrapLines={true}
                  >
                    {eventCode}
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
                    <CopyButtonStyled onClick={() => handleCopy(index, "code", eventCode)} $copied={copiedState[codeKey]}>
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
