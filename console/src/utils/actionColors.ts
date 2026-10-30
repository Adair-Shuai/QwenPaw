import { toChatThemeHex } from "./chatThemeColor";

type Rgb = [number, number, number];
const rgb = (color: string): Rgb =>
  [1, 3, 5].map((offset) =>
    parseInt(color.slice(offset, offset + 2), 16),
  ) as Rgb;
const hex = (color: Rgb) =>
  `#${color
    .map((channel) => Math.round(channel).toString(16).padStart(2, "0"))
    .join("")}`;
const mix = (a: string, b: string, weight: number) =>
  hex(
    rgb(a).map(
      (channel, index) => channel * (1 - weight) + rgb(b)[index] * weight,
    ) as Rgb,
  );
const luminance = (color: string) =>
  rgb(color)
    .map((channel) => {
      const value = channel / 255;
      return value <= 0.04045
        ? value / 12.92
        : ((value + 0.055) / 1.055) ** 2.4;
    })
    .reduce(
      (sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index],
      0,
    );

export const colorContrast = (a: string, b: string) =>
  (Math.max(luminance(a), luminance(b)) + 0.05) /
  (Math.min(luminance(a), luminance(b)) + 0.05);

/** Preserve the theme hue while making a foreground/background pair readable. */
export function readableTone(
  color: string,
  background: string,
  minimum = 4.5,
): string {
  if (colorContrast(color, background) >= minimum) return color;
  const target =
    colorContrast("#000000", background) > colorContrast("#ffffff", background)
      ? "#000000"
      : "#ffffff";
  for (let step = 1; step <= 50; step++) {
    const candidate = mix(color, target, step / 50);
    if (colorContrast(candidate, background) >= minimum) return candidate;
  }
  return target;
}

/** Solid controls need their own foreground; inverse body text is insufficient. */
export function getActionColors(
  accent: string,
  surface: string,
  darkText = "#141413",
  hover?: string,
) {
  const background = toChatThemeHex(accent, "#2563eb");
  let foreground =
    colorContrast(darkText, background) > colorContrast("#ffffff", background)
      ? darkText
      : "#ffffff";
  if (colorContrast(foreground, background) < 4.5) foreground = "#000000";
  const shade = foreground === "#ffffff" ? "#141413" : "#ffffff";
  return {
    background,
    foreground,
    hover: readableTone(
      toChatThemeHex(hover, mix(background, shade, 0.1)),
      foreground,
    ),
    active: readableTone(mix(background, shade, 0.18), foreground),
    link: readableTone(background, surface),
  };
}
