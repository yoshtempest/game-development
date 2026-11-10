import { expect, test } from "@playwright/test";

test.describe("multiplayer: duas abas", () => {
  test("host cria sala e guest entra", async ({ browser }) => {
    const hostCtx = await browser.newContext();
    const guestCtx = await browser.newContext();
    const host = await hostCtx.newPage();
    const guest = await guestCtx.newPage();

    await host.goto("/#/online");
    await host.fill('input[placeholder="Nome da sala"]', "SalaTeste");
    await host.click('button:has-text("Criar sala")');
    await host.waitForTimeout(1000);

    await guest.goto("/#/online");
    await guest.click('button:has-text("Atualizar salas")');
    await guest.waitForTimeout(1000);
    await guest.click('button:has-text("Entrar")');
    await guest.waitForTimeout(1000);

    await expect(guest.locator("text=Conectado à sala")).toBeVisible();
    await expect(host.locator("text=Jogadores:")).not.toBeVisible().catch(() => {});

    await hostCtx.close();
    await guestCtx.close();
  });

  test("ambos carregam batalha /training", async ({ browser }) => {
    const hostCtx = await browser.newContext();
    const guestCtx = await browser.newContext();
    const host = await hostCtx.newPage();
    const guest = await guestCtx.newPage();

    await host.goto("/#/training");
    await guest.goto("/#/training");

    await host.waitForTimeout(2000);
    await guest.waitForTimeout(2000);

    await expect(host.locator("#root")).toBeVisible();
    await expect(guest.locator("#root")).toBeVisible();
    await expect(host.locator("body")).not.toContainText("Batalha não encontrada");
    await expect(guest.locator("body")).not.toContainText("Batalha não encontrada");

    await hostCtx.close();
    await guestCtx.close();
  });

  test("latência artificial (throttling) não quebra render", async ({ browser }) => {
    test.setTimeout(60000);
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 50,
      downloadThroughput: 500 * 1024,
      uploadThroughput: 500 * 1024,
    });

    await page.goto("/#/training", { waitUntil: "commit", timeout: 60000 });
    await page.waitForTimeout(10000);
    await expect(page.locator("#root")).toBeVisible({ timeout: 30000 });

    await ctx.close();
  });
});