
import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  html, body, div#__next, div#root, div#app, div[data-reactroot] {
    margin: 0;
    padding: 0;
    font-family: 'Montserrat', Arial, sans-serif;
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    box-sizing: border-box;
  }

  html body, body[data-reactroot], body#__next-body, body[data-theme], body.app-body, body.site-body, body[data-nextjs] {
    margin: 0;
    padding: 0;
    min-height: 100%;
    width: 100%;
    font-family: 'Montserrat', Arial, sans-serif !important;
    background: none;
  }

  html:where([class]), body:where([class]), div:where([class]) {
    margin: 0;
    padding: 0;
  }

  *, *::before, *::after {
    box-sizing: inherit;
    font-family: inherit !important;
    margin-top: 0;
    margin-bottom: 0;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Montserrat', Arial, sans-serif !important;
    margin-top: 0;
    margin-bottom: 0;
  }

  input, select, textarea, button {
    font-family: inherit !important;
  }
`;