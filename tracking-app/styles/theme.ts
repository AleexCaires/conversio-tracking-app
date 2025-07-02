// src/styles/theme.ts
import { DefaultTheme } from 'styled-components';

// Define the actual theme object
export const theme: DefaultTheme = {
  colors: {
      darkPurple: '#45246B',
      midPurple: '#502A7C',
      lightPurple: '#633399',
      darkGreen: '#255D3D',
      midGreen:'#2C6E49',
      lightGreen:'#73A580',
      darkOrange:'#ED9C4A',
      midOrange:'#EFA55A',
      lightOrange:'#F0AD69',
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
