import styled from "styled-components";

export const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  font-family: "Montserrat", Arial, sans-serif !important;
    padding: 0rem 2rem 2rem 2rem;
`;

export const SearchWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  align-items: center;
  font-family: "Montserrat", Arial, sans-serif !important;


  .clientSelector {
    max-width: 200px;
  }

  input,
  select {
    max-height: 40px;
    font-family: "Montserrat", Arial, sans-serif !important;
  }
`;

export const InputWrapper = styled.div`
  h1 {
    margin-bottom: 0.5rem;
  }

  input {
    padding: 0.5rem;
    width: 260px;
    max-width: 390px;
    border: 1px solid #ccc;
    border-radius: 8px;
    text-align: start;
    font-family: "Montserrat", Arial, sans-serif !important;
  }
`;

export const FilterWrapper = styled.div`
  h1 {
    margin-bottom: 0.5rem;
  }

  select {
    padding: 0.5rem;
    width: 100%;
    max-width: 390px;
    border: 1px solid #ccc;
    border-radius: 8px;
    background-color: #7948b324;
    text-align: center;
    font-family: "Montserrat", Arial, sans-serif !important;
  }
`;

export const ItemCard = styled.div`
  padding: 1rem;
  border: 1px solid #4a049c;
  border-radius: 8px;
  background-color: #7948b324;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-width: 150px;
  width: 300px;
  max-width: 300px;
  text-align: center;
  cursor: pointer;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-family: "Montserrat", Arial, sans-serif !important;

  p {
    margin: 0;
    font-family: "Montserrat", Arial, sans-serif !important;
  }
  .bottomContainer {
    display: flex;
    justify-content: space-between;
    margin-top: 5px;

    .clientName,
    .date {
      font-weight: 100;
      margin: 0px 5px 5px 5px;
      color: grey;
      font-size: 16px;
      font-family: "Montserrat", Arial, sans-serif !important;
    }
  }
  .clientName {
    color: black !important;
    font-family: "Montserrat", Arial, sans-serif !important;
  }
  .itemCode {
    text-align: start;
    width: 25%;
    align-items: center;
    text-align: center;
    background: linear-gradient(
      to bottom,
      #714c8a 0%,
      #483057 50%,
      #4c305e 100%
    );
    padding: 0px 5px;
    border-radius: 8px;
    color: white !important;
    font-weight: 500 !important;
    font-family: "Montserrat", Arial, sans-serif !important;
  }
  .experienceName,
  .itemCode {
    font-size: 16px;
    color: #000;
    font-weight: 500;
    max-width: 350px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 5px;
    display: block;
    font-family: "Montserrat", Arial, sans-serif !important;
  }
`;
