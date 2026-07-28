import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
import { deepMerge, type Json } from "./deep-merge";
import de from "../../messages/de.json";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  // German is the base. For en/fr, deep-merge the target onto German so any
  // missing or empty key falls back to the German value.
  let messages: typeof de = de;
  if (locale !== "de") {
    const target = (await import(`../../messages/${locale}.json`)).default as Json;
    messages = deepMerge(de as Json, target) as typeof de;
  }

  return { locale, messages };
});
