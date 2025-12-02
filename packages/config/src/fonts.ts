import { createInterFont } from '@tamagui/font-inter'

export const headingFont = createInterFont({
  size: {
    6: 15,
  },
  transform: {
    6: 'uppercase',
    7: 'none',
  },
  weight: {
    6: '400',
    7: '700',
  },
  color: {
    6: '$colorFocus',
    7: '$color',
  },
  letterSpacing: {
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: -0.5,
    10: -0.5,
    12: -0.5,
    14: -0.5,
    15: -0.5,
  },
  face: {
    700: { normal: 'InterBold' },
  },
})

export const bodyFont = createInterFont(
  {
    letterSpacing: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
    },
    face: {
      700: { normal: 'InterBold' },
    },
  },
  {
    sizeSize: (size) => Math.round(size * 1.1),
    sizeLineHeight: (size) => Math.round(size * 1.1 + (size > 20 ? 10 : 10)),
  }
)
