import type { MainDisciplineId } from "@/data/disciplines";
import { FULL_DAY_HOURLY_EUR, SESSION_2H_STANDARD, CURSO_COLECTIVO_FROM_EUR } from "@/lib/lesson-pricing";
import type { IndexableProductId } from "@/lib/seo-urls";

export type AeoFaq = {
  questionEs: string;
  questionEn: string;
  answerEs: string;
  answerEn: string;
};

export type AeoSection = {
  headingEs: string;
  headingEn: string;
  bodyEs: string;
  bodyEn: string;
};

export type AeoLink = {
  href: string;
  labelEs: string;
  labelEn: string;
};

export type DisciplineAeo = {
  leadEs: string;
  leadEn: string;
  sections: AeoSection[];
  faqs: AeoFaq[];
  links: AeoLink[];
};

export type ProductAeo = {
  leadEs: string;
  leadEn: string;
  bodyEs: string;
  bodyEn: string;
  faqs: AeoFaq[];
  links: AeoLink[];
};

export type HubAeo = {
  leadEs: string;
  leadEn: string;
  faqs: AeoFaq[];
  links: AeoLink[];
};

const sharedLinks: AeoLink[] = [
  { href: "/tarifas", labelEs: "Ver tarifas", labelEn: "See rates" },
  { href: "/preguntas-frecuentes", labelEs: "Preguntas frecuentes", labelEn: "FAQs" },
  { href: "/como-llegar", labelEs: "Cómo llegar y punto de encuentro", labelEn: "Getting here and meeting point" },
  { href: "/reserva", labelEs: "Reservar online", labelEn: "Book online" },
];

export const DISCIPLINE_AEO: Record<MainDisciplineId, DisciplineAeo> = {
  esqui: {
    leadEs: `Explora School & Club ofrece clases de esquí en Sierra Nevada desde ${FULL_DAY_HOURLY_EUR} €/h en Full Day. Grupos de 1 a 8, todas las edades y niveles, con instructores titulados (TD I–III). Pista, freeride y freestyle en Borreguiles / Pradollano. Reserva online; IVA incluido.`,
    leadEn: `Explora School & Club offers ski lessons in Sierra Nevada from €${FULL_DAY_HOURLY_EUR}/h on a Full Day. Groups of 1 to 8, all ages and levels, with qualified instructors (TD I–III). On-piste, freeride and freestyle around Borreguiles / Pradollano. Book online; VAT included.`,
    sections: [
      {
        headingEs: "¿Qué modalidades de esquí ofrecéis?",
        headingEn: "Which ski modalities do you offer?",
        bodyEs:
          "En pista para iniciación y perfeccionamiento, freeride fuera de pista con seguridad, y freestyle en snowpark. El instructor adapta la sesión a tu nivel real y a las condiciones del día en Sierra Nevada.",
        bodyEn:
          "On-piste for beginners and refinement, freeride off-piste with a safety focus, and freestyle in the snowpark. Your instructor matches the session to your real level and daily Sierra Nevada conditions.",
      },
      {
        headingEs: "¿Cuánto cuestan las clases de esquí?",
        headingEn: "How much do ski lessons cost?",
        bodyEs: `El gancho Full Day es desde ${FULL_DAY_HOURLY_EUR} €/h (5 h de clase efectivas). Las particulares empiezan en ${SESSION_2H_STANDARD[0]} € por 2 h (1 persona). El precio es el total del grupo (1–8) e incluye IVA. Consulta el cuadro en Tarifas.`,
        bodyEn: `The Full Day hook is from €${FULL_DAY_HOURLY_EUR}/h (5 h of effective teaching). Private lessons start at €${SESSION_2H_STANDARD[0]} for 2 h (1 person). Price is the group total (1–8) and includes VAT. See the rate chart under Rates.`,
      },
      {
        headingEs: "¿Dónde es el punto de encuentro?",
        headingEn: "Where is the meeting point?",
        bodyEs:
          "Salida a la nieve del Telecabina Al-Andalus, en Borreguiles (~2.700 m). El instructor lleva uniforme Explora. En Full Day con recogida podemos confirmar otro punto. Llega con ~90 minutos de margen desde Pradollano.",
        bodyEn:
          "Snow exit of the Al-Andalus gondola in Borreguiles (~2,700 m). Your instructor wears the Explora uniform. On a Full Day with pick-up we may confirm another point. Allow ~90 minutes from Pradollano.",
      },
    ],
    faqs: [
      {
        questionEs: "¿Hace falta experiencia previa para las clases de esquí?",
        questionEn: "Do I need prior experience for ski lessons?",
        answerEs:
          "No. En Explora School & Club trabajamos desde cero hasta nivel avanzado. El instructor evalúa tu nivel al inicio y adapta la progresión en pista, freeride o freestyle.",
        answerEn:
          "No. At Explora School & Club we teach from first turns to advanced. Your instructor assesses level at the start and adapts progression on piste, freeride or freestyle.",
      },
      {
        questionEs: "¿Las clases de esquí incluyen forfait y material?",
        questionEn: "Do ski lessons include lift pass and equipment?",
        answerEs:
          "No. El forfait y el alquiler van aparte. Recomendamos José Luis Sáez (junto a los telecabinas) con 20% de descuento si dices que vienes de Explora.",
        answerEn:
          "No. Lift pass and rental are separate. We recommend José Luis Sáez (next to the gondolas) with 20% off if you say you are with Explora.",
      },
      {
        questionEs: "¿Puedo mezclar adultos y niños en el mismo grupo?",
        questionEn: "Can adults and children share the same group?",
        answerEs:
          "Sí, si el nivel es comparable y el tamaño del grupo (máx. 8) lo permite. Para niños pequeños suele funcionar mejor un ritmo más lúdico; lo valoramos al confirmar la reserva.",
        answerEn:
          "Yes, if levels are comparable and group size (max 8) allows it. Younger children often do better with a more playful pace; we assess that when confirming the booking.",
      },
      {
        questionEs: "¿En qué idiomas se imparten las clases?",
        questionEn: "Which languages are lessons taught in?",
        answerEs: "En español e inglés. Indícalo al reservar para asignar instructor.",
        answerEn: "Spanish and English. Note it when booking so we assign the right instructor.",
      },
    ],
    links: [
      ...sharedLinks,
      { href: "/clases/snowboard", labelEs: "Clases de snowboard", labelEn: "Snowboard lessons" },
      { href: "/blog/consejos-primera-vez-sierra-nevada", labelEs: "Guía: primera vez en Sierra Nevada", labelEn: "Guide: first time in Sierra Nevada" },
    ],
  },
  snowboard: {
    leadEs: `Explora School & Club imparte clases de snowboard en Sierra Nevada desde ${FULL_DAY_HOURLY_EUR} €/h en Full Day. También hay curso colectivo de mañana desde ${CURSO_COLECTIVO_FROM_EUR} € (mín. 4 personas). De iniciación a snowpark y fuera de pista, grupos 1–8, IVA incluido.`,
    leadEn: `Explora School & Club teaches snowboard in Sierra Nevada from €${FULL_DAY_HOURLY_EUR}/h on a Full Day. There is also a morning group course from €${CURSO_COLECTIVO_FROM_EUR} (min. 4 people). From first turns to snowpark and off-piste, groups 1–8, VAT included.`,
    sections: [
      {
        headingEs: "¿Curso colectivo o clase particular de snowboard?",
        headingEn: "Group snowboard course or private lesson?",
        bodyEs: `El curso colectivo (10:00–13:00) es ideal si sois 4–8 y queréis aprender juntos por la mañana. Las particulares y el Full Day dan más flexibilidad de horario, ritmo y modalidad (pista, freestyle, freeride).`,
        bodyEn: `The group course (10:00–13:00) suits 4–8 people learning together in the morning. Private lessons and Full Day give more flexibility on time, pace and modality (piste, freestyle, freeride).`,
      },
      {
        headingEs: "¿Cuánto cuesta aprender snowboard en Sierra Nevada?",
        headingEn: "How much does learning snowboard in Sierra Nevada cost?",
        bodyEs: `Full Day desde ${FULL_DAY_HOURLY_EUR} €/h; particulares desde ${SESSION_2H_STANDARD[0]} € (2 h, 1 persona); curso colectivo desde ${CURSO_COLECTIVO_FROM_EUR} € para 4. Precios de grupo con IVA. Detalle en Tarifas.`,
        bodyEn: `Full Day from €${FULL_DAY_HOURLY_EUR}/h; private from €${SESSION_2H_STANDARD[0]} (2 h, 1 person); group course from €${CURSO_COLECTIVO_FROM_EUR} for 4. Group prices with VAT. Details under Rates.`,
      },
      {
        headingEs: "¿Dónde quedamos para la clase de snowboard?",
        headingEn: "Where do we meet for the snowboard lesson?",
        bodyEs:
          "En Borreguiles, salida a la nieve del Telecabina Al-Andalus, salvo que confirmemos recogida en Full Day. Material recomendado en José Luis Sáez (Pradollano) con 20% de descuento Explora.",
        bodyEn:
          "In Borreguiles at the Al-Andalus gondola snow exit, unless we confirm Full Day pick-up. Recommended gear at José Luis Sáez (Pradollano) with 20% Explora discount.",
      },
    ],
    faqs: [
      {
        questionEs: "¿El curso de snowboard se confirma siempre?",
        questionEn: "Is the snowboard course always confirmed?",
        answerEs:
          "Se confirma a partir de 4 personas. Si no se llega al mínimo, te ofrecemos alternativas (otra fecha o formato particular/Full Day).",
        answerEn:
          "It is confirmed from 4 people. If the minimum is not reached, we offer alternatives (another date or private/Full Day format).",
      },
      {
        questionEs: "¿Sirve para principiantes absolutos?",
        questionEn: "Is it suitable for absolute beginners?",
        answerEs:
          "Sí. Empezamos por postura, frenado y primeros giros en zonas suaves. El freestyle/freeride se reserva para quien ya controla la pista.",
        answerEn:
          "Yes. We start with stance, stopping and first turns on gentle terrain. Freestyle/freeride is for riders who already control the piste.",
      },
      {
        questionEs: "¿Incluye tabla y botas?",
        questionEn: "Does it include board and boots?",
        answerEs:
          "No. Alquila en José Luis Sáez (junto a Al-Andalus y Borreguiles) e indica que vienes de Explora para el 20%.",
        answerEn:
          "No. Rent at José Luis Sáez (next to Al-Andalus and Borreguiles) and say you are with Explora for 20% off.",
      },
      {
        questionEs: "¿Hay clases de snowboard para niños?",
        questionEn: "Are there snowboard lessons for kids?",
        answerEs:
          "Sí, desde 3 años en formatos particulares o Full Day, grupos de 1 a 8. Ver también la página de clases para niños.",
        answerEn:
          "Yes, from age 3 in private or Full Day formats, groups of 1 to 8. See also the kids lessons page.",
      },
    ],
    links: [
      ...sharedLinks,
      { href: "/clases/curso-snowboard", labelEs: "Curso de snowboard", labelEn: "Snowboard course" },
      { href: "/clases/esqui", labelEs: "Clases de esquí", labelEn: "Ski lessons" },
      { href: "/blog/freestyle-sierra-nevada", labelEs: "Guía freestyle", labelEn: "Freestyle guide" },
    ],
  },
  telemark: {
    leadEs: `Explora School & Club imparte clases de telemark en Sierra Nevada con instructores especializados. Técnica nórdica de talón libre en pista (y fuera, según nivel), todos los niveles. Formatos particulares y Full Day; IVA incluido. Reserva online.`,
    leadEn: `Explora School & Club teaches telemark in Sierra Nevada with specialist instructors. Free-heel Nordic technique on piste (and off-piste by level), all levels. Private and Full Day formats; VAT included. Book online.`,
    sections: [
      {
        headingEs: "¿Qué es el telemark y para quién es?",
        headingEn: "What is telemark and who is it for?",
        bodyEs:
          "Es esquí con talón libre y un giro característico, exigente y muy gratificante. Encaja si buscas un reto técnico distinto al alpino clásico, con base de esquí o ganas de aprender desde cero con método.",
        bodyEn:
          "It is free-heel skiing with a distinctive turn—demanding and rewarding. It suits anyone seeking a technical challenge beyond classic alpine, with a ski base or motivation to learn from scratch with a method.",
      },
      {
        headingEs: "¿Necesito material específico de telemark?",
        headingEn: "Do I need specific telemark gear?",
        bodyEs:
          "Sí: fijaciones y botas de telemark. Confirma disponibilidad de alquiler en la estación o trae el tuyo. En la reserva te orientamos sobre qué llevar el primer día.",
        bodyEn:
          "Yes: telemark bindings and boots. Check resort rental availability or bring your own. When you book we advise what to bring on day one.",
      },
      {
        headingEs: "¿Dónde se dan las clases de telemark?",
        headingEn: "Where are telemark lessons held?",
        bodyEs:
          "En Sierra Nevada, con punto de encuentro habitual en Borreguiles (salida Telecabina Al-Andalus), salvo recogida acordada en Full Day.",
        bodyEn:
          "In Sierra Nevada, usually meeting in Borreguiles (Al-Andalus gondola snow exit), unless Full Day pick-up is arranged.",
      },
    ],
    faqs: [
      {
        questionEs: "¿Puedo empezar telemark sin experiencia?",
        questionEn: "Can I start telemark with no experience?",
        answerEs:
          "Sí. Ayuda haber esquiado alpino, pero no es obligatorio. El instructor adapta la progresión a tu condición y equilibrio.",
        answerEn:
          "Yes. Prior alpine skiing helps but is not required. Your instructor adapts progression to your fitness and balance.",
      },
      {
        questionEs: "¿Hay curso colectivo de telemark?",
        questionEn: "Is there a group telemark course?",
        answerEs:
          "De momento el telemark se ofrece en particulares y Full Day (1–8). El curso colectivo de mañana es de snowboard.",
        answerEn:
          "For now telemark is offered as private lessons and Full Day (1–8). The morning group course is snowboard only.",
      },
      {
        questionEs: "¿Cuánto cuesta una clase de telemark?",
        questionEn: "How much does a telemark lesson cost?",
        answerEs: `Misma tarifa que esquí/snowboard: Full Day desde ${FULL_DAY_HOURLY_EUR} €/h; particulares desde ${SESSION_2H_STANDARD[0]} € (2 h). Ver Tarifas.`,
        answerEn: `Same rates as ski/snowboard: Full Day from €${FULL_DAY_HOURLY_EUR}/h; private from €${SESSION_2H_STANDARD[0]} (2 h). See Rates.`,
      },
    ],
    links: [
      ...sharedLinks,
      { href: "/blog/telemark-sierra-nevada", labelEs: "Guía de telemark", labelEn: "Telemark guide" },
      { href: "/clases/esqui", labelEs: "Clases de esquí", labelEn: "Ski lessons" },
    ],
  },
  "esqui-adaptado": {
    leadEs:
      "Explora School & Club ofrece esquí adaptado en Sierra Nevada: clases individualizadas e inclusivas, con seguridad y ritmo propio. Instructores titulados; formato uno a uno. Ideal para diversificar la experiencia en la nieve con acompañamiento experto.",
    leadEn:
      "Explora School & Club offers adaptive skiing in Sierra Nevada: individualized, inclusive lessons at your own pace with a safety focus. Qualified instructors; one-to-one format. Ideal for an expert-supported snow experience.",
    sections: [
      {
        headingEs: "¿Cómo funcionan las clases de esquí adaptado?",
        headingEn: "How do adaptive ski lessons work?",
        bodyEs:
          "Siempre individualizadas (no en grupo). El instructor adapta material, terreno y objetivos a cada persona. Se confirma el plan al reservar según necesidades y condiciones del día.",
        bodyEn:
          "Always one-to-one (not group). The instructor adapts gear, terrain and goals to each person. We confirm the plan when booking based on needs and daily conditions.",
      },
      {
        headingEs: "¿Quién puede participar?",
        headingEn: "Who can take part?",
        bodyEs:
          "Personas con diversidad funcional que quieran esquiar o progresar con acompañamiento especializado. Cuéntanos tu situación al reservar para preparar la sesión.",
        bodyEn:
          "People with disabilities who want to ski or progress with specialist support. Tell us your situation when booking so we can prepare the session.",
      },
      {
        headingEs: "¿Dónde es el encuentro?",
        headingEn: "Where do we meet?",
        bodyEs:
          "Lo concretamos en la confirmación (suele ser Borreguiles / Al-Andalus o un punto más accesible según el caso). Priorizamos comodidad y seguridad.",
        bodyEn:
          "We confirm it in the booking (often Borreguiles / Al-Andalus or a more accessible point as needed). Comfort and safety come first.",
      },
    ],
    faqs: [
      {
        questionEs: "¿El esquí adaptado es siempre individual?",
        questionEn: "Is adaptive skiing always one-to-one?",
        answerEs: "Sí. En Explora el esquí adaptado no se imparte en grupo: la atención es personalizada.",
        answerEn: "Yes. At Explora adaptive skiing is not taught in groups: support is personalized.",
      },
      {
        questionEs: "¿Hay que traer material específico?",
        questionEn: "Do I need to bring specific equipment?",
        answerEs:
          "Depende del caso. Indícalo al solicitar la reserva y te orientamos sobre material propio, adaptaciones o alquiler en estación.",
        answerEn:
          "It depends. Note it when requesting the booking and we will advise on your own gear, adaptations or resort rental.",
      },
      {
        questionEs: "¿Cómo se reserva una clase de esquí adaptado?",
        questionEn: "How do I book an adaptive ski lesson?",
        answerEs:
          "Desde la web (reserva online) o WhatsApp/email. Cuanta más información des (movilidad, experiencia, acompañantes), mejor preparamos la sesión.",
        answerEn:
          "Via the website (online booking) or WhatsApp/email. The more detail you share (mobility, experience, companions), the better we prepare the session.",
      },
    ],
    links: [
      ...sharedLinks,
      { href: "/contacto", labelEs: "Contactar con Explora", labelEn: "Contact Explora" },
    ],
  },
  ninos: {
    leadEs: `Explora School & Club ofrece clases de esquí y snowboard para niños en Sierra Nevada desde 3 años. Grupos de 1 a 8, instructores titulados y formatos particulares o Full Day desde ${FULL_DAY_HOURLY_EUR} €/h. Ritmo lúdico, seguridad y progresión clara. IVA incluido.`,
    leadEn: `Explora School & Club offers kids ski and snowboard lessons in Sierra Nevada from age 3. Groups of 1 to 8, qualified instructors, and private or Full Day formats from €${FULL_DAY_HOURLY_EUR}/h. Playful pace, safety and clear progression. VAT included.`,
    sections: [
      {
        headingEs: "¿Desde qué edad pueden aprender?",
        headingEn: "From what age can they learn?",
        bodyEs:
          "Desde 3 años, segúnando al ritmo y madurez de cada niño. Trabajamos equilibrio, juego y primeros deslizamientos antes de técnica más exigente.",
        bodyEn:
          "From age 3, according to each child's pace and maturity. We work on balance, play and first slides before more demanding technique.",
      },
      {
        headingEs: "¿Esquí o snowboard para niños?",
        headingEn: "Ski or snowboard for kids?",
        bodyEs:
          "Ambas. El esquí suele ser más estable al inicio; el snowboard gusta a muchos a partir de cierta edad. El instructor recomienda según interés, fuerza y experiencia previa.",
        bodyEn:
          "Both. Skiing is often more stable at the start; snowboard appeals to many from a certain age. The instructor advises based on interest, strength and prior experience.",
      },
      {
        headingEs: "¿Dónde recogéis a los niños?",
        headingEn: "Where do you meet the children?",
        bodyEs:
          "Punto habitual: Borreguiles, salida Telecabina Al-Andalus. En Full Day podemos acordar recogida. Los padres reciben indicaciones claras en la confirmación.",
        bodyEn:
          "Usual point: Borreguiles, Al-Andalus gondola snow exit. On Full Day we can arrange pick-up. Parents get clear instructions in the confirmation.",
      },
    ],
    faqs: [
      {
        questionEs: "¿Los niños necesitan forfait?",
        questionEn: "Do children need a lift pass?",
        answerEs:
          "Sí, según edad y zona (normativa Cetursa). El forfait no está incluido en la clase. Revisa sierranevada.es o pregunta al reservar.",
        answerEn:
          "Yes, depending on age and zone (Cetursa rules). The pass is not included in the lesson. Check sierranevada.es or ask when booking.",
      },
      {
        questionEs: "¿Pueden ir hermanos de distinto nivel juntos?",
        questionEn: "Can siblings of different levels share a lesson?",
        answerEs:
          "A veces, si el instructor puede gestionar ambos ritmos. Si el gap es grande, recomendamos grupos separados o sesiones distintas para que ambos progresen.",
        answerEn:
          "Sometimes, if the instructor can manage both paces. If the gap is large, we recommend separate groups or sessions so both progress.",
      },
      {
        questionEs: "¿Incluye material infantil?",
        questionEn: "Does it include kids' equipment?",
        answerEs:
          "No. Alquiler recomendado en José Luis Sáez con 20% de descuento Explora. Casco obligatorio para menores en muchas zonas de la estación.",
        answerEn:
          "No. Recommended rental at José Luis Sáez with 20% Explora discount. Helmets are required for minors in many resort areas.",
      },
      {
        questionEs: "¿Cuánto duran las clases para niños?",
        questionEn: "How long are kids' lessons?",
        answerEs:
          "Particulares mínimo 2 h; Full Day con 5 h de clase efectivas + comodín. Elegimos duración según edad y energía.",
        answerEn:
          "Private lessons minimum 2 h; Full Day with 5 h effective teaching + buffer. We match duration to age and energy.",
      },
    ],
    links: [
      ...sharedLinks,
      { href: "/blog/clases-esqui-ninos-sierra-nevada", labelEs: "Guía: clases para niños", labelEn: "Guide: kids lessons" },
      { href: "/blog/esquiar-en-familia-sierra-nevada", labelEs: "Esquiar en familia", labelEn: "Skiing as a family" },
    ],
  },
};

export const PRODUCT_AEO: Record<IndexableProductId, ProductAeo> = {
  "full-day": {
    leadEs: `El Full Day de Explora School & Club en Sierra Nevada es un día completo con instructor: 5 h de clase efectivas y 1 h de comodín, desde ${FULL_DAY_HOURLY_EUR} €/h (1 persona). Grupos de 1 a 8 en esquí, snowboard, telemark o esquí adaptado. Mejor precio por hora; IVA incluido.`,
    leadEn: `Explora School & Club’s Full Day in Sierra Nevada is a full day with an instructor: 5 h of effective teaching and 1 h buffer, from €${FULL_DAY_HOURLY_EUR}/h (1 person). Groups of 1 to 8 in ski, snowboard, telemark or adaptive ski. Best hourly rate; VAT included.`,
    bodyEs:
      "Horario ajustado a tus necesidades y punto de encuentro personalizado (recogida/entrega bajo petición). Ideal si quieres maximizar horas en nieve sin pagar el €/h de franjas cortas. El forfait y el material no están incluidos.",
    bodyEn:
      "Schedule tailored to your needs and a personalised meeting point (pick-up/drop-off on request). Ideal if you want maximum snow time without the higher €/h of short slots. Lift pass and equipment are not included.",
    faqs: [
      {
        questionEs: "¿Cuánto dura el Full Day?",
        questionEn: "How long is the Full Day?",
        answerEs: "6 h en total: 5 h de clase efectivas y 1 h de descanso/comodín.",
        answerEn: "6 h in total: 5 h of effective teaching and 1 h break/buffer.",
      },
      {
        questionEs: "¿Qué no incluye el Full Day?",
        questionEn: "What does the Full Day not include?",
        answerEs: "Forfait, alquiler de material, comidas y extras de estación. Sí incluye instructor titulado.",
        answerEn: "Lift pass, equipment rental, meals and resort extras. It does include a qualified instructor.",
      },
      {
        questionEs: "¿Puedo elegir disciplina?",
        questionEn: "Can I choose the discipline?",
        answerEs: "Sí: esquí, snowboard, telemark o esquí adaptado (este último siempre individualizado).",
        answerEn: "Yes: ski, snowboard, telemark or adaptive ski (always one-to-one).",
      },
      {
        questionEs: "¿Dónde es el punto de encuentro del Full Day?",
        questionEn: "Where is the Full Day meeting point?",
        answerEs:
          "Por defecto Borreguiles (Al-Andalus). Si pides recogida, te confirmamos otro punto en la reserva.",
        answerEn:
          "By default Borreguiles (Al-Andalus). If you request pick-up, we confirm another point in the booking.",
      },
    ],
    links: [
      ...sharedLinks,
      { href: "/clases/particulares", labelEs: "Comparar con particulares", labelEn: "Compare with private lessons" },
    ],
  },
  "curso-snow": {
    leadEs: `El curso de snowboard de Explora School & Club es colectivo de mañana (10:00–13:00) en Sierra Nevada, desde ${CURSO_COLECTIVO_FROM_EUR} € para 4 personas. Mínimo 4 y máximo 8. Se confirma a partir de 4. Ideal para aprender juntos; IVA incluido.`,
    leadEn: `Explora School & Club’s snowboard course is a morning group class (10:00–13:00) in Sierra Nevada, from €${CURSO_COLECTIVO_FROM_EUR} for 4 people. Minimum 4 and maximum 8. Confirmed from 4. Ideal for learning together; VAT included.`,
    bodyEs:
      "Tres horas efectivas con instructor especializado. Si no se alcanza el mínimo, ofrecemos alternativas. Forfait y material no incluidos; alquiler recomendado en José Luis Sáez con 20% Explora.",
    bodyEn:
      "Three effective hours with a specialist instructor. If the minimum is not reached, we offer alternatives. Lift pass and gear not included; recommended rental at José Luis Sáez with 20% Explora discount.",
    faqs: [
      {
        questionEs: "¿A qué hora es el curso?",
        questionEn: "What time is the course?",
        answerEs: "De 10:00 a 13:00.",
        answerEn: "From 10:00 to 13:00.",
      },
      {
        questionEs: "¿Qué pasa si no somos 4?",
        questionEn: "What if we are fewer than 4?",
        answerEs: "El curso necesita mínimo 4. Te proponemos otra fecha o pasar a particular/Full Day.",
        answerEn: "The course needs a minimum of 4. We suggest another date or switching to private/Full Day.",
      },
      {
        questionEs: "¿Sirve para principiantes?",
        questionEn: "Is it for beginners?",
        answerEs: "Sí. El ritmo es de grupo de mañana; si quieres atención 100% personalizada, elige particular.",
        answerEn: "Yes. Pace is a morning group; for fully personalised attention, choose a private lesson.",
      },
    ],
    links: [
      ...sharedLinks,
      { href: "/clases/snowboard", labelEs: "Todas las clases de snowboard", labelEn: "All snowboard lessons" },
    ],
  },
  particular: {
    leadEs: `Las clases particulares de Explora School & Club en Sierra Nevada te dejan elegir horario y disciplina. Grupos de 1 a 8, mínimo 2 horas, desde ${SESSION_2H_STANDARD[0]} €. Esquí, snowboard, telemark o adaptado; niños desde 3 años. IVA incluido.`,
    leadEn: `Private lessons with Explora School & Club in Sierra Nevada let you choose time and discipline. Groups of 1 to 8, 2-hour minimum, from €${SESSION_2H_STANDARD[0]}. Ski, snowboard, telemark or adaptive; kids from age 3. VAT included.`,
    bodyEs:
      "El precio es el total del grupo y sube con cada persona. Franjas de 2 h o 3 h (la mañana 10:00–13:00 lleva suplemento). Ideal si quieres flexibilidad frente al Full Day o al curso colectivo.",
    bodyEn:
      "Price is the group total and rises with each person. 2 h or 3 h slots (the 10:00–13:00 morning has a surcharge). Ideal if you want flexibility versus Full Day or the group course.",
    faqs: [
      {
        questionEs: "¿Hay clases de 1 hora?",
        questionEn: "Are there 1-hour lessons?",
        answerEs: "No. La duración mínima es 2 horas.",
        answerEn: "No. Minimum duration is 2 hours.",
      },
      {
        questionEs: "¿Qué no incluyen las particulares?",
        questionEn: "What do private lessons not include?",
        answerEs: "Forfait, material y extras de estación. Sí incluyen instructor titulado.",
        answerEn: "Lift pass, equipment and resort extras. They do include a qualified instructor.",
      },
      {
        questionEs: "¿Puedo reservar solo para un niño?",
        questionEn: "Can I book for just one child?",
        answerEs: "Sí, desde 3 años. También podéis venir varios (máx. 8) si el nivel lo permite.",
        answerEn: "Yes, from age 3. Several can share (max 8) if levels allow.",
      },
    ],
    links: [
      ...sharedLinks,
      { href: "/clases/full-day", labelEs: "Comparar con Full Day", labelEn: "Compare with Full Day" },
    ],
  },
};

export const CLASES_HUB_AEO: HubAeo = {
  leadEs: `En Explora School & Club eliges el formato de clase en Sierra Nevada: particulares (mín. 2 h), Full Day (mejor €/h) o curso colectivo de snowboard. Esquí, snowboard, telemark y esquí adaptado; grupos 1–8; instructores titulados. IVA incluido. Reserva online.`,
  leadEn: `At Explora School & Club you choose the lesson format in Sierra Nevada: private (min. 2 h), Full Day (best €/h) or the group snowboard course. Ski, snowboard, telemark and adaptive ski; groups 1–8; qualified instructors. VAT included. Book online.`,
  faqs: [
    {
      questionEs: "¿Qué formato me conviene: particular, Full Day o curso?",
      questionEn: "Which format suits me: private, Full Day or course?",
      answerEs:
        "Particular si quieres horario flexible; Full Day si buscas más horas al mejor €/h; curso de snowboard si sois 4–8 y preferís mañana colectiva.",
      answerEn:
        "Private for flexible timing; Full Day for more hours at the best €/h; snowboard course if you are 4–8 and prefer a morning group.",
    },
    {
      questionEs: "¿Los precios incluyen IVA?",
      questionEn: "Do prices include VAT?",
      answerEs: "Sí. Todas las tarifas publicadas incluyen IVA.",
      answerEn: "Yes. All published rates include VAT.",
    },
    {
      questionEs: "¿Qué no está incluido en la clase?",
      questionEn: "What is not included in the lesson?",
      answerEs: "Forfait, alquiler de material y extras de la estación (comida, parking, etc.).",
      answerEn: "Lift pass, equipment rental and resort extras (food, parking, etc.).",
    },
    {
      questionEs: "¿Dónde vemos el punto de encuentro?",
      questionEn: "Where do we find the meeting point?",
      answerEs: "En Borreguiles (Telecabina Al-Andalus), salvo recogida acordada. Detalle en Cómo llegar.",
      answerEn: "In Borreguiles (Al-Andalus gondola), unless pick-up is arranged. Details under Getting here.",
    },
  ],
  links: [
    { href: "/tarifas", labelEs: "Cuadro de tarifas", labelEn: "Rate chart" },
    { href: "/clases/esqui", labelEs: "Clases de esquí", labelEn: "Ski lessons" },
    { href: "/clases/snowboard", labelEs: "Clases de snowboard", labelEn: "Snowboard lessons" },
    { href: "/clases/ninos", labelEs: "Clases para niños", labelEn: "Kids lessons" },
    { href: "/preguntas-frecuentes", labelEs: "FAQ", labelEn: "FAQ" },
    { href: "/blog/que-tipo-clases-elegir-sierra-nevada", labelEs: "Guía: qué tipo de clase elegir", labelEn: "Guide: which lesson type to choose" },
  ],
};

export const TARIFAS_HUB_AEO: HubAeo = {
  leadEs: `Las tarifas de Explora School & Club en Sierra Nevada parten de ${FULL_DAY_HOURLY_EUR} €/h en Full Day y ${SESSION_2H_STANDARD[0]} € en particulares de 2 h (1 persona). Precios de grupo (1–8) con IVA incluido para esquí, snowboard y telemark. Sin forfait ni material.`,
  leadEn: `Explora School & Club rates in Sierra Nevada start from €${FULL_DAY_HOURLY_EUR}/h on a Full Day and €${SESSION_2H_STANDARD[0]} for 2 h private lessons (1 person). Group prices (1–8) with VAT included for ski, snowboard and telemark. Lift pass and gear not included.`,
  faqs: [
    {
      questionEs: "¿El precio es por persona o por grupo?",
      questionEn: "Is the price per person or per group?",
      answerEs:
        "Es el total del grupo. Sube con cada participante (máx. 8). En el curso de snowboard el mínimo es 4.",
      answerEn:
        "It is the group total. It rises with each participant (max 8). The snowboard course has a minimum of 4.",
    },
    {
      questionEs: "¿Hay descuento por reservar pronto?",
      questionEn: "Is there an early-booking discount?",
      answerEs:
        "En pretemporada puede haber descuento si reservas antes de la fecha indicada en la home. Revisa la promoción vigente al pagar.",
      answerEn:
        "In preseason there may be a discount if you book before the date shown on the home page. Check the current promotion when you pay.",
    },
    {
      questionEs: "¿Qué no incluyen las tarifas?",
      questionEn: "What do the rates not include?",
      answerEs: "Forfait Cetursa, alquiler, parking y comidas. La clase sí incluye instructor titulado.",
      answerEn: "Cetursa lift pass, rental, parking and meals. The lesson does include a qualified instructor.",
    },
    {
      questionEs: "¿Dónde reservo después de ver precios?",
      questionEn: "Where do I book after checking prices?",
      answerEs: "En Clases (añadir al carrito) o Reserva. También por WhatsApp si tienes dudas de nivel o fechas.",
      answerEn: "Under Lessons (add to cart) or Booking. WhatsApp also works if you have level or date questions.",
    },
  ],
  links: [
    { href: "/clases", labelEs: "Elegir formato de clase", labelEn: "Choose a lesson format" },
    { href: "/clases/full-day", labelEs: "Full Day", labelEn: "Full Day" },
    { href: "/clases/particulares", labelEs: "Particulares", labelEn: "Private lessons" },
    { href: "/preguntas-frecuentes", labelEs: "FAQ", labelEn: "FAQ" },
    { href: "/blog/como-reservar-clases-sierra-nevada", labelEs: "Guía: cómo reservar", labelEn: "Guide: how to book" },
  ],
};

export const COMO_LLEGAR_AEO: HubAeo & { sections: AeoSection[] } = {
  leadEs:
    "Para clases con Explora School & Club en Sierra Nevada, el punto de encuentro habitual es Borreguiles (~2.700 m), a la salida a la nieve del Telecabina Al-Andalus. Desde Pradollano reserva ~90 minutos (parking, forfait, material y cola). Parking recomendado: Plaza de Andalucía.",
  leadEn:
    "For lessons with Explora School & Club in Sierra Nevada, the usual meeting point is Borreguiles (~2,700 m), at the Al-Andalus gondola snow exit. From Pradollano allow ~90 minutes (parking, pass, gear and queue). Recommended parking: Plaza de Andalucía.",
  sections: [
    {
      headingEs: "¿Cómo llego al punto de encuentro de Explora?",
      headingEn: "How do I reach Explora’s meeting point?",
      bodyEs:
        "1) Aparca (Plaza de Andalucía subterráneo). 2) Saca forfait si hace falta. 3) Alquila material en José Luis Sáez (20% Explora) junto a los telecabinas. 4) Sube en Al-Andalus hasta Borreguiles y sal a la nieve. El instructor lleva uniforme Explora.",
      bodyEn:
        "1) Park (Plaza de Andalucía underground). 2) Get a lift pass if needed. 3) Rent gear at José Luis Sáez (20% Explora) by the gondolas. 4) Take Al-Andalus to Borreguiles and exit to the snow. Your instructor wears the Explora uniform.",
    },
    {
      headingEs: "¿Cuánto tarda el telecabina?",
      headingEn: "How long is the gondola ride?",
      bodyEs:
        "El trayecto dura unos 10–15 minutos. En hora punta (9:30–11:00) la cola puede ser 15–30 minutos: métete ~40 minutos antes. Por eso la regla práctica es 90 minutos de margen.",
      bodyEn:
        "The ride is about 10–15 minutes. At peak times (9:30–11:00) the queue can be 15–30 minutes: join ~40 minutes early. That is why the practical rule is a 90-minute buffer.",
    },
    {
      headingEs: "¿Dónde saco el forfait?",
      headingEn: "Where do I get the lift pass?",
      bodyEs:
        "En sierranevada.es, cajeros de parkings y Silla del Pueblo, o taquilla en Plaza de Andalucía. El forfait no está incluido en la clase de Explora.",
      bodyEn:
        "At sierranevada.es, car-park and Village chairlift machines, or the Plaza de Andalucía ticket office. The pass is not included in Explora lessons.",
    },
  ],
  faqs: [
    {
      questionEs: "¿Siempre quedamos en Borreguiles?",
      questionEn: "Do we always meet in Borreguiles?",
      answerEs:
        "Es el punto por defecto. En Full Day con recogida podemos confirmar otro. Revisa siempre el mensaje de confirmación.",
      answerEn:
        "It is the default. On a Full Day with pick-up we may confirm another. Always check your confirmation message.",
    },
    {
      questionEs: "¿Qué parking recomendáis?",
      questionEn: "Which car park do you recommend?",
      answerEs:
        "Parking Subterráneo Plaza de Andalucía. Lleva cadenas o fundas por si son obligatorias.",
      answerEn:
        "Plaza de Andalucía underground car park. Carry snow chains or socks in case they are required.",
    },
    {
      questionEs: "¿Dónde está el alquiler con descuento Explora?",
      questionEn: "Where is the rental with Explora discount?",
      answerEs:
        "José Luis Sáez, junto a los telecabinas Al-Andalus y Borreguiles en Pradollano. Di que vienes de Explora para el 20%.",
      answerEn:
        "José Luis Sáez, next to the Al-Andalus and Borreguiles gondolas in Pradollano. Say you are with Explora for 20% off.",
    },
    {
      questionEs: "¿A qué distancia está Sierra Nevada de Granada?",
      questionEn: "How far is Sierra Nevada from Granada?",
      answerEs: "Unos 30 km. Puedes subir en coche, autobús o transfer.",
      answerEn: "About 30 km. You can go by car, bus or transfer.",
    },
  ],
  links: [
    { href: "/clases", labelEs: "Elegir clases", labelEn: "Choose lessons" },
    { href: "/reserva", labelEs: "Reservar", labelEn: "Book" },
    { href: "/preguntas-frecuentes", labelEs: "Más FAQ de estación", labelEn: "More resort FAQs" },
  ],
};

export function aeoFaqsForLocale(locale: string, faqs: AeoFaq[]): { question: string; answer: string }[] {
  const en = locale === "en";
  return faqs.map((f) => ({
    question: en ? f.questionEn : f.questionEs,
    answer: en ? f.answerEn : f.answerEs,
  }));
}
