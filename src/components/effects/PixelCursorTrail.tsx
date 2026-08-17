"use client";

import type React from "react";
import { useEffect, useRef } from "react";
import type { Theme } from "@/types";

interface PixelParticle {
  x: number;
  y: number;
  size: number;
  alpha: number;
  decay: number;
  vx: number;
  vy: number;
}

interface PixelCursorTrailProps {
  theme: Theme;
  glowMode: boolean;
}

export const PixelCursorTrail: React.FC<PixelCursorTrailProps> = ({ theme, glowMode }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<PixelParticle[]>([]);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let width = canvas.width;
    let height = canvas.height;

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      width = canvas.width;
      height = canvas.height;
    };

    window.addEventListener("resize", handleResize);

    const spawnPixel = (x: number, y: number, spread: number) => {
      const offsetX = (Math.random() - 0.5) * spread;
      const offsetY = (Math.random() - 0.5) * spread;
      const size = Math.floor(Math.random() * 5) + 8;
      particlesRef.current.push({
        x: x + offsetX,
        y: y + offsetY,
        size,
        alpha: 0.9,
        decay: Math.random() * 0.012 + 0.01,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4 + 0.15,
      });
    };

    const handlePointerMove = (e: PointerEvent) => {
      const currentX = e.clientX;
      const currentY = e.clientY;

      if (lastPosRef.current) {
        const dx = currentX - lastPosRef.current.x;
        const dy = currentY - lastPosRef.current.y;
        const dist = Math.hypot(dx, dy);
        const steps = Math.min(Math.floor(dist / 8), 4);

        for (let i = 0; i <= steps; i++) {
          const t = steps === 0 ? 1 : i / steps;
          const interpX = lastPosRef.current.x + dx * t;
          const interpY = lastPosRef.current.y + dy * t;
          spawnPixel(interpX, interpY, 6);
        }
      } else {
        spawnPixel(currentX, currentY, 4);
      }

      lastPosRef.current = { x: currentX, y: currentY };

      if (!animFrameRef.current) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    const handlePointerLeave = () => {
      lastPosRef.current = null;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.fillStyle = theme.cellColor;
        ctx.globalAlpha = Math.max(0, p.alpha);

        if (glowMode) {
          ctx.shadowColor = theme.cellColor;
          ctx.shadowBlur = 10;
        }

        const currentSize = p.size * (0.4 + 0.6 * p.alpha);
        ctx.fillRect(
          Math.round(p.x - currentSize / 2),
          Math.round(p.y - currentSize / 2),
          Math.round(currentSize),
          Math.round(currentSize),
        );
        ctx.restore();
      }

      if (particles.length > 0) {
        animFrameRef.current = requestAnimationFrame(render);
      } else {
        animFrameRef.current = null;
      }
    };

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [theme, glowMode]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      tabIndex={-1}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 999,
      }}
    />
  );
};

export default PixelCursorTrail;
