import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
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
                "fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 group",
                isDark
                    ? "text-white border border-[#BC9CE2]/30"
                    : "bg-white text-[#815FAA] border border-[#DFC4FF]/50"
            )}
            style={{
                background: isDark 
                    ? 'linear-gradient(135deg, #684C8A 0%, #815FAA 100%)' 
                    : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(223,196,255,0.1) 100%)',
                boxShadow: isDark
                    ? '0 8px 32px rgba(129, 95, 170, 0.4), 0 0 0 1px rgba(188, 156, 226, 0.2)'
                    : '0 8px 32px rgba(129, 95, 170, 0.15), 0 0 0 1px rgba(223, 196, 255, 0.3)',
            }}
        >
            {/* Animated glow ring */}
            <div 
                className="absolute inset-0 rounded-2xl animate-pulse opacity-30 group-hover:opacity-50" 
                style={{ 
                    background: 'linear-gradient(135deg, #815FAA 0%, #DFC4FF 100%)',
                    filter: 'blur(8px)',
                    zIndex: -1
                }}
            />

            <div 
                className="flex items-center justify-center w-9 h-9 rounded-xl"
                style={{ 
                    background: isDark 
                        ? 'rgba(223, 196, 255, 0.2)' 
                        : 'linear-gradient(135deg, #815FAA 0%, #9D7FC1 100%)',
                }}
            >
                <Sparkles className={cn(
                    "w-4 h-4",
                    isDark ? "text-[#DFC4FF]" : "text-white"
                )} />
            </div>

            <div className="flex flex-col items-start">
                <span className="text-sm font-bold tracking-tight">Ask Copilot</span>
                <span className={cn(
                    "text-[10px] font-medium",
                    isDark ? "text-[#DFC4FF]" : "text-[#9D7FC1]"
                )}>
                    Get instant help
                </span>
            </div>
        </motion.button>
    )
}
