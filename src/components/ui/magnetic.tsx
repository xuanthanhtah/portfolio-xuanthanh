"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface MagneticProps {
  children: React.ReactNode;
  range?: number;
  actionStrength?: number;
}

export function Magnetic({ children, range = 60, actionStrength = 0.35 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  // Set up Motion Values for X and Y translations
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Apply Spring Physics for smooth organic movement
  const springConfig = { stiffness: 150, damping: 15, mass: 0.1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    
    // Calculate distance from center
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;
    
    // Check if cursor is within magnetic pull range
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    
    if (distance < range) {
      // Pull element towards cursor with a customizable strength factor
      x.set(distanceX * actionStrength);
      y.set(distanceY * actionStrength);
    } else {
      // Reset position if cursor leaves range
      x.set(0);
      y.set(0);
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className="inline-block"
    >
      {children}
    </motion.div>
  );
}
