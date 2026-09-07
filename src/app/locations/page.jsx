"use client";

import { MapPin, Phone } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useRestaurants } from "@/hooks/useRestaurants";
import MenuImage from "@/components/MenuImage";
import { cn } from "@/lib/utils";

export default function LocationsPage() {
  const { t, locale } = useI18n();
  const isAr = locale === "ar";
  const { restaurants, loading } = useRestaurants();

  const sorted = [...restaurants].sort(
    (a, b) => Number(Boolean(b.isActive)) - Number(Boolean(a.isActive)),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <h1 className="display text-4xl font-black text-primary-dark">
        {t.locationsTitle}
      </h1>

      {loading ? (
        <p className="mt-10 text-muted-foreground">{t.loading}</p>
      ) : sorted.length === 0 ? (
        <p className="mt-10 text-muted-foreground">{t.locationsEmpty}</p>
      ) : (
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {sorted.map((restaurant) => {
            const name = isAr ? restaurant.nameAr : restaurant.nameEn;
            return (
              <article
                key={restaurant.id}
                className="clay-panel flex gap-4 rounded-3xl border border-border p-5 shadow-sm"
              >
                <MenuImage
                  src={restaurant.logoImage}
                  alt={name}
                  className="h-20 w-20 shrink-0 rounded-2xl"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h2 className="display text-xl font-bold">{name}</h2>
                    <span
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-bold",
                        restaurant.isActive
                          ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                          : "border-red-200 bg-red-50 text-red-700",
                      )}
                    >
                      {restaurant.isActive ? t.open : t.closed}
                    </span>
                  </div>
                  {restaurant.address ? (
                    <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin size={16} className="mt-0.5 shrink-0" />
                      <span>{restaurant.address}</span>
                    </p>
                  ) : null}
                  {restaurant.phone ? (
                    <p className="mt-2 flex items-center gap-2 text-sm">
                      <Phone size={16} className="shrink-0 text-muted-foreground" />
                      <a href={`tel:${restaurant.phone}`} className="font-semibold hover:underline">
                        {restaurant.phone}
                      </a>
                    </p>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
