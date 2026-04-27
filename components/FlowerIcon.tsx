import Image from "next/image";
import { FLOWER_IMAGE, type FlowerType } from "@/lib/constants";

interface FlowerIconProps {
  type: FlowerType;
  size?: number;
}

export function FlowerIcon({ type, size = 24 }: FlowerIconProps) {
  const src = FLOWER_IMAGE[type];

  if (!src) return null;

  return (
    <Image
      src={src}
      alt={type.replace(/_/g, " ")}
      width={size}
      height={size}
      className="object-contain"
      style={{ width: size, height: size }}
      draggable={false}
    />
  );
}
