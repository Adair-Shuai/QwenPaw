import type { ThemeConfig } from "../api/modules/theme";
import { DEFAULT_THEME_PRESET } from "../pages/SettingsCenter/themePresets";
import { getActionColors, readableTone } from "./actionColors";
import { isSafeCssColor, toChatThemeHex } from "./chatThemeColor";

export const INTERFACE_STYLES = [
  { id: "classic", label: "Original", swatch: "#2563eb" },
  { id: "warm-minimal", label: "Warm minimal", swatch: "#777d69" },
  { id: "cool-workspace", label: "Cool workspace", swatch: "#4269cc" },
  { id: "soft-focus", label: "Soft focus", swatch: "#68877b" },
] as const;

export type InterfaceStyle = (typeof INTERFACE_STYLES)[number]["id"];
// Retain the installed palette key and API; page geometry is independent.
export const COLOR_THEMES = INTERFACE_STYLES;
export const INTERFACE_STYLE_STORAGE_KEY = "qwenpaw-interface-style";

export function parseInterfaceStyle(value: unknown): InterfaceStyle {
  return INTERFACE_STYLES.find((style) => style.id === value)?.id ?? "classic";
}

export function readInterfaceStyle(): InterfaceStyle {
  try {
    return parseInterfaceStyle(
      localStorage.getItem(INTERFACE_STYLE_STORAGE_KEY),
    );
  } catch {
    return "classic";
  }
}

interface StylePalette {
  background: string;
  shell: string;
  surface: string;
  raised: string;
  subtle: string;
  border: string;
  text: string;
  secondary: string;
  accent: string;
  hover: string;
  composer: string;
}

const PALETTES: Record<
  Exclude<InterfaceStyle, "classic">,
  {
    light: StylePalette;
    dark: StylePalette;
    radius: number;
    senderRadius: number;
  }
> = {
  "warm-minimal": {
    light: {
      background: "#fcfcfa",
      shell: "#f3f2ee",
      surface: "#fcfcfa",
      raised: "#ffffff",
      subtle: "#f1f1ec",
      border: "#e6e6df",
      text: "#282925",
      secondary: "#62665c",
      accent: "#485440",
      hover: "#394533",
      composer: "#ffffff",
    },
    dark: {
      background: "#1b1c19",
      shell: "#20211d",
      surface: "#1b1c19",
      raised: "#292b25",
      subtle: "#252720",
      border: "#373b31",
      text: "#eceee7",
      secondary: "#b2b8a9",
      accent: "#b4c6a7",
      hover: "#c8d8bd",
      composer: "#24261f",
    },
    radius: 8,
    senderRadius: 12,
  },
  "cool-workspace": {
    light: {
      background: "#ffffff",
      shell: "#f5f7fa",
      surface: "#ffffff",
      raised: "#ffffff",
      subtle: "#f1f4f9",
      border: "#e5e9ef",
      text: "#28303a",
      secondary: "#606d7e",
      accent: "#4269cc",
      hover: "#3357b3",
      composer: "#ffffff",
    },
    dark: {
      background: "#171b22",
      shell: "#1c222c",
      surface: "#171b22",
      raised: "#252e3a",
      subtle: "#202833",
      border: "#354153",
      text: "#e7edf6",
      secondary: "#abb9cd",
      accent: "#91b3ff",
      hover: "#b0c8ff",
      composer: "#202833",
    },
    radius: 6,
    senderRadius: 10,
  },
  "soft-focus": {
    light: {
      background: "#ffffff",
      shell: "#eff1f0",
      surface: "#ffffff",
      raised: "#ffffff",
      subtle: "#f0f3f1",
      border: "#e1e6e3",
      text: "#293230",
      secondary: "#606e67",
      accent: "#45685a",
      hover: "#365347",
      composer: "#f4f6f5",
    },
    dark: {
      background: "#1a211e",
      shell: "#202925",
      surface: "#1a211e",
      raised: "#2a3630",
      subtle: "#243029",
      border: "#3a4a41",
      text: "#e5eee8",
      secondary: "#acbeb2",
      accent: "#a1c9b5",
      hover: "#b8dcca",
      composer: "#26332b",
    },
    radius: 12,
    senderRadius: 18,
  },
};

export function getInterfacePalette(style: InterfaceStyle, isDark: boolean) {
  return style === "classic"
    ? undefined
    : PALETTES[style][isDark ? "dark" : "light"];
}

/** A selected style supplies its palette without changing the saved custom theme. */
export function getInterfaceTheme(
  theme: ThemeConfig,
  style: InterfaceStyle,
): ThemeConfig {
  if (style === "classic") return theme;
  const preset = PALETTES[style];
  return {
    ...theme,
    accent: preset.light.accent,
    accent_hover: preset.light.hover,
    accent_bg: `${preset.light.accent}1a`,
    dark: {
      ...theme.dark,
      accent: preset.dark.accent,
      accent_bg: `${preset.dark.accent}29`,
      surface: preset.dark.surface,
    },
  };
}

/** Shared roles for card controls and native Ant controls, including custom palettes. */
export function getInterfaceActionColors(
  style: InterfaceStyle,
  isDark: boolean,
  theme: ThemeConfig,
) {
  const effective = getInterfaceTheme(theme, style);
  const palette = getInterfacePalette(style, isDark);
  const surface = toChatThemeHex(
    palette?.surface ?? (isDark ? effective.dark?.surface : "#ffffff"),
    isDark ? "#1c1b1e" : "#ffffff",
  );
  const accent =
    (isDark ? effective.dark?.accent : undefined) ??
    effective.accent ??
    (isDark
      ? DEFAULT_THEME_PRESET.theme.dark!.accent!
      : DEFAULT_THEME_PRESET.theme.accent!);
  return {
    ...getActionColors(
      accent,
      surface,
      isDark && palette ? palette.background : "#141413",
      palette?.hover ?? (isDark ? undefined : effective.accent_hover),
    ),
    text: readableTone(
      palette?.text ?? (isDark ? "#e8e8ed" : "#26262a"),
      surface,
    ),
    muted: readableTone(
      palette?.secondary ?? (isDark ? "#b4b4b8" : "#626268"),
      surface,
    ),
    border: readableTone(isDark ? "#707078" : "#b0b0b8", surface, 3),
  };
}

/** The provider is the single owner of inline appearance tokens, including legacy overrides. */
export function applyInterfaceTheme(
  root: HTMLElement,
  style: InterfaceStyle,
  theme: ThemeConfig,
  isDark: boolean,
): () => void {
  const effective = getInterfaceTheme(theme, style);
  const dark = isDark ? effective.dark : undefined;
  const palette = getInterfacePalette(style, isDark);
  const action = getInterfaceActionColors(style, isDark, theme);
  const tokens: Record<string, string | undefined> = {
    "--app-action-bg": action.background,
    "--app-action-hover": action.hover,
    "--app-action-active": action.active,
    "--app-action-fg": action.foreground,
    "--app-action-link": action.link,
    "--app-action-border": action.border,
    "--app-card-text": action.text,
    "--app-card-muted": action.muted,
    "--app-accent": dark?.accent ?? effective.accent,
    "--app-accent-hover": palette?.hover ?? effective.accent_hover,
    "--app-accent-soft": dark?.accent_bg ?? effective.accent_bg,
    "--app-surface": palette?.surface ?? dark?.surface,
    "--app-radius": effective.radius,
    "--border-radius": effective.radius,
  };
  if (palette && style !== "classic") {
    Object.assign(tokens, {
      "--app-bg": palette.background,
      "--app-shell-bg": palette.shell,
      "--app-surface-raised": palette.raised,
      "--app-surface-subtle": palette.subtle,
      "--app-surface-sunken": palette.subtle,
      "--app-border": palette.border,
      "--app-border-subtle": palette.border,
      "--app-border-strong": `color-mix(in srgb, ${palette.border} 80%, ${palette.text})`,
      "--app-border-hover": `color-mix(in srgb, ${palette.border} 65%, ${palette.text})`,
      "--app-text": palette.text,
      "--app-text-secondary": palette.secondary,
      "--app-text-inverse": isDark ? palette.background : "#ffffff",
      "--app-text-tertiary": palette.secondary,
      "--app-glass": palette.raised,
      "--app-nav-selected-bg": palette.subtle,
      "--app-nav-selected-bg-hover": "var(--app-fill)",
      "--app-nav-selected-text": palette.text,
      "--app-composer-bg": palette.composer,
    });
  }
  const colorTokens = new Set(["--app-accent-soft", "--app-surface"]);
  Object.entries(tokens).forEach(([name, value]) => {
    if (
      value !== undefined &&
      (!colorTokens.has(name) || isSafeCssColor(value))
    )
      root.style.setProperty(name, value);
    else root.style.removeProperty(name);
  });
  root.dataset.interfaceStyle = style;
  return () => {
    Object.keys(tokens).forEach((name) => root.style.removeProperty(name));
    delete root.dataset.interfaceStyle;
  };
}
