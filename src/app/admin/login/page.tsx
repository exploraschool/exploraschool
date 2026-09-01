"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { media } from "@/lib/media";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin/leads");
      router.refresh();
    } else {
      setError("Contraseña incorrecta");
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="card w-full max-w-sm space-y-4">
        <div className="flex flex-col items-center text-center">
          <Image src={media.logo} alt="Explora School & Club" width={80} height={80} className="h-20 w-20 object-contain" />
          <h1 className="mt-4 font-display text-2xl font-semibold text-hielo">Explora Admin</h1>
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-hielo/20 px-4 py-3 text-sm"
            required
          />
        </div>
        {error && <p className="text-sm text-accent">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
