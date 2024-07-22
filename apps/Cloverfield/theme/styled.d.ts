import { ThemedCssFunction } from "styled-components/macro";
import { SupportedThemes } from ".";

export type Color = string;
export interface Colors {
  themeName: SupportedThemes;

  // base
  white: Color;
  black: Color;

  // text
  text0: Color;
  text1: Color;
  text2: Color;
  text3: Color;
  text4: Color;
  text5: Color;

  // backgrounds
  bg: Color;
  bg0: Color;
  bg1: Color;
  bg2: Color;
  bg3: Color;
  bg4: Color;
  bg5: Color;
  bg6: Color;
  bg7: Color;

  bgLoose: Color;
  bgWin: Color;
  bgWarning: Color;

  // borders
  border1: Color;
  border2: Color;
  border3: Color;

  gradLight: Color;
  gradError: Color;
  hoverGrad: Color;
  hoverShort: Color;
  hoverLong: Color;
  primaryBlackNew: Color;
  primaryDisable: Color;
  primaryDarkBg: Color;
  primaryDark: Color;
  primaryDarkOld: Color;

  //blues
  primary0: Color;
  primary1: Color;
  primary2: Color;

  // other
  black2: Color;
  red1: Color;
  red2: Color;
  red5: Color;
  red6: Color;
  green1: Color;
  yellow1: Color;
  yellow2: Color;
  blue1: Color;
  blue2: Color;
  primaryBlue: Color;

  error: Color;
  error1: Color;
  success: Color;
  warning: Color;
  twitter: Color;
}

export type Shadow = string;
export interface Shadows {
  shadow1: Shadow;
  boxShadow1: Shadow;
  boxShadow2: Shadow;
}

declare module "styled-components" {
  export interface DefaultTheme extends Colors, Shadows {
    grids: Grids;

    // media queries
    mediaWidth: {
      upToExtraSmall: ThemedCssFunction<DefaultTheme>;
      upToSmall: ThemedCssFunction<DefaultTheme>;
      upToMedium: ThemedCssFunction<DefaultTheme>;
      upToLarge: ThemedCssFunction<DefaultTheme>;
      upToExtraLarge: ThemedCssFunction<DefaultTheme>;
    };
  }
}
