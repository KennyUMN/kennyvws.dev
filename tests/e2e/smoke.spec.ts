import { expect, test } from "@playwright/test";

test("hero renders headline and availability pill", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "machine learning systems"
  );
  await expect(
    page.getByText("Open to AI Engineer roles").first()
  ).toBeVisible();
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

test("project filter narrows and restores the grid", async ({ page }) => {
  await page.goto("/");
  const cards = page.locator("#work article");
  await expect(cards).toHaveCount(5);
  await page.getByRole("button", { name: "Computer Vision" }).click();
  await expect(cards).toHaveCount(1);
  await expect(cards.first()).toContainText("Semi-Supervised PPE Detection");
  await page.getByRole("button", { name: "All", exact: true }).click();
  await expect(cards).toHaveCount(5);
});
