"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { scrollToElement } from "@/lib/scroll-to-anchor";
import {
  COMPANION_RELATIONS,
  selfLevelName,
  WIZARD_DISCIPLINES,
  type CompanionRelation,
  type SelfLevelId,
} from "@/data/student-account";
import { StudentEquipmentFields } from "@/components/cuenta/StudentEquipmentFields";
import {
  equipmentFormFromProfile,
  isEquipmentFormComplete,
  toStudentEquipment,
} from "@/lib/student-equipment";
import type { ProgressDisciplineId } from "@/data/progress-skills";
import { progressDisciplineName } from "@/data/progress-skills";
import {
  deriveOverallSelfLevel,
  deriveSelfLevelFromSkills,
  selfSkillLabel,
  skillsGroupedByLevel,
  SELF_LEVEL_ORDER,
} from "@/data/self-assessment-skills";
import type { StudentCompanion, StudentProfile } from "@/lib/student-users";

type Step = "ask" | "wizard";

type AccountWelcomeWizardProps = {
  locale: string;
  initialProfile: StudentProfile | null;
  /** Re-open wizard from dashboard to edit profile */
  editMode?: boolean;
};

export function AccountWelcomeWizard({
  locale,
  initialProfile,
  editMode = false,
}: AccountWelcomeWizardProps) {
  const router = useRouter();
  const t = useTranslations("account");
  const [step, setStep] = useState<Step>(
    editMode || initialProfile?.hasTakenClassesBefore != null ? "wizard" : "ask",
  );
  const [wizardStep, setWizardStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [linkMiss, setLinkMiss] = useState(false);
  const [linkedCount, setLinkedCount] = useState(0);

  const [disciplines, setDisciplines] = useState<ProgressDisciplineId[]>(initialProfile?.disciplines ?? []);
  const [equipment, setEquipment] = useState(() => equipmentFormFromProfile(initialProfile?.equipment ?? null));
  const [companions, setCompanions] = useState<StudentCompanion[]>(initialProfile?.companions ?? []);
  const [selfSkills, setSelfSkills] = useState<Partial<Record<ProgressDisciplineId, string[]>>>(
    initialProfile?.selfSkills ?? {},
  );
  const [skillDiscipline, setSkillDiscipline] = useState<ProgressDisciplineId | null>(
    initialProfile?.disciplines?.[0] ?? null,
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const pendingScroll = useRef(false);

  const activeSkillDiscipline =
    skillDiscipline && disciplines.includes(skillDiscipline) ? skillDiscipline : (disciplines[0] ?? null);

  const derivedLevel = useMemo(() => deriveOverallSelfLevel(selfSkills), [selfSkills]);

  const activeDisciplineLevel = useMemo(() => {
    if (!activeSkillDiscipline) return null;
    return deriveSelfLevelFromSkills(activeSkillDiscipline, selfSkills[activeSkillDiscipline] ?? []);
  }, [activeSkillDiscipline, selfSkills]);

  const totalSteps = 3;

  useLayoutEffect(() => {
    if (!pendingScroll.current) return;
    pendingScroll.current = false;
    const el = rootRef.current;
    if (!el) return;
    scrollToElement(el);
    headingRef.current?.focus({ preventScroll: true });
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (!coarse) return;
    const retry = window.setTimeout(() => scrollToElement(el, "auto"), 80);
    return () => window.clearTimeout(retry);
  }, [wizardStep, step, skillDiscipline]);

  function requestWizardScroll() {
    pendingScroll.current = true;
  }

  const canNext = useMemo(() => {
    if (wizardStep === 1) return disciplines.length > 0;
    if (wizardStep === 2) {
      return Boolean(derivedLevel) && disciplines.every((id) => (selfSkills[id]?.length ?? 0) > 0);
    }
    if (wizardStep === 3) return isEquipmentFormComplete(equipment, disciplines);
    return true;
  }, [wizardStep, disciplines, equipment, derivedLevel, selfSkills]);

  async function patchProfile(body: Record<string, unknown>) {
    const res = await fetch("/api/cuenta/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale, ...body }),
    });
    if (!res.ok) throw new Error(t("errors.save"));
  }

  async function onAlreadyTookClasses(yes: boolean) {
    setBusy(true);
    setError("");
    try {
      await patchProfile({ hasTakenClassesBefore: yes });
      if (!yes) {
        requestWizardScroll();
        setStep("wizard");
        return;
      }
      const linked = await fetch("/api/cuenta/link-bookings", { method: "POST" });
      const payload = (await linked.json().catch(() => null)) as { linked?: number } | null;
      const count = payload?.linked ?? 0;
      if (count > 0) {
        setLinkedCount(count);
      } else {
        setLinkMiss(true);
      }
      requestWizardScroll();
      setStep("wizard");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.save"));
    } finally {
      setBusy(false);
    }
  }

  async function onFinish() {
    if (!derivedLevel) return;
    setBusy(true);
    setError("");
    try {
      await patchProfile({
        completeOnboarding: true,
        disciplines,
        equipment: toStudentEquipment(equipment),
        companions: companions.filter((item) => item.name.trim()),
        selfSkills,
        selfLevel: derivedLevel,
      });
      await fetch("/api/cuenta/link-bookings", { method: "POST" });
      router.replace(`/${locale}/cuenta`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.save"));
    } finally {
      setBusy(false);
    }
  }

  function toggleDiscipline(id: ProgressDisciplineId) {
    setDisciplines((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      if (!next.includes(activeSkillDiscipline as ProgressDisciplineId)) {
        setSkillDiscipline(next[0] ?? null);
      }
      setSelfSkills((skills) => {
        const cleaned = { ...skills };
        for (const key of Object.keys(cleaned) as ProgressDisciplineId[]) {
          if (!next.includes(key)) delete cleaned[key];
        }
        return cleaned;
      });
      return next;
    });
  }

  function toggleSkill(discipline: ProgressDisciplineId, skillId: string) {
    setSelfSkills((current) => {
      const list = current[discipline] ?? [];
      const nextList = list.includes(skillId) ? list.filter((item) => item !== skillId) : [...list, skillId];
      return { ...current, [discipline]: nextList };
    });
  }

  function addCompanion() {
    setCompanions((current) => [
      ...current,
      { id: crypto.randomUUID(), name: "", relation: "child" satisfies CompanionRelation },
    ]);
  }

  return (
    <div ref={rootRef} className="mx-auto max-w-2xl scroll-mt-[var(--header-offset)] [overflow-anchor:none]">
      {step === "ask" ? (
        <div className="rounded-2xl border border-hielo/10 bg-white p-4 shadow-[0_16px_50px_rgba(14,14,15,0.06)] sm:rounded-3xl sm:p-8">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-oro sm:text-xs">{t("welcomeEyebrow")}</p>
          <h1 className="mt-1.5 font-display text-2xl font-semibold text-hielo sm:mt-2 sm:text-3xl">{t("alreadyTitle")}</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted sm:mt-3">{t("alreadyLead")}</p>
          {error ? <p className="mt-4 text-sm text-accent">{error}</p> : null}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void onAlreadyTookClasses(true)}
              className="btn-primary !w-full"
            >
              {t("alreadyYes")}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void onAlreadyTookClasses(false)}
              className="btn-secondary !w-full"
            >
              {t("alreadyNo")}
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-hielo/10 bg-white p-4 shadow-[0_16px_50px_rgba(14,14,15,0.06)] sm:rounded-3xl sm:p-8">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-oro sm:text-xs">
            {t("wizardStep", { current: wizardStep, total: totalSteps })}
          </p>
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="mt-1.5 font-display text-2xl font-semibold text-hielo outline-none sm:mt-2 sm:text-3xl"
          >
            {wizardStep === 1
              ? t("wizardTitle1")
              : wizardStep === 2
                ? t("wizardTitle4")
                : t("wizardTitleEquip")}
          </h1>
          <p className="mt-2 text-sm text-muted sm:mt-3">
            {wizardStep === 1
              ? t("wizardLead1")
              : wizardStep === 2
                ? t("wizardLead4")
                : equipment.source === "rental"
                  ? t("wizardLeadEquipRental")
                  : t("wizardLeadEquipOwn")}
          </p>
          {linkedCount > 0 ? (
            <p className="mt-3 rounded-2xl bg-hielo/10 px-4 py-3 text-sm text-pizarra">
              {t("linkFound", { count: linkedCount })}
            </p>
          ) : null}
          {linkMiss ? <p className="mt-3 rounded-2xl bg-oro/10 px-4 py-3 text-sm text-pizarra">{t("linkMiss")}</p> : null}
          {error ? <p className="mt-4 text-sm text-accent">{error}</p> : null}

          <div className="mt-4 space-y-4 sm:mt-6">
            {wizardStep === 1 ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {WIZARD_DISCIPLINES.map((item) => {
                  const active = disciplines.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleDiscipline(item.id)}
                      className={`rounded-2xl border px-3 py-3 text-sm font-semibold transition ${
                        active
                          ? "border-hielo bg-hielo text-white"
                          : "border-hielo/15 bg-nieve text-pizarra hover:border-hielo/30"
                      }`}
                    >
                      {locale === "en" ? item.nameEn : item.nameEs}
                    </button>
                  );
                })}
              </div>
            ) : null}

            {wizardStep === 2 && activeSkillDiscipline ? (
              <div className="space-y-4">
                <div className="sticky top-[var(--header-offset)] z-10 -mx-4 space-y-2 border-b border-hielo/10 bg-white/95 px-4 py-2 backdrop-blur-md sm:-mx-8 sm:px-8 sm:py-2.5">
                  {disciplines.length > 1 ? (
                    <div className="flex flex-wrap gap-2">
                      {disciplines.map((id) => {
                        const active = id === activeSkillDiscipline;
                        const count = selfSkills[id]?.length ?? 0;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => {
                              requestWizardScroll();
                              setSkillDiscipline(id);
                            }}
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                              active
                                ? "bg-hielo text-white"
                                : "border border-hielo/15 bg-nieve text-pizarra hover:border-hielo/30"
                            }`}
                          >
                            {progressDisciplineName(id, locale)}
                            {count > 0 ? ` · ${count}` : ""}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                  <LiveLevelBar
                    locale={locale}
                    overall={derivedLevel}
                    disciplineName={
                      disciplines.length > 1 && activeDisciplineLevel
                        ? progressDisciplineName(activeSkillDiscipline, locale)
                        : null
                    }
                    disciplineLevel={disciplines.length > 1 ? activeDisciplineLevel : null}
                    selectedCount={selfSkills[activeSkillDiscipline]?.length ?? 0}
                    t={t}
                  />
                </div>

                <p className="text-xs font-semibold text-hielo">{t("skillsPickSeveral")}</p>

                {skillsGroupedByLevel(activeSkillDiscipline).map((group) => {
                  const selectedIds = selfSkills[activeSkillDiscipline] ?? [];
                  const selectedInGroup = group.skills.filter((skill) => selectedIds.includes(skill.id)).length;
                  return (
                    <div key={group.level} className="rounded-2xl border border-hielo/10 bg-nieve/60 p-3 sm:p-4">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-hielo">
                          {locale === "en" ? group.levelNameEn : group.levelNameEs}
                        </p>
                        <p className="text-[0.65rem] font-semibold tabular-nums text-muted">
                          {t("levelBandProgress", {
                            selected: selectedInGroup,
                            total: group.skills.length,
                          })}
                        </p>
                      </div>
                      <div className="mt-2.5 grid gap-2">
                        {group.skills.map((skill) => {
                          const selected = selectedIds.includes(skill.id);
                          return (
                            <button
                              key={skill.id}
                              type="button"
                              aria-pressed={selected}
                              onClick={() => toggleSkill(activeSkillDiscipline, skill.id)}
                              className={`flex items-start gap-3 rounded-2xl border px-3 py-2.5 text-left text-sm font-medium transition ${
                                selected
                                  ? "border-hielo bg-hielo text-white"
                                  : "border-hielo/15 bg-white text-pizarra hover:border-hielo/30"
                              }`}
                            >
                              <span
                                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                                  selected ? "border-white bg-white text-hielo" : "border-hielo/25 bg-nieve"
                                }`}
                                aria-hidden
                              >
                                {selected ? (
                                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
                                    <path
                                      d="M3.5 8.2 6.4 11l6.1-7"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                ) : null}
                              </span>
                              <span>{selfSkillLabel(skill, locale)}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}

            {wizardStep === 3 ? (
              <div className="space-y-5">
                <StudentEquipmentFields
                  locale={locale}
                  disciplines={disciplines}
                  values={equipment}
                  onChange={(patch) => setEquipment((current) => ({ ...current, ...patch }))}
                />

                <div className="border-t border-hielo/10 pt-4">
                  <p className="text-sm font-semibold text-pizarra">{t("companionsOptional")}</p>
                  <div className="mt-3 space-y-3">
                    {companions.map((companion, index) => (
                      <div
                        key={companion.id}
                        className="grid gap-2 rounded-2xl border border-hielo/10 bg-nieve p-3 sm:grid-cols-[1fr_8rem_5rem_auto]"
                      >
                        <input
                          value={companion.name}
                          placeholder={t("companionName")}
                          onChange={(event) => {
                            const next = [...companions];
                            next[index] = { ...companion, name: event.target.value };
                            setCompanions(next);
                          }}
                          className="rounded-xl border border-hielo/15 bg-white px-3 py-2 text-sm"
                        />
                        <select
                          value={companion.relation}
                          onChange={(event) => {
                            const next = [...companions];
                            next[index] = { ...companion, relation: event.target.value as CompanionRelation };
                            setCompanions(next);
                          }}
                          className="rounded-xl border border-hielo/15 bg-white px-3 py-2 text-sm"
                        >
                          {COMPANION_RELATIONS.map((relation) => (
                            <option key={relation.id} value={relation.id}>
                              {locale === "en" ? relation.nameEn : relation.nameEs}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={companion.age ?? ""}
                          placeholder={t("age")}
                          onChange={(event) => {
                            const next = [...companions];
                            next[index] = {
                              ...companion,
                              age: event.target.value ? Number(event.target.value) : undefined,
                            };
                            setCompanions(next);
                          }}
                          className="rounded-xl border border-hielo/15 bg-white px-3 py-2 text-sm"
                        />
                        <button
                          type="button"
                          className="text-sm font-semibold text-accent"
                          onClick={() =>
                            setCompanions((current) => current.filter((item) => item.id !== companion.id))
                          }
                        >
                          {t("remove")}
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={addCompanion} className="btn-secondary !w-auto">
                      {t("addCompanion")}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="sticky bottom-0 z-20 -mx-4 mt-6 border-t border-hielo/10 bg-white px-4 py-2.5 pb-[max(0.65rem,env(safe-area-inset-bottom))] shadow-[0_-10px_24px_rgba(14,14,15,0.06)] sm:-mx-8 sm:mt-8 sm:px-8 sm:py-3 md:static md:mx-0 md:border-0 md:bg-transparent md:px-0 md:py-0 md:shadow-none">
            <div className="flex justify-between gap-3">
              <button
                type="button"
                className="btn-secondary !w-auto"
                disabled={wizardStep === 1 || busy}
                onClick={() => {
                  requestWizardScroll();
                  setWizardStep((current) => Math.max(1, current - 1));
                }}
              >
                {t("back")}
              </button>
              {wizardStep < totalSteps ? (
                <button
                  type="button"
                  className="btn-primary !w-auto min-w-[8.5rem]"
                  disabled={!canNext || busy}
                  onClick={() => {
                    if (wizardStep === 1 && !skillDiscipline && disciplines[0]) {
                      setSkillDiscipline(disciplines[0]);
                    }
                    requestWizardScroll();
                    setWizardStep((current) => current + 1);
                  }}
                >
                  {t("next")}
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-primary !w-auto min-w-[8.5rem]"
                  disabled={!canNext || busy}
                  onClick={() => void onFinish()}
                >
                  {editMode ? t("saveProfile") : t("finish")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LiveLevelBar({
  locale,
  overall,
  disciplineName,
  disciplineLevel,
  selectedCount,
  t,
}: {
  locale: string;
  overall: SelfLevelId | null;
  disciplineName: string | null;
  disciplineLevel: SelfLevelId | null;
  selectedCount: number;
  t: ReturnType<typeof useTranslations<"account">>;
}) {
  const activeIndex = overall ? SELF_LEVEL_ORDER.indexOf(overall) : -1;

  return (
    <div
      className={`rounded-2xl border px-3 py-2.5 ${
        overall ? "border-hielo/20 bg-hielo/5" : "border-dashed border-hielo/20 bg-nieve"
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-hielo">
          {t("levelResultEyebrow")}
        </p>
        {selectedCount > 0 ? (
          <p className="text-[0.65rem] font-semibold text-muted">
            {t("skillsSelectedCount", { count: selectedCount })}
          </p>
        ) : null}
      </div>
      {overall ? (
        <p className="mt-1 font-display text-lg font-semibold leading-tight text-pizarra">
          {selfLevelName(overall, locale)}
          {disciplineName && disciplineLevel
            ? ` · ${disciplineName}: ${selfLevelName(disciplineLevel, locale)}`
            : ""}
        </p>
      ) : (
        <p className="mt-1 text-sm text-muted">{t("levelLiveIdle")}</p>
      )}
      <div className="mt-2 flex gap-1">
        {SELF_LEVEL_ORDER.map((id, index) => (
          <div key={id} className="min-w-0 flex-1">
            <div
              className={`h-1.5 rounded-full transition-colors duration-200 ${
                index <= activeIndex ? "bg-hielo" : "bg-hielo/15"
              }`}
            />
            <p
              className={`mt-1 truncate text-[0.58rem] font-semibold ${
                index === activeIndex ? "text-hielo" : "text-muted"
              }`}
            >
              {selfLevelName(id, locale)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
