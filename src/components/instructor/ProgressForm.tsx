"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PROGRESS_DISCIPLINES,
  PROGRESS_SKILLS,
  isProgressDiscipline,
  type ProgressDisciplineId,
} from "@/data/progress-skills";
import { PISTA_LEVEL_LABEL, SIERRA_NEVADA_PISTAS } from "@/data/pistas";
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
};

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
}: ProgressFormProps) {
  const router = useRouter();
  const initialDiscipline: ProgressDisciplineId = isProgressDiscipline(initial?.discipline || defaultDiscipline)
    ? ((initial?.discipline || defaultDiscipline) as ProgressDisciplineId)
    : defaultDiscipline === "ninos"
      ? "esqui"
      : "esqui";

  const [discipline, setDiscipline] = useState<ProgressDisciplineId>(initialDiscipline);
  const [instructorSlug, setInstructorSlug] = useState(
    initial?.instructorSlug || defaultInstructorSlug || instructors[0]?.slug || "",
  );
  const [skills, setSkills] = useState<Record<string, number>>(initial?.skills ?? {});
  const [rating, setRating] = useState(initial?.rating ?? 3);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [pistas, setPistas] = useState<string[]>(initial?.recommendedPistaIds ?? []);
  const [hours, setHours] = useState(initial?.hours ?? defaultHours);
  const [media, setMedia] = useState<ProgressMedia[]>(initial?.media ?? []);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const skillList = useMemo(() => PROGRESS_SKILLS[discipline], [discipline]);

  function togglePista(id: string) {
    setPistas((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
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
      const res = await fetch("/api/admin/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId,
          itemIndex,
          discipline,
          instructorSlug: instructorSlug || undefined,
          skills,
          rating,
          notes,
          recommendedPistaIds: pistas,
          hours,
          media: nextMedia,
        }),
      });
      if (!res.ok) throw new Error("No se pudo guardar la ficha");
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
    const reportId = `${leadId}_${itemIndex}`;
    setBusy(true);
    try {
      await fetch("/api/admin/progress/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, mediaId: id }),
      });
      setMedia((current) => current.filter((item) => item.id !== id));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <div className="rounded-2xl border border-hielo/10 bg-white p-5">
        <p className="font-display text-2xl font-semibold">{studentName}</p>
        <p className="text-sm text-muted">
          {studentEmail} · {dateLabel}
        </p>
      </div>

      {instructors.length > 0 ? (
        <label className="block text-sm font-semibold">
          Monitor que dio la clase
          <select
            className="mt-1 w-full rounded-xl border border-hielo/15 bg-white px-3 py-2"
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
        Disciplina de la ficha
        <select
          className="mt-1 w-full rounded-xl border border-hielo/15 bg-white px-3 py-2"
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

      <div className="space-y-3 rounded-2xl border border-hielo/10 bg-white p-5">
        <p className="text-sm font-semibold">Técnica (1–5)</p>
        {skillList.map((skill) => (
          <label key={skill.id} className="flex items-center justify-between gap-3 text-sm">
            <span>{skill.labelEs}</span>
            <input
              type="range"
              min={1}
              max={5}
              value={skills[skill.id] ?? 3}
              onChange={(event) =>
                setSkills((current) => ({ ...current, [skill.id]: Number(event.target.value) }))
              }
            />
            <span className="w-4 text-right font-semibold">{skills[skill.id] ?? 3}</span>
          </label>
        ))}
      </div>

      <div className="rounded-2xl border border-hielo/10 bg-white p-5">
        <p className="text-sm font-semibold">Puntuación general</p>
        <div className="mt-2 flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className={`h-10 w-10 rounded-full text-lg ${value <= rating ? "bg-oro text-white" : "bg-nieve text-muted"}`}
              aria-label={`${value} estrellas`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <label className="block text-sm font-semibold">
        Notas del instructor
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={5}
          className="mt-1 w-full rounded-xl border border-hielo/15 bg-white px-3 py-2"
        />
      </label>

      <div>
        <p className="text-sm font-semibold">Pistas recomendadas de Sierra Nevada</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {SIERRA_NEVADA_PISTAS.map((pista) => {
            const active = pistas.includes(pista.id);
            return (
              <button
                key={pista.id}
                type="button"
                onClick={() => togglePista(pista.id)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  active ? "bg-hielo text-white" : "bg-nieve text-pizarra"
                }`}
              >
                {pista.name} · {PISTA_LEVEL_LABEL[pista.level].es}
              </button>
            );
          })}
        </div>
      </div>

      <label className="block text-sm font-semibold">
        Horas de la sesión
        <input
          type="number"
          min={0}
          max={24}
          step={0.5}
          value={hours}
          onChange={(event) => setHours(Number(event.target.value))}
          className="mt-1 w-32 rounded-xl border border-hielo/15 px-3 py-2"
        />
      </label>

      <div>
        <p className="text-sm font-semibold">Fotos y vídeos (máx. 3)</p>
        <ul className="mt-2 space-y-1 text-sm">
          {media.map((item) => (
            <li key={item.id} className="flex items-center justify-between rounded-xl bg-nieve px-3 py-2">
              <span>
                {item.kind === "video" ? "Vídeo" : "Foto"} · {item.fileName}
              </span>
              <button type="button" className="text-accent" onClick={() => void removeMedia(item.id)}>
                Quitar
              </button>
            </li>
          ))}
        </ul>
        {media.length < 3 ? (
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
            multiple
            className="mt-3 text-sm"
            onChange={(event) => void onFiles(event.target.files)}
          />
        ) : null}
      </div>

      {error ? <p className="text-sm text-accent">{error}</p> : null}
      {message ? <p className="text-sm text-hielo">{message}</p> : null}

      <button type="submit" disabled={busy} className="btn-primary !w-auto">
        {busy ? "Guardando…" : "Guardar ficha"}
      </button>
    </form>
  );
}
