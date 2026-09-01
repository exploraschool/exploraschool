"use client";

import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { pickLocale } from "@/lib/locale";

type InstructorBookCTAProps = {
  locale: string;
  instructorName: string;
  instructorSlug: string;
};

export function InstructorBookCTA({ locale, instructorName, instructorSlug }: InstructorBookCTAProps) {
  return (
    <div className="mt-8 flex flex-wrap gap-4">
      <AddToCartButton
        productId="particular"
        defaultInstructorSlug={instructorSlug}
        defaultInstructorName={instructorName}
        label={pickLocale(locale, "Reservar con " + instructorName, "Book with " + instructorName)}
      />
    </div>
  );
}
