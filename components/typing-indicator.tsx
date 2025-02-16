import { motion } from "framer-motion"

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-start gap-2"
    >
      <div className="flex-shrink-0">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-brEWB5crLa89CpN2HQMiTFJpnuNTud.png"
          alt="Assistant avatar"
          className="w-10 h-10 rounded-full border-2 border-white shadow-lg"
        />
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
        <div className="flex space-x-1">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Number.POSITIVE_INFINITY,
              delay: 0,
            }}
            className="w-2 h-2 bg-blue-400 rounded-full"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Number.POSITIVE_INFINITY,
              delay: 0.2,
            }}
            className="w-2 h-2 bg-blue-400 rounded-full"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Number.POSITIVE_INFINITY,
              delay: 0.4,
            }}
            className="w-2 h-2 bg-blue-400 rounded-full"
          />
        </div>
      </div>
    </motion.div>
  )
}

