import { site } from "@/data/site";
import { whatsappHref } from "@/lib/whatsapp";

export const FAQ_CHAT_WHATSAPP_TEXT =
  "Hola Explora School, tengo dudas sobre las clases y me gustaría consultar disponibilidad.";

export const FAQ_CHAT_WHATSAPP_URL = whatsappHref(FAQ_CHAT_WHATSAPP_TEXT);

export const FAQ_CHAT_RESERVE_WHATSAPP_TEXT =
  "Hola Explora School, quiero solicitar una reserva de clase. ¿Me confirmáis disponibilidad y horarios?";

export const FAQ_CHAT_RESERVE_WHATSAPP_URL = whatsappHref(FAQ_CHAT_RESERVE_WHATSAPP_TEXT);

export type FaqChatAction =
  | { type: "menu"; menuId: string }
  | { type: "whatsapp"; href: string }
  | { type: "link"; href: string };

export type FaqChatButton = {
  id: string;
  label: string;
  action: FaqChatAction;
};

export type FaqChatNode = {
  id: string;
  botText: string;
  buttons: FaqChatButton[];
};

export const FAQ_CHAT_WELCOME =
  "¡Hola! 👋 Bienvenido a Explora School & Club. ¿En qué te podemos ayudar hoy?";

export const FAQ_CHAT_PROMPT =
  "¡Hola! ¿Tienes dudas con tu clase de esquí/snow?";

export const FAQ_CHAT_NODES: Record<string, FaqChatNode> = {
  root: {
    id: "root",
    botText: FAQ_CHAT_WELCOME,
    buttons: [
      {
        id: "tarifas",
        label: "💶 Ver Tarifas y Precios",
        action: { type: "menu", menuId: "tarifas" },
      },
      {
        id: "encuentro",
        label: "📍 ¿Dónde es el Punto de Encuentro?",
        action: { type: "menu", menuId: "encuentro" },
      },
      {
        id: "forfait",
        label: "🎟️ ¿La clase incluye Forfait o Material?",
        action: { type: "menu", menuId: "forfait" },
      },
      {
        id: "disciplinas",
        label: "🎿 Disciplinas Impartidas",
        action: { type: "menu", menuId: "disciplinas" },
      },
      {
        id: "agente",
        label: "💬 Hablar con un Agente",
        action: { type: "whatsapp", href: FAQ_CHAT_WHATSAPP_URL },
      },
    ],
  },
  tarifas: {
    id: "tarifas",
    botText: `Nuestra tarifa base es de 55 €/h por instructor privado (mínimo 2 horas).

• 1 o 2 personas pagan lo mismo: 110 € por 2 h de mañana (o 89 € en horario de tarde).
• Extras por persona adicional: +10 € en 2 h | +15 € en 3 h | +25 € en Full Day.
• No vendemos clases sueltas de 1 hora por la mañana.`,
    buttons: [
      {
        id: "reservar-wa",
        label: "📅 Solicitar Reserva por WhatsApp",
        action: { type: "whatsapp", href: FAQ_CHAT_RESERVE_WHATSAPP_URL },
      },
      {
        id: "back",
        label: "← Volver al menú",
        action: { type: "menu", menuId: "root" },
      },
    ],
  },
  encuentro: {
    id: "encuentro",
    botText: `Nos encontramos directamente arriba en la estación de Borreguiles:

📍 Justo a la salida a la nieve al llegar arriba en el Telecabina Al-Andalus.

Te recomendamos estar en Pradollano 90 minutos antes de la clase para aparcar, alquilar y subir con tranquilidad.`,
    buttons: [
      {
        id: "llegada",
        label: "🗺️ Ver consejos de llegada",
        action: { type: "link", href: "/como-llegar" },
      },
      {
        id: "maps",
        label: "📍 Ver en Google Maps",
        action: { type: "link", href: site.meetingPoint.googleMapsUrl },
      },
      {
        id: "back",
        label: "← Volver al menú",
        action: { type: "menu", menuId: "root" },
      },
    ],
  },
  forfait: {
    id: "forfait",
    botText: `La clase no incluye el forfait (pase de esquí) ni el equipo de alquiler. Debes gestionar tu forfait en la web oficial de Cetursa y alquilar tu material antes de subir al Telecabina Al-Andalus.`,
    buttons: [
      {
        id: "back",
        label: "← Volver al menú",
        action: { type: "menu", menuId: "root" },
      },
    ],
  },
  disciplinas: {
    id: "disciplinas",
    botText: `Impartimos clases de:

• Esquí (Pista / Técnico)
• Snowboard
• Telemark
• Esquí / Snowboard Adaptado
• Freeride (Fuera de pista)
• Freestyle (Park & Módulos)`,
    buttons: [
      {
        id: "back",
        label: "← Volver al menú",
        action: { type: "menu", menuId: "root" },
      },
    ],
  },
};
