"use client";

import React, { useState } from "react";
import EventDetails from "../EventDetails/EventDetails";
import ExperienceDetails from "../ExperienceDetails/ExperienceDetails";
import DataLayerLogic from "../DataLayerLogic/DataLayerLogic";

const TrackingPage: React.FC = () => {
  const [eventDescriptions, setEventDescriptions] = useState<string[]>([]);
  const [client, setClient] = useState("Finisterre"); 
  const [controlType, setControlType] = useState("Dummy Control"); 

  return (
    <>
      <ExperienceDetails
        onClientChange={setClient}
        onControlTypeChange={setControlType} 
      />
      <EventDetails
        onEventDescriptionsChange={(descriptions) => {
          setEventDescriptions(descriptions); 
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