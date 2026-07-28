import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return (
    <>
      <Nav variant="hero" />
      {/* Home sections (hero, "Was wir anbieten", CTA banner) are added in the
          page-porting step. */}
      <main />
      <Footer />
    </>
  );
}
