import { ThemedCssFunction } from "styled-components/macro";
import { SupportedThemes } from "theme";

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
  text6: Color;

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
  bg8: Color;

  bgLoose: Color;
  bgWin: Color;
  bgWarning: Color;

  // borders
  border1: Color;
  border2: Color;
  border3: Color;

  gradDark: Color;
  gradLight: Color;
  primaryGrad: Color;
  hoverGrad: Color;
  pinkGrad: Color;
  hoverLong: Color;
  primaryGrad: Color;
  primaryBlackNew: Color;
  primaryDisable: Color;
  primaryDarkBg: Color;
  shadow: Color;
  primaryDark: Color;
  hoverSecondaryButton: Color;
  primaryDarkOld: Color;

  //blues
  primary0: Color;
  primary1: Color;
  primary2: Color;
  primary3: Color;
  primary4: Color;
  primary5: Color;
  primary6: Color;
  primary7: Color;
  primary8: Color;

  Link: Color;

  // pinks
  secondary1: Color;
  secondary2: Color;

  // other
  black2: Color;
  red1: Color;
  red2: Color;
  red3: Color;
  red5: Color;
  red6: Color;
  green1: Color;
  green2: Color;
  green3: Color;
  green4: Color;
  greenButton: Color;
  redButton: Color;
  yellow1: Color;
  yellow2: Color;
  yellow3: Color;
  yellow4: Color;
  yellow5: Color;
  blue1: Color;
  blue2: Color;
  CTAPink: Color;
  icons: Color;
  disabledButton: Color;
  hover: Color;
  darkPink: Color;
  orange: Color;
  darkOrange: Color;
  secondaryButton: Color;

  error: Color;
  error1: Color;
  success: Color;
  warning: Color;
  chartStroke: Color;

  usdt: Color;
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
