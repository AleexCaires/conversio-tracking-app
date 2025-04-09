import styled from "styled-components";

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem;
  background-color: #f0f6ff; /* Optional: Matches the screenshot */
`;

export const Heading = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
`;

export const FieldGroupMiddle = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1rem;
`;
export const FieldGroupEnd = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1rem;
  justify-content: space-between;
  align-items: center;
`;

export const FieldGroupFirst = styled.div`
display: flex;
flex-direction: row;
justify-content: space-between;
align-items: center;
gap: 1rem;
width: 100%;
`

export const Label = styled.label`
  font-weight: 700;
  margin-right: 10px;
`;

export const Select = styled.select`
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;

`;

export const Input = styled.input`
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

export const ExperimentNumber = styled.div`
    display: flex;
    align-items: center;
    width: 30%;
    label{
        white-space: nowrap;
    }

    input{
        width: 100%;
    }
`

export const ExperimentName = styled.div`
    display: flex;
    align-items: center;
    width: 70%;
    label{
        white-space: nowrap;
    }

    input{
        width: 90%;
    }
`

