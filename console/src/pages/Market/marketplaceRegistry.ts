import type React from "react";
import type { Disposable } from "../../plugins/registry/types";

export interface MarketplaceExtension {
  id: string;
  label: string;
  component: React.ComponentType;
  order?: number;
}

interface MarketplaceExtensionEntry {
  pluginId: string;
  extension: MarketplaceExtension;
  registrationId: number;
}

class MarketplaceExtensionRegistry {
  private entries: MarketplaceExtensionEntry[] = [];
  private cachedSnapshot: MarketplaceExtension[] = [];
  private listeners = new Set<() => void>();
  private nextRegistrationId = 1;

  add(pluginId: string, extension: MarketplaceExtension): Disposable {
    const existing = this.entries.find(
      (entry) => entry.extension.id === extension.id,
    );
    if (existing) {
      console.warn(
        `[Marketplace] Extension "${extension.id}" already registered by ${existing.pluginId}.`,
      );
      return { dispose: () => {} };
    }

    const entry: MarketplaceExtensionEntry = {
      pluginId,
      extension,
      registrationId: this.nextRegistrationId++,
    };
    this.entries = [...this.entries, entry];
    this.notify();

    return {
      dispose: () => {
        const index = this.entries.findIndex(
          (candidate) => candidate.registrationId === entry.registrationId,
        );
        if (index === -1) return;
        this.entries = this.entries.filter(
          (candidate) => candidate.registrationId !== entry.registrationId,
        );
        this.notify();
      },
    };
  }

  get(id: string): MarketplaceExtension | undefined {
    return this.entries.find((entry) => entry.extension.id === id)?.extension;
  }

  removeBySource(pluginId: string): void {
    const remaining = this.entries.filter(
      (entry) => entry.pluginId !== pluginId,
    );
    if (remaining.length === this.entries.length) return;
    this.entries = remaining;
    this.notify();
  }

  snapshot(): MarketplaceExtension[] {
    return this.cachedSnapshot;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.cachedSnapshot = [...this.entries]
      .sort((a, b) => (a.extension.order ?? 0) - (b.extension.order ?? 0))
      .map((entry) => entry.extension);
    this.listeners.forEach((listener) => listener());
  }
}

export const marketplaceExtensionRegistry = new MarketplaceExtensionRegistry();
