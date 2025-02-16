type GtagEvent = {
  action: string
  category: string
  label: string
  value?: number
}

// Declare gtag as a global function
declare global {
  interface Window {
    gtag: (command: "event" | "config" | "js", action: string, params?: Record<string, any>) => void
  }
}

// Log specific events
export const logEvent = ({ action, category, label, value }: GtagEvent) => {
  try {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  } catch (error) {
    console.error("Failed to log event:", error)
  }
}

