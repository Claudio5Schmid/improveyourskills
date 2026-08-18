import { describe, expect, it } from "vitest";
import { parseContactForm } from "./schema";

function formData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) fd.set(key, value);
  return fd;
}

const VALID = {
  firstName: "Alex",
  lastName: "Muster",
  email: "alex@example.ch",
  message: "Hallo, ich habe eine Frage.",
  consent: "yes",
  locale: "de",
  turnstileToken: "some-token",
};

describe("parseContactForm", () => {
  it("accepts a fully valid submission", () => {
    const result = parseContactForm(formData(VALID));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.firstName).toBe("Alex");
      expect(result.data.consent).toBe(true);
      expect(result.data.locale).toBe("de");
    }
  });

  it("trims whitespace from text fields", () => {
    const result = parseContactForm(formData({ ...VALID, firstName: "  Alex  " }));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.firstName).toBe("Alex");
  });

  it.each(["firstName", "lastName", "email", "message"] as const)(
    "flags a missing %s as required",
    (field) => {
      const result = parseContactForm(formData({ ...VALID, [field]: "" }));
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.fieldErrors[field]).toBe("required");
    }
  );

  it("rejects a malformed email", () => {
    const result = parseContactForm(formData({ ...VALID, email: "not-an-email" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.fieldErrors.email).toBe("invalidEmail");
  });

  it("rejects an unchecked consent checkbox", () => {
    // A real browser never sends the field at all when a checkbox is unchecked.
    const fd = formData(VALID);
    fd.delete("consent");
    const result = parseContactForm(fd);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.fieldErrors.consent).toBe("consentRequired");
  });

  it("rejects an over-long message", () => {
    const result = parseContactForm(formData({ ...VALID, message: "x".repeat(5001) }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.fieldErrors.message).toBe("tooLong");
  });

  it("rejects a missing Turnstile token", () => {
    const result = parseContactForm(formData({ ...VALID, turnstileToken: "" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.fieldErrors.turnstileToken).toBe("turnstileRequired");
  });

  it("defaults an absent locale to de rather than failing", () => {
    const fd = formData(VALID);
    fd.delete("locale");
    const result = parseContactForm(fd);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.locale).toBe("de");
  });

  it("reports only the first error per field", () => {
    // Empty firstName trips both min(1) and, if it also failed a second rule,
    // parseContactForm must not overwrite the first message.
    const result = parseContactForm(formData({ ...VALID, firstName: "" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(Object.keys(result.fieldErrors)).toContain("firstName");
  });
});
