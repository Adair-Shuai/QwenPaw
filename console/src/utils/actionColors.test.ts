import { describe, expect, it } from "vitest";
import { colorContrast, getActionColors } from "./actionColors";
import {
  getInterfaceActionColors,
  getInterfacePalette,
  INTERFACE_STYLES,
} from "./interfaceStyle";
import { THEME_PRESETS } from "../pages/SettingsCenter/themePresets";

describe("readable card action colors", () => {
  it("uses WCAG luminance rather than a fixed light-dark text rule", () => {
    expect(colorContrast("#000000", "#ffffff")).toBeCloseTo(21);
    expect(getActionColors("#485440", "#ffffff").foreground).toBe("#ffffff");
    expect(getActionColors("#b4c6a7", "#1b1c19").foreground).toBe("#141413");
    for (const accent of [
      "#777777",
      "#ffffff",
      "#000000",
      "rgb(255, 127, 22)",
      "hsl(120, 80%, 90%)",
    ]) {
      const colors = getActionColors(accent, "#ffffff", "#141413", "#ffff00");
      for (const background of [colors.background, colors.hover, colors.active])
        expect(
          colorContrast(colors.foreground, background),
        ).toBeGreaterThanOrEqual(4.5);
    }
  });

  for (const style of INTERFACE_STYLES) {
    for (const dark of [false, true]) {
      it(`keeps text and controls readable in ${style.id} ${
        dark ? "dark" : "light"
      }`, () => {
        for (const preset of THEME_PRESETS) {
          const colors = getInterfaceActionColors(style.id, dark, preset.theme);
          const surface =
            getInterfacePalette(style.id, dark)?.surface ??
            (dark ? preset.theme.dark?.surface ?? "#1c1b1e" : "#ffffff");
          for (const background of [
            colors.background,
            colors.hover,
            colors.active,
          ])
            expect(
              colorContrast(colors.foreground, background),
            ).toBeGreaterThanOrEqual(4.5);
          for (const text of [colors.link, colors.text, colors.muted])
            expect(colorContrast(text, surface)).toBeGreaterThanOrEqual(4.5);
          expect(colorContrast(colors.border, surface)).toBeGreaterThanOrEqual(
            3,
          );
        }
      });
    }
  }
});
