"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import {
  getMainDisciplines,
  getModalitiesForParent,
  isMainDiscipline,
  type MainDisciplineId,
  type ModalityId,
} from "@/data/disciplines";
import { getProductBySlug, type ProductId } from "@/data/products";
import { getActiveInstructors } from "@/data/instructors";
import { useCart } from "@/context/CartContext";
import { buildCartItem, areConsecutiveDates } from "@/lib/cart";
import {
  calculateSessionPrice,
  getProductBookingConfig,
  getSlotLabel,
  getSlotsForProduct,
  type TimeSlotId,
} from "@/lib/booking-config";
import { pickLocale } from "@/lib/locale";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { MultiDatePicker } from "@/components/cart/MultiDatePicker";
import { TimeSlotPicker } from "@/components/cart/TimeSlotPicker";
import { BookingPriceSummary } from "@/components/cart/BookingPriceSummary";

type AddToCartModalProps = {
  open: boolean;
  onClose: () => void;
  productId: ProductId;
  defaultDiscipline?: MainDisciplineId;
  defaultInstructorSlug?: string;
  defaultInstructorName?: string;
};

export function AddToCartModal({
  open,
  onClose,
  productId,
  defaultDiscipline,
  defaultInstructorSlug,
  defaultInstructorName,
}: AddToCartModalProps) {
  const t = useTranslations("cart");
  const locale = useLocale();
  const { addItems } = useCart();
  const product = getProductBySlug(productId);
  const bookingConfig = getProductBookingConfig(productId);
  const slots = getSlotsForProduct(productId);

  const [dates, setDates] = useState<string[]>([]);
  const [timeSlotId, setTimeSlotId] = useState<TimeSlotId>(bookingConfig.defaultSlotId);
  const [participants, setParticipants] = useState(bookingConfig.minPeople ?? product?.minPeople ?? 1);
  const [discipline, setDiscipline] = useState<MainDisciplineId | "">(defaultDiscipline ?? "");
  const [modality, setModality] = useState<ModalityId | "">("");
  const [instructorSlug, setInstructorSlug] = useState(defaultInstructorSlug ?? "");
  const [notes, setNotes] = useState("");
  const [added, setAdded] = useState(false);
  const [addedCount, setAddedCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useBodyScrollLock(open && !!product);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setDates([]);
      setTimeSlotId(bookingConfig.defaultSlotId);
      setParticipants(bookingConfig.minPeople ?? product?.minPeople ?? 1);
      setDiscipline(defaultDiscipline ?? "");
      setModality("");
      setInstructorSlug(defaultInstructorSlug ?? "");
      setNotes("");
      setAdded(false);
      setAddedCount(0);
    }
  }, [open, product, defaultDiscipline, defaultInstructorSlug, bookingConfig]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const sessionPrice = useMemo(
    () => calculateSessionPrice(productId, participants, timeSlotId),
    [productId, participants, timeSlotId],
  );

  if (!mounted || !open || !product) return null;

  const availableDisciplines = getMainDisciplines().filter((d) =>
    product.disciplines.includes(d.id),
  );

  const availableModalities =
    discipline && (discipline === "esqui" || discipline === "snowboard")
      ? getModalitiesForParent(discipline)
      : [];

  const instructors = getActiveInstructors().filter((i) =>
    !discipline || i.disciplines.includes(discipline),
  );

  const minPeople = bookingConfig.minPeople ?? product.minPeople ?? 1;
  const maxPeople = bookingConfig.maxPeople ?? product.maxPeople ?? 8;
  const minDays = bookingConfig.minDays;
  const maxDays = bookingConfig.maxDays;
  const requireConsecutiveDays = bookingConfig.requireConsecutiveDays ?? false;

  const datesValid =
    dates.length > 0 &&
    (!minDays || dates.length >= minDays) &&
    (!maxDays || dates.length <= maxDays) &&
    (!requireConsecutiveDays || areConsecutiveDates(dates));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!datesValid || sessionPrice === null) return;
    if (participants < minPeople || participants > maxPeople) return;

    const instructor = instructors.find((i) => i.slug === instructorSlug);
    const slotLabel = getSlotLabel(timeSlotId, locale);
    const trimmedNotes = notes.trim() || undefined;

    const newItems = dates
      .map((date) =>
        buildCartItem({
          productId,
          discipline: discipline || undefined,
          modality: modality || undefined,
          instructorSlug: instructor?.slug,
          instructorName: instructor?.name ?? defaultInstructorName,
          date,
          timeSlotId,
          timeSlotLabel: slotLabel,
          participants,
          notes: trimmedNotes,
          locale,
        }),
      )
      .filter((item): item is NonNullable<typeof item> => item !== null);

    if (newItems.length === 0) return;

    addItems(newItems);
    setAddedCount(newItems.length);
    setAdded(true);
    setTimeout(() => onClose(), 1400);
  }

  const modal = (
    <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-pizarra/60 backdrop-blur-sm"
        aria-label={t("close")}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-to-cart-title"
        className="relative flex w-full max-w-2xl max-h-[min(92dvh,100%)] flex-col rounded-t-2xl bg-white shadow-2xl sm:max-h-[min(90dvh,100%)] sm:rounded-2xl"
      >
        <div className="shrink-0 border-b border-hielo/10 bg-white px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="eyebrow">{t("addToCart")}</p>
              <h2 id="add-to-cart-title" className="font-display text-xl font-semibold text-pizarra">
                {pickLocale(locale, product.titleEs, product.titleEn)}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted hover:bg-hielo/8"
              aria-label={t("close")}
            >
              ×
            </button>
          </div>
        </div>

        {added ? (
          <div className="px-6 py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-hielo/10 text-2xl text-hielo">
              ✓
            </div>
            <p className="mt-4 font-semibold text-hielo">{t("added")}</p>
            <p className="mt-2 text-sm text-muted">
              {t("addedDays", { count: addedCount })}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
              <p className="text-sm text-muted">
                {pickLocale(locale, product.shortDescriptionEs, product.shortDescriptionEn)}
              </p>

              <MultiDatePicker
                locale={locale}
                dates={dates}
                onChange={setDates}
                minDays={minDays}
                maxDays={maxDays}
                requireConsecutiveDays={requireConsecutiveDays}
                labels={{
                  title: minDays && maxDays ? t("courseDates") : t("dates"),
                  hint:
                    minDays && maxDays
                      ? t("courseDatesHint", { min: minDays, max: maxDays })
                      : t("datesHint"),
                  empty:
                    minDays && maxDays
                      ? t("courseDatesEmpty", { min: minDays, max: maxDays })
                      : t("datesEmpty"),
                }}
              />

              {slots.length > 0 && (
                <TimeSlotPicker
                  locale={locale}
                  slots={slots}
                  value={timeSlotId}
                  onChange={(id) => setTimeSlotId(id as TimeSlotId)}
                  title={slots.length === 1 ? t("fullDaySchedule") : t("timeSlot")}
                />
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="cart-participants" className="mb-1.5 block text-sm font-medium">
                    {t("participants")} *
                  </label>
                  <input
                    id="cart-participants"
                    type="number"
                    required
                    min={minPeople}
                    max={maxPeople}
                    value={participants}
                    onChange={(e) => setParticipants(Number(e.target.value))}
                    className="w-full rounded-xl border border-hielo/15 bg-nieve px-4 py-3 text-sm focus:border-hielo focus:outline-none"
                  />
                  <p className="mt-1 text-xs text-muted">
                    {minPeople}–{maxPeople} {t("peopleRange")}
                    {productId === "curso-snow" &&
                      pickLocale(
                        locale,
                        ` · Mínimo ${minPeople} para realizar el curso`,
                        ` · Minimum ${minPeople} required to run the course`,
                      )}
                  </p>
                </div>

                {availableDisciplines.length > 1 ? (
                  <div>
                    <label htmlFor="cart-discipline" className="mb-1.5 block text-sm font-medium">
                      {t("discipline")}
                    </label>
                    <select
                      id="cart-discipline"
                      value={discipline}
                      onChange={(e) => {
                        const value = e.target.value;
                        setDiscipline(value && isMainDiscipline(value as MainDisciplineId) ? (value as MainDisciplineId) : "");
                        setModality("");
                        setInstructorSlug("");
                      }}
                      className="w-full rounded-xl border border-hielo/15 bg-nieve px-4 py-3 text-sm focus:border-hielo focus:outline-none"
                    >
                      <option value="">{t("selectDiscipline")}</option>
                      {availableDisciplines.map((d) => (
                        <option key={d.id} value={d.id}>
                          {pickLocale(locale, d.nameEs, d.nameEn)}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label htmlFor="cart-instructor" className="mb-1.5 block text-sm font-medium">
                      {t("instructor")}
                    </label>
                    <select
                      id="cart-instructor"
                      value={instructorSlug}
                      onChange={(e) => setInstructorSlug(e.target.value)}
                      className="w-full rounded-xl border border-hielo/15 bg-nieve px-4 py-3 text-sm focus:border-hielo focus:outline-none"
                    >
                      <option value="">{t("anyInstructor")}</option>
                      {instructors.map((i) => (
                        <option key={i.slug} value={i.slug}>
                          {i.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {availableModalities.length > 0 && (
                <div>
                  <label htmlFor="cart-modality" className="mb-1.5 block text-sm font-medium">
                    {t("modality")}
                  </label>
                  <select
                    id="cart-modality"
                    value={modality}
                    onChange={(e) => setModality(e.target.value as ModalityId | "")}
                    className="w-full rounded-xl border border-hielo/15 bg-nieve px-4 py-3 text-sm focus:border-hielo focus:outline-none"
                  >
                    <option value="">{t("selectModality")}</option>
                    {availableModalities.map((m) => (
                      <option key={m.id} value={m.id}>
                        {pickLocale(locale, m.nameEs, m.nameEn)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {availableDisciplines.length > 1 && (
                <div>
                  <label htmlFor="cart-instructor-2" className="mb-1.5 block text-sm font-medium">
                    {t("instructor")}
                  </label>
                  <select
                    id="cart-instructor-2"
                    value={instructorSlug}
                    onChange={(e) => setInstructorSlug(e.target.value)}
                    className="w-full rounded-xl border border-hielo/15 bg-nieve px-4 py-3 text-sm focus:border-hielo focus:outline-none"
                  >
                    <option value="">{t("anyInstructor")}</option>
                    {instructors.map((i) => (
                      <option key={i.slug} value={i.slug}>
                        {i.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label htmlFor="cart-notes" className="mb-1.5 block text-sm font-medium">
                  {t("notes")}
                </label>
                <textarea
                  id="cart-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t("notesPlaceholder")}
                  className="w-full rounded-xl border border-hielo/15 bg-nieve px-4 py-3 text-sm focus:border-hielo focus:outline-none"
                />
              </div>
            </div>

            <div className="shrink-0 space-y-3 border-t border-hielo/10 bg-white px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
              <BookingPriceSummary
                locale={locale}
                productId={productId}
                sessionPrice={sessionPrice}
                datesCount={dates.length}
                participants={participants}
              />

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={!datesValid || sessionPrice === null}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {dates.length > 1
                    ? t("addDaysToCart", { count: dates.length })
                    : t("addToCart")}
                </button>
                <button type="button" onClick={onClose} className="btn-secondary flex-1">
                  {t("cancel")}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
