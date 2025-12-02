import { defaultConfig } from '@tamagui/config/v4'
import { createTamagui } from 'tamagui'
import { bodyFont, headingFont } from './fonts'
import { animations } from './animations'
import { darkTheme } from './themes'

// Color values for tokens
const textPrimary = '#FFFFFF'
const textSecondary = '#AAAAAA'
const surfaceSecondary = '#4A4A4A'

export const config = createTamagui({
  ...defaultConfig,
  animations,
  fonts: {
    body: bodyFont,
    heading: headingFont,
  },
  tokens: {
    ...defaultConfig.tokens,
    color: {
      ...defaultConfig.tokens.color,
      textPrimary,
      textSecondary,
      surfaceSecondary,
    },
  },
  themes: {
    ...defaultConfig.themes,
    dark: darkTheme,
    // Create a light theme that's the same as dark (always dark mode)
    light: darkTheme,
  },
  defaultTheme: 'dark',
  settings: {
    ...defaultConfig.settings,
    onlyAllowShorthands: false,
  },
})
