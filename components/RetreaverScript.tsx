"use client"

import { useEffect } from "react"
//This import is not needed as Retreaver is loaded dynamically.  Leaving it commented out in case it's needed later.
//import Retreaver from 'retreaver-js';

export function RetreaverScript() {
  useEffect(() => {
    const script = document.createElement("script")
    script.type = "text/javascript"
    script.async = true
    script.defer = true
    script.src = document.location.protocol + "//dist.routingapi.com/jsapi/v1/retreaver.min.js"
    script.onload = script.onreadystatechange = () => {
      if (typeof Retreaver !== "undefined") {
        Retreaver.configure({
          host: "api.routingapi.com",
          prefix: document.location.protocol === "https:" ? "https" : "http",
        })
        try {
          new Retreaver.Campaign({ campaign_key: "09b6d915600d4764dd5de4d9ead829b5" }).auto_replace_numbers()
        } catch (error) {
          console.error("Error initializing Retreaver campaign:", error)
        }
      } else {
        console.error("Retreaver is not defined")
      }
    }
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  return null
}

