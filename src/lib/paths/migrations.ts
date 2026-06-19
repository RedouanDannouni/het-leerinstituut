import { PATH_SCHEMA_VERSION, type LearningPath } from "./types";

/**
 * Migreert een leerpad-structuur van een oudere schema-versie naar de huidige.
 * Bump PATH_SCHEMA_VERSION en voeg hier een stap toe bij elke structuurwijziging,
 * net als migrateBlocks() voor lessen. Draait bij elke lees-actie.
 */
export function migratePath(path: LearningPath): LearningPath {
  let current = path;
  let version = path.schemaVersion ?? 1;

  // Voorbeeld van een toekomstige migratiestap:
  // if (version < 2) { current = { ...current, /* ... */ }; version = 2; }

  void version;
  return { ...current, schemaVersion: PATH_SCHEMA_VERSION };
}
