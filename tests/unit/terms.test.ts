import { expect, test } from "vitest";
import { terms } from "@/data/terms";

test("terms map has exactly the four specced entries", () => {
  expect(Object.keys(terms).sort()).toEqual([
    "computer-vision",
    "llm-tooling",
    "the-server",
    "yolo-pipeline",
  ]);
});

test("every term preview has non-empty title and meta", () => {
  for (const entry of Object.values(terms)) {
    expect(entry.title.length).toBeGreaterThan(0);
    expect(entry.meta.length).toBeGreaterThan(0);
  }
});
