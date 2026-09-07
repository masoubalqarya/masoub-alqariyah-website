"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/hooks/useCart";
import { formatSAR } from "@/lib/utils";
import { itemHasCustomOptions } from "@/lib/menuDefaults";
import MenuImage from "./MenuImage";

export default function MenuCard({ item }) {
  const { t, locale } = useI18n();
  const { addItem } = useCart();
  const isAr = locale === "ar";
  const name = isAr ? item.nameAr : item.nameEn;
  const custom = itemHasCustomOptions(item);

  const quickAdd = (e) => {
    e.preventDefault();
    addItem({
      id: item.id,
      nameEn: item.nameEn,
      nameAr: item.nameAr,
      price: item.price,
      quantity: 1,
      image: item.image,
    });
  };

  return (
    <Link
      href={`/item?id=${item.id}`}
      className="group overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        <MenuImage
          src={item.image}
          alt={name}
          className="h-full w-full transition duration-500 group-hover:scale-105"
        />
        {!custom ? (
          <button
            type="button"
            onClick={quickAdd}
            className="absolute bottom-3 end-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md"
            aria-label={t.addToCart}
          >
            <Plus size={20} />
          </button>
        ) : null}
      </div>
      <div className="p-4">
        <h3 className="display text-lg font-bold leading-snug">{name}</h3>
        <p className="mt-1 text-sm font-semibold text-primary">{formatSAR(item.price)}</p>
      </div>
    </Link>
  );
}
