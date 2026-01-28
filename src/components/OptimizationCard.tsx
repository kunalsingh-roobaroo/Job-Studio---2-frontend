import { motion, AnimatePresence } from "framer-motion"
import {
    ChevronDown,
    Sparkles,
    CircleAlert,
    Type,
    User,
    Briefcase,
    GraduationCap,
    Cpu,
    Globe,
    LayoutTemplate,
    CheckCircle2,
    ArrowRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { LinkedInReviewPillar } from "@/services/api/types"

interface OptimizationCardProps {
    pillar: LinkedInReviewPillar
    isDark: boolean
    isExpanded: boolean
    onToggle: (id: string) => void
    onDiscuss: (title: string, prompts: string[], isReview: boolean, sectionId?: string, initialMessage?: string) => void
}

export function OptimizationCard({
    pillar,
    isDark,
    isExpanded,
    onToggle,
    onDiscuss,
}: OptimizationCardProps) {

    // Helper: Determine Status Color
    const getStatusConfig = (score: number) => {
        if (score >= 8) return {
            color: "emerald",
            text: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-50 dark:bg-emerald-900/10",
            border: "border-emerald-500",
            accent: "bg-emerald-500"
        }
        if (score >= 5) return {
            color: "amber",
            text: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-50 dark:bg-amber-900/10",
            border: "border-amber-500",
            accent: "bg-amber-500"
        }
        return {
            color: "red",
            text: "text-red-600 dark:text-red-400",
            bg: "bg-red-50 dark:bg-red-900/10",
            border: "border-red-500",
            accent: "bg-red-500"
        }
    }

    const config = getStatusConfig(pillar.score)

    // Helper: Get Icon based on title
    const getIcon = (title: string) => {
        const t = title.toLowerCase()
        if (t.includes("headline")) return Type
        if (t.includes("about") || t.includes("summary")) return User
        if (t.includes("experience") || t.includes("work")) return Briefcase
        if (t.includes("education")) return GraduationCap
        if (t.includes("skills")) return Cpu
        if (t.includes("languages")) return Globe
        return LayoutTemplate
    }

    const Icon = getIcon(pillar.title)

    // Component: Alert Row
    const AlertRow = ({ text, index, onClick }: { text: string; index: number; onClick: () => void }) => {
        const formatText = (content: string) => {
            const parts = content.split(/(\$\d+(?:[.,]\d+)?[kKmMbB]?|\d+%)/g);
            return parts.map((part, i) => {
                if (part.match(/^(\$\d+(?:[.,]\d+)?[kKmMbB]?|\d+%)/)) {
                    return (
                        <span key={i} className={cn(
                            "px-1.5 py-0.5 rounded text-xs font-mono font-medium mx-1",
                            isDark ? "bg-indigo-500/10 text-indigo-300" : "bg-indigo-50 text-indigo-700"
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
                    "group flex items-start sm:items-center justify-between p-3.5 rounded-lg cursor-pointer transition-all duration-200 border",
                    isDark
                        ? "bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800 hover:border-zinc-700 hover:shadow-md"
                        : "bg-white border-zinc-100 hover:border-indigo-100 hover:shadow-md hover:bg-indigo-50/30"
                )}
            >
                <div className="flex items-start gap-3.5">
                    <div className={cn(
                        "mt-0.5 p-1.5 rounded-md shrink-0 transition-colors",
                        isDark ? "bg-red-500/10 text-red-400 group-hover:bg-red-500/20" : "bg-red-50 text-red-600 group-hover:bg-red-100"
                    )}>
                        <CircleAlert className="w-4 h-4" />
                    </div>
                    <span className={cn(
                        "text-sm font-medium leading-normal",
                        isDark ? "text-zinc-300 group-hover:text-zinc-100" : "text-zinc-600 group-hover:text-zinc-900"
                    )}>
                        {formatText(text)}
                    </span>
                </div>

                <div className={cn(
                    "pl-2 text-indigo-500 opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0"
                )}>
                    <ArrowRight className="w-4 h-4" />
                </div>
            </motion.div>
        )
    }

    return (
        <motion.div
            layout
            initial={false}
            className={cn(
                "relative rounded-xl overflow-hidden transition-all duration-300 group mb-4",
                isDark
                    ? "bg-[#0C0C0C] border border-zinc-800"
                    : "bg-white border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
            )}
            whileHover={{ y: -2, zIndex: 10, boxShadow: isDark ? "0 4px 12px rgba(0,0,0,0.3)" : "0 8px 16px rgba(0,0,0,0.06)" }}
        >
            {/* Status Strip (Left Border) - 3px width */}
            <div className={cn(
                "absolute left-0 top-0 bottom-0 w-[3px]",
                config.accent
            )} />

            {/* Header / Summary Row */}
            <div
                onClick={() => onToggle(pillar.id)}
                className="relative pl-6 pr-5 py-5 cursor-pointer flex items-center justify-between select-none"
            >
                <div className="flex items-center gap-5">
                    {/* Icon - Directly colored, no background circle */}
                    <div className={cn(
                        "transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
                        config.text
                    )}>
                        <Icon strokeWidth={1.5} className="w-6 h-6" />
                    </div>

                    {/* Text Hierarchy */}
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <h3 className={cn(
                                "text-base font-semibold tracking-tight",
                                isDark ? "text-white" : "text-gray-900"
                            )}>
                                {pillar.title}
                            </h3>
                            {/* Mini Status Pill for Mobile/Space efficiency */}
                            {pillar.fixChecklist.length === 0 && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            )}
                        </div>

                        <span className={cn(
                            "text-xs font-normal flex items-center gap-1.5",
                            isDark ? "text-zinc-500" : "text-zinc-500"
                        )}>
                            {pillar.fixChecklist.length > 0 ? (
                                <>
                                    <span className={cn(
                                        "inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold",
                                        isDark ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-600"
                                    )}>
                                        {pillar.fixChecklist.length}
                                    </span>
                                    <span>Action items remaining</span>
                                </>
                            ) : (
                                <span className={cn("text-emerald-500 font-medium")}>All checks passed</span>
                            )}
                        </span>
                    </div>
                </div>

                {/* Right Side: Score Pill & Toggle */}
                <div className="flex items-center gap-4">
                    {/* Score Pill */}
                    <div className={cn(
                        "hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ring-1 ring-inset",
                        isDark ? "bg-zinc-900 ring-zinc-700" : "bg-gray-50 ring-gray-200"
                    )}>
                        <span className={cn(config.text)}>
                            {pillar.score}/10
                        </span>
                    </div>

                    <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200",
                        isDark ? "bg-zinc-800 text-zinc-400 group-hover:text-white" : "bg-gray-50 text-gray-400 group-hover:text-gray-900"
                    )}>
                        <ChevronDown className={cn(
                            "w-4 h-4 transition-transform duration-300",
                            isExpanded ? "rotate-180" : ""
                        )} />
                    </div>
                </div>
            </div>

            {/* Diagnostic Pane (Expanded) */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                    >
                        <div className={cn(
                            "px-6 pb-6 pt-2 border-t",
                            isDark ? "border-zinc-800" : "border-gray-50"
                        )}>
                            {/* Diagnostic Reasoning */}
                            <p className={cn(
                                "text-sm leading-relaxed mb-6 pl-11",
                                isDark ? "text-zinc-400" : "text-gray-600"
                            )}>
                                {pillar.reason}
                            </p>

                            {/* Issues List */}
                            <div className="space-y-2 pl-2">
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

                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    const autoFixPrompt = "Please analyze and improve the " + pillar.title + " section. Here are the issues detected: " + pillar.fixChecklist.join(", ");
                                    onDiscuss(pillar.title, pillar.copilotPrompts, true, pillar.id, autoFixPrompt)
                                }}
                                className={cn(
                                    "group w-full flex items-center justify-center gap-2 py-3 rounded-lg transition-all duration-200 mt-5 border font-medium relative overflow-hidden",
                                    isDark
                                        ? "bg-indigo-600/10 border-indigo-500/20 text-indigo-300 hover:bg-indigo-600/20 hover:border-indigo-500/40"
                                        : "bg-white border-indigo-100 text-indigo-600 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/10"
                                )}
                            >
                                <span className={cn(
                                    "absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"
                                )} />
                                <Sparkles className="w-4 h-4 text-indigo-500" />
                                <span>Auto-Fix with Copilot</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
