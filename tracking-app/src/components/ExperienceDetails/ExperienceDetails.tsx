"use client";

import React, { useState, useEffect } from "react";
import {
  Section,
  Heading,
  FieldGroupMiddle,
  Label,
  Select,
  Input,
  FieldGroupFirst,
  FieldGroupEnd,
  ExperimentName,
  ExperimentNumber,
} from "./ExperienceDetails.styles";
import { useExperience } from "../ExperienceContext/ExperienceContext";

const ExperienceDetails: React.FC<{
  onClientChange: (clientCode: string) => void;
  onExperienceNumberChange: (experienceNumber: string) => void;
}> = ({ onClientChange, onExperienceNumberChange }) => {

  const { numVariants, setNumVariants } = useExperience();

  // Mapping of client names to their codes
  const clients = [
    { name: "Finisterre", code: "FN" },
    { name: "Liverpool FC", code: "LF" },
    { name: "Phase Eight", code: "PH" },
    { name: "Hobbs", code: "HO" },
    { name: "Whistles", code: "WC" },
    { name: "Laithwaites", code: "LT" },
    { name: "Accessorize", code: "AS" },
    { name: "Monsoon", code: "MS" },
    { name: "Ocado", code: "OPT" },
    { name: "Team Sport", code: "TS" },
  ];

  const [platform, setPlatform] = useState("AB Tasty"); // Default platform for Finisterre
  const [platformOptions, setPlatformOptions] = useState<string[]>(["AB Tasty"]); // Options for the platform dropdown

  const handleNumVariantsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setNumVariants(isNaN(value) ? 0 : Math.max(0, value)); 
  };
  const { selectedClient, setSelectedClient } = useExperience();
  const { experienceNumber, setExperienceNumber } = useExperience();


  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCode = e.target.value; // Get the client code
    onClientChange(selectedCode);
    setSelectedClient(e.target.value);

    // Update platform and platform options based on client
    switch (selectedCode) {
      case "FN": // Finisterre
      case "PH": // Phase Eight
      case "HO": // Hobbs
      case "WC": // Whistles
      case "TS": // Team Sport
        setPlatform("AB Tasty");
        setPlatformOptions(["AB Tasty"]);
        break;
      case "AS": // Accessorize
      case "MS": // Monsoon
      case "LF": // Liverpool FC
        setPlatform("Dynamic Yield");
        setPlatformOptions(["Dynamic Yield"]);
        break;
      case "LT": // Laithwaites
        setPlatform("Adobe Target");
        setPlatformOptions(["Adobe Target"]);
        break;
      case "OPT": // Ocado
        setPlatform("Dynamic Yield");
        setPlatformOptions(["Dynamic Yield", "Optimizely"]);
        break;
      default:
        setPlatform("Dynamic Yield");
        setPlatformOptions(["Dynamic Yield"]);
    }
  };

  useEffect(() => {
    handleClientChange({ target: { value: "FN" } } as React.ChangeEvent<HTMLSelectElement>);
  }, []);
  

  return (
    
    <Section>
      <Heading>Experience Details</Heading>

      <FieldGroupFirst>
        <div>
          <Label htmlFor="client">Client</Label>
          <Select
      id="client"
      name="client"
      value={selectedClient}
      onChange={handleClientChange}
    >
      <option value="" disabled>
        Select a client
      </option>
      {clients.map((client) => (
        <option key={client.code} value={client.code}>
          {client.name}
        </option>
      ))}
    </Select>
        </div>
        <div>
          <Label htmlFor="platform">Platform</Label>
          <Select id="platform" name="platform" value={platform} onChange={(e) => setPlatform(e.target.value)}>
            {platformOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </div>
      </FieldGroupFirst>

      <FieldGroupMiddle>
        <ExperimentNumber>
          <Label htmlFor="experienceNumber">Experience Number:*</Label>
          <Input
    id="experienceNumber"
    type="text"
    value={experienceNumber}
    onChange={(e) => setExperienceNumber(e.target.value)}
  />

        </ExperimentNumber>

        <ExperimentName>
          <Label htmlFor="experienceName">Experience Name:*</Label>
          <Input type="text" id="experienceName" name="experienceName" />
        </ExperimentName>
      </FieldGroupMiddle>

      <FieldGroupEnd>
        <div>
          <Label htmlFor="numVariants">No. of Variants (not inc. control):*</Label>
          <Input
            type="number"
            id="numVariants"
            name="numVariants"
            value={numVariants}
            min={1}
            onChange={handleNumVariantsChange}
          />
        </div>
        <div>
          <Label htmlFor="experienceCategoryName">Experience Category Name:*</Label>
          <Input
            type="text"
            id="experienceCategoryName"
            name="experienceCategoryName"
            defaultValue="Conversio Experience"
          />
        </div>
      </FieldGroupEnd>
    </Section>
  );
};

export default ExperienceDetails;