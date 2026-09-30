/** A contact number we can actually call: 8 to 15 digits, spaces and + allowed. */
export function hasContactPhone(value: unknown): boolean {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}

export function normalizeContactPhone(value: unknown): string {
  const phone = String(value ?? "").trim();
  return hasContactPhone(phone) ? phone.slice(0, 30) : "";
}
