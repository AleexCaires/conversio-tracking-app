"use client";

import React, { useState } from "react";
import EventDetails from "../EventDetails/EventDetails";
import ExperienceDetails from "../ExperienceDetails/ExperienceDetails";
import DataLayerLogic from "../DataLayerLogic/DataLayerLogic";

const TrackingPage: React.FC = () => {
  const [eventDescriptions] = useState<string[]>([]);
  const [client, setClient] = useState("Finisterre"); 
  const [selectedStatus, setSelectedStatus] = useState<Record<string, boolean>>({});

  return (
    <>
      <ExperienceDetails
        onClientChange={setClient}
        onExperienceNumberChange={() => {}}
      />
      <EventDetails />
      <DataLayerLogic
        client={client}
        eventDescriptions={eventDescriptions}
        experienceNumber={"0"}
        trigger={false}
        setTrigger={() => {}}
        onDataGenerated={() => {}}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
      />
    </>
  );
};

export default TrackingPage;