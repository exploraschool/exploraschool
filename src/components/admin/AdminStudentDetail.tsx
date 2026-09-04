"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  COMPANION_RELATIONS,
  selfLevelName,
  WIZARD_DISCIPLINES,
} from "@/data/student-account";
import { StudentEquipmentFields } from "@/components/cuenta/StudentEquipmentFields";
import {
  equipmentFormFromProfile,
  toStudentEquipment,
} from "@/lib/student-equipment";
import { progressDisciplineName, type ProgressDisciplineId } from "@/data/progress-skills";
import {
  deriveOverallSelfLevel,
  selfSkillLabel,
  skillsGroupedByLevel,
} from "@/data/self-assessment-skills";
import type { ProgressReport } from "@/lib/progress-reports";
import { progressReportId } from "@/lib/progress-reports";
import type { StudentMediaItem } from "@/lib/student-media";
import type { StudentProfile } from "@/lib/student-users";
import type { StudentTip } from "@/lib/student-tips";
import { buildSkillTimeline } from "@/lib/skill-bridge";
import { ProgressForm } from "@/components/instructor/ProgressForm";

type InstructorOption = { slug: string; name: string };

type BookingRow = {
  leadId: string;
  itemIndex: number;
  status: string;
  productTitle: string;
  date: string;
  timeSlotId: string;
  discipline: string;
  instructorSlug: string;
  instructorName: string;
};

type AdminStudentDetailProps = {
  profile: StudentProfile;
  reports: ProgressReport[];
  bookings: BookingRow[];
  media: StudentMediaItem[];
  instructors: InstructorOption[];
  initialTips?: StudentTip[];
};

function initialMonitorSlug(
  instructors: InstructorOption[],
  bookings: BookingRow[],
  reports: ProgressReport[],
): string {
  const allowed = new Set(instructors.map((item) => item.slug));
  const fromBooking = bookings.find((row) => row.instructorSlug && allowed.has(row.instructorSlug))?.instructorSlug;
  if (fromBooking) return fromBooking;
  const fromReport = reports.find((row) => row.instructorSlug && allowed.has(row.instructorSlug))?.instructorSlug;
  return fromReport ?? "";
}

const SOURCE_LABEL: Record<StudentTip["source"], string> = {
  staff: "Equipo",
  report: "Ficha",
  correction: "Corrección",
};

export function AdminStudentDetail({
  profile: initialProfile,
  reports,
  bookings,
  media: initialMedia,
  instructors,
  initialTips = [],
}: AdminStudentDetailProps) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [media, setMedia] = useState(initialMedia);
  const [tips, setTips] = useState<StudentTip[]>(initialTips);
  const [monitorSlug, setMonitorSlug] = useState(() =>
    initialMonitorSlug(instructors, bookings, reports),
  );
  const [disciplines, setDisciplines] = useState<ProgressDisciplineId[]>(initialProfile.disciplines);
  const [selfSkills, setSelfSkills] = useState(initialProfile.selfSkills ?? {});
  const [equipment, setEquipment] = useState(() => equipmentFormFromProfile(initialProfile.equipment));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activeBooking, setActiveBooking] = useState<BookingRow | null>(bookings[0] ?? null);
  const [companionId, setCompanionId] = useState("");
  const [timelineDiscipline, setTimelineDiscipline] = useState<ProgressDisciplineId>(
    () => initialProfile.disciplines[0] || "esqui",
  );
  const [newTip, setNewTip] = useState("");
  const [pinNewTip, setPinNewTip] = useState(true);
  const [addTipFromCorrection, setAddTipFromCorrection] = useState<Record<string, boolean>>({});
  const [correctionDrafts, setCorrectionDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(initialMedia.map((item) => [item.id, item.correctionNotes || ""])),
  );

  useEffect(() => {
    if (initialTips.length > 0) {
      setTips(initialTips);
      return;
    }
    let cancelled = false;
    fetch(`/api/admin/students/${initialProfile.uid}/tips`)
      .then((res) => res.json())
      .then((payload: { tips?: StudentTip[] }) => {
        if (!cancelled && Array.isArray(payload.tips)) setTips(payload.tips);
      })
      .catch(() => null);
    return () => {
      cancelled = true;
    };
  }, [initialProfile.uid, initialTips]);

  const derivedLevel = useMemo(() => deriveOverallSelfLevel(selfSkills), [selfSkills]);
  const pinnedTip = useMemo(() => tips.find((tip) => tip.pinned) ?? null, [tips]);
  const lastFocus = useMemo(
    () => reports.find((report) => report.nextFocus.trim())?.nextFocus ?? "",
    [reports],
  );
  const companions = useMemo(
    () =>
      profile.companions.map((companion) => ({
        id: companion.id,
        name: companion.name,
        relationLabel:
          COMPANION_RELATIONS.find((item) => item.id === companion.relation)?.nameEs || companion.relation,
      })),
    [profile.companions],
  );

  const activeReport = useMemo(() => {
    if (!activeBooking) return null;
    const id = progressReportId(activeBooking.leadId, activeBooking.itemIndex, companionId || undefined);
    return reports.find((report) => report.id === id) ?? null;
  }, [activeBooking, companionId, reports]);

  const timelineDisciplineResolved = timelineDiscipline;
  const skillTimeline = useMemo(
    () => buildSkillTimeline(reports, timelineDisciplineResolved, "es"),
    [reports, timelineDisciplineResolved],
  );

  const monitorName = instructors.find((item) => item.slug === monitorSlug)?.name || "";

  async function saveProfile() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`/api/admin/students/${profile.uid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          disciplines,
          selfSkills,
          selfLevel: derivedLevel,
          equipment: toStudentEquipment(equipment),
        }),
      });
      if (!res.ok) throw new Error("No se pudo guardar el perfil");
      const payload = (await res.json()) as { profile: StudentProfile };
      setProfile(payload.profile);
      setMessage("Perfil actualizado");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function addTip() {
    if (!newTip.trim()) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/students/${profile.uid}/tips`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: newTip,
          pinned: pinNewTip,
          source: "staff",
          authorSlug: monitorSlug || "explora",
          authorName: monitorName || "Explora",
        }),
      });
      if (!res.ok) throw new Error("No se pudo guardar el tip");
      const payload = (await res.json()) as { tips: StudentTip[] };
      setTips(payload.tips);
      setNewTip("");
      setMessage("Tip añadido");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function pinTip(tipId: string, pinned: boolean) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/students/${profile.uid}/tips/${tipId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned }),
      });
      if (!res.ok) throw new Error("No se pudo actualizar el tip");
      const payload = (await res.json()) as { tips: StudentTip[] };
      setTips(payload.tips);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function removeTip(tipId: string) {
    if (!window.confirm("¿Eliminar este tip?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/students/${profile.uid}/tips/${tipId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("No se pudo eliminar");
      const payload = (await res.json()) as { tips: StudentTip[] };
      setTips(payload.tips);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function saveCorrection(mediaId: string) {
    setBusy(true);
    setError("");
    try {
      const notes = correctionDrafts[mediaId] || "";
      const res = await fetch(`/api/admin/students/${profile.uid}/media`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaId,
          correctionNotes: notes,
          reviewedByInstructorSlug: monitorSlug || undefined,
          markReviewed: true,
        }),
      });
      if (!res.ok) throw new Error("No se pudo guardar la corrección");
      const payload = (await res.json()) as { media: StudentMediaItem };
      setMedia((current) => current.map((item) => (item.id === mediaId ? payload.media : item)));

      if (addTipFromCorrection[mediaId] && notes.trim()) {
        const tipRes = await fetch(`/api/admin/students/${profile.uid}/tips`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: notes,
            pinned: false,
            source: "correction",
            authorSlug: monitorSlug || "explora",
            authorName: monitorName || "Explora",
          }),
        });
        if (tipRes.ok) {
          const tipPayload = (await tipRes.json()) as { tips: StudentTip[] };
          setTips(tipPayload.tips);
        }
      }

      setMessage("Corrección guardada");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function unlinkGallery(mediaId: string) {
    setBusy(true);
    try {
      await fetch(`/api/admin/students/${profile.uid}/media`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId, unlinkGallery: true }),
      });
      setMedia((current) =>
        current.map((item) =>
          item.id === mediaId ? { ...item, liveGalleryId: null, publishedToGallery: false } : item,
        ),
      );
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  function toggleDiscipline(id: ProgressDisciplineId) {
    setDisciplines((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function toggleSkill(discipline: ProgressDisciplineId, skillId: string) {
    setSelfSkills((current) => {
      const list = current[discipline] ?? [];
      const next = list.includes(skillId) ? list.filter((id) => id !== skillId) : [...list, skillId];
      return { ...current, [discipline]: next };
    });
  }

  function companionLabel(id?: string) {
    if (!id) return "Titular";
    const found = companions.find((item) => item.id === id);
    return found ? `${found.name} (${found.relationLabel})` : id;
  }

  return (
    <div className="space-y-5 sm:space-y-8">
      <section className="rounded-xl border border-hielo/10 bg-white p-3.5 sm:rounded-2xl sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-display text-xl font-semibold sm:text-2xl">{profile.displayName || profile.email}</p>
            <p className="text-sm text-muted">{profile.email}</p>
            <p className="mt-1 text-sm text-hielo">
              Nivel: {profile.selfLevel ? selfLevelName(profile.selfLevel, "es") : "Sin estimar"}
              {derivedLevel && derivedLevel !== profile.selfLevel
                ? ` → estimado ahora: ${selfLevelName(derivedLevel, "es")}`
                : ""}
            </p>
          </div>
          <label className="block text-sm font-semibold">
            Monitor (para fichas / correcciones)
            <select
              className="mt-1 block min-w-[12rem] rounded-xl border border-hielo/15 bg-white px-3 py-2"
              value={monitorSlug}
              onChange={(event) => setMonitorSlug(event.target.value)}
            >
              <option value="">Selecciona</option>
              {instructors.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-hielo/10 bg-white p-3.5 sm:rounded-2xl sm:p-5">
        <h2 className="font-display text-xl font-semibold">Perfil</h2>
        <div className="flex flex-wrap gap-2">
          {WIZARD_DISCIPLINES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleDiscipline(item.id)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                disciplines.includes(item.id) ? "bg-hielo text-white" : "bg-nieve"
              }`}
            >
              {item.nameEs}
            </button>
          ))}
        </div>

        {disciplines.map((discipline) => (
          <div key={discipline} className="rounded-xl bg-nieve/60 p-3">
            <p className="text-sm font-semibold">{progressDisciplineName(discipline, "es")}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {skillsGroupedByLevel(discipline).flatMap((group) =>
                group.skills.map((skill) => {
                  const active = (selfSkills[discipline] ?? []).includes(skill.id);
                  return (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => toggleSkill(discipline, skill.id)}
                      className={`rounded-full px-2.5 py-1 text-[0.7rem] font-semibold ${
                        active ? "bg-oro/90 text-white" : "bg-white text-pizarra"
                      }`}
                    >
                      {selfSkillLabel(skill, "es")}
                    </button>
                  );
                }),
              )}
            </div>
          </div>
        ))}

        <StudentEquipmentFields
          locale="es"
          disciplines={disciplines}
          values={equipment}
          onChange={(patch) => setEquipment((current) => ({ ...current, ...patch }))}
        />

        {profile.companions.length > 0 ? (
          <div>
            <p className="text-sm font-semibold">Compañeros</p>
            <ul className="mt-1 text-sm text-muted">
              {profile.companions.map((companion) => (
                <li key={companion.id}>
                  {companion.name} ·{" "}
                  {COMPANION_RELATIONS.find((item) => item.id === companion.relation)?.nameEs ||
                    companion.relation}
                  {companion.age != null ? ` · ${companion.age} años` : ""}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <button type="button" disabled={busy} onClick={() => void saveProfile()} className="btn-primary !w-auto">
          Guardar perfil
        </button>
      </section>

      <section className="space-y-4 rounded-xl border border-hielo/10 bg-white p-3.5 sm:rounded-2xl sm:p-5">
        <h2 className="font-display text-xl font-semibold">Tips del equipo</h2>
        {pinnedTip ? (
          <div className="rounded-xl border border-oro/25 bg-gradient-to-br from-white to-hielo/5 p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-hielo">Tip pinado (visible al alumno)</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-pizarra">{pinnedTip.text}</p>
            <p className="mt-1 text-xs text-muted">
              {pinnedTip.authorName} · {SOURCE_LABEL[pinnedTip.source]} · {pinnedTip.createdAt.slice(0, 10)}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                className="rounded-full border px-2.5 py-1 text-xs font-semibold"
                onClick={() => void pinTip(pinnedTip.id, false)}
              >
                Quitar pin
              </button>
              <button
                type="button"
                disabled={busy}
                className="rounded-full border border-accent/30 px-2.5 py-1 text-xs font-semibold text-accent"
                onClick={() => void removeTip(pinnedTip.id)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted">Ningún tip pinado. El alumno no verá tip destacado en el resumen.</p>
        )}

        <div className="space-y-2">
          <textarea
            value={newTip}
            onChange={(event) => setNewTip(event.target.value)}
            rows={3}
            className="w-full rounded-xl border border-hielo/15 px-3 py-2 text-sm"
            placeholder="Nuevo tip para el alumno…"
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={pinNewTip} onChange={(event) => setPinNewTip(event.target.checked)} />
            Pinear como tip actual
          </label>
          <button type="button" disabled={busy || !newTip.trim()} onClick={() => void addTip()} className="btn-primary !w-auto">
            Añadir tip
          </button>
        </div>

        {tips.filter((tip) => !tip.pinned).length > 0 ? (
          <ul className="space-y-2">
            {tips
              .filter((tip) => !tip.pinned)
              .map((tip) => (
              <li key={tip.id} className="rounded-xl bg-nieve/70 px-3 py-2 text-sm">
                <p className="whitespace-pre-wrap text-pizarra">{tip.text}</p>
                <p className="mt-1 text-xs text-muted">
                  {tip.authorName || "Explora"} · {SOURCE_LABEL[tip.source]} · {tip.createdAt.slice(0, 10)}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    className="rounded-full border px-2.5 py-1 text-xs font-semibold"
                    onClick={() => void pinTip(tip.id, !tip.pinned)}
                  >
                    Pinear
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    className="rounded-full border border-accent/30 px-2.5 py-1 text-xs font-semibold text-accent"
                    onClick={() => void removeTip(tip.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {skillTimeline.length > 0 ? (
        <section className="space-y-3 rounded-xl border border-hielo/10 bg-white p-3.5 sm:rounded-2xl sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-xl font-semibold">Evolución técnica</h2>
            <select
              className="rounded-xl border border-hielo/15 bg-white px-3 py-1.5 text-sm"
              value={timelineDiscipline}
              onChange={(event) => setTimelineDiscipline(event.target.value as ProgressDisciplineId)}
            >
              {(["esqui", "snowboard", "telemark", "esqui-adaptado", "freeride", "freestyle"] as ProgressDisciplineId[]).map(
                (id) => (
                  <option key={id} value={id}>
                    {progressDisciplineName(id, "es")}
                  </option>
                ),
              )}
            </select>
          </div>
          <ul className="space-y-2">
            {skillTimeline.map((row) => (
              <li key={row.skillId} className="rounded-xl bg-nieve/60 px-3 py-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{row.label}</span>
                  <span className="tabular-nums text-muted">
                    {row.latest}/5
                    {row.delta != null ? (
                      <span className={row.delta >= 0 ? " text-hielo" : " text-accent"}>
                        {" "}
                        ({row.delta >= 0 ? "+" : ""}
                        {row.delta})
                      </span>
                    ) : null}
                  </span>
                </div>
                <div className="mt-1 flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      className={`h-1.5 flex-1 rounded-full ${(row.latest ?? 0) >= n ? "bg-hielo" : "bg-hielo/15"}`}
                    />
                  ))}
                </div>
                {row.points.length > 1 ? (
                  <p className="mt-1 text-xs text-muted">
                    {row.points.map((point) => `${point.date}: ${point.rating}`).join(" → ")}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-4 rounded-xl border border-hielo/10 bg-white p-3.5 sm:rounded-2xl sm:p-5">
        <h2 className="font-display text-xl font-semibold">Medias y videocorrecciones</h2>
        {media.length === 0 ? (
          <p className="text-sm text-muted">El alumno aún no ha subido fotos ni vídeos.</p>
        ) : (
          <ul className="space-y-4">
            {media.map((item) => (
              <li key={item.id} className="rounded-xl border border-hielo/10 p-3">
                <div className="grid gap-3 md:grid-cols-[180px_1fr]">
                  <div className="overflow-hidden rounded-lg bg-nieve">
                    {item.kind === "video" ? (
                      <video src={item.src} controls className="aspect-video w-full object-cover" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.src} alt="" className="aspect-video w-full object-cover" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {item.kind === "video" ? "Vídeo" : "Foto"} · {item.fileName}
                    </p>
                    <p className="text-xs text-muted">
                      {item.publishedToGallery ? "En galería en vivo" : "Solo correcciones"}
                      {item.kind === "video" ? " · Los vídeos no se publican en la web" : ""}
                      {item.reviewedAt ? ` · Revisado ${item.reviewedAt.slice(0, 10)}` : " · Pendiente"}
                    </p>
                    <textarea
                      className="mt-2 w-full rounded-xl border border-hielo/15 px-3 py-2 text-sm"
                      rows={3}
                      value={correctionDrafts[item.id] ?? ""}
                      onChange={(event) =>
                        setCorrectionDrafts((current) => ({ ...current, [item.id]: event.target.value }))
                      }
                      placeholder="Corrección / tip sobre este vídeo o foto…"
                    />
                    <label className="mt-2 flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={Boolean(addTipFromCorrection[item.id])}
                        onChange={(event) =>
                          setAddTipFromCorrection((current) => ({
                            ...current,
                            [item.id]: event.target.checked,
                          }))
                        }
                      />
                      También añadir al historial de tips
                    </label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        className="rounded-full bg-hielo px-3 py-1 text-xs font-semibold text-white"
                        onClick={() => void saveCorrection(item.id)}
                      >
                        Guardar corrección
                      </button>
                      {item.kind === "image" && item.publishedToGallery ? (
                        <button
                          type="button"
                          disabled={busy}
                          className="rounded-full border px-3 py-1 text-xs font-semibold"
                          onClick={() => void unlinkGallery(item.id)}
                        >
                          Quitar de la web
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4 rounded-xl border border-hielo/10 bg-white p-3.5 sm:rounded-2xl sm:p-5">
        <h2 className="font-display text-xl font-semibold">Clases y fichas</h2>
        {lastFocus ? (
          <div className="rounded-xl border border-hielo/15 bg-hielo/5 px-3 py-2 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-hielo">Último foco</p>
            <p className="mt-1 text-pizarra">{lastFocus}</p>
          </div>
        ) : null}
        {bookings.length === 0 ? (
          <p className="text-sm text-muted">Sin reservas vinculadas todavía.</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {bookings.map((booking) => {
                const active =
                  activeBooking?.leadId === booking.leadId && activeBooking.itemIndex === booking.itemIndex;
                return (
                  <button
                    key={`${booking.leadId}-${booking.itemIndex}`}
                    type="button"
                    onClick={() => {
                      setActiveBooking(booking);
                      setCompanionId("");
                    }}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      active ? "bg-hielo text-white" : "bg-nieve"
                    }`}
                  >
                    {booking.date} · {booking.productTitle}
                  </button>
                );
              })}
            </div>
            {activeBooking ? (
              <ProgressForm
                key={`${activeBooking.leadId}-${activeBooking.itemIndex}-${companionId}`}
                leadId={activeBooking.leadId}
                itemIndex={activeBooking.itemIndex}
                studentName={profile.displayName || profile.email}
                studentEmail={profile.email}
                dateLabel={`${activeBooking.date} · ${activeBooking.productTitle}`}
                defaultDiscipline={activeBooking.discipline || "esqui"}
                defaultHours={2}
                initial={activeReport}
                instructors={instructors}
                defaultInstructorSlug={
                  monitorSlug || activeBooking.instructorSlug || activeReport?.instructorSlug || ""
                }
                companions={companions}
                companionId={companionId}
                onCompanionChange={setCompanionId}
              />
            ) : null}
          </>
        )}

        {reports.length > 0 ? (
          <div className="border-t border-hielo/10 pt-4">
            <p className="text-sm font-semibold">Historial de fichas</p>
            <ul className="mt-2 space-y-2 text-sm">
              {reports.map((report) => (
                <li key={report.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-nieve px-3 py-2">
                  <span>
                    {companionLabel(report.companionId)} · {report.instructorName} ·{" "}
                    {progressDisciplineName(report.discipline as ProgressDisciplineId, "es")} · {report.hours}h ·{" "}
                    {"★".repeat(report.rating)}
                  </span>
                  <Link
                    href={`/admin/evaluacion/${report.leadId}/${report.itemIndex}`}
                    className="font-semibold text-hielo"
                  >
                    Abrir
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      {error ? <p className="text-sm text-accent">{error}</p> : null}
      {message ? <p className="text-sm text-hielo">{message}</p> : null}
    </div>
  );
}
