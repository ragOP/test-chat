"use client"

import { useState, useEffect, useRef } from "react"
import { ChatMessage } from "./chat-message"
import { TypingIndicator } from "./typing-indicator"
import type { Message, ChatState, UserInfo, InsuranceType } from "../types/chat"
import { Button } from "@/components/ui/button"
import { RetreaverScript } from "./RetreaverScript"

const baseButtonClass = "transform active:scale-95 transition-transform duration-150"

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

interface OnHoursChatProps {
  insuranceType?: InsuranceType
  onInsuranceSelection: (type: InsuranceType) => void
}

export function OnHoursChat({ insuranceType, onInsuranceSelection }: OnHoursChatProps) {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isTyping: false,
    isQualified: false,
    currentStep: "initial",
    isMessageComplete: false,
    isProcessing: false,
    userInfo: {} as UserInfo,
  })
  const [visibleMessages, setVisibleMessages] = useState(-1)
  const [showPhoneNumber, setShowPhoneNumber] = useState(false)
  const [loadRetreaverScript, setLoadRetreaverScript] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("8889823536")

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const buttonsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function playMessages() {
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

        if (i < INITIAL_MESSAGES.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, message.delay || 500))
        }
      }

      setState((prev) => ({
        ...prev,
        isMessageComplete: true,
        isProcessing: false,
      }))
    }
    playMessages()
  }, [state.messages.length])

  useEffect(() => {
    if (showPhoneNumber) {
      // Wait for the next render cycle to ensure the phone number is in the DOM
      setTimeout(() => setLoadRetreaverScript(true), 0)
    }
  }, [showPhoneNumber])

  const addMessages = async (messages: Message[]) => {
    setState((prev) => ({
      ...prev,
      isProcessing: true,
      isMessageComplete: false,
    }))

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i]

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

  const handleYesClick = async () => {
    const messages = [
      { content: "Yes", role: "user" as const },
      {
        content: "Awesome! Let's get you those savings ASAP. I just need to ask you a couple quick questions.",
        role: "assistant" as const,
      },
      { content: "First up: Are you currently on Medicaid or Medicare?", role: "assistant" as const },
    ]
    await addMessages(messages)
    setState((prev) => ({ ...prev, currentStep: "insurance" }))
  }

  const handleInsuranceClick = async (type: InsuranceType) => {
    onInsuranceSelection(type)
    const messages: Message[] = [
      {
        content: type === "none" ? "None" : type === "medicare" ? "Medicare" : "Medicaid",
        role: "user",
      },
    ]

    if (type === "none") {
      messages.push(
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
          content:
            "Don't miss out on this opportunity! Call now to lock in your benefits. It only takes a few minutes, and you could start saving today!",
          role: "assistant",
        },
      )
      await addMessages(messages)
      setState((prev) => ({ ...prev, currentStep: "qualified" }))
      setShowPhoneNumber(true)
    } else {
      messages.push(
        {
          content:
            "I see you're on " +
            (type === "medicare" ? "Medicare" : "Medicaid") +
            ". While you may not qualify for the ACA benefits, we might have other options that could help you.",
          role: "assistant",
        },
        { content: "Let me ask you a few more questions. Are you currently in credit card debt?", role: "assistant" },
      )
      await addMessages(messages)
      setState((prev) => ({ ...prev, currentStep: "credit-card-debt" }))
    }
  }

  const handleCreditCardDebtResponse = async (hasDebt: boolean) => {
    if (hasDebt) {
      await addMessages([
        { content: "Yes", role: "user" },
        { content: "I understand. Is your credit card debt over or under $15,000?", role: "assistant" },
      ])
      setState((prev) => ({ ...prev, currentStep: "debt-amount" }))
    } else {
      await addMessages([
        { content: "No", role: "user" },
        { content: "Alright, thanks for letting me know. Are you looking for a personal loan?", role: "assistant" },
      ])
      setState((prev) => ({ ...prev, currentStep: "personal-loan" }))
    }
  }

  const handleDebtAmountResponse = async (isOver15k: boolean) => {
    if (isOver15k) {
      await addMessages([
        { content: "Over $15,000", role: "user" },
        { content: "I see. Could you please specify the range of your debt?", role: "assistant" },
      ])
      setState((prev) => ({ ...prev, currentStep: "debt-range" }))
    } else {
      await addMessages([
        { content: "Under $15,000", role: "user" },
        { content: "Thank you for sharing that. Are you looking for a personal loan?", role: "assistant" },
      ])
      setState((prev) => ({ ...prev, currentStep: "personal-loan" }))
    }
  }

  const handleDebtRangeResponse = async (range: string) => {
    await addMessages([
      { content: range, role: "user" },
      {
        content:
          "Thank you for providing that information. Now, let's collect some details so we can help you further.",
        role: "assistant",
      },
      { content: "What's your name?", role: "assistant" },
    ])
    setState((prev) => ({ ...prev, currentStep: "collect-info" }))
  }

  const handlePersonalLoanResponse = async (wantsLoan: boolean) => {
    if (wantsLoan) {
      await addMessages([
        { content: "Yes", role: "user" },
        { content: "Great! How much would you like to borrow?", role: "assistant" },
      ])
      setState((prev) => ({ ...prev, currentStep: "loan-amount" }))
    } else {
      await addMessages([
        { content: "No", role: "user" },
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
    setState((prev) => ({ ...prev, currentStep: "credit-score" }))
  }

  const handleCreditScoreResponse = async (score: string) => {
    await addMessages([
      { content: score, role: "user" },
      {
        content:
          "Thank you for providing that information. Now, let's collect some details so we can help you further.",
        role: "assistant",
      },
      { content: "What's your name?", role: "assistant" },
    ])
    setState((prev) => ({ ...prev, currentStep: "collect-info" }))
  }

  const collectUserInfo = async (field: keyof UserInfo, value: string) => {
    setState((prev) => ({
      ...prev,
      userInfo: { ...prev.userInfo, [field]: value },
    }))

    await addMessages([{ content: value, role: "user" }])

    const nextField = getNextUserInfoField(field)
    if (nextField) {
      await addMessages([{ content: getFieldPrompt(nextField), role: "assistant" }])
    } else {
      await addMessages([
        {
          content: "Thank you for providing your information. An agent will be in touch with you shortly!",
          role: "assistant",
        },
      ])
      console.log("User info to be sent to backend:", state.userInfo)
    }
  }

  const getNextUserInfoField = (currentField: keyof UserInfo): keyof UserInfo | null => {
    const fields: (keyof UserInfo)[] = ["name", "email", "phone", "zipCode"]
    const currentIndex = fields.indexOf(currentField)
    return currentIndex < fields.length - 1 ? fields[currentIndex + 1] : null
  }

  const getFieldPrompt = (field: keyof UserInfo): string => {
    switch (field) {
      case "name":
        return "What's your name?"
      case "email":
        return "What's your email address?"
      case "phone":
        return "What's your phone number?"
      case "zipCode":
        return "What's your zip code?"
      default:
        return ""
    }
  }

  const renderTCPAText = () => (
    <p className="text-gray-600 text-xs">
      By entering your phone number, you agree to receive automated calls and/or texts from or on behalf of our client.
      Message and data rates may apply.
    </p>
  )

  const handleSubmit = () => {
    const input = document.querySelector('input[type="text"]') as HTMLInputElement
    const value = input.value.trim()
    if (value) {
      const fields: (keyof UserInfo)[] = ["name", "email", "phone", "zipCode"]
      const currentField = fields[Object.keys(state.userInfo).length]
      if (currentField) {
        collectUserInfo(currentField, value)
        input.value = ""
      }
    }
  }

  const renderButtons = () => {
    if (state.isProcessing || state.isTyping || !state.isMessageComplete) {
      return null
    }

    console.log("Rendering buttons, current step:", state.currentStep)

    setTimeout(() => {
      if (buttonsRef.current) {
        const scrollOptions: ScrollIntoViewOptions = {
          behavior: "smooth",
          block: "center",
        }
        buttonsRef.current.scrollIntoView(scrollOptions)
      }
    }, 100)

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
        if (state.currentStep === "end") return null

        const currentField = Object.keys(state.userInfo).length as keyof UserInfo
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
      case "qualified":
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-green-800 text-sm text-center font-semibold">
                🎉 Great news! You're pre-qualified for amazing benefits!
              </p>
            </div>
            {showPhoneNumber && (
              <>
                <RetreaverScript />
                <div id="phone-number">
                  <a
                    href={`tel:+1${phoneNumber}`}
                    className={`block w-full py-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-bold text-xl text-center shadow-lg ${baseButtonClass}`}
                  >
                    Call {phoneNumber} Now!
                  </a>
                </div>
              </>
            )}
            <div className="text-sm text-gray-600 text-center space-y-1">
              <div>TTY: 711</div>
              <div className="font-medium">Friendly Agents Available: M-F 9am-6pm EST</div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  const handleNumberReceived = (number: string) => {
    console.log("Number received in OnHoursChat:", number)
    setPhoneNumber(number)
  }

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
        <div ref={messagesEndRef} />
      </div>

      <div ref={buttonsRef} className="mt-6">
        {renderButtons()}
      </div>

      {loadRetreaverScript && (
        <RetreaverScript campaignKey="09b6d915600d4764dd5de4d9ead829b5" onNumberReceived={handleNumberReceived} />
      )}
      {console.log(
        "Current step:",
        state.currentStep,
        "Show phone number:",
        showPhoneNumber,
        "Phone number:",
        phoneNumber,
      )}
    </>
  )
}

