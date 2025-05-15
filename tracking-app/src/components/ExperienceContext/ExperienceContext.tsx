"use client";

import React, { createContext, useContext, useState } from "react";

interface ExperienceContextType {
  numVariants: number;
  setNumVariants: (num: number) => void;
  selectedClient: string;
  setSelectedClient: (client: string) => void;
  experienceNumber: string;
  setExperienceNumber: (expNumber: string) => void;
  experienceName: string;
  setExperienceName: (name: string) => void;
  resetExperience: () => void; // Add reset function
}

const ExperienceContext = createContext<ExperienceContextType>({
  numVariants: 1,
  setNumVariants: () => {},
  selectedClient: '',
  setSelectedClient: () => {},
  experienceNumber: '',
  setExperienceNumber: () => {},
  experienceName: '',
  setExperienceName: () => {},
  resetExperience: () => {}, // Default no-op
});

export const ExperienceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [numVariants, setNumVariants] = useState(1);
  const [selectedClient, setSelectedClient] = useState("FN"); // Default to Finisterre
  const [experienceNumber, setExperienceNumber] = useState(""); 
  const [experienceName, setExperienceName] = useState("");

  // Add reset function with safe minimum value for variants
  const resetExperience = () => {
    setNumVariants(1); // Always reset to minimum of 1
    setSelectedClient("FN");
    setExperienceNumber("");
    setExperienceName("");
  };

  // Override setNumVariants to enforce minimum of 1
  const safeSetNumVariants = (value: number) => {
    setNumVariants(Math.max(1, value));
  };

  return (
    <ExperienceContext.Provider
      value={{
        numVariants,
        setNumVariants: safeSetNumVariants, // Use the safe version
        selectedClient,
        setSelectedClient,
        experienceNumber,  
        setExperienceNumber,  
        experienceName, 
        setExperienceName,
        resetExperience,
      }}
    >
      {children}
    </ExperienceContext.Provider>
  );
};

export const useExperience = () => useContext(ExperienceContext);
