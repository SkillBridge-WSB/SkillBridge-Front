// Custom color palette
const colors = {
  // Primary colors
  primary: '#CC5500', // Główny Akcent / Primary CTA (Ciemnopomarańczowy)
  primaryLight: '#FFECE6', // Pill Active Light (Jasny Pomarańcz)
  
  // Status colors
  danger: '#D32F2F', // Danger / Negative (Czerwień)
  success: '#4CAF50', // Success / Approved (Zielony)
  
  // Background colors
  background: '#1A1A1A', // Background App (Głęboki Dark Gray)
  surface: '#282828', // Surface / Card BG (Tło Kart i Kontenerów)
  surfaceSecondary: '#4A4A4A', // Button Secondary BG (Tło dla przycisków neutralnych)
  
  // Text colors
  textPrimary: '#FFFFFF', // Text Primary (Biały)
  textSecondary: '#AAAAAA', // Text Secondary (Jasnoszary)
}

// Create custom dark theme matching Tamagui's theme structure
export const darkTheme = {
  // Background colors
  background: colors.background,
  backgroundHover: colors.surface,
  backgroundPress: colors.surfaceSecondary,
  backgroundFocus: colors.surface,
  backgroundTransparent: 'rgba(26, 26, 26, 0)',
  surface: colors.surface,
  surfaceSecondary: colors.surfaceSecondary,
  
  // Generic color scale (mapped to gray for dark theme)
  color1: colors.background,
  color2: colors.surface,
  color3: colors.surfaceSecondary,
  color4: '#5A5A5A',
  color5: '#6A6A6A',
  color6: '#7A7A7A',
  color7: '#8A8A8A',
  color8: '#9A9A9A',
  color9: colors.textSecondary,
  color10: '#BABABA',
  color11: '#CACACA',
  color12: colors.textPrimary,
  
  // Text colors
  color: colors.textPrimary,
  colorHover: colors.textPrimary,
  colorPress: colors.textPrimary,
  colorFocus: colors.textPrimary,
  colorTransparent: 'rgba(255, 255, 255, 0)',
  textPrimary: colors.textPrimary,
  textSecondary: colors.textSecondary,
  
  // Border colors
  borderColor: colors.surface,
  borderColorHover: colors.surfaceSecondary,
  borderColorPress: colors.primary,
  borderColorFocus: colors.primary,
  
  // Placeholder
  placeholderColor: colors.textSecondary,
  
  // Gray scale (mapped to our dark theme)
  gray1: colors.background,
  gray2: colors.surface,
  gray3: colors.surfaceSecondary,
  gray4: '#5A5A5A',
  gray5: '#6A6A6A',
  gray6: '#7A7A7A',
  gray7: '#8A8A8A',
  gray8: '#9A9A9A',
  gray9: colors.textSecondary,
  gray10: '#BABABA',
  gray11: '#CACACA',
  gray12: colors.textPrimary,
  
  // Blue (used as primary/accent - mapped to orange)
  blue1: colors.background,
  blue2: colors.surface,
  blue3: colors.surfaceSecondary,
  blue4: '#B84400',
  blue5: '#C44D00',
  blue6: colors.primary,
  blue7: '#D45D00',
  blue8: '#DC6500',
  blue9: '#E46D00',
  blue10: '#EC7500',
  blue11: colors.primaryLight,
  blue12: '#FFF4F0',
  
  // Green (success)
  green1: colors.background,
  green2: colors.surface,
  green3: '#2E7D32',
  green4: '#388E3C',
  green5: '#43A047',
  green6: colors.success,
  green7: '#66BB6A',
  green8: '#81C784',
  green9: '#A5D6A7',
  green10: '#C8E6C9',
  green11: '#E8F5E9',
  green12: '#F1F8E9',
  
  // Red (danger)
  red1: colors.background,
  red2: colors.surface,
  red3: '#B71C1C',
  red4: '#C62828',
  red5: '#D32F2F',
  red6: colors.danger,
  red7: '#E53935',
  red8: '#EF5350',
  red9: '#E57373',
  red10: '#EF9A9A',
  red11: '#FFCDD2',
  red12: '#FFEBEE',
  
  // Orange (primary accent)
  orange1: colors.background,
  orange2: colors.surface,
  orange3: '#B84400',
  orange4: '#C44D00',
  orange5: '#CC5500',
  orange6: colors.primary,
  orange7: '#D45D00',
  orange8: '#DC6500',
  orange9: '#E46D00',
  orange10: '#EC7500',
  orange11: colors.primaryLight,
  orange12: '#FFF4F0',
  
  // Yellow (for completeness)
  yellow1: colors.background,
  yellow2: colors.surface,
  yellow3: '#F57F17',
  yellow4: '#F9A825',
  yellow5: '#FBC02D',
  yellow6: '#FDD835',
  yellow7: '#FFEB3B',
  yellow8: '#FFEE58',
  yellow9: '#FFF176',
  yellow10: '#FFF59D',
  yellow11: '#FFF9C4',
  yellow12: '#FFFDE7',
  
  // Purple (for completeness)
  purple1: colors.background,
  purple2: colors.surface,
  purple3: '#4A148C',
  purple4: '#6A1B9A',
  purple5: '#7B1FA2',
  purple6: '#8E24AA',
  purple7: '#9C27B0',
  purple8: '#AB47BC',
  purple9: '#BA68C8',
  purple10: '#CE93D8',
  purple11: '#E1BEE7',
  purple12: '#F3E5F5',
  
  // Pink (for completeness)
  pink1: colors.background,
  pink2: colors.surface,
  pink3: '#880E4F',
  pink4: '#AD1457',
  pink5: '#C2185B',
  pink6: '#D81B60',
  pink7: '#E91E63',
  pink8: '#EC407A',
  pink9: '#F06292',
  pink10: '#F48FB1',
  pink11: '#F8BBD0',
  pink12: '#FCE4EC',
}

