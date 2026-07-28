import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";

export default function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const t = useTranslations("nav");
  return (
    <main>
      i18n OK — {t("ueber")} · {t("impressionen")} · {t("kontakt")} · {t("anmelden")}
    </main>
  );
}
