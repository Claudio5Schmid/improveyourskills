export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

/**
 * Deep-merge `override` onto `base`, key by key.
 *
 * This is the locale fallback the brief requires: any key missing from the
 * target locale — OR present but an empty string — keeps the `base` (German)
 * value, so visitors never see a raw key or an empty string. EN/FR start as
 * full German copies, so nothing falls back yet; this protects the day they
 * become partial translations.
 *
 * Kept as a standalone, side-effect-free function so it can be unit-tested
 * (see the Testing phase of the brief).
 */
export function deepMerge(base: Json, override: Json | undefined): Json {
  if (override === undefined || override === null) return base;

  const bothObjects =
    typeof base === "object" &&
    base !== null &&
    !Array.isArray(base) &&
    typeof override === "object" &&
    override !== null &&
    !Array.isArray(override);

  if (!bothObjects) {
    // Leaf value: an empty string counts as "not translated" → keep base.
    return override === "" ? base : override;
  }

  const merged: { [key: string]: Json } = { ...(base as { [key: string]: Json }) };
  const target = override as { [key: string]: Json };
  for (const key of Object.keys(target)) {
    merged[key] = key in merged ? deepMerge(merged[key], target[key]) : target[key];
  }
  return merged;
}
