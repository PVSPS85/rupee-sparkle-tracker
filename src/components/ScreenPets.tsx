import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

type PetType = 'dog' | 'cat' | 'monkey' | 'lion' | 'peacock';
type Direction = 'left' | 'right';
type Edge = 'top' | 'bottom' | 'left' | 'right';

interface Pet {
  id: PetType;
  x: number;
  y: number;
  direction: Direction;
  edge: Edge;
  speed: number;
  frame: number;
}

const petEmojis: Record<PetType, string> = {
  dog: '🐕',
  cat: '🐈',
  monkey: '🐒',
  lion: '🦁',
  peacock: '🦚',
};

const ScreenPets = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  const initializePets = useCallback(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    setDimensions({ width: w, height: h });

    const edges: Edge[] = ['top', 'bottom', 'left', 'right'];
    const petTypes: PetType[] = ['dog', 'cat', 'monkey', 'lion', 'peacock'];
    
    const newPets: Pet[] = petTypes.map((type, index) => {
      const edge = edges[index % edges.length];
      const direction: Direction = Math.random() > 0.5 ? 'left' : 'right';
      
      let x = 0, y = 0;
      
      switch (edge) {
        case 'top':
          x = Math.random() * (w - 60) + 30;
          y = 10;
          break;
        case 'bottom':
          x = Math.random() * (w - 60) + 30;
          y = h - 50;
          break;
        case 'left':
          x = 10;
          y = Math.random() * (h - 100) + 50;
          break;
        case 'right':
          x = w - 50;
          y = Math.random() * (h - 100) + 50;
          break;
      }

      return {
        id: type,
        x,
        y,
        direction,
        edge,
        speed: 0.5 + Math.random() * 0.5,
        frame: 0,
      };
    });

    setPets(newPets);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    
    initializePets();
    window.addEventListener('resize', initializePets);
    return () => window.removeEventListener('resize', initializePets);
  }, [initializePets, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion || pets.length === 0) return;

    const interval = setInterval(() => {
      setPets(currentPets => 
        currentPets.map(pet => {
          let { x, y, direction, edge, speed, frame } = pet;
          const padding = 40;
          
          // Move based on edge
          switch (edge) {
            case 'top':
            case 'bottom':
              if (direction === 'right') {
                x += speed;
                if (x >= dimensions.width - padding) {
                  direction = 'left';
                }
              } else {
                x -= speed;
                if (x <= padding) {
                  direction = 'right';
                }
              }
              break;
            case 'left':
            case 'right':
              if (direction === 'right') {
                y += speed;
                if (y >= dimensions.height - padding - 40) {
                  direction = 'left';
                }
              } else {
                y -= speed;
                if (y <= padding + 40) {
                  direction = 'right';
                }
              }
              break;
          }

          // Animate walking frame
          frame = (frame + 1) % 20;

          return { ...pet, x, y, direction, frame };
        })
      );
    }, 16);

    return () => clearInterval(interval);
  }, [pets.length, dimensions, prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50" aria-hidden="true">
      {pets.map((pet) => {
        const isWalking = pet.frame % 10 < 5;
        const flipX = (pet.edge === 'top' || pet.edge === 'bottom') 
          ? pet.direction === 'left' 
          : pet.direction === 'left';
        
        return (
          <motion.div
            key={pet.id}
            className="absolute select-none"
            style={{
              left: pet.x,
              top: pet.y,
              transform: `scaleX(${flipX ? -1 : 1})`,
            }}
            animate={{
              y: isWalking ? -2 : 0,
            }}
            transition={{
              duration: 0.15,
              ease: "easeInOut",
            }}
          >
            <div 
              className="text-2xl drop-shadow-lg"
              style={{
                filter: 'drop-shadow(0 0 8px rgba(255, 200, 50, 0.6))',
              }}
            >
              {petEmojis[pet.id]}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ScreenPets;
