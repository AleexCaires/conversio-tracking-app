"use client";

import React, { useState } from "react";
import EventDetails from "../EventDetails/EventDetails";
import ExperienceDetails from "../ExperienceDetails/ExperienceDetails";
import DataLayerLogic from "../DataLayerLogic/DataLayerLogic";

const TrackingPage: React.FC = () => {
  const [eventDescriptions, setEventDescriptions] = useState<string[]>([]); // State to store event descriptions
  const [client, setClient] = useState("Finisterre"); // State to store client
  const [controlType, setControlType] = useState("Dummy Control"); // State to store control type

  return (
    <>
      <ExperienceDetails
        onClientChange={setClient} // Pass handler to update client
        onControlTypeChange={setControlType} // Pass handler to update control type
      />
      <EventDetails
        onEventDescriptionsChange={(descriptions) => {
          console.log("Event Descriptions Updated:", descriptions); // Debugging
          setEventDescriptions(descriptions); // Pass handler to update event descriptions
        }}
      />
      <DataLayerLogic
        client={client}
        eventDescriptions={eventDescriptions}
        controlType={controlType}
      />
    </>
  );
};

export default TrackingPage;