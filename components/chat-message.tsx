import type { Message } from "../types/chat"
import { motion, AnimatePresence } from "framer-motion"
import { User } from "lucide-react"

interface ChatMessageProps {
  message: Message
  isFirstInGroup: boolean
  isLastInGroup: boolean
  index: number
  visibleMessages: number
}

export function ChatMessage({ message, isFirstInGroup, isLastInGroup, index, visibleMessages }: ChatMessageProps) {
  const isAssistant = message.role === "assistant"
  const isVisible = index <= visibleMessages

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: isAssistant ? -20 : 20, height: 0 }}
          animate={{ opacity: 1, x: 0, height: "auto" }}
          exit={{ opacity: 0, x: isAssistant ? -20 : 20, height: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`relative ${!isLastInGroup ? "mb-1" : "mb-4"}`}
        >
          {isAssistant && isLastInGroup && (
            <div className="absolute left-0 top-0">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-brEWB5crLa89CpN2HQMiTFJpnuNTud.png"
                alt="Assistant avatar"
                className="w-10 h-10 rounded-full border-2 border-white shadow-lg"
              />
            </div>
          )}
          {!isAssistant && isLastInGroup && (
            <div className="absolute right-0 top-0">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-6 h-6 text-gray-500" />
              </div>
            </div>
          )}
          <div className={`flex ${isAssistant ? "justify-start pl-14" : "justify-end pr-14"}`}>
            <div
              className={`
                ${isAssistant ? "bg-gray-100" : "bg-blue-500 text-white"} 
                px-4 py-3 shadow-sm max-w-[85%]
                ${isFirstInGroup && isLastInGroup ? "rounded-2xl" : ""}
                ${isFirstInGroup && !isLastInGroup ? "rounded-t-2xl rounded-br-2xl rounded-bl-lg" : ""}
                ${!isFirstInGroup && isLastInGroup ? "rounded-b-2xl rounded-tr-2xl rounded-tl-lg" : ""}
                ${!isFirstInGroup && !isLastInGroup ? "rounded-tr-2xl rounded-bl-lg rounded-br-lg" : ""}
              `}
            >
              {message.content}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

