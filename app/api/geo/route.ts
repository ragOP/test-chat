import { getEnv } from "@vercel/functions"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { IPSTACK_API_KEY } = getEnv()

    const response = await fetch(`https://api.ipstack.com/check?access_key=${IPSTACK_API_KEY}`)
    const data = await response.json()

    if (!data.success && data.error) {
      console.error("Failed to get geo data:", data.error.info)
      return NextResponse.json({ error: "Failed to fetch geo data" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to get geo data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

