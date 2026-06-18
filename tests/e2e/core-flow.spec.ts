import { expect, test } from "@playwright/test";

test("schoolopleider can observe, approve an AI concept and open a report", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /inloggen/i }).click();
  await page.getByRole("button", { name: /naar mijn cockpit/i }).click();

  await expect(page.getByRole("heading", { name: /goedemorgen, sanne/i })).toBeVisible();
  await page.getByRole("link", { name: /nieuw lesbezoek/i }).first().click();
  await expect(page.getByRole("heading", { name: /observatieformulier/i })).toBeVisible();

  await page.getByLabel("Vak / groep").fill("Rekenen groep 7");
  const scoreButtons = page.locator(".score-button");
  await scoreButtons.nth(3).click();
  await scoreButtons.nth(6).click();
  await scoreButtons.nth(9).click();
  await scoreButtons.nth(12).click();
  await page.getByLabel("Toelichting").first().fill("Leerlingen kunnen het lesdoel in eigen woorden uitleggen.");

  await expect(page.getByText(/concept opgeslagen om/i)).toBeVisible();
  await page.getByRole("button", { name: /ai-concept genereren/i }).click();
  await expect(page.getByLabel("Bewerkbare samenvatting")).toHaveValue(/AI-concept/);
  await page.getByLabel("Bewerkbare samenvatting").fill("Goedgekeurde samenvatting: de instructie is helder en de vervolgstap is begrip controleren.");
  await page.getByRole("button", { name: /^goedkeuren$/i }).click();
  await expect(page.getByRole("link", { name: /rapport maken/i })).toBeVisible();

  await page.getByRole("link", { name: /rapport maken/i }).click();
  await expect(page.locator("header").getByRole("heading", { name: /gespreksrapport/i })).toBeVisible();
  await expect(page.getByLabel("Live rapportpreview")).toContainText("Goedgekeurde samenvatting");
  await expect(page.getByLabel("Live rapportpreview")).toContainText("geen docent-ranking");

  const pdfDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: /^pdf$/i }).click();
  await expect((await pdfDownload).suggestedFilename()).toMatch(/gespreksrapport.*\.pdf$/);

  const pptxDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: /^pptx$/i }).click();
  await expect((await pptxDownload).suggestedFilename()).toMatch(/gespreksrapport.*\.pptx$/);
});

test("schoolleider sees aggregates and no raw observation data", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    window.localStorage.setItem("hli.active-user-id", "u-leider-noord");
    window.localStorage.setItem("hli.onboarding-complete", "true");
  });
  await page.goto("/app/cockpit");

  await expect(page.getByRole("heading", { name: /goedemorgen, murat/i })).toBeVisible();
  await expect(page.getByText(/geen ruwe observatiedata en geen ranglijst/i)).toBeVisible();
  await expect(page.getByText(/gemiddelde leskwaliteit/i)).toBeVisible();
  await expect(page.getByRole("navigation")).not.toContainText("Observaties");

  await page.goto("/app/observations");
  await expect(page.getByRole("heading", { name: /observaties zijn afgeschermd/i })).toBeVisible();
});

test("admin can reach management and audit surfaces", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    window.localStorage.setItem("hli.active-user-id", "u-admin");
    window.localStorage.setItem("hli.onboarding-complete", "true");
  });
  await page.goto("/app/admin");

  await expect(page.getByRole("heading", { name: /omgevingen, gebruikers en templates/i })).toBeVisible();
  await page.getByRole("link", { name: /open auditlog/i }).click();
  await expect(page.getByRole("heading", { name: /auditlog/i })).toBeVisible();
  await expect(page.getByText(/rapport geëxporteerd/i)).toBeVisible();
});
