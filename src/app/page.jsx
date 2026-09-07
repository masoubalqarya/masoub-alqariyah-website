"use client";

import Link from "next/link";
import { Car, MapPin, ShoppingBag } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useMenu } from "@/hooks/useMenu";
import { useRestaurants } from "@/hooks/useRestaurants";
import OfferCard from "@/components/OfferCard";
import MenuImage from "@/components/MenuImage";

const STEPS = [
  { icon: ShoppingBag, title: "how1Title", desc: "how1Desc" },
  { icon: Car, title: "how2Title", desc: "how2Desc" },
  { icon: MapPin, title: "how3Title", desc: "how3Desc" },
];

export default function HomePage() {
  const { t, locale } = useI18n();
  const isAr = locale === "ar";
  const { offers, loading: menuLoading } = useMenu();
  const { activeRestaurants, loading: restLoading } = useRestaurants();
  const featured = offers.slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl space-y-16 px-4 py-10 sm:py-14">
      <section className="rise clay-panel relative overflow-hidden rounded-3xl px-6 py-12 sm:px-12 sm:py-16">
        <div className="pointer-events-none absolute -end-16 -top-16 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -start-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
          {t.tagline}
        </p>
        <h1 className="display mt-4 max-w-3xl text-4xl font-black leading-[1.1] text-primary-dark sm:text-6xl">
          {t.heroTitle}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {t.heroSubtitle}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/menu"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-md transition hover:bg-primary-dark"
          >
            {t.orderNow}
          </Link>
          <Link
            href="/locations"
            className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3 text-sm font-bold transition hover:border-primary"
          >
            {t.viewLocations}
          </Link>
        </div>
      </section>

      <section>
        <h2 className="display text-3xl font-black text-primary-dark">
          {t.howTitle}
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <article
                key={step.title}
                className="rounded-3xl border border-border bg-card p-6 shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary">
                  <Icon size={22} />
                </div>
                <p className="mt-5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  0{index + 1}
                </p>
                <h3 className="display mt-2 text-xl font-bold">{t[step.title]}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t[step.desc]}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <h2 className="display text-3xl font-black text-primary-dark">
            {t.featuredOffers}
          </h2>
          <Link href="/menu" className="text-sm font-bold text-accent hover:underline">
            {t.seeAllOffers}
          </Link>
        </div>
        {menuLoading ? (
          <p className="mt-8 text-muted-foreground">{t.loading}</p>
        ) : featured.length === 0 ? (
          <p className="mt-8 text-muted-foreground">{t.noData}</p>
        ) : (
          <div className="mt-8 flex gap-4 overflow-x-auto pb-2">
            {featured.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="display text-3xl font-black text-primary-dark">
          {t.locationsTeaser}
        </h2>
        <p className="mt-2 text-muted-foreground">{t.locationsTeaserDesc}</p>
        {restLoading ? (
          <p className="mt-8 text-muted-foreground">{t.loading}</p>
        ) : activeRestaurants.length === 0 ? (
          <p className="mt-8 text-muted-foreground">{t.locationsEmpty}</p>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {activeRestaurants.slice(0, 4).map((restaurant) => (
              <Link
                key={restaurant.id}
                href="/locations"
                className="flex items-center gap-4 rounded-3xl border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <MenuImage
                  src={restaurant.logoImage}
                  alt={isAr ? restaurant.nameAr : restaurant.nameEn}
                  className="h-16 w-16 shrink-0 rounded-2xl"
                />
                <div className="min-w-0">
                  <p className="display font-bold">
                    {isAr ? restaurant.nameAr : restaurant.nameEn}
                  </p>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {restaurant.address}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="clay-panel rounded-3xl px-6 py-10 sm:px-10">
        <h2 className="display text-3xl font-black text-primary-dark">
          {t.appCtaTitle}
        </h2>
        <p className="mt-3 max-w-xl text-muted-foreground">{t.appCtaDesc}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-bold opacity-70">
            {t.appStore}
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
              {t.comingSoon}
            </span>
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-bold opacity-70">
            {t.googlePlay}
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
              {t.comingSoon}
            </span>
          </span>
        </div>
      </section>
    </div>
  );
}
