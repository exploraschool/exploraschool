const GENERATED_BOOKING_PREFIX = /^(NUEVA RESERVA|NEW BOOKING)\b/;

export function isGeneratedBookingMessage(message: string): boolean {
  return GENERATED_BOOKING_PREFIX.test(message.trim());
}

/** Customer notes only — strips the auto-generated booking dump previously stored in `message`. */
export function customerNotesFromLeadMessage(message: string): string {
  const trimmed = message.trim();
  if (!trimmed) return "";
  if (!isGeneratedBookingMessage(trimmed)) return trimmed;

  const marker = trimmed.match(/(?:^|\n)(?:Mensaje adicional|Additional message):\s*\n/);
  if (!marker || marker.index === undefined) return "";

  const after = trimmed.slice(marker.index + marker[0].length);
  const end = after.search(/\n─/);
  return (end === -1 ? after : after.slice(0, end)).trim();
}
