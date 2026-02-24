import React, { useEffect, useRef } from 'react';

/**
 * @fileoverview ParticleBackground — Animated Neural-Network Canvas
 *
 * Renders a full-viewport canvas of drifting nodes connected by proximity-based
 * lines, evoking the neural-network / data-center infrastructure theme of the site.
 *
 * Performance notes:
 * - Uses requestAnimationFrame, not setInterval
 * - Canvas is fixed so it doesn't repaint on scroll
 * - ResizeObserver re-sizes the canvas without thrashing
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulsePhase: number;   // current phase in [0, 2π]
  pulseSpeed: number;   // radians per frame
}

const PARTICLE_COUNT   = 38;
const CONNECTION_DIST  = 145;  // px — max distance to draw a line
const BASE_SPEED       = 0.28; // px per frame

export const ParticleBackground: React.FC = () => {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef       = useRef<number>(0);
  const dimsRef      = useRef({ w: 0, h: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ── initialise particles scattered across the viewport ──────────────
    const initParticles = (w: number, h: number) => {
      particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
        x:          Math.random() * w,
        y:          Math.random() * h,
        vx:         (Math.random() - 0.5) * BASE_SPEED * 2,
        vy:         (Math.random() - 0.5) * BASE_SPEED * 2,
        radius:     Math.random() * 1.6 + 0.8,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.012 + Math.random() * 0.018,
      }));
    };

    // ── resize handling ──────────────────────────────────────────────────
    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width  = w;
      canvas.height = h;
      dimsRef.current = { w, h };
      initParticles(w, h);
    };

    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(document.documentElement);

    // ── render loop ──────────────────────────────────────────────────────
    const animate = () => {
      const { w, h } = dimsRef.current;
      ctx.clearRect(0, 0, w, h);

      const ps = particlesRef.current;

      // Update + draw each node
      for (const p of ps) {
        p.x += p.vx;
        p.y += p.vy;
        p.pulsePhase += p.pulseSpeed;

        // Wrap edges
        if (p.x < -10) p.x += w + 20;
        if (p.x > w + 10) p.x -= w + 20;
        if (p.y < -10) p.y += h + 20;
        if (p.y > h + 10) p.y -= h + 20;

        const pulse  = (Math.sin(p.pulsePhase) + 1) / 2; // 0 → 1
        const alpha  = 0.18 + pulse * 0.38;
        const radius = p.radius + pulse * 0.7;

        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        // Alternate between cool blue and cyan-teal for visual variety
        const hue = 200 + pulse * 20;
        ctx.fillStyle = `hsla(${hue}, 80%, 65%, ${alpha})`;
        ctx.fill();
      }

      // Draw connections between nearby pairs
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const dx   = ps[i].x - ps[j].x;
          const dy   = ps[i].y - ps[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.13;
            ctx.beginPath();
            ctx.moveTo(ps[i].x, ps[i].y);
            ctx.lineTo(ps[j].x, ps[j].y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
            ctx.lineWidth   = 0.8;
            ctx.stroke();
          }
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      ro.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none print:hidden"
      style={{ zIndex: 0, opacity: 0.55 }}
      aria-hidden="true"
    />
  );
};
