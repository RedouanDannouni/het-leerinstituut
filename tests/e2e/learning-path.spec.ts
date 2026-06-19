import { expect, test } from "@playwright/test";

test("schoolopleider bouwt een leerpad via de wizard en de publiceer-poort blokkeert bij een ongepubliceerde les", async ({ page }) => {
  // Demo-login als Sanne (schoolopleider) via het inlogformulier.
  await page.goto("/login");
  await page.getByLabel("E-mailadres").fill("sanne@leerinstituut.test");
  await page.getByRole("button", { name: /^inloggen$/i }).click();
  await page.getByRole("button", { name: /naar mijn cockpit/i }).click();
  await expect(page.getByRole("heading", { name: /goedemorgen, sanne/i })).toBeVisible();

  await page.goto("/app/materials");
  await expect(page.getByRole("heading", { name: /lesmateriaal/i })).toBeVisible({ timeout: 30_000 });

  // Instappunt: "Create new content" -> Leerpad
  await page.getByRole("button", { name: /nieuwe content/i }).click();
  await expect(page.getByRole("heading", { name: /wat wil je maken/i })).toBeVisible();
  await page.getByRole("button", { name: /leerpad/i }).click();

  // Stap 1 — Overzicht
  await expect(page.getByLabel("Titel")).toBeVisible({ timeout: 15_000 });
  await page.getByLabel("Titel").fill("E2E leerpad");

  // Thumbnail kiezen (verplicht voor publiceren) — gallery-illustratie
  await page.getByRole("button", { name: /thumbnail kiezen/i }).click();
  await page.getByRole("button", { name: "Studie" }).click();
  await page.getByRole("button", { name: /^opslaan$/i }).click();

  // Naar stap 2
  await page.getByRole("button", { name: /^verder$/i }).click();
  await expect(page.getByRole("heading", { name: "Onderdelen" })).toBeVisible();

  // Voeg een nieuwe pagina toe en zet op sequentieel
  await page.getByRole("button", { name: /^pagina$/i }).click();
  await expect(page.getByText(/naamloze pagina/i)).toBeVisible();
  await page.getByRole("button", { name: /^sequentieel$/i }).click();

  // Publiceren faalt: de onderliggende les is nog concept
  await page.getByRole("button", { name: /publiceren/i }).first().click();
  await expect(page.getByText(/aandachtspunt/i)).toBeVisible();
  await expect(page.getByText(/niet gepubliceerd/i)).toBeVisible();

  // Wacht tot de metadata (titel/thumbnail) is weggeschreven vóór de preview.
  await expect(page.getByText(/opgeslagen/i)).toBeVisible({ timeout: 10_000 });

  // Bekijk als leerling
  await page.getByRole("link", { name: /als leerling/i }).click();
  await expect(page.getByRole("heading", { name: "E2E leerpad" })).toBeVisible();
  await expect(page.getByText(/afgerond/i)).toBeVisible();
});
