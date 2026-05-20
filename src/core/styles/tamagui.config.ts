import { shorthands } from "@tamagui/shorthands";
import { createTamagui, createTokens } from "tamagui";

const tokens = createTokens({
  color: {
    blue10: "#0F52BA",
    blue9: "#1D4ED8",
    blue8: "#2563EB",
    teal10: "#0D9488",
    teal9: "#14B8A6",
    emerald10: "#047857",
    emerald9: "#059669",
    rose10: "#BE123C",
    rose9: "#E11D48",
    slate1: "#F8FAFC",
    slate2: "#F1F5F9",
    slate3: "#E2E8F0",
    slate7: "#334155",
    slate11: "#1E293B",
    zinc1: "#FAFAFA",
    zinc2: "#F4F4F5",
    zinc11: "#27272A",
    zinc12: "#18181B",
    brand: "#0F52BA",
    brandSoft: "#E8F0FF",
    accent: "#0D9488",
    background: "#F8FAFC",
    card: "#FFFFFF",
    text: "#0F172A",
    textMuted: "#64748B",
    success: "#059669",
    danger: "#E11D48",
    border: "#E2E8F0",
    surface: "#FFFFFF",
    surfaceMuted: "#F8FAFC",
  },
  space: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    true: 16,
  },
  size: {
    0: 0,
    1: 12,
    2: 14,
    3: 16,
    4: 18,
    5: 20,
    6: 24,
    7: 28,
    8: 34,
    true: 16,
  },
  radius: {
    0: 0,
    1: 6,
    2: 10,
    3: 14,
    4: 18,
    5: 24,
    true: 12,
  },
  zIndex: {
    0: 0,
    1: 100,
    2: 200,
    3: 300,
    4: 400,
    5: 500,
  },
});

const config = createTamagui({
  defaultTheme: "light",
  shouldAddPrefersColorThemes: false,
  themeClassNameOnRoot: true,
  shorthands,
  tokens,
  themes: {
    light: {
      background: tokens.color.background,
      color: tokens.color.text,
      primary: tokens.color.brand,
      secondary: tokens.color.accent,
      borderColor: tokens.color.border,
      cardBackground: tokens.color.card,
      mutedColor: tokens.color.textMuted,
      danger: tokens.color.danger,
      success: tokens.color.success,
      soft: tokens.color.slate2,
      surface: tokens.color.surface,
      surfaceMuted: tokens.color.surfaceMuted,
    },
    dark: {
      background: tokens.color.zinc12,
      color: tokens.color.zinc1,
      primary: tokens.color.blue8,
      secondary: tokens.color.teal10,
      borderColor: tokens.color.zinc11,
      cardBackground: tokens.color.zinc11,
      mutedColor: tokens.color.slate7,
      danger: tokens.color.rose9,
      success: tokens.color.emerald9,
      soft: tokens.color.zinc2,
      surface: tokens.color.zinc11,
      surfaceMuted: tokens.color.zinc2,
    },
  },
});

export type AppTamaguiConfig = typeof config;

declare module "tamagui" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TamaguiCustomConfig extends AppTamaguiConfig {}
}

export default config;