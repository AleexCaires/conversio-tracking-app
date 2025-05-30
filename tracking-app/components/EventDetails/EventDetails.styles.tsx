import styled from "styled-components";

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem 5rem;
  background-color:#0000001F;;
  border-radius: 16px;
`;

export const SectionWrapper = styled.div`
  padding: 0rem 2rem 5rem 2rem;
  background-color: white;
`;

export const Heading = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
`;

export const FieldGroupInitial = styled.div`
  display: flex;
  flex-direction: row;
  gap: 2.5rem;
  align-items: center;
  flex-wrap: wrap;
`;

export const Label = styled.label`
  font-weight: 700;
  margin-right: 10px;
`;

export const Input = styled.input`
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 16px;
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
  border-radius: 16px;
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
`
export const TriggerButton = styled.button<{ disabled?: boolean }>`
  height: 48px;
  width: 115px;
  border-radius: 16px;
  background-color: ${({ disabled }) => (disabled ? "#B0B0B0" : "#67FF88")}; // Grey out when disabled
  color: ${({ disabled }) => (disabled ? "#666666" : "#000")}; // Darker text when disabled
  font-weight: 700;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")}; // Change cursor when disabled
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)}; // Reduce opacity when disabled
  border: none; // Assuming no border is desired, or adjust as needed

  &:hover {
    background-color: ${({ disabled }) => (disabled ? "#B0B0B0" : "#52CC6D")}; // Darker green on hover if not disabled
  }
`;

export const SaveToDBbtn = styled.button`
  height: 48px;
  width: 135px;
  border-radius: 16px;
  background: #582E89;
  color: white;
  font-weight: 700;
  cursor: pointer;
`