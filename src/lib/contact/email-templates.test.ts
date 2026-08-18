import { describe, expect, it } from "vitest";
import { renderNotificationEmail, renderAutoReplyEmail } from "./email-templates";

describe("renderNotificationEmail", () => {
  const base = {
    firstName: "Alex",
    lastName: "Muster",
    email: "alex@example.ch",
    message: "Hallo, ich habe eine Frage.",
    locale: "de" as const,
  };

  it("includes the sender's name in the subject", () => {
    const { subject } = renderNotificationEmail(base);
    expect(subject).toContain("Alex Muster");
  });

  it("escapes HTML in the message so it can't break the email or inject markup", () => {
    const { html } = renderNotificationEmail({
      ...base,
      message: '<img src=x onerror="alert(1)">Hi',
    });
    expect(html).not.toContain("<img src=x onerror");
    expect(html).toContain("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;Hi");
  });

  it("escapes HTML in the name fields too", () => {
    const { html } = renderNotificationEmail({ ...base, firstName: "<b>Alex</b>" });
    expect(html).not.toContain("<b>Alex</b>");
    expect(html).toContain("&lt;b&gt;Alex&lt;/b&gt;");
  });

  it("preserves line breaks in the message as <br> in HTML", () => {
    const { html } = renderNotificationEmail({ ...base, message: "Zeile 1\nZeile 2" });
    expect(html).toContain("Zeile 1<br />Zeile 2");
  });

  it("the plain-text version carries no HTML markup", () => {
    const { text } = renderNotificationEmail(base);
    expect(text).not.toMatch(/<[a-z][\s\S]*>/i);
    expect(text).toContain(base.email);
    expect(text).toContain(base.message);
  });
});

describe("renderAutoReplyEmail", () => {
  it("produces different copy per locale", () => {
    const de = renderAutoReplyEmail("Alex", "de");
    const en = renderAutoReplyEmail("Alex", "en");
    const fr = renderAutoReplyEmail("Alex", "fr");
    expect(de.subject).not.toBe(en.subject);
    expect(en.subject).not.toBe(fr.subject);
    expect(de.html).not.toBe(en.html);
  });

  it("greets the visitor by their first name in every locale", () => {
    for (const locale of ["de", "en", "fr"] as const) {
      const { html, text } = renderAutoReplyEmail("Alex", locale);
      expect(html).toContain("Alex");
      expect(text).toContain("Alex");
    }
  });

  it("escapes an HTML-hostile first name", () => {
    const { html } = renderAutoReplyEmail('<script>alert(1)</script>', "de");
    expect(html).not.toContain("<script>alert(1)</script>");
  });

  it("the plain-text version carries no HTML markup", () => {
    const { text } = renderAutoReplyEmail("Alex", "de");
    expect(text).not.toMatch(/<[a-z][\s\S]*>/i);
  });
});
