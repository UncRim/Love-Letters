"use client";

import Image from "next/image";
import {
  STAMP_TYPES,
  STAMP_LABELS,
  STAMP_ART_PATH,
  MAX_STAMPS_PER_LETTER,
  type StampType,
} from "@/lib/constants";

interface StampPickerProps {
  value: StampType[];
  onChange: (next: StampType[]) => void;
}

export function StampPicker({ value, onChange }: StampPickerProps) {
  function toggle(s: StampType) {
    if (value.includes(s)) {
      onChange(value.filter((x) => x !== s));
      return;
    }
    if (value.length < MAX_STAMPS_PER_LETTER) {
      onChange([...value, s]);
      return;
    }
    onChange([...value.slice(1), s]);
  }

  return (
    <section>
      <p className="text-[10px] tracking-[0.1em] uppercase text-stone-500 mb-[9px]">
        Stamps
      </p>
      <p className="text-[10px] text-stone-500 mb-2 leading-snug">
        Up to {MAX_STAMPS_PER_LETTER} stamps · {value.length} selected
      </p>
      <div className="grid grid-cols-4 gap-[5px] max-h-[min(320px,52vh)] overflow-y-auto pr-1 stamp-picker-scroll">
        {STAMP_TYPES.map((s) => (
          <div
            key={s}
            onClick={() => toggle(s)}
            title={STAMP_LABELS[s]}
            className="aspect-square rounded-[5px] flex items-center justify-center cursor-pointer transition-all overflow-hidden"
            style={{
              border: `1.5px solid ${
                value.includes(s) ? "#b8933a" : "transparent"
              }`,
              background: value.includes(s)
                ? "rgba(184,147,58,0.08)"
                : "rgba(0,0,0,0.03)",
            }}
          >
            <Image
              src={STAMP_ART_PATH[s]}
              alt=""
              width={40}
              height={40}
              className="object-contain w-[78%] h-[78%]"
              draggable={false}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
