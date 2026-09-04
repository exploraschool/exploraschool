type BookingItemLike = {
  productId?: unknown;
  date?: unknown;
  timeSlotId?: unknown;
  timeSlotLabel?: unknown;
  participants?: unknown;
};

export function bookingOfferFingerprint(data: {
  email?: unknown;
  bookingItems?: unknown;
}): string {
  const email = String(data.email ?? "").trim().toLowerCase();
  const items = Array.isArray(data.bookingItems) ? data.bookingItems : [];
  const itemKey = items
    .map((raw) => {
      const item = (raw ?? {}) as BookingItemLike;
      return [
        String(item.productId ?? ""),
        String(item.date ?? ""),
        String(item.timeSlotId ?? item.timeSlotLabel ?? ""),
        String(item.participants ?? ""),
      ].join("|");
    })
    .filter((key) => key !== "|||")
    .sort()
    .join(";");

  return `${email}::${itemKey}`;
}

export function hasBookingOfferFingerprint(fingerprint: string): boolean {
  const [email, itemKey] = fingerprint.split("::");
  return Boolean(email && itemKey);
}
