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
          trigger={triggerDataLayer} // Pass trigger state to DataLayerLogic
        />
        <ExperienceDetails
          onClientChange={setClient}
          onControlTypeChange={setControlType} // Pass handler to update control type
        />
        <EventDetails
          onEventDescriptionsChange={setEventDescriptions}
          onControlTypeChange={setControlType} // Pass handler to update control type
          onTriggerDataLayer={handleTriggerDataLayer} // Pass handler to trigger DataLayerLogic
        />
      </ExperienceProvider>
    </ThemeProvider>
  );
}