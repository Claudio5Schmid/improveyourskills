import { describe, expect, it } from "vitest";
import { CONTENT_REGISTRY, registryByPage, getField } from "./registry";

describe("CONTENT_REGISTRY", () => {
  it("has unique keys", () => {
    // Duplicate keys would cause an upsert on the same row from two labels —
    // silent data corruption.
    const keys = CONTENT_REGISTRY.map((f) => f.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("uses only supported kinds", () => {
    const allowed = new Set(["text", "longtext", "image", "url", "boolean"]);
    for (const field of CONTENT_REGISTRY) {
      expect(allowed.has(field.kind)).toBe(true);
    }
  });

  it("uses only registered page ids", () => {
    const pages = new Set(["global", "home", "ueber", "impressionen", "kontakt", "anmeldung"]);
    for (const field of CONTENT_REGISTRY) {
      expect(pages.has(field.page)).toBe(true);
    }
  });

  it("all registered fields have a German label", () => {
    for (const field of CONTENT_REGISTRY) {
      expect(field.label.trim()).not.toBe("");
    }
  });
});

describe("registryByPage()", () => {
  it("groups every field under its page and section", () => {
    const grouped = registryByPage();
    for (const field of CONTENT_REGISTRY) {
      const section = grouped[field.page]?.[field.section];
      expect(section, `${field.page}/${field.section}`).toBeDefined();
      expect(section?.some((f) => f.key === field.key)).toBe(true);
    }
  });
});

describe("getField()", () => {
  it("finds a registered field", () => {
    expect(getField("common.brand")?.kind).toBe("text");
  });
});
