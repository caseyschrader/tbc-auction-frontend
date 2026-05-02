
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const copperToDisplay = (copper: number) => {
  if (!copper || copper <= 0) return '0g 0s 0c';
  const gold = Math.floor(copper / 10000);
  const silver = Math.floor((copper % 10000) / 100);
  const copperLeft = copper % 100;
  return `${gold}g ${silver}s ${copperLeft}c`;
};

export const formatAxisCopper = (copper: number) => {
  if (copper === 0) return '0';
  const gold = Math.floor(copper / 10000);
  if (gold > 0) return `${gold}g`;
  const silver = Math.floor(copper / 100);
  if (silver > 0) return `${silver}s`;
  return `${copper}c`;
};
