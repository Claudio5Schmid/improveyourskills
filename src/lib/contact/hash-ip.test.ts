import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { hashIp } from "./hash-ip";

const ORIGINAL_SALT = process.env.CONTACT_IP_HASH_SALT;

beforeEach(() => {
  process.env.CONTACT_IP_HASH_SALT = "test-salt";
});

afterEach(() => {
  process.env.CONTACT_IP_HASH_SALT = ORIGINAL_SALT;
  vi.restoreAllMocks();
});

describe("hashIp", () => {
  it("is deterministic for the same IP and salt", () => {
    expect(hashIp("203.0.113.7")).toBe(hashIp("203.0.113.7"));
  });

  it("produces a 64-character hex digest (SHA-256), never the raw IP", () => {
    const hash = hashIp("203.0.113.7");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).not.toContain("203.0.113.7");
  });

  it("differs for different IPs", () => {
    expect(hashIp("203.0.113.7")).not.toBe(hashIp("203.0.113.8"));
  });

  it("differs when the salt changes — a leaked hash can't be replayed against a rotated salt", () => {
    const first = hashIp("203.0.113.7");
    process.env.CONTACT_IP_HASH_SALT = "different-salt";
    const second = hashIp("203.0.113.7");
    expect(first).not.toBe(second);
  });

  it("still hashes (doesn't throw) when the salt is missing, and logs a warning", () => {
    delete process.env.CONTACT_IP_HASH_SALT;
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const hash = hashIp("203.0.113.7");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(errorSpy).toHaveBeenCalled();
  });
});
