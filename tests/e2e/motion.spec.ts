import { expect, test, type Page } from "@playwright/test";

async function scrollToProgress(page: Page, selector: string, progress: number) {
  // Mirrors the chart's scroll offsets: plot top at 85% of the viewport to plot top at 25%.
  await page.locator(selector).evaluate((el, p) => {
    // Layout position, like Motion's own measurement: entrance transforms must not skew it.
    let top = 0;
    for (let n = el as HTMLElement | null; n; n = n.offsetParent as HTMLElement | null) top += n.offsetTop;
    const start = top - window.innerHeight * 0.85;
    const end = top - window.innerHeight * 0.25;
    window.scrollTo({ top: start + (end - start) * p, behavior: "instant" });
  }, progress);
}

const epoch = async (page: Page) =>
  Number((await page.locator("#work").getByText(/^epoch \d+ · /).first().textContent())!.match(/epoch (\d+)/)![1]);

const timestep = async (page: Page) =>
  Number((await page.getByText(/^t = \d+$/).innerText()).replace("t = ", ""));

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  test.describe(`motion: ${reducedMotion}`, () => {
    test.use({ contextOptions: { reducedMotion } });

    test("scroll drives the training clock and the sign-off sampler", async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto("/");
      await expect(page.getByTestId("sobel-headline")).toHaveAttribute("data-state", "live", { timeout: 15_000 });
      await page.evaluate(() => (document.documentElement.style.scrollBehavior = "auto"));

      const plot = "#work figure .relative.w-full";
      const samples: number[] = [];
      for (const p of [0, 0.5, 1]) {
        await scrollToProgress(page, plot, p);
        await page.waitForTimeout(250);
        samples.push(await epoch(page));
      }
      if (reducedMotion === "reduce") {
        expect(samples).toEqual([50, 50, 50]);
      } else {
        expect(samples[0]).toBeLessThanOrEqual(2);
        expect(samples[1]).toBeGreaterThan(20);
        expect(samples[1]).toBeLessThan(31);
        expect(samples[2]).toBe(50);
      }

      const signoff = page.getByTestId("signoff");
      await expect(signoff).toHaveAttribute("data-state", "ready");
      await signoff.evaluate((el) =>
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - window.innerHeight + 40, behavior: "instant" }),
      );
      await page.waitForTimeout(250);
      const entering = await timestep(page);
      await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
      await expect.poll(() => timestep(page)).toBe(0);
      if (reducedMotion === "reduce") expect(entering).toBe(0);
      else expect(entering).toBeGreaterThan(500);

      for (const id of ["work"]) {
        const heading = page.locator(`#${id}-heading`);
        await heading.scrollIntoViewIfNeeded();
        await expect(heading.locator("[data-reveal]")).toHaveCSS("transform", "none");
      }
      expect(errors).toEqual([]);
    });
  });
}

test.describe("narrow screens with motion on", () => {
  test.use({ viewport: { width: 320, height: 720 }, contextOptions: { reducedMotion: "no-preference" } });

  test("headings that wrap to two lines still reveal", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => (document.documentElement.style.scrollBehavior = "auto"));
    const lines = page.locator("#work-heading [data-reveal], #contact-heading [data-reveal]");
    await expect(lines).toHaveCount(4);
    for (const line of await lines.all()) {
      await line.evaluate((el) => el.closest("h2")!.scrollIntoView({ block: "center" }));
      await expect
        .poll(() => line.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m42), { timeout: 4000 })
        .toBe(0);
    }
  });
});
