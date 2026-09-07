"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { formatSAR } from "@/lib/utils";
import MenuImage from "./MenuImage";

export default function OfferCard({ offer }) {
  const { locale, t } = useI18n();
  const isAr = locale === "ar";
  const title = isAr ? offer.titleAr : offer.titleEn;

  return (
    <Link
      href={`/offer?id=${offer.id}`}
      className="group relative min-w-[260px] flex-1 overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
    >
      <div className="relative h-40 overflow-hidden bg-secondary">
        <MenuImage
          src={offer.image}
          alt={title}
          className="h-full w-full transition duration-500 group-hover:scale-105"
        />
        {offer.discount ? (
          <span className="absolute top-3 start-3 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
            {offer.discount}
          </span>
        ) : null}
      </div>
      <div className="p-4">
        <h3 className="display text-lg font-bold">{title}</h3>
        <p className="mt-1 text-sm font-semibold text-primary">
          {formatSAR(offer.offerPrice)}
          <span className="ms-2 text-xs font-normal text-muted-foreground line-through">
            {formatSAR(offer.originalPrice)}
          </span>
        </p>
        <p className="mt-2 text-xs font-semibold text-accent">{t.offerDetails}</p>
      </div>
    </Link>
  );
}
