import type { SkillSpec } from "../../../api/types/skill";
import { normalizeCommandPrefix } from "../../../utils/commandPrefix";

const CONSOLE_CHANNEL = "console";

export interface SkillSuggestion {
  command: string;
  value: string;
  description: string;
}

export function normalizeCommandName(value: string): string {
  const normalized = normalizeCommandPrefix(value).trim();
  const body = normalized.startsWith("/") ? normalized.slice(1) : normalized;
  if (body.startsWith("[")) {
    const close = body.indexOf("]");
    if (close > 1) return body.slice(1, close).trim().toLowerCase();
  }
  return body.split(/\s/, 1)[0].toLowerCase();
}

export function extractLeadingCommandName(text: string): string | null {
  const normalized = normalizeCommandPrefix(text).trimStart();
  if (!normalized.startsWith("/")) return null;
  return normalizeCommandName(normalized) || null;
}

export function extractPotentialSkillName(
  text: string,
  nonSkillCommandNames: Iterable<string>,
): string | null {
  const leadingCommand = extractLeadingCommandName(text);
  if (!leadingCommand) return null;
  const commands = new Set([...nonSkillCommandNames].map(normalizeCommandName));
  return commands.has(leadingCommand) ? null : leadingCommand;
}

export function isSkillAvailableInConsole(skill: SkillSpec): boolean {
  if (skill.enabled !== true) return false;
  const channels = skill.channels?.length ? skill.channels : ["all"];
  return channels.includes("all") || channels.includes(CONSOLE_CHANNEL);
}

export function buildSkillSuggestions(
  skills: SkillSpec[],
  reservedCommandNames: ReadonlySet<string>,
  loopCommandNames: ReadonlySet<string>,
): SkillSuggestion[] {
  const reserved = new Set([...reservedCommandNames].map(normalizeCommandName));
  const loopCommands = new Set([...loopCommandNames].map(normalizeCommandName));
  return skills
    .filter(isSkillAvailableInConsole)
    .filter((skill) => {
      const normalizedName = normalizeCommandName(skill.name);
      return !reserved.has(normalizedName) && !loopCommands.has(normalizedName);
    })
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((skill) => ({
      command: `/${skill.name}`,
      value: skill.name,
      description: "",
    }));
}
