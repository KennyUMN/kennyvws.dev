import { readFile } from "node:fs/promises";
import { expect, test } from "vitest";
import { categories, projects } from "@/data/projects";
import { posts } from "@/data/posts";
import { navItems, sectionIds } from "@/data/nav";

test("there are exactly five projects", () => {
  expect(projects).toHaveLength(5);
});

test("every project link points at its own repo slug, never the bare profile", () => {
  for (const p of projects.filter((p) => p.github)) {
    expect(p.github).toMatch(/^https:\/\/github\.com\/KennyUMN\/[\w.-]+$/);
  }
});

test("github slugs are unique per project", () => {
  const links = projects.map((p) => p.github).filter(Boolean);
  expect(new Set(links).size).toBe(links.length);
});

test("every project category is a valid filter category", () => {
  for (const p of projects) {
    expect(categories).toContain(p.category);
  }
});

test("exactly two projects are featured", () => {
  expect(projects.filter((p) => p.featured).length).toBe(2);
});

test("writing has four placeholder drafts", () => {
  expect(posts).toHaveLength(4);
  for (const post of posts) {
    expect(post.href).toBe("#");
  }
});

test("a project with a public repo carries verifiable metrics", () => {
  // The PPE row's numbers come from the repo's own training-results.csv.
  // If the field is dropped, the page silently loses the only hard evidence
  // on it — this fails instead.
  const ppe = projects.find((p) => p.github?.includes("ppe-compliance-ssl-yolov9"));
  expect(ppe).toBeDefined();
  expect(ppe!.metrics?.length ?? 0).toBeGreaterThan(0);
  for (const m of ppe!.metrics ?? []) {
    expect(m.label).toBeTruthy();
    expect(m.value).toMatch(/^[\d.]+$/);
  }
});

test("metrics say which artifact they came from", () => {
  // The repo log (20% labeled split) and the manuscript (60% labeled) report
  // different numbers for the same project. Unlabelled metrics next to a link
  // to the other artifact read as a contradiction, so the source is required.
  for (const p of projects.filter((p) => p.metrics?.length)) {
    expect(p.metricsSource).toBeTruthy();
  }
});

test("the OG image never hardcodes a domain", async () => {
  // A hardcoded host there shipped a dead domain in every share card once.
  const src = await readFile(
    new URL("../../src/app/opengraph-image.tsx", import.meta.url),
    "utf8"
  );
  expect(src).toMatch(/site\.url/);
  expect(src).not.toMatch(/kennyvws\.dev/);
});

test("no project claims a journal submission it cannot back", () => {
  // The public repo README says "Course project" and the manuscript names no
  // venue, so "in submission to <journal>" is a claim the artifacts contradict.
  for (const p of projects) {
    expect(p.status.toLowerCase()).not.toContain("in submission");
    expect(p.description.toLowerCase()).not.toContain("submission to");
  }
});

test("nav covers the five anchored sections", () => {
  expect(sectionIds).toEqual(["about", "stack", "work", "writing", "contact"]);
  for (const item of navItems) {
    expect(item.href).toBe(`#${item.id}`);
  }
});
