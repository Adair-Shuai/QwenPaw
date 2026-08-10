/**
 * Rendering-engine registry.
 *
 * The viewer runtime depends on this small contract instead of reaching into
 * a global runtime object.  Alternative engines can register beside Three.js
 * without changing the workspace adapter or command bridge.
 */

import type { EngineHandle, EngineMountOptions, RenderingEngine } from "./base";

type EngineFactory = (options: EngineMountOptions) => EngineHandle;

const factories = new Map<string, EngineFactory>();

export function registerEngineFactory(id: string, factory: EngineFactory): void {
  if (!id.trim()) throw new Error("Rendering engine id must not be empty");
  factories.set(id, factory);
}

export function createRegisteredEngine(
  engine: RenderingEngine,
  options: EngineMountOptions,
): EngineHandle {
  const factory = factories.get(engine.id);
  if (!factory) {
    throw new Error(`Rendering engine is not registered: ${engine.id}`);
  }
  return factory(options);
}

export function clearEngineFactories(): void {
  factories.clear();
}
