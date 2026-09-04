"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { getPistaById, PISTA_LEVEL_LABEL, sectorName, type PistaLevel, type PistaSectorId } from "@/data/pistas";
import {
  progressDisciplineName,
  progressSkillLabel,
  type ProgressDisciplineId,
} from "@/data/progress-skills";
import { selfSkillLabel, skillsForDiscipline } from "@/data/self-assessment-skills";
import { site } from "@/data/site";
import {
  ACCOUNT_MEETING_POINT_EN,
  ACCOUNT_MEETING_POINT_ES,
  COMPANION_RELATIONS,
  selfLevelName,
} from "@/data/student-account";
import { formatEquipmentSummary } from "@/lib/student-equipment";
import type { ProgressReport } from "@/lib/progress-reports";
import { progressReportIsNew, progressReportIsUnread } from "@/lib/progress-reports";
import type { StudentProfile } from "@/lib/student-users";
import type { StudentTip } from "@/lib/student-tips";
import { buildSkillTimeline } from "@/lib/skill-bridge";
import { StudentLogoutButton } from "@/components/cuenta/StudentLogoutButton";
import { StudentMediaUploader } from "@/components/cuenta/StudentMediaUploader";

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

type TabId = "resumen" | "reservas" | "progreso" | "medias";

type AccountDashboardProps = {
  locale: string;
  name: string;
  profile: StudentProfile | null;
  requested: Lesson[];
  confirmed: Lesson[];
  history: Lesson[];
  reports: ProgressReport[];
  tips: StudentTip[];
  hours: number;
  badges: { id: string; label: string }[];
  meetingPoint: string;
  newLessonUrl: string;
  lastInstructorName: string;
};

const TABS: TabId[] = ["resumen", "reservas", "progreso", "medias"];

function isTabId(value: string): value is TabId {
  return TABS.includes(value as TabId);
}

function parseLessonDay(date: string): Date {
  return new Date(`${date}T12:00:00`);
}

function daysFromToday(date: string): number {
  const target = parseLessonDay(date);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

function formatLessonParts(date: string, locale: string) {
  const day = parseLessonDay(date);
  const loc = locale === "en" ? "en-GB" : "es-ES";
  return {
    dayNum: String(day.getDate()),
    month: new Intl.DateTimeFormat(loc, { month: "short" }).format(day).replace(".", ""),
    weekday: new Intl.DateTimeFormat(loc, { weekday: "short" }).format(day).replace(".", ""),
    full: new Intl.DateTimeFormat(loc, {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(day),
  };
}

function sortByDateAsc(a: Lesson, b: Lesson) {
  return a.date.localeCompare(b.date) || a.timeSlotId.localeCompare(b.timeSlotId);
}

function pickNextLesson(lessons: Lesson[]): Lesson | null {
  const sorted = [...lessons].sort(sortByDateAsc);
  return sorted.find((lesson) => daysFromToday(lesson.date) >= 0) ?? sorted[0] ?? null;
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "");
  return letters.join("") || "E";
}

function pistaTone(level: PistaLevel): string {
  if (level === "green") return "bg-emerald-100 text-emerald-800";
  if (level === "blue") return "bg-sky-100 text-sky-800";
  if (level === "red") return "bg-rose-100 text-rose-800";
  return "bg-pizarra text-white";
}

export function AccountDashboard({
  locale,
  name,
  profile,
  requested,
  confirmed,
  history,
  reports,
  tips,
  hours,
  badges,
  meetingPoint,
  newLessonUrl,
  lastInstructorName,
}: AccountDashboardProps) {
  const t = useTranslations("account");
  const firstName = name.split(" ")[0] || name;
  const [tab, setTab] = useState<TabId>("resumen");

  const confirmedSorted = useMemo(() => [...confirmed].sort(sortByDateAsc), [confirmed]);
  const requestedSorted = useMemo(() => [...requested].sort(sortByDateAsc), [requested]);
  const historySorted = useMemo(
    () => [...history].sort((a, b) => sortByDateAsc(b, a)),
    [history],
  );
  const reportsSorted = useMemo(
    () => [...reports].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [reports],
  );
  const nextLesson = useMemo(() => pickNextLesson(confirmedSorted), [confirmedSorted]);
  const latestReport = reportsSorted[0] ?? null;
  const unreadReports = useMemo(
    () => reportsSorted.filter((report) => progressReportIsUnread(report, profile?.progressSeenAt ?? null)),
    [reportsSorted, profile?.progressSeenAt],
  );
  const unreadIds = useMemo(() => new Set(unreadReports.map((report) => report.id)), [unreadReports]);
  const seenPosted = useRef(false);
  const pinnedTip = useMemo(() => tips.find((tip) => tip.pinned) ?? null, [tips]);
  const tipHistory = useMemo(
    () => tips.filter((tip) => !tip.pinned).slice(0, 8),
    [tips],
  );

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (isTabId(hash)) setTab(hash);
  }, []);

  function markProgressSeen() {
    if (seenPosted.current) return;
    seenPosted.current = true;
    void fetch("/api/cuenta/progress-seen", { method: "POST" }).catch(() => {
      seenPosted.current = false;
    });
  }

  useEffect(() => {
    if (unreadIds.size === 0) {
      if (!profile?.progressSeenAt) markProgressSeen();
      return;
    }
    if (tab === "progreso") {
      markProgressSeen();
      return;
    }
    const timer = window.setTimeout(markProgressSeen, 2500);
    return () => window.clearTimeout(timer);
  }, [tab, unreadIds.size, profile?.progressSeenAt]);

  function goTab(id: TabId) {
    setTab(id);
    window.history.replaceState(null, "", `#${id}`);
  }

  const meetingCopy = locale === "en" ? ACCOUNT_MEETING_POINT_EN : ACCOUNT_MEETING_POINT_ES;
  const usesRental = profile?.equipment?.source === "rental";

  return (
    <div className="container-page pb-12 pt-4 sm:pb-16 sm:pt-8 lg:pb-20">
      <header className="flex items-center gap-2.5 sm:gap-4">
        {profile?.photoURL ? (
          <Image
            src={profile.photoURL}
            alt=""
            width={56}
            height={56}
            className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm sm:h-14 sm:w-14"
          />
        ) : (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-hielo text-sm font-semibold text-white shadow-sm sm:h-14 sm:w-14 sm:text-lg">
            {initialsFromName(name)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="eyebrow hidden sm:block">{t("areaEyebrow")}</p>
          <h1 className="truncate font-display text-[1.35rem] leading-tight text-hielo sm:text-4xl">
            {t("hello", { name: firstName })}
          </h1>
          <p className="mt-0.5 hidden truncate text-sm text-muted sm:block">{t("areaLead")}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Link
            href="/cuenta/bienvenida?edit=1"
            className="rounded-full border border-hielo/15 bg-white px-2.5 py-1.5 text-[0.7rem] font-semibold text-hielo hover:border-hielo/30 sm:px-3.5 sm:py-2 sm:text-xs"
          >
            {t("editProfile")}
          </Link>
          <StudentLogoutButton locale={locale} />
        </div>
      </header>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-6 sm:gap-3 xl:grid-cols-4">
        <StatCard label={t("statHours")} value={String(hours)} hint="h" />
        <StatCard label={t("statLessons")} value={String(confirmed.length)} hint={t("confirmed")} />
        <StatCard label={t("statPending")} value={String(requested.length)} hint={t("requested")} />
        <StatCard
          label={t("yourLevel")}
          value={profile?.selfLevel ? selfLevelName(profile.selfLevel, locale) : t("noLevelYet")}
          compact
        />
      </div>

      {unreadReports.length > 0 ? (
        <button
          type="button"
          onClick={() => {
            markProgressSeen();
            goTab("progreso");
          }}
          className="mt-4 flex w-full items-start gap-3 rounded-2xl border border-accent/30 bg-accent/[0.07] px-3.5 py-3.5 text-left shadow-sm sm:mt-5 sm:px-5 sm:py-4"
        >
          <span className="mt-0.5 flex h-2.5 w-2.5 shrink-0 rounded-full bg-accent" aria-hidden />
          <span className="min-w-0">
            <span className="block text-[0.65rem] font-bold uppercase tracking-wider text-accent">
              {unreadReports.length === 1 ? t("progressUpdated") : t("tabProgreso")}
            </span>
            <span className="mt-1 block text-sm font-semibold text-pizarra">
              {unreadReports.length === 1
                ? t("progressUnreadBanner")
                : t("progressUnreadBannerMany", { count: unreadReports.length })}
            </span>
            <span className="mt-1 block text-xs font-semibold text-hielo">{t("seeProgress")} →</span>
          </span>
        </button>
      ) : null}

      {nextLesson ? (
        <NextLessonCard
          lesson={nextLesson}
          locale={locale}
          meetingCopy={meetingCopy}
          t={t}
        />
      ) : (
        <section className="mt-4 rounded-xl border border-dashed border-hielo/20 bg-white px-3.5 py-4 sm:mt-5 sm:rounded-2xl sm:px-5 sm:py-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-hielo">{t("nextLesson")}</p>
          <p className="mt-2 text-sm text-muted">{t("noUpcoming")}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/reserva" className="btn-primary !w-auto">
              {t("bookLesson")}
            </Link>
            <a href={newLessonUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary !w-auto">
              {t("whatsappTeam")}
            </a>
          </div>
        </section>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-5 sm:grid-cols-2 lg:grid-cols-4">
        <QuickLink href="/reserva" label={t("bookLesson")} />
        <QuickLink href={newLessonUrl} label={t("whatsappTeam")} external />
        <QuickLink href="/como-llegar" label={t("howToGetThere")} />
        <button
          type="button"
          onClick={() => goTab("medias")}
          className="rounded-xl border border-hielo/10 bg-white px-3 py-2.5 text-left text-[0.8rem] font-semibold text-hielo transition hover:border-hielo/25 hover:bg-hielo/5 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm"
        >
          {t("uploadForCorrection")}
        </button>
        {usesRental ? (
          <QuickLink href={site.rentalPartner.googleMapsUrl} label={t("rentalMaps")} external />
        ) : null}
      </div>

      {pinnedTip ? (
        <aside className="mt-4 overflow-hidden rounded-2xl border border-oro/25 bg-gradient-to-br from-oro/10 via-white to-hielo/5 px-3.5 py-3.5 shadow-sm sm:mt-5 sm:px-5 sm:py-4">
          <p className="text-[0.65rem] font-bold uppercase tracking-wider text-oro">{t("staffTips")}</p>
          <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-pizarra">{pinnedTip.text}</p>
          {pinnedTip.authorName ? (
            <p className="mt-2 text-xs text-muted">
              {pinnedTip.authorName}
              {pinnedTip.createdAt ? ` · ${pinnedTip.createdAt.slice(0, 10)}` : ""}
            </p>
          ) : null}
        </aside>
      ) : profile?.staffTips ? (
        <aside className="mt-4 overflow-hidden rounded-2xl border border-oro/25 bg-gradient-to-br from-oro/10 via-white to-hielo/5 px-3.5 py-3.5 shadow-sm sm:mt-5 sm:px-5 sm:py-4">
          <p className="text-[0.65rem] font-bold uppercase tracking-wider text-oro">{t("staffTips")}</p>
          <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-pizarra">{profile.staffTips}</p>
        </aside>
      ) : null}

      {latestReport?.nextFocus ? (
        <aside
          className={`mt-3 overflow-hidden rounded-2xl px-3.5 py-3.5 shadow-sm sm:px-5 sm:py-4 ${
            unreadIds.has(latestReport.id)
              ? "border border-accent/30 bg-accent/[0.06]"
              : "border border-hielo/15 bg-white"
          }`}
        >
          <p className="text-[0.65rem] font-bold uppercase tracking-wider text-hielo">
            {t("nextFocus")}
            {unreadIds.has(latestReport.id) ? (
              <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-white">
                {progressReportIsNew(latestReport) ? t("progressNew") : t("progressUpdated")}
              </span>
            ) : null}
          </p>
          <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-pizarra">{latestReport.nextFocus}</p>
          <button
            type="button"
            onClick={() => goTab("progreso")}
            className="mt-2 text-xs font-semibold text-hielo"
          >
            {t("seeProgress")} →
          </button>
        </aside>
      ) : null}

      <div className="sticky top-[var(--header-offset)] z-20 -mx-4 mt-4 bg-nieve/90 px-4 py-1.5 backdrop-blur-md sm:-mx-0 sm:mt-6 sm:px-0 sm:py-2">
        <div className="panel-scroller pb-0.5">
          {(
            [
              ["resumen", t("tabOverview")],
              ["reservas", t("tabReservas")],
              ["progreso", t("tabProgreso")],
              ["medias", t("tabMedias")],
            ] as const
          ).map(([id, label]) => {
            const count =
              id === "reservas"
                ? requested.length + confirmed.length
                : id === "progreso"
                  ? reports.length
                  : null;
            return (
              <button
                key={id}
                type="button"
                aria-current={tab === id ? "page" : undefined}
                onClick={() => goTab(id)}
                className={`relative shrink-0 rounded-full px-3 py-1.5 text-[0.8rem] font-semibold transition sm:px-4 sm:py-2 sm:text-sm ${
                  tab === id
                    ? "bg-hielo text-white shadow-sm"
                    : "border border-hielo/15 bg-white text-pizarra hover:border-hielo/30"
                }`}
              >
                {label}
                {count ? <span className="ml-1.5 tabular-nums opacity-80">{count}</span> : null}
                {id === "progreso" && unreadIds.size > 0 ? (
                  <span className="ml-1.5 inline-block h-2 w-2 rounded-full bg-accent align-middle" aria-hidden />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {tab === "resumen" ? (
        <div className="mt-4 grid gap-3 sm:mt-6 sm:gap-5 lg:grid-cols-[1.4fr_1fr]">
          <section className="space-y-4">
            <OverviewBookings
              confirmed={confirmedSorted}
              requested={requestedSorted}
              locale={locale}
              t={t}
              onSeeAll={() => goTab("reservas")}
            />
            {latestReport ? (
              <ReportCard
                report={latestReport}
                locale={locale}
                t={t}
                featured
                fresh={unreadIds.has(latestReport.id)}
                hideNextFocus={Boolean(latestReport.nextFocus)}
                onOpenProgress={() => goTab("progreso")}
              />
            ) : (
              <EmptyHint title={t("latestReport")} body={t("noReportsYet")} />
            )}
          </section>
          <aside className="space-y-4">
            <ProfileSnapshot profile={profile} locale={locale} t={t} />
            {badges.length ? (
              <section className="rounded-xl border border-hielo/10 bg-white p-3.5 sm:rounded-2xl sm:p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">{t("badges")}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {badges.map((badge) => (
                    <span
                      key={badge.id}
                      className="rounded-full bg-hielo/10 px-3 py-1 text-xs font-semibold text-hielo"
                    >
                      {badge.label}
                    </span>
                  ))}
                </div>
              </section>
            ) : null}
            <p className="px-1 text-xs text-muted">{meetingPoint}</p>
          </aside>
        </div>
      ) : null}

      {tab === "reservas" ? (
        <div className="mt-4 space-y-6 sm:mt-6 sm:space-y-8">
          <LessonGroup title={t("confirmed")} empty={t("confirmedEmpty")} count={confirmedSorted.length}>
            {confirmedSorted.map((lesson) => (
              <LessonCard
                key={`${lesson.leadId}-${lesson.itemIndex}`}
                lesson={lesson}
                locale={locale}
                meetingCopy={meetingCopy}
                t={t}
                tone="confirmed"
                onViewReport={() => goTab("progreso")}
              />
            ))}
          </LessonGroup>
          <LessonGroup title={t("requested")} empty={t("requestedEmpty")} count={requestedSorted.length}>
            {requestedSorted.map((lesson) => (
              <LessonCard
                key={`${lesson.leadId}-${lesson.itemIndex}`}
                lesson={lesson}
                locale={locale}
                meetingCopy={meetingCopy}
                t={t}
                tone="pending"
              />
            ))}
          </LessonGroup>
          <LessonGroup title={t("history")} empty={t("historyEmpty")} count={historySorted.length}>
            {historySorted.map((lesson) => (
              <LessonCard
                key={`${lesson.leadId}-${lesson.itemIndex}`}
                lesson={lesson}
                locale={locale}
                meetingCopy={meetingCopy}
                t={t}
                tone="history"
                onViewReport={() => goTab("progreso")}
              />
            ))}
          </LessonGroup>
        </div>
      ) : null}

      {tab === "progreso" ? (
        <ProgressPanel
          reports={reportsSorted}
          tipHistory={tipHistory.filter(
            (tip) =>
              !latestReport?.nextFocus ||
              tip.text.trim() !== latestReport.nextFocus.trim(),
          )}
          latestReportId={latestReport?.id ?? null}
          hideNextFocusGlobally={Boolean(latestReport?.nextFocus)}
          unreadIds={unreadIds}
          profile={profile}
          locale={locale}
          t={t}
          newLessonUrl={newLessonUrl}
          lastInstructorName={lastInstructorName}
          meetingPoint={meetingPoint}
        />
      ) : null}

      {tab === "medias" ? (
        <div className="mt-4 rounded-xl border border-hielo/10 bg-white p-3.5 sm:mt-6 sm:rounded-2xl sm:p-5">
          <h2 className="font-display text-xl text-hielo">{t("mediaTitle")}</h2>
          <StudentMediaUploader embedded />
        </div>
      ) : null}
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  compact,
}: {
  label: string;
  value: string;
  hint?: string;
  compact?: boolean;
}) {
  return (
    <div className="rounded-xl border border-hielo/10 bg-white px-3 py-2.5 sm:rounded-2xl sm:px-4 sm:py-4">
      <p className="text-[0.62rem] font-semibold uppercase tracking-wider text-muted sm:text-[0.7rem]">{label}</p>
      <p className={`mt-0.5 font-display text-hielo ${compact ? "text-base leading-tight sm:text-xl" : "text-2xl sm:text-3xl"}`}>
        {value}
        {hint && !compact ? <span className="ml-1 text-base font-sans font-semibold text-muted">{hint}</span> : null}
      </p>
    </div>
  );
}

function QuickLink({
  href,
  label,
  external,
}: {
  href: string;
  label: string;
  external?: boolean;
}) {
  const className =
    "rounded-xl border border-hielo/10 bg-white px-3 py-2.5 text-left text-[0.8rem] font-semibold text-hielo transition hover:border-hielo/25 hover:bg-hielo/5 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm";
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {label}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

function relativeLabel(
  date: string,
  t: ReturnType<typeof useTranslations<"account">>,
): string | null {
  const days = daysFromToday(date);
  if (days === 0) return t("today");
  if (days === 1) return t("tomorrow");
  if (days > 1 && days <= 21) return t("inDays", { days });
  if (days < 0 && days >= -21) return t("daysAgo", { days: Math.abs(days) });
  return null;
}

function NextLessonCard({
  lesson,
  locale,
  meetingCopy,
  t,
}: {
  lesson: Lesson;
  locale: string;
  meetingCopy: string;
  t: ReturnType<typeof useTranslations<"account">>;
}) {
  const parts = formatLessonParts(lesson.date, locale);
  const when = relativeLabel(lesson.date, t);

  return (
    <section className="mt-4 overflow-hidden rounded-xl border border-hielo/15 bg-hielo text-white shadow-[0_16px_40px_rgb(45_107_100_/_0.18)] sm:mt-5 sm:rounded-2xl">
      <div className="flex items-center gap-3 p-3.5 sm:grid sm:grid-cols-[auto_1fr] sm:gap-4 sm:p-5">
        <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-white/10 text-center sm:h-[4.75rem] sm:w-[4.75rem] sm:rounded-2xl">
          <span className="text-[0.6rem] font-semibold uppercase tracking-wider text-frost sm:text-[0.65rem]">{parts.weekday}</span>
          <span className="font-display text-2xl leading-none sm:text-3xl">{parts.dayNum}</span>
          <span className="text-[0.65rem] uppercase tracking-wide text-frost sm:text-[0.7rem]">{parts.month}</span>
        </div>
        <div className="min-w-0">
          <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-frost sm:text-xs">
            {t("nextLesson")}
            {when ? ` · ${when}` : ""}
          </p>
          <h2 className="mt-0.5 truncate font-display text-lg leading-tight sm:text-2xl">{lesson.productTitle}</h2>
          <p className="mt-0.5 truncate text-xs text-white/80 sm:text-sm">
            {lesson.timeSlotLabel} · {lesson.disciplineLabel}
            {lesson.instructorName ? ` · ${lesson.instructorName}` : ""}
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 bg-black/10 px-3.5 py-3 sm:px-5 sm:py-4">
        <p className="text-xs text-white/90 sm:text-sm">
          <span className="font-semibold">{t("meetingPointLabel")}: </span>
          {meetingCopy}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={site.meetingPoint.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-hielo sm:px-4 sm:py-2 sm:text-sm"
          >
            {t("openMaps")}
          </a>
          <a
            href={`/api/cuenta/calendario/${lesson.leadId}`}
            className="rounded-full border border-white/30 px-3 py-1.5 text-xs font-semibold text-white sm:px-4 sm:py-2 sm:text-sm"
          >
            {t("addCalendar")}
          </a>
        </div>
      </div>
    </section>
  );
}

function OverviewBookings({
  confirmed,
  requested,
  locale,
  t,
  onSeeAll,
}: {
  confirmed: Lesson[];
  requested: Lesson[];
  locale: string;
  t: ReturnType<typeof useTranslations<"account">>;
  onSeeAll: () => void;
}) {
  const preview = [...confirmed, ...requested].slice(0, 3);
  return (
    <section className="rounded-xl border border-hielo/10 bg-white p-3.5 sm:rounded-2xl sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg text-hielo sm:text-xl">{t("tabReservas")}</h2>
        <button type="button" onClick={onSeeAll} className="text-sm font-semibold text-hielo">
          {t("seeBookings")}
        </button>
      </div>
      {preview.length ? (
        <ul className="mt-4 divide-y divide-hielo/10">
          {preview.map((lesson) => {
            const parts = formatLessonParts(lesson.date, locale);
            const pending = lesson.status === "pending";
            return (
              <li key={`${lesson.leadId}-${lesson.itemIndex}`} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <DateBadge parts={parts} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-pizarra">{lesson.productTitle}</p>
                  <p className="truncate text-sm text-muted">
                    {lesson.timeSlotLabel} · {lesson.disciplineLabel}
                  </p>
                </div>
                <StatusPill pending={pending} t={t} />
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted">{t("confirmedEmpty")}</p>
      )}
    </section>
  );
}

function DateBadge({
  parts,
}: {
  parts: ReturnType<typeof formatLessonParts>;
}) {
  return (
    <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-nieve text-center sm:h-12 sm:w-12">
      <span className="text-[0.55rem] font-semibold uppercase tracking-wider text-muted sm:text-[0.6rem]">{parts.month}</span>
      <span className="font-display text-base leading-none text-hielo sm:text-lg">{parts.dayNum}</span>
    </div>
  );
}

function StatusPill({
  pending,
  t,
}: {
  pending: boolean;
  t: ReturnType<typeof useTranslations<"account">>;
}) {
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide ${
        pending ? "bg-oro/15 text-hielo" : "bg-hielo/10 text-hielo"
      }`}
    >
      {pending ? t("statusPending") : t("statusConfirmed")}
    </span>
  );
}

function LessonCard({
  lesson,
  locale,
  meetingCopy,
  t,
  tone,
  onViewReport,
}: {
  lesson: Lesson;
  locale: string;
  meetingCopy: string;
  t: ReturnType<typeof useTranslations<"account">>;
  tone: "confirmed" | "pending" | "history";
  onViewReport?: () => void;
}) {
  const parts = formatLessonParts(lesson.date, locale);
  const when = relativeLabel(lesson.date, t);

  return (
    <article className="rounded-xl border border-hielo/10 bg-white p-3.5 sm:rounded-2xl sm:p-5">
      <div className="flex items-start gap-3">
        <DateBadge parts={parts} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-pizarra">{lesson.productTitle}</h3>
            {tone !== "history" ? <StatusPill pending={tone === "pending"} t={t} /> : null}
          </div>
          <p className="mt-1 text-sm text-muted">
            {parts.full}
            {when ? ` · ${when}` : ""} · {lesson.timeSlotLabel} · {lesson.disciplineLabel}
          </p>
          {lesson.instructorName ? (
            <p className="mt-1 text-sm text-hielo">
              {t("instructor")}: {lesson.instructorName}
            </p>
          ) : null}
        </div>
      </div>

      {tone === "confirmed" ? (
        <div className="mt-3 rounded-xl bg-nieve px-3 py-3 text-sm text-pizarra">{meetingCopy}</div>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {tone === "pending" && lesson.whatsappUrl ? (
          <a href={lesson.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-primary !w-auto">
            {t("whatsappStatus")}
          </a>
        ) : null}
        {tone === "confirmed" ? (
          <>
            <a href={`/api/cuenta/calendario/${lesson.leadId}`} className="btn-secondary !w-auto">
              {t("addCalendar")}
            </a>
            <a
              href={site.meetingPoint.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-hielo/20 px-4 py-2 text-sm font-semibold text-hielo"
            >
              {t("openMaps")}
            </a>
          </>
        ) : null}
        {tone === "history" && lesson.reportId && onViewReport ? (
          <button type="button" onClick={onViewReport} className="text-sm font-semibold text-hielo">
            {t("viewReport")}
          </button>
        ) : null}
      </div>
    </article>
  );
}

function ProfileSnapshot({
  profile,
  locale,
  t,
}: {
  profile: StudentProfile | null;
  locale: string;
  t: ReturnType<typeof useTranslations<"account">>;
}) {
  if (!profile) return null;
  const disciplines = profile.disciplines
    .map((id) => progressDisciplineName(id, locale))
    .join(" · ");

  return (
    <section className="rounded-xl border border-hielo/10 bg-white p-3.5 sm:rounded-2xl sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">{t("profileSummary")}</p>
        <Link href="/cuenta/bienvenida?edit=1" className="text-xs font-semibold text-hielo">
          {t("editProfile")}
        </Link>
      </div>
      {disciplines ? <p className="mt-2 text-sm font-semibold text-hielo">{disciplines}</p> : null}
      {profile.equipment ? (
        <p className="mt-2 text-sm leading-relaxed text-pizarra">
          {formatEquipmentSummary(profile.equipment, profile.disciplines, locale)}
        </p>
      ) : null}
      {profile.companions.length ? (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">{t("companions")}</p>
          <ul className="mt-1 space-y-1 text-sm text-pizarra">
            {profile.companions.map((companion) => {
              const relation = COMPANION_RELATIONS.find((item) => item.id === companion.relation);
              const relationLabel = locale === "en" ? relation?.nameEn : relation?.nameEs;
              return (
                <li key={companion.id}>
                  {companion.name}
                  {relationLabel ? ` · ${relationLabel}` : ""}
                  {companion.age != null ? ` · ${companion.age}` : ""}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function ProgressPanel({
  reports,
  tipHistory,
  latestReportId,
  hideNextFocusGlobally,
  unreadIds,
  profile,
  locale,
  t,
  newLessonUrl,
  lastInstructorName,
  meetingPoint,
}: {
  reports: ProgressReport[];
  tipHistory: StudentTip[];
  latestReportId: string | null;
  hideNextFocusGlobally: boolean;
  unreadIds: Set<string>;
  profile: StudentProfile | null;
  locale: string;
  t: ReturnType<typeof useTranslations<"account">>;
  newLessonUrl: string;
  lastInstructorName: string;
  meetingPoint: string;
}) {
  const primaryDiscipline = (profile?.disciplines[0] ||
    reports[0]?.discipline ||
    "esqui") as ProgressDisciplineId;
  const skillTimeline = buildSkillTimeline(reports, primaryDiscipline, locale);
  const [latest, ...older] = reports;

  return (
    <div className="mt-4 space-y-4 sm:mt-6 sm:space-y-5">
      {skillTimeline.length ? (
        <section className="overflow-hidden rounded-2xl border border-hielo/10 bg-white shadow-sm">
          <div className="border-b border-hielo/10 bg-gradient-to-br from-white to-hielo/[0.05] px-3.5 py-3.5 sm:px-5 sm:py-4">
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-hielo">{t("skillEvolution")}</p>
            <h2 className="mt-1 font-display text-xl text-pizarra sm:text-2xl">
              {progressDisciplineName(primaryDiscipline, locale)}
            </h2>
          </div>
          <ul className="divide-y divide-hielo/10 px-3.5 sm:px-5">
            {skillTimeline.slice(0, 8).map((row) => (
              <li key={row.skillId} className="py-3">
                <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                  <span className="font-medium text-pizarra">{row.label}</span>
                  <span className="tabular-nums font-semibold text-hielo">
                    {row.latest}/5
                    {row.delta != null ? (
                      <span className={`ml-1 text-xs ${row.delta >= 0 ? "text-hielo" : "text-accent"}`}>
                        ({row.delta >= 0 ? "+" : ""}
                        {row.delta})
                      </span>
                    ) : null}
                  </span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      className={`h-2 flex-1 rounded-full ${(row.latest ?? 0) >= n ? "bg-hielo" : "bg-hielo/12"}`}
                    />
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {profile?.selfSkills && Object.keys(profile.selfSkills).length ? (
        <section className="rounded-2xl border border-hielo/10 bg-white p-3.5 shadow-sm sm:p-5">
          <h2 className="font-display text-xl text-hielo">{t("selfSkillsTitle")}</h2>
          <div className="mt-3 space-y-4">
            {profile.disciplines.map((discipline) => {
              const selected = new Set(profile.selfSkills?.[discipline] ?? []);
              const skills = skillsForDiscipline(discipline).filter((skill) => selected.has(skill.id));
              if (!skills.length) return null;
              return (
                <div key={discipline}>
                  <p className="text-sm font-semibold text-pizarra">
                    {progressDisciplineName(discipline, locale)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {skills.map((skill) => (
                      <span
                        key={skill.id}
                        className="rounded-full bg-hielo/10 px-2.5 py-1 text-[0.7rem] font-semibold text-hielo"
                      >
                        {selfSkillLabel(skill, locale)}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : reports.length === 0 ? (
        <EmptyHint title={t("selfSkillsTitle")} body={t("emptySelfSkills")} />
      ) : null}

      {latest ? (
        <ReportCard
          report={latest}
          locale={locale}
          t={t}
          featured
          defaultOpen
          fresh={unreadIds.has(latest.id)}
          hideNextFocus={hideNextFocusGlobally && latest.id === latestReportId}
          compactSkills={Boolean(skillTimeline.length)}
        />
      ) : (
        <EmptyHint title={t("tabProgreso")} body={t("noReportsYet")} />
      )}

      {older.length ? (
        <div className="space-y-3">
          <p className="px-1 text-xs font-bold uppercase tracking-wider text-muted">{t("previousReports")}</p>
          {older.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              locale={locale}
              t={t}
              fresh={unreadIds.has(report.id)}
              hideNextFocus={false}
              compactSkills={Boolean(skillTimeline.length)}
            />
          ))}
        </div>
      ) : null}

      {tipHistory.length ? (
        <section className="rounded-2xl border border-hielo/10 bg-white p-3.5 shadow-sm sm:p-5">
          <h2 className="font-display text-xl text-hielo">{t("tipsHistory")}</h2>
          <ul className="mt-3 space-y-2">
            {tipHistory.map((tip) => (
              <li key={tip.id} className="rounded-xl border border-hielo/10 bg-nieve/70 px-3.5 py-3 text-sm">
                <p className="whitespace-pre-wrap leading-relaxed text-pizarra">{tip.text}</p>
                <p className="mt-2 text-xs text-muted">
                  {tip.authorName || "Explora"} · {tip.createdAt.slice(0, 10)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="rounded-2xl border border-dashed border-hielo/20 bg-white px-4 py-5 text-center sm:px-6">
        <a href={newLessonUrl} target="_blank" rel="noopener noreferrer" className="btn-primary !w-auto">
          {t("requestNew", { name: lastInstructorName || "Explora" })}
        </a>
        <p className="mt-3 text-xs text-muted">{meetingPoint}</p>
      </div>
    </div>
  );
}

function ReportCard({
  report,
  locale,
  t,
  featured,
  fresh,
  hideNextFocus,
  compactSkills,
  defaultOpen,
  onOpenProgress,
}: {
  report: ProgressReport;
  locale: string;
  t: ReturnType<typeof useTranslations<"account">>;
  featured?: boolean;
  fresh?: boolean;
  hideNextFocus?: boolean;
  compactSkills?: boolean;
  defaultOpen?: boolean;
  onOpenProgress?: () => void;
}) {
  const [open, setOpen] = useState(Boolean(featured || defaultOpen));
  const skills = Object.entries(report.skills);
  const pistas = report.recommendedPistaIds
    .map((id) => getPistaById(id))
    .filter((pista): pista is NonNullable<typeof pista> => Boolean(pista));

  const pistasBySector = pistas.reduce<Record<string, typeof pistas>>((acc, pista) => {
    const key = pista.sector;
    (acc[key] ??= []).push(pista);
    return acc;
  }, {});

  const disciplineLabel = progressDisciplineName(report.discipline as ProgressDisciplineId, locale);
  const updatedLabel = report.updatedAt?.slice(0, 10) || "";

  const header = (
        <div className="flex w-full items-start justify-between gap-3 px-3.5 py-3.5 text-left sm:px-5 sm:py-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-oro/15 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-oro">
              {featured ? t("latestReport") : disciplineLabel}
            </span>
            {fresh ? (
              <span className="rounded-full bg-accent px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-white">
                {progressReportIsNew(report) ? t("progressNew") : t("progressUpdated")}
              </span>
            ) : null}
            {report.hours ? (
              <span className="rounded-full bg-nieve px-2.5 py-0.5 text-[0.65rem] font-semibold text-muted">
                {t("reportHours", { hours: report.hours })}
              </span>
            ) : null}
          </div>
          <h2 className="mt-2 font-display text-xl leading-tight text-pizarra sm:text-2xl">
            {report.instructorName || t("yourInstructor")}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {featured ? disciplineLabel : null}
            {featured && updatedLabel ? " · " : null}
            {updatedLabel}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <p className="text-sm text-oro" aria-label={`${report.rating} / 5`}>
            {"★".repeat(report.rating)}
            <span className="text-hielo/20">{"★".repeat(5 - report.rating)}</span>
          </p>
          {!featured ? (
            <span className="text-xs font-semibold text-hielo">{open ? t("closeReport") : t("openReport")}</span>
          ) : onOpenProgress ? (
            <span className="text-xs font-semibold text-hielo">{t("seeProgress")}</span>
          ) : null}
        </div>
      </div>
  );

  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${
        fresh ? "border-accent/35 ring-2 ring-accent/15" : "border-hielo/10"
      }`}
    >
      {featured && !onOpenProgress ? (
        header
      ) : (
        <button
          type="button"
          onClick={() => {
            if (featured && onOpenProgress) onOpenProgress();
            else setOpen((value) => !value);
          }}
          className="w-full"
        >
          {header}
        </button>
      )}

      {(featured || open) && !(featured && onOpenProgress) ? (
        <div className="space-y-4 border-t border-hielo/10 px-3.5 py-4 sm:px-5 sm:py-5">
          {!hideNextFocus && report.nextFocus ? (
            <div className="rounded-xl border border-hielo/15 bg-gradient-to-br from-hielo/5 to-white px-3.5 py-3">
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-hielo">{t("nextFocus")}</p>
              <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-pizarra">{report.nextFocus}</p>
            </div>
          ) : null}

          {report.notes ? (
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted">{t("reportNotes")}</p>
              <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-pizarra">{report.notes}</p>
            </div>
          ) : null}

          {!compactSkills && skills.length ? (
            <div>
              <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-wider text-muted">{t("skillsRated")}</p>
              <ul className="space-y-2.5">
                {skills.map(([id, value]) => (
                  <li key={id} className="rounded-xl bg-nieve/70 px-3 py-2.5">
                    <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium text-pizarra">
                        {progressSkillLabel(report.discipline as ProgressDisciplineId, id, locale)}
                      </span>
                      <span className="tabular-nums font-semibold text-hielo">{value}/5</span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <span
                          key={n}
                          className={`h-2 flex-1 rounded-full ${n <= value ? "bg-hielo" : "bg-hielo/12"}`}
                        />
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {pistas.length ? (
            <div>
              <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-wider text-muted">{t("pistas")}</p>
              <div className="space-y-3">
                {Object.entries(pistasBySector).map(([sectorId, sectorPistas]) => (
                  <div key={sectorId}>
                    <p className="mb-1.5 text-xs font-semibold text-hielo">
                      {sectorName(sectorId as PistaSectorId, locale)}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {sectorPistas.map((pista) => (
                        <span
                          key={pista.id}
                          className={`rounded-full px-2.5 py-1 text-[0.7rem] font-semibold ${pistaTone(pista.level)}`}
                        >
                          {pista.name}
                          <span className="opacity-80">
                            {" · "}
                            {locale === "en" ? PISTA_LEVEL_LABEL[pista.level].en : PISTA_LEVEL_LABEL[pista.level].es}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {report.media.length ? (
            <div>
              <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-wider text-muted">{t("mediaFromClass")}</p>
              <div className="flex flex-wrap gap-2">
                {report.media.map((mediaItem) => (
                  <a
                    key={mediaItem.id}
                    href={`/api/cuenta/media/${mediaItem.id}?reportId=${report.id}`}
                    className="rounded-xl border border-hielo/20 bg-hielo/5 px-3.5 py-2 text-sm font-semibold text-hielo transition hover:border-hielo/40 hover:bg-hielo/10"
                  >
                    {mediaItem.kind === "video" ? t("downloadVideo") : t("downloadPhoto")}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {featured && onOpenProgress ? (
        <div className="border-t border-hielo/10 px-3.5 py-3 sm:px-5">
          {!hideNextFocus && report.nextFocus ? (
            <p className="mb-2 line-clamp-2 text-sm text-pizarra">
              <span className="font-semibold text-hielo">{t("nextFocus")}: </span>
              {report.nextFocus}
            </p>
          ) : report.notes ? (
            <p className="mb-2 line-clamp-2 text-sm text-muted">{report.notes}</p>
          ) : null}
          <button type="button" onClick={onOpenProgress} className="text-sm font-semibold text-hielo">
            {t("seeProgress")} →
          </button>
        </div>
      ) : null}
    </article>
  );
}

function EmptyHint({ title, body }: { title: string; body: string }) {
  return (
    <section className="rounded-2xl border border-dashed border-hielo/20 bg-white px-3.5 py-5 sm:px-5 sm:py-6">
      <p className="text-xs font-bold uppercase tracking-wider text-muted">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
    </section>
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
      <h2 className="font-display text-xl text-hielo sm:text-2xl">{title}</h2>
      <div className="mt-4 space-y-3">
        {count > 0 ? (
          children
        ) : (
          <p className="rounded-xl border border-dashed border-hielo/20 bg-white px-3.5 py-6 text-sm text-muted sm:rounded-2xl sm:px-4 sm:py-8">
            {empty}
          </p>
        )}
      </div>
    </section>
  );
}
