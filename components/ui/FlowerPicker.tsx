"use client";

import { FLOWER_TYPES, FLOWER_EMOJI, type FlowerType } from "@/lib/constants";

interface FlowerPickerProps {
  value: FlowerType;
  onChange: (v: FlowerType) => void;
}

export function FlowerPicker({ value, onChange }: FlowerPickerProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-stone-600">Flower</label>
      <div className="flex flex-wrap gap-2">
        {FLOWER_TYPES.map((flower) => (
          <button
            key={flower}
            type="button"
            onClick={() => onChange(flower)}
            className={`
              px-3 py-2 rounded-lg text-sm border transition-all
              ${
                value === flower
                  ? "border-stone-400 bg-stone-100 shadow-sm"
                  : "border-stone-200 hover:border-stone-300 bg-white"
              }
            `}
          >
            {FLOWER_EMOJI[flower] || "—"}{" "}
            <span className="text-xs text-stone-500">
              {flower.replace(/_/g, " ")}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
