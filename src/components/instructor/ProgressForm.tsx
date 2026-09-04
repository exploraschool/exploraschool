"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PROGRESS_DISCIPLINES,
  PROGRESS_SKILLS,
  isProgressDiscipline,
  type ProgressDisciplineId,
} from "@/data/progress-skills";
import {
  PISTA_LEVEL_LABEL,
  recommendablePistasBySector,
  type PistaLevel,
} from "@/data/pistas";
import type { ProgressMedia, ProgressReport } from "@/lib/progress-reports";

type InstructorOption = { slug: string; name: string };

type ProgressFormProps = {
  leadId: string;
  itemIndex: number;
  studentName: string;
  studentEmail: string;
  dateLabel: string;
  defaultDiscipline: string;
  defaultHours: number;
  initial: ProgressReport | null;
  instructors?: InstructorOption[];
  defaultInstructorSlug?: string;
  companions?: { id: string; name: string; relationLabel: string }[];
  companionId?: string;
  onCompanionChange?: (companionId: string) => void;
};

const FIELD =
  "mt-1.5 w-full rounded-xl border border-hielo/15 bg-white px-3.5 py-2.5 text-sm text-pizarra outline-none transition focus:border-hielo/40";

const PISTA_FILTERS: { id: PistaLevel | "all"; label: string; tone: string }[] = [
  { id: "all", label: "Todas", tone: "bg-hielo text-white" },
  { id: "green", label: "Verde", tone: "bg-emerald-600 text-white" },
  { id: "blue", label: "Azul", tone: "bg-sky-600 text-white" },
  { id: "red", label: "Roja", tone: "bg-rose-600 text-white" },
  { id: "black", label: "Negra", tone: "bg-pizarra text-white" },
];

function pistaChipTone(level: PistaLevel, active: boolean): string {
  if (active) {
    if (level === "green") return "bg-emerald-600 text-white ring-2 ring-emerald-600/25";
    if (level === "blue") return "bg-sky-600 text-white ring-2 ring-sky-600/25";
    if (level === "red") return "bg-rose-600 text-white ring-2 ring-rose-600/25";
    return "bg-pizarra text-white ring-2 ring-pizarra/20";
  }
  return "border border-hielo/15 bg-white text-pizarra hover:border-hielo/35";
}

function Section({
  step,
  title,
  hint,
  children,
}: {
  step: string;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-hielo/10 bg-white p-4 shadow-sm sm:p-5">
      <header className="mb-4 flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-hielo text-xs font-bold text-white">
          {step}
        </span>
        <div className="min-w-0 pt-0.5">
          <h2 className="font-display text-lg font-semibold text-pizarra">{title}</h2>
          {hint ? <p className="mt-0.5 text-xs text-muted">{hint}</p> : null}
        </div>
      </header>
      {children}
    </section>
  );
}

export function ProgressForm({
  leadId,
  itemIndex,
  studentName,
  studentEmail,
  dateLabel,
  defaultDiscipline,
  defaultHours,
  initial,
  instructors = [],
  defaultInstructorSlug = "",
  companions = [],
  companionId = "",
  onCompanionChange,
}: ProgressFormProps) {
  const router = useRouter();
  const initialDiscipline: ProgressDisciplineId = isProgressDiscipline(initial?.discipline || defaultDiscipline)
    ? ((initial?.discipline || defaultDiscipline) as ProgressDisciplineId)
    : "esqui";

  const [discipline, setDiscipline] = useState<ProgressDisciplineId>(initialDiscipline);
  const [instructorSlug, setInstructorSlug] = useState(
    initial?.instructorSlug || defaultInstructorSlug || "",
  );
  const [skills, setSkills] = useState<Record<string, number>>(initial?.skills ?? {});
  const [rating, setRating] = useState(initial?.rating ?? 3);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [nextFocus, setNextFocus] = useState(initial?.nextFocus ?? "");
  const [pistas, setPistas] = useState<string[]>(initial?.recommendedPistaIds ?? []);
  const [pistaFilter, setPistaFilter] = useState<PistaLevel | "all">("all");
  const [openSectors, setOpenSectors] = useState<Record<string, boolean>>({ borreguiles: true });
  const [hours, setHours] = useState(initial?.hours ?? defaultHours);
  const [media, setMedia] = useState<ProgressMedia[]>(initial?.media ?? []);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const skillList = useMemo(() => PROGRESS_SKILLS[discipline], [discipline]);
  const sectorGroups = useMemo(() => recommendablePistasBySector(), []);
  const reportKey = companionId ? `${leadId}_${itemIndex}_${companionId}` : `${leadId}_${itemIndex}`;
  const isEdit = Boolean(initial);

  function togglePista(id: string) {
    setPistas((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 12) {
        setError("Máximo 12 pistas recomendadas");
        return current;
      }
      setError("");
      return [...current, id];
    });
  }

  function setSkillValue(skillId: string, value: number) {
    setSkills((current) => ({ ...current, [skillId]: value }));
  }

  async function save(nextMedia = media) {
    if (instructors.length > 0 && !instructorSlug) {
      setError("Elige qué monitor dio la clase");
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const filledSkills = { ...skills };
      for (const skill of skillList) {
        if (filledSkills[skill.id] == null) filledSkills[skill.id] = 3;
      }

      const res = await fetch("/api/admin/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId,
          itemIndex,
          discipline,
          instructorSlug: instructorSlug || undefined,
          skills: filledSkills,
          rating,
          notes,
          nextFocus,
          recommendedPistaIds: pistas,
          hours: Number.isFinite(hours) ? hours : defaultHours,
          companionId: companionId || undefined,
          media: nextMedia,
        }),
      });
      const payload = (await res.json().catch(() => null)) as {
        error?: string;
        message?: string;
      } | null;
      if (!res.ok) {
        const code = payload?.error || "";
        const reason =
          payload?.message ||
          (code === "invalid_instructor"
            ? "Elige un monitor válido de la lista"
            : code === "invalid_data"
              ? "Datos no válidos (revisa pistas, horas o campos)"
              : code === "unauthorized"
                ? "Sesión de admin caducada — vuelve a entrar"
                : code === "lead_not_found" || code === "item_not_found"
                  ? "No se encontró la reserva asociada"
                  : code ||
                    (res.status === 401 ? "Sesión de admin caducada" : "No se pudo guardar la ficha"));
        throw new Error(reason);
      }
      setMessage("Ficha guardada");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const remaining = 3 - media.length;
    const picked = [...files].slice(0, remaining);
    setBusy(true);
    setError("");
    try {
      const uploaded: ProgressMedia[] = [];
      for (const file of picked) {
        let uploadedItem: ProgressMedia | null = null;
        const signed = await fetch("/api/admin/progress", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            leadId,
            itemIndex,
            companionId: companionId || undefined,
            contentType: file.type || "application/octet-stream",
            fileName: file.name,
          }),
        });
        const payload = (await signed.json()) as { uploadUrl?: string; media?: ProgressMedia; error?: string };
        if (signed.ok && payload.uploadUrl && payload.media) {
          const put = await fetch(payload.uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": file.type || payload.media.contentType },
            body: file,
          });
          if (put.ok) uploadedItem = payload.media;
        }
        if (!uploadedItem) {
          const form = new FormData();
          form.set("leadId", leadId);
          form.set("itemIndex", String(itemIndex));
          if (companionId) form.set("companionId", companionId);
          form.set("file", file);
          const fallback = await fetch("/api/admin/progress/upload", { method: "POST", body: form });
          const fallbackPayload = (await fallback.json()) as { media?: ProgressMedia; error?: string };
          if (!fallback.ok || !fallbackPayload.media) {
            throw new Error(fallbackPayload.error || payload.error || "No se pudo subir el archivo");
          }
          uploadedItem = fallbackPayload.media;
        }
        uploaded.push(uploadedItem);
      }
      const next = [...media, ...uploaded].slice(0, 3);
      setMedia(next);
      await save(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de subida");
    } finally {
      setBusy(false);
    }
  }

  async function removeMedia(id: string) {
    setBusy(true);
    try {
      await fetch("/api/admin/progress/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId: reportKey, mediaId: id }),
      });
      setMedia((current) => current.filter((item) => item.id !== id));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      className="space-y-4 pb-28 sm:space-y-5 sm:pb-8"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <div className="overflow-hidden rounded-2xl border border-hielo/10 bg-gradient-to-br from-white to-hielo/[0.06] shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-hielo">
              {isEdit ? "Editar ficha" : "Nueva ficha"}
            </p>
            <h1 className="mt-1 font-display text-2xl font-semibold leading-tight text-pizarra sm:text-3xl">
              {studentName}
            </h1>
            <p className="mt-1 truncate text-sm text-muted">
              {dateLabel}
              {studentEmail ? ` · ${studentEmail}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-hielo/10 px-3 py-1 text-xs font-semibold text-hielo">
              {"★".repeat(rating)}
              {"☆".repeat(5 - rating)}
            </span>
            {pistas.length ? (
              <span className="rounded-full bg-nieve px-3 py-1 text-xs font-semibold text-muted">
                {pistas.length} pista{pistas.length === 1 ? "" : "s"}
              </span>
            ) : null}
            {media.length ? (
              <span className="rounded-full bg-nieve px-3 py-1 text-xs font-semibold text-muted">
                {media.length} media
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <Section step="1" title="Clase" hint="Quién, qué disciplina y duración">
        <div className="grid gap-3 sm:grid-cols-2">
          {companions.length > 0 && onCompanionChange ? (
            <label className="block text-sm font-semibold sm:col-span-2">
              Persona de la ficha
              <select
                className={FIELD}
                value={companionId}
                onChange={(event) => onCompanionChange(event.target.value)}
              >
                <option value="">Titular ({studentName})</option>
                {companions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.relationLabel})
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {instructors.length > 0 ? (
            <label className="block text-sm font-semibold sm:col-span-2">
              Monitor que dio la clase
              <select
                className={FIELD}
                value={instructorSlug}
                onChange={(event) => setInstructorSlug(event.target.value)}
                required
              >
                <option value="">Selecciona un monitor</option>
                {instructors.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <label className="block text-sm font-semibold">
            Disciplina
            <select
              className={FIELD}
              value={discipline}
              onChange={(event) => {
                const next = event.target.value as ProgressDisciplineId;
                setDiscipline(next);
                setSkills({});
              }}
            >
              {PROGRESS_DISCIPLINES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nameEs}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-semibold">
            Horas de sesión
            <input
              type="number"
              min={0}
              max={24}
              step={0.5}
              value={Number.isFinite(hours) ? hours : ""}
              onChange={(event) => setHours(Number(event.target.value))}
              className={FIELD}
            />
          </label>
        </div>
      </Section>

      <Section step="2" title="Valoración" hint="Toca el número: más rápido que un slider en el móvil">
        <div className="mb-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">General</p>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                className={`flex h-12 min-w-12 flex-1 items-center justify-center rounded-xl text-lg font-bold transition sm:flex-none sm:px-5 ${
                  value <= rating
                    ? "bg-oro text-white shadow-sm"
                    : "border border-hielo/15 bg-nieve text-muted hover:border-oro/40"
                }`}
                aria-label={`${value} estrellas`}
                aria-pressed={value <= rating}
              >
                {value}★
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Técnica</p>
          {skillList.map((skill) => {
            const value = skills[skill.id] ?? 3;
            return (
              <div
                key={skill.id}
                className="rounded-xl border border-hielo/10 bg-nieve/60 px-3 py-3 sm:px-4"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-pizarra">{skill.labelEs}</p>
                  <span className="tabular-nums text-sm font-bold text-hielo">{value}/5</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setSkillValue(skill.id, n)}
                      className={`h-10 rounded-lg text-sm font-bold transition ${
                        n <= value
                          ? "bg-hielo text-white"
                          : "bg-white text-muted ring-1 ring-hielo/10 hover:ring-hielo/25"
                      }`}
                      aria-label={`${skill.labelEs}: ${n}`}
                      aria-pressed={n === value}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section step="3" title="Notas y próximo foco" hint="El foco se muestra al alumno y entra al historial de tips">
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="block text-sm font-semibold">
            Notas de la clase
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={5}
              placeholder="Qué se trabajó, cómo respondió, material…"
              className={FIELD}
            />
          </label>
          <label className="block text-sm font-semibold">
            Foco para la próxima clase
            <textarea
              value={nextFocus}
              onChange={(event) => setNextFocus(event.target.value)}
              rows={5}
              maxLength={500}
              placeholder="Una frase clara: qué practicar en la siguiente sesión…"
              className={FIELD}
            />
            <span className="mt-1.5 block text-xs font-normal text-muted">
              {nextFocus.length}/500 · visible en el resumen del alumno
            </span>
          </label>
        </div>
      </Section>

      <Section
        step="4"
        title="Pistas recomendadas"
        hint={`Sierra Nevada por sectores · ${pistas.length}/12 seleccionadas`}
      >
        <div className="mb-3 flex flex-wrap gap-1.5">
          {PISTA_FILTERS.map((filter) => {
            const active = pistaFilter === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setPistaFilter(filter.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  active ? filter.tone : "border border-hielo/15 bg-nieve text-muted"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {pistas.length > 0 ? (
          <div className="mb-3 flex flex-wrap gap-1.5 rounded-xl bg-hielo/5 px-3 py-2">
            <span className="w-full text-[0.65rem] font-semibold uppercase tracking-wider text-hielo">
              Seleccionadas
            </span>
            {pistas.map((id) => {
              const pista = sectorGroups.flatMap((g) => g.pistas).find((item) => item.id === id);
              if (!pista) return null;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => togglePista(id)}
                  className={`rounded-full px-2.5 py-1 text-[0.7rem] font-semibold ${pistaChipTone(pista.level, true)}`}
                  title="Quitar"
                >
                  {pista.name} ×
                </button>
              );
            })}
          </div>
        ) : null}

        <div className="max-h-[22rem] space-y-2 overflow-y-auto overscroll-contain pr-0.5 sm:max-h-[28rem]">
          {sectorGroups.map(({ sector, pistas: sectorPistas }) => {
            const visible = sectorPistas.filter(
              (pista) => pistaFilter === "all" || pista.level === pistaFilter,
            );
            if (!visible.length) return null;
            const open = openSectors[sector.id] ?? false;
            const selectedInSector = visible.filter((pista) => pistas.includes(pista.id)).length;
            return (
              <div key={sector.id} className="overflow-hidden rounded-xl border border-hielo/10">
                <button
                  type="button"
                  onClick={() =>
                    setOpenSectors((current) => ({ ...current, [sector.id]: !open }))
                  }
                  className="flex w-full items-center justify-between gap-3 bg-nieve/80 px-3 py-2.5 text-left"
                >
                  <span>
                    <span className="block text-sm font-semibold text-pizarra">{sector.nameEs}</span>
                    <span className="block text-[0.7rem] text-muted">{sector.blurbEs}</span>
                  </span>
                  <span className="shrink-0 text-xs font-semibold text-hielo">
                    {selectedInSector ? `${selectedInSector} · ` : ""}
                    {open ? "▾" : "▸"}
                  </span>
                </button>
                {open ? (
                  <div className="flex flex-wrap gap-1.5 border-t border-hielo/10 bg-white p-3">
                    {visible.map((pista) => {
                      const active = pistas.includes(pista.id);
                      return (
                        <button
                          key={pista.id}
                          type="button"
                          onClick={() => togglePista(pista.id)}
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${pistaChipTone(pista.level, active)}`}
                        >
                          {pista.name}
                          <span className={`ml-1 ${active ? "opacity-80" : "text-muted"}`}>
                            · {PISTA_LEVEL_LABEL[pista.level].es}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </Section>

      <Section step="5" title="Fotos y vídeos" hint="Hasta 3 archivos para la ficha del alumno">
        <ul className="mb-3 space-y-2">
          {media.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-hielo/10 bg-nieve px-3 py-2.5 text-sm"
            >
              <span className="min-w-0 truncate font-medium">
                {item.kind === "video" ? "Vídeo" : "Foto"} · {item.fileName}
              </span>
              <button
                type="button"
                className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold text-accent hover:bg-accent/10"
                onClick={() => void removeMedia(item.id)}
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
        {media.length < 3 ? (
          <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-hielo/40 bg-hielo/[0.06] px-4 py-6 text-center transition hover:border-hielo/60 hover:bg-hielo/10">
            <span className="text-base font-bold text-hielo">+ Añadir foto o vídeo</span>
            <span className="text-xs text-muted">
              {media.length === 0 ? "JPG, PNG, WebP, MP4 o WebM" : `${media.length} de 3 · pulsa para añadir`}
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
              multiple
              className="sr-only"
              onChange={(event) => {
                void onFiles(event.target.files);
                event.currentTarget.value = "";
              }}
            />
          </label>
        ) : (
          <p className="text-xs text-muted">Límite de 3 archivos alcanzado.</p>
        )}
      </Section>

      {(error || message) && (
        <div
          className={`rounded-xl px-4 py-3 text-sm font-medium ${
            error ? "border border-accent/25 bg-accent/5 text-accent" : "border border-hielo/20 bg-hielo/5 text-hielo"
          }`}
          role="status"
        >
          {error || message}
        </div>
      )}

      <div className="hidden sm:block">
        <button type="submit" disabled={busy} className="btn-primary !w-auto min-w-[12rem]">
          {busy ? "Guardando…" : isEdit ? "Actualizar ficha" : "Guardar ficha"}
        </button>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-hielo/10 bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(10,18,25,0.08)] backdrop-blur sm:hidden">
        {error ? <p className="mb-2 text-center text-xs font-medium text-accent">{error}</p> : null}
        {message && !error ? (
          <p className="mb-2 text-center text-xs font-medium text-hielo">{message}</p>
        ) : null}
        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? "Guardando…" : isEdit ? "Actualizar ficha" : "Guardar ficha"}
        </button>
      </div>
    </form>
  );
}
