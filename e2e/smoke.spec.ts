import { expect, test } from "@playwright/test";

test.describe("smoke: rotas", () => {
  test("carrega a rota inicial (Loading) e redireciona", async ({ page }) => {
    await page.goto("/#/");
    await expect(page.locator("#root")).toBeVisible();
    await page.waitForURL(/#\/(home|firstCutscene)/, { timeout: 10_000 });
  });

  test("renderiza cena de exploração /hall/one", async ({ page }) => {
    await page.goto("/#/hall/one");
    await expect(page.locator("#root")).toBeVisible();
    // aguarda o carregamento da cena (mapa/imagens)
    await page.waitForTimeout(2000);
    await expect(page.locator("body")).not.toContainText(
      "Batalha não encontrada",
    );
  });

  test("renderiza batalha /training", async ({ page }) => {
    await page.goto("/#/training");
    await expect(page.locator("#root")).toBeVisible();
    await page.waitForTimeout(2000);
    await expect(page.locator("body")).not.toContainText(
      "Batalha não encontrada",
    );
  });

  test("renderiza batalhas adicionais", async ({ page }) => {
    for (const route of [
      "/#/battle/hungry",
      "/#/battle/goat",
      "/#/battle/piupiu",
    ]) {
      await page.goto(route);
      await expect(page.locator("#root")).toBeVisible();
      await page.waitForTimeout(1500);
      await expect(page.locator("body")).not.toContainText(
        "Batalha não encontrada",
      );
    }
  });

  test("renderiza rotas de exploração adicionais", async ({ page }) => {
    for (const route of [
      "/#/cantina/one",
      "/#/cafeteria/one",
      "/#/library/one",
    ]) {
      await page.goto(route);
      await expect(page.locator("#root")).toBeVisible();
      await page.waitForTimeout(1500);
    }
  });
});
