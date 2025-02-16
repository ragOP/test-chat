export interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  delay?: number
}

export interface UserInfo {
  name: string
  email: string
  phone: string
  zipCode: string
}

export type InsuranceType = "none" | "medicare" | "medicaid"

export interface ChatState {
  messages: Message[]
  isTyping: boolean
  isQualified: boolean
  currentStep:
    | "initial"
    | "insurance"
    | "credit-card-debt"
    | "debt-amount"
    | "debt-range"
    | "personal-loan"
    | "loan-amount"
    | "credit-score"
    | "collect-info"
    | "qualified"
    | "end"
  isMessageComplete: boolean
  isProcessing: boolean
  userInfo: UserInfo
}

