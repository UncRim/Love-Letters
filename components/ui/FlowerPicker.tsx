"use client";

import Image from "next/image";
import {
  FLOWER_CATEGORIES,
  FLOWER_IMAGE,
  type FlowerType,
} from "@/lib/constants";

interface FlowerPickerProps {
  value: FlowerType;
  onChange: (v: FlowerType) => void;
}

export function FlowerPicker({ value, onChange }: FlowerPickerProps) {
  return (
    <section>
      <p className="text-[10px] tracking-[0.1em] uppercase text-stone-500 mb-3">
        Pressed Flower
      </p>
      <div className="space-y-3 max-h-[min(420px,65vh)] overflow-y-auto pr-1 flower-picker-scroll">
        {FLOWER_CATEGORIES.map((cat) => (
          <div key={cat.label}>
            <div className="flex items-center gap-2 mb-1.5">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: cat.color }}
              />
              <span className="text-[9px] tracking-[0.15em] uppercase text-stone-400 font-medium">
                {cat.label}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-[5px]">
              {cat.types.map((f) => (
                <div
                  key={f}
                  onClick={() => onChange(f)}
                  className="aspect-square rounded-[6px] flex items-center justify-center cursor-pointer transition-all p-1 hover:scale-105"
                  style={{
                    border: `1.5px solid ${
                      value === f ? "#b8933a" : "transparent"
                    }`,
                    background:
                      value === f
                        ? "rgba(184,147,58,0.10)"
                        : "rgba(0,0,0,0.03)",
                    boxShadow:
                      value === f
                        ? "0 0 8px rgba(184,147,58,0.2)"
                        : "none",
                  }}
                >
                  <Image
                    src={FLOWER_IMAGE[f]}
                    alt={f.replace(/_/g, " ")}
                    width={60}
                    height={60}
                    className="object-contain w-full h-full"
                    draggable={false}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
