// src/app/page.tsx
'use client'; // Add this for client-side rendering

import { ThemeProvider } from 'styled-components';
import { GlobalStyle } from '../styles/globalStyles';
import { theme } from '../styles/theme';

export default function Home() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <div>
        This is the main page
      </div>
    </ThemeProvider>
  );
}
