import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Hero from "@/components/home/Hero";
import WasWirAnbieten from "@/components/home/WasWirAnbieten";
import CtaBanner from "@/components/home/CtaBanner";

export default function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return (
    <>
      <Nav variant="hero" />
      <main>
        <Hero />
        <WasWirAnbieten />
        <CtaBanner />
      </main>
      <Footer />
    </>
  );
}
