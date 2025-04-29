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
    border-radius: 4px;
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
    border-radius: 4px;
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
    border-radius: 4px;
  }
`;

export const ItemCard = styled.div`
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-width: 150px;
  width: 300px;
  max-width: 300px;
  text-align: center;
  cursor: pointer;

  p {
    margin: 0;
  }

  p:first-child {
    font-weight: bold;
    margin: 0px 5px 5px 5px;
    color: #333;
    font-size: 18px;
  }

  p:nth-child(2) {
    margin: 0;
    font-size: 16px;
    color: rgb(51, 51, 51);
    font-weight: bold;
    max-width: 350px;
    white-space: normal;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    margin-bottom: 10px;
  }

  div {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
    color: #666;
  }
`;
