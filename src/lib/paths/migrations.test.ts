import { describe, expect, it } from "vitest";
import { migratePath } from "./migrations";
import { PATH_SCHEMA_VERSION, type LearningPath } from "./types";

function legacyPath(schemaVersion: number): LearningPath {
  return {
    id: "path-1",
    tenantId: "school-noord",
    title: "Pad",
    description: "Beschrijving",
    status: "published",
    durationAmount: 2,
    durationUnit: "weeks",
    trainerId: null,
    language: "nl",
    sequencing: "sequential",
    thumbnailKind: "solid",
    thumbnailAssetId: null,
    thumbnailValue: "#1f6feb",
    tagIds: ["t1"],
    schemaVersion,
    position: 3,
    createdBy: null,
    createdAt: "",
    updatedAt: "",
  };
}

describe("migratePath", () => {
  it("upgrades the schema_version to the current version", () => {
    const migrated = migratePath(legacyPath(0));
    expect(migrated.schemaVersion).toBe(PATH_SCHEMA_VERSION);
  });

  it("preserves the existing structure during migration", () => {
    const migrated = migratePath(legacyPath(1));
    expect(migrated.title).toBe("Pad");
    expect(migrated.sequencing).toBe("sequential");
    expect(migrated.tagIds).toEqual(["t1"]);
    expect(migrated.position).toBe(3);
  });
});
