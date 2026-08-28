"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function MotionGraphicsCanvas() {
  const svgRef = useRef<SVGSVGElement>(null);
  const blob1Ref = useRef<SVGPathElement>(null);
  const blob2Ref = useRef<SVGPathElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // 1. GSAP Timeline Morphing Animation for SVG liquid background blobs
    if (blob1Ref.current && blob2Ref.current) {
      const tl = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: "sine.inOut", duration: 8 } });

      tl.to(blob1Ref.current, {
        attr: {
          d: "M150,30 Q280,70 250,220 Q200,340 80,280 Q-40,200 40,90 Z"
        },
        duration: 7,
      }).to(blob1Ref.current, {
        attr: {
          d: "M180,40 Q310,120 220,260 Q160,380 50,300 Q-20,180 70,60 Z"
        },
        duration: 8,
      });

      gsap.to(blob2Ref.current, {
        rotation: 360,
        transformOrigin: "center center",
        duration: 25,
        repeat: -1,
        ease: "none"
      });
    }

    // 2. Kinetic Floating Particles Engine (Optimized for Mobile)
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const isMobile = width < 768;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Particle kinetics class
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      maxAlpha: number;
      color: string;
      phase: number;
    }

    const colors = ["#F59E0B", "#8B5CF6", "#3B82F6", "#10B981"];
    const particleCount = isMobile ? 12 : 35;
    const particles: Particle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * (isMobile ? 0.25 : 0.4),
      vy: (Math.random() - 0.5) * (isMobile ? 0.25 : 0.4),
      radius: Math.random() * (isMobile ? 1.8 : 2.5) + 1,
      alpha: Math.random() * 0.5 + 0.1,
      maxAlpha: Math.random() * 0.5 + 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
      phase: Math.random() * Math.PI * 2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.phase += 0.02;
        p.alpha = (Math.sin(p.phase) + 1) * 0.5 * p.maxAlpha;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        
        // Skip expensive shadowBlur on mobile devices for 60fps scrolling
        if (!isMobile) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color;
        }
        ctx.fill();
        if (!isMobile) {
          ctx.shadowBlur = 0;
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-40 dark:opacity-50 transition-opacity duration-700">
      {/* Morphing Kinetic SVG Shapes */}
      <svg
        ref={svgRef}
        className="absolute top-[-10%] right-[-10%] w-[320px] h-[320px] sm:w-[800px] sm:h-[800px] opacity-20 sm:opacity-25 filter blur-2xl sm:blur-3xl transform-gpu"
        viewBox="0 0 400 400"
      >
        <defs>
          <linearGradient id="blobGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="blobGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <path
          ref={blob1Ref}
          fill="url(#blobGrad1)"
          d="M200,50 Q320,100 280,240 Q220,360 100,300 Q-20,220 50,110 Z"
        />
        <path
          ref={blob2Ref}
          fill="url(#blobGrad2)"
          d="M180,60 Q300,140 240,270 Q160,370 70,290 Q0,210 60,100 Z"
        />
      </svg>

      {/* Particle Canvas Kinetic System */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full transform-gpu" />
    </div>
  );
}
