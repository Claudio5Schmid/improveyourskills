import { describe, expect, it } from "vitest";
import { safeAdminPath } from "./safe-path";

describe("safeAdminPath", () => {
  it("accepts a same-origin /admin path", () => {
    expect(safeAdminPath("/admin/inhalte")).toBe("/admin/inhalte");
    expect(safeAdminPath("/admin/team?x=1")).toBe("/admin/team?x=1");
  });

  it("rejects an off-site URL disguised as a path", () => {
    // The classic open-redirect payload: //evil.com. Browsers treat this as
    // "https://evil.com", so allowing it would let a login link bounce off
    // our domain.
    expect(safeAdminPath("//evil.com")).toBeNull();
    expect(safeAdminPath("//evil.com/admin")).toBeNull();
  });

  it("rejects absolute URLs and non-admin paths", () => {
    expect(safeAdminPath("https://evil.com/admin")).toBeNull();
    expect(safeAdminPath("/some-other-path")).toBeNull();
  });

  it("rejects the login page (avoids a redirect loop)", () => {
    expect(safeAdminPath("/admin/login")).toBeNull();
    expect(safeAdminPath("/admin/login?x=1")).toBeNull();
  });

  it("rejects backslashes (some browsers normalise to /)", () => {
    expect(safeAdminPath("/admin\\evil.com")).toBeNull();
  });

  it("returns null for missing input", () => {
    expect(safeAdminPath(null)).toBeNull();
    expect(safeAdminPath("")).toBeNull();
  });
});
