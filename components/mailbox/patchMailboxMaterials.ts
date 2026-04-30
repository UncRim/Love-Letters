import * as THREE from "three";

/** Charcoal iron with cold specular (not flat black). */
const CAST_IRON = new THREE.Color("#12161d");
const CAST_IRON_EMISSIVE = new THREE.Color("#080a0d");

/** Warm burnished brass — body & large trim. */
const BRASS_PRIMARY = new THREE.Color("#d1b472");

/** Slightly tighter specular on screws & hinge pins. */
const BRASS_HARDWARE = new THREE.Color("#bea46a");

/** Painted flag / enamel over metal (satin, low metal). */
const OXBLOOD = new THREE.Color("#6e2228");
const OXBLOOD_EMISSIVE = new THREE.Color("#1a0608");

/** Slot & keyhole recess (gunmetal). */
const DARK_METAL = new THREE.Color("#1e242c");
const DARK_METAL_EMISSIVE = new THREE.Color("#050608");

function applyEnvStrength(m: THREE.MeshStandardMaterial, v: number) {
  const mat = m as THREE.MeshStandardMaterial & {
    envMapIntensity?: number;
  };
  mat.envMapIntensity = v;
}

/**
 * Cinema-grade mailbox palette: layered brass vs iron vs painted flag vs recessed metal.
 * Uses `.clone()` so UV maps / normals from the GLB stay intact.
 */
export function patchMailboxMaterials(root: THREE.Object3D): void {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    const src = mesh.material;
    const list = Array.isArray(src) ? src : [src];

    const mapped = list.map((orig) => {
      if (!(orig instanceof THREE.MeshStandardMaterial)) {
        return orig;
      }

      const m = orig.clone();
      const matName = orig.name ?? "";

      const tinyHardware =
        mesh.name.startsWith("Screw") || mesh.name === "Hinge";

      if (mesh.name === "FlagArm" || mesh.name === "FlagMedallion") {
        m.color.copy(OXBLOOD);
        m.metalness = 0.14;
        m.roughness = 0.58;
        m.emissive.copy(OXBLOOD_EMISSIVE);
        m.emissiveIntensity = 0.06;
        applyEnvStrength(m, 0.65);
      } else if (matName === "CastIron") {
        m.color.copy(CAST_IRON);
        m.metalness = 0.78;
        m.roughness = 0.36;
        m.emissive.copy(CAST_IRON_EMISSIVE);
        m.emissiveIntensity = 0.04;
        applyEnvStrength(m, 1.15);
      } else if (matName === "DarkMetal") {
        m.color.copy(DARK_METAL);
        m.metalness = 0.82;
        m.roughness = 0.32;
        m.emissive.copy(DARK_METAL_EMISSIVE);
        m.emissiveIntensity = 0.03;
        applyEnvStrength(m, 1.35);
      } else if (matName === "Brass") {
        if (tinyHardware) {
          m.color.copy(BRASS_HARDWARE);
          m.metalness = 0.62;
          m.roughness = 0.34;
          applyEnvStrength(m, 1.05);
        } else if (
          mesh.name === "LetterSlotHood" ||
          mesh.name === "SlotVisor"
        ) {
          m.color.copy(BRASS_PRIMARY);
          m.metalness = 0.58;
          m.roughness = 0.26;
          applyEnvStrength(m, 1.35);
        } else {
          m.color.copy(BRASS_PRIMARY);
          m.metalness = 0.54;
          m.roughness = 0.3;
          applyEnvStrength(m, 1.22);
        }
      }

      m.needsUpdate = true;
      return m;
    });

    mesh.material = Array.isArray(src) ? mapped : mapped[0];
  });
}
