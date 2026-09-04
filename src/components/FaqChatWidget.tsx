"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import {
  FAQ_CHAT_NODES,
  FAQ_CHAT_PROMPT,
  FAQ_CHAT_WHATSAPP_URL,
  type FaqChatButton,
} from "@/data/faq-chat";
import { media } from "@/lib/media";

type ChatLine =
  | { id: string; role: "bot"; text: string }
  | { id: string; role: "user"; text: string };

function lineId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function FaqChatWidget() {
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [promptVisible, setPromptVisible] = useState(true);
  const [nodeId, setNodeId] = useState("root");
  const [lines, setLines] = useState<ChatLine[]>(() => [
    { id: "welcome", role: "bot", text: FAQ_CHAT_NODES.root.botText },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  const node = FAQ_CHAT_NODES[nodeId] ?? FAQ_CHAT_NODES.root;

  useEffect(() => {
    if (!open) return;
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [lines, open, nodeId]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function openChat() {
    setPromptVisible(false);
    setOpen(true);
  }

  function closeChat() {
    setOpen(false);
  }

  function runAction(button: FaqChatButton) {
    const action = button.action;
    setLines((current) => [...current, { id: lineId(), role: "user", text: button.label }]);

    if (action.type === "whatsapp") {
      window.open(action.href, "_blank", "noopener,noreferrer");
      setLines((current) => [
        ...current,
        {
          id: lineId(),
          role: "bot",
          text: "Te abrimos WhatsApp para hablar con el equipo. Si no se abre, usa el botón verde de abajo.",
        },
      ]);
      setNodeId("root");
      return;
    }

    if (action.type === "link") {
      const href = action.href.startsWith("http")
        ? action.href
        : `/${locale}${action.href.startsWith("/") ? action.href : `/${action.href}`}`;
      window.open(href, "_blank", "noopener,noreferrer");
      setLines((current) => [
        ...current,
        {
          id: lineId(),
          role: "bot",
          text: "Te abrimos el enlace en una pestaña nueva. ¿Necesitas algo más?",
        },
      ]);
      setNodeId("root");
      return;
    }

    const next = FAQ_CHAT_NODES[action.menuId];
    if (!next) return;
    setNodeId(next.id);
    setLines((current) => [...current, { id: lineId(), role: "bot", text: next.botText }]);
  }

  return (
    <div className="pointer-events-none fixed bottom-[5.5rem] right-3 z-[60] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {!open && promptVisible ? (
        <div className="pointer-events-auto relative max-w-[min(18rem,calc(100vw-5.5rem))] animate-[fade-up_0.35s_ease-out]">
          <button
            type="button"
            onClick={openChat}
            className="rounded-2xl rounded-br-md border border-hielo/15 bg-white px-3.5 py-3 text-left text-sm font-medium leading-snug text-pizarra shadow-[0_12px_40px_rgba(14,26,36,0.14)] transition hover:border-hielo/30"
          >
            {FAQ_CHAT_PROMPT}
          </button>
          <button
            type="button"
            onClick={() => setPromptVisible(false)}
            className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-hielo/15 bg-white text-muted shadow-sm hover:text-hielo"
            aria-label="Cerrar aviso"
          >
            <span className="text-xs leading-none">×</span>
          </button>
        </div>
      ) : null}

      {open ? (
        <div
          className="pointer-events-auto flex w-[min(22rem,calc(100vw-1.5rem))] max-h-[min(34rem,calc(100dvh-8rem))] origin-bottom-right animate-[fade-up_0.28s_ease-out] flex-col overflow-hidden rounded-3xl border border-hielo/15 bg-white shadow-[0_20px_60px_rgba(14,26,36,0.18)] sm:max-h-[min(36rem,calc(100dvh-7rem))]"
          role="dialog"
          aria-label="Asistente Explora School"
        >
          <header className="flex items-center gap-3 border-b border-hielo/10 bg-gradient-to-r from-hielo to-hielo-light px-4 py-3 text-white">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 p-1.5">
              <Image src={media.logoMark} alt="" width={28} height={28} className="h-7 w-7 object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-base font-semibold leading-tight">Explora School & Club</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/90">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
                </span>
                En línea
              </p>
            </div>
            <button
              type="button"
              onClick={closeChat}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-lg leading-none transition hover:bg-white/20"
              aria-label="Cerrar chat"
            >
              ×
            </button>
          </header>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-nieve/50">
            <div className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-3 py-3 sm:px-4">
              {lines.map((line) =>
                line.role === "bot" ? (
                  <div key={line.id} className="flex gap-2">
                    <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-hielo/10 p-1">
                      <Image src={media.logoMark} alt="" width={20} height={20} className="h-4 w-4 object-contain" />
                    </div>
                    <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tl-md bg-white px-3.5 py-2.5 text-sm leading-relaxed text-pizarra shadow-sm">
                      {line.text}
                    </div>
                  </div>
                ) : (
                  <div key={line.id} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-hielo px-3.5 py-2.5 text-sm leading-relaxed text-white">
                      {line.text}
                    </div>
                  </div>
                ),
              )}

              <div className="flex flex-col gap-2 pt-1">
                {node.buttons.map((button) => (
                  <button
                    key={`${node.id}-${button.id}-${lines.length}`}
                    type="button"
                    onClick={() => runAction(button)}
                    className="rounded-2xl border border-hielo/20 bg-white px-3.5 py-2.5 text-left text-sm font-semibold text-hielo shadow-sm transition hover:border-hielo/40 hover:bg-hielo/5 active:scale-[0.99]"
                  >
                    {button.label}
                  </button>
                ))}
              </div>
              <div ref={endRef} />
            </div>

            <div className="shrink-0 border-t border-hielo/10 bg-white p-3">
              <a
                href={FAQ_CHAT_WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(37,211,102,0.35)] transition hover:brightness-105"
              >
                <span aria-hidden>🟢</span>
                Hablar directamente por WhatsApp
              </a>
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => (open ? closeChat() : openChat())}
        className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full border border-hielo/15 bg-white shadow-[0_12px_40px_rgba(14,26,36,0.2)] transition hover:scale-105 hover:border-hielo/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hielo sm:h-16 sm:w-16"
        aria-label={open ? "Cerrar asistente" : "Abrir asistente de dudas"}
        aria-expanded={open}
      >
        {open ? (
          <span className="text-2xl leading-none text-hielo">×</span>
        ) : (
          <Image
            src={media.logoMark}
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 object-contain sm:h-10 sm:w-10"
          />
        )}
      </button>
    </div>
  );
}
