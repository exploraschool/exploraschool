"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { useCart } from "@/context/CartContext";
import { getDisciplineDisplayName } from "@/data/disciplines";
import { getProductBySlug } from "@/data/products";
import { estimateCartTotal, formatCartDate } from "@/lib/cart";
import { buildBookingEmail } from "@/lib/booking-email";
import { pickLocale } from "@/lib/locale";
import { earlyBirdDiscountLabel, isEarlyBirdActive } from "@/lib/promotions";
import { site } from "@/data/site";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { getHighlightedProducts } from "@/data/products";

export function BookingCheckout() {
  const t = useTranslations("cart");
  const tc = useTranslations("common");
  const locale = useLocale();
  const { items, removeItem, clearCart, isReady } = useCart();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [privacy, setPrivacy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);

  const total = estimateCartTotal(items);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !privacy || items.length === 0) return;

    setError(false);

    const customer = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      message: message.trim() || undefined,
    };

    const { mailto, body } = buildBookingEmail({ locale, items, customer });

    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: customer.name,
          email: customer.email,
          phone: customer.phone ?? "",
          message: body,
          privacy: true,
          locale,
          source: "booking-cart",
        }),
      });
    } catch {
      // mailto still works even if API fails
    }

    window.location.href = mailto;
    setSent(true);
  }

  if (!isReady) {
    return <p className="text-center text-muted">{tc("loading")}</p>;
  }

  if (sent) {
    return (
      <div className="card mx-auto max-w-xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-hielo/10 text-3xl text-hielo">
          ✉
        </div>
        <h2 className="mt-4 font-display text-2xl font-semibold">{t("emailOpened")}</h2>
        <p className="mt-3 text-sm text-muted">{t("emailOpenedDesc")}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button type="button" onClick={() => { clearCart(); setSent(false); }} className="btn-secondary">
            {t("newBooking")}
          </button>
          <Link href="/" className="btn-primary">
            {tc("backHome")}
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    const highlighted = getHighlightedProducts().slice(0, 3);
    return (
      <div className="mx-auto max-w-xl text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-hielo/8 text-4xl">
          🎿
        </div>
        <h2 className="mt-6 font-display text-2xl font-semibold">{t("emptyTitle")}</h2>
        <p className="mt-3 text-muted">{t("emptyDesc")}</p>
        <Link href="/clases" className="btn-primary mt-8 inline-flex">
          {t("browseClasses")}
        </Link>

        <div className="mt-12 text-left">
          <p className="eyebrow">{t("suggestions")}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {highlighted.map((p) => (
              <div key={p.id} className="card">
                <p className="font-semibold text-sm">{pickLocale(locale, p.titleEs, p.titleEn)}</p>
                <AddToCartButton productId={p.id} variant="ghost" className="mt-3 !w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-5 lg:gap-12">
      <div className="lg:col-span-3 space-y-4">
        <h2 className="font-display text-xl font-semibold text-hielo">{t("yourBooking")}</h2>
        {items.map((item, index) => {
          const product = getProductBySlug(item.productId);
          const discLabel = getDisciplineDisplayName(locale, item.discipline, item.modality);

          return (
            <article key={item.id} className="card-interactive flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-oro">
                  {t("item")} {index + 1}
                </p>
                <h3 className="mt-1 font-display text-lg font-semibold text-pizarra">
                  {product ? pickLocale(locale, product.titleEs, product.titleEn) : item.productId}
                </h3>
                <ul className="mt-2 space-y-1 text-sm text-muted">
                  <li>📅 {formatCartDate(item.date, locale)}</li>
                  <li>🕐 {item.timeSlotLabel}</li>
                  <li>👥 {item.participants} {t("people")}</li>
                  {discLabel && <li>⛷ {discLabel}</li>}
                  {item.instructorName && <li>🧑‍🏫 {item.instructorName}</li>}
                  {item.notes && <li>📝 {item.notes}</li>}
                </ul>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                {item.listUnitPrice && item.listUnitPrice > item.lineTotal ? (
                  <div className="text-right">
                    <p className="text-xs text-muted line-through">{item.listUnitPrice} €</p>
                    <p className="text-sm font-semibold text-accent">{item.lineTotal} €</p>
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-accent">{item.lineTotal} €</p>
                )}
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-xs font-medium text-muted transition hover:text-accent"
                >
                  {t("remove")}
                </button>
              </div>
            </article>
          );
        })}

        <Link href="/clases" className="inline-flex text-sm font-semibold text-hielo hover:text-accent">
          + {t("addMore")}
        </Link>
      </div>

      <div className="lg:col-span-2">
        <form onSubmit={handleSend} className="card sticky top-24 space-y-4">
          <h2 className="font-display text-xl font-semibold text-hielo">{t("checkout")}</h2>
          <p className="text-sm text-muted">{t("checkoutDesc")}</p>

          {total > 0 && (
            <div className="rounded-xl bg-nieve px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-muted">{t("estimatedTotal")}</p>
              <p className="font-display text-2xl font-semibold text-accent">{total} €</p>
              {isEarlyBirdActive() && (
                <p className="mt-1 text-xs font-medium text-oro">{earlyBirdDiscountLabel(locale)}</p>
              )}
              <p className="text-xs text-muted">{t("vatIncluded")}</p>
            </div>
          )}

          <div>
            <label htmlFor="bk-name" className="mb-1 block text-sm font-medium">{t("yourName")} *</label>
            <input id="bk-name" required value={name} onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-hielo/15 bg-nieve px-4 py-3 text-sm focus:border-hielo focus:outline-none" />
          </div>
          <div>
            <label htmlFor="bk-email" className="mb-1 block text-sm font-medium">Email *</label>
            <input id="bk-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-hielo/15 bg-nieve px-4 py-3 text-sm focus:border-hielo focus:outline-none" />
          </div>
          <div>
            <label htmlFor="bk-phone" className="mb-1 block text-sm font-medium">{t("yourPhone")}</label>
            <input id="bk-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-hielo/15 bg-nieve px-4 py-3 text-sm focus:border-hielo focus:outline-none" />
          </div>
          <div>
            <label htmlFor="bk-msg" className="mb-1 block text-sm font-medium">{t("yourMessage")}</label>
            <textarea id="bk-msg" rows={3} value={message} onChange={(e) => setMessage(e.target.value)}
              placeholder={t("messagePlaceholder")}
              className="w-full rounded-xl border border-hielo/15 bg-nieve px-4 py-3 text-sm focus:border-hielo focus:outline-none" />
          </div>

          <label className="flex items-start gap-3 text-sm text-muted">
            <input type="checkbox" required checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} className="mt-1" />
            <span>
              {t("privacy")}{" "}
              <Link href="/politica-de-privacidad" className="text-hielo underline">→</Link>
            </span>
          </label>

          <button type="submit" className="btn-primary w-full">
            {t("sendBooking")}
          </button>

          <p className="text-center text-xs text-muted">
            {t("emailTo")} <a href={`mailto:${site.email}`} className="text-hielo hover:text-accent">{site.email}</a>
          </p>

          {error && <p className="text-sm text-accent">{tc("error")}</p>}
        </form>
      </div>
    </div>
  );
}
