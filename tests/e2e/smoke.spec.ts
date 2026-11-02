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
  await expect(page.getByText(/megapixels in [\d.]+ ms/).filter({ visible: true })).toBeVisible();

  const readout = headline.getByText(/% edge px/);
  const atRest = Number((await readout.innerText()).replace(/[^\d.]/g, ""));
  expect(atRest).toBeGreaterThan(0);

  const box = (await page.getByRole("heading", { level: 1 }).boundingBox())!;
  const lens = readout.locator("xpath=..");
  const before = await lens.evaluate((el) => getComputedStyle(el).transform);
  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.85, { steps: 6 });
  await expect.poll(() => lens.evaluate((el) => getComputedStyle(el).transform)).not.toBe(before);
});

test("the kernel switch runs a different filter and the readout names what it measures", async ({ page }) => {
  await page.goto("/");
  const headline = page.getByTestId("sobel-headline");
  await expect(headline).toHaveAttribute("data-state", "live", { timeout: 15_000 });
  const kernels = page.getByRole("group", { name: "Kernel" });
  await expect(kernels.getByRole("button", { name: "Sobel" })).toHaveAttribute("aria-pressed", "true");

  await kernels.getByRole("button", { name: "Laplacian" }).click();
  await expect(kernels.getByRole("button", { name: "Laplacian" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#top [aria-live]")).toContainText(/ran a 3×3 Laplacian filter over this headline, [\d.]+ megapixels in [\d.]+ ms/);
  await expect(headline.getByText("Laplacian 3×3")).toBeAttached();

  // A blur has no edges, so its readout is mean ink under the window.
  await kernels.getByRole("button", { name: "Gaussian" }).click();
  await expect(headline.getByText(/% ink$/)).toBeAttached();
  await expect(headline.getByText(/% edge px/)).toHaveCount(0);
});

test("the hero entrance hands every element back fully visible", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).not.toHaveClass(/\bintro\b/);
  for (const el of await page.locator("[data-intro]").all()) {
    if ((await el.getAttribute("data-intro")) === "ping") continue;
    await expect(el).toHaveCSS("opacity", "1");
  }
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

test("the training curve is a keyboard slider over the real log", async ({ page }) => {
  await page.goto("/");
  const slider = page.locator("#work").getByRole("slider", { name: "Training epoch" });
  await slider.focus();
  await expect(slider).toHaveAttribute("aria-valuenow", "50");
  await page.keyboard.press("PageDown");
  await expect(slider).toHaveAttribute("aria-valuenow", "40");
  // Epoch 40 is the best epoch of the log, the one the ablation quotes.
  await expect(slider).toHaveAttribute("aria-valuetext", /^Epoch 40: mAP@50 0\.621,/);
  await page.keyboard.press("Home");
  await expect(slider).toHaveAttribute("aria-valuenow", "1");
});

test("a FinRAG-ID tool points at the stages it runs in", async ({ page }) => {
  await page.goto("/");
  const finrag = page.locator("article", { hasText: "FinRAG-ID" });
  const ragas = finrag.getByRole("button", { name: /^RAGAS\s*, used in Evaluate$/ });
  await ragas.click();
  await expect(ragas).toHaveAttribute("aria-pressed", "true");
  await expect(finrag.locator('[data-step][data-state="on"]')).toHaveText([/Evaluate/]);
  await expect(finrag.locator('[data-step][data-state="dim"]')).toHaveCount(3);
  await ragas.click();
  await expect(ragas).toHaveAttribute("aria-pressed", "false");
  // Unpinned, the stages clear once the tool is neither hovered nor focused.
  await page.mouse.move(0, 0);
  await ragas.blur();
  await expect(finrag.locator('[data-step][data-state="idle"]')).toHaveCount(4);
});

test("every index sketch says it is a schematic", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#work figcaption", { hasText: /^Schematic · / })).toHaveCount(3);
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
    const overflow = () =>
      page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(await overflow()).toBe(0);
    // Scroll-driven pieces (the training curve, the sign-off) have moved by the bottom of the page.
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
    await page.waitForTimeout(300);
    expect(await overflow()).toBe(0);
  });
}

test.describe("canvases follow the page", () => {
  test.use({ colorScheme: "light" });

  test("the sign-off redraws in the new theme's ink after a toggle", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("signoff")).toHaveAttribute("data-state", "ready");
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
    await page.getByTestId("theme-toggle").first().click();
    await expect(page.locator("html")).toHaveClass(/dark/);
    // Dark ink is near white; read the brightest opaque dot on the plate.
    await expect
      .poll(() =>
        page.evaluate(() => {
          const c = document.querySelector<HTMLCanvasElement>('[data-testid="signoff"] canvas')!;
          const d = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
          let red = 0;
          for (let i = 3; i < d.length; i += 4 * 5) if (d[i] > 200) red = Math.max(red, d[i - 3]);
          return red;
        }),
      )
      .toBeGreaterThan(200);
  });

  test("a resize during the hero intro re-lays the filter at the new width", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const headline = page.getByTestId("sobel-headline");
    await expect(headline.locator('[data-scan="intro"]')).toHaveCSS("opacity", "1");
    await page.setViewportSize({ width: 900, height: 900 });
    await expect(headline).toHaveAttribute("data-state", "live", { timeout: 15_000 });
    const sizes = await headline.evaluate((el) => ({
      h1: el.querySelector("h1")!.getBoundingClientRect().width,
      plate: (el.querySelector("[aria-hidden]") as HTMLElement).getBoundingClientRect().width,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }));
    expect(sizes.overflow).toBe(0);
    expect(sizes.plate - sizes.h1).toBeLessThan(80);
  });
});

test.describe("layout stability", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("the hero does not shift while the filter loads", async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __cls: number };
      w.__cls = 0;
      new PerformanceObserver((list) => {
        for (const e of list.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) {
          if (!e.hadRecentInput) w.__cls += e.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto("/");
    await expect(page.getByTestId("sobel-headline")).toHaveAttribute("data-state", "live", { timeout: 15_000 });
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => (window as unknown as { __cls: number }).__cls)).toBeLessThan(0.05);
  });
});
