import { site } from "./site";

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
    descriptionEs: "Cómo reservar, qué incluye el precio, pago e IVA.",
    descriptionEn: "How to book, what is included, payment and VAT.",
  },
  {
    id: "estacion",
    labelEs: "Antes de subir",
    labelEn: "Before you go up",
    descriptionEs: "Forfait, cajeros, material, casco y punto de encuentro.",
    descriptionEn: "Lift pass, machines, equipment, helmet and meeting point.",
  },
  {
    id: "clase",
    labelEs: "El día de la clase",
    labelEn: "On lesson day",
    descriptionEs: "Imprevistos, retrasos, idiomas y cierre de estación.",
    descriptionEn: "Changes, delays, languages and resort closures.",
  },
];

export const FAQ_HIGHLIGHTS: {
  id: string;
  faqId: string;
  titleEs: string;
  titleEn: string;
  bodyEs: string;
  bodyEn: string;
}[] = [
  {
    id: "tiempo",
    faqId: "cuanto-tiempo",
    titleEs: "Regla de 90 minutos",
    titleEn: "90-minute rule",
    bodyEs: "Estate en Pradollano al menos 1 h 30 min antes de tu clase.",
    bodyEn: "Be in Pradollano at least 1 hour 30 minutes before your lesson.",
  },
  {
    id: "forfait",
    faqId: "forfait",
    titleEs: "Forfait aparte",
    titleEn: "Lift pass separate",
    bodyEs: "Cajeros en los parkings y en la Silla del Pueblo (estación media y superior).",
    bodyEn: "Machines in the car parks and at the Village chairlift (middle and top stations).",
  },
  {
    id: "encuentro",
    faqId: "punto-encuentro",
    titleEs: "Punto de encuentro",
    titleEn: "Meeting point",
    bodyEs: "Salida a la nieve del Telecabina Al-Andalus, en Borreguiles.",
    bodyEn: "Snow exit of the Al-Andalus gondola, in Borreguiles.",
  },
  {
    id: "pago",
    faqId: "como-pago",
    titleEs: "Sin pago online",
    titleEn: "No online payment",
    bodyEs: "Reservas por email. El abono se concreta con tu instructor/a.",
    bodyEn: "Book by email. Payment is arranged with your instructor.",
  },
];

export const faqs: Faq[] = [
  {
    id: "como-reservo",
    category: "reservas",
    sortOrder: 1,
    questionEs: "¿Cómo reservo mi clase?",
    answerEs: `Reserva desde la web. Te confirmamos por email y no hay pago online.

1. Elige tus clases en [Reservar](/reserva)
2. Indica fechas y cuántas personas sois
3. Envía la solicitud

Si te va mejor hablar con nosotros:
- [WhatsApp](${site.whatsappUrl})
- [${site.phoneDisplay}](tel:${site.phone})
- [${site.email}](mailto:${site.email})

Respondemos de 9:00 a 20:00.

> 10% de descuento si reservas antes del 1 de noviembre de 2026.`,
    questionEn: "How do I book my lesson?",
    answerEn: `Book on the website. We confirm by email and there is no online payment.

1. Choose your lessons at [Book](/reserva)
2. Add dates and group size
3. Send the request

If you would rather talk to us:
- [WhatsApp](${site.whatsappUrl})
- [${site.phoneDisplay}](tel:${site.phone})
- [${site.email}](mailto:${site.email})

We reply from 9:00 am to 8:00 pm.

> 10% off if you book before 1 November 2026.`,
  },
  {
    id: "forfait",
    category: "estacion",
    sortOrder: 2,
    questionEs: "¿Necesito forfait para las clases? ¿Dónde lo saco?",
    answerEs: `Sí. El forfait no está incluido en el precio de la clase: lo vende Cetursa, no Explora. Cada persona que use los remontes necesita el suyo, también los niños.

La opción más cómoda es comprarlo con antelación en [sierranevada.es](https://www.sierranevada.es). El mismo día puedes sacarlo en los cajeros automáticos de forfait:

- En los parkings
- En la estación media de la Silla del Pueblo
- En la estación superior de la Silla del Pueblo

Así evitas las colas de taquilla de Plaza de Andalucía. Si prefieres taquilla, Cetursa también vende allí. Recomendamos abonar el seguro de accidentes.

Guía completa: [Forfait en Sierra Nevada](/blog/forfait-sierra-nevada-guia-compra).`,
    questionEn: "Do I need a lift pass for the lessons? Where do I get it?",
    answerEn: `Yes. The lift pass is not included in the lesson price: Cetursa sells it, not Explora. Everyone using the lifts needs their own pass, including children.

The easiest option is to buy it in advance at [sierranevada.es](https://www.sierranevada.es). On the day you can also collect it at the automatic forfait machines:

- In the car parks
- At the middle station of the Village chairlift (Silla del Pueblo)
- At the top station of the Village chairlift (Silla del Pueblo)

That way you skip the ticket-office queues at Plaza de Andalucía. If you prefer the desk, Cetursa also sells passes there. We recommend adding accident insurance.

Full guide: [Lift passes in Sierra Nevada](/blog/forfait-sierra-nevada-guia-compra).`,
  },
  {
    id: "punto-encuentro",
    category: "estacion",
    sortOrder: 3,
    questionEs: "¿Dónde está el punto de encuentro?",
    answerEs: `Las clases se imparten en la zona alta (Borreguiles, 2.700 m). El punto habitual es justo a la salida a la nieve al llegar arriba en el Telecabina Al-Andalus.

Tu instructor/a te espera con la chaqueta oficial de Explora School & Club. Ubicación en [Google Maps](${site.meetingPoint.googleMapsUrl}) y en [Cómo llegar](/como-llegar).

Si tu reserva es de día completo con recogida, te confirmamos el punto (puede no ser Borreguiles): recogida y entrega donde se solicite.`,
    questionEn: "Where is the meeting point?",
    answerEn: `Lessons take place in the upper area (Borreguiles, 2,700 m). The usual meeting point is right at the snow exit when you arrive on the Al-Andalus gondola.

Your instructor will be waiting in the official Explora School & Club jacket. See the pin on [Google Maps](${site.meetingPoint.googleMapsUrl}) and on [Getting here](/como-llegar).

If your booking is a full day with pick-up, we will confirm the meeting point (it may not be Borreguiles): pick-up and drop-off on request.`,
  },
  {
    id: "material",
    category: "estacion",
    sortOrder: 4,
    questionEs: "¿Necesito material de esquí, snowboard o telemark?",
    answerEs: `Sí. Puedes traer el tuyo o alquilarlo en la estación. Calcula 20–40 minutos extra si vas a alquilar el mismo día.

Incluye esquís o tabla, botas, bastones si esquías, guantes, gafas, ropa impermeable y protección solar. Los instructores te orientan sin compromiso. Si lo pides al reservar, también podemos gestionar el alquiler completo.

Más detalle: [qué llevar el primer día](/blog/que-llevar-primer-dia-nieve).`,
    questionEn: "Do I need ski, snowboard or telemark equipment?",
    answerEn: `Yes. Bring your own or rent at the resort. Allow an extra 20–40 minutes if you are renting on the day.

That includes skis or board, boots, poles if you ski, gloves, goggles, waterproof clothing and sun protection. Instructors can advise you with no obligation. If you ask when booking, we can also arrange full equipment rental.

More detail: [what to bring on day one](/blog/que-llevar-primer-dia-nieve).`,
  },
  {
    id: "que-incluye",
    category: "reservas",
    sortOrder: 5,
    questionEs: "¿Qué incluye el precio de la clase?",
    answerEs: `Incluye la enseñanza con instructor/a titulado/a. Todos los precios llevan IVA.

No incluye forfait ni material. El forfait se saca en [sierranevada.es](https://www.sierranevada.es), en los cajeros de los parkings y de la Silla del Pueblo, o en Plaza de Andalucía.

Consulta [clases y tarifas](/clases).`,
    questionEn: "What is included in the lesson price?",
    answerEn: `It includes instruction with a qualified instructor. All prices include VAT.

It does not include the lift pass or equipment. Get your pass at [sierranevada.es](https://www.sierranevada.es), at the machines in the car parks and at the Village chairlift (Silla del Pueblo), or at Plaza de Andalucía.

See [lessons and prices](/clases).`,
  },
  {
    id: "como-pago",
    category: "reservas",
    sortOrder: 6,
    questionEs: "¿Hay que pagar al reservar?",
    answerEs: `No. La solicitud se envía por email y no cobramos online. Te confirmamos disponibilidad y el importe final se concreta con tu instructor/a al abonar la clase.

Verás un total estimado en la confirmación; el precio definitivo se cierra al confirmar el grupo, el horario y cualquier extra.`,
    questionEn: "Do I pay when I book?",
    answerEn: `No. The request is sent by email and we do not charge online. We confirm availability and the final amount is arranged with your instructor when you pay for the lesson.

You will see an estimated total in the confirmation; the final price is settled when the group, schedule and any extras are confirmed.`,
  },
  {
    id: "cuanto-tiempo",
    category: "estacion",
    sortOrder: 7,
    questionEs: "¿Con cuánto tiempo debo llegar?",
    answerEs: `Planifica estar en Pradollano como mínimo 1 hora y 30 minutos antes de tu clase. Entre aparcar, sacar el forfait, alquilar material y subir en el Telecabina Al-Andalus se puede tardar entre 1 h y 1 h 30 min.

El trayecto en telecabina dura unos 10–15 minutos, pero en hora punta (9:30–11:00) la fila puede ser de 15–30 minutos. Entra a la cola al menos 40 minutos antes de la clase.

Aparcamiento recomendado: Parking Subterráneo Plaza de Andalucía. Lleva cadenas o fundas por si son obligatorias. Indicaciones en [Cómo llegar](/como-llegar).`,
    questionEn: "How early should I arrive?",
    answerEn: `Plan to be in Pradollano at least 1 hour 30 minutes before your lesson. Parking, collecting the lift pass, renting equipment and taking the Al-Andalus gondola can take between 1 hour and 1 hour 30 minutes.

The gondola ride is about 10–15 minutes, but at peak times (9:30–11:00 am) the queue can be 15–30 minutes. Join the queue at least 40 minutes before the lesson.

Recommended parking: Plaza de Andalucía underground car park. Carry snow chains or socks in case they are required. Directions on [Getting here](/como-llegar).`,
  },
  {
    id: "casco",
    category: "estacion",
    sortOrder: 8,
    questionEs: "¿El casco es obligatorio?",
    answerEs: `No es obligatorio en la estación, pero en Explora School & Club recomendamos usarlo, sobre todo con niños. Puedes traer el tuyo o alquilarlo junto al resto del material.`,
    questionEn: "Is a helmet mandatory?",
    answerEn: `It is not mandatory at the resort, but Explora School & Club recommends wearing one, especially with children. Bring your own or rent it with the rest of the equipment.`,
  },
  {
    id: "cierre-estacion",
    category: "clase",
    sortOrder: 9,
    questionEs: "¿Qué ocurre si cierra la estación?",
    answerEs: `Si Cetursa cierra la estación de forma obligatoria, la clase queda suspendida y te reembolsamos el importe.

Si la apertura se retrasa, el inicio se desplaza una hora respecto a la apertura oficial, para que puedas llegar con tranquilidad al punto de encuentro. En cualquier caso, reajustamos la sesión para que aproveches al máximo tu tiempo en la nieve.`,
    questionEn: "What happens if the resort closes?",
    answerEn: `If Cetursa closes the resort mandatorily, the lesson is cancelled and you receive a full refund.

If opening is delayed, the lesson starts one hour after the official opening time, so you can reach the meeting point without rushing. Whatever happens, we rearrange the session so you can make the most of your time on the snow.`,
  },
  {
    id: "llego-tarde",
    category: "clase",
    sortOrder: 10,
    questionEs: "¿Qué ocurre si llego tarde?",
    answerEs: `Si el retraso está justificado, se puede recuperar tiempo si el instructor tiene disponibilidad. Un retraso al inicio reduce el tiempo efectivo de clase, por eso insistimos en la regla de los 90 minutos.

Si hay un imprevisto grave de tráfico o aparcamiento, avísanos al momento por [WhatsApp](${site.whatsappUrl}) para coordinarlo con tu instructor/a.`,
    questionEn: "What happens if I arrive late?",
    answerEn: `With a justified delay, lost time can be recovered if the instructor has availability. A late start cuts into lesson time, which is why we insist on the 90-minute rule.

If you have a serious delay with traffic or parking, message us immediately on [WhatsApp](${site.whatsappUrl}) so we can rearrange with your instructor.`,
  },
  {
    id: "idiomas",
    category: "clase",
    sortOrder: 11,
    questionEs: "¿En qué idiomas se imparten las clases?",
    answerEs: `Las clases y la atención al cliente están en español e inglés. Si necesitas otro idioma, consúltanos al reservar y vemos disponibilidad.`,
    questionEn: "What languages are lessons taught in?",
    answerEn: `Lessons and customer service are in Spanish and English. If you need another language, ask when you book and we will check availability.`,
  },
  {
    id: "iva",
    category: "reservas",
    sortOrder: 12,
    questionEs: "¿Los precios incluyen IVA?",
    answerEs: `Sí. Todos los precios publicados tienen el IVA incluido.`,
    questionEn: "Do prices include VAT?",
    answerEn: `Yes. All published prices include VAT.`,
  },
  {
    id: "edades-minimas",
    category: "reservas",
    sortOrder: 13,
    questionEs: "¿Desde qué edad se pueden contratar clases?",
    answerEs: `Clases con instructor/a desde 3 años. Máximo 8 participantes por sesión.

Para niños y jóvenes de 5 a 18 años también está el [Club Creando Aventuras](/club), con jornadas de progresión durante la temporada.`,
    questionEn: "What is the minimum age for lessons?",
    answerEn: `Lessons with an instructor from 3 years old. Maximum 8 participants per session.

For children and young people aged 5 to 18 there is also [Club Creando Aventuras](/club), with progression days through the season.`,
  },
  {
    id: "tamano-grupo",
    category: "reservas",
    sortOrder: 14,
    questionEs: "¿Cuál es el máximo de participantes por clase?",
    answerEs: `Máximo 8 participantes por clase. Duración mínima: 2 horas.

En particulares, 1 y 2 personas pagan el mismo precio total; a partir de la 3.ª se aplica un extra por persona. Tarifas en [clases](/clases).`,
    questionEn: "What is the maximum number of participants per lesson?",
    answerEn: `Maximum 8 participants per lesson. Minimum duration: 2 hours.

In private lessons, 1 and 2 people pay the same total; from the 3rd person an extra applies. See [lessons](/clases) for prices.`,
  },
  {
    id: "como-llegar",
    category: "estacion",
    sortOrder: 15,
    questionEs: "¿Cómo llego a Sierra Nevada y a Explora?",
    answerEs: `Sierra Nevada está a unos 30 km de Granada (unos 40 minutos por la A-395). Puedes llegar en coche, autobús o transfer. A partir de las 8:30–9:00 la subida se densifica: deja margen.

Aparca en Pradollano (recomendamos el Parking Subterráneo Plaza de Andalucía), saca el forfait si no lo tienes y sube en el Telecabina Al-Andalus hasta Borreguiles.

Mapa y dirección: [Cómo llegar](/como-llegar).`,
    questionEn: "How do I get to Sierra Nevada and Explora?",
    answerEn: `Sierra Nevada is about 30 km from Granada (around 40 minutes via the A-395). You can arrive by car, bus or transfer. From 8:30–9:00 am the road up gets busier: leave extra time.

Park in Pradollano (we recommend the Plaza de Andalucía underground car park), collect your lift pass if you do not have it yet and take the Al-Andalus gondola up to Borreguiles.

Map and address: [Getting here](/como-llegar).`,
  },
];

export function getFaqById(id: string): Faq | undefined {
  return faqs.find((f) => f.id === id);
}

export function getFaqsSorted(): Faq[] {
  return [...faqs].sort((a, b) => a.sortOrder - b.sortOrder);
}
