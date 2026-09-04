"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  COMPANION_RELATIONS,
  EQUIPMENT_SOURCES,
  selfLevelName,
  WIZARD_DISCIPLINES,
  type CompanionRelation,
  type EquipmentSource,
} from "@/data/student-account";
import type { ProgressDisciplineId } from "@/data/progress-skills";
import { progressDisciplineName } from "@/data/progress-skills";
import {
  deriveOverallSelfLevel,
  deriveSelfLevelFromSkills,
  selfSkillLabel,
  skillsGroupedByLevel,
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
  const [equipmentSource, setEquipmentSource] = useState<EquipmentSource>(
    initialProfile?.equipment?.source ?? "rental",
  );
  const [bootSize, setBootSize] = useState(initialProfile?.equipment?.bootSize ?? "");
  const [heightCm, setHeightCm] = useState(initialProfile?.equipment?.heightCm?.toString() ?? "");
  const [weightKg, setWeightKg] = useState(initialProfile?.equipment?.weightKg?.toString() ?? "");
  const [companions, setCompanions] = useState<StudentCompanion[]>(initialProfile?.companions ?? []);
  const [selfSkills, setSelfSkills] = useState<Partial<Record<ProgressDisciplineId, string[]>>>(
    initialProfile?.selfSkills ?? {},
  );
  const [skillDiscipline, setSkillDiscipline] = useState<ProgressDisciplineId | null>(
    initialProfile?.disciplines?.[0] ?? null,
  );

  const activeSkillDiscipline =
    skillDiscipline && disciplines.includes(skillDiscipline) ? skillDiscipline : (disciplines[0] ?? null);

  const derivedLevel = useMemo(() => deriveOverallSelfLevel(selfSkills), [selfSkills]);

  const activeDisciplineLevel = useMemo(() => {
    if (!activeSkillDiscipline) return null;
    return deriveSelfLevelFromSkills(activeSkillDiscipline, selfSkills[activeSkillDiscipline] ?? []);
  }, [activeSkillDiscipline, selfSkills]);

  const totalSteps = 3;

  const canNext = useMemo(() => {
    if (wizardStep === 1) return disciplines.length > 0;
    if (wizardStep === 2) {
      return Boolean(derivedLevel) && disciplines.every((id) => (selfSkills[id]?.length ?? 0) > 0);
    }
    if (wizardStep === 3) return bootSize.trim().length > 0;
    return true;
  }, [wizardStep, disciplines, bootSize, derivedLevel, selfSkills]);

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
        equipment: {
          source: equipmentSource,
          bootSize: bootSize.trim(),
          heightCm: heightCm ? Number(heightCm) : null,
          weightKg: weightKg ? Number(weightKg) : null,
        },
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
    <div className="mx-auto max-w-2xl">
      {step === "ask" ? (
        <div className="rounded-3xl border border-hielo/10 bg-white p-6 shadow-[0_16px_50px_rgba(14,14,15,0.06)] sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-oro">{t("welcomeEyebrow")}</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-hielo">{t("alreadyTitle")}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">{t("alreadyLead")}</p>
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
        <div className="rounded-3xl border border-hielo/10 bg-white p-6 shadow-[0_16px_50px_rgba(14,14,15,0.06)] sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-oro">
            {t("wizardStep", { current: wizardStep, total: totalSteps })}
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-hielo">
            {wizardStep === 1
              ? t("wizardTitle1")
              : wizardStep === 2
                ? t("wizardTitle4")
                : t("wizardTitleEquip")}
          </h1>
          <p className="mt-3 text-sm text-muted">
            {wizardStep === 1
              ? t("wizardLead1")
              : wizardStep === 2
                ? t("wizardLead4")
                : t("wizardLeadEquip")}
          </p>
          {linkedCount > 0 ? (
            <p className="mt-3 rounded-2xl bg-hielo/10 px-4 py-3 text-sm text-pizarra">
              {t("linkFound", { count: linkedCount })}
            </p>
          ) : null}
          {linkMiss ? <p className="mt-3 rounded-2xl bg-oro/10 px-4 py-3 text-sm text-pizarra">{t("linkMiss")}</p> : null}
          {error ? <p className="mt-4 text-sm text-accent">{error}</p> : null}

          <div className="mt-6 space-y-4">
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
              <div className="space-y-5">
                {disciplines.length > 1 ? (
                  <div className="flex flex-wrap gap-2">
                    {disciplines.map((id) => {
                      const active = id === activeSkillDiscipline;
                      const count = selfSkills[id]?.length ?? 0;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setSkillDiscipline(id)}
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

                {skillsGroupedByLevel(activeSkillDiscipline).map((group) => (
                  <div key={group.level} className="rounded-2xl border border-hielo/10 bg-nieve/60 p-3 sm:p-4">
                    <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-hielo">
                      {locale === "en" ? group.levelNameEn : group.levelNameEs}
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {group.skills.map((skill) => {
                        const selected = (selfSkills[activeSkillDiscipline] ?? []).includes(skill.id);
                        return (
                          <button
                            key={skill.id}
                            type="button"
                            onClick={() => toggleSkill(activeSkillDiscipline, skill.id)}
                            className={`rounded-full border px-3 py-2 text-left text-sm font-medium transition ${
                              selected
                                ? "border-hielo bg-hielo text-white"
                                : "border-hielo/15 bg-white text-pizarra hover:border-hielo/30"
                            }`}
                          >
                            {selfSkillLabel(skill, locale)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div
                  className={`rounded-2xl border px-4 py-3 ${
                    derivedLevel ? "border-hielo/20 bg-hielo/5" : "border-dashed border-hielo/20 bg-white"
                  }`}
                >
                  {derivedLevel ? (
                    <>
                      <p className="text-xs font-semibold uppercase tracking-wider text-hielo">
                        {t("levelResultEyebrow")}
                      </p>
                      <p className="mt-1 font-display text-xl font-semibold text-pizarra">
                        {selfLevelName(derivedLevel, locale)}
                        {activeDisciplineLevel && disciplines.length > 1
                          ? ` · ${progressDisciplineName(activeSkillDiscipline, locale)}: ${selfLevelName(activeDisciplineLevel, locale)}`
                          : ""}
                      </p>
                      <p className="mt-1 text-sm text-muted">{t("levelResultLead")}</p>
                    </>
                  ) : (
                    <p className="text-sm text-muted">{t("levelResultEmpty")}</p>
                  )}
                </div>
              </div>
            ) : null}

            {wizardStep === 3 ? (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-2">
                  {EQUIPMENT_SOURCES.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setEquipmentSource(item.id)}
                      className={`rounded-2xl border px-3 py-3 text-sm font-semibold ${
                        equipmentSource === item.id
                          ? "border-hielo bg-hielo text-white"
                          : "border-hielo/15 bg-nieve"
                      }`}
                    >
                      {locale === "en" ? item.nameEn : item.nameEs}
                    </button>
                  ))}
                </div>
                <label className="block text-sm font-medium text-pizarra">
                  {t("bootSize")}
                  <input
                    value={bootSize}
                    onChange={(event) => setBootSize(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-hielo/15 bg-nieve px-3 py-2"
                    placeholder="42 / 27.5"
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-sm font-medium">
                    {t("height")}
                    <input
                      type="number"
                      value={heightCm}
                      onChange={(event) => setHeightCm(event.target.value)}
                      className="mt-1 w-full rounded-xl border border-hielo/15 bg-nieve px-3 py-2"
                    />
                  </label>
                  <label className="block text-sm font-medium">
                    {t("weight")}
                    <input
                      type="number"
                      value={weightKg}
                      onChange={(event) => setWeightKg(event.target.value)}
                      className="mt-1 w-full rounded-xl border border-hielo/15 bg-nieve px-3 py-2"
                    />
                  </label>
                </div>

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

          <div className="mt-8 flex justify-between gap-3">
            <button
              type="button"
              className="btn-secondary !w-auto"
              disabled={wizardStep === 1 || busy}
              onClick={() => setWizardStep((current) => Math.max(1, current - 1))}
            >
              {t("back")}
            </button>
            {wizardStep < totalSteps ? (
              <button
                type="button"
                className="btn-primary !w-auto"
                disabled={!canNext || busy}
                onClick={() => {
                  if (wizardStep === 1 && !skillDiscipline && disciplines[0]) {
                    setSkillDiscipline(disciplines[0]);
                  }
                  setWizardStep((current) => current + 1);
                }}
              >
                {t("next")}
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary !w-auto"
                disabled={!canNext || busy}
                onClick={() => void onFinish()}
              >
                {editMode ? t("saveProfile") : t("finish")}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
