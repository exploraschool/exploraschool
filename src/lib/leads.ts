export type LeadStatus = "received" | "pending" | "confirmed" | "cancelled";
export type LeadType = "contact" | "booking";

export type StoredBookingItem = {
  productId: string;
  date: string;
  timeSlotId: string;
  timeSlotLabel: string;
  participants: number;
  discipline?: string;
  modality?: string;
  instructorSlug?: string;
  instructorName?: string;
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
  phone: string;
  message: string;
  locale: string;
  source: string;
  createdAt: string;
  bookingItems?: StoredBookingItem[];
  estimatedTotal?: number;
  confirmedAt?: string;
  confirmationEmailSentAt?: string;
};

export function isBookingLead(lead: { type?: string; source?: string }): boolean {
  return lead.type === "booking" || lead.source === "booking-cart";
}
