import { setRequestLocale } from "next-intl/server";
import { DisclosureItem, DisclosurePanel } from "@/components/DisclosureItem";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { SectionHeader } from "@/components/SectionHeader";
import {
  club,
  clubConditions,
  clubFaqs,
  clubNotIncluded,
  clubObjectives,
  clubOfferings,
  clubSchedule,
  membershipBenefits,
} from "@/data/club";
import { media } from "@/lib/media";
import { pickLocale } from "@/lib/locale";
import { buildPageMetadata } from "@/lib/metadata";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import type { Metadata } from "next";
import Image from "next/image";

type Props = { params: Promise<{ locale: string }> };

const navLinks = [
  { href: "#ofertas", labelEs: "Ofertas", labelEn: "Offers" },
  { href: "#membresia", labelEs: "Membresía", labelEn: "Membership" },
  { href: "#jornada", labelEs: "Jornada tipo", labelEn: "Typical day" },
  { href: "#info", labelEs: "Información", labelEn: "Information" },
  { href: "#faq", labelEs: "FAQ", labelEn: "FAQ" },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: "/club",
    title: pickLocale(
      locale,
      "Club Creando Aventuras en Sierra Nevada",
      "Creando Aventuras Club in Sierra Nevada",
    ),
    description: pickLocale(
      locale,
      "Club de esquí y snowboard para jóvenes en Sierra Nevada. Membresía, días sueltos, bonos y actividades con Explora School & Club.",
      "Ski and snowboard club for young people in Sierra Nevada. Membership, day passes, vouchers and activities with Explora School & Club.",
    ),
  });
}

export default async function ClubPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <BreadcrumbJsonLd
        locale={locale}
        items={[{ name: "Club", path: "/club" }]}
      />
      <PageHeader
        eyebrow="Club"
        title={club.name}
        description={pickLocale(locale, club.taglineEs, club.taglineEn)}
      >
        <nav
          className="flex flex-wrap gap-2.5"
          aria-label={pickLocale(locale, "Secciones de la página", "Page sections")}
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="inline-flex items-center rounded-full border border-hielo/15 bg-white px-4 py-2 text-sm font-semibold text-hielo transition hover:border-hielo/30 hover:bg-nieve"
            >
              {pickLocale(locale, link.labelEs, link.labelEn)}
            </a>
          ))}
        </nav>
      </PageHeader>

      {/* Sobre el club */}
      <section className="section-padding bg-nieve">
        <div className="container-page grid items-center grid-gap-lg lg:grid-cols-2">
          <Reveal>
            <SectionHeader
              eyebrow={pickLocale(locale, "Sobre el club", "About the club")}
              title={pickLocale(locale, "Una familia en la montaña", "A mountain family")}
              description={pickLocale(locale, club.aboutLeadEs, club.aboutLeadEn)}
            />
            <p className="mt-5 text-sm leading-relaxed text-muted sm:mt-6 sm:text-base">
              {pickLocale(locale, club.aboutBodyEs, club.aboutBodyEn)}
            </p>
            <p className="mt-5 text-sm font-medium text-hielo">
              {pickLocale(locale, club.federativeNoteEs, club.federativeNoteEn)}
            </p>
          </Reveal>
          <Reveal delay={80}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-lg">
              <Image
                src={media.clubAbout.src}
                alt={pickLocale(locale, media.clubAbout.altEs, media.clubAbout.altEn)}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Ofertas */}
      <section id="ofertas" className="section-padding scroll-target">
        <div className="container-page">
          <Reveal>
            <SectionHeader
              eyebrow={pickLocale(locale, "Servicios", "Services")}
              title={pickLocale(locale, "Cómo disfrutar del club", "How to enjoy the club")}
              description={pickLocale(
                locale,
                "Elige la modalidad que mejor se adapte a ti: desde un día suelto hasta la membresía completa.",
                "Choose the option that suits you best: from a single day to full membership.",
              )}
            />
          </Reveal>
          <div className="section-body grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {clubOfferings.map((item, i) => (
              <Reveal key={item.id} delay={i * 60}>
                <article className="card-interactive relative h-full">
                  {item.noteEs ? (
                    <span className="absolute right-4 top-4 rounded-full bg-oro/15 px-2.5 py-0.5 text-xs font-semibold text-hielo">
                      {pickLocale(locale, item.noteEs, item.noteEn!)}
                    </span>
                  ) : null}
                  <span className="text-3xl" aria-hidden>
                    {item.icon}
                  </span>
                  <h2 className="mt-4 font-display text-lg font-semibold text-hielo">
                    {pickLocale(locale, item.titleEs, item.titleEn)}
                  </h2>
                  <p className="mt-3 text-sm text-muted">
                    {pickLocale(locale, item.descriptionEs, item.descriptionEn)}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Membresía */}
      <section id="membresia" className="section-padding scroll-target bg-nieve">
        <div className="container-page">
          <div className="grid grid-gap-lg lg:grid-cols-[1fr_1.1fr] lg:items-start">
            <Reveal>
              <SectionHeader
                eyebrow={pickLocale(locale, "Membresía", "Membership")}
                title={pickLocale(locale, "Beneficios para socios", "Member benefits")}
                description={pickLocale(
                  locale,
                  "Esto es lo que incluye ser socio.",
                  "This is what membership includes.",
                )}
              />
            </Reveal>
            <Reveal delay={80}>
              <ul className="grid gap-4 sm:grid-cols-2">
                {membershipBenefits.map((benefit) => (
                  <li
                    key={benefit.textEs}
                    className="flex items-start gap-3 rounded-xl border border-hielo/10 bg-white px-5 py-4 text-sm text-pizarra"
                  >
                    <svg
                      className="mt-0.5 h-4 w-4 shrink-0 text-oro"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      aria-hidden
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    {pickLocale(locale, benefit.textEs, benefit.textEn)}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Jornada tipo */}
      <section id="jornada" className="section-padding scroll-target">
        <div className="container-page">
          <Reveal>
            <SectionHeader
              eyebrow={pickLocale(locale, "Un día en el club", "A day at the club")}
              title={pickLocale(locale, "Desarrollo de una jornada", "How a club day works")}
            />
          </Reveal>
          <div className="section-body grid gap-5 md:grid-cols-2">
            {clubSchedule.map((item, i) => (
              <Reveal key={item.timeEs} delay={i * 60}>
                <div className="flex gap-4 rounded-2xl border border-hielo/10 bg-white p-6 shadow-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-hielo/10 font-display text-sm font-bold text-hielo">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-oro">
                      {pickLocale(locale, item.timeEs, item.timeEn)}
                    </p>
                    <p className="mt-1 text-sm font-medium text-pizarra">
                      {pickLocale(locale, item.titleEs, item.titleEn)}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <p className="section-body-sm text-center text-sm italic text-muted">
              {pickLocale(locale, club.scheduleNoteEs, club.scheduleNoteEn)}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Objetivos */}
      <section className="section-padding bg-nieve">
        <div className="container-page">
          <Reveal>
            <SectionHeader
              eyebrow={pickLocale(locale, "Valores", "Values")}
              title={pickLocale(locale, "Nuestros objetivos", "Our goals")}
              description={pickLocale(
                locale,
                "Lo que nos mueve cada día para ofrecerte la mejor experiencia.",
                "What drives us every day to offer you the best experience.",
              )}
            />
          </Reveal>
          <div className="section-body grid gap-6 md:grid-cols-3">
            {clubObjectives.map((item, i) => (
              <Reveal key={item.titleEs} delay={i * 80}>
                <article className="card-interactive h-full text-center">
                  <span className="text-3xl" aria-hidden>
                    {item.icon}
                  </span>
                  <h2 className="mt-4 font-display text-xl font-semibold text-hielo">
                    {pickLocale(locale, item.titleEs, item.titleEn)}
                  </h2>
                  <p className="mt-3 text-sm text-muted">
                    {pickLocale(locale, item.descEs, item.descEn)}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Información importante */}
      <section id="info" className="section-padding scroll-target">
        <div className="container-page">
          <Reveal>
            <SectionHeader
              eyebrow={pickLocale(locale, "Antes de reservar", "Before you book")}
              title={pickLocale(locale, "Información importante", "Important information")}
            />
          </Reveal>
          <div className="section-body grid gap-6 md:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-2xl border border-hielo/10 bg-white p-6 shadow-sm md:p-8">
                <h3 className="font-display text-lg font-semibold text-hielo">
                  {pickLocale(locale, "No incluido en los precios", "Not included in prices")}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {clubNotIncluded.map((item) => (
                    <li key={item.textEs} className="flex items-start gap-2.5 text-sm text-muted">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-hielo/40" aria-hidden />
                      {pickLocale(locale, item.textEs, item.textEn)}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="h-full rounded-2xl border border-hielo/10 bg-white p-6 shadow-sm md:p-8">
                <h3 className="font-display text-lg font-semibold text-hielo">
                  {pickLocale(locale, "Condiciones generales", "General conditions")}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {clubConditions.map((item) => (
                    <li key={item.textEs} className="flex items-start gap-2.5 text-sm text-muted">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-oro/60" aria-hidden />
                      {pickLocale(locale, item.textEs, item.textEn)}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="section-padding scroll-target bg-nieve">
        <div className="container-page">
          <Reveal>
            <SectionHeader
              eyebrow="FAQ"
              title={pickLocale(locale, "Preguntas frecuentes", "Frequently asked questions")}
              description={pickLocale(
                locale,
                "Resolvemos las dudas más comunes sobre el club.",
                "Answers to the most common questions about the club.",
              )}
            />
          </Reveal>
          <Reveal>
            <DisclosurePanel className="section-body-sm">
              {clubFaqs.map((faq, i) => (
                <DisclosureItem
                  key={faq.id}
                  defaultOpen={i === 0}
                  title={pickLocale(locale, faq.questionEs, faq.questionEn)}
                >
                  {pickLocale(locale, faq.answerEs, faq.answerEn)}
                </DisclosureItem>
              ))}
            </DisclosurePanel>
          </Reveal>
        </div>
      </section>

      {/* CTA unirse */}
      <section className="section-padding">
        <div className="container-page">
          <Reveal>
            <div className="relative overflow-hidden rounded-2xl mesh-dark px-5 py-8 text-nieve sm:px-7 sm:py-10 md:px-10 md:py-12">
              <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/25 blur-[80px]" aria-hidden />
              <div className="relative mx-auto max-w-2xl text-center">
                <h2 className="font-display text-2xl font-semibold sm:text-3xl">
                  {pickLocale(locale, "¿Quieres unirte al club?", "Want to join the club?")}
                </h2>
                <p className="mt-5 text-sm text-on-dark-muted sm:mt-6 sm:text-base">
                  {pickLocale(
                    locale,
                    "Consulta precios, calendario y reserva tu plaza en la web del Club Deportivo Creando Aventuras.",
                    "Check prices, calendar and book your spot on the Creando Aventuras sports club website.",
                  )}
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-4 sm:mt-10">
                  <a
                    href={club.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary !w-auto"
                  >
                    {pickLocale(locale, "Ir a creandoaventuras.com", "Go to creandoaventuras.com")}
                  </a>
                  <a href={club.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-glass !w-auto">
                    WhatsApp
                  </a>
                  <a href={`mailto:${club.email}`} className="btn-secondary !w-auto">
                    {club.email}
                  </a>
                </div>
                <p className="mt-7 text-xs text-on-dark-muted sm:mt-8">
                  {club.phoneDisplay} · {pickLocale(locale, "Lunes a domingo 8:00–21:00", "Monday to Sunday 8:00–21:00")}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
