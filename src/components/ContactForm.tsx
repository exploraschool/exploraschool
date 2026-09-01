"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { site } from "@/data/site";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(10),
  privacy: z.literal(true),
  website: z.string().max(0).optional(),
});

export function ContactForm() {
  const t = useTranslations("contact");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrors({});

    const form = new FormData(e.currentTarget);
    const data = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      message: String(form.get("message") ?? ""),
      privacy: form.get("privacy") === "on",
      website: String(form.get("website") ?? ""),
      locale,
    };

    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0]?.toString() ?? "form";
        fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      setStatus("error");
      return;
    }

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      e.currentTarget.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="card border-hielo/20 bg-gradient-to-br from-hielo/5 to-transparent text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-hielo/10 text-hielo">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <p className="mt-4 font-display text-xl font-semibold text-hielo">{t("formSuccessTitle")}</p>
        <p className="mt-2 text-sm text-muted">{t("formSuccessDesc")}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a href={site.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-primary !w-auto">
            WhatsApp
          </a>
          <Link href="/reserva" className="btn-secondary !w-auto">
            {t("bookingTitle")}
          </Link>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-hielo/15 bg-nieve px-4 py-3 text-sm text-pizarra placeholder:text-muted focus:border-hielo focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="card space-y-5" noValidate>
      <div>
        <h2 className="font-display text-xl font-semibold text-hielo sm:text-2xl">{t("formTitle")}</h2>
        <p className="mt-2 text-sm text-muted">{t("formDesc")}</p>
      </div>

      <div className="absolute -left-[9999px]" aria-hidden>
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-pizarra">
          {t("name")} *
        </label>
        <input
          id="name"
          name="name"
          required
          placeholder={t("namePlaceholder")}
          className={inputClass}
        />
        {errors.name && <p className="mt-1 text-xs text-accent">{errors.name}</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-pizarra">
            {t("email")} *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder={t("emailPlaceholder")}
            className={inputClass}
          />
          {errors.email && <p className="mt-1 text-xs text-accent">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-pizarra">
            {t("phone")}
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder={t("phonePlaceholder")}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-pizarra">
          {t("message")} *
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder={t("messagePlaceholder")}
          className={inputClass}
        />
        {errors.message && <p className="mt-1 text-xs text-accent">{errors.message}</p>}
      </div>

      <label className="flex items-start gap-3 text-sm text-muted">
        <input name="privacy" type="checkbox" required className="mt-1 rounded border-hielo/20" />
        <span>
          {t("privacy")}{" "}
          <Link href="/politica-de-privacidad" className="font-medium text-hielo underline">
            {t("privacyLink")}
          </Link>
        </span>
      </label>

      <button type="submit" disabled={status === "loading"} className="btn-primary w-full sm:w-auto">
        {status === "loading" ? tc("sending") : tc("send")}
      </button>

      {status === "error" && !Object.keys(errors).length && (
        <p className="text-sm text-accent">{tc("error")}</p>
      )}
    </form>
  );
}
