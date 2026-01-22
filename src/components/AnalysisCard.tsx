import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Sparkles, CircleAlert, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
// Import type from API types
import type { LinkedInReviewPillar } from "@/services/api/types"

interface AnalysisCardProps {
    pillar: LinkedInReviewPillar
    isDark: boolean
    isExpanded: boolean
    onToggle: (id: string) => void
    onDiscuss: (title: string, prompts: string[], isReview: boolean, sectionId?: string, initialMessage?: string) => void
}

export function AnalysisCard({
    pillar,
    isDark,
    isExpanded,
    onToggle,
    onDiscuss,
}: AnalysisCardProps) {
    // Score Ring Component (Mini Radial)
    const ScoreRing = ({ score }: { score: number }) => {
        const radius = 16
        const circumference = 2 * Math.PI * radius
        const progress = (score / 10) * circumference

        let color = "#EF4444" // Red (0-4)
        if (score >= 8) color = "#10B981" // Emerald (8-10)
        else if (score >= 5) color = "#F97316" // Orange (5-7)

        return (
            <div className="relative w-10 h-10 flex items-center justify-center">
                {/* Background Track */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="20"
                        cy="20"
                        r={radius}
                        stroke={isDark ? "rgba(255,255,255,0.1)" : "#E5E7EB"}
                        strokeWidth="3"
                        fill="none"
                    />
                    {/* Progress Indicator */}
                    <circle
                        cx="20"
                        cy="20"
                        r={radius}
                        stroke={color}
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray={`${progress} ${circumference}`}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                {/* Center Text */}
                <span className={cn(
                    "absolute text-xs font-bold font-mono",
                    isDark ? "text-white" : "text-gray-900"
                )}>
                    {score}
                </span>
            </div>
        )
    }

    // AlertRow Component (Issues List)
    const AlertRow = ({ text, index, onClick }: { text: string; index: number; onClick: () => void }) => {
        // Highlight logic: finding dollar amounts or keywords to badge
        // Simple regex for money ($X) or common keywords
        const formatText = (content: string) => {
            const parts = content.split(/(\$\d+(?:[.,]\d+)?[kKmMbB]?|\d+%)/g);
            return parts.map((part, i) => {
                if (part.match(/^(\$\d+(?:[.,]\d+)?[kKmMbB]?|\d+%)/)) {
                    return (
                        <span key={i} className={cn(
                            "px-1.5 py-0.5 rounded text-xs font-mono mx-1",
                            isDark ? "bg-white/10 text-white" : "bg-zinc-100 text-zinc-900"
                        )}>
                            {part}
                        </span>
                    )
                }
                return part;
            });
        };

        return (
            <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 + 0.1 }}
                onClick={(e) => {
                    e.stopPropagation()
                    onClick()
                }}
                className={cn(
                    "group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 border border-transparent",
                    isDark
                        ? "hover:bg-white/5 hover:border-white/5 active:bg-white/10"
                        : "hover:bg-zinc-50 hover:border-zinc-200 active:bg-zinc-100"
                )}
            >
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "p-1.5 rounded-md",
                        isDark ? "bg-amber-500/10 text-amber-500" : "bg-amber-50 text-amber-600"
                    )}>
                        <CircleAlert className="w-4 h-4" />
                    </div>
                    <span className={cn(
                        "text-sm font-medium",
                        isDark ? "text-zinc-300 group-hover:text-white" : "text-zinc-600 group-hover:text-zinc-900"
                    )}>
                        {formatText(text)}
                    </span>
                </div>

                <ChevronRight className={cn(
                    "w-4 h-4 transition-all opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0",
                    isDark ? "text-zinc-500" : "text-zinc-400"
                )} />
            </motion.div>
        )
    }

    // Magic Button Component
    const MagicButton = () => (
        <button
            onClick={(e) => {
                e.stopPropagation()
                const autoFixPrompt = "Please analyze and improve the " + pillar.title + " section. Here are the issues detected: " + pillar.fixChecklist.join(", ");
                onDiscuss(pillar.title, pillar.copilotPrompts, true, pillar.id, autoFixPrompt)
            }}
            className={cn(
                "group w-full flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all duration-200 mt-2",
                isDark
                    ? "bg-white text-black hover:bg-zinc-200 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                    : "bg-zinc-900 text-white hover:bg-black shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
            )}
        >
            <Sparkles className="w-4 h-4 transition-transform group-hover:rotate-12" />
            <span className="text-xs font-semibold tracking-wide">
                Auto-Fix with Copilot
            </span>
        </button>
    )

    return (
        <motion.div
            layout
            className={cn(
                "rounded-xl overflow-hidden mb-3 transition-all duration-300",
                isDark
                    ? "bg-[#0C0C0C] border border-white/10 shadow-none"
                    : "bg-white border border-zinc-200 shadow-sm"
            )}
        >
            {/* Header Section */}
            <div
                onClick={() => onToggle(pillar.id)}
                className={cn(
                    "p-4 cursor-pointer flex items-center justify-between group select-none",
                    isDark ? "hover:bg-white/[0.02]" : "hover:bg-zinc-50/50"
                )}
            >
                <div>
                    <h3 className={cn(
                        "text-sm font-semibold mb-1 transition-colors",
                        isDark
                            ? "text-zinc-200 group-hover:text-white"
                            : "text-zinc-800 group-hover:text-black"
                    )}>
                        {pillar.title}
                    </h3>
                    <p className={cn("text-xs uppercase tracking-widest font-medium", isDark ? "text-zinc-600" : "text-zinc-400")}>
                        Optimization Score
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Score Ring */}
                    <div className="flex flex-col items-center">
                        <ScoreRing score={pillar.score} />
                    </div>

                    {/* Chevron */}
                    <div className={cn(
                        "transition-transform duration-300",
                        isExpanded ? "rotate-180" : ""
                    )}>
                        <ChevronDown className={cn("w-4 h-4", isDark ? "text-zinc-600" : "text-zinc-400")} />
                    </div>
                </div>
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }} // "Quart" ease
                        className="overflow-hidden"
                    >
                        <div className={cn(
                            "px-4 pb-4 space-y-4",
                            isDark ? "border-t border-white/5" : "border-t border-zinc-100"
                        )}>
                            {/* Context/Reasoning */}
                            <div className="pt-4">
                                <p className={cn("text-sm leading-relaxed", isDark ? "text-zinc-400" : "text-zinc-500")}>
                                    {pillar.reason}
                                </p>
                            </div>

                            {/* Action Plan (Alert Rows) */}
                            <div>
                                <h4 className={cn(
                                    "text-xs font-semibold uppercase tracking-wider mb-2",
                                    isDark ? "text-zinc-500" : "text-zinc-400"
                                )}>
                                    ISSUES DETECTED
                                </h4>
                                <div className="space-y-0.5">
                                    {pillar.fixChecklist.map((fix, i) => (
                                        <AlertRow
                                            key={i}
                                            text={fix}
                                            index={i}
                                            onClick={() => onDiscuss(
                                                pillar.title,
                                                [`How do I fix: "${fix}"?`, ...pillar.copilotPrompts],
                                                true,
                                                pillar.id,
                                                `How do I fix the issue: "${fix}"?`
                                            )}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="pt-2">
                                <MagicButton />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
