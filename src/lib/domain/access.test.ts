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
  it("isolates school-bound roles (leider/docent) to their own tenant", () => {
    const docentNoord = getVisibleProjects(user("u-docent-noord"));
    const docentZuid = getVisibleProjects(user("u-docent-zuid"));

    expect(docentNoord.map((project) => project.tenantId)).toEqual(["school-noord"]);
    expect(docentZuid.map((project) => project.tenantId)).toEqual(["school-zuid"]);
  });

  it("gives institute staff (opleider/planner/admin) access to all schools", () => {
    const everyTenant = ["school-noord", "school-zuid", "instituut"];
    for (const id of ["u-opleider-noord", "u-planner", "u-admin"]) {
      const visible = new Set(getVisibleProjects(user(id)).map((project) => project.tenantId));
      // Instituutsstaf ziet projecten van meerdere scholen, niet alleen de eigen tenant.
      expect(visible.has("school-noord")).toBe(true);
      expect(visible.has("school-zuid")).toBe(true);
      expect(everyTenant).toEqual(expect.arrayContaining([...visible]));
    }
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
