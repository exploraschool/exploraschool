export type FaqCategory = "reservas" | "estacion" | "clase";

export type Faq = {
  id: string;
  category: FaqCategory;
  questionEs: string;
  answerEs: string;
  questionEn: string;
  answerEn: string;
  sortOrder: number;
};

export const FAQ_CATEGORIES: {
  id: FaqCategory;
  labelEs: string;
  labelEn: string;
  descriptionEs: string;
  descriptionEn: string;
}[] = [
  {
    id: "reservas",
    labelEs: "Reservas y precios",
    labelEn: "Bookings & prices",
    descriptionEs: "Cómo reservar, qué incluye el precio y condiciones generales.",
    descriptionEn: "How to book, what is included and general conditions.",
  },
  {
    id: "estacion",
    labelEs: "Antes de subir",
    labelEn: "Before you go up",
    descriptionEs: "Forfait, material, casco y cómo llegar al punto de encuentro.",
    descriptionEn: "Lift pass, equipment, helmet and how to reach the meeting point.",
  },
  {
    id: "clase",
    labelEs: "El día de la clase",
    labelEn: "On lesson day",
    descriptionEs: "Imprevistos, horarios, idiomas y qué hacer si algo cambia.",
    descriptionEn: "Changes, schedules, languages and what to do if plans shift.",
  },
];

export const faqs: Faq[] = [
  {
    id: "como-reservo",
    category: "reservas",
    sortOrder: 1,
    questionEs: "¿Cómo reservo mi clase?",
    answerEs:
      "Por la web: añade las clases que te interesen al carrito en /reserva, elige fechas y participantes, y envía tu solicitud por email. También puedes escribirnos a explora.sclub@gmail.com o llamarnos al +34 660 262 790.",
    questionEn: "How do I book my lesson?",
    answerEn:
      "On the website: add lessons to your cart at /reserva, pick dates and participants, and send your request by email. You can also write to explora.sclub@gmail.com or call us at +34 660 262 790.",
  },
  {
    id: "forfait",
    category: "estacion",
    sortOrder: 2,
    questionEs: "¿Necesito comprar forfait para realizar las clases?",
    answerEs:
      "Sí. Cetursa vende el forfait en Plaza de Andalucía y en www.sierranevada.es. Es aconsejable abonar también la tasa del seguro de accidentes.",
    questionEn: "Do I need to buy a lift pass for the lessons?",
    answerEn:
      "Yes. Cetursa sells lift passes at Plaza de Andalucía and at www.sierranevada.es. We also recommend paying the accident insurance fee.",
  },
  {
    id: "material",
    category: "estacion",
    sortOrder: 3,
    questionEs: "¿Necesito material de esquí, snowboard o telemark?",
    answerEs:
      "Sí. Puedes traer el tuyo (esquís, bastones, tabla, fijaciones, guantes, gafas, ropa técnica, protección solar) o alquilar en la estación. Los instructores te orientan sin compromiso. También ofrecemos gestión completa de material.",
    questionEn: "Do I need ski, snowboard or telemark equipment?",
    answerEn:
      "Yes. You can bring your own (skis, poles, board, bindings, gloves, goggles, technical clothing, sun protection) or rent at the resort. Instructors can advise you with no obligation. We also offer full equipment management.",
  },
  {
    id: "casco",
    category: "estacion",
    sortOrder: 4,
    questionEs: "¿El casco es obligatorio?",
    answerEs:
      "No es obligatorio, pero Explora School & Club recomienda su uso.",
    questionEn: "Is a helmet mandatory?",
    answerEn:
      "It is not mandatory, but Explora School & Club recommends wearing one.",
  },
  {
    id: "punto-encuentro",
    category: "estacion",
    sortOrder: 5,
    questionEs: "¿Dónde está el punto de encuentro?",
    answerEs:
      "Explora School & Club en la estación de esquí de Sierra Nevada — ubicación oficial en Google Maps. El/la instructor/a va con uniforme Explora. En día completo: recogida y entrega donde se solicite; en el resto de formatos, según disponibilidad.",
    questionEn: "Where is the meeting point?",
    answerEn:
      "Explora School & Club at Sierra Nevada ski resort — official location on Google Maps. Your instructor wears the Explora uniform. Full-Day: pick-up and drop-off on request; for other formats, subject to availability.",
  },
  {
    id: "cierre-estacion",
    category: "clase",
    sortOrder: 6,
    questionEs: "¿Qué ocurre si cierra la estación?",
    answerEs:
      "Si Cetursa cierra la estación de forma obligatoria, la clase quedará suspendida y te reembolsaremos el importe. Si la apertura se retrasa, el inicio de la clase se desplazará una hora respecto a la apertura oficial, para que puedas llegar con tranquilidad al punto de encuentro. En cualquier caso, haremos todo lo posible por reajustar la sesión y que aproveches al máximo tu tiempo en la nieve.",
    questionEn: "What happens if the resort closes?",
    answerEn:
      "If Cetursa closes the resort mandatorily, the lesson will be cancelled and you will receive a full refund. If opening is delayed, the lesson will start one hour after the official opening time, giving you enough time to reach the meeting point. Whatever happens, we will do our best to rearrange the session so you can make the most of your time on the snow.",
  },
  {
    id: "llego-tarde",
    category: "clase",
    sortOrder: 7,
    questionEs: "¿Qué ocurre si llego tarde?",
    answerEs:
      "Con causa justificada se puede recuperar el tiempo si el instructor tiene disponibilidad.",
    questionEn: "What happens if I arrive late?",
    answerEn:
      "With a justified reason, lost time can be recovered if the instructor has availability.",
  },
  {
    id: "idiomas",
    category: "clase",
    sortOrder: 8,
    questionEs: "¿En qué idiomas se imparten las clases?",
    answerEs:
      "Las clases y la atención al cliente están disponibles en español e inglés.",
    questionEn: "What languages are lessons taught in?",
    answerEn:
      "Lessons and customer service are available in Spanish and English.",
  },
  {
    id: "iva",
    category: "reservas",
    sortOrder: 9,
    questionEs: "¿Los precios incluyen IVA?",
    answerEs: "Sí, todos los precios tienen el IVA incluido.",
    questionEn: "Do prices include VAT?",
    answerEn: "Yes, all prices include VAT.",
  },
  {
    id: "edades-minimas",
    category: "reservas",
    sortOrder: 10,
    questionEs: "¿Desde qué edad se pueden contratar clases?",
    answerEs:
      "Clases con instructor/a: niños desde 3 años. Máximo 8 participantes por sesión.",
    questionEn: "What is the minimum age for lessons?",
    answerEn:
      "Lessons with an instructor: children from 3 years old. Maximum 8 participants per session.",
  },
  {
    id: "tamano-grupo",
    category: "reservas",
    sortOrder: 11,
    questionEs: "¿Cuál es el máximo de participantes por clase?",
    answerEs:
      "Máximo 8 participantes por clase. En particulares, 1 y 2 personas pagan el mismo precio total; a partir de la 3.ª se aplica un extra por persona. Duración mínima: 2 horas.",
    questionEn: "What is the maximum number of participants per lesson?",
    answerEn:
      "Maximum 8 participants per lesson. In private lessons, 1 and 2 people pay the same total; from the 3rd person an extra applies. Minimum duration: 2 hours.",
  },
  {
    id: "como-llegar",
    category: "estacion",
    sortOrder: 12,
    questionEs: "¿Cómo llego a Explora School & Club en Sierra Nevada?",
    answerEs:
      "Nos encontramos en la estación de esquí de Sierra Nevada (CP 18196). Punto de encuentro oficial: Explora School & Club — consulta la ubicación exacta en Google Maps o en la página Cómo llegar.",
    questionEn: "How do I get to Explora School & Club in Sierra Nevada?",
    answerEn:
      "We are at Sierra Nevada ski resort (postal code 18196). Official meeting point: Explora School & Club — see the exact location on Google Maps or on the Getting here page.",
  },
  {
    id: "que-incluye",
    category: "reservas",
    sortOrder: 13,
    questionEs: "¿Qué incluye y qué no incluye el precio de la clase?",
    answerEs:
      "Incluye la enseñanza con instructor/a titulado/a. No incluye forfait ni material de esquí, snowboard o telemark. El forfait se compra aparte en Plaza de Andalucía o en sierranevada.es.",
    questionEn: "What is and isn't included in the lesson price?",
    answerEn:
      "Includes instruction with a qualified instructor. Does not include lift pass or ski, snowboard or telemark equipment. Lift passes are purchased separately at Plaza de Andalucía or sierranevada.es.",
  },
];

export function getFaqById(id: string): Faq | undefined {
  return faqs.find((f) => f.id === id);
}
