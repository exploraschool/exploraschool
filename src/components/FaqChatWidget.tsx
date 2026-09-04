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
import { usePathname } from "next/navigation";
import { media } from "@/lib/media";
import { pickLocale } from "@/lib/locale";
import { useStickyReveal } from "@/hooks/useStickyReveal";

type ChatLine =
  | { id: string; role: "bot"; text: string }
  | { id: string; role: "user"; text: string };

function lineId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function pagePath(pathname: string) {
  return pathname.replace(/^\/(es|en)(?=\/|$)/, "") || "/";
}

function isHomePath(pathname: string) {
  return pagePath(pathname) === "/";
}

export function FaqChatWidget() {
  const locale = useLocale();
  const pathname = usePathname();
  const stickyVisible = useStickyReveal();
  const [open, setOpen] = useState(false);
  const [nodeId, setNodeId] = useState("root");
  const [lines, setLines] = useState<ChatLine[]>(() => [
    { id: "welcome", role: "bot", text: FAQ_CHAT_NODES.root.botText },
  ]);
  const panelRef = useRef<HTMLDivElement>(null);
  const shouldStickBottom = useRef(false);

  const node = FAQ_CHAT_NODES[nodeId] ?? FAQ_CHAT_NODES.root;

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;

    if (!shouldStickBottom.current) {
      panel.scrollTop = 0;
      return;
    }

    panel.scrollTo({ top: panel.scrollHeight, behavior: "smooth" });
  }, [lines, open, nodeId]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!isHomePath(pathname)) setOpen(false);
  }, [pathname]);

  function openChat() {
    shouldStickBottom.current = false;
    setOpen(true);
  }

  function closeChat() {
    setOpen(false);
  }

  function runAction(button: FaqChatButton) {
    shouldStickBottom.current = true;
    const action = button.action;
    setLines((current) => [...current, { id: lineId(), role: "user", text: button.label }]);

    if (action.type === "whatsapp") {
      window.open(action.href, "_blank", "noopener,noreferrer");
      setLines((current) => [
        ...current,
        {
          id: lineId(),
          role: "bot",
          text: "Te abrimos WhatsApp para hablar con el equipo. Si no se abre, usa el botón de abajo.",
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
      const isMaps = /google\.com\/maps|maps\.google\.com/i.test(action.href);
      setLines((current) => [
        ...current,
        {
          id: lineId(),
          role: "bot",
          text: isMaps
            ? "Te abrimos Google Maps en una ventana nueva con la ubicación."
            : "Te abrimos el enlace en una pestaña nueva. ¿Necesitas algo más?",
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

  if (!isHomePath(pathname)) return null;
  if (!stickyVisible && !open) return null;

  return (
    <div className="pointer-events-none fixed bottom-[calc(var(--sticky-book-bar-h,0px)+1.5rem)] right-3 z-[60] flex flex-col items-end gap-3 transition-[bottom] duration-200 md:bottom-6 md:right-6">
      {open ? (
        <div
          className="pointer-events-auto flex w-[min(20.5rem,calc(100vw-1.5rem))] max-h-[min(32rem,calc(100dvh-8rem-var(--sticky-book-bar-h,0px)))] origin-bottom-right animate-[fade-up_0.22s_ease-out] flex-col overflow-hidden rounded-2xl border border-hielo/12 bg-white shadow-[0_16px_48px_rgba(14,26,36,0.14)] sm:max-h-[min(34rem,calc(100dvh-7rem-var(--sticky-book-bar-h,0px)))]"
          role="dialog"
          aria-label="Asistente Explora School"
        >
          <header className="flex items-center gap-3 border-b border-hielo/10 bg-nieve px-3.5 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white p-1.5 ring-1 ring-hielo/10">
              <Image src={media.logoMark} alt="" width={24} height={24} className="h-6 w-6 object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-[0.95rem] font-semibold leading-tight text-pizarra">
                Explora
              </p>
              <p className="mt-0.5 text-xs text-muted">Asistente · respuestas rápidas</p>
            </div>
            <button
              type="button"
              onClick={closeChat}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-hielo/8 hover:text-hielo"
              aria-label="Cerrar chat"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          </header>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div
              ref={panelRef}
              className="flex-1 space-y-2.5 overflow-y-auto overscroll-contain px-3 py-3 sm:px-3.5"
            >
              {lines.map((line) =>
                line.role === "bot" ? (
                  <div key={line.id} className="flex justify-start">
                    <div className="max-w-[92%] whitespace-pre-wrap rounded-2xl rounded-tl-md bg-nieve px-3 py-2.5 text-sm leading-relaxed text-pizarra">
                      {line.text}
                    </div>
                  </div>
                ) : (
                  <div key={line.id} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-hielo px-3 py-2.5 text-sm leading-relaxed text-white">
                      {line.text}
                    </div>
                  </div>
                ),
              )}

              <div className="flex flex-col gap-1.5 pt-1">
                {node.buttons.map((button) => (
                  <button
                    key={`${node.id}-${button.id}-${lines.length}`}
                    type="button"
                    onClick={() => runAction(button)}
                    className="rounded-xl border border-hielo/12 bg-white px-3 py-2.5 text-left text-sm font-medium text-hielo transition hover:border-hielo/30 hover:bg-hielo/5 active:scale-[0.99]"
                  >
                    {button.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="shrink-0 border-t border-hielo/10 bg-nieve/80 p-2.5">
              <a
                href={FAQ_CHAT_WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center rounded-xl border border-hielo/15 bg-white px-3 py-2.5 text-sm font-semibold text-hielo transition hover:border-hielo/30 hover:bg-hielo/5"
              >
                Hablar con el equipo
              </a>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openChat}
          className="chat-prompt-bubble pointer-events-auto relative z-10 max-w-[13.5rem] origin-bottom-right animate-[fade-up_0.22s_ease-out] rounded-2xl border border-hielo/12 bg-white px-3.5 py-2 text-left text-sm font-semibold leading-snug text-pizarra"
          aria-expanded={false}
          aria-haspopup="dialog"
        >
          <span className="flex items-center gap-2">
            <span className="relative mt-px flex h-2 w-2 shrink-0" aria-hidden>
              <span className="chat-live-dot absolute inline-flex h-full w-full rounded-full bg-hielo/55" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-hielo" />
            </span>
            {pickLocale(locale, FAQ_CHAT_PROMPT, "How can I help you?")}
          </span>
        </button>
      )}
    </div>
  );
}
