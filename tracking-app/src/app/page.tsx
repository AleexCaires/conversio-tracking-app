"use client";

import { ThemeProvider } from "styled-components";
import { GlobalStyle } from "../styles/globalStyles";
import { theme } from "../styles/theme";
import Header from "@/components/Header/Header";
import ExperienceDetails from "@/components/ExperienceDetails/ExperienceDetails";
import EventDetails from "@/components/EventDetails/EventDetails";
import { ExperienceProvider } from "../components/ExperienceContext/ExperienceContext";

export default function Home() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Header />
      {/* Component for Creating/Editing */}
      <ExperienceProvider>
        <ExperienceDetails
          onClientChange={(clientCode: string) => {
            console.log("Client code changed:", clientCode);
          }}
          onExperienceNumberChange={(experienceNumber: string) => {
            console.log("Experience number changed:", experienceNumber);
          }}
        />
        <EventDetails />
      </ExperienceProvider>
    </ThemeProvider>
  );
}
