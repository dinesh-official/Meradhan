import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const playSound = () => {
  const pop = new Audio(
    "/bell.mp3"
  );
  pop.volume = 0.4; // softer sound
  pop.play().catch((e) => {
    console.log(e);

  });
}