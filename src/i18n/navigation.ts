import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware navigation helpers. Use these `Link`, `redirect`, `usePathname`,
 * `useRouter` and `getPathname` everywhere instead of the ones from `next/*`,
 * so the current locale prefix is always handled automatically.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
