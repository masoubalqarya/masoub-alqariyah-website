"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-primary-dark text-primary-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="display text-2xl font-black">{t.appName}</p>
          <p className="mt-2 max-w-sm text-sm text-primary-foreground/80">{t.tagline}</p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
          <Link href="/menu" className="hover:underline">
            {t.navMenu}
          </Link>
          <Link href="/locations" className="hover:underline">
            {t.navLocations}
          </Link>
          <Link href="/about" className="hover:underline">
            {t.navAbout}
          </Link>
          <Link href="/account" className="hover:underline">
            {t.navAccount}
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-primary-foreground/70">
        © {year} {t.appName}. {t.footerRights}
      </div>
    </footer>
  );
}
