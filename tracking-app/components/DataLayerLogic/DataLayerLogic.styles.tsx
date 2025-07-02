import styled from "styled-components";

export const EventBlockWrapper = styled.div<{ "data-copied": boolean; $activeBorder: boolean }>`
  position: relative;
  margin-bottom: 1rem; // Added for spacing between blocks if they stack
      width: 470px;
    max-width: 470px;
    height: 190px;
`;

export const SelectCheckbox = styled.input.attrs({ type: "checkbox" })`
  position: absolute;
    top: 1px;
    right: 1px;
  width: 20px;
  height: 20px;
  cursor: pointer;
  z-index: 1;
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
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;
export const EventsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  gap: 16px;
  padding: 10px;
  margin-bottom: 80px; /* Add extra bottom margin to prevent content from being hidden behind the sticky bar */
`;

export const EventsSectionTitle = styled.h3`
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
`;
