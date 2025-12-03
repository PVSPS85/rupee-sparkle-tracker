import { useEffect, useRef, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  layer: number;
  sineOffset: number;
  sineSpeed: number;
}

interface CanvasParticlesProps {
  enabled?: boolean;
  particleCount?: number;
  className?: string;
}

const CanvasParticles = ({ 
  enabled = true, 
  particleCount = 60,
  className = "" 
}: CanvasParticlesProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0 });

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  // Adjust particle count based on device
  const getAdjustedParticleCount = useCallback(() => {
    if (typeof window === 'undefined') return particleCount;
    const isMobile = window.innerWidth < 768;
    const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
    
    if (isMobile || isLowEnd) return Math.floor(particleCount * 0.5);
    return particleCount * 1.5; // More particles for desktop
  }, [particleCount]);

  const createParticle = useCallback((canvas: HTMLCanvasElement, existingY?: number): Particle => {
    const layer = Math.random() < 0.33 ? 0 : Math.random() < 0.5 ? 1 : 2;
    const layerMultiplier = [0.5, 0.75, 1][layer];
    
    return {
      x: Math.random() * canvas.width,
      y: existingY !== undefined ? existingY : Math.random() * canvas.height - canvas.height,
      size: (12 + Math.random() * 16) * layerMultiplier,
      speedY: (0.5 + Math.random() * 1.5) * layerMultiplier,
      speedX: 0,
      opacity: (0.3 + Math.random() * 0.5) * layerMultiplier,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      layer,
      sineOffset: Math.random() * Math.PI * 2,
      sineSpeed: 0.02 + Math.random() * 0.02,
    };
  }, []);

  const initParticles = useCallback((canvas: HTMLCanvasElement) => {
    const count = getAdjustedParticleCount();
    particlesRef.current = Array.from({ length: count }, () => 
      createParticle(canvas, Math.random() * canvas.height)
    );
  }, [createParticle, getAdjustedParticleCount]);

  useEffect(() => {
    if (!enabled || prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
      initParticles(canvas);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    let lastTime = 0;
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;

    const drawRupeeSymbol = (
      x: number, 
      y: number, 
      size: number, 
      rotation: number, 
      opacity: number,
      layer: number
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      
      // Bright gold glow effect - stronger for front layers
      const glowIntensity = [15, 25, 35][layer];
      ctx.shadowBlur = glowIntensity;
      ctx.shadowColor = `rgba(255, 215, 0, ${opacity})`;
      
      // Draw rupee symbol
      ctx.font = `bold ${size}px 'Inter', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Bright gold gradient fill - shining effect
      const gradient = ctx.createLinearGradient(-size/2, -size/2, size/2, size/2);
      gradient.addColorStop(0, `rgba(255, 223, 0, ${opacity})`);      // Bright yellow gold
      gradient.addColorStop(0.3, `rgba(255, 200, 50, ${opacity})`);   // Golden
      gradient.addColorStop(0.5, `rgba(255, 255, 150, ${opacity})`);  // Bright shine
      gradient.addColorStop(0.7, `rgba(255, 180, 0, ${opacity})`);    // Deep gold
      gradient.addColorStop(1, `rgba(218, 165, 32, ${opacity})`);     // Goldenrod
      
      ctx.fillStyle = gradient;
      ctx.fillText('₹', 0, 0);
      
      // Add extra shine highlight
      ctx.shadowBlur = glowIntensity * 1.5;
      ctx.shadowColor = `rgba(255, 255, 200, ${opacity * 0.5})`;
      
      ctx.restore();
    };

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      
      if (deltaTime >= frameInterval) {
        lastTime = currentTime - (deltaTime % frameInterval);
        
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        
        // Sort particles by layer for proper depth rendering
        const sortedParticles = [...particlesRef.current].sort((a, b) => a.layer - b.layer);
        
        sortedParticles.forEach((particle, index) => {
          // Update position
          particle.y += particle.speedY;
          particle.sineOffset += particle.sineSpeed;
          particle.x += Math.sin(particle.sineOffset) * 0.5;
          particle.rotation += particle.rotationSpeed;
          
          // Fade out near bottom
          const fadeStart = window.innerHeight * 0.7;
          if (particle.y > fadeStart) {
            const fadeProgress = (particle.y - fadeStart) / (window.innerHeight * 0.3);
            particle.opacity = Math.max(0, particle.opacity * (1 - fadeProgress * 0.02));
          }
          
          // Reset particle when it goes off screen
          if (particle.y > window.innerHeight + 50 || particle.opacity <= 0) {
            const newParticle = createParticle(canvas, -50);
            particlesRef.current[particlesRef.current.indexOf(particle)] = newParticle;
            return;
          }
          
          drawRupeeSymbol(
            particle.x,
            particle.y,
            particle.size,
            particle.rotation,
            particle.opacity,
            particle.layer
          );
        });
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [enabled, prefersReducedMotion, createParticle, initParticles]);

  if (!enabled || prefersReducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      aria-hidden="true"
    />
  );
};

export default CanvasParticles;
