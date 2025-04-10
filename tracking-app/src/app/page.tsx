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
  const [client, setClient] = useState("Finisterre");
  const [controlType, setControlType] = useState("Dummy Control");
  const [eventDescriptions, setEventDescriptions] = useState<string[]>([]);
  const [triggerDataLayer, setTriggerDataLayer] = useState(false);
  const [experienceNumber, setExperienceNumber] = useState("000"); // ✅ Added this line

  const handleTriggerDataLayer = () => {
    setTriggerDataLayer((prev) => !prev);
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Header />
      <ExperienceProvider>
        <DataLayerLogic
          client={client}
          experienceNumber={experienceNumber} // ✅ Passed here
          eventDescriptions={eventDescriptions}
          controlType={controlType}
          trigger={triggerDataLayer}
        />
        <ExperienceDetails
          onClientChange={setClient}
          onControlTypeChange={setControlType}
          onExperienceNumberChange={setExperienceNumber} // ✅ Passed here
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
