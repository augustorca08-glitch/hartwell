// Captura rápida de revisión: node scripts/shot.mjs <ruta> <ancho>x<alto> [scrollY...]
// Usa el build de producción en :3200 (npx next start -p 3200). Salida: shots/review/
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const [, , route = "/", size = "1440x900", ...scrolls] = process.argv;
const [width, height] = size.split("x").map(Number);
const out = process.env.OUT_DIR ?? "shots/review";
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: width < 600 ? 2 : 1, isMobile: width < 600, hasTouch: width < 600 });
const logs = [];
page.on("console", (m) => (m.type() === "error" || m.type() === "warning") && logs.push(`${m.type()}: ${m.text()}`));
page.on("pageerror", (e) => logs.push(`pageerror: ${e.message}`));
await page.goto(`http://localhost:3200${route}`, { waitUntil: "networkidle" });
await page.waitForTimeout(2200);
const name = route.replace(/\W+/g, "_").replace(/^_|_$/g, "") || "home";
const positions = scrolls.length ? scrolls.map(Number) : [0];
for (const y of positions) {
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `${out}/${name}-${width}-${y}.png` });
}
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
console.log(JSON.stringify({ overflow, height: await page.evaluate(() => document.documentElement.scrollHeight), logs }, null, 1));
await browser.close();
