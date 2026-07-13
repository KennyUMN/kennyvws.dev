import { expect, test } from "vitest";
import { cn, formatDate } from "@/lib/utils";

test("cn joins truthy class names and drops falsy ones", () => {
  expect(cn("a", false, undefined, "b", null, "c")).toBe("a b c");
});

test("cn returns empty string for no truthy inputs", () => {
  expect(cn(false, undefined)).toBe("");
});

test("formatDate renders short month and year", () => {
  expect(formatDate("2026-03-12")).toBe("Mar 2026");
  expect(formatDate("2025-11-09")).toBe("Nov 2025");
});
