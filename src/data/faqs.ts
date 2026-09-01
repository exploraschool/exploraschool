export type Faq = {
  id: string;
  questionEs: string;
  answerEs: string;
  questionEn: string;
  answerEn: string;
  sortOrder: number;
};

export const faqs: Faq[] = [
  {
    id: "como-reservo",
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
    sortOrder: 5,
    questionEs: "¿Dónde está el punto de encuentro?",
    answerEs:
      "En la salida del telecabina Al-Andalus, área de Borreguiles. El/la instructor/a va con uniforme. En Full-Day: recogida y entrega donde se solicite; en el resto de formatos, según disponibilidad.",
    questionEn: "Where is the meeting point?",
    answerEn:
      "At the exit of the Al-Andalus gondola, Borreguiles area. Your instructor wears the Explora uniform. Full-Day: pick-up and drop-off on request; for other formats, subject to availability.",
  },
  {
    id: "cierre-estacion",
    sortOrder: 6,
    questionEs: "¿Qué ocurre si cierra la estación?",
    answerEs:
      "Si Cetursa cierra obligatoriamente, la clase queda suspendida con reembolso. Si hay retraso en la apertura, la clase se retrasa 1 hora desde la apertura para llegar al punto de encuentro.",
    questionEn: "What happens if the resort closes?",
    answerEn:
      "If Cetursa closes mandatorily, the lesson is cancelled with a refund. If opening is delayed, the lesson starts 1 hour after opening so you can reach the meeting point.",
  },
  {
    id: "llego-tarde",
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
    sortOrder: 9,
    questionEs: "¿Los precios incluyen IVA?",
    answerEs: "Sí, todos los precios tienen el IVA incluido.",
    questionEn: "Do prices include VAT?",
    answerEn: "Yes, all prices include VAT.",
  },
  {
    id: "edades-minimas",
    sortOrder: 10,
    questionEs: "¿Desde qué edad se pueden contratar clases?",
    answerEs:
      "Clases particulares: niños desde 3 años. Clases grupales: niños desde 6 años.",
    questionEn: "What is the minimum age for lessons?",
    answerEn:
      "Private lessons: children from 3 years old. Group lessons: children from 6 years old.",
  },
  {
    id: "tamano-grupo",
    sortOrder: 11,
    questionEs: "¿Cuál es el tamaño máximo de grupo?",
    answerEs:
      "En clases grupales el grupo nunca excede de 8 personas para garantizar calidad.",
    questionEn: "What is the maximum group size?",
    answerEn:
      "In group lessons the group never exceeds 8 people to ensure quality.",
  },
  {
    id: "como-llegar",
    sortOrder: 12,
    questionEs: "¿Cómo llego a Explora School & Club en Sierra Nevada?",
    answerEs:
      "Nos encontramos en Sierra Nevada, Granada (CP 18196). El punto de encuentro habitual es la salida del telecabina Al-Andalus, área de Borreguiles. Escríbenos por email si necesitas indicaciones concretas para tu día.",
    questionEn: "How do I get to Explora School & Club in Sierra Nevada?",
    answerEn:
      "We are in Sierra Nevada, Granada (postal code 18196). The usual meeting point is the exit of the Al-Andalus gondola, Borreguiles area. Email us if you need specific directions for your day.",
  },
  {
    id: "que-incluye",
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
