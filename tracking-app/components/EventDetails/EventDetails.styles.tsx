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
export const TriggerButton = styled.button`
  height: 48px;
  width: 115px;
  border-radius: 16px;
  background-color: #67FF88;
  color: #000;
  font-weight: 700;
  cursor: pointer;
`