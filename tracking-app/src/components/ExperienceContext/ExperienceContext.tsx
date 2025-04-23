"use client";

import React, { createContext, useContext, useState } from "react";

interface ExperienceContextType {
  numVariants: number;
  setNumVariants: (num: number) => void;
  selectedClient: string;
  setSelectedClient: (client: string) => void;
  experienceNumber: string;
  setExperienceNumber: (expNumber: string) => void;
  experienceName: string; // Add experimentName
  setExperienceName: (name: string) => void
}

const ExperienceContext = createContext<ExperienceContextType>({
  numVariants: 1,
  setNumVariants: () => {},
  selectedClient: '',
  setSelectedClient: () => {},
  experienceNumber: '',
  setExperienceNumber: () => {},
  experienceName: '', // Default value
  setExperienceName: () => {}, // Default setter
});

export const ExperienceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [numVariants, setNumVariants] = useState(1);
  const [selectedClient, setSelectedClient] = useState("");
  const [experienceNumber, setExperienceNumber] = useState(""); 
  const [experienceName, setExperienceName] = useState("");

  return (
    <ExperienceContext.Provider
      value={{
        numVariants,
        setNumVariants,
        selectedClient,
        setSelectedClient,
        experienceNumber,  
        setExperienceNumber,  
        experienceName, 
        setExperienceName, 
      }}
    >
      {children}
    </ExperienceContext.Provider>
  );
};

export const useExperience = () => useContext(ExperienceContext);
