import styled from "styled-components";

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem 5rem;
  background-color: #7948b33f;
  border-radius: 8px;
`;

export const SectionWrapper = styled.div`
  padding: 0rem 2rem 5rem 2rem;
  background-color: white;
`;

export const Heading = styled.h2`
  font-size: 1.5rem;
  font-weight: 500;
`;

export const FieldGroupInitial = styled.div`
  display: flex;
  flex-direction: row;
  gap: 2.5rem;
  align-items: center;
  flex-wrap: wrap;
`;

export const Label = styled.label`
  font-weight: 500;
  margin-right: 10px;
`;

export const Input = styled.input`
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
`;

export const EventDescriptionRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  width: 48%;
`;

export const EventInput = styled.input`
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #999;
  border-radius: 8px;
  background-color: white;
  min-width: 400px;
`;

export const EventRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 2.5rem;
`;

export const EventCol = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
  width: 100%;
  flex-wrap: wrap;
`;

export const EventColEnd = styled.div`
  display: flex;
  flex-direction: row;
  gap: 2rem;
  width: 65%;
  flex-wrap: wrap;
  justify-content: space-around;
`;

export const TriggerEventWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const TriggerButton = styled.button<{ disabled?: boolean }>`
  height: 48px;
  width: 115px;
  border-radius: 8px;
  background-color: ${({ disabled }) => (disabled ? "#B0B0B0" : "#2c6e49")}; 
  color: ${({ disabled }) => (disabled ? "#fff" : "#fff")};
  font-weight: 500;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")}; 
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)}; 
  border: none;
  margin: 0 auto;

  &:hover {
    background-color: ${({ disabled }) => (disabled ? "#B0B0B0" : "#255D3D")};
  }
`;

export const StickyButtonContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  padding: 16px;
  display: flex;
  justify-content: center;
  gap: 20px;
  z-index: 100;
`;

export const SaveToDBbtn = styled.button`
  height: 48px;
  width: 155px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors?.darkPurple || '#45246B'}; // Add fallback
  color: white;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  font-family: 'Montserrat', Arial, sans-serif !important;
  border: 0;
  
  &:disabled {
    background-color: #B0B0B0;
    cursor: not-allowed;
    opacity: 0.6;
  }
  &:hover{
    background-color: ${({ theme }) => theme.colors?.darkPurple || '#45246B'};
  }
`;

export const SelectAllButton = styled.button`
  height: 48px;
  width: 155px;
  background-color: ${({ theme }) => theme.colors?.midGreen || '#2C6E49'};
  color: white;
  font-weight: 500;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background-color 0.2s;
  font-family: 'Montserrat', Arial, sans-serif !important;

  &:hover {
    background-color: ${({ theme }) => theme.colors?.darkGreen || '#255D3D'};
  }

  &:disabled {
    background-color: #B0B0B0;
    cursor: not-allowed;
    opacity: 0.6;
  }
`;
