import { expect, test } from "@playwright/test";

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  test.describe(`motion: ${reducedMotion}`, () => {
    test.use({ contextOptions: { reducedMotion }, colorScheme: "light" });

    test("every project plate stays live, or fully acquired with reduced motion", async ({ page }) => {
      test.setTimeout(60_000);
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; });
      const cases = [
        { title: "Semi-Supervised PPE", selector: "svg > g:not(:first-child)", duration: 6800, floor: 0, ceiling: 1 },
        { title: "Bandar Tracker", selector: "svg > g > g:nth-last-child(-n+3) > g", duration: 3400, floor: 0.8, ceiling: 1 },
        { title: "Tiny Transformer", selector: "circle.fill-ink", duration: 2400, floor: 0.35, ceiling: 1 },
        { title: "RAG Evaluation", selector: "span.bg-ink-muted\\/50", duration: 16000, floor: 0.35, ceiling: 1 },
        { title: "Document Q&A", selector: "span.bg-ink", duration: 1400, floor: 0, ceiling: 1 },
      ];
      for (const plate of cases) {
        const article = page.locator("#work article").filter({ hasText: plate.title });
        const artifact = article.getByTestId("project-artifact");
        await artifact.scrollIntoViewIfNeeded();
        await page.mouse.move(0, 0);
        await page.waitForTimeout(1500);
        const ranges = await artifact.locator(plate.selector).evaluateAll(async (elements, duration) => {
          const values = elements.map(() => [] as number[]);
          const start = performance.now();
          while (performance.now() - start < duration) {
            elements.forEach((el, i) => values[i].push(Number(getComputedStyle(el).opacity)));
            await new Promise((resolve) => setTimeout(resolve, 40));
          }
          return values.map((samples) => ({ min: Math.min(...samples), max: Math.max(...samples) }));
        }, reducedMotion === "reduce" ? 700 : plate.duration);
        expect(ranges.length).toBeGreaterThan(0);
        if (reducedMotion === "reduce") {
          expect(ranges.every(({ min, max }) => min === 1 && max === 1)).toBe(true);
        } else {
          const moving = ranges.filter(({ min, max }) => max - min > 0.1);
          expect(moving).toHaveLength(plate.title === "RAG Evaluation" ? 3 : ranges.length);
          for (const { min, max } of moving) {
            expect(min).toBeCloseTo(plate.floor, 1);
            expect(max).toBeCloseTo(plate.ceiling, 1);
          }
        }
      }
      const idleCorner = page.locator("#work article").last().locator("span.size-4 > span").first();
      const translations = await idleCorner.evaluate(async (el) => {
        const values: number[] = [];
        const start = performance.now();
        while (performance.now() - start < 4200) {
          values.push(new DOMMatrix(getComputedStyle(el).transform).m41);
          await new Promise((resolve) => setTimeout(resolve, 40));
        }
        return { min: Math.min(...values), max: Math.max(...values) };
      });
      if (reducedMotion === "reduce") expect(translations).toEqual({ min: 0, max: 0 });
      else {
        expect(translations.min).toBeCloseTo(-1, 1);
        expect(translations.max).toBeCloseTo(0, 1);
      }
    });

    test("registration, static thumbnail, scrubbed panel, and immediate actions", async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; });

      const closing = page.getByRole("region", { name: "Closing statement" });
      const action = closing.getByRole("link", { name: /@/ });
      expect(await action.evaluate((el) => {
        for (let node: Element | null = el; node; node = node.parentElement) {
          if (getComputedStyle(node).opacity === "0") return false;
        }
        return true;
      })).toBe(true);

      const thumbnail = page.locator("#work article").filter({ hasText: "Tiny Transformer" }).getByTestId("project-artifact");
      await expect(thumbnail.locator("path.stroke-ink")).toHaveCSS("stroke-dasharray", "none");
      await expect(thumbnail.locator(".tabular-nums")).toHaveText("4,000");

      const panel = page.getByRole("region", { name: "Training trace", exact: true });
      const curve = panel.locator("path.stroke-ink");
      const step = panel.locator(".tabular-nums");
      const corners = panel.locator("span.pointer-events-none.absolute.size-4");
      await expect(corners).toHaveCount(4);
      if (reducedMotion === "reduce") {
        await expect(corners.first()).toHaveCSS("opacity", "1");
        await expect(corners.first()).toHaveCSS("transform", "none");
      } else {
        await expect(corners.first()).toHaveCSS("opacity", "0");
      }

      const trace = panel.locator("div.relative.h-full");
      const samples: number[] = [];
      for (const progress of [0, 0.5, 1]) {
        await trace.evaluate((el, progress) => {
          const rect = el.getBoundingClientRect();
          const top = rect.top + window.scrollY;
          const start = top - window.innerHeight * 0.9;
          const end = top + rect.height - window.innerHeight * 0.45;
          window.scrollTo(0, start + (end - start) * progress);
        }, progress);
        await page.waitForTimeout(300);
        samples.push(Number((await step.innerText()).replaceAll(",", "")));
      }
      if (reducedMotion === "reduce") {
        expect(samples).toEqual([4000, 4000, 4000]);
        await expect(curve).toHaveCSS("stroke-dasharray", "none");
      } else {
        expect(samples[0]).toBeLessThan(20);
        expect(samples[1]).toBeGreaterThan(1900);
        expect(samples[1]).toBeLessThan(2100);
        expect(samples[2]).toBeGreaterThan(3980);
        await expect(corners.first()).toHaveCSS("opacity", "1");
        await page.mouse.move(0, 0);
        await expect(corners.first()).toHaveCSS("transform", "none");
        await trace.hover();
        await expect(corners.first()).toHaveCSS("transform", "matrix(1, 0, 0, 1, -3, -3)");
        await page.mouse.move(0, 0);
        await expect(corners.first()).toHaveCSS("transform", "none");
      }
      await expect(thumbnail.locator("path.stroke-ink")).toHaveCSS("stroke-dasharray", "none");
      await expect(thumbnail.locator(".tabular-nums")).toHaveText("4,000");

      for (const id of ["work", "about", "stack", "contact"]) {
        const heading = page.locator(`#${id}-heading`);
        await heading.scrollIntoViewIfNeeded();
        await expect(heading).toHaveCSS("opacity", "1");
        await expect(heading).toHaveCSS("transform", "none");
        await expect(heading.locator("..").locator("span.h-px")).toHaveCSS("transform", "none");
      }
      const metrics = page.locator("#work dl").first();
      await metrics.scrollIntoViewIfNeeded();
      for (const dd of await metrics.locator("dd").all()) {
        await expect(dd).toHaveCSS("opacity", "1");
        await expect(dd).toHaveCSS("transform", "none");
      }
      expect(await metrics.evaluate((el) => el.closest("[data-reveal]") === null)).toBe(true);
      const cells = page.locator("#stack .grid > div");
      for (const cell of await cells.all()) {
        await expect(cell).toHaveCSS("background-color", "rgb(237, 237, 237)");
        await expect(cell).toHaveCSS("transform", "none");
        expect(await cell.locator(":scope > [data-reveal]").count()).toBe(1);
      }
      await closing.scrollIntoViewIfNeeded();
      await expect(closing.locator("p").first()).toHaveCSS("opacity", "1");
      await expect(closing.locator("p").first()).toHaveCSS("transform", "none");
      expect(errors).toEqual([]);
    });
  });
}
