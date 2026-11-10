/** Data-only format catalog shared by workspace registration and import UI. */
interface ImportFormat {
  extension: string;
  mimeTypes?: readonly string[];
  previewExtensions?: readonly string[];
  workspacePreview?: boolean;
  companionOnly?: boolean;
  companions?: readonly string[];
}

export const IMPORT_FORMATS = [
  {
    extension: "egrid",
    mimeTypes: ["application/x-eclipse-grid"],
    companions: ["init", "unrst"],
  },
  { extension: "grid", companions: ["init", "unrst"] },
  { extension: "grdecl", companions: ["init", "unrst"] },
  {
    extension: "init",
    mimeTypes: ["application/x-eclipse-init"],
    companionOnly: true,
  },
  {
    extension: "unrst",
    mimeTypes: ["application/x-eclipse-unrst"],
    companionOnly: true,
  },
  { extension: "roff", mimeTypes: ["application/x-roff"] },
  { extension: "roffbin" },
  {
    extension: "dat",
    mimeTypes: ["application/x-cmg-dat"],
    companions: ["dat", "sr3", "irf"],
  },
  {
    extension: "sr3",
    mimeTypes: ["application/x-cmg-sr3"],
    companions: ["dat", "sr3", "irf"],
  },
  { extension: "irf", companionOnly: true },
  {
    extension: "data",
    mimeTypes: ["application/x-tnavigator-data"],
    companions: ["init", "unrst"],
  },
  { extension: "model" },
  { extension: "tnav" },
  { extension: "tpr" },
  { extension: "las", mimeTypes: ["application/x-las"] },
  { extension: "las3" },
  { extension: "dlis", mimeTypes: ["application/x-dlis"] },
  { extension: "vtk", mimeTypes: ["application/vnd.vtk"] },
  { extension: "vtu", mimeTypes: ["application/x-vtu"] },
  { extension: "pvtu", mimeTypes: ["application/x-pvtu"] },
  { extension: "vti" },
  { extension: "xdmf", mimeTypes: ["application/x-xdmf"] },
  // Generic CSV stays in the host table preview; network CSV is opt-in.
  { extension: "csv", workspacePreview: false },
  { extension: "arrow", mimeTypes: ["application/vnd.apache.arrow.file"] },
  { extension: "parquet" },
  {
    extension: "json",
    previewExtensions: ["well.json", "surface.json", "network.json", "json"],
  },
] as const satisfies readonly ImportFormat[];

export type ImportExtension = (typeof IMPORT_FORMATS)[number]["extension"];
const formats: readonly ImportFormat[] = IMPORT_FORMATS;
export const IMPORT_EXTENSIONS: readonly ImportExtension[] = IMPORT_FORMATS.map(
  (format) => format.extension,
);
export const WORKSPACE_PREVIEW_EXTENSIONS = formats
  .filter((format) => format.workspacePreview !== false)
  .flatMap((format) => format.previewExtensions || [format.extension]);
export const WORKSPACE_PREVIEW_MIME_TYPES = formats
  .filter((format) => format.workspacePreview !== false)
  .flatMap((format) => format.mimeTypes || []);
const primaryRank = formats
  .filter((format) => !format.companionOnly)
  .map((format) => format.extension);

export function fileExtension(name: string): string {
  const trimmed = name.trim();
  const dot = trimmed.lastIndexOf(".");
  if (dot < 0 || dot === trimmed.length - 1) return "";
  return trimmed.slice(dot + 1).toLowerCase();
}

export function isImportableFilename(name: string): boolean {
  return (IMPORT_EXTENSIONS as readonly string[]).includes(fileExtension(name));
}

export function fileAcceptAttribute(): string {
  return IMPORT_EXTENSIONS.map((extension) => `.${extension}`).join(",");
}

export function classifyPickedFiles(files: Iterable<File>): {
  primary: File;
  companion?: File;
  extra: File[];
} | null {
  const list = Array.from(files).filter((file) =>
    isImportableFilename(file.name),
  );
  if (!list.length) return null;
  const rank = (file: File) => {
    const index = primaryRank.indexOf(fileExtension(file.name));
    return index < 0 ? 99 : index;
  };
  const ranked = [...list].sort((left, right) => rank(left) - rank(right));
  const primary = ranked[0];
  const extension = fileExtension(primary.name);
  const stem = primary.name.replace(/\.[^.]+$/, "").toLowerCase();
  const companions =
    formats.find((format) => format.extension === extension)?.companions || [];
  const companion = ranked
    .slice(1)
    .find(
      (file) =>
        file.name.replace(/\.[^.]+$/, "").toLowerCase() === stem &&
        fileExtension(file.name) !== extension &&
        companions.includes(fileExtension(file.name)),
    );
  return {
    primary,
    companion,
    extra: ranked.slice(1).filter((file) => file !== companion),
  };
}
