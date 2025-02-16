"use client"
import { useEffect, useState } from "react"

interface RetreaverScriptProps {
  campaignKey: string
  onNumberReceived: (number: string) => void
}

export function RetreaverScript({ campaignKey, onNumberReceived }: RetreaverScriptProps) {
  const [retreaverId, setRetreaverId] = useState<string | null>(null)

  useEffect(() => {
    console.log("RetreaverScript mounted")
    const script = document.createElement("script")
    script.type = "text/javascript"
    script.async = true
    script.defer = true
    script.src = document.location.protocol + "//dist.routingapi.com/jsapi/v1/retreaver.min.js"
    script.onload = script.onreadystatechange = () => {
      console.log("Retreaver script loaded")
      const Retreaver = (window as any).Retreaver
      Retreaver.configure({
        host: "api.routingapi.com",
        prefix: document.location.protocol === "https:" ? "https" : "http",
      })

      const campaign = new Retreaver.Campaign({ campaign_key: campaignKey })
      campaign.request_number((number: string, id: string) => {
        console.log("Received dynamic number:", number)
        console.log("Retreaver ID:", id)
        setRetreaverId(id)
        onNumberReceived(number)
      })
    }
    document.head.appendChild(script)

    return () => {
      console.log("RetreaverScript unmounted")
      document.head.removeChild(script)
    }
  }, [campaignKey, onNumberReceived])

  return <div style={{ display: "none" }}>{retreaverId && <p>Retreaver ID: {retreaverId}</p>}</div>
}

