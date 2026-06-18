import { describe, expect, it } from "vitest";
import { createSessionContext } from "./access";
import { canViewRawObservations } from "./permissions";
import { users } from "./seed-data";
import { getSchoolLeaderMetrics, getVisibleMaterials, getVisibleObservations, getVisibleProjects } from "./selectors";

function user(id: string) {
  const found = users.find((item) => item.id === id);
  if (!found) throw new Error(`Missing test user ${id}`);
  return createSessionContext(found);
}

describe("tenant and role selectors", () => {
  it("isolates school-scoped projects by tenant", () => {
    const noord = getVisibleProjects(user("u-opleider-noord"));
    const zuid = getVisibleProjects(user("u-opleider-zuid"));

    expect(noord.map((project) => project.tenantId)).toEqual(["school-noord"]);
    expect(zuid.map((project) => project.tenantId)).toEqual(["school-zuid"]);
  });

  it("hides raw observations from school leaders", () => {
    const leader = user("u-leider-noord");

    expect(canViewRawObservations(leader.user.role)).toBe(false);
    expect(getVisibleObservations(leader)).toEqual([]);
    expect(getSchoolLeaderMetrics(leader).map((metric) => metric.label)).not.toContain("Docentenranglijst");
  });

  it("limits teachers to their own/shared lesson materials", () => {
    const teacher = user("u-docent-noord");
    const materials = getVisibleMaterials(teacher);

    expect(materials.every((material) => material.tenantId === "school-noord")).toBe(true);
    expect(materials.some((material) => material.id === "m-zuid-routines")).toBe(false);
  });
});
