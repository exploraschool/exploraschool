"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

export type GlassSelectOption<T extends string> = {
  value: T;
  label: string;
};

type GlassSelectProps<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  options: GlassSelectOption<T>[];
  labelledBy: string;
  title: string;
  closeLabel: string;
  compact?: boolean;
};

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 text-oro-light transition duration-200 ${open ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.25}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

function splitCountLabel(label: string) {
  const match = label.match(/^(\d+)\s+(.+)$/);
  if (!match) return null;
  return { count: match[1], rest: match[2] };
}

export function GlassSelect<T extends string>({
  value,
  onChange,
  options,
  labelledBy,
  title,
  closeLabel,
  compact = false,
}: GlassSelectProps<T>) {
  const listId = useId();
  const titleId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const selected = options.find((option) => option.value === value) ?? options[0];
  const counted = options.every((option) => splitCountLabel(option.label));
  const useTiles = counted && options.length >= 4;

  useEffect(() => {
    setMounted(true);
  }, []);

  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;

    const selectedButton = dialogRef.current?.querySelector<HTMLButtonElement>('[aria-selected="true"]');
    selectedButton?.focus();

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target) || dialogRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        buttonRef.current?.focus();
        return;
      }

      const index = options.findIndex((option) => option.value === value);
      const cols = useTiles ? 2 : 1;
      let nextIndex = index;

      if (event.key === "ArrowDown") nextIndex = Math.min(index + cols, options.length - 1);
      if (event.key === "ArrowUp") nextIndex = Math.max(index - cols, 0);
      if (event.key === "ArrowRight" && useTiles) nextIndex = Math.min(index + 1, options.length - 1);
      if (event.key === "ArrowLeft" && useTiles) nextIndex = Math.max(index - 1, 0);
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = options.length - 1;

      if (nextIndex !== index) {
        event.preventDefault();
        const next = options[nextIndex];
        if (next) onChange(next.value);
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, options, value, onChange, useTiles]);

  function close() {
    setOpen(false);
    buttonRef.current?.focus();
  }

  function choose(next: T) {
    onChange(next);
    close();
  }

  const overlay =
    open && mounted
      ? createPortal(
          <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6">
            <button
              type="button"
              className="absolute inset-0 bg-pizarra/55 backdrop-blur-md sm:bg-pizarra/50"
              aria-label={closeLabel}
              onClick={close}
            />
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="glass-select-window relative z-[1] w-full max-w-full rounded-t-3xl pb-[max(1.15rem,env(safe-area-inset-bottom,0px))] sm:max-w-[26rem] sm:rounded-3xl sm:pb-6"
            >
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/25 sm:hidden" aria-hidden />

              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p id={titleId} className="text-xs font-bold uppercase tracking-[0.18em] text-oro-light">
                    {title}
                  </p>
                  {selected ? (
                    <p className="mt-1 font-display text-lg font-semibold leading-tight text-nieve">
                      {selected.label}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={close}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-nieve/80 transition hover:border-white/30 hover:bg-white/16 hover:text-nieve"
                  aria-label={closeLabel}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <ul
                id={listId}
                role="listbox"
                aria-labelledby={labelledBy}
                className={
                  useTiles
                    ? "grid grid-cols-2 gap-2"
                    : "grid gap-1.5"
                }
              >
                {options.map((option) => {
                  const active = option.value === value;
                  const parts = splitCountLabel(option.label);

                  if (useTiles && parts) {
                    return (
                      <li key={option.value} role="presentation">
                        <button
                          type="button"
                          role="option"
                          aria-selected={active}
                          onClick={() => choose(option.value)}
                          className={`glass-select-tile ${active ? "is-active" : ""}`}
                        >
                          <span className="font-display text-[1.65rem] font-semibold leading-none tracking-tight">
                            {parts.count}
                          </span>
                          <span className="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-nieve/75">
                            {parts.rest}
                          </span>
                          {active ? <CheckIcon className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-oro-light" /> : null}
                        </button>
                      </li>
                    );
                  }

                  return (
                    <li key={option.value} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={active}
                        onClick={() => choose(option.value)}
                        className={`glass-select-row ${active ? "is-active" : ""}`}
                      >
                        {option.label}
                        {active ? <CheckIcon className="h-4 w-4 shrink-0 text-oro-light" /> : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={labelledBy}
        onClick={() => setOpen((current) => !current)}
        className={`flex w-full items-center justify-between rounded-full border text-nieve shadow-[inset_0_1px_0_rgb(255_255_255_/_0.08)] backdrop-blur-md transition ${
          compact
            ? "h-10 gap-1.5 px-3 text-[0.8rem] font-medium sm:h-11 sm:gap-2 sm:px-4 sm:text-sm"
            : "h-11 gap-2 px-4 text-sm font-medium"
        } ${
          open
            ? "border-oro-light/45 bg-white/15"
            : "border-white/18 bg-white/10 hover:border-white/30 hover:bg-white/14"
        }`}
      >
        <span className="min-w-0 truncate">{selected?.label}</span>
        <Chevron open={open} />
      </button>
      {overlay}
    </>
  );
}

function CheckIcon({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}
