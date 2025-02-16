"use client"

import { useState, useEffect } from "react"
import { OnHoursChat } from "./OnHoursChat"
import { OffHoursChat } from "./OffHoursChat"
import { Clock, Shield, Star } from "lucide-react"
import { isWithinOfficeHours } from "@/lib/utils"
import type { InsuranceType } from "../types/chat"

export function Chat() {
  const [withinOfficeHours, setWithinOfficeHours] = useState(isWithinOfficeHours())
  const [insuranceType, setInsuranceType] = useState<InsuranceType | null>(null)

  const handleInsuranceSelection = (type: InsuranceType) => {
    setInsuranceType(type)
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setWithinOfficeHours(isWithinOfficeHours())
    }, 60000) // Check every minute

    return () => clearInterval(timer)
  }, [])

  const renderTrustIndicators = () => (
    <div className="flex justify-center gap-4 sm:gap-6 py-4 px-4 bg-blue-50 rounded-lg mb-6 animate-fade-in">
      <div className="flex flex-col items-center text-center">
        <Shield className="w-6 h-6 text-green-600 mb-1" />
        <span className="text-xs text-gray-600">Licensed Agents</span>
      </div>
      <div className="flex flex-col items-center text-center">
        <Star className="w-6 h-6 text-green-600 mb-1" />
        <span className="text-xs text-gray-600">4.9/5 Customer Rating</span>
      </div>
      <div className="flex flex-col items-center text-center">
        <Clock className="w-6 h-6 text-green-600 mb-1" />
        <span className="text-xs text-gray-600">2-Minute Process</span>
      </div>
    </div>
  )

  return (
    <div className="bg-gradient-to-b from-white to-blue-50 pb-8">
      <div className="max-w-xl mx-auto p-3 sm:p-4">
        <div className="text-center mb-6">
          <h1 className="text-xl sm:text-2xl font-bold mb-3 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Get a $0 Health Plan + $500 Rewards Card!
          </h1>
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-green-600">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-[pulse_1s_ease-in-out_infinite] shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
            Emily is Here to Help You Save!
          </div>
        </div>

        {renderTrustIndicators()}

        {withinOfficeHours ? (
          <OnHoursChat onInsuranceSelection={handleInsuranceSelection} />
        ) : (
          <OffHoursChat insuranceType={insuranceType} />
        )}
      </div>
    </div>
  )
}

