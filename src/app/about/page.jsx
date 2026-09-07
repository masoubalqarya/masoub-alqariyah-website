"use client";

import { useI18n } from "@/lib/i18n";

export default function AboutPage() {
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
        {t.appName}
      </p>
      <h1 className="display mt-3 text-4xl font-black text-primary-dark sm:text-5xl">
        {t.aboutTitle}
      </h1>
      <p className="display mt-6 text-2xl font-bold leading-snug text-foreground">
        {t.aboutLead}
      </p>
      <div className="clay-panel mt-10 space-y-5 rounded-3xl p-6 text-base leading-relaxed text-muted-foreground sm:p-10 sm:text-lg">
        <p>{t.aboutDescription}</p>
        <p>{t.aboutBody}</p>
      </div>
    </div>
  );
}
