import styled from "styled-components";

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

export const ModalHeader = styled.div`
  padding: 1rem 2rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  position: relative; /* Keep for potential absolute positioning inside */
  flex-shrink: 0; /* Prevent header from shrinking */
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1; /* Ensure button doesn't take extra vertical space */
  padding: 0; /* Remove default padding */
  margin: 0; /* Remove default margin */
`;

export const ModalContent = styled.div`
  padding: 1rem 2rem 2rem 2rem;
  overflow-y: auto; /* Make content scrollable */
  flex-grow: 1; /* Allow content to take available space */
`;
