import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isWithinOfficeHours(): boolean {
  // Temporarily return true to always show on-hours version
  return false

  // Original implementation commented out:
  /*
  const now = new Date()
  const day = now.getUTCDay()
  const hour = now.getUTCHours()

  // Convert UTC to EST (UTC-5)
  const estHour = (hour - 5 + 24) % 24

  // Check if it's a weekday (Monday = 1, Friday = 5) and between 9am and 6pm EST
  return day >= 1 && day <= 5 && estHour >= 9 && estHour < 18
  */
}

