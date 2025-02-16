export async function getGeoData() {
  try {
    const response = await fetch("/api/geo")
    const data = await response.json()

    if (data.error) {
      console.error("Failed to get geo data:", data.error)
      return null
    }

    return data
  } catch (error) {
    console.error("Failed to get geo data:", error)
    return null
  }
}

