'use client';

import { ThemeProvider } from 'styled-components';
import { GlobalStyle } from '../styles/globalStyles';
import { theme } from '../styles/theme';
import Header from '@/components/Header/Header';
import ExperienceDetails from '@/components/ExperienceDetails/ExperienceDetails';
import EventDetails from '@/components/EventDetails/EventDetails';
import DataLayerLogic from '@/components/DataLayerLogic/DataLayerLogic';

import { ExperienceProvider } from "../components/ExperienceContext/ExperienceContext";
import { useState } from 'react';

export default function Home() {
  const [client, setClient] = useState("Finisterre"); // State to store client
  const [controlType, setControlType] = useState("Dummy Control"); // State to store control type
  const [eventDescriptions, setEventDescriptions] = useState<string[]>([]); // State to store event descriptions
  const [triggerDataLayer, setTriggerDataLayer] = useState(false); // State to trigger DataLayerLogic

  const handleTriggerDataLayer = () => {
    setTriggerDataLayer((prev) => !prev); // Toggle the state to trigger DataLayerLogic
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Header />
      <ExperienceProvider>
        <DataLayerLogic
          client={client}
          eventDescriptions={eventDescriptions}
          controlType={controlType}
          trigger={triggerDataLayer}
        />
        <ExperienceDetails
          onClientChange={setClient}
          onControlTypeChange={setControlType}
        />
        <EventDetails
          onEventDescriptionsChange={setEventDescriptions}
          onControlTypeChange={setControlType}
          onTriggerDataLayer={handleTriggerDataLayer}
        />
      </ExperienceProvider>
    </ThemeProvider>
  );
}