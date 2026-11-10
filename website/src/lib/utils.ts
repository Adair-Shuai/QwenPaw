import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Shared section heading styles
export const sectionStyles = {
  // Main section title (e.g., "Do it yourself, done easily.")
  title:
    "font-inter text-3xl font-semibold leading-[1.2] tracking-[-0.035em] text-(--color-text) md:text-4xl",
  // Section subtitle/description
  subtitle:
    "font-inter text-sm leading-relaxed text-(--color-text-tertiary) md:text-base",
} as const;
