"use client";

import { STAMP_TYPES, STAMP_EMOJI, type StampType } from "@/lib/constants";

interface StampPickerProps {
  value: StampType;
  onChange: (v: StampType) => void;
}

export function StampPicker({ value, onChange }: StampPickerProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-stone-600">Stamp</label>
      <div className="flex flex-wrap gap-2">
        {STAMP_TYPES.map((stamp) => (
          <button
            key={stamp}
            type="button"
            onClick={() => onChange(stamp)}
            className={`
              px-3 py-2 rounded-lg text-sm border transition-all
              ${
                value === stamp
                  ? "border-stone-400 bg-stone-100 shadow-sm"
                  : "border-stone-200 hover:border-stone-300 bg-white"
              }
            `}
          >
            {STAMP_EMOJI[stamp] || "—"}{" "}
            <span className="text-xs text-stone-500">
              {stamp.replace(/_/g, " ")}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
