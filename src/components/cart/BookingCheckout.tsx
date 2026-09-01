"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { useCart } from "@/context/CartContext";
import { estimateCartTotal } from "@/lib/cart";
import { buildBookingEmail } from "@/lib/booking-email";
import { pickLocale } from "@/lib/locale";
import { earlyBirdDiscountLabel, isEarlyBirdActive } from "@/lib/promotions";
import { site } from "@/data/site";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { BookingCartLine } from "@/components/cart/BookingCartLine";
import { EarlyBirdBanner } from "@/components/EarlyBirdBanner";
import { PriceTag } from "@/components/PriceTag";
import { getHighlightedProducts } from "@/data/products";

const inputClass =
  "w-full rounded-xl border border-hielo/15 bg-nieve px-4 py-3 text-sm text-pizarra placeholder:text-muted focus:border-hielo focus:outline-none";

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

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.date.localeCompare(b.date) || a.timeSlotLabel.localeCompare(b.timeSlotLabel)),
    [items],
  );

  const total = estimateCartTotal(items);
  const highlighted = getHighlightedProducts().slice(0, 3);

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

    const { body } = buildBookingEmail({ locale, items: sortedItems, customer });

    try {
      const response = await fetch("/api/leads", {
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
          bookingItems: sortedItems.map(({ id: _id, ...item }) => item),
          estimatedTotal: total,
        }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }
    } catch {
      setError(true);
      return;
    }

    clearCart();
    setSent(true);
  }

  if (!isReady) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-muted">{tc("loading")}</p>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-hielo/10 bg-white p-8 text-center shadow-[0_8px_32px_rgba(10,18,25,0.06)] sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-hielo/10 text-hielo">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="mt-5 font-display text-2xl font-semibold text-hielo">{t("bookingSent")}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">{t("bookingSentDesc")}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => {
              clearCart();
              setSent(false);
            }}
            className="btn-secondary !w-auto"
          >
            {t("newBooking")}
          </button>
          <a href={site.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-primary !w-auto">
            WhatsApp
          </a>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-hielo/10 bg-white px-6 py-10 text-center shadow-[0_8px_32px_rgba(10,18,25,0.06)] sm:px-10 sm:py-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-hielo/8 text-hielo">
            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h15l-1.5 9h-12L6 6z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6 5 3H2" />
            </svg>
          </div>
          <h2 className="mt-6 font-display text-2xl font-semibold text-hielo">{t("emptyTitle")}</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted">{t("emptyDesc")}</p>
          <Link href="/clases" className="btn-primary mt-8 inline-flex !w-auto">
            {t("browseClasses")}
          </Link>
        </div>

        <ol className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { n: "1", title: t("stepClasses"), desc: t("stepClassesDesc") },
            { n: "2", title: t("stepDetails"), desc: t("stepDetailsDesc") },
            { n: "3", title: t("stepSend"), desc: t("stepSendDesc") },
          ].map((step) => (
            <li key={step.n} className="rounded-2xl border border-hielo/10 bg-nieve/50 p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-hielo text-sm font-bold text-white">
                {step.n}
              </span>
              <h3 className="mt-3 font-display font-semibold text-hielo">{step.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{step.desc}</p>
            </li>
          ))}
        </ol>

        <div className="mt-12">
          <p className="text-center text-sm font-bold uppercase tracking-wider text-hielo">{t("suggestions")}</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {highlighted.map((product) => (
              <article key={product.id} className="flex h-full flex-col rounded-2xl border border-hielo/10 bg-white p-5">
                <h3 className="font-display font-semibold text-pizarra">
                  {pickLocale(locale, product.titleEs, product.titleEn)}
                </h3>
                {product.fromPrice && (
                  <p className="mt-2">
                    <PriceTag price={product.fromPrice} locale={locale} prefix={pickLocale(locale, "desde ", "from ")} size="sm" />
                  </p>
                )}
                <AddToCartButton productId={product.id} className="mt-auto pt-4 !w-full" />
              </article>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted">{t("lessonsCount", { count: items.length })}</p>
          <h2 className="font-display text-2xl font-semibold text-hielo sm:text-3xl">{t("yourBooking")}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/clases" className="btn-secondary !w-auto text-sm">
            + {t("addMore")}
          </Link>
          <button
            type="button"
            onClick={() => {
              if (window.confirm(t("clearCartConfirm"))) clearCart();
            }}
            className="rounded-full border border-hielo/15 px-4 py-2.5 text-sm font-semibold text-muted transition hover:border-accent/30 hover:text-accent"
          >
            {t("clearCart")}
          </button>
        </div>
      </div>

      <EarlyBirdBanner locale={locale} />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr] xl:gap-8">
        <div className="space-y-4">
          {sortedItems.map((item, index) => (
            <BookingCartLine
              key={item.id}
              item={item}
              index={index}
              locale={locale}
              itemLabel={t("item")}
              peopleLabel={t("people")}
              removeLabel={t("remove")}
              onRemove={() => removeItem(item.id)}
            />
          ))}
        </div>

        <div className="xl:sticky xl:top-20 xl:max-h-[calc(100dvh-5.5rem)] xl:self-start">
          <form
            onSubmit={handleSend}
            className="overflow-hidden rounded-2xl border border-hielo/10 bg-white shadow-[0_8px_32px_rgba(10,18,25,0.06)] xl:max-h-[calc(100dvh-5.5rem)] xl:overflow-y-auto xl:overscroll-contain"
          >
            <div className="border-b border-hielo/10 bg-nieve/60 px-5 py-5 sm:px-6">
              <h2 className="font-display text-xl font-semibold text-hielo">{t("checkout")}</h2>
              <p className="mt-1.5 text-sm text-muted">{t("checkoutDesc")}</p>
            </div>

            <div className="space-y-4 px-5 py-5 sm:px-6">
              <div className="rounded-2xl bg-gradient-to-br from-hielo to-hielo-light px-5 py-4 text-white">
                <p className="text-xs font-bold uppercase tracking-wider text-white/80">{t("estimatedTotal")}</p>
                <p className="mt-1 font-display text-3xl font-semibold">{total} €</p>
                {isEarlyBirdActive() && (
                  <p className="mt-2 text-xs font-medium text-oro-light">{earlyBirdDiscountLabel(locale)}</p>
                )}
                <p className="mt-1 text-xs text-white/75">{t("vatIncluded")}</p>
              </div>

              <ul className="flex flex-wrap gap-2">
                {[t("reassuranceNoPay"), t("reassuranceEmail")].map((label) => (
                  <li
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-hielo/15 bg-nieve px-3 py-1 text-xs font-medium text-muted"
                  >
                    <svg className="h-3.5 w-3.5 text-hielo" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    {label}
                  </li>
                ))}
              </ul>

              <div>
                <label htmlFor="bk-name" className="mb-1.5 block text-sm font-medium">
                  {t("yourName")} *
                </label>
                <input id="bk-name" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="bk-email" className="mb-1.5 block text-sm font-medium">
                    Email *
                  </label>
                  <input
                    id="bk-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="bk-phone" className="mb-1.5 block text-sm font-medium">
                    {t("yourPhone")}
                  </label>
                  <input
                    id="bk-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="bk-msg" className="mb-1.5 block text-sm font-medium">
                  {t("yourMessage")}
                </label>
                <textarea
                  id="bk-msg"
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t("messagePlaceholder")}
                  className={inputClass}
                />
              </div>

              <label className="flex items-start gap-3 text-sm text-muted">
                <input
                  type="checkbox"
                  required
                  checked={privacy}
                  onChange={(e) => setPrivacy(e.target.checked)}
                  className="mt-1 rounded border-hielo/20"
                />
                <span>{t("privacy")}</span>
              </label>

              <button type="submit" className="btn-primary w-full">
                {t("sendBooking")}
              </button>

              <p className="text-center text-xs text-muted">
                {t("emailTo")}{" "}
                <a href={`mailto:${site.email}`} className="font-medium text-hielo hover:text-accent">
                  {site.email}
                </a>
              </p>

              <div className="rounded-xl border border-hielo/10 bg-nieve px-4 py-3 text-center text-sm text-muted">
                {t("needHelp")}{" "}
                <a href={site.whatsappUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-hielo hover:text-accent">
                  WhatsApp
                </a>
              </div>

              {error && <p className="text-sm text-accent">{tc("error")}</p>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
