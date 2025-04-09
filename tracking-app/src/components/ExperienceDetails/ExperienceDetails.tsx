"use client";

import React from "react";
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
  onClientChange: (client: string) => void;
  onControlTypeChange: (controlType: string) => void;
}> = ({ onClientChange}) => {
  const { numVariants, setNumVariants } = useExperience();

  const handleNumVariantsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setNumVariants(isNaN(value) ? 0 : Math.max(0, value)); // Ensure numVariants is at least 0
  };


  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onClientChange(e.target.value); // Notify parent of client changes
  };

  return (
    <Section>
      <Heading>Experience Details</Heading>

      <FieldGroupFirst>
        <div>
          <Label htmlFor="client">Client</Label>
          <Select id="client" name="client" onChange={handleClientChange}>
            <option value="Finisterre">Finisterre</option>
            <option value="OtherClient">OtherClient</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="controlType">Control Type</Label>
          <Select id="controlType" name="controlType">
            <option value="Dummy Control">Dummy Control</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="platform">Platform</Label>
          <Select id="platform" name="platform">
            <option value="Dynamic Yield">Dynamic Yield</option>
          </Select>
        </div>
      </FieldGroupFirst>

      <FieldGroupMiddle>
        <ExperimentNumber>
          <Label htmlFor="experienceNumber">Experience Number:*</Label>
          <Input type="number" id="experienceNumber" name="experienceNumber" />
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