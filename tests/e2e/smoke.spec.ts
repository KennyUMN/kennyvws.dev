import { expect, test } from "@playwright/test";
import { site } from "../../src/data/site";
import { projects } from "../../src/data/projects";

test("hero H1 is the pitch from site data", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(site.pitch);
  await expect(page.getByText("Open to AI Engineer roles").first()).toBeVisible();
});

test("the hero lens runs a real edge filter over the headline and follows the pointer", async ({ page }) => {
  await page.goto("/");
  const headline = page.getByTestId("sobel-headline");
  await expect(headline).toHaveAttribute("data-state", "live", { timeout: 15_000 });
  await expect(page.getByText(/M pixels in [\d.]+ ms/)).toBeVisible();

  const readout = headline.getByText(/% edge px/);
  const atRest = Number((await readout.innerText()).replace(/[^\d.]/g, ""));
  expect(atRest).toBeGreaterThan(0);

  const box = (await page.getByRole("heading", { level: 1 }).boundingBox())!;
  const lens = readout.locator("xpath=..");
  const before = await lens.evaluate((el) => getComputedStyle(el).transform);
  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.85, { steps: 6 });
  await expect.poll(() => lens.evaluate((el) => getComputedStyle(el).transform)).not.toBe(before);
});

test("nav anchor scrolls to the work section", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Work" }).click();
  await expect(page).toHaveURL(/#work$/);
  await expect(page.locator("#work")).toBeInViewport();
});

test("résumé links point at the PDF", async ({ page }) => {
  await page.goto("/");
  for (const link of await page.getByRole("link", { name: "Résumé" }).all()) {
    await expect(link).toHaveAttribute("href", site.resume);
  }
});

test.describe("theme", () => {
  test.use({ colorScheme: "light" });

  test("toggle switches to dark and persists across reload", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("theme-toggle").first().click();
    await expect(page.locator("html")).toHaveClass(/dark/);
    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/);
  });
});

test("work lists every project, leading with the PPE case study", async ({ page }) => {
  await page.goto("/");
  const entries = page.locator("#work article");
  await expect(entries).toHaveCount(projects.length);
  await expect(entries.first()).toContainText("Semi-Supervised PPE Detection");
  await expect(entries.first()).toContainText("+0.128");
});

test("the training curve has a full table view of the real log", async ({ page }) => {
  await page.goto("/");
  const work = page.locator("#work");
  await work.getByText("View as table").click();
  await expect(work.locator("table tbody tr")).toHaveCount(50);
  await expect(work.locator("table tbody tr").last()).toContainText("0.614");
});

test("the page closes with the POV statement and one email action", async ({ page }) => {
  await page.goto("/");
  const contact = page.locator("#contact");
  await expect(contact.getByRole("heading", { level: 2 })).toHaveText(
    "Clean the data. Fight the training run. Ship the server.",
  );
  await expect(contact.getByRole("link", { name: new RegExp(site.email) })).toHaveAttribute(
    "href",
    `mailto:${site.email}`,
  );
});

test.describe("mobile menu focus trap", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("traps focus while open and releases it on escape", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("header");
    const menuButton = page.getByRole("button", { name: "Open menu" });

    await menuButton.click();
    await expect(page.locator("#mobile-menu").getByRole("link", { name: "Work" })).toBeFocused();

    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("Tab");
      await expect(header.locator(":focus")).toBeVisible();
    }

    await page.keyboard.press("Escape");
    await expect(menuButton).toBeFocused();
    await expect(page.locator("#mobile-menu")).toBeHidden();
  });
});

test.describe("mobile tap targets", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("hero actions meet 44px hit areas", async ({ page }) => {
    await page.goto("/");
    const hero = page.locator("#top");
    for (const name of [/See the work/, /Résumé/]) {
      const box = await hero.getByRole("link", { name }).first().boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
  });
});

for (const width of [320, 375, 768, 1024, 1440, 1920]) {
  test(`no horizontal scroll at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.getByTestId("sobel-headline")).toHaveAttribute("data-state", "live", { timeout: 15_000 });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBe(0);
  });
}
