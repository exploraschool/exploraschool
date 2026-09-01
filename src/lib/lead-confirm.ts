import { createHmac, timingSafeEqual } from "node:crypto";

export function createLeadConfirmToken(leadId: string, secret: string): string {
  return createHmac("sha256", secret).update(leadId).digest("hex").slice(0, 32);
}

export function verifyLeadConfirmToken(leadId: string, token: string, secret: string): boolean {
  const expected = createLeadConfirmToken(leadId, secret);
  if (token.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}
