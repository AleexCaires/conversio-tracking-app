import styled from "styled-components";
import { FaList, FaCode } from "react-icons/fa";

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const ModalContainer = styled.div`
  background-color: #fff;
  border-radius: 8px;
  max-width: 90vw;
  width: 90%;
  max-height: 90vh;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Keep this to manage content overflow */
`;

export const ModalHeader = styled.header`
  padding: 1rem 2rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  position: relative;
  flex-shrink: 0;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  margin: 0;
`;

export const ModalContent = styled.div`
  padding: 1rem 2rem 2rem 2rem;
  overflow-y: auto;
  flex-grow: 1;
`;

export const HeaderTitle = styled.div`
  flex: 1;
  font-weight: 600;
  font-size: 1.1rem;
  text-align: left;

  span {
    color: inherit;
  }
`;

const iconButtonBase = `
  background: none;
  border: none;
  cursor: pointer;
  margin-right: 0.5rem;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  z-index: 2;
`;

export const EditButton = styled.button`
  ${iconButtonBase}
  color: #4CAF50;
`;

export const DeleteButton = styled.button`
  ${iconButtonBase}
  color: #d32f2f;
`;

export const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
`;

export const ToggleLabel = styled.span`
  font-weight: 700;
  font-size: 1.1rem;
`;

const iconBaseStyles = `
  font-size: 1.3rem;
  cursor: pointer;
  transition: color 0.2s;
`;

export const StyledFaList = styled(FaList)<{ $active: boolean }>`
  ${iconBaseStyles}
  color: ${({ $active }) => ($active ? "#582E89" : "#b0b0b0")};
`;

export const StyledFaCode = styled(FaCode)<{ $active: boolean }>`
  ${iconBaseStyles}
  color: ${({ $active }) => ($active ? "#582E89" : "#b0b0b0")};
`;
