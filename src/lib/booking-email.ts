import { site } from "@/data/site";
import { getDisciplineDisplayName } from "@/data/disciplines";
import { getProductBySlug } from "@/data/products";
import type { CartItem, CustomerDetails } from "@/lib/cart";
import { estimateCartTotal } from "@/lib/cart";
import { earlyBirdDiscountLabel, isEarlyBirdActive } from "@/lib/promotions";

type BuildEmailParams = {
  locale: string;
  items: CartItem[];
  customer: CustomerDetails;
};

function pick(locale: string, es: string, en: string): string {
  return locale === "es" ? es : en;
}

function formatDate(date: string, locale: string): string {
  try {
    return new Date(date + "T12:00:00").toLocaleDateString(locale === "es" ? "es-ES" : "en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return date;
  }
}

export function buildBookingEmail({ locale, items, customer }: BuildEmailParams): {
  subject: string;
  body: string;
  mailto: string;
} {
  const lines: string[] = [];

  lines.push(pick(locale, "NUEVA RESERVA — Explora School & Club", "NEW BOOKING — Explora School & Club"));
  lines.push(pick(locale, "Enviada desde la web oficial", "Sent from the official website"));
  lines.push("");
  lines.push("─────────────────────────────");
  lines.push(pick(locale, "DATOS DEL CLIENTE", "CUSTOMER DETAILS"));
  lines.push("─────────────────────────────");
  lines.push(`${pick(locale, "Nombre", "Name")}: ${customer.name}`);
  lines.push(`Email: ${customer.email}`);
  if (customer.phone) lines.push(`${pick(locale, "Teléfono", "Phone")}: ${customer.phone}`);
  lines.push("");
  lines.push("─────────────────────────────");
  lines.push(pick(locale, "DETALLE DE LA RESERVA", "BOOKING DETAILS"));
  lines.push("─────────────────────────────");

  items.forEach((item, index) => {
    const product = getProductBySlug(item.productId);
    const title = product
      ? pick(locale, product.titleEs, product.titleEn)
      : item.productId;

    lines.push("");
    lines.push(`${index + 1}. ${title}`);

    if (item.discipline) {
      const label = getDisciplineDisplayName(locale, item.discipline, item.modality);
      if (label) lines.push(`   ${pick(locale, "Disciplina", "Discipline")}: ${label}`);
    }

    if (item.instructorName) {
      lines.push(`   ${pick(locale, "Instructor/a preferido/a", "Preferred instructor")}: ${item.instructorName}`);
    }

    lines.push(`   ${pick(locale, "Fecha", "Date")}: ${formatDate(item.date, locale)}`);
    lines.push(`   ${pick(locale, "Horario", "Schedule")}: ${item.timeSlotLabel}`);
    lines.push(`   ${pick(locale, "Personas", "People")}: ${item.participants}`);
    if (item.listUnitPrice && item.listUnitPrice > item.lineTotal) {
      lines.push(
        `   ${pick(locale, "Precio sesión", "Session price")}: ${item.lineTotal} € (${earlyBirdDiscountLabel(locale)}, ${pick(locale, "tarifa", "list")} ${item.listUnitPrice} €)`,
      );
    } else {
      lines.push(`   ${pick(locale, "Precio sesión", "Session price")}: ${item.lineTotal} €`);
    }

    if (item.notes?.trim()) {
      lines.push(`   ${pick(locale, "Notas", "Notes")}: ${item.notes.trim()}`);
    }
  });

  const total = estimateCartTotal(items);
  lines.push("");
  lines.push("─────────────────────────────");
  lines.push(`${pick(locale, "TOTAL ESTIMADO (IVA incl.)", "ESTIMATED TOTAL (VAT incl.)")}: ${total} €`);
  if (isEarlyBirdActive()) {
    lines.push(earlyBirdDiscountLabel(locale));
  }
  lines.push(pick(locale, "Precio final sujeto a confirmación.", "Final price subject to confirmation."));

  if (customer.message?.trim()) {
    lines.push("");
    lines.push(pick(locale, "Mensaje adicional", "Additional message") + ":");
    lines.push(customer.message.trim());
  }

  lines.push("");
  lines.push("─────────────────────────────");
  lines.push(pick(locale, "Punto de encuentro", "Meeting point") + ":");
  lines.push(pick(locale, site.meetingPointEs, site.meetingPointEn));
  lines.push("");
  lines.push(pick(locale, "Gracias por elegir Explora School & Club.", "Thank you for choosing Explora School & Club."));

  const body = lines.join("\n");
  const subject = pick(
    locale,
    `Reserva web — ${customer.name} — ${items.length} sesión(es)`,
    `Web booking — ${customer.name} — ${items.length} session(s)`,
  );

  const mailto = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return { subject, body, mailto };
}

export function buildBookingMessageForApi(params: BuildEmailParams): string {
  return buildBookingEmail(params).body;
}
