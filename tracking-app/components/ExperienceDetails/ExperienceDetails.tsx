"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Section, SectionWrapper, Heading, FieldGroupMiddle, Label, Select, Input, FieldGroupFirst, FieldGroupEnd, ExperimentName, ExperimentNumber, ExperienceVariations, SinglePlatformDisplay, SinglePlatformDisplayWrapper } from "./ExperienceDetails.styles";
import { useExperience } from "../ExperienceContext/ExperienceContext";
import { clients } from "../../lib/clients";
import { EditData } from "@/types";

interface ExperienceDetailsProps {
  onClientChange: (clientCode: string) => void;
  onExperienceNumberChange: (experienceNumber: string) => void;
  editData?: EditData;
  isEditMode?: boolean;
}

const ExperienceDetails: React.FC<ExperienceDetailsProps> = ({ onClientChange, onExperienceNumberChange, editData, isEditMode }) => {
  const { numVariants, setNumVariants } = useExperience();
  const { selectedClient, setSelectedClient } = useExperience();
  const { experienceNumber, setExperienceNumber } = useExperience();
  const { experienceName, setExperienceName } = useExperience();

  const [platform, setPlatform] = useState("AB Tasty"); // Default platform for Finisterre
  const [platformOptions, setPlatformOptions] = useState<string[]>(["AB Tasty"]); // Options for the platform dropdown

  // Add a ref to track initialization
  const initializedRef = useRef(false);
  const processedEdit = useRef(false);

  const handleNumVariantsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setNumVariants(isNaN(value) ? 1 : Math.max(1, value));
  };

  const handleClientChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
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
        case "BM": // Belmond
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
    },
    [onClientChange, setSelectedClient]
  );

  // Modify the useEffect to only run once at initialization if not in edit mode
  useEffect(() => {
    // Only set default client if not in edit mode and not already initialized
    if (!initializedRef.current && !isEditMode) {
      handleClientChange({ target: { value: "FN" } } as React.ChangeEvent<HTMLSelectElement>);
      initializedRef.current = true;
    }
  }, [handleClientChange, isEditMode]);

  useEffect(() => {
    if (isEditMode && editData && !processedEdit.current) {
      processedEdit.current = true;

      if (editData.client) {
        const clientEntry = clients.find((c) => c.name === editData.client || c.code === editData.client);
        if (clientEntry) {
          setSelectedClient(clientEntry.code);
          onClientChange(clientEntry.code);
        }
      }

      if (editData.id) {
        const clientPrefix = clients.find((c) => editData.id.startsWith(c.code))?.code;
        const expNumber = clientPrefix ? editData.id.substring(clientPrefix.length) : editData.id;

        setExperienceNumber(expNumber);
        onExperienceNumberChange(expNumber);
      }

      if (editData.name) {
        setExperienceName(editData.name);
      }

      // Set number of variants once
      if (Array.isArray(editData.events)) {
        const variationGroups = editData.events.filter((group) => group.label && group.label.startsWith("Variation "));
        const initialVariantCount = Math.max(1, variationGroups.length);
        setNumVariants(initialVariantCount);
      }
    }
  }, [isEditMode, editData, onClientChange, onExperienceNumberChange, setSelectedClient, setExperienceNumber, setExperienceName, setNumVariants]);

  return (
    <SectionWrapper>
      <Section>
        <Heading>Experience Details</Heading>

        <FieldGroupFirst>
          <div>
            <Label htmlFor="client">Client</Label>
            <Select id="client" name="client" value={selectedClient} onChange={handleClientChange}>
              <option value="" disabled>
                Select a client
              </option>
              {[...clients]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((client) => (
                  <option key={client.code} value={client.code}>
                    {client.name}
                  </option>
                ))}
            </Select>
          </div>
          <SinglePlatformDisplayWrapper>
            <Label htmlFor="platform">Platform</Label>
            {platformOptions.length === 1 ? (
              <SinglePlatformDisplay>{platformOptions[0]}</SinglePlatformDisplay>
            ) : (
              <Select id="platform" name="platform" value={platform} onChange={(e) => setPlatform(e.target.value)}>
                {platformOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            )}
          </SinglePlatformDisplayWrapper>
        </FieldGroupFirst>

        <FieldGroupMiddle>
          <ExperimentNumber>
            <Label htmlFor="experienceNumber">
              Experience Number<span style={{ color: "red" }}>*</span>
            </Label>
            <Input
              id="experienceNumber"
              type="text"
              value={experienceNumber}
              onKeyDown={(e) => {
                if (!/[0-9.]/.test(e.key) && e.key !== "Backspace" && e.key !== "Delete" && e.key !== "ArrowLeft" && e.key !== "ArrowRight" && e.key !== "Tab") {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                const value = e.target.value;
                if (/^[0-9.]*$/.test(value)) {
                  setExperienceNumber(value);
                }
              }}
            />
          </ExperimentNumber>

          <ExperimentName>
            <Label htmlFor="experienceName">
              Experience Name<span style={{ color: "red" }}>*</span>
            </Label>
            <Input type="text" id="experienceName" name="experienceName" value={experienceName} onChange={(e) => setExperienceName(e.target.value)} />
          </ExperimentName>
        </FieldGroupMiddle>

        <FieldGroupEnd>
          <ExperienceVariations>
            <Label htmlFor="numVariants">
              No. of Variants (not inc. control)<span style={{ color: "red" }}>*</span>
            </Label>
            <Input type="number" id="numVariants" name="numVariants" value={numVariants} min={1} onChange={handleNumVariantsChange} />
          </ExperienceVariations>
        </FieldGroupEnd>
      </Section>
    </SectionWrapper>
  );
};

export default ExperienceDetails;
