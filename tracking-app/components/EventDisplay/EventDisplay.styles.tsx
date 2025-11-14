import styled from "styled-components";

export const ChildrenWrapper = styled.div`
  display: flex;
  gap: 16px;
  padding: 10px;
  overflow-x: auto;
`;

export const EventDisplayWrapper = styled.div`
  margin-top: 2rem;
`;

export const EventTitle = styled.h3`
  margin-bottom: 1rem;
  font-size: 1.25rem;
  color: #222;
  text-align: center;
`;

export const EventLabelsWrapper = styled.div`
  margin-bottom: 1rem;
  color: #555;
  font-size: 1rem;
`;

export const EventLabelsList = styled.ul`
  margin: 0;
  padding-left: 1.25rem;
  list-style: none;
`;

export const EventLabelItem = styled.li`
  line-height: 2;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const EventLabelIndex = styled.span`
  margin-right: 0.5em;
`;

export const TriggerEventText = styled.span`
  color: #d35400;
  font-weight: 500;
  margin-left: 0.5em;
`;

export const EventItemWrapper = styled.div`
  margin-bottom: 0;
`;

export const EventItemLabel = styled.div`
  margin-bottom: 0.5rem;
  color: #444;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  display: block;
  max-width: 436px;
`;

export const CodeWrapper = styled.div`
  position: relative;
`;

export const ButtonsWrapper = styled.div`
  position: absolute;
  bottom: 0.8rem;
  right: 1rem;
  display: flex;
  gap: 0.35rem;
  flex-direction: row;
  align-items: end;
`;

export const CopyButtonStyled = styled.button<{ $copied?: boolean; $isSegment?: boolean }>`
  height: 33px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5em;
  padding: 0.25rem 0.6rem;
  font-size: 0.8rem;
  background-color: ${({ $copied, $isSegment }) => ($copied ? ($isSegment ? "#1c7c3e" : "#0056b3") : $isSegment ? "#28a745" : "#007bff")};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s ease;
  width: ${({ $isSegment }) => ($isSegment ? "auto" : "80px")};
  font-family: "Montserrat", Arial, sans-serif !important;
`;
