"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { getPistaById } from "@/data/pistas";
import { progressDisciplineName, type ProgressDisciplineId } from "@/data/progress-skills";
import { ACCOUNT_MEETING_POINT_EN, ACCOUNT_MEETING_POINT_ES, selfLevelName } from "@/data/student-account";
import type { ProgressReport } from "@/lib/progress-reports";
import type { StudentProfile } from "@/lib/student-users";
import { StudentLogoutButton } from "@/components/cuenta/StudentLogoutButton";

type Lesson = {
  leadId: string;
  itemIndex: number;
  status: string;
  productTitle: string;
  date: string;
  timeSlotId: string;
  timeSlotLabel: string;
  discipline: string;
  disciplineLabel: string;
  instructorSlug: string;
  instructorName: string;
  hours: number;
  reportId: string | null;
  whatsappUrl?: string;
};

type AccountDashboardProps = {
  locale: string;
  name: string;
  profile: StudentProfile | null;
  requested: Lesson[];
  confirmed: Lesson[];
  history: Lesson[];
  reports: ProgressReport[];
  hours: number;
  badges: { id: string; label: string }[];
  meetingPoint: string;
  newLessonUrl: string;
  lastInstructorName: string;
};

export function AccountDashboard({
  locale,
  name,
  profile,
  requested,
  confirmed,
  history,
  reports,
  hours,
  badges,
  meetingPoint,
  newLessonUrl,
  lastInstructorName,
}: AccountDashboardProps) {
  const t = useTranslations("account");
  const [tab, setTab] = useState<"reservas" | "progreso">("reservas");
  const incompleteProfile = !profile?.selfLevel || !profile.disciplines?.length;

  return (
    <div className="container-page section-padding pt-8 sm:pt-10">
      <p className="eyebrow">{t("areaEyebrow")}</p>
      <h1 className="page-title mt-2">{t("hello", { name: name.split(" ")[0] || name })}</h1>
      <p className="page-lead">{t("areaLead")}</p>
      {profile?.selfLevel ? (
        <p className="mt-2 text-sm font-semibold text-hielo">
          {t("yourLevel")}: {selfLevelName(profile.selfLevel, locale)}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {incompleteProfile ? (
          <a
            href={`/${locale}/cuenta/bienvenida`}
            className="inline-flex rounded-2xl border border-oro/30 bg-oro/10 px-4 py-3 text-sm font-medium text-pizarra"
          >
            {t("completeProfile")}
          </a>
        ) : null}
        <StudentLogoutButton locale={locale} />
      </div>

      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={() => setTab("reservas")}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            tab === "reservas" ? "bg-hielo text-white" : "border border-hielo/15 bg-white"
          }`}
        >
          {t("tabReservas")}
        </button>
        <button
          type="button"
          onClick={() => setTab("progreso")}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            tab === "progreso" ? "bg-hielo text-white" : "border border-hielo/15 bg-white"
          }`}
        >
          {t("tabProgreso")}
        </button>
      </div>

      {tab === "reservas" ? (
        <div className="mt-8 space-y-10">
          <LessonGroup title={t("requested")} empty={t("requestedEmpty")} count={requested.length}>
            {requested.map((lesson) => (
              <article key={`${lesson.leadId}-${lesson.itemIndex}`} className="rounded-2xl border border-hielo/10 bg-white p-5">
                <p className="font-semibold text-pizarra">{lesson.productTitle}</p>
                <p className="mt-1 text-sm text-muted">
                  {lesson.date} · {lesson.timeSlotLabel} · {lesson.disciplineLabel}
                </p>
                {lesson.whatsappUrl ? (
                  <a href={lesson.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-primary mt-4 !w-auto">
                    {t("whatsappStatus")}
                  </a>
                ) : null}
              </article>
            ))}
          </LessonGroup>

          <LessonGroup title={t("confirmed")} empty={t("confirmedEmpty")} count={confirmed.length}>
            {confirmed.map((lesson) => (
              <article key={`${lesson.leadId}-${lesson.itemIndex}`} className="rounded-2xl border border-hielo/10 bg-white p-5">
                <p className="font-semibold text-pizarra">{lesson.productTitle}</p>
                <p className="mt-1 text-sm text-muted">
                  {lesson.date} · {lesson.timeSlotLabel} · {lesson.disciplineLabel}
                </p>
                {lesson.instructorName ? (
                  <p className="mt-1 text-sm text-hielo">{t("instructor")}: {lesson.instructorName}</p>
                ) : null}
                <div className="mt-3 rounded-xl bg-nieve px-3 py-3 text-sm text-pizarra">
                  {locale === "en" ? ACCOUNT_MEETING_POINT_EN : ACCOUNT_MEETING_POINT_ES}
                </div>
                <a href={`/api/cuenta/calendario/${lesson.leadId}`} className="btn-secondary mt-4 !w-auto">
                  {t("addCalendar")}
                </a>
              </article>
            ))}
          </LessonGroup>

          <LessonGroup title={t("history")} empty={t("historyEmpty")} count={history.length}>
            {history.map((lesson) => (
              <article key={`${lesson.leadId}-${lesson.itemIndex}`} className="rounded-2xl border border-hielo/10 bg-white p-5">
                <p className="font-semibold text-pizarra">{lesson.productTitle}</p>
                <p className="mt-1 text-sm text-muted">
                  {lesson.date} · {lesson.disciplineLabel}
                </p>
                {lesson.reportId ? (
                  <button type="button" className="mt-3 text-sm font-semibold text-hielo" onClick={() => setTab("progreso")}>
                    {t("viewReport")}
                  </button>
                ) : null}
              </article>
            ))}
          </LessonGroup>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-hielo/10 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">{t("hours")}</p>
              <p className="mt-1 font-display text-4xl text-hielo">{hours}</p>
            </div>
            <div className="rounded-2xl border border-hielo/10 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">{t("badges")}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {badges.length ? (
                  badges.map((badge) => (
                    <span key={badge.id} className="rounded-full bg-hielo/10 px-3 py-1 text-xs font-semibold text-hielo">
                      {badge.label}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-muted">{t("noBadges")}</p>
                )}
              </div>
            </div>
          </div>

          {reports.map((report) => (
            <article key={report.id} className="rounded-2xl border border-hielo/10 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-oro">
                {progressDisciplineName(report.discipline as ProgressDisciplineId, locale)}
              </p>
              <h2 className="mt-1 font-display text-xl text-pizarra">{report.instructorName || t("yourInstructor")}</h2>
              <p className="mt-1 text-sm text-muted">{"★".repeat(report.rating)}{"☆".repeat(5 - report.rating)}</p>
              {report.notes ? <p className="mt-3 whitespace-pre-wrap text-sm text-pizarra">{report.notes}</p> : null}
              {report.recommendedPistaIds.length ? (
                <p className="mt-3 text-sm text-muted">
                  {t("pistas")}:{" "}
                  {report.recommendedPistaIds
                    .map((id) => getPistaById(id)?.name || id)
                    .join(", ")}
                </p>
              ) : null}
              {report.media.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {report.media.map((mediaItem) => (
                    <a
                      key={mediaItem.id}
                      href={`/api/cuenta/media/${mediaItem.id}?reportId=${report.id}`}
                      className="rounded-full border border-hielo/20 px-3 py-1.5 text-sm font-semibold text-hielo"
                    >
                      {mediaItem.kind === "video" ? t("downloadVideo") : t("downloadPhoto")}
                    </a>
                  ))}
                </div>
              ) : null}
            </article>
          ))}

          <a href={newLessonUrl} target="_blank" rel="noopener noreferrer" className="btn-primary !w-auto">
            {t("requestNew", { name: lastInstructorName || "Explora" })}
          </a>
          <p className="text-xs text-muted">{meetingPoint}</p>
        </div>
      )}
    </div>
  );
}

function LessonGroup({
  title,
  empty,
  count,
  children,
}: {
  title: string;
  empty: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display text-2xl text-hielo">{title}</h2>
      <div className="mt-4 space-y-3">
        {count > 0 ? children : (
          <p className="rounded-2xl border border-dashed border-hielo/20 bg-white px-4 py-8 text-sm text-muted">
            {empty}
          </p>
        )}
      </div>
    </section>
  );
}
