"use client";

import {
  STAMP_TYPES,
  STAMP_EMOJI,
  STAMP_LABELS,
  type StampType,
} from "@/lib/constants";

interface StampPickerProps {
  value: StampType | null;
  onChange: (v: StampType) => void;
}

export function StampPicker({ value, onChange }: StampPickerProps) {
  return (
    <section>
      <p className="text-[10px] tracking-[0.1em] uppercase text-stone-500 mb-[9px]">
        Stamp
      </p>
      <div className="grid grid-cols-4 gap-[5px]">
        {STAMP_TYPES.map((s) => (
          <div
            key={s}
            onClick={() => onChange(s)}
            title={STAMP_LABELS[s]}
            className="aspect-square rounded-[5px] flex items-center justify-center text-[17px] cursor-pointer transition-all"
            style={{
              border: `1.5px solid ${
                value === s ? "#b8933a" : "transparent"
              }`,
              background:
                value === s
                  ? "rgba(184,147,58,0.08)"
                  : "rgba(0,0,0,0.03)",
            }}
          >
            {STAMP_EMOJI[s]}
          </div>
        ))}
      </div>
    </section>
  );
}
