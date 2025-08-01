import type { Metadata } from "next";
import "../styles/reset.css";

export const metadata: Metadata = {
  title: "Conversio | Cross Client GA4 Tracking Builder",
  description: "Generated by create next app",
  icons: {
    icon: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f50e.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
      </head>
      <body style={{
        margin: 0,
        padding: 0,
        fontFamily: "'Montserrat', Arial, sans-serif",
      }}>
        {children}
      </body>
    </html>
  );
}