import React, { useState, useEffect, useMemo } from "react";
import {
  ChildrenWrapper,
  EventDisplayWrapper,
  EventTitle,
  EventLabelsWrapper,
  EventLabelsList,
  EventLabelItem,
  EventLabelIndex,
  TriggerEventText,
  EventItemWrapper,
  EventItemLabel,
  CodeWrapper,
  CodeBlock,
  ButtonsWrapper,
  CopyButtonStyled,
} from "./EventDisplay.styles";
import { Event as TypedEvent } from "@/types";
import { FaCopy } from "react-icons/fa";

interface EventDisplayProps {
  title: string;
  events: (TypedEvent | string)[];
  onCopy: (text: string) => void;
  showMode: "labels" | "code";
}

const EventDisplay: React.FC<EventDisplayProps> = ({ title, events, onCopy, showMode }) => {
  const [activeBorders, setActiveBorders] = useState<Record<string, boolean>>({});
  const [copiedState, setCopiedState] = useState<Record<string, boolean>>({});

  // // Determine button label based on title
  // const getToggleLabel = () => {
  //   if (title.toLowerCase().includes("control")) return "Hide Control Events";
  //   if (title.toLowerCase().includes("variation")) return `Hide ${title} Events`;
  //   return `Hide ${title}`;
  // };

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

  if (!events || events.length === 0) return null;

  const getEventLabel = (event: TypedEvent): string => {
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
            const segmentValue = isSephoraFormat ? event.conversio?.event_segment : event.eventSegment;
            const isAdobeTarget = !event.eventSegment && event.eventCategory && event.eventLabel;

            let eventCode: string;

            if (isSephoraFormat && event.conversio) {
              eventCode = `dataLayer.push({\n  event: "conversioEvent",\n  conversio: {\n    event_category: "${event.conversio.event_category ?? ""}",\n    event_action: "${event.conversio.event_action ?? ""}",\n    event_label: "${event.conversio.event_label ?? ""}",\n    event_segment: "${
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
                <EventItemLabel title={getEventLabel(event) + (event.triggerEvent ? " (Trigger Event)" : "")}>
                  {getEventLabel(event)}
                  {event.triggerEvent && <TriggerEventText>(Trigger Event)</TriggerEventText>}
                </EventItemLabel>
                <CodeWrapper>
                  <CodeBlock $activeBorder={activeBorders[codeKey]} $activeSegmentBorder={activeBorders[segmentKey]}>
                    {eventCode}
                  </CodeBlock>
                  <ButtonsWrapper>
                    {segmentValue && (
                      <CopyButtonStyled onClick={() => handleCopy(index, "segment", segmentValue)} $copied={copiedState[segmentKey]} $isSegment>
                        {copiedState[segmentKey] ? (
                          "Segment Copied!"
                        ) : (
                          <>
                            <FaCopy /> Segment
                          </>
                        )}
                      </CopyButtonStyled>
                    )}
                    <CopyButtonStyled onClick={() => handleCopy(index, "code", eventCode)} $copied={copiedState[codeKey]}>
                      {copiedState[codeKey] ? (
                        "Copied!"
                      ) : (
                        <>
                          <FaCopy /> Code
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
