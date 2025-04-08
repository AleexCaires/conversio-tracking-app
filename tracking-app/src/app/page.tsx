// src/app/page.tsx
'use client'; // Add this for client-side rendering

import { ThemeProvider } from 'styled-components';
import { GlobalStyle } from '../styles/globalStyles';
import { theme } from '../styles/theme';
import Header from '@/components/Header';

export default function Home() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Header />
      <div>
        This is the main page
      </div>
    </ThemeProvider>
  );
}
