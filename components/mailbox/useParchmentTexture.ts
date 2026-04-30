import { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";

/**
 * Warm ivory envelope surface — ruled grain + subtle vignette (client-only).
 */
export function useParchmentTexture(): THREE.CanvasTexture {
  const tex = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const grd = ctx.createLinearGradient(0, 0, 512, 512);
      grd.addColorStop(0, "#fefbf4");
      grd.addColorStop(0.45, "#faf5ea");
      grd.addColorStop(1, "#f3e9d8");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, 512, 512);

      ctx.strokeStyle = "rgba(155, 125, 95, 0.085)";
      ctx.lineWidth = 1;
      for (let y = 36; y < 498; y += 22) {
        ctx.beginPath();
        ctx.moveTo(34 + (y % 44) * 0.03, y);
        ctx.lineTo(478, y + Math.sin(y * 0.02) * 0.8);
        ctx.stroke();
      }

      ctx.strokeStyle = "rgba(185, 155, 118, 0.045)";
      ctx.lineWidth = 1.2;
      for (let y = 47; y < 498; y += 22) {
        ctx.beginPath();
        ctx.moveTo(38, y);
        ctx.lineTo(474, y);
        ctx.stroke();
      }

      const rg = ctx.createRadialGradient(
        256,
        220,
        40,
        256,
        256,
        320,
      );
      rg.addColorStop(0, "rgba(255,255,255,0)");
      rg.addColorStop(1, "rgba(180, 145, 105, 0.07)");
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, 512, 512);

      ctx.fillStyle = "rgba(240, 225, 200, 0.06)";
      ctx.fillRect(0, 0, 512, 512);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 8;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }, []);

  useLayoutEffect(() => {
    return () => {
      tex.dispose();
    };
  }, [tex]);

  return tex;
}
