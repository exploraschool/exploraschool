import type { Firestore } from "firebase-admin/firestore";
import { FieldValue } from "firebase-admin/firestore";

export type MarketingContactSource = "booking" | "contact";

export type MarketingContact = {
  email: string;
  name: string;
  phone: string;
  locale: string;
  sources: MarketingContactSource[];
  bookingCount: number;
  contactCount: number;
  firstSeenAt: string;
  lastSeenAt: string;
  lastLeadId?: string;
  lastStatus?: string;
  /** Accepted privacy policy when submitting (eligible for CRM/ops emails). */
  privacyAccepted: boolean;
  updatedAt: string;
};

export function normalizeMarketingEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function marketingContactDocId(email: string): string {
  return normalizeMarketingEmail(email).replace(/\//g, "_");
}

type UpsertInput = {
  email: string;
  name: string;
  phone?: string;
  locale?: string;
  source: MarketingContactSource;
  leadId: string;
  status?: string;
  privacyAccepted?: boolean;
};

export async function upsertMarketingContact(db: Firestore, input: UpsertInput): Promise<void> {
  const email = normalizeMarketingEmail(input.email);
  if (!email || !email.includes("@")) return;

  const now = new Date().toISOString();
  const ref = db.collection("marketingContacts").doc(marketingContactDocId(email));
  const existing = await ref.get();

  if (!existing.exists) {
    const contact: MarketingContact = {
      email,
      name: input.name.trim(),
      phone: (input.phone ?? "").trim(),
      locale: input.locale ?? "es",
      sources: [input.source],
      bookingCount: input.source === "booking" ? 1 : 0,
      contactCount: input.source === "contact" ? 1 : 0,
      firstSeenAt: now,
      lastSeenAt: now,
      lastLeadId: input.leadId,
      lastStatus: input.status,
      privacyAccepted: input.privacyAccepted ?? true,
      updatedAt: now,
    };
    await ref.set(contact);
    return;
  }

  const data = existing.data() as MarketingContact;
  const sources = new Set(data.sources ?? []);
  sources.add(input.source);

  await ref.update({
    name: input.name.trim() || data.name,
    phone: (input.phone ?? "").trim() || data.phone || "",
    locale: input.locale || data.locale || "es",
    sources: Array.from(sources),
    bookingCount: FieldValue.increment(input.source === "booking" ? 1 : 0),
    contactCount: FieldValue.increment(input.source === "contact" ? 1 : 0),
    lastSeenAt: now,
    lastLeadId: input.leadId,
    lastStatus: input.status ?? data.lastStatus ?? "",
    privacyAccepted: input.privacyAccepted ?? data.privacyAccepted ?? true,
    updatedAt: now,
  });
}

export function marketingContactsToCsv(contacts: MarketingContact[]): string {
  const header = [
    "email",
    "name",
    "phone",
    "locale",
    "sources",
    "bookingCount",
    "contactCount",
    "firstSeenAt",
    "lastSeenAt",
    "privacyAccepted",
  ];

  const rows = contacts.map((c) =>
    [
      c.email,
      c.name,
      c.phone ?? "",
      c.locale ?? "es",
      (c.sources ?? []).join("|"),
      String(c.bookingCount ?? 0),
      String(c.contactCount ?? 0),
      c.firstSeenAt ?? "",
      c.lastSeenAt ?? "",
      c.privacyAccepted === false ? "false" : "true",
    ]
      .map(csvEscape)
      .join(","),
  );

  return [header.join(","), ...rows].join("\n");
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
