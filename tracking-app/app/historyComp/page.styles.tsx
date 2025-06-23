import styled from "styled-components";

export const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
`;

export const SearchWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: space-between;

  .clientSelector {
    max-width: 200px;
  }

  input,
  select {
    max-height: 40px;
  }
`;

export const InputWrapper = styled.div`
  h1 {
    margin-bottom: 0.5rem;
  }

  input {
    padding: 0.5rem;
    width: 100%;
    max-width: 400px;
    margin-bottom: 1rem;
    border: 1px solid #ccc;
    border-radius: 16px;
    text-align: center;
  }
`;

export const FilterWrapper = styled.div`
  h1 {
    margin-bottom: 0.5rem;
  }

  select {
    padding: 0.5rem;
    width: 100%;
    max-width: 400px;
    margin-bottom: 1rem;
    border: 1px solid #ccc;
    border-radius: 16px;
    background-color: #7948b324;
    text-align: center;
  }
`;

export const ExperienceNameWrapper = styled.div`
  align-items: center;

  h1 {
    margin-bottom: 0.5rem;
  }

  input {
    padding: 0.5rem;
    width: 100%;
    max-width: 400px;
    margin-bottom: 1rem;
    border: 1px solid #ccc;
    border-radius: 16px;
    text-align: center;
  }
`;

export const ItemCard = styled.div`
  padding: 1rem;
  border: 1px solid #4A049C;
  border-radius: 16px;
  background-color: #7948b324;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-width: 150px;
  width: 300px;
  max-width: 300px;
  text-align: center;
  cursor: pointer;
  height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  p {
    margin: 0;
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
    }
  }
   .clientName{
    color: black!important;
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
    border-radius: 16px;
    color: white !important;
    font-weight: 500 !important;
  }
  .experienceName,
  .itemCode {
    font-size: 16px;
    color: #000;
    font-weight: bold;
    max-width: 350px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 5px;
    display: block;
  }
`;
