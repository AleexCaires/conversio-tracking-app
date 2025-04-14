"use client";

import { ThemeProvider } from "styled-components";
import { GlobalStyle } from "../styles/globalStyles";
import { theme } from "../styles/theme";
import Header from "@/components/Header/Header";
import ExperienceDetails from "@/components/ExperienceDetails/ExperienceDetails";
import EventDetails from "@/components/EventDetails/EventDetails";
import DataLayerLogic from "@/components/DataLayerLogic/DataLayerLogic";

import { ExperienceProvider } from "../components/ExperienceContext/ExperienceContext";
import { useState } from "react";

export default function Home() {
  const [client, setClient] = useState("Finisterre");
  const [controlType, setControlType] = useState("Dummy Control");
  const [eventDescriptions, setEventDescriptions] = useState<string[]>([]);
  const [triggerDataLayer, setTriggerDataLayer] = useState(false);
  const [experienceNumber, setExperienceNumber] = useState("000"); 
  const [isLoading, setIsLoading] = useState(false); 
  const [errorMessage, setErrorMessage] = useState(""); 
  const [successMessage, setSuccessMessage] = useState("");

  const handleTriggerDataLayer = () => {
    setTriggerDataLayer((prev) => !prev);
  };

  const saveElementData = async () => {
    const elementData = {
      client,
      controlType,
      eventDescriptions,
      experienceNumber,
    };
  
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
  
    try {
      const res = await fetch("/api/save-elements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ elementData }),
      });
  
      console.log("Response status:", res.status); // Debugging
  
      if (res.ok) {
        const data = await res.json(); // Parse the JSON response
        console.log("Response JSON:", data); // Debugging
        setSuccessMessage(data.message || "Element saved successfully!");
      } else {
        const errorData = await res.json(); // Parse the error JSON response
        console.log("Error JSON:", errorData); // Debugging
        setErrorMessage(errorData.message || "An error occurred while saving.");
      }
    } catch (error) {
      setErrorMessage("Failed to save element data. Please try again.");
      console.error("Error in saveElementData:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Header />
      <ExperienceProvider>
        <DataLayerLogic client={client} experienceNumber={experienceNumber} eventDescriptions={eventDescriptions} controlType={controlType} trigger={triggerDataLayer} />
        <ExperienceDetails onClientChange={setClient} onControlTypeChange={setControlType} onExperienceNumberChange={setExperienceNumber} />
        <EventDetails onEventDescriptionsChange={setEventDescriptions} onControlTypeChange={setControlType} onTriggerDataLayer={handleTriggerDataLayer} />

        <div>
          <button onClick={saveElementData} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Element"}
          </button>
        </div>

        {successMessage && <div style={{ color: "green" }}>{successMessage}</div>}
        {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
      </ExperienceProvider>
    </ThemeProvider>
  );
}
