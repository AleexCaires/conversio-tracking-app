"use client";

import { ThemeProvider } from "styled-components";
import { GlobalStyle } from "../styles/globalStyles";
import { theme } from "../styles/theme";
import Header from "../components/Header/Header";
import ExperienceDetails from "../components/ExperienceDetails/ExperienceDetails";
import EventDetails from "../components/EventDetails/EventDetails";
import { ExperienceProvider, useExperience } from "../components/ExperienceContext/ExperienceContext";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef, Suspense } from "react";
import { EditData, EventDetailsRef } from "@/types";

// Create a wrapper component for edit mode functionality
function EditModeWrapper() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [editData, setEditData] = useState<EditData | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  const eventDetailsRef = useRef<EventDetailsRef | null>(null);

  const { setSelectedClient, setExperienceNumber, setExperienceName, setNumVariants } = useExperience();

  // Ensure component is mounted before accessing localStorage
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check for edit parameter and load data
  useEffect(() => {
    if (!mounted) return;

    const editParam = searchParams.get("edit");

    if (editParam) {
      try {
        const storedData = localStorage.getItem("editExperienceData");
        if (storedData) {
          const parsedData: EditData = JSON.parse(storedData);
          setEditData(parsedData);
          setIsEditMode(true);
          console.log("Loaded edit data:", parsedData);
        }
      } catch (error) {
        console.error("Error loading edit data:", error);
      }
    } else {
      setIsEditMode(false);
      setEditData(null);
    }
  }, [searchParams, mounted]);

  // Function to cancel edit mode and reset all fields
  const handleCancelEdit = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("editExperienceData");
    }

    setSelectedClient("FN");
    setExperienceNumber("");
    setExperienceName("");
    setNumVariants(1);

    if (eventDetailsRef.current) {
      eventDetailsRef.current.reset();
    }

    setIsEditMode(false);
    setEditData(null);

    router.replace("/");
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {isEditMode && (
        <div
          style={{
            background: "#e6f7ff",
            padding: "10px",
            margin: "10px 0",
            borderRadius: "4px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>Editing Experience: {editData?.name || editData?.id}</span>
          <button
            onClick={handleCancelEdit}
            style={{
              background: "#f5f5f5",
              border: "1px solid #ddd",
              borderRadius: "4px",
              padding: "4px 8px",
              cursor: "pointer",
            }}
          >
            Cancel Edit
          </button>
        </div>
      )}
      <ExperienceDetails onClientChange={(code) => console.log("Client code changed:", code)} onExperienceNumberChange={(num) => console.log("Experience number changed:", num)} editData={editData ?? undefined} isEditMode={isEditMode} />
      <EventDetails editData={editData ?? undefined} isEditMode={isEditMode} ref={eventDetailsRef} />
    </>
  );
}

// Create a suspense wrapper component
function EditModeWithSuspense() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditModeWrapper />
    </Suspense>
  );
}

export default function Home() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Header />
      <ExperienceProvider>
        <EditModeWithSuspense />
      </ExperienceProvider>
    </ThemeProvider>
  );
}
