import { describe, expect, it } from "vitest";
import { deepMerge, type Json } from "./deep-merge";

describe("deepMerge", () => {
  it("returns the base when the override is missing", () => {
    const base: Json = { a: 1, b: "de" };
    expect(deepMerge(base, undefined)).toEqual(base);
    expect(deepMerge(base, null)).toEqual(base);
  });

  it("keeps the German value when the target string is empty", () => {
    // The whole point of the fallback: EN/FR start as verbatim German copies,
    // so an empty translation must not surface an empty string to the visitor.
    const result = deepMerge({ hero: { title: "Willkommen" } }, { hero: { title: "" } });
    expect(result).toEqual({ hero: { title: "Willkommen" } });
  });

  it("takes the override for a non-empty target string", () => {
    const result = deepMerge({ hero: { title: "Willkommen" } }, { hero: { title: "Welcome" } });
    expect(result).toEqual({ hero: { title: "Welcome" } });
  });

  it("merges nested objects key-by-key", () => {
    const base = { home: { hero: { tag: "DE-tag", subtitle: "DE-sub" } } };
    const override = { home: { hero: { tag: "EN-tag" } } };
    expect(deepMerge(base, override)).toEqual({
      home: { hero: { tag: "EN-tag", subtitle: "DE-sub" } },
    });
  });

  it("replaces arrays outright (does not element-wise merge)", () => {
    // Not required by the brief, but this is the safer default — an override
    // array is authored as a whole, not as edits into the base.
    expect(deepMerge({ list: ["a", "b"] }, { list: ["c"] })).toEqual({ list: ["c"] });
  });

  it("adds keys that only exist on the override", () => {
    expect(deepMerge({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 });
  });
});
