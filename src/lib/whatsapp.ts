import { site } from "@/data/site";

const PHONE = site.phone.replace(/^\+/, "");

export function whatsappHref(text: string): string {
  return `https://api.whatsapp.com/send?phone=${PHONE}&text=${encodeURIComponent(text)}`;
}

export function bookingStatusWhatsappText(params: {
  locale: string;
  name: string;
  dates: string;
  discipline: string;
}): string {
  if (params.locale === "en") {
    return `Hi Explora, I'm ${params.name}. I'd like to check the status of my booking: ${params.dates} (${params.discipline}).`;
  }
  return `Hola Explora, soy ${params.name}. Quiero consultar el estado de mi reserva: ${params.dates} (${params.discipline}).`;
}

export function newLessonWhatsappText(params: {
  locale: string;
  name: string;
  instructorName: string;
}): string {
  if (params.locale === "en") {
    return `Hi Explora, I'm ${params.name}. I'd like to book a new lesson with ${params.instructorName}.`;
  }
  return `Hola Explora, soy ${params.name}. Quiero solicitar una nueva clase con ${params.instructorName}.`;
}
