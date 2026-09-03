"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import {
  getMainDisciplines,
  getModalitiesForParent,
  getSingleProductDiscipline,
  isIndividualizedDiscipline,
  isMainDiscipline,
  type MainDisciplineId,
  type ModalityId,
} from "@/data/disciplines";
import { getProductBySlug, type ProductId } from "@/data/products";
import {
  getInstructorsForBooking,
  getInstructorBySlug,
  instructorCanTeachProduct,
  instructorTeachesDiscipline,
  isSnowboardOnlyInstructor,
  type InstructorSlug,
} from "@/data/instructors";
import { useCart } from "@/context/CartContext";
import { buildCartItem, areConsecutiveDates } from "@/lib/cart";
import {
  calculateSessionPrice,
  clampParticipantCount,
  getParticipantLimits,
  getProductBookingConfig,
  getSlotLabel,
  getSlotsForProduct,
  usesPairBasePricing,
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
  defaultTimeSlotId?: TimeSlotId;
  defaultParticipants?: number;
};

export function AddToCartModal({
  open,
  onClose,
  productId,
  defaultDiscipline,
  defaultInstructorSlug,
  defaultInstructorName,
  defaultTimeSlotId,
  defaultParticipants,
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
      const slotId =
        defaultTimeSlotId && bookingConfig.slotIds.includes(defaultTimeSlotId)
          ? defaultTimeSlotId
          : bookingConfig.defaultSlotId;
      const preferredInstructor = defaultInstructorSlug ?? "";
      const singleDiscipline = product
        ? getSingleProductDiscipline(product.disciplines)
        : undefined;
      const initialDiscipline =
        preferredInstructor &&
        isSnowboardOnlyInstructor(preferredInstructor) &&
        product?.disciplines.includes("snowboard")
          ? "snowboard"
          : (defaultDiscipline ?? singleDiscipline ?? "");
      const { minPeople: limitsMin, maxPeople: limitsMax } = getParticipantLimits(
        productId,
        initialDiscipline || undefined,
      );
      const people =
        initialDiscipline && isIndividualizedDiscipline(initialDiscipline)
          ? 1
          : defaultParticipants !== undefined &&
              defaultParticipants >= limitsMin &&
              defaultParticipants <= limitsMax
            ? defaultParticipants
            : limitsMin;

      setDates([]);
      setTimeSlotId(slotId);
      setParticipants(people);
      setDiscipline(initialDiscipline);
      setModality("");
      setInstructorSlug(preferredInstructor);
      setNotes("");
      setAdded(false);
      setAddedCount(0);
    }
  }, [
    open,
    product,
    productId,
    defaultDiscipline,
    defaultInstructorSlug,
    defaultTimeSlotId,
    defaultParticipants,
    bookingConfig,
  ]);

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

  const resolvedProduct = product;
  const implicitDiscipline = getSingleProductDiscipline(resolvedProduct.disciplines);
  const effectiveDiscipline = discipline || implicitDiscipline || undefined;

  const availableDisciplines = getMainDisciplines().filter((d) =>
    resolvedProduct.disciplines.includes(d.id),
  );

  const availableModalities =
    effectiveDiscipline && (effectiveDiscipline === "esqui" || effectiveDiscipline === "snowboard")
      ? getModalitiesForParent(effectiveDiscipline)
      : [];

  const instructors = getInstructorsForBooking(
    resolvedProduct.disciplines,
    effectiveDiscipline,
  );

  const disciplineLocked =
    !!instructorSlug &&
    isSnowboardOnlyInstructor(instructorSlug) &&
    resolvedProduct.disciplines.includes("snowboard");

  function handleDisciplineChange(value: string) {
    const next =
      value && isMainDiscipline(value as MainDisciplineId) ? (value as MainDisciplineId) : "";
    setDiscipline(next);
    setModality("");
    if (next && isIndividualizedDiscipline(next)) {
      setParticipants(1);
    } else if (next) {
      setParticipants((current) => clampParticipantCount(current, productId, next));
    }
    if (instructorSlug) {
      const instructor = getInstructorBySlug(instructorSlug as InstructorSlug);
      if (instructor && next && !instructorTeachesDiscipline(instructor, next)) {
        setInstructorSlug("");
      } else if (instructor && !next && !instructorCanTeachProduct(instructor, resolvedProduct.disciplines)) {
        setInstructorSlug("");
      }
    }
  }

  function handleInstructorChange(slug: string) {
    setInstructorSlug(slug);
    if (slug && isSnowboardOnlyInstructor(slug) && resolvedProduct.disciplines.includes("snowboard")) {
      setDiscipline("snowboard");
      setModality("");
    }
  }

  const { minPeople, maxPeople } = getParticipantLimits(productId, effectiveDiscipline);
  const isIndividualized = effectiveDiscipline
    ? isIndividualizedDiscipline(effectiveDiscipline)
    : false;
  const minDays = bookingConfig.minDays;
  const maxDays = bookingConfig.maxDays;
  const requireConsecutiveDays = bookingConfig.requireConsecutiveDays ?? false;

  const datesValid =
    dates.length > 0 &&
    (!minDays || dates.length >= minDays) &&
    (!maxDays || dates.length <= maxDays) &&
    (!requireConsecutiveDays || areConsecutiveDates(dates));

  const resolvedDisciplineForSubmit: MainDisciplineId | undefined =
    instructorSlug &&
    isSnowboardOnlyInstructor(instructorSlug) &&
    resolvedProduct.disciplines.includes("snowboard")
      ? "snowboard"
      : effectiveDiscipline;

  const disciplineValid = Boolean(resolvedDisciplineForSubmit);
  const canAddToCart = datesValid && disciplineValid && sessionPrice !== null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const people = clampParticipantCount(participants, productId, effectiveDiscipline);
    setParticipants(people);
    if (!datesValid || !disciplineValid || sessionPrice === null) return;
    if (people < minPeople || people > maxPeople) return;

    const instructor = instructors.find((i) => i.slug === instructorSlug);
    const resolvedDiscipline = resolvedDisciplineForSubmit;
    if (!resolvedDiscipline) return;

    const slotLabel = getSlotLabel(timeSlotId, locale);
    const trimmedNotes = notes.trim() || undefined;

    const newItems = dates
      .map((date) =>
        buildCartItem({
          productId,
          discipline: resolvedDiscipline,
          modality: modality || undefined,
          instructorSlug: instructor?.slug,
          instructorName: instructor?.name ?? defaultInstructorName,
          date,
          timeSlotId,
          timeSlotLabel: slotLabel,
          participants: people,
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
    <div className="fixed inset-0 z-[130] overscroll-none">
      <button
        type="button"
        className="absolute inset-0 bg-pizarra/60 backdrop-blur-sm modal-overlay"
        aria-label={t("close")}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-to-cart-title"
        className="fixed inset-x-0 bottom-0 z-[1] flex h-[100dvh] max-h-[100dvh] min-h-0 flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:h-[min(88dvh,calc(100dvh-2rem))] sm:max-h-[min(88dvh,calc(100dvh-2rem))] sm:w-[min(100%,42rem)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl"
      >
        <div className="shrink-0 border-b border-hielo/10 bg-white px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="eyebrow text-[0.65rem]">{t("addToCart")}</p>
              <h2 id="add-to-cart-title" className="font-display text-lg font-semibold text-pizarra sm:text-xl">
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
          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="modal-scroll min-h-0 flex-1 px-4 py-4 sm:px-6 sm:py-5">
              <div className="space-y-4 sm:space-y-5">
              <p className="hidden text-sm text-muted sm:block">
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
                    step={1}
                    inputMode="numeric"
                    value={Number.isFinite(participants) ? participants : ""}
                    disabled={isIndividualized}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === "") {
                        setParticipants(Number.NaN);
                        return;
                      }
                      const next = Number(raw);
                      if (!Number.isFinite(next)) return;
                      setParticipants(Math.trunc(next));
                    }}
                    onBlur={() => {
                      setParticipants(
                        clampParticipantCount(participants, productId, effectiveDiscipline),
                      );
                    }}
                    className="w-full rounded-xl border border-hielo/15 bg-nieve px-4 py-3 text-sm focus:border-hielo focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
                  />
                  <p className="mt-1 text-xs text-muted">
                    {isIndividualized
                      ? pickLocale(
                          locale,
                          "Clase individualizada (1 participante)",
                          "Individual lesson (1 participant)",
                        )
                      : (
                        <>
                          {minPeople}–{maxPeople} {t("peopleRange")}
                          {productId === "curso-snow" &&
                            pickLocale(
                              locale,
                              ` · Mínimo ${minPeople} para realizar el curso`,
                              ` · Minimum ${minPeople} required to run the course`,
                            )}
                          {usesPairBasePricing(productId) &&
                            timeSlotId === "2h-14-16" &&
                            pickLocale(
                              locale,
                              " · Tarifa plana de 1 a 4 personas",
                              " · Flat rate for 1 to 4 people",
                            )}
                          {usesPairBasePricing(productId) &&
                            timeSlotId !== "2h-14-16" &&
                            pickLocale(
                              locale,
                              " · 1 y 2 personas: mismo precio",
                              " · 1 and 2 people: same price",
                            )}
                        </>
                      )}
                  </p>
                </div>

                {availableDisciplines.length > 1 ? (
                  <div>
                    <label htmlFor="cart-discipline" className="mb-1.5 block text-sm font-medium">
                      {t("discipline")} *
                    </label>
                    <select
                      id="cart-discipline"
                      value={discipline}
                      onChange={(e) => handleDisciplineChange(e.target.value)}
                      required
                      disabled={disciplineLocked}
                      className="field-select"
                    >
                      <option value="">{t("selectDiscipline")}</option>
                      {availableDisciplines.map((d) => (
                        <option key={d.id} value={d.id}>
                          {pickLocale(locale, d.nameEs, d.nameEn)}
                        </option>
                      ))}
                    </select>
                    {disciplineLocked && (
                      <p className="mt-1 text-xs text-muted">
                        {pickLocale(
                          locale,
                          "Este instructor solo imparte clases de snowboard.",
                          "This instructor only teaches snowboard lessons.",
                        )}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label htmlFor="cart-instructor" className="mb-1.5 block text-sm font-medium">
                      {t("instructor")}
                    </label>
                    <select
                      id="cart-instructor"
                      value={instructorSlug}
                      onChange={(e) => handleInstructorChange(e.target.value)}
                      className="field-select"
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
                    className="field-select"
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
                    onChange={(e) => handleInstructorChange(e.target.value)}
                    className="field-select"
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
            </div>

            <div className="shrink-0 space-y-1.5 border-t border-hielo/10 bg-white px-3 py-2 pb-[max(0.375rem,env(safe-area-inset-bottom))] sm:space-y-2 sm:px-5 sm:py-2.5">
              <BookingPriceSummary
                locale={locale}
                productId={productId}
                sessionPrice={sessionPrice}
                datesCount={dates.length}
                participants={participants}
                compact
              />

              <div className="modal-action-bar">
                <button
                  type="submit"
                  disabled={!canAddToCart}
                  className="btn-primary modal-action-btn modal-action-btn-primary disabled:opacity-50"
                >
                  <span className="truncate sm:hidden">
                    {dates.length > 1
                      ? pickLocale(locale, `Añadir · ${dates.length} días`, `Add · ${dates.length} days`)
                      : pickLocale(locale, "Añadir", "Add")}
                  </span>
                  <span className="hidden truncate sm:inline">
                    {dates.length > 1
                      ? t("addDaysToCart", { count: dates.length })
                      : t("addToCart")}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary modal-action-btn modal-action-btn-secondary"
                >
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
