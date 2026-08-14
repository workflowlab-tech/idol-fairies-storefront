"use client";

import { useState } from "react";
import type { FaqGroup } from "@/data/faq";

export default function FaqAccordion({ groups }: { groups: FaqGroup[] }) {
  const [openId, setOpenId] = useState<string | null>(groups[0]?.items[0]?.id ?? null);

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <section key={group.id} id={group.id}>
          <h2 className="mb-3 text-lg font-bold text-fairy-ink">{group.title}</h2>
          <div className="divide-y divide-fairy-pink-100 rounded-2xl border border-fairy-pink-100 bg-white">
            {group.items.map((item) => {
              const open = openId === item.id;
              return (
                <div key={item.id}>
                  <button
                    onClick={() => setOpenId(open ? null : item.id)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-fairy-ink"
                  >
                    {item.question}
                    <span className={`shrink-0 text-fairy-pink-500 transition ${open ? "rotate-45" : ""}`}>+</span>
                  </button>
                  {open && <p className="px-4 pb-4 text-sm leading-relaxed text-fairy-ink/70">{item.answer}</p>}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
