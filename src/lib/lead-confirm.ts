import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

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

/** Tokens persisted on the lead so email links work even if Firebase/Vercel secrets drift. */
export function createStoredLeadActionTokens(
  leadId: string,
  secret = process.env.LEAD_CONFIRM_SECRET,
): { confirmToken: string; cancelToken: string } {
  if (secret) {
    return {
      confirmToken: createLeadConfirmToken(leadId, secret),
      cancelToken: createLeadCancelToken(leadId, secret),
    };
  }
  return {
    confirmToken: randomBytes(16).toString("hex"),
    cancelToken: randomBytes(16).toString("hex"),
  };
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

export function verifyStoredOrHmacLeadToken(params: {
  leadId: string;
  token: string;
  action: LeadEmailAction;
  storedToken?: string | null;
  secret?: string | null;
}): boolean {
  const { leadId, token, action, storedToken, secret } = params;
  const normalized = token.trim();
  if (!normalized) return false;

  if (storedToken && safeEqualHex(normalized, String(storedToken).trim())) {
    return true;
  }

  if (secret) {
    return verifyLeadActionToken(leadId, normalized, secret, action);
  }

  return false;
}
