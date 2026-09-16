import { site } from "@/data/site";
import { FULL_DAY_EFFECTIVE_HOURS, FULL_DAY_HOURLY_EUR, SESSION_2H_STANDARD, SESSION_3H_MORNING, SESSION_3H_STANDARD, SESSION_FULL_DAY } from "@/lib/lesson-pricing";
import { whatsappHref } from "@/lib/whatsapp";

export const FAQ_CHAT_WHATSAPP_TEXT =
  "Hola Explora School, tengo unas dudas y me gustaría hablar con el equipo.";

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
  "Hola, soy el asistente de Explora. Elige una opción o habla con el equipo si lo prefieres.";

export const FAQ_CHAT_PROMPT = "¿Cómo puedo ayudarte?";

export const FAQ_CHAT_NODES: Record<string, FaqChatNode> = {
  root: {
    id: "root",
    botText: FAQ_CHAT_WELCOME,
    buttons: [
      {
        id: "tarifas",
        label: "Tarifas y precios",
        action: { type: "menu", menuId: "tarifas" },
      },
      {
        id: "encuentro",
        label: "Punto de encuentro",
        action: { type: "menu", menuId: "encuentro" },
      },
      {
        id: "forfait",
        label: "Forfait y material",
        action: { type: "menu", menuId: "forfait" },
      },
      {
        id: "disciplinas",
        label: "Disciplinas",
        action: { type: "menu", menuId: "disciplinas" },
      },
    ],
  },
  tarifas: {
    id: "tarifas",
    botText: `El mejor precio por hora es el Full Day: ${FULL_DAY_HOURLY_EUR} €/h (${FULL_DAY_EFFECTIVE_HOURS} h de clase, ${SESSION_FULL_DAY[0]} € 1 persona / ${SESSION_FULL_DAY[1]} € 2 personas).

• 2 h: ${SESSION_2H_STANDARD[0]} € (1 persona) · ${SESSION_2H_STANDARD[1]} € (2 personas).
• 3 h (12:00–15:00 o 10:00–12:00 y 15:00–16:00): ${SESSION_3H_STANDARD[0]} € (1 persona).
• 3 h 10:00–13:00: ${SESSION_3H_MORNING[0]} € (1 persona).
• No vendemos clases sueltas de 1 hora.`,
    buttons: [
      {
        id: "ver-tarifas",
        label: "Ver cuadro de tarifas",
        action: { type: "link", href: "/tarifas" },
      },
      {
        id: "reservar-wa",
        label: "Solicitar reserva por WhatsApp",
        action: { type: "whatsapp", href: FAQ_CHAT_RESERVE_WHATSAPP_URL },
      },
      {
        id: "back",
        label: "Volver",
        action: { type: "menu", menuId: "root" },
      },
    ],
  },
  encuentro: {
    id: "encuentro",
    botText: `Nos encontramos arriba en Borreguiles:

Justo a la salida a la nieve al llegar con el Telecabina Al-Andalus.

Te recomendamos estar en Pradollano 90 minutos antes para aparcar, alquilar y subir con tranquilidad.`,
    buttons: [
      {
        id: "llegada",
        label: "Consejos de llegada",
        action: { type: "link", href: "/como-llegar" },
      },
      {
        id: "maps",
        label: "Ver en Google Maps",
        action: { type: "link", href: site.meetingPoint.googleMapsUrl },
      },
      {
        id: "back",
        label: "Volver",
        action: { type: "menu", menuId: "root" },
      },
    ],
  },
  forfait: {
    id: "forfait",
    botText: `La clase no incluye forfait ni material de alquiler.

Forfait: en Cetursa / sierranevada.es, o en los cajeros de la estación.

Material: recomendamos José Luis Sáez, junto a los telecabinas Al-Andalus y Borreguiles. Con Explora tienes un 20% de descuento: dilo al alquilar.`,
    buttons: [
      {
        id: "alquiler",
        label: "Cómo llegar al alquiler",
        action: { type: "link", href: site.rentalPartner.googleMapsUrl },
      },
      {
        id: "back",
        label: "Volver",
        action: { type: "menu", menuId: "root" },
      },
    ],
  },
  disciplinas: {
    id: "disciplinas",
    botText: `Impartimos clases de:

• Esquí (pista / técnico)
• Snowboard
• Telemark
• Esquí / snowboard adaptado
• Freeride
• Freestyle`,
    buttons: [
      {
        id: "back",
        label: "Volver",
        action: { type: "menu", menuId: "root" },
      },
    ],
  },
};
