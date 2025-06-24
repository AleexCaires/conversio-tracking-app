import styled from "styled-components";

export const EventBlockWrapper = styled.div<{ "data-copied": boolean; $activeBorder: boolean }>`
  position: relative;
  margin-bottom: 1rem; // Added for spacing between blocks if they stack
`;

export const SelectCheckbox = styled.input.attrs({ type: "checkbox" })`
  position: absolute;
  top: 5px;
  right: 0px;
  width: 20px;
  height: 20px;
  cursor: pointer;
  z-index: 1; // Ensure it's above the pre block
`;

export const CopyButton = styled.button`
  position: absolute;
  right: 10px;
  bottom: 10px;
  padding: 8px 12px;
  font-size: 14px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;
export const EventsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 16px;
  padding: 10px;
  margin-bottom: 1.5rem; // Add some space below each grid
`;

export const EventsSectionTitle = styled.h3`
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
`;
