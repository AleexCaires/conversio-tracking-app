// context/ExperienceContext.tsx
"use client";

import React, { createContext, useContext, useState } from "react";

interface ExperienceContextType {
  numVariants: number;
  setNumVariants: (num: number) => void;
}

const ExperienceContext = createContext<ExperienceContextType>({
  numVariants: 1,
  setNumVariants: () => {},
});

export const ExperienceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [numVariants, setNumVariants] = useState(1);
  return (
    <ExperienceContext.Provider value={{ numVariants, setNumVariants }}>
      {children}
    </ExperienceContext.Provider>
  );
};

export const useExperience = () => useContext(ExperienceContext);
