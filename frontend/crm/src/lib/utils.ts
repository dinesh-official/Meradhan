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
  pop.play().catch(() => {
    // Silently fail - audio playback is not critical
  });
}



export interface PersonName {
  firstName: string;
  middleName?: string;
  lastName: string;
}

export function areNamesMatched(a: PersonName, b: PersonName): boolean {
  const clean = (s: string = "") => s.replace(/\s+/g, "").toLowerCase();

  const fullA = clean(a.firstName) + clean(a.middleName) + clean(a.lastName);
  const fullB = clean(b.firstName) + clean(b.middleName) + clean(b.lastName);

  return fullA === fullB;
}