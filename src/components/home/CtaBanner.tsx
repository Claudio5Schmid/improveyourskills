import { useTranslations } from "next-intl";
import styles from "./CtaBanner.module.css";

export default function CtaBanner() {
  const t = useTranslations("home.cta");

  return (
    <section className={styles.banner}>
      <div className={styles.content}>
        <h2 className={styles.title}>{t("title")}</h2>
      </div>
    </section>
  );
}
