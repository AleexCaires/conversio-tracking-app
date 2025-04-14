"use client";

import React, { createContext, useContext, useState } from "react";

interface ExperienceContextType {
  numVariants: number;
  setNumVariants: (num: number) => void;
  selectedClient: string;
  setSelectedClient: (client: string) => void;
  experienceNumber: string;
  setExperienceNumber: (expNumber: string) => void;
}

const ExperienceContext = createContext<ExperienceContextType>({
  numVariants: 1,
  setNumVariants: () => {},
  selectedClient: '',
  setSelectedClient: () => {},
  experienceNumber: '',
  setExperienceNumber: () => {},
});

export const ExperienceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [numVariants, setNumVariants] = useState(1);
  const [selectedClient, setSelectedClient] = useState("");
  const [experienceNumber, setExperienceNumber] = useState(""); // Added this state

  return (
    <ExperienceContext.Provider
      value={{
        numVariants,
        setNumVariants,
        selectedClient,
        setSelectedClient,
        experienceNumber,  // Provided the state value
        setExperienceNumber,  // Provided the setter function
      }}
    >
      {children}
    </ExperienceContext.Provider>
  );
};

export const useExperience = () => useContext(ExperienceContext);
