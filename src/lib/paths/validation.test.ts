import { describe, expect, it } from "vitest";
import type { Block, Lesson, Module } from "@/lib/lessons/types";
import type { LearningPath, PathBundle, PathItem, Stage } from "./types";
import { PATH_SCHEMA_VERSION } from "./types";
import { countPathIssues, validatePathForPublish } from "./validation";

function lesson(overrides: Partial<Lesson> = {}): Lesson {
  return {
    id: "les-1",
    tenantId: "school-noord",
    moduleId: null,
    requiresLessonId: null,
    kind: "page",
    title: "Geldige les",
    status: "published",
    isTemplate: false,
    learningObjectives: [],
    blocks: [{ id: "b1", type: "richText", html: "<p>Inhoud</p>" } as Block],
    schemaVersion: 1,
    position: 0,
    createdBy: null,
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function path(overrides: Partial<LearningPath> = {}): LearningPath {
  return {
    id: "path-1",
    tenantId: "school-noord",
    title: "Geldig leerpad",
    description: "",
    status: "draft",
    durationAmount: null,
    durationUnit: null,
    trainerId: null,
    language: "nl",
    sequencing: "free",
    thumbnailKind: "solid",
    thumbnailAssetId: null,
    thumbnailValue: "#1f6feb",
    tagIds: [],
    schemaVersion: PATH_SCHEMA_VERSION,
    position: 0,
    createdBy: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function item(overrides: Partial<PathItem> = {}): PathItem {
  return {
    id: "item-1",
    tenantId: "school-noord",
    pathId: "path-1",
    stageId: null,
    itemKind: "lesson",
    lessonId: "les-1",
    moduleId: null,
    position: 0,
    ...overrides,
  };
}

function bundle(p: LearningPath, items: PathItem[], stages: Stage[] = []): PathBundle {
  return { path: p, items, stages };
}

describe("validatePathForPublish", () => {
  it("rejects a path without items", () => {
    const result = validatePathForPublish({ bundle: bundle(path(), []), lessons: [], modules: [] });
    expect(result.ok).toBe(false);
    expect(result.general.join(" ")).toMatch(/minstens één onderdeel/i);
  });

  it("rejects a missing title and thumbnail", () => {
    const result = validatePathForPublish({
      bundle: bundle(path({ title: "  ", thumbnailKind: null }), [item()]),
      lessons: [lesson()],
      modules: [],
    });
    expect(result.ok).toBe(false);
    expect(result.general.some((e) => /titel/i.test(e))).toBe(true);
    expect(result.general.some((e) => /thumbnail/i.test(e))).toBe(true);
  });

  it("rejects an unpublished referenced lesson", () => {
    const result = validatePathForPublish({
      bundle: bundle(path(), [item()]),
      lessons: [lesson({ status: "draft" })],
      modules: [],
    });
    expect(result.ok).toBe(false);
    expect(result.byLesson["les-1"].join(" ")).toMatch(/niet gepubliceerd/i);
  });

  it("inherits the a11y gate: an image without alt text blocks publishing", () => {
    const imageBlock = { id: "b1", type: "image", assetId: null, url: "x.png", alt: "", caption: "" } as Block;
    const result = validatePathForPublish({
      bundle: bundle(path(), [item()]),
      lessons: [lesson({ blocks: [imageBlock] })],
      modules: [],
    });
    expect(result.ok).toBe(false);
    expect(result.byLesson["les-1"].some((e) => /alt-tekst/i.test(e))).toBe(true);
  });

  it("accepts a complete path with a published, valid lesson", () => {
    const result = validatePathForPublish({
      bundle: bundle(path(), [item()]),
      lessons: [lesson()],
      modules: [],
    });
    expect(result.ok).toBe(true);
    expect(countPathIssues(result)).toBe(0);
  });

  it("flags duplicate positions in sequential mode", () => {
    const lessons = [lesson({ id: "les-1" }), lesson({ id: "les-2" })];
    const items = [
      item({ id: "i1", lessonId: "les-1", position: 0 }),
      item({ id: "i2", lessonId: "les-2", position: 0 }),
    ];
    const result = validatePathForPublish({
      bundle: bundle(path({ sequencing: "sequential" }), items),
      lessons,
      modules: [] as Module[],
    });
    expect(result.ok).toBe(false);
    expect(result.general.some((e) => /unieke posities/i.test(e))).toBe(true);
  });

  it("expands a module item and validates its lessons", () => {
    const lessons = [
      lesson({ id: "ml-1", moduleId: "mod-1", status: "draft" }),
      lesson({ id: "ml-2", moduleId: "mod-1" }),
    ];
    const modules: Module[] = [
      { id: "mod-1", tenantId: "school-noord", courseId: null, title: "Module", summary: "", category: "", coverUrl: null, position: 0, updatedAt: "" },
    ];
    const result = validatePathForPublish({
      bundle: bundle(path(), [item({ itemKind: "module", lessonId: null, moduleId: "mod-1" })]),
      lessons,
      modules,
    });
    expect(result.ok).toBe(false);
    expect(result.byLesson["ml-1"]).toBeDefined();
  });
});
