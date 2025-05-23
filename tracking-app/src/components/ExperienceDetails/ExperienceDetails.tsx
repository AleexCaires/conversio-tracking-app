"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
import { clients } from "@/lib/clients";
import { EditData } from "@/types";

interface ExperienceDetailsProps {
  onClientChange: (clientCode: string) => void;
  onExperienceNumberChange: (experienceNumber: string) => void;
  editData?: EditData;
  isEditMode?: boolean;
}

const ExperienceDetails: React.FC<ExperienceDetailsProps> = ({ 
  onClientChange, 
  onExperienceNumberChange, 
  editData, 
  isEditMode 
}) => {

  const { numVariants, setNumVariants } = useExperience();

  const [platform, setPlatform] = useState("AB Tasty"); // Default platform for Finisterre
  const [platformOptions, setPlatformOptions] = useState<string[]>(["AB Tasty"]); // Options for the platform dropdown

  const handleNumVariantsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setNumVariants(isNaN(value) ? 1 : Math.max(1, value));
  };

  const { selectedClient, setSelectedClient } = useExperience();
  const { experienceNumber, setExperienceNumber } = useExperience();

  const handleClientChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
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
  }, [onClientChange, setSelectedClient]);

  useEffect(() => {
    handleClientChange({ target: { value: "FN" } } as React.ChangeEvent<HTMLSelectElement>);
  }, [handleClientChange]);

  const { experienceName, setExperienceName } = useExperience(); 

  const processedEdit = useRef(false);

  // Apply edit data only once
  useEffect(() => {
    if (isEditMode && editData && !processedEdit.current) {
      processedEdit.current = true;
      console.log("Processing edit data for ExperienceDetails:", editData);
      
      // Set client
      if (editData.client) {
        const clientEntry = clients.find(c => 
          c.name === editData.client || c.code === editData.client
        );
        if (clientEntry) {
          setSelectedClient(clientEntry.code);
          onClientChange(clientEntry.code);
        }
      }
      
      // Set experience number
      if (editData.id) {
        const clientPrefix = clients.find(c => editData.id.startsWith(c.code))?.code;
        const expNumber = clientPrefix ? 
          editData.id.substring(clientPrefix.length) : editData.id;
        
        setExperienceNumber(expNumber);
        onExperienceNumberChange(expNumber);
      }
      
      // Set experience name
      if (editData.name) {
        setExperienceName(editData.name);
      }
      
      // Set number of variants once
      if (Array.isArray(editData.events)) {
        const variationGroups = editData.events.filter(
          (group) => group.label && group.label.startsWith("Variation ")
        );
        const initialVariantCount = Math.max(1, variationGroups.length);
        setNumVariants(initialVariantCount);
      }
    }
  }, [isEditMode, editData, onClientChange, onExperienceNumberChange, setSelectedClient, setExperienceNumber, setExperienceName, setNumVariants]);

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
  onKeyDown={(e) => {
    // Allow only numbers, '.', and control keys (e.g., Backspace, Delete, Arrow keys)
    if (
      !/[0-9.]/.test(e.key) && // Allow digits and '.'
      e.key !== "Backspace" &&
      e.key !== "Delete" &&
      e.key !== "ArrowLeft" &&
      e.key !== "ArrowRight" &&
      e.key !== "Tab"
    ) {
      e.preventDefault();
    }
  }}
  onChange={(e) => {
    // Validate input to ensure it only contains numbers and '.'
    const value = e.target.value;
    if (/^[0-9.]*$/.test(value)) {
      setExperienceNumber(value);
    }
  }}
/>

        </ExperimentNumber>

        <ExperimentName>
      <Label htmlFor="experienceName">Experience Name:*</Label>
      <Input
        type="text"
        id="experienceName"
        name="experienceName"
        value={experienceName} // Bind to experimentName state
        onChange={(e) => setExperienceName(e.target.value)} // Update state on input change
      />
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
            onChange={handleNumVariantsChange}  // use direct handler
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