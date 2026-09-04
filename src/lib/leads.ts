export type LeadStatus = "received" | "pending" | "confirmed" | "cancelled";
export type LeadType = "contact" | "booking";

export type StoredBookingItem = {
  productId: string;
  date: string;
  timeSlotId: string;
  timeSlotLabel: string;
  participants: number;
  discipline: string;
  modality?: string;
  instructorSlug?: string;
  instructorName?: string;
  assignedInstructorSlug?: string;
  assignedInstructorName?: string;
  unitPrice: number;
  lineTotal: number;
  listUnitPrice?: number;
  notes?: string;
};

export type StoredLead = {
  type: LeadType;
  status: LeadStatus;
  name: string;
  email: string;
  emailLower?: string;
  studentUid?: string;
  instructorSlugs?: string[];
  phone: string;
  message: string;
  locale: string;
  source: string;
  createdAt: string;
  bookingItems?: StoredBookingItem[];
  estimatedTotal?: number;
  confirmedAt?: string;
  cancelledAt?: string;
  confirmationEmailSentAt?: string;
  cancellationEmailSentAt?: string;
  privacyAccepted?: boolean;
};

export function effectiveInstructorSlug(item: StoredBookingItem): string {
  return (item.assignedInstructorSlug || item.instructorSlug || "").trim();
}

export function effectiveInstructorName(item: StoredBookingItem): string {
  return (item.assignedInstructorName || item.instructorName || "").trim();
}

export function collectInstructorSlugs(items: StoredBookingItem[] | undefined): string[] {
  const slugs = new Set<string>();
  for (const item of items ?? []) {
    const slug = effectiveInstructorSlug(item);
    if (slug) slugs.add(slug);
  }
  return [...slugs];
}

export function isBookingLead(lead: { type?: string; source?: string }): boolean {
  return lead.type === "booking" || lead.source === "booking-cart";
}
