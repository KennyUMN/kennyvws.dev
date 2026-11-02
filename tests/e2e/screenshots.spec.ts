import { expect, test } from "@playwright/test";

const widths = [320, 768, 1024, 1440];
// Long enough for the slowest scroll-triggered sequence (the FinRAG steps) to finish.
const SETTLE_MS = 2000;

// Scroll through the page so every scroll-triggered reveal fires before capturing.
async function revealAll(page: import("@playwright/test").Page) {
  await expect(page.getByTestId("sobel-headline")).toHaveAttribute("data-state", "live", { timeout: 15_000 });
  await page.evaluate(async () => {
    for (let y = 0; y <= document.body.scrollHeight; y += 400) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  });
  await page.waitForTimeout(SETTLE_MS);
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
