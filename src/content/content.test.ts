import { describe, expect, it } from "vitest";
import { formatPrice, formatCourseDate, interpolateContent } from "./format";

describe("formatPrice (Swiss)", () => {
  it("shows whole francs as '48.–'", () => {
    // Reproduces the wording of the old site's Anmeldung button.
    expect(formatPrice(48)).toBe("48.–");
  });

  it("shows fractional francs with two decimals", () => {
    expect(formatPrice(48.5)).toBe("48.50");
    expect(formatPrice(9.95)).toBe("9.95");
  });

  it("returns empty for null", () => {
    // Callers concatenate this into copy — an empty string is safe, "null" is not.
    expect(formatPrice(null)).toBe("");
  });
});

describe("interpolateContent (placeholders)", () => {
  it("fills {year}, {nextYear} and {price}", () => {
    // Reproduces the seed rows: "Skill Training {year}" and "CHF {price}".
    expect(interpolateContent("Skill Training {year}", { year: 2026, price: "48.–" })).toBe(
      "Skill Training 2026"
    );
    expect(interpolateContent("Nächste Saison {nextYear}", { year: 2026, price: "" })).toBe(
      "Nächste Saison 2027"
    );
    expect(interpolateContent("CHF {price}", { year: 2026, price: "48.–" })).toBe("CHF 48.–");
  });

  it("leaves unrelated braces alone", () => {
    expect(interpolateContent("Hallo {name}", { year: 2026, price: "" })).toBe("Hallo {name}");
  });
});

describe("formatCourseDate (Swiss)", () => {
  it("formats a valid ISO date in the old-site style", () => {
    // Matches "So, 5. Juli 2026" — weekday short, no trailing dot.
    expect(formatCourseDate("2026-07-05")).toBe("So, 5. Juli 2026");
  });

  it("returns empty for null or invalid input", () => {
    expect(formatCourseDate(null)).toBe("");
    expect(formatCourseDate("not-a-date")).toBe("");
  });
});
