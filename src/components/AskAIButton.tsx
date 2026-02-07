import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface AskAIButtonProps {
    onClick: () => void
    isDark?: boolean
}

/**
 * Floating Action Pill - "Ask Copilot" button
 * 
 * Design: Brand purple gradient pill with white text
 * Position: Fixed bottom-right corner
 * Interaction: Lifts and scales on hover
 * 
 * Brand Purple Palette:
 * - Lightest: #DFC4FF
 * - Lighter: #BC9CE2
 * - Light: #9D7FC1
 * - Base: #815FAA
 * - Darkest: #684C8A
 */
export function AskAIButton({ onClick, isDark = false }: AskAIButtonProps) {
    return (
        <motion.button
            onClick={onClick}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ 
                y: -4, 
                scale: 1.02,
                transition: { type: "spring", stiffness: 400, damping: 25 }
            }}
            whileTap={{ scale: 0.97 }}
            transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 30,
                delay: 0.3 
            }}
            className={cn(
                "fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50",
                "flex items-center gap-2 sm:gap-3 px-4 py-3 sm:px-6 sm:py-4 rounded-full",
                "bg-gradient-to-r from-[#815FAA] to-[#684C8A] text-white",
                "shadow-[0_20px_50px_rgba(129,95,170,0.35)]",
                "transition-shadow duration-300",
                "hover:shadow-[0_25px_60px_rgba(129,95,170,0.45)]",
                "focus:outline-none focus:ring-2 focus:ring-[#815FAA] focus:ring-offset-2",
                isDark && "focus:ring-offset-[#0A0A0B]"
            )}
        >
            {/* Sparkle icon with light purple background */}
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/20">
                <Sparkles className="w-4 h-4 text-white" />
            </div>

            {/* Text content */}
            <div className="flex flex-col items-start">
                <span className="text-[13px] sm:text-[15px] font-semibold tracking-tight">
                    Ask Copilot
                </span>
                <span className="text-[10px] sm:text-[11px] font-medium text-white/70 hidden sm:block">
                    Get instant help
                </span>
            </div>
        </motion.button>
    )
}
