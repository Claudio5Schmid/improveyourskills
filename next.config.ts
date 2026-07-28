import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // 301 redirects from the old .html URLs are added in a later Phase-1 step.
};

export default withNextIntl(nextConfig);
