import { LESSON_SCHEMA_VERSION, type Block } from "./types";

/**
 * Migreert een blokken-array van een oudere schema-versie naar de huidige.
 * Bij elke wijziging aan een blok-vorm bump je LESSON_SCHEMA_VERSION en voeg
 * je hier een stap toe. Zo blijven bestaande lessen werken.
 */
export function migrateBlocks(blocks: unknown, fromVersion: number): Block[] {
  let current = Array.isArray(blocks) ? (blocks as Block[]) : [];
  let version = fromVersion;

  // Voorbeeld van toekomstige migratiestap:
  // if (version < 2) { current = current.map(stepV1toV2); version = 2; }

  void version;
  return current.filter((block) => block && typeof block === "object" && "type" in block);
}

export function ensureCurrentSchema(blocks: unknown, fromVersion: number): { blocks: Block[]; version: number } {
  return { blocks: migrateBlocks(blocks, fromVersion), version: LESSON_SCHEMA_VERSION };
}
