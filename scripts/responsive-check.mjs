#!/usr/bin/env node
/**
 * Quick responsive smoke test.
 *
 * Visits a set of key routes at mobile / tablet / desktop breakpoints using
 * Playwright (Chromium). For each combination it checks:
 *   - page renders without console errors
 *   - no horizontal overflow (document.scrollWidth <= viewport + tolerance)
 *   - a screenshot is saved to ./responsive-report/
 *
 * Usage:
 *   BASE_URL=http://localhost:3000 node scripts/responsive-check.mjs
 *   BASE_URL=https://setgames.lovable.app node scripts/responsive-check.mjs
 *
 * Requires: `bun add -d playwright` and `bunx playwright install chromium`
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = path.resolve("responsive-report");

const ROUTES = ["/", "/epic", "/steam", "/gog", "/prime", "/itch", "/xbox", "/discord", "/guias", "/cultura", "/sobre"];
const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 820, height: 1180 },
  { name: "desktop", width: 1440, height: 900 },
];

const TOLERANCE = 2; // px of acceptable overflow (scrollbars, sub-pixel)

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const failures = [];

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await ctx.newPage();

  const consoleErrors = [];
  page.on("pageerror", (e) => consoleErrors.push(`pageerror: ${e.message}`));
  page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(`console: ${msg.text()}`); });

  for (const route of ROUTES) {
    consoleErrors.length = 0;
    const url = new URL(route, BASE).toString();
    const label = `${vp.name}${route.replace(/\//g, "_") || "_home"}`;
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      await page.screenshot({ path: path.join(OUT, `${label}.png`), fullPage: false });
      const status = overflow > TOLERANCE ? `OVERFLOW +${overflow}px` : "ok";
      const errs = consoleErrors.length ? `errors=${consoleErrors.length}` : "";
      console.log(`[${vp.name} ${vp.width}x${vp.height}] ${route}  ${status} ${errs}`.trim());
      if (overflow > TOLERANCE) failures.push(`${vp.name} ${route}: overflow ${overflow}px`);
      if (consoleErrors.length) failures.push(`${vp.name} ${route}: ${consoleErrors.join(" | ")}`);
    } catch (e) {
      failures.push(`${vp.name} ${route}: ${e.message}`);
      console.error(`[${vp.name}] ${route}  FAILED: ${e.message}`);
    }
  }
  await ctx.close();
}

await browser.close();
console.log(`\nScreenshots: ${OUT}`);
if (failures.length) {
  console.error(`\n${failures.length} issue(s):\n - ${failures.join("\n - ")}`);
  process.exit(1);
}
console.log("All viewports passed.");
