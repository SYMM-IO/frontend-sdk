import React from "react";
import { useTheme } from "styled-components";
import { Moon, Sun } from "react-feather";

import { useIsDarkMode } from "@symmio/frontend-sdk/state/user/hooks";
import { IconWrapper } from "./index";

export default function ThemeToggle({ size }: { size?: number }) {
  const darkMode = useIsDarkMode();
  const theme = useTheme();

  return darkMode ? (
    <IconWrapper stroke={theme.yellow1}>
      <Sun opacity={0.6} size={size ?? 16} />
    </IconWrapper>
  ) : (
    <IconWrapper stroke={theme.text1}>
      <Moon opacity={0.6} size={size ?? 16} />
    </IconWrapper>
  );
}
