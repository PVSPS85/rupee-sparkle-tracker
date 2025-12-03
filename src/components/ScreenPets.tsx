import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

type PetType = 'dog' | 'cat' | 'monkey' | 'lion' | 'peacock';
type Direction = 'left' | 'right';
type Edge = 'top' | 'bottom' | 'left' | 'right';
type Reaction = 'none' | 'jump' | 'spin' | 'runaway' | 'hearts';

interface Pet {
  id: PetType;
  x: number;
  y: number;
  direction: Direction;
  edge: Edge;
  speed: number;
  baseSpeed: number;
  frame: number;
  reaction: Reaction;
  reactionTimer: number;
}

const petEmojis: Record<PetType, string> = {
  dog: '🐕',
  cat: '🐈',
  monkey: '🐒',
  lion: '🦁',
  peacock: '🦚',
};

// Each pet has a preferred reaction
const petReactions: Record<PetType, Reaction[]> = {
  dog: ['jump', 'hearts'],      // Dogs jump happily or show love
  cat: ['runaway', 'spin'],     // Cats run away or do a spin
  monkey: ['jump', 'spin'],     // Monkeys are playful
  lion: ['runaway', 'jump'],    // Lions might run or pounce
  peacock: ['spin', 'hearts'],  // Peacocks show off or display
};

const ScreenPets = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredPet, setHoveredPet] = useState<PetType | null>(null);

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
      const baseSpeed = 0.5 + Math.random() * 0.5;
      
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
        speed: baseSpeed,
        baseSpeed,
        frame: 0,
        reaction: 'none' as Reaction,
        reactionTimer: 0,
      };
    });

    setPets(newPets);
  }, []);

  const triggerReaction = useCallback((petId: PetType) => {
    setPets(currentPets => 
      currentPets.map(pet => {
        if (pet.id === petId && pet.reaction === 'none') {
          const reactions = petReactions[petId];
          const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
          
          return {
            ...pet,
            reaction: randomReaction,
            reactionTimer: 60, // ~1 second at 60fps
            speed: randomReaction === 'runaway' ? pet.baseSpeed * 4 : pet.baseSpeed,
            direction: randomReaction === 'runaway' 
              ? (Math.random() > 0.5 ? 'left' : 'right') 
              : pet.direction,
          };
        }
        return pet;
      })
    );
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
          let { x, y, direction, edge, speed, frame, reaction, reactionTimer, baseSpeed } = pet;
          const padding = 40;
          
          // Handle reaction timer
          if (reactionTimer > 0) {
            reactionTimer--;
            if (reactionTimer === 0) {
              reaction = 'none';
              speed = baseSpeed;
            }
          }
          
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

          frame = (frame + 1) % 20;

          return { ...pet, x, y, direction, frame, reaction, reactionTimer, speed };
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
        
        // Animation variants based on reaction
        const getAnimationProps = (): { [key: string]: any } => {
          switch (pet.reaction) {
            case 'jump':
              return {
                y: [0, -20, 0],
                transition: { duration: 0.3, repeat: 2, ease: "easeOut" as const }
              };
            case 'spin':
              return {
                rotate: [0, 360],
                transition: { duration: 0.5, repeat: 2, ease: "linear" as const }
              };
            case 'runaway':
              return {
                scale: [1, 1.2, 1],
                transition: { duration: 0.2, repeat: 3 }
              };
            case 'hearts':
              return {
                scale: [1, 1.3, 1],
                transition: { duration: 0.4, repeat: 2, ease: "easeInOut" as const }
              };
            default:
              return {
                y: isWalking ? -2 : 0,
                transition: { duration: 0.15, ease: "easeInOut" as const }
              };
          }
        };
        
        return (
          <motion.div
            key={pet.id}
            className="absolute select-none pointer-events-auto cursor-pointer"
            style={{
              left: pet.x,
              top: pet.y,
            }}
            animate={getAnimationProps()}
            onMouseEnter={() => {
              setHoveredPet(pet.id);
              triggerReaction(pet.id);
            }}
            onMouseLeave={() => setHoveredPet(null)}
            whileHover={{ scale: pet.reaction === 'none' ? 1.1 : undefined }}
          >
            <div 
              className="text-2xl drop-shadow-lg relative"
              style={{
                filter: 'drop-shadow(0 0 8px rgba(255, 200, 50, 0.6))',
                transform: `scaleX(${flipX ? -1 : 1})`,
              }}
            >
              {petEmojis[pet.id]}
              
              {/* Hearts effect */}
              {pet.reaction === 'hearts' && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <motion.span
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: [0, 1, 0], y: -20 }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="text-red-500 text-sm"
                  >
                    ❤️
                  </motion.span>
                </div>
              )}
              
              {/* Exclamation for runaway */}
              {pet.reaction === 'runaway' && (
                <motion.div 
                  className="absolute -top-4 left-1/2 -translate-x-1/2 text-yellow-400 font-bold text-xs"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  ❗
                </motion.div>
              )}
            </div>
            
            {/* Tooltip on hover */}
            {hoveredPet === pet.id && pet.reaction === 'none' && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -top-8 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs whitespace-nowrap border border-border"
              >
                {pet.id.charAt(0).toUpperCase() + pet.id.slice(1)}
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default ScreenPets;
