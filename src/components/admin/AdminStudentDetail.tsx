"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  COMPANION_RELATIONS,
  EQUIPMENT_SOURCES,
  selfLevelName,
  WIZARD_DISCIPLINES,
} from "@/data/student-account";
import { progressDisciplineName, type ProgressDisciplineId } from "@/data/progress-skills";
import {
  deriveOverallSelfLevel,
  selfSkillLabel,
  skillsGroupedByLevel,
} from "@/data/self-assessment-skills";
import type { ProgressReport } from "@/lib/progress-reports";
import type { StudentMediaItem } from "@/lib/student-media";
import type { StudentProfile } from "@/lib/student-users";
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
};

export function AdminStudentDetail({
  profile: initialProfile,
  reports,
  bookings,
  media: initialMedia,
  instructors,
}: AdminStudentDetailProps) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [media, setMedia] = useState(initialMedia);
  const [monitorSlug, setMonitorSlug] = useState(instructors[0]?.slug || "");
  const [staffTips, setStaffTips] = useState(initialProfile.staffTips || "");
  const [disciplines, setDisciplines] = useState<ProgressDisciplineId[]>(initialProfile.disciplines);
  const [selfSkills, setSelfSkills] = useState(initialProfile.selfSkills ?? {});
  const [equipmentSource, setEquipmentSource] = useState(initialProfile.equipment?.source ?? "rental");
  const [bootSize, setBootSize] = useState(initialProfile.equipment?.bootSize ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activeBooking, setActiveBooking] = useState<BookingRow | null>(bookings[0] ?? null);
  const [correctionDrafts, setCorrectionDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(initialMedia.map((item) => [item.id, item.correctionNotes || ""])),
  );

  const derivedLevel = useMemo(() => deriveOverallSelfLevel(selfSkills), [selfSkills]);
  const activeReport = useMemo(() => {
    if (!activeBooking) return null;
    return (
      reports.find(
        (report) => report.leadId === activeBooking.leadId && report.itemIndex === activeBooking.itemIndex,
      ) ?? null
    );
  }, [activeBooking, reports]);

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
          staffTips,
          equipment: {
            source: equipmentSource,
            bootSize: bootSize.trim(),
            heightCm: profile.equipment?.heightCm ?? null,
            weightKg: profile.equipment?.weightKg ?? null,
          },
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

  async function saveCorrection(mediaId: string) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/students/${profile.uid}/media`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaId,
          correctionNotes: correctionDrafts[mediaId] || "",
          reviewedByInstructorSlug: monitorSlug || undefined,
          markReviewed: true,
        }),
      });
      if (!res.ok) throw new Error("No se pudo guardar la corrección");
      const payload = (await res.json()) as { media: StudentMediaItem };
      setMedia((current) => current.map((item) => (item.id === mediaId ? payload.media : item)));
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

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-hielo/10 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-display text-2xl font-semibold">{profile.displayName || profile.email}</p>
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

      <section className="space-y-4 rounded-2xl border border-hielo/10 bg-white p-5">
        <h2 className="font-display text-xl font-semibold">Perfil y tips del equipo</h2>
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

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold">
            Origen del material
            <select
              className="mt-1 w-full rounded-xl border border-hielo/15 px-3 py-2"
              value={equipmentSource}
              onChange={(event) => setEquipmentSource(event.target.value as "own" | "rental")}
            >
              {EQUIPMENT_SOURCES.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.nameEs}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold">
            Talla bota
            <input
              className="mt-1 w-full rounded-xl border border-hielo/15 px-3 py-2"
              value={bootSize}
              onChange={(event) => setBootSize(event.target.value)}
            />
          </label>
        </div>

        <label className="block text-sm font-semibold">
          Tips permanentes para el alumno
          <textarea
            value={staffTips}
            onChange={(event) => setStaffTips(event.target.value)}
            rows={4}
            className="mt-1 w-full rounded-xl border border-hielo/15 px-3 py-2"
            placeholder="Consejos que verá en su área de alumno…"
          />
        </label>

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
          Guardar perfil y tips
        </button>
      </section>

      <section className="space-y-4 rounded-2xl border border-hielo/10 bg-white p-5">
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

      <section className="space-y-4 rounded-2xl border border-hielo/10 bg-white p-5">
        <h2 className="font-display text-xl font-semibold">Clases y fichas</h2>
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
                    onClick={() => setActiveBooking(booking)}
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
                    {report.instructorName} · {progressDisciplineName(report.discipline as ProgressDisciplineId, "es")} ·{" "}
                    {report.hours}h · {"★".repeat(report.rating)}
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
