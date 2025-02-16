"use client"

import { useSearchParams } from "next/navigation"
import Script from "next/script"
import { useEffect, useState, Suspense } from "react"

function TrackingScriptContent() {
  const searchParams = useSearchParams()
  const [shouldLoad, setShouldLoad] = useState(false)
  const [trackingUrl, setTrackingUrl] = useState("")

  useEffect(() => {
    const cmpid = searchParams.get("rtkcmpid") || searchParams.get("cmpid")

    if (cmpid) {
      const baseUrl = "https://qltw6.ttrk.io/track.js"
      setTrackingUrl(`${baseUrl}?rtkcmpid=${cmpid}`)
      setShouldLoad(true)
    }
  }, [searchParams])

  if (!shouldLoad) return null

  return <Script src={trackingUrl} strategy="lazyOnload" />
}

export function TrackingScript() {
  return (
    <Suspense fallback={null}>
      <TrackingScriptContent />
    </Suspense>
  )
}

