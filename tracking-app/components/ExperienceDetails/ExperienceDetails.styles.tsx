import styled from "styled-components";

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background-color: #7948b31f;
  border-radius: 8px;
  padding: 2rem 5rem;
`;
export const SectionWrapper = styled.div`
  padding: 0rem 2rem 2rem 2rem;
  background-color: white;
`;

export const Heading = styled.h2`
  font-size: 1.5rem;
  font-weight: 500;
`;

export const FieldGroupMiddle = styled.div`
  display: flex;
  flex-direction: row;
  gap: 2.5rem;
`;
export const FieldGroupEnd = styled.div`
  display: flex;
  flex-direction: row;
  gap: 2.5rem;
  justify-content: start;
  align-items: center;
`;

export const FieldGroupFirst = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: center;
  gap: 2.5rem;
  width: 100%;
`;

export const Label = styled.label`
  font-weight: 500;
  margin-right: 10px;
`;

export const Select = styled.select`
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  height: 40px;
`;

export const Input = styled.input`
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  height: 40px;
`;

export const ExperimentNumber = styled.div`
  display: flex;
  align-items: center;
  label {
    white-space: nowrap;
  }

  input {
    width: 100px;
  }
`;

export const ExperimentName = styled.div`
  display: flex;
  align-items: center;
  width: 60%;
  label {
    white-space: nowrap;
  }

  input {
    width: 90%;
  }
`;

export const ExperienceVariations = styled.div`
  input {
    width: 55.5px;
  }
`;

export const SinglePlatformDisplayWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const SinglePlatformDisplay = styled.div`
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  height: 40px;
  background: #ededed;
  color: #b0b0b0;
  display: flex;
  align-items: center;
  min-width: 120px;
  opacity: 1;
  cursor: not-allowed;
  user-select: none;
`;
