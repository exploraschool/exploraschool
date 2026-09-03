import { createHmac, timingSafeEqual } from "node:crypto";

export type LeadEmailAction = "confirm" | "cancel";

export function createLeadConfirmToken(leadId: string, secret: string): string {
  return createHmac("sha256", secret).update(leadId).digest("hex").slice(0, 32);
}

export function createLeadCancelToken(leadId: string, secret: string): string {
  return createHmac("sha256", secret).update(`cancel:${leadId}`).digest("hex").slice(0, 32);
}

export function createLeadActionToken(
  leadId: string,
  action: LeadEmailAction,
  secret: string,
): string {
  return action === "cancel"
    ? createLeadCancelToken(leadId, secret)
    : createLeadConfirmToken(leadId, secret);
}

function safeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export function verifyLeadConfirmToken(leadId: string, token: string, secret: string): boolean {
  return safeEqualHex(token, createLeadConfirmToken(leadId, secret));
}

export function verifyLeadCancelToken(leadId: string, token: string, secret: string): boolean {
  return safeEqualHex(token, createLeadCancelToken(leadId, secret));
}

export function verifyLeadActionToken(
  leadId: string,
  token: string,
  secret: string,
  action: LeadEmailAction,
): boolean {
  return action === "cancel"
    ? verifyLeadCancelToken(leadId, token, secret)
    : verifyLeadConfirmToken(leadId, token, secret);
}
