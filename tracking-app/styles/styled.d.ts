// src/styles/styled.d.ts
import 'styled-components';


declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      darkPurple: string;
      midPurple: string;
      lightPurple: string;
      darkGreen: string;
      midGreen: string;
      lightGreen: string;
      darkOrange: string;
      midOrange: string;
      lightOrange: string;
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
