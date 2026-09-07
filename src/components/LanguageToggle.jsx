"use client";

import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function LanguageToggle({ className }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <button
      type="button"
      onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
      className={cn(
        "rounded-full border border-border bg-card px-3 py-1.5 text-sm font-semibold text-foreground transition hover:border-primary",
        className,
      )}
    >
      {locale === "ar" ? t.languageEnglish : t.languageArabic}
    </button>
  );
}
