import { test } from "@playwright/test";

const widths = [320, 768, 1024, 1440];

// Scroll through the page so whileInView reveals fire before capturing.
async function revealAll(page: import("@playwright/test").Page) {
  await page.evaluate(async () => {
    for (let y = 0; y <= document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(800);
}

for (const theme of ["light", "dark"] as const) {
  test.describe(`${theme} theme`, () => {
    test.use({ colorScheme: theme });
    for (const width of widths) {
      test(`full page @ ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto("/");
        await revealAll(page);
        await page.screenshot({
          path: `screenshots/${theme}-${width}.png`,
          fullPage: true,
        });
      });
    }
  });
}
