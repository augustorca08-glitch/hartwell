import { expect, test } from "@playwright/test";
import { ready, shotPath } from "./helpers";

test.describe("navegación", () => {
  test("mobile: menú a pantalla completa con foco atrapado y Escape", async ({ page, isMobile }, info) => {
    test.skip(!isMobile, "solo mobile");
    await page.goto("/shop");
    await ready(page);
    const trigger = page.getByRole("button", { name: "Abrir el menú" });
    await trigger.click();
    const menu = page.getByRole("dialog", { name: "Menú" });
    await expect(menu).toBeVisible();
    await page.waitForTimeout(1100);
    await page.screenshot({ path: shotPath(info, "menu-open") });
    await expect(menu.getByRole("button", { name: /Cerrar/ })).toBeFocused();
    const clipped = await menu.locator(".display").evaluateAll((els) => els.filter((e) => e.scrollWidth > e.clientWidth + 1 || e.getBoundingClientRect().right > window.innerWidth).map((e) => e.textContent));
    expect(clipped).toEqual([]);

    for (let i = 0; i < 16; i++) await page.keyboard.press("Tab");
    expect(await menu.evaluate((el) => el.contains(document.activeElement))).toBe(true);

    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(trigger).toBeFocused();

    await trigger.click();
    await menu.getByRole("link", { name: /Outerwear/ }).click();
    await expect(page).toHaveURL(/\/shop\/outerwear/);
    await expect(menu).toBeHidden();
  });

  test("desktop: panel Shop con teclado y Escape", async ({ page, isMobile }, info) => {
    test.skip(isMobile, "solo desktop");
    await page.goto("/about");
    await ready(page);
    const shop = page.getByRole("button", { name: "Shop", exact: true });
    await shop.click();
    await expect(shop).toHaveAttribute("aria-expanded", "true");
    const panel = page.locator("#mega-panel");
    await expect(panel).toBeVisible();
    await panel.getByRole("link", { name: /Trousers/ }).hover();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: shotPath(info, "mega-panel") });
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await shop.click();
    await panel.getByRole("link", { name: /Ver todo el shop/ }).click();
    await expect(page).toHaveURL(/\/shop$/);
  });

  test("skip link visible con teclado y foco visible", async ({ page, isMobile }) => {
    test.skip(isMobile, "teclado físico");
    await page.goto("/");
    await ready(page);
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Saltar al contenido" });
    await expect(skip).toBeFocused();
    expect((await skip.boundingBox())!.y).toBeGreaterThanOrEqual(0);
    await page.keyboard.press("Tab");
    const outline = await page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle);
    expect(outline).not.toBe("none");
  });

  test("bolsa vacía: diálogo accesible y estado diseñado", async ({ page }, info) => {
    await page.goto("/lookbook");
    await ready(page);
    await page.locator("#bag-button").click();
    const drawer = page.getByRole("dialog", { name: /La bolsa/ });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole("button", { name: "Cerrar la bolsa" })).toBeFocused();
    await expect(drawer).toContainText("La bolsa está vacía.");
    await page.waitForTimeout(800);
    await page.screenshot({ path: shotPath(info, "bag-empty") });
    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
  });

  test("transición entre páginas: velo con monograma que desaparece", async ({ page }) => {
    await page.goto("/about");
    await ready(page);
    await page.locator("footer").getByRole("link", { name: "Lookbook" }).click();
    await expect(page).toHaveURL(/lookbook/);
    await expect(page.locator("[data-veil]")).toHaveCount(1);
    await expect(page.locator("[data-veil]")).toHaveCSS("opacity", "0", { timeout: 4000 });
  });
});

test.describe("hover", () => {
  test("desktop: índice de categorías cambia la lámina", async ({ page, isMobile }, info) => {
    test.skip(isMobile, "solo puntero fino");
    await page.goto("/");
    await ready(page);
    const section = page.locator("section[aria-labelledby=wardrobe-title]");
    const row = section.getByRole("link", { name: /Knitwear/ }).first();
    await row.scrollIntoViewIfNeeded();
    await row.hover();
    await page.waitForTimeout(1300);
    await expect(section.locator("img[src*='knitwear']:visible").first()).toBeVisible();
    await page.screenshot({ path: shotPath(info, "category-hover") });
  });
});

test.describe("hero con video", () => {
  test("sin hero.mp4: usa el poster, no pide el video y ofrece LCP prioritario", async ({ page }) => {
    const videoRequests: string[] = [];
    page.on("request", (r) => r.url().includes("/videos/hero") && r.url().endsWith(".mp4") && videoRequests.push(r.url()));
    await page.goto("/", { waitUntil: "networkidle" });
    await ready(page);
    await page.waitForTimeout(2000);
    const poster = page.locator("section[aria-labelledby=hero-title] picture img").first();
    await expect(poster).toHaveAttribute("fetchpriority", "high");
    expect(await poster.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
    expect(videoRequests).toEqual([]);
    await expect(page.getByText("Video placeholder")).toHaveCount(0);
  });

  test("mobile usa el recorte vertical del poster", async ({ page, isMobile }) => {
    test.skip(!isMobile, "solo mobile");
    await page.goto("/", { waitUntil: "networkidle" });
    const src = await page.locator("section[aria-labelledby=hero-title] picture img").first().evaluate((i: HTMLImageElement) => i.currentSrc);
    expect(decodeURIComponent(src)).toContain("hero-poster-mobile");
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("hero estático, lookbook sin secuestro de scroll, sin velo", async ({ page, isMobile }, info) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await ready(page);
    const hero = page.locator("section[aria-labelledby=hero-title]");
    const vh = page.viewportSize()!.height;
    const h = (await hero.boundingBox())!.height;
    expect(Math.abs(h - Math.max(vh, 600))).toBeLessThan(4);
    await page.screenshot({ path: shotPath(info, "home-reduced-motion") });

    if (!isMobile) await expect(page.getByRole("region", { name: /Fotos del lookbook/ })).toBeVisible();

    const running = await page.evaluate(() => document.getAnimations().filter((a) => a.effect?.getTiming().iterations === Infinity && a.playState === "running").length);
    expect(running).toBe(0);

    await page.locator("footer").getByRole("link", { name: "Lookbook" }).click();
    await expect(page).toHaveURL(/lookbook/);
    await expect(page.locator("[data-veil]")).toHaveCount(0);
  });
});
