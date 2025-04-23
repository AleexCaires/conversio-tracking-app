import styled from "styled-components";

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem;
  background-color: #ffe5e5;
`;

export const Heading = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
`;

export const FieldGroupInitial = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  align-items: center;
  justify-content: space-evenly;
`;

export const Label = styled.label`
  font-weight: 700;
  margin-right: 10px;
`;

export const Input = styled.input`
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

export const EventDescriptionRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  width: 90%;
`;

export const EventInput = styled.input`
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #999;
  border-radius: 4px;
  background-color: white;
`;

export const EventRow = styled.div`
    display: flex;
    flex-direction: row;
    gap: 1rem;
`  

export const EventCol = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 50%;
`
export const EventColEnd = styled.div`
    display: flex;
    flex-direction: row;
    gap: 2rem;
    width: 65%;
    flex-wrap: wrap;
    justify-content: space-around;
`