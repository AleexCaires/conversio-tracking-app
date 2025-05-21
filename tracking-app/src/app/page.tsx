"use client";

import { ThemeProvider } from "styled-components";
import { GlobalStyle } from "../styles/globalStyles";
import { theme } from "../styles/theme";
import Header from "@/components/Header/Header";
import ExperienceDetails from "@/components/ExperienceDetails/ExperienceDetails";
import EventDetails from "@/components/EventDetails/EventDetails";
import { ExperienceProvider, useExperience } from "../components/ExperienceContext/ExperienceContext";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

// Create a wrapper component for edit mode functionality
function EditModeWrapper() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [editData, setEditData] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const eventDetailsRef = useRef<{ reset: () => void; triggerDataGeneration: () => void } | null>(null);
  
  const { 
    setSelectedClient, 
    setExperienceNumber, 
    setExperienceName, 
    setNumVariants 
  } = useExperience();

  // Check for edit parameter and load data
  useEffect(() => {
    const editParam = searchParams.get('edit');
    
    if (editParam) {
      try {
        const storedData = localStorage.getItem("editExperienceData");
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setEditData(parsedData);
          setIsEditMode(true);
          console.log("Loaded edit data:", parsedData);
        }
      } catch (error) {
        console.error("Error loading edit data:", error);
      }
    } else {
      // If no edit param, ensure we're not in edit mode
      setIsEditMode(false);
      setEditData(null);
    }
  }, [searchParams]);

  // Function to cancel edit mode and reset all fields
  const handleCancelEdit = () => {
    // Clear localStorage
    localStorage.removeItem("editExperienceData");
    
    // Reset context state
    setSelectedClient("FN"); // Default to Finisterre
    setExperienceNumber("");
    setExperienceName("");
    setNumVariants(1);
    
    // Reset event details state via ref
    if (eventDetailsRef.current) {
      eventDetailsRef.current.reset(); // This will call cleanAllFields which hides DataLayerLogic
    }
    
    // Clear edit mode state
    setIsEditMode(false);
    setEditData(null);
    
    // Update URL without refreshing the page
    router.replace('/');
  };

  // Add function to handle numVariants changes in edit mode
  const handleExperienceFieldChange = (newNumVariants: number) => {
    // If in edit mode and we have eventDetailsRef, trigger data regeneration
    if (isEditMode && eventDetailsRef.current) {
      // This will force DataLayerLogic to regenerate with new variant count
      setTimeout(() => {
        // Access the EventDetails component reference to trigger data generation
        if (eventDetailsRef.current) {
          eventDetailsRef.current.triggerDataGeneration();
        }
      }, 100);
      setNumVariants(newNumVariants);
    }
  };

  return (
    <>
      {isEditMode && (
        <div style={{ 
          background: "#e6f7ff", 
          padding: "10px", 
          margin: "10px 0", 
          borderRadius: "4px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <span>Editing Experience: {editData?.name || editData?.id}</span>
          <button 
            onClick={handleCancelEdit}
            style={{
              background: "#f5f5f5",
              border: "1px solid #ddd",
              borderRadius: "4px",
              padding: "4px 8px",
              cursor: "pointer"
            }}
          >
            Cancel Edit
          </button>
        </div>
      )}
      <ExperienceDetails
        onClientChange={(code) => console.log("Client code changed:", code)}
        onExperienceNumberChange={(num) => console.log("Experience number changed:", num)}
        editData={editData}
        isEditMode={isEditMode}
      />
      <EventDetails 
        editData={editData}
        isEditMode={isEditMode}
        ref={eventDetailsRef}
      />
    </>
  );
}

export default function Home() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Header />
      <ExperienceProvider>
        <EditModeWrapper />
      </ExperienceProvider>
    </ThemeProvider>
  );
}
