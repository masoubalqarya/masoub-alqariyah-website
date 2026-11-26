"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, ChefHat } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useMenuBuilders } from "@/hooks/useMenuBuilders";
import { MENU_BUILDERS, builderItem, builderStartingPrice } from "@/lib/menu-builders";
import { isInStock } from "@/lib/catalog";
import { formatSAR } from "@/lib/utils";
import MenuImage from "./MenuImage";

export default function MenuBuilders({ menuItems, sizeOptions, loading }) {
  const { t, locale } = useI18n();
  const { builders, loading: settingsLoading, error, retry } = useMenuBuilders();
  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;
  const pending = loading || settingsLoading;

  return (
    <section aria-labelledby="menu-builders-title" aria-busy={pending} className="mt-8">
      <h2 id="menu-builders-title" className="display text-2xl font-black text-primary-dark">{t.buildYourOwn}</h2>
      {error && <div role="alert" className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <p>{t.buildersLoadFailed}</p>
        <button type="button" onClick={retry} className="rounded-full border border-border px-4 py-2 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">{t.retry}</button>
      </div>}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {MENU_BUILDERS.map((builder) => {
          const item = !error && !pending ? builderItem(builder, menuItems, builders) : null;
          const price = builderStartingPrice(item, sizeOptions);
          const available = !error && !pending && isInStock(item) && price !== null;
          const detail = pending ? t.loading : !item || price === null ? t.builderUnavailable
            : !isInStock(item) ? t.outOfStock : `${t.builderFrom} ${formatSAR(price)}`;
          const content = <>
            <div className="flex aspect-[2/1] items-center justify-center overflow-hidden bg-secondary">
              {item?.image ? <MenuImage src={item.image} alt="" className="h-full w-full" /> : <ChefHat size={44} className="text-primary" aria-hidden="true" />}
            </div>
            <div className="flex flex-1 flex-col gap-2 p-5">
              <h3 className="display text-xl font-bold text-primary-dark">{t[builder.titleKey]}</h3>
              <p className="text-sm text-muted-foreground">{t.builderCardHint}</p>
              <p className="text-sm font-semibold text-primary">{detail}</p>
              {available && <span className="mt-auto flex items-center gap-2 pt-3 text-sm font-bold text-primary-dark">{t.startBuilding}<Arrow size={17} aria-hidden="true" /></span>}
            </div>
          </>;
          const className = "flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm";
          return available ? <Link key={builder.id} href={{ pathname: "/item", query: { id: item.id, builder: builder.id } }}
            className={`${className} transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary`}>{content}</Link>
            : <div key={builder.id} aria-disabled="true" className={className}>{content}</div>;
        })}
      </div>
    </section>
  );
}
