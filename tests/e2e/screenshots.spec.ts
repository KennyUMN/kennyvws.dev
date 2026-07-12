import { test } from "@playwright/test";

const widths = [320, 768, 1024, 1440];

// Scroll through the page so whileInView reveals fire before capturing.
async function revealAll(page: import("@playwright/test").Page) {
  await page.evaluate(async () => {
    // Neutralize the site's `scroll-behavior: smooth` so each scrollTo lands
    // instantly; rapid smooth scrolls interrupt each other and the
    // IntersectionObserver-driven reveals never fire.
    document.documentElement.style.scrollBehavior = "auto";
    for (let y = 0; y <= document.body.scrollHeight; y += 400) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo({ top: 0, behavior: "instant" });
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
