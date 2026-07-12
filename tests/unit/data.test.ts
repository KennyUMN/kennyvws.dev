import { expect, test } from "vitest";
import { categories, projects } from "@/data/projects";
import { posts } from "@/data/posts";
import { navItems, sectionIds } from "@/data/nav";
import { site } from "@/data/site";

test("there are exactly five projects", () => {
  expect(projects).toHaveLength(5);
});

test("every project links to its own repo slug, never the bare profile", () => {
  for (const p of projects) {
    expect(p.github).toMatch(/^https:\/\/github\.com\/KennyUMN\/[a-z0-9-]+$/);
  }
});

test("github slugs are unique per project", () => {
  const links = projects.map((p) => p.github);
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

test("nav covers the five anchored sections", () => {
  expect(sectionIds).toEqual(["about", "stack", "work", "writing", "contact"]);
  for (const item of navItems) {
    expect(item.href).toBe(`#${item.id}`);
  }
});

test("site status block has the four entries", () => {
  expect(site.status.map((s) => s.label)).toEqual([
    "Focus",
    "Now",
    "Base",
    "Status",
  ]);
});
