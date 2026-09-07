"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag, User, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/hooks/useCart";
import LanguageToggle from "./LanguageToggle";
import { LAST_ORDER_KEY } from "@/lib/utils";

const NAV = [
  { href: "/", key: "navHome" },
  { href: "/menu", key: "navMenu" },
  { href: "/locations", key: "navLocations" },
  { href: "/about", key: "navAbout" },
];

export default function Header() {
  const { t } = useI18n();
  const { itemCount } = useCart();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastOrderId, setLastOrderId] = useState("");

  useEffect(() => {
    setLastOrderId(localStorage.getItem(LAST_ORDER_KEY) || "");
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" className="h-10 w-10 rounded-full bg-card object-contain p-0.5 shadow-sm" />
          <span className="display text-lg font-black leading-none text-primary-dark sm:text-xl">
            {t.appName}
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-muted-foreground transition hover:text-foreground"
            >
              {t[item.key]}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {lastOrderId ? (
            <Link
              href={`/track?id=${lastOrderId}`}
              className="hidden text-sm font-semibold text-accent sm:inline"
            >
              {t.lastOrder}
            </Link>
          ) : null}
          <LanguageToggle className="hidden sm:inline-flex" />
          <Link
            href="/account"
            className="rounded-full p-2 text-foreground hover:bg-secondary"
            aria-label={t.navAccount}
          >
            <User size={20} />
          </Link>
          <Link
            href="/cart"
            className="relative rounded-full p-2 text-foreground hover:bg-secondary"
            aria-label={t.cart}
          >
            <ShoppingBag size={20} />
            {itemCount > 0 ? (
              <span className="absolute -top-0.5 -end-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
                {itemCount}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            className="rounded-full p-2 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border bg-card px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-base font-semibold"
              >
                {t[item.key]}
              </Link>
            ))}
            <Link href="/orders" onClick={() => setOpen(false)} className="font-semibold">
              {t.navOrders}
            </Link>
            <LanguageToggle />
          </div>
        </div>
      ) : null}
    </header>
  );
}
