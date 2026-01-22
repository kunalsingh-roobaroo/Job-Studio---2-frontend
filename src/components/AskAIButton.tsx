import { useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, MessageSquarePlus } from "lucide-react"
import { cn } from "@/lib/utils"

interface AskAIButtonProps {
    onClick: () => void
    isDark?: boolean
}

export function AskAIButton({ onClick, isDark = false }: AskAIButtonProps) {
    return (
        <motion.button
            onClick={onClick}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
                "fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-full shadow-lg transition-all duration-300 group",
                isDark
                    ? "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/30 text-white"
                    : "bg-white hover:bg-gray-50 shadow-indigo-500/20 text-indigo-600 border border-indigo-100"
            )}
        >
            <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping opacity-20 group-hover:opacity-40" />

            <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full",
                isDark ? "bg-indigo-500 text-white" : "bg-indigo-50 text-indigo-600"
            )}>
                <Sparkles className="w-4 h-4" />
            </div>

            <div className="flex flex-col items-start">
                <span className="text-sm font-bold tracking-tight">Ask Copilot</span>
                <span className={cn(
                    "text-[10px] font-medium",
                    isDark ? "text-indigo-200" : "text-gray-500"
                )}>
                    Get instant help
                </span>
            </div>
        </motion.button>
    )
}
