import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Check, AlertCircle, ChevronRight, Sparkles } from "lucide-react"
import type { ChecklistItem } from "@/services/api/types"
import { AutoFixButton } from "@/components/ui/AutoFixButton"

interface ParameterCardProps {
    item: ChecklistItem
    isExpanded: boolean
    onToggle: () => void
    onAutoFix: () => void
    isDark?: boolean
    accentColor?: string
}

export function ParameterCard({
    item,
    isExpanded,
    onToggle,
    onAutoFix,
    isDark = false,
    accentColor = "var(--primary-500)",
}: ParameterCardProps) {
    const isPassed = item.status === "pass"

    return (
        <div
            className={cn(
                "rounded-xl transition-all duration-200 border group",
                isDark
                    ? "bg-zinc-900 border-zinc-800"
                    : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm"
            )}
            style={{
                borderColor: isExpanded
                    ? accentColor
                    : undefined
            }}
        >
            <button
                onClick={onToggle}
                className="w-full flex items-center gap-3 p-3.5 text-left"
            >
                <div
                    className={cn(
                        "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                        isPassed
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                            : isDark ? "bg-zinc-800 text-zinc-400" : "bg-gray-50 text-gray-400"
                    )}
                >
                    {isPassed ? (
                        <Check className="w-3.5 h-3.5" />
                    ) : (
                        <AlertCircle className="w-3.5 h-3.5" style={{ color: !isPassed ? accentColor : undefined }} />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <span className={cn(
                        "text-sm font-medium block truncate transition-colors",
                        isDark ? "text-gray-200" : "text-gray-900"
                    )}>
                        {item.title}
                    </span>
                </div>

                {!isPassed && item.scoreImpact > 0 && (
                    <span
                        className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0",
                            isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600"
                        )}
                    >
                        +{item.scoreImpact}
                    </span>
                )}

                <ChevronRight
                    className={cn(
                        "w-4 h-4 shrink-0 transition-transform text-gray-400",
                        isExpanded && "rotate-90"
                    )}
                />
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden"
                    >
                        <div className={cn(
                            "px-4 pb-4 pt-1",
                            isDark ? "text-gray-400" : "text-gray-600"
                        )}>
                            <p className="text-xs leading-relaxed mb-3">
                                {item.reasoning}
                            </p>

                            {item.bestPractice && (
                                <div className={cn(
                                    "text-xs p-3 rounded-lg mb-3 flex gap-2",
                                    isDark ? "bg-zinc-800/50" : "bg-gray-50"
                                )}>
                                    <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
                                    <span>
                                        <span className="font-semibold block mb-0.5 text-amber-600 dark:text-amber-500">Pro Tip:</span>
                                        {item.bestPractice}
                                    </span>
                                </div>
                            )}

                            {!isPassed && (
                                <AutoFixButton
                                    variant="glass-glow"
                                    size="md"
                                    label="Fix with Copilot"
                                    loadingLabel="Fixing..."
                                    className="w-full justify-center"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onAutoFix()
                                    }}
                                />
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
