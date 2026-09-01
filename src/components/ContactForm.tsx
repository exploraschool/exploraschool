"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
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
      <div className="card border-hielo/20 bg-hielo/5 text-center">
        <p className="font-semibold text-hielo">{tc("success")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5" noValidate>
      <div className="absolute -left-[9999px]" aria-hidden>
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-pizarra">
          {t("name")} *
        </label>
        <input
          id="name"
          name="name"
          required
          className="w-full rounded-lg border border-hielo/20 bg-nieve px-4 py-3 text-sm focus:border-hielo focus:outline-none"
        />
        {errors.name && <p className="mt-1 text-xs text-accent">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-pizarra">
          {t("email")} *
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-lg border border-hielo/20 bg-nieve px-4 py-3 text-sm focus:border-hielo focus:outline-none"
        />
        {errors.email && <p className="mt-1 text-xs text-accent">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="phone" className="mb-1 block text-sm font-medium text-pizarra">
          {t("phone")}
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          className="w-full rounded-lg border border-hielo/20 bg-nieve px-4 py-3 text-sm focus:border-hielo focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium text-pizarra">
          {t("message")} *
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="w-full rounded-lg border border-hielo/20 bg-nieve px-4 py-3 text-sm focus:border-hielo focus:outline-none"
        />
        {errors.message && <p className="mt-1 text-xs text-accent">{errors.message}</p>}
      </div>

      <label className="flex items-start gap-3 text-sm text-muted">
        <input name="privacy" type="checkbox" required className="mt-1" />
        <span>
          {t("privacy")}{" "}
          <Link href="/politica-de-privacidad" className="text-hielo underline">
            →
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
