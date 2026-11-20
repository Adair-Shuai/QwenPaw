import type { TurnFileManifest } from "../../api/modules/turnFiles";

const REQUIRED_VERSIONS = {
  created: ["after"],
  modified: ["before", "after"],
  deleted: ["before"],
  delivered: ["after"],
} as const;
const SIZE_WARNING = "File exceeds snapshot size limit: ";
const SCAN_BUDGET_WARNING = "Snapshot byte budget reached";

/** Also normalize records from hosts predating scoped capture diagnostics. */
export function normalizeTurnFileCapture(
  turn: TurnFileManifest,
): TurnFileManifest {
  // Saturated legacy lists can omit additional read or directory-scan failures.
  if (
    turn.status !== "completed" ||
    !turn.warnings?.length ||
    turn.warnings.length >= 100
  )
    return turn;

  const unavailable = new Set(
    turn.files
      .filter((file) =>
        (REQUIRED_VERSIONS[file.status] ?? ["before", "after"]).some(
          (version) => !file[`${version}_available`],
        ),
      )
      .map((file) => file.path),
  );
  const warnings: string[] = [];
  const scanWarnings = [...(turn.scan_warnings ?? [])];
  for (const warning of turn.warnings) {
    const outsideArchive =
      (warning.startsWith(SIZE_WARNING) &&
        !unavailable.has(warning.slice(SIZE_WARNING.length))) ||
      (warning.startsWith(SCAN_BUDGET_WARNING) && unavailable.size === 0);
    if (outsideArchive) scanWarnings.push(warning);
    else warnings.push(warning);
  }
  if (!scanWarnings.length) return turn;
  return {
    ...turn,
    warnings,
    scan_warnings: [...new Set(scanWarnings)],
    incomplete: warnings.length > 0 || unavailable.size > 0,
  };
}
