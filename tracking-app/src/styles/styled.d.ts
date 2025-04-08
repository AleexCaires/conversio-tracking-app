// src/styles/styled.d.ts
import 'styled-components';


declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      secondary: string;
      background: string;
      text: string;
    };
    fonts: {
      main: string;
      heading: string;
    };
    spacing: {
      small: string;
      medium: string;
      large: string;
    };
  }
}
