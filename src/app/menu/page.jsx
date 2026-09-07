"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useMenu } from "@/hooks/useMenu";
import { cn } from "@/lib/utils";
import MenuCard from "@/components/MenuCard";
import OfferCard from "@/components/OfferCard";
import CartBar from "@/components/CartBar";

export default function MenuPage() {
  const { t, locale } = useI18n();
  const isAr = locale === "ar";
  const { categories, menuItems, offers, loading } = useMenu();
  const [categoryId, setCategoryId] = useState("all");
  const [query, setQuery] = useState("");

  const sortedCategories = useMemo(
    () =>
      [...categories].sort((a, b) => {
        const ao = a.order ?? a.sortOrder ?? 0;
        const bo = b.order ?? b.sortOrder ?? 0;
        if (ao !== bo) return ao - bo;
        const an = isAr ? a.nameAr : a.nameEn;
        const bn = isAr ? b.nameAr : b.nameEn;
        return String(an).localeCompare(String(bn));
      }),
    [categories, isAr],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return menuItems.filter((item) => {
      if (categoryId !== "all" && item.category !== categoryId) return false;
      if (!q) return true;
      return (
        String(item.nameEn || "")
          .toLowerCase()
          .includes(q) || String(item.nameAr || "").toLowerCase().includes(q)
      );
    });
  }, [menuItems, categoryId, query]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 pb-28">
      <h1 className="display text-4xl font-black text-primary-dark">{t.menu}</h1>

      <div className="relative mt-6">
        <Search
          size={18}
          className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.searchMenu}
          className="w-full rounded-full border border-border bg-card py-3 ps-11 pe-4 text-sm outline-none ring-primary focus:ring-2"
        />
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setCategoryId("all")}
          className={cn(
            "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold",
            categoryId === "all"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card",
          )}
        >
          {t.all}
        </button>
        {sortedCategories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCategoryId(cat.id)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold",
              categoryId === cat.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card",
            )}
          >
            {isAr ? cat.nameAr : cat.nameEn}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-10 text-muted-foreground">{t.loading}</p>
      ) : (
        <>
          {offers.length > 0 ? (
            <section className="mt-10">
              <h2 className="display text-2xl font-black">{t.offers}</h2>
              <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
                {offers.map((offer) => (
                  <OfferCard key={offer.id} offer={offer} />
                ))}
              </div>
            </section>
          ) : null}

          {filtered.length === 0 ? (
            <p className="mt-10 text-muted-foreground">{t.noData}</p>
          ) : (
            <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-3">
              {filtered.map((item) => (
                <MenuCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </>
      )}

      <CartBar />
    </div>
  );
}
