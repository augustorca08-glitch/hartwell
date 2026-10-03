import { expect, test } from "@playwright/test";
import { ROUTES, expectNoHorizontalOverflow, scrollThrough, shotPath, watchPage } from "./helpers";

for (const route of ROUTES) {
  test.describe(`página ${route.name}`, () => {
    test("carga sin errores, sin overflow, con imágenes y fuentes", async ({ page }, info) => {
      const w = watchPage(page);
      const res = await page.goto(route.path, { waitUntil: "networkidle" });
      expect(res?.status()).toBe(route.status ?? 200);

      await expect(page.locator("h1")).toHaveCount(1);
      await page.screenshot({ path: shotPath(info, route.name) });

      await scrollThrough(page);
      await page.waitForLoadState("networkidle");
      await expectNoHorizontalOverflow(page);

      // Ninguna imagen rota
      const broken = await page.evaluate(() =>
        [...document.images].filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.currentSrc || img.src),
      );
      expect(broken, "imágenes rotas").toEqual([]);

      // Fuentes de la marca cargadas (self-hosted por next/font)
      const fonts = await page.evaluate(async () => {
        await document.fonts.ready;
        return [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family);
      });
      expect(fonts.some((f) => f.startsWith("Cormorant Garamond"))).toBe(true);
      expect(fonts.some((f) => f.startsWith("Libre Franklin"))).toBe(true);

      expect(w.errors, "errores de consola").toEqual([]);
      expect(w.failed, "requests fallidos").toEqual([]);
    });
  });
}

test("home: screenshot de página completa", async ({ page }, info) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await scrollThrough(page);
  await page.screenshot({ path: shotPath(info, "home-full"), fullPage: true });
});

test("links internos responden 200", async ({ page, request }) => {
  const seen = new Set<string>();
  for (const path of ["/", "/shop", "/product/hartwell-wool-blazer", "/about", "/lookbook", "/collection/estate-summer"]) {
    await page.goto(path);
    const hrefs = await page.$$eval("a[href^='/']", (as) => as.map((a) => a.getAttribute("href")!));
    hrefs.forEach((h) => seen.add(h.split("#")[0]));
  }
  const bad: string[] = [];
  for (const href of seen) {
    const r = await request.get(href);
    if (r.status() !== 200) bad.push(`${r.status()} ${href}`);
  }
  expect(bad).toEqual([]);
  expect(seen.size).toBeGreaterThan(30);
});

test("links externos abren en pestaña nueva con rel seguro", async ({ page }) => {
  for (const path of ["/about", "/"]) {
    await page.goto(path);
    const unsafe = await page.$$eval("a[target=_blank]", (as) => (as as HTMLAnchorElement[]).filter((a) => !/noopener/.test(a.rel)).map((a) => a.href));
    expect(unsafe).toEqual([]);
  }
});

test("sin rayas largas (em dash) en el copy visible", async ({ page }) => {
  for (const path of ["/", "/about", "/lookbook", "/product/heritage-cable-sweater", "/collection/estate-summer"]) {
    await page.goto(path);
    const text = await page.evaluate(() => document.body.innerText);
    expect(text.includes("—"), `em dash en ${path}`).toBe(false);
  }
});
