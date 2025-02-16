"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { ChatMessage } from "./chat-message"
import { TypingIndicator } from "./typing-indicator"
import type { Message, ChatState, UserInfo, InsuranceType } from "../types/chat"
import { Button } from "@/components/ui/button"
import { RetreaverScript } from "./retreaver-script"

const INITIAL_MESSAGES: Message[] = [
  {
    id: "initial-1",
    content: "Hey there! 👋 Need help with bills?",
    role: "assistant",
    delay: 600,
  },
  {
    id: "initial-2",
    content:
      "I'm Emily, your virtual assistant, and I've got great news about a special health plan that could save you serious cash! 💰",
    role: "assistant",
    delay: 800,
  },
  {
    id: "initial-3",
    content:
      "Want to see if you qualify for a $0 health plan AND a $500 rewards card for groceries and gas? It only takes 2 minutes! Tap 'Yes' to get started! 🚀",
    role: "assistant",
    delay: 1000,
  },
]

interface OffHoursChatProps {
  insuranceType: InsuranceType | null
}

interface ExtendedUserInfo extends UserInfo {
  address?: string
  lengthAtAddress?: string
  housingStatus?: string
  insuranceType?: InsuranceType
  debtAmount?: string
  loanAmount?: string
  creditScore?: string
}

export function OffHoursChat({ insuranceType }: OffHoursChatProps) {
  const [state, setState] = useState<ChatState & { userInfo: ExtendedUserInfo }>({
    messages: [],
    isTyping: false,
    isQualified: false,
    currentStep: "initial",
    isMessageComplete: true,
    isProcessing: false,
    userInfo: {} as ExtendedUserInfo,
  })
  const [visibleMessages, setVisibleMessages] = useState(-1)
  const [leadType, setLeadType] = useState<"ACA" | "debt" | "loan" | null>(null)
  const [currentField, setCurrentField] = useState<keyof ExtendedUserInfo | null>(null)
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null)

  const buttonsRef = useRef<HTMLDivElement>(null)

  const addMessages = async (messages: Message[]) => {
    setState((prev) => ({
      ...prev,
      isProcessing: true,
      isMessageComplete: false,
    }))

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i]

      // Only show typing indicator for assistant messages
      if (message.role === "assistant") {
        setState((prev) => ({ ...prev, isTyping: true }))
        await new Promise((resolve) => setTimeout(resolve, 800))
      }

      setState((prev) => {
        const newMessages = [
          ...prev.messages,
          { ...message, id: `${message.role}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` },
        ]
        setVisibleMessages(newMessages.length - 1)
        return {
          ...prev,
          messages: newMessages,
          isTyping: false,
        }
      })

      // Only add delay between assistant messages
      if (i < messages.length - 1 && messages[i + 1].role === "assistant") {
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    }

    setState((prev) => ({
      ...prev,
      isMessageComplete: true,
      isProcessing: false,
    }))
  }

  const getNextField = (currentField: keyof ExtendedUserInfo | null): keyof ExtendedUserInfo | null => {
    const baseFields: (keyof ExtendedUserInfo)[] = ["name", "email", "zipCode", "phone"]
    const loanFields: (keyof ExtendedUserInfo)[] = [...baseFields, "address", "housingStatus", "lengthAtAddress"]

    const fields = state.userInfo.insuranceType === "none" && leadType === "loan" ? loanFields : baseFields

    if (!currentField) return fields[0]
    const currentIndex = fields.indexOf(currentField)
    return currentIndex < fields.length - 1 ? fields[currentIndex + 1] : null
  }

  const getFieldPrompt = (field: keyof ExtendedUserInfo): string => {
    const prompts: Record<keyof ExtendedUserInfo, string> = {
      name: "What's your name?",
      email: "What's your email address?",
      phone: "What's your phone number?",
      zipCode: "What's your ZIP code?",
      address: "What's your current address?",
      lengthAtAddress: "How long have you lived at this address?",
      housingStatus: "Do you own or rent your home?",
    }
    return prompts[field]
  }

  const isLastStep = useCallback(
    (field: keyof ExtendedUserInfo | null) => {
      const baseFields = ["name", "email", "zipCode", "phone"]
      const loanFields = [...baseFields, "address", "lengthAtAddress", "housingStatus"]
      const fields = leadType === "loan" ? loanFields : baseFields

      return field === fields[fields.length - 1]
    },
    [leadType],
  )

  const renderTCPAText = () => (
    <div className="text-xs text-gray-600 mb-4">
      By clicking the "Submit" button below, you are providing your electronic signature in which you consent,
      acknowledge and agree: (a) to our{" "}
      <a
        href="https://livechat.healthbenefitsnow.org/terms_of_service/index.html"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline"
      >
        Terms of Service
      </a>{" "}
      and{" "}
      <a
        href="https://livechat.healthbenefitsnow.org/privacy_policy/index.html"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline"
      >
        Privacy Policy
      </a>
      , including our arbitration provision; (b) to our sharing of your information with Synergy Marketplace LLC for
      marketing purposes; (c) to receive automated calls, texts, and pre-recorded marketing messages from Synergy
      Marketplace LLC about various offers at the telephone number you provided (consent not required as a condition to
      purchase a good/service); and (d) that your call may be handled by a virtual assistant that is provided by a
      third-party artificial intelligence tool. You may opt-out from SMS or text messages at any time by replying STOP.
      Data and message rates may apply. You may also revoke consent at any time by contacting us at:
      customercare@livechat.healthbenefitsnow.org.
    </div>
  )

  const handleHousingStatusResponse = async (status: "own" | "rent") => {
    await addMessages([{ content: status === "own" ? "Own" : "Rent", role: "user" }])

    setState((prev) => ({
      ...prev,
      userInfo: { ...prev.userInfo, housingStatus: status },
    }))

    await addMessages([{ content: "How long have you lived at this address?", role: "assistant" }])
    setCurrentField("lengthAtAddress")
  }

  const collectUserInfo = async (value: string) => {
    if (!currentField) return

    // Update user info first
    setState((prev) => ({
      ...prev,
      userInfo: { ...prev.userInfo, [currentField]: value },
    }))

    // Add user's response to chat
    await addMessages([{ content: value, role: "user" }])

    const nextField = getNextField(currentField)

    if (nextField) {
      await addMessages([{ content: getFieldPrompt(nextField), role: "assistant" }])
      setCurrentField(nextField)
    } else if (!state.userInfo.insuranceType) {
      await addMessages([
        {
          content: "Thank you for providing your information. Now, are you currently on Medicaid or Medicare?",
          role: "assistant",
        },
      ])
      setState((prev) => ({ ...prev, currentStep: "insurance" }))
    } else {
      await addMessages([
        {
          content: "Thank you for providing your information. We'll reach out to you the next business day!",
          role: "assistant",
        },
      ])
      console.log(`Logged as ${leadType} lead:`, state.userInfo)
      setState((prev) => ({ ...prev, currentStep: "end" }))
    }
  }

  const handleYesClick = async () => {
    await addMessages([
      { content: "Yes", role: "user" },
      {
        content:
          "Great! To see what benefits you qualify for in your area, I'll need to ask you a few quick questions. This will help us provide you with the most accurate information.",
        role: "assistant",
      },
      { content: "What's your name?", role: "assistant" },
    ])
    setState((prev) => ({ ...prev, currentStep: "collect-info" }))
    setCurrentField("name")
  }

  const handleInsuranceClick = async (type: InsuranceType) => {
    await addMessages([
      {
        content: type === "none" ? "None" : type === "medicare" ? "Medicare" : "Medicaid",
        role: "user",
      },
    ])

    setState((prev) => ({
      ...prev,
      userInfo: { ...prev.userInfo, insuranceType: type },
    }))

    if (type === "none") {
      setLeadType("ACA")
      await addMessages([
        {
          content: "🎉 Fantastic news! You're one step closer to major savings!",
          role: "assistant",
        },
        {
          content:
            "Based on what you've told me, you might qualify for a $0 health plan AND a $500 spending card for essentials like groceries, gas, and rent. That's real money back in your pocket!",
          role: "assistant",
        },
        {
          content: "Thank you for providing your information. We'll reach out to you the next business day!",
          role: "assistant",
        },
      ])
      setState((prev) => ({ ...prev, currentStep: "end" }))
    } else {
      await addMessages([
        {
          content:
            "I see you're on " +
            (type === "medicare" ? "Medicare" : "Medicaid") +
            ". While you may not qualify for the ACA benefits, we might have other options that could help you.",
          role: "assistant",
        },
        {
          content: "Are you currently in credit card debt?",
          role: "assistant",
        },
      ])
      setState((prev) => ({ ...prev, currentStep: "credit-card-debt" }))
    }
  }

  const handleCreditCardDebtResponse = async (hasDebt: boolean) => {
    await addMessages([{ content: hasDebt ? "Yes" : "No", role: "user" }])

    if (hasDebt) {
      await addMessages([
        { content: "I understand. Is your credit card debt over or under $15,000?", role: "assistant" },
      ])
      setState((prev) => ({ ...prev, currentStep: "debt-amount" }))
    } else {
      await addMessages([
        {
          content:
            "Alright, thanks for letting me know. Are you looking for a personal loan? You can get qualified independent of your credit score!",
          role: "assistant",
        },
      ])
      setState((prev) => ({ ...prev, currentStep: "personal-loan" }))
    }
  }

  const handleDebtAmountResponse = async (isOver15k: boolean) => {
    await addMessages([{ content: isOver15k ? "Over $15,000" : "Under $15,000", role: "user" }])

    if (isOver15k) {
      setLeadType("debt")
      await addMessages([
        {
          content:
            "Great news! You may qualify for a new debt relief program that can help you resolve more than half of your debt amount. Could you please specify the range of your debt?",
          role: "assistant",
        },
      ])
      setState((prev) => ({ ...prev, currentStep: "debt-range" }))
    } else {
      await addMessages([
        {
          content:
            "Thank you for sharing that. Are you looking for a personal loan? You can get qualified independent of your credit score!",
          role: "assistant",
        },
      ])
      setState((prev) => ({ ...prev, currentStep: "personal-loan" }))
    }
  }

  const handleDebtRangeResponse = async (range: string) => {
    await addMessages([
      { content: range, role: "user" },
      {
        content:
          "Thank you for providing that information. We'll reach out to you the next business day with more details about our debt relief program!",
        role: "assistant",
      },
    ])
    setState((prev) => ({
      ...prev,
      currentStep: "end",
      userInfo: { ...prev.userInfo, debtAmount: range },
    }))
  }

  const handlePersonalLoanResponse = async (wantsLoan: boolean) => {
    await addMessages([{ content: wantsLoan ? "Yes" : "No", role: "user" }])

    if (wantsLoan) {
      setLeadType("loan")
      await addMessages([{ content: "Great! How much would you like to borrow?", role: "assistant" }])
      setState((prev) => ({ ...prev, currentStep: "loan-amount" }))
    } else {
      await addMessages([
        {
          content:
            "I understand. Thank you for your time. If you need any assistance in the future, please don't hesitate to reach out!",
          role: "assistant",
        },
      ])
      setState((prev) => ({ ...prev, currentStep: "end" }))
    }
  }

  const handleLoanAmountResponse = async (amount: string) => {
    await addMessages([
      { content: amount, role: "user" },
      { content: "Thank you. What's your credit score range?", role: "assistant" },
    ])
    setState((prev) => ({
      ...prev,
      currentStep: "credit-score",
      userInfo: { ...prev.userInfo, loanAmount: amount },
    }))
  }

  const handleCreditScoreResponse = async (score: string) => {
    await addMessages([
      { content: score, role: "user" },
      {
        content: "Thank you for providing that information. Now, I just need a few more details to help you further.",
        role: "assistant",
      },
      { content: "What's your current address?", role: "assistant" },
    ])
    setState((prev) => ({
      ...prev,
      currentStep: "collect-info",
      userInfo: { ...prev.userInfo, creditScore: score },
    }))
    setCurrentField("address")
  }

  const handleSubmit = useCallback(() => {
    const input = document.querySelector('input[type="text"]') as HTMLInputElement
    const value = input.value.trim()
    if (value) {
      const fields: (keyof ExtendedUserInfo)[] = [
        "name",
        "email",
        "phone",
        "zipCode",
        "address",
        "lengthAtAddress",
        "housingStatus",
      ]
      const currentFieldIndex = Object.keys(state.userInfo).filter(
        (key) => state.userInfo[key as keyof ExtendedUserInfo] !== undefined,
      ).length
      const currentField = fields[currentFieldIndex]
      if (currentField) {
        collectUserInfo(value)
        input.value = ""
      }
    }
  }, [collectUserInfo]) // Removed state.userInfo from dependencies

  const handleNumberReceived = (formattedNumber: string) => {
    setPhoneNumber(formattedNumber)
  }

  const renderButtons = () => {
    if (state.isProcessing || state.isTyping || !state.isMessageComplete) {
      return null
    }

    setTimeout(() => {
      if (buttonsRef.current) {
        const scrollOptions: ScrollIntoViewOptions = {
          behavior: "smooth",
          block: "center",
        }
        buttonsRef.current.scrollIntoView(scrollOptions)
      }
    }, 100)

    const baseButtonClass = "transform active:scale-95 transition-transform duration-150"

    switch (state.currentStep) {
      case "initial":
        return (
          <div className="flex gap-3 animate-fade-in">
            <Button
              onClick={handleYesClick}
              className={`w-full py-6 text-lg font-semibold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg rounded-xl ${baseButtonClass}`}
            >
              Yes, Show Me How to Save!
            </Button>
          </div>
        )
      case "insurance":
        return (
          <div className="flex flex-col gap-3 animate-fade-in">
            <Button
              onClick={() => handleInsuranceClick("none")}
              className={`w-full py-4 text-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded-xl ${baseButtonClass}`}
            >
              No Insurance
            </Button>
            <Button
              onClick={() => handleInsuranceClick("medicare")}
              className={`w-full py-4 text-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded-xl ${baseButtonClass}`}
            >
              Medicare
            </Button>
            <Button
              onClick={() => handleInsuranceClick("medicaid")}
              className={`w-full py-4 text-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded-xl ${baseButtonClass}`}
            >
              Medicaid
            </Button>
          </div>
        )
      case "credit-card-debt":
        return (
          <div className="flex gap-3 animate-fade-in">
            <Button
              onClick={() => handleCreditCardDebtResponse(true)}
              className={`flex-1 py-4 text-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded-xl ${baseButtonClass}`}
            >
              Yes
            </Button>
            <Button
              onClick={() => handleCreditCardDebtResponse(false)}
              className={`flex-1 py-4 text-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded-xl ${baseButtonClass}`}
            >
              No
            </Button>
          </div>
        )
      case "debt-amount":
        return (
          <div className="flex gap-3 animate-fade-in">
            <Button
              onClick={() => handleDebtAmountResponse(true)}
              className={`flex-1 py-4 text-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded-xl ${baseButtonClass}`}
            >
              Over $15,000
            </Button>
            <Button
              onClick={() => handleDebtAmountResponse(false)}
              className={`flex-1 py-4 text-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded-xl ${baseButtonClass}`}
            >
              Under $15,000
            </Button>
          </div>
        )
      case "debt-range":
        return (
          <div className="flex flex-col gap-3 animate-fade-in">
            {["15-20k", "20-25k", "30k+"].map((range) => (
              <Button
                key={range}
                onClick={() => handleDebtRangeResponse(range)}
                className={`w-full py-4 text-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded-xl ${baseButtonClass}`}
              >
                {range}
              </Button>
            ))}
          </div>
        )
      case "personal-loan":
        return (
          <div className="flex gap-3 animate-fade-in">
            <Button
              onClick={() => handlePersonalLoanResponse(true)}
              className={`flex-1 py-4 text-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded-xl ${baseButtonClass}`}
            >
              Yes
            </Button>
            <Button
              onClick={() => handlePersonalLoanResponse(false)}
              className={`flex-1 py-4 text-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded-xl ${baseButtonClass}`}
            >
              No
            </Button>
          </div>
        )
      case "loan-amount":
        return (
          <div className="flex flex-col gap-3 animate-fade-in">
            {["100-1700", "1700-3300", "3300-4900", "4900-6500", "6500-8100", "8100-10000"].map((range) => (
              <Button
                key={range}
                onClick={() => handleLoanAmountResponse(range)}
                className={`w-full py-4 text-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded-xl ${baseButtonClass}`}
              >
                ${range}
              </Button>
            ))}
          </div>
        )
      case "credit-score":
        return (
          <div className="flex flex-col gap-3 animate-fade-in">
            {["Excellent (700+)", "Good (650-700)", "Fair (550-650)", "Poor (550 or lower)", "No credit"].map(
              (score) => (
                <Button
                  key={score}
                  onClick={() => handleCreditScoreResponse(score)}
                  className={`w-full py-4 text-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded-xl ${baseButtonClass}`}
                >
                  {score}
                </Button>
              ),
            )}
          </div>
        )
      case "collect-info":
        // Don't show input if we're in end state
        if (state.currentStep === "end") return null

        return (
          <div className="space-y-4 animate-fade-in">
            <input
              type="text"
              placeholder="Type your response here..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSubmit()
                }
              }}
            />
            <Button
              onClick={handleSubmit}
              className={`w-full py-4 text-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded-xl ${baseButtonClass}`}
            >
              Submit
            </Button>
            {currentField === "phone" && renderTCPAText()}
          </div>
        )
      case "housing-status":
        return (
          <div className="space-y-4 animate-fade-in">
            <p className="text-lg font-medium">Do you own or rent your home?</p>
            <div className="flex gap-3">
              <Button
                onClick={() => handleHousingStatusResponse("own")}
                className={`flex-1 py-4 text-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded-xl ${baseButtonClass}`}
              >
                Own
              </Button>
              <Button
                onClick={() => handleHousingStatusResponse("rent")}
                className={`flex-1 py-4 text-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded-xl ${baseButtonClass}`}
              >
                Rent
              </Button>
            </div>
          </div>
        )
      case "end" && leadType === "ACA":
        return (
          <>
            <RetreaverScript campaignKey="09b6d915600d4764dd5de4d9ead829b5" />
            <div className="space-y-4 animate-fade-in">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-green-800 text-sm text-center font-semibold">
                  🎉 Great news! You're pre-qualified for amazing benefits!
                </p>
              </div>
              <div id="phone-number">
                <a
                  href="tel:+18889823536"
                  className={`block w-full py-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-bold text-xl text-center shadow-lg ${baseButtonClass}`}
                >
                  Call (888) 982-3536 Now!
                </a>
              </div>
              <div className="text-sm text-gray-600 text-center space-y-1">
                <div>TTY: 711</div>
                <div className="font-medium">Friendly Agents Available: M-F 9am-6pm EST</div>
              </div>
            </div>
          </>
        )
      default:
        return null
    }
  }

  useEffect(() => {
    async function startChat() {
      if (state.messages.length > 0) return

      setState((prev) => ({ ...prev, isProcessing: true }))

      for (let i = 0; i < INITIAL_MESSAGES.length; i++) {
        const message = INITIAL_MESSAGES[i]
        setState((prev) => ({ ...prev, isTyping: true, isMessageComplete: false }))
        await new Promise((resolve) => setTimeout(resolve, 800))

        setState((prev) => {
          const newMessages = [...prev.messages, message]
          setVisibleMessages(newMessages.length - 1)
          return {
            ...prev,
            messages: newMessages,
            isTyping: false,
          }
        })

        // Only add delay between messages, not after the last one
        if (i < INITIAL_MESSAGES.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, message.delay || 500))
        }
      }

      setState((prev) => ({
        ...prev,
        isMessageComplete: true,
        isProcessing: false,
        currentStep: "initial",
      }))
    }
    startChat()
  }, [state.messages.length]) 

  useEffect(() => {
    if (buttonsRef.current) {
      const scrollOptions: ScrollIntoViewOptions = {
        behavior: "smooth",
        block: "center",
      }
      buttonsRef.current.scrollIntoView(scrollOptions)
    }
  }, []) 

  const isFirstInGroup = (index: number) => {
    if (index === 0) return true
    const currentMessage = state.messages[index]
    const previousMessage = state.messages[index - 1]
    return currentMessage.role !== previousMessage.role
  }

  const isLastInGroup = (index: number) => {
    if (index === state.messages.length - 1) return true
    const currentMessage = state.messages[index]
    const nextMessage = state.messages[index + 1]
    return currentMessage.role !== nextMessage.role
  }

  return (
    <>
      <div className="space-y-4 mb-4">
        {state.messages.map((message, index) => (
          <ChatMessage
            key={message.id}
            message={message}
            isFirstInGroup={isFirstInGroup(index)}
            isLastInGroup={isLastInGroup(index)}
            index={index}
            visibleMessages={visibleMessages}
          />
        ))}
        {state.isTyping && <TypingIndicator />}
      </div>

      <div ref={buttonsRef} className="mt-6">
        {renderButtons()}
      </div>
    </>
  )
}

