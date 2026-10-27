"use client";
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import { MathUtils, type Group, type Mesh } from "three";

export interface UniverseNode {
  id: string;
  color: string;
  /** 0 = categories ring, 1 = paths ring */
  ring: 0 | 1;
  /** position inside its ring */
  index: number;
  count: number;
}

const RING = [
  { radius: 2.7, speed: 0.16, tilt: [0.35, 0, 0.12] as const },
  { radius: 4.1, speed: -0.1, tilt: [-0.28, 0, -0.2] as const },
];

function Planet({ node, active, onHover, onSelect }: { node: UniverseNode; active: boolean; onHover: (id: string | null) => void; onSelect: (id: string) => void }) {
  const mesh = useRef<Mesh>(null);
  const r = RING[node.ring].radius;
  const phi = (node.index / node.count) * Math.PI * 2 + node.ring * 0.7;
  useFrame(() => {
    const m = mesh.current;
    if (!m) return;
    const s = MathUtils.lerp(m.scale.x, active ? 1.9 : 1, 0.14);
    m.scale.setScalar(s);
  });
  return (
    <mesh
      ref={mesh}
      position={[Math.cos(phi) * r, 0, Math.sin(phi) * r]}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
        onHover(node.id);
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
        onHover(null);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.id);
      }}
    >
      <sphereGeometry args={[node.ring === 0 ? 0.24 : 0.2, 24, 24]} />
      <meshStandardMaterial color={node.color} emissive={node.color} emissiveIntensity={active ? 1.6 : 0.55} roughness={0.35} />
    </mesh>
  );
}

function Universe({ nodes, activeId, onHover, onSelect }: { nodes: UniverseNode[]; activeId: string | null; onHover: (id: string | null) => void; onSelect: (id: string) => void }) {
  const rings = [useRef<Group>(null), useRef<Group>(null)];
  const core = useRef<Mesh>(null);
  const sway = useRef({ x: 0, y: 0 });
  const root = useRef<Group>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const on = (e: PointerEvent) => {
      sway.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      sway.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", on, { passive: true });
    return () => window.removeEventListener("pointermove", on);
  }, []);

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05);
    // hovering a node slows the system so it is easy to target
    const slow = activeId ? 0.25 : 1;
    rings.forEach((r, i) => {
      if (r.current) r.current.rotation.y += d * RING[i].speed * slow;
    });
    if (core.current) {
      core.current.rotation.y += d * 0.3;
      core.current.rotation.x += d * 0.15;
    }
    if (root.current) {
      root.current.rotation.y = MathUtils.lerp(root.current.rotation.y, sway.current.x * 0.3, 0.04);
      root.current.rotation.x = MathUtils.lerp(root.current.rotation.x, sway.current.y * 0.2, 0.04);
    }
  });

  return (
    <group ref={root}>
      <mesh ref={core}>
        <icosahedronGeometry args={[0.95, 1]} />
        <meshStandardMaterial color="#9a85ff" emissive="#5233e8" emissiveIntensity={1.2} wireframe />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshBasicMaterial color="#c6f032" />
      </mesh>
      {RING.map((cfg, i) => (
        <group key={i} rotation={[cfg.tilt[0], cfg.tilt[1], cfg.tilt[2]]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[cfg.radius, 0.008, 8, 160]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.28} />
          </mesh>
          <group ref={rings[i]}>
            {nodes
              .filter((n) => n.ring === i)
              .map((n) => (
                <Planet key={n.id} node={n} active={activeId === n.id} onHover={onHover} onSelect={onSelect} />
              ))}
          </group>
        </group>
      ))}
      <Sparkles count={50} scale={[11, 7, 8]} size={2} speed={0.2} color="#ffffff" opacity={0.6} />
    </group>
  );
}

export default function UniverseScene({ nodes, activeId, visible, onHover, onSelect }: { nodes: UniverseNode[]; activeId: string | null; visible: boolean; onHover: (id: string | null) => void; onSelect: (id: string) => void }) {
  const stable = useMemo(() => nodes, [nodes]);
  return (
    <Canvas
      frameloop={visible ? "always" : "never"}
      dpr={[1, 1.5]}
      camera={{ position: [0, 3.2, 9.5], fov: 44 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      aria-hidden
    >
      <ambientLight intensity={0.8} />
      <pointLight position={[0, 0, 0]} intensity={40} color="#c6f032" />
      <directionalLight position={[5, 6, 5]} intensity={1.4} />
      <Universe nodes={stable} activeId={activeId} onHover={onHover} onSelect={onSelect} />
    </Canvas>
  );
}
