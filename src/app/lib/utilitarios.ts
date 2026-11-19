import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Junta classes condicionais e resolve conflitos do Tailwind.
// A última classe vence: cn("p-2", "p-4") => "p-4"
export function cn(...entradas: ClassValue[]) {
  return twMerge(clsx(entradas));
}
