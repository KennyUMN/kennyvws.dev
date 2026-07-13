import { expect, test } from "@playwright/test";

test("hero H1 is the full pitch, spoken once", async ({ page }) => {
  await page.goto("/");
  // \s*, — Chromium's accname computation joins element boundaries with a space before this comma.
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /^I build machine learning systems end to end: computer vision and LLM tooling\s*, from the training loop to the server that keeps it running\.$/,
    })
  ).toBeVisible();
  await expect(
    page.getByText("Open to AI Engineer roles").first()
  ).toBeVisible();
});

test("hovering a hero term reveals its preview card", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("term-computer-vision").hover();
  const card = page.getByTestId("term-card");
  await expect(card).toBeVisible();
  await expect(card).toContainText("Semi-Supervised PPE Detection");
});

test("term preview opens on keyboard focus and closes on Escape", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByTestId("term-computer-vision").focus();
  await expect(page.getByTestId("term-card")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("term-card")).toBeHidden();
});

test("nav anchor scrolls to the work section", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Main" })
    .getByRole("link", { name: "Work" })
    .click();
  await expect(page).toHaveURL(/#work$/);
  await expect(page.locator("#work")).toBeInViewport();
});

test("resume link points at the PDF", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: "Resume" }).first()
  ).toHaveAttribute("href", "/resume.pdf");
});

test.describe("theme", () => {
  test.use({ colorScheme: "light" });

  test("toggle switches to dark and persists across reload", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByTestId("theme-toggle").first().click();
    await expect(page.locator("html")).toHaveClass(/dark/);
    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/);
  });
});

test("work section is an editorial list, not a filtered grid", async ({
  page,
}) => {
  await page.goto("/");
  const entries = page.locator("#work article");
  await expect(entries).toHaveCount(5);
  await expect(entries.first()).toContainText("Semi-Supervised PPE Detection");
  await expect(entries.first()).toContainText("YOLOv9");
  await expect(page.locator("#work").getByRole("button")).toHaveCount(0);
});

test("the page closes with the POV statement", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByText("Clean the data. Fight the training run. Ship the server.")
  ).toBeVisible();
});

test.describe("mobile menu focus trap", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("traps focus while open and releases it on escape", async ({
    page,
  }) => {
    await page.goto("/");
    const header = page.locator("header");
    const menuButton = page.getByRole("button", { name: "Open menu" });

    await menuButton.click();
    await expect(page.getByRole("link", { name: "About" })).toBeFocused();

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

  test("hero CTAs meet 44px hit areas", async ({ page }) => {
    await page.goto("/");
    for (const name of [/See projects/, /GitHub/]) {
      const box = await page
        .getByRole("link", { name })
        .first()
        .boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
  });
});
