"use client";

import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import type { RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  SpotLight,
  useGLTF,
} from "@react-three/drei";
import { animate, useMotionValue } from "framer-motion";
import * as THREE from "three";

import { patchMailboxMaterials } from "./patchMailboxMaterials";
import { useParchmentTexture } from "./useParchmentTexture";

/**
 * Seal-send 3D mailbox — ACES-lit PBR materials + weighted animation curves.
 * Motion uses Framer Motion 12 (`animate`, `useMotionValue`).
 */

useGLTF.preload("/models/MailBox.glb");

function bindEnvelopeMotion(
  ref: RefObject<THREE.Group | null>,
  mv: {
    x: ReturnType<typeof useMotionValue<number>>;
    y: ReturnType<typeof useMotionValue<number>>;
    z: ReturnType<typeof useMotionValue<number>>;
    sx: ReturnType<typeof useMotionValue<number>>;
    sy: ReturnType<typeof useMotionValue<number>>;
    sz: ReturnType<typeof useMotionValue<number>>;
  },
) {
  const sync = () => {
    const o = ref.current;
    if (!o) return;
    o.position.set(mv.x.get(), mv.y.get(), mv.z.get());
    o.scale.set(mv.sx.get(), mv.sy.get(), mv.sz.get());
  };
  sync();
  const unsub = [
    mv.x.on("change", sync),
    mv.y.on("change", sync),
    mv.z.on("change", sync),
    mv.sx.on("change", sync),
    mv.sy.on("change", sync),
    mv.sz.on("change", sync),
  ];
  return () => unsub.forEach((u) => u());
}

function bindEnvelopeTilt(
  ref: RefObject<THREE.Group | null>,
  tiltRx: ReturnType<typeof useMotionValue<number>>,
  tiltRy: ReturnType<typeof useMotionValue<number>>,
  tiltRz: ReturnType<typeof useMotionValue<number>>,
) {
  const sync = () => {
    const o = ref.current;
    if (!o) return;
    o.rotation.set(tiltRx.get(), tiltRy.get(), tiltRz.get());
  };
  sync();
  const unsub = [
    tiltRx.on("change", sync),
    tiltRy.on("change", sync),
    tiltRz.on("change", sync),
  ];
  return () => unsub.forEach((u) => u());
}

function MailboxSendInner({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const gltf = useGLTF("/models/MailBox.glb");

  const cloned = useMemo(() => {
    const scene = gltf.scene.clone(true);
    patchMailboxMaterials(scene);
    return scene;
  }, [gltf]);

  const doorRef = useRef<THREE.Mesh | null>(null);
  const visorRef = useRef<THREE.Mesh | null>(null);
  const flagRef = useRef<THREE.Mesh | null>(null);

  useLayoutEffect(() => {
    cloned.updateMatrixWorld(true);
    doorRef.current = cloned.getObjectByName("FrontDoor") as THREE.Mesh | null;
    visorRef.current = cloned.getObjectByName("SlotVisor") as THREE.Mesh | null;
    flagRef.current = cloned.getObjectByName("FlagArm") as THREE.Mesh | null;
  }, [cloned]);

  const envX = useMotionValue(0);
  const envY = useMotionValue(1.28);
  const envZ = useMotionValue(2.42);
  const envSx = useMotionValue(1);
  const envSy = useMotionValue(1);
  const envSz = useMotionValue(1);

  const tiltRx = useMotionValue(0.06);
  const tiltRy = useMotionValue(-0.05);
  const tiltRz = useMotionValue(0.04);

  const doorRx = useMotionValue(0);
  const visorRx = useMotionValue(0);
  const flagRz = useMotionValue(0);

  const envelopeRef = useRef<THREE.Group>(null);
  const envelopeTiltRef = useRef<THREE.Group>(null);

  useEffect(() =>
    bindEnvelopeMotion(envelopeRef, {
      x: envX,
      y: envY,
      z: envZ,
      sx: envSx,
      sy: envSy,
      sz: envSz,
    }),
  [envX, envY, envZ, envSx, envSy, envSz]);

  useEffect(() =>
    bindEnvelopeTilt(envelopeTiltRef, tiltRx, tiltRy, tiltRz),
  [tiltRx, tiltRy, tiltRz]);

  useEffect(() => {
    const door = doorRef.current;
    const visor = visorRef.current;
    const flag = flagRef.current;
    const unsub: Array<() => void> = [];
    const syncDoor = () => {
      if (door) door.rotation.x = doorRx.get();
    };
    const syncVisor = () => {
      if (visor) visor.rotation.x = visorRx.get();
    };
    const syncFlag = () => {
      if (flag) flag.rotation.z = flagRz.get();
    };
    syncDoor();
    syncVisor();
    syncFlag();
    unsub.push(doorRx.on("change", syncDoor));
    unsub.push(visorRx.on("change", syncVisor));
    unsub.push(flagRz.on("change", syncFlag));
    return () => unsub.forEach((u) => u());
  }, [doorRx, visorRx, flagRz]);

  const parchment = useParchmentTexture();

  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    let cancelled = false;

    async function sequence() {
      await Promise.all([
        animate(envY, 0.38, {
          duration: 1.48,
          ease: [0.16, 1, 0.3, 1],
        }),
        animate(envZ, 0.62, {
          duration: 1.48,
          ease: [0.16, 1, 0.3, 1],
        }),
        animate(envX, -0.06, {
          duration: 1.48,
          ease: [0.33, 0, 0.2, 1],
        }),
        animate(tiltRy, [-0.05, 0.14, -0.03], {
          duration: 1.48,
          ease: [0.22, 1, 0.36, 1],
          times: [0, 0.52, 1],
        }),
        animate(tiltRx, [0.06, 0.1, 0.07], {
          duration: 1.48,
          ease: [0.25, 1, 0.5, 1],
          times: [0, 0.4, 1],
        }),
        animate(doorRx, -1.18, {
          delay: 0.82,
          duration: 0.62,
          ease: [0.19, 1, 0.22, 1],
        }),
        animate(visorRx, -1.02, {
          delay: 0.82,
          duration: 0.62,
          ease: [0.19, 1, 0.22, 1],
        }),
      ]);
      if (cancelled) return;

      await Promise.all([
        animate(envZ, 0.07, {
          duration: 0.92,
          ease: [0.45, 0, 0.15, 1],
        }),
        animate(envY, 0.21, {
          duration: 0.92,
          ease: [0.45, 0, 0.15, 1],
        }),
        animate(envX, 0, {
          duration: 0.92,
          ease: [0.55, 0, 0.45, 1],
        }),
        animate(envSx, 0.055, {
          duration: 0.92,
          ease: [0.55, 0.05, 0.35, 1],
        }),
        animate(envSy, 0.038, {
          duration: 0.92,
          ease: [0.55, 0.05, 0.35, 1],
        }),
        animate(envSz, 0.085, {
          duration: 0.92,
          ease: [0.55, 0.05, 0.35, 1],
        }),
        animate(tiltRy, 0, {
          duration: 0.92,
          ease: [0.55, 0, 0.45, 1],
        }),
        animate(tiltRx, 0.02, {
          duration: 0.92,
          ease: [0.55, 0, 0.45, 1],
        }),
      ]);
      if (cancelled) return;

      await Promise.all([
        animate(doorRx, 0, {
          duration: 0.52,
          ease: [0.4, 0, 0.15, 1],
        }),
        animate(visorRx, 0, {
          duration: 0.52,
          ease: [0.4, 0, 0.15, 1],
        }),
      ]);
      if (cancelled) return;

      await animate(flagRz, Math.PI / 2, {
        type: "spring",
        stiffness: 228,
        damping: 22,
        mass: 0.62,
      });
      if (cancelled) return;

      onComplete();
    }

    void sequence();

    return () => {
      cancelled = true;
    };
  }, [
    doorRx,
    envSx,
    envSy,
    envSz,
    envX,
    envY,
    envZ,
    flagRz,
    onComplete,
    tiltRx,
    tiltRy,
    visorRx,
  ]);

  return (
    <>
      <hemisphereLight
        intensity={0.55}
        color="#eef4ff"
        groundColor="#4a3428"
      />

      <ambientLight intensity={0.22} color="#ffece0" />

      <SpotLight
        castShadow
        shadow-mapSize={[1536, 1536]}
        shadow-bias={-0.00025}
        position={[1.55, 2.05, 2.25]}
        angle={0.38}
        penumbra={0.62}
        intensity={22}
        color="#ffd4aa"
      />

      <directionalLight
        castShadow
        shadow-mapSize={[1024, 1024]}
        position={[-2.8, 3.4, 1.2]}
        intensity={0.85}
        color="#ffe8d4"
      />

      <directionalLight position={[2.4, 1.2, -2.2]} intensity={0.38} color="#c8daf8" />

      <Suspense fallback={null}>
        <Environment preset="city" environmentIntensity={0.62} />
      </Suspense>

      <group position={[0.06, -0.52, 0]} scale={2.85}>
        <ContactShadows
          frames={Infinity}
          position={[0, -0.41, 0.08]}
          opacity={0.58}
          scale={13}
          blur={2.8}
          far={9}
          color="#2c1810"
        />

        <primitive object={cloned} />

        <group ref={envelopeRef}>
          <group ref={envelopeTiltRef}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.38, 0.052, 0.94]} />
              <meshPhysicalMaterial
                map={parchment}
                roughness={0.74}
                metalness={0}
                clearcoat={0.07}
                clearcoatRoughness={0.62}
                color="#fffbf7"
              />
            </mesh>
            <mesh position={[0, 0.033, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <planeGeometry args={[1.22, 0.065]} />
              <meshStandardMaterial
                transparent
                opacity={0.28}
                color="#c4a574"
                roughness={0.95}
              />
            </mesh>
          </group>
        </group>
      </group>
    </>
  );
}

export interface MailboxSendExperienceProps {
  onComplete: () => void;
}

export function MailboxSendExperience({ onComplete }: MailboxSendExperienceProps) {
  return (
    <Canvas
      className="h-[248px] w-full touch-none"
      shadows
      camera={{
        position: [1.02, 0.58, 2.02],
        fov: 44,
        near: 0.06,
        far: 52,
      }}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.06,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
      }}
      dpr={[1, 2]}
    >
      <MailboxSendInner onComplete={onComplete} />
    </Canvas>
  );
}
