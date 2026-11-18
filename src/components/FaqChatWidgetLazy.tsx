"use client";

import dynamic from "next/dynamic";

const FaqChatWidget = dynamic(
  () => import("@/components/FaqChatWidget").then((mod) => mod.FaqChatWidget),
  { ssr: false },
);

export function FaqChatWidgetLazy() {
  return <FaqChatWidget />;
}
