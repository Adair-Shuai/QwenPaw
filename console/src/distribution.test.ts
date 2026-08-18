import { describe, expect, it } from "vitest";

import {
  CORE_UPDATE_MANIFEST_URL,
  DESKTOP_UPDATE_MANIFEST_URL,
  isUGSciCatalogPlugin,
  UGSCI_DOWNLOAD_BASE_URL,
} from "./distribution";

describe("distribution", () => {
  it("separates core and desktop manifests", () => {
    expect(UGSCI_DOWNLOAD_BASE_URL).toContain("ugsci-download");
    expect(CORE_UPDATE_MANIFEST_URL).toBe(
      `${UGSCI_DOWNLOAD_BASE_URL}/metadata/ugsci-core-latest.json`,
    );
    expect(DESKTOP_UPDATE_MANIFEST_URL).toBe(
      `${UGSCI_DOWNLOAD_BASE_URL}/metadata/qwenpaw-tauri-latest.json`,
    );
  });

  it("classifies UGSci catalog rows by channel or author", () => {
    expect(isUGSciCatalogPlugin({ channel: "ugsci", author: "QwenPaw Team" })).toBe(
      true,
    );
    expect(isUGSciCatalogPlugin({ author: "UGSci Team" })).toBe(true);
    expect(isUGSciCatalogPlugin({ plugin_id: "ulit", author: "Someone Else" })).toBe(
      false,
    );
    expect(
      isUGSciCatalogPlugin({
        plugin_id: "community-app",
        author: "UGSci Team",
        channel: "community",
      }),
    ).toBe(false);
  });
});
