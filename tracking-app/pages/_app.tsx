import { ThemeProvider } from 'styled-components';
import { GlobalStyle } from '../styles/globalStyles';
import { theme } from '../styles/theme';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <html lang="en">
        <body>{children}</body>
      </html>
    </ThemeProvider>
  );
}