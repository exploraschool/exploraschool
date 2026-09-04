import { site } from "@/data/site";
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

export const FAQ_CHAT_PROMPT = "¿Te ayudamos con tu clase?";

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
      {
        id: "equipo",
        label: "Hablar con el equipo",
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
