"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { MainDisciplineId } from "@/data/disciplines";
import type { ProductId } from "@/data/products";
import { AddToCartModal } from "@/components/cart/AddToCartModal";
import { readPeopleFromLocationSearch } from "@/lib/booking-config";

type AddToCartButtonProps = {
  productId: ProductId;
  defaultDiscipline?: MainDisciplineId;
  defaultInstructorSlug?: string;
  defaultInstructorName?: string;
  defaultParticipants?: number;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  label?: string;
};

export function AddToCartButton({
  productId,
  defaultDiscipline,
  defaultInstructorSlug,
  defaultInstructorName,
  defaultParticipants,
  variant = "primary",
  className = "",
  label,
}: AddToCartButtonProps) {
  const t = useTranslations("cart");
  const [open, setOpen] = useState(false);
  const [resolvedParticipants, setResolvedParticipants] = useState(defaultParticipants);

  function handleOpen() {
    setResolvedParticipants(defaultParticipants ?? readPeopleFromLocationSearch());
    setOpen(true);
  }

  const btnClass =
    variant === "primary"
      ? "btn-primary"
      : variant === "secondary"
        ? "btn-secondary"
        : "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent/10";

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={`${btnClass} ${className}`.trim()}
      >
        {label ?? t("addToCart")}
      </button>
      <AddToCartModal
        open={open}
        onClose={() => setOpen(false)}
        productId={productId}
        defaultDiscipline={defaultDiscipline}
        defaultInstructorSlug={defaultInstructorSlug}
        defaultInstructorName={defaultInstructorName}
        defaultParticipants={resolvedParticipants}
      />
    </>
  );
}
