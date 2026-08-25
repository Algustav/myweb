export const themeNames = {
  light: '浅色模式',
  dark: '深色模式'
} as const;

export const fontNames = {
  song: '宋体',
  wenkai: '霞鹜文楷',
  sans: '思源黑体'
} as const;

export type Theme = keyof typeof themeNames;
export type Font = keyof typeof fontNames;

const themes: Theme[] = ['light', 'dark'];
const fonts: Font[] = ['song', 'wenkai', 'sans'];

function nextInCycle<T>(items: T[], current: T): T {
  const index = items.indexOf(current);
  return items[(index + 1) % items.length];
}

export function nextTheme(current: Theme): Theme {
  return nextInCycle(themes, current);
}

export function nextFont(current: Font): Font {
  return nextInCycle(fonts, current);
}
