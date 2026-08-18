import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
import { deepMerge, type Json } from "./deep-merge";
import { getDbContentMessages } from "@/content/content";
import de from "../../messages/de.json";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  // 1) Bundled JSON is the base. For en/fr, deep-merge onto German so any missing
  //    or empty key falls back to German.
  let base: Json = de as Json;
  if (locale !== "de") {
    const target = (await import(`../../messages/${locale}.json`)).default as Json;
    base = deepMerge(de as Json, target);
  }

  // 2) Editable content from the database overrides the JSON for the registry
  //    keys (with placeholders filled). If the DB is unreachable this is empty,
  //    so the site still renders from the bundled copy.
  const dbMessages = (await getDbContentMessages(locale)) as Json;
  const messages = deepMerge(base, dbMessages) as typeof de;

  return { locale, messages };
});
