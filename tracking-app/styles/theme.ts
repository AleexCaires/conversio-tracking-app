// src/styles/theme.ts
import { DefaultTheme } from 'styled-components';

// Define the actual theme object
export const theme: DefaultTheme = {
  colors: {
    primary: '#4caf50',
    secondary: '#ff5722',
    background: '#f4f4f4',
    text: '#333',
  },
  fonts: {
    main: "'Montserrat', Arial, sans-serif",
    heading: "'Montserrat', Arial, sans-serif",
  },
  spacing: {
    small: '8px',
    medium: '16px',
    large: '32px',
  },
};
