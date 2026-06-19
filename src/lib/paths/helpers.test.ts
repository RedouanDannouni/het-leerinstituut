import { describe, expect, it } from "vitest";
import type { Block, Lesson } from "@/lib/lessons/types";
import { flattenPathLessons, formatDuration, itemChapterCount, orderedItems } from "./helpers";
import type { LearningPath, PathBundle, PathItem, Stage } from "./types";
import { PATH_SCHEMA_VERSION } from "./types";

function lesson(id: string, moduleId: string | null, position: number): Lesson {
  return {
    id,
    tenantId: "school-noord",
    moduleId,
    requiresLessonId: null,
    kind: "page",
    title: id,
    status: "published",
    isTemplate: false,
    learningObjectives: [],
    blocks: [{ id: `${id}-b`, type: "richText", html: "" } as Block],
    schemaVersion: 1,
    position,
    createdBy: null,
    updatedAt: "",
  };
}

function basePath(overrides: Partial<LearningPath> = {}): LearningPath {
  return {
    id: "path-1",
    tenantId: "school-noord",
    title: "Pad",
    description: "",
    status: "draft",
    durationAmount: null,
    durationUnit: null,
    trainerId: null,
    language: "nl",
    sequencing: "free",
    thumbnailKind: null,
    thumbnailAssetId: null,
    thumbnailValue: null,
    tagIds: [],
    schemaVersion: PATH_SCHEMA_VERSION,
    position: 0,
    createdBy: null,
    createdAt: "",
    updatedAt: "",
    ...overrides,
  };
}

function pathItem(over: Partial<PathItem>): PathItem {
  return {
    id: "i",
    tenantId: "school-noord",
    pathId: "path-1",
    stageId: null,
    itemKind: "lesson",
    lessonId: null,
    moduleId: null,
    position: 0,
    ...over,
  };
}

describe("orderedItems", () => {
  it("orders ungrouped items first, then by stage position and item position", () => {
    const stages: Stage[] = [
      { id: "s1", tenantId: "school-noord", pathId: "path-1", title: "Junior", position: 0 },
      { id: "s2", tenantId: "school-noord", pathId: "path-1", title: "Senior", position: 1 },
    ];
    const items: PathItem[] = [
      pathItem({ id: "a", stageId: "s2", position: 0 }),
      pathItem({ id: "b", stageId: null, position: 5 }),
      pathItem({ id: "c", stageId: "s1", position: 1 }),
      pathItem({ id: "d", stageId: "s1", position: 0 }),
    ];
    const bundle: PathBundle = { path: basePath(), items, stages };
    expect(orderedItems(bundle).map((i) => i.id)).toEqual(["b", "d", "c", "a"]);
  });
});

describe("flattenPathLessons", () => {
  it("expands modules into their ordered lessons", () => {
    const lessons: Lesson[] = [
      lesson("standalone", null, 0),
      lesson("mod-l2", "mod-1", 1),
      lesson("mod-l1", "mod-1", 0),
    ];
    const items: PathItem[] = [
      pathItem({ id: "i1", itemKind: "lesson", lessonId: "standalone", position: 0 }),
      pathItem({ id: "i2", itemKind: "module", moduleId: "mod-1", position: 1 }),
    ];
    const bundle: PathBundle = { path: basePath(), items, stages: [] };
    expect(flattenPathLessons(bundle, lessons)).toEqual(["standalone", "mod-l1", "mod-l2"]);
  });
});

describe("itemChapterCount", () => {
  it("counts blocks for a lesson and lessons for a module", () => {
    const lessons: Lesson[] = [lesson("l1", "mod-1", 0), lesson("l2", "mod-1", 1)];
    const lessonItem = pathItem({ itemKind: "lesson", lessonId: "l1" });
    const moduleItem = pathItem({ itemKind: "module", moduleId: "mod-1" });
    expect(itemChapterCount(lessonItem, lessons)).toBe(1);
    expect(itemChapterCount(moduleItem, lessons)).toBe(2);
  });
});

describe("formatDuration", () => {
  it("formats a structured duration", () => {
    expect(formatDuration(basePath({ durationAmount: 3, durationUnit: "weeks" }))).toBe("3 weken");
  });
  it("returns null when incomplete", () => {
    expect(formatDuration(basePath({ durationAmount: null, durationUnit: "weeks" }))).toBeNull();
  });
});