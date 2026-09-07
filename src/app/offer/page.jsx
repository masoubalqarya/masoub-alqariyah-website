"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Tag } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useMenu } from "@/hooks/useMenu";
import { useCart } from "@/hooks/useCart";
import { formatSAR } from "@/lib/utils";
import MenuImage from "@/components/MenuImage";

function OfferPageInner() {
  const { t, locale } = useI18n();
  const isAr = locale === "ar";
  const router = useRouter();
  const searchParams = useSearchParams();
  const offerId = searchParams.get("id");
  const { offers, menuItems, sizeOptions, loading } = useMenu();
  const { addOfferItems } = useCart();

  const offer = offers.find((o) => o.id === offerId);

  if (loading) {
    return <p className="px-4 py-20 text-center text-muted-foreground">{t.loading}</p>;
  }

  if (!offer) {
    return <p className="px-4 py-20 text-center text-muted-foreground">{t.noData}</p>;
  }

  const title = isAr ? offer.titleAr : offer.titleEn;
  const description = isAr ? offer.descriptionAr : offer.descriptionEn;
  const savings = (offer.originalPrice || 0) - (offer.offerPrice || 0);

  const handleAdd = () => {
    addOfferItems(offer, menuItems, sizeOptions);
    router.push("/menu");
  };

  return (
    <div className="mx-auto max-w-3xl pb-10">
      <div className="relative aspect-[16/9] overflow-hidden bg-secondary sm:rounded-b-3xl">
        <MenuImage src={offer.image} alt={title} className="h-full w-full" />
        {offer.discount ? (
          <span className="absolute top-4 start-4 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
            <Tag size={14} />
            {offer.discount}
          </span>
        ) : null}
      </div>

      <div className="px-4 py-6 sm:px-6">
        <Link href="/menu" className="text-sm font-semibold text-accent hover:underline">
          {t.backToMenu}
        </Link>
        <h1 className="display mt-4 text-3xl font-black text-primary-dark">{title}</h1>
        {description ? (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
        ) : null}

        <div className="mt-6 grid grid-cols-3 gap-3 rounded-3xl border border-border bg-card p-4">
          <div>
            <p className="text-xs text-muted-foreground">{t.originalPrice}</p>
            <p className="mt-1 text-sm line-through">{formatSAR(offer.originalPrice)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t.offerPrice}</p>
            <p className="mt-1 text-lg font-black text-primary">{formatSAR(offer.offerPrice)}</p>
          </div>
          {savings > 0 ? (
            <div>
              <p className="text-xs text-muted-foreground">{t.youSave}</p>
              <p className="mt-1 text-sm font-bold text-accent">{formatSAR(savings)}</p>
            </div>
          ) : null}
        </div>

        {offer.items?.length > 0 ? (
          <section className="mt-8">
            <h2 className="display text-xl font-bold">{t.offerIncludes}</h2>
            <ul className="mt-4 space-y-2">
              {offer.items.map((line, index) => (
                <li key={`${line.menuItemId}-${index}`} className="flex items-center gap-3 text-sm">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span>
                    {line.qty > 1 ? `${line.qty}× ` : ""}
                    {isAr ? line.nameAr : line.nameEn}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <button
          type="button"
          onClick={handleAdd}
          className="mt-8 w-full rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary-dark"
        >
          {t.addOfferToCart}
        </button>
      </div>
    </div>
  );
}

function PageFallback() {
  const { t } = useI18n();
  return <p className="px-4 py-20 text-center text-muted-foreground">{t.loading}</p>;
}

export default function OfferPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <OfferPageInner />
    </Suspense>
  );
}
