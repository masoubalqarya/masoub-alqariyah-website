"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Banknote, Car, Check, CreditCard } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { createOrder } from "@/lib/orders";
import {
  CAR_COLORS,
  LAST_ORDER_KEY,
  SAVED_CAR_KEY,
  cn,
  formatSAR,
  generateOrderNumber,
} from "@/lib/utils";

function colorLabel(t, key) {
  const k = `color${key.charAt(0).toUpperCase()}${key.slice(1)}`;
  return t[k] || key;
}

function subscribeNoop() {
  return () => {};
}

function getSavedCarSnapshot() {
  try {
    return localStorage.getItem(SAVED_CAR_KEY);
  } catch {
    return null;
  }
}

export default function CheckoutPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { items, restaurant, total, clearCart, hydrated } = useCart();
  const { ensureAuth, isFullAccount } = useAuth();

  const savedRaw = useSyncExternalStore(
    subscribeNoop,
    getSavedCarSnapshot,
    () => null,
  );
  const savedCar = useMemo(() => {
    if (!savedRaw) return null;
    try {
      return JSON.parse(savedRaw);
    } catch {
      return null;
    }
  }, [savedRaw]);

  const [plateDraft, setPlateDraft] = useState(null);
  const [modelDraft, setModelDraft] = useState(null);
  const [colorDraft, setColorDraft] = useState(null);
  const plate = plateDraft ?? savedCar?.plateNumber ?? "";
  const model = modelDraft ?? savedCar?.carModel ?? "";
  const color = colorDraft ?? savedCar?.carColor ?? "";
  const hasSavedCar = Boolean(savedCar?.plateNumber);

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [needsChange, setNeedsChange] = useState(null);
  const [cashInput, setCashInput] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!hydrated) {
    return <p className="px-4 py-20 text-center text-muted-foreground">{t.loading}</p>;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="display text-3xl font-black">{t.emptyCart}</h1>
        <Link
          href="/menu"
          className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
        >
          {t.emptyCartCta}
        </Link>
      </div>
    );
  }

  const cashNum =
    paymentMethod === "cash" && needsChange === false
      ? total
      : parseFloat(cashInput) || 0;
  const changeAmount =
    paymentMethod === "cash" && needsChange === true ? cashNum - total : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!plate.trim()) {
      setError(t.plateRequired);
      return;
    }
    if (!restaurant?.id) {
      setError(t.restaurantRequired);
      return;
    }
    if (paymentMethod === "cash") {
      if (needsChange === null) {
        setError(t.needChangeQuestion);
        return;
      }
      if (needsChange === true && cashNum < total) {
        setError(t.cashTooLow);
        return;
      }
    }

    setSubmitting(true);
    try {
      await ensureAuth();
      const orderNumber = generateOrderNumber();
      const cashAmount =
        paymentMethod === "cash"
          ? needsChange === false
            ? total
            : cashNum
          : 0;
      const docId = await createOrder(
        {
          orderNumber,
          plateNumber: plate.trim(),
          carColor: color,
          carModel: model.trim(),
          paymentMethod,
          cashAmount,
          changeAmount: paymentMethod === "cash" && needsChange === true ? changeAmount : 0,
          needsChange: paymentMethod === "cash" ? Boolean(needsChange) : false,
          restaurantId: restaurant.id,
          restaurantName:
            locale === "ar"
              ? restaurant.nameAr || restaurant.nameEn
              : restaurant.nameEn || restaurant.nameAr,
          estimatedTime: 15,
        },
        items,
      );
      localStorage.setItem(LAST_ORDER_KEY, docId);
      localStorage.setItem(
        SAVED_CAR_KEY,
        JSON.stringify({
          plateNumber: plate.trim(),
          carModel: model.trim(),
          carColor: color,
        }),
      );
      clearCart();
      router.push(`/track?id=${docId}`);
    } catch {
      setError(t.placeOrderError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="display text-4xl font-black text-primary-dark">{t.checkout}</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        <section className="rounded-3xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">{t.restaurant}</p>
          <p className="mt-1 font-bold">
            {locale === "ar"
              ? restaurant?.nameAr || restaurant?.nameEn
              : restaurant?.nameEn || restaurant?.nameAr}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm">{t.orderTotal}</span>
            <span className="font-black">{formatSAR(total)}</span>
          </div>
        </section>

        <section>
          <h2 className="display flex items-center gap-2 text-2xl font-black">
            <Car size={22} /> {t.carPlateTitle}
          </h2>
          {hasSavedCar ? (
            <p className="mt-2 text-sm text-accent">{t.savedCarInfo}</p>
          ) : null}
          <p className="mt-2 text-sm text-muted-foreground">{t.carPlateHelper}</p>

          <label className="mt-4 block text-sm font-semibold">{t.carPlate}</label>
          <input
            value={plate}
            onChange={(e) => setPlateDraft(e.target.value.toUpperCase())}
            placeholder={t.enterCarPlate}
            required
            className="mt-2 w-full rounded-2xl border border-border bg-card px-4 py-3 outline-none ring-primary focus:ring-2"
          />

          <label className="mt-4 block text-sm font-semibold">{t.carModel}</label>
          <input
            value={model}
            onChange={(e) => setModelDraft(e.target.value)}
            placeholder={t.enterCarModel}
            className="mt-2 w-full rounded-2xl border border-border bg-card px-4 py-3 outline-none ring-primary focus:ring-2"
          />

          <p className="mt-4 text-sm font-semibold">{t.carColor}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {CAR_COLORS.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setColorDraft(c.key)}
                title={colorLabel(t, c.key)}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2",
                  color === c.key ? "border-primary ring-2 ring-primary/30" : "border-border",
                  c.key === "white" && "border-muted-foreground/40",
                )}
                style={{ backgroundColor: c.hex }}
                aria-label={colorLabel(t, c.key)}
              >
                {color === c.key ? (
                  <Check
                    size={16}
                    color={c.key === "white" || c.key === "beige" ? "#111" : "#fff"}
                  />
                ) : null}
              </button>
            ))}
          </div>
          {color ? (
            <p className="mt-2 text-sm text-muted-foreground">{colorLabel(t, color)}</p>
          ) : null}
        </section>

        <section>
          <h2 className="display text-2xl font-black">{t.paymentMethod}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setPaymentMethod("card")}
              className={cn(
                "flex items-center gap-3 rounded-3xl border p-4 text-start",
                paymentMethod === "card"
                  ? "border-primary bg-secondary/60 ring-2 ring-primary/20"
                  : "border-border bg-card",
              )}
            >
              <CreditCard size={20} />
              <span className="font-bold">{t.creditCard}</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("cash")}
              className={cn(
                "flex items-center gap-3 rounded-3xl border p-4 text-start",
                paymentMethod === "cash"
                  ? "border-primary bg-secondary/60 ring-2 ring-primary/20"
                  : "border-border bg-card",
              )}
            >
              <Banknote size={20} />
              <span className="font-bold">{t.cash}</span>
            </button>
          </div>

          {paymentMethod === "cash" ? (
            <div className="mt-4 space-y-3">
              <p className="font-semibold">{t.needChangeQuestion}</p>
              <button
                type="button"
                onClick={() => setNeedsChange(false)}
                className={cn(
                  "block w-full rounded-3xl border p-4 text-start",
                  needsChange === false
                    ? "border-primary bg-secondary/60"
                    : "border-border bg-card",
                )}
              >
                <p className="font-bold">{t.noExactAmount}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t.noChangeNote}</p>
              </button>
              <button
                type="button"
                onClick={() => setNeedsChange(true)}
                className={cn(
                  "block w-full rounded-3xl border p-4 text-start",
                  needsChange === true
                    ? "border-primary bg-secondary/60"
                    : "border-border bg-card",
                )}
              >
                <p className="font-bold">{t.yesNeedChange}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t.deliveryBringsChange}
                </p>
              </button>
              {needsChange === true ? (
                <>
                  <label className="block text-sm font-semibold">
                    {t.cashAmountPrompt}
                  </label>
                  <input
                    type="number"
                    min={total}
                    step="0.01"
                    value={cashInput}
                    onChange={(e) => setCashInput(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-card px-4 py-3 outline-none ring-primary focus:ring-2"
                  />
                </>
              ) : null}
              {needsChange !== null ? (
                <div className="rounded-2xl bg-secondary px-4 py-3 text-sm">
                  <div className="flex justify-between">
                    <span>{t.orderTotal}</span>
                    <span className="font-bold">{formatSAR(total)}</span>
                  </div>
                  {needsChange === true ? (
                    <div className="mt-2 flex justify-between">
                      <span>{t.changeToReturn}</span>
                      <span className="font-bold">
                        {formatSAR(Math.max(0, changeAmount))}
                      </span>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </section>

        {!isFullAccount ? (
          <p className="text-sm text-muted-foreground">{t.guestCheckoutNote}</p>
        ) : null}

        {error ? <p className="text-sm font-semibold text-destructive">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary-dark disabled:opacity-60"
        >
          {submitting ? t.placingOrder : t.confirmOrder}
        </button>
      </form>
    </div>
  );
}
