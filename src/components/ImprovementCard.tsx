import { useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Check,
    X,
    Copy,
    Edit3,
    Sparkles,
    ChevronDown,
    RefreshCw
} from "lucide-react"
import { cn } from "@/lib/utils"
// Import type from API types
import type { LinkedInImproveSection } from "@/services/api/types"

interface ImprovementCardProps {
    section: LinkedInImproveSection
    isDark: boolean
    isExpanded: boolean
    score: number
    onToggle: () => void
    isEditing: boolean
    isCopied: boolean
    currentEditContent: string
    onEditChange: (value: string) => void
    onSave: () => void
    onCancel: () => void
    onStartEdit: () => void
    onCopy: () => void
    onDiscuss: () => void
}

export function ImprovementCard({
    section,
    isDark,
    isExpanded,
    score,
    onToggle,
    isEditing,
    isCopied,
    currentEditContent,
    onEditChange,
    onSave,
    onCancel,
    onStartEdit,
    onCopy,
    onDiscuss,
}: ImprovementCardProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus()
            textareaRef.current.style.height = "auto"
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"
        }
    }, [isEditing])

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onEditChange(e.target.value)
        e.target.style.height = "auto"
        e.target.style.height = e.target.scrollHeight + "px"
    }

    // Score Ring (Mini)
    const ScoreRing = ({ score }: { score: number }) => {
        const radius = 16
        const circumference = 2 * Math.PI * radius
        const progress = (score / 10) * circumference

        let color = "#EF4444"
        if (score >= 8) color = "#10B981"
        else if (score >= 5) color = "#F97316"

        return (
            <div className="relative w-10 h-10 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="20" cy="20" r={radius} stroke={isDark ? "rgba(255,255,255,0.1)" : "#E5E7EB"} strokeWidth="3" fill="none" />
                    <circle cx="20" cy="20" r={radius} stroke={color} strokeWidth="3" fill="none" strokeDasharray={`${progress} ${circumference}`} strokeLinecap="round" />
                </svg>
                <span className={cn("absolute text-[10px] font-bold font-mono", isDark ? "text-white" : "text-gray-900")}>
                    {score}
                </span>
            </div>
        )
    }

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
            {/* Header */}
            <div
                onClick={onToggle}
                className={cn(
                    "p-4 cursor-pointer flex items-center justify-between group",
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
                        {section.title}
                    </h3>
                    <p className={cn("text-[10px] uppercase tracking-widest font-medium", isDark ? "text-zinc-600" : "text-zinc-400")}>
                        Evolution Status
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                        <ScoreRing score={score} />
                    </div>
                    <div className={cn("transition-transform duration-300", isExpanded ? "rotate-180" : "")}>
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
                        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                        className="overflow-hidden"
                    >
                        <div className={cn(
                            "border-t flex flex-col",
                            isDark ? "border-white/5" : "border-zinc-100"
                        )}>

                            {/* Comparison View (Git Diff) */}
                            <div className="grid grid-cols-1">
                                {/* ORIGINAL (Deletions) */}
                                <div className={cn(
                                    "p-5 border-b relative overflow-hidden",
                                    isDark ? "bg-red-900/5 border-white/5" : "bg-red-50/30 border-zinc-100"
                                )}>
                                    <div className="absolute top-0 bottom-0 left-0 w-1 bg-red-400/20" />
                                    <p className={cn(
                                        "text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2",
                                        isDark ? "text-red-400" : "text-red-600"
                                    )}>
                                        <X className="w-3 h-3" />
                                        Original
                                    </p>
                                    <p className={cn(
                                        "text-sm leading-relaxed line-through opacity-70 font-mono",
                                        isDark ? "text-red-200/50 decoration-red-900/50" : "text-red-900/60 decoration-red-300"
                                    )}>
                                        {section.existingContent}
                                    </p>
                                </div>

                                {/* OPTIMIZED (Additions) */}
                                <div className={cn(
                                    "p-5 relative",
                                    isDark ? "bg-emerald-900/5" : "bg-emerald-50/30"
                                )}>
                                    <div className="absolute top-0 bottom-0 left-0 w-1 bg-emerald-400/20" />
                                    <p className={cn(
                                        "text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2",
                                        isDark ? "text-emerald-400" : "text-emerald-600"
                                    )}>
                                        <Check className="w-3 h-3" />
                                        Optimized
                                    </p>

                                    {isEditing ? (
                                        <textarea
                                            ref={textareaRef}
                                            value={currentEditContent}
                                            onChange={handleInput}
                                            className={cn(
                                                "w-full min-h-[120px] text-sm font-medium leading-relaxed bg-transparent focus:outline-none resize-none transition-colors rounded p-2",
                                                isDark ? "text-emerald-100 bg-black/20" : "text-emerald-900 bg-white/50"
                                            )}
                                            placeholder="Enter your content here..."
                                        />
                                    ) : (
                                        <p className={cn(
                                            "text-sm font-medium leading-relaxed whitespace-pre-line",
                                            isDark ? "text-emerald-100" : "text-emerald-900"
                                        )}>
                                            {currentEditContent}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Reasoning Footer (AI Insight) */}
                            <div className={cn(
                                "px-5 py-3 flex items-start gap-3 border-t",
                                isDark ? "bg-[#0A0A0A] border-white/5" : "bg-zinc-50 border-zinc-100"
                            )}>
                                <div className="mt-0.5">
                                    <Sparkles className={cn("w-3.5 h-3.5", isDark ? "text-purple-400" : "text-purple-600")} />
                                </div>
                                <div className="space-y-1">
                                    <p className={cn("text-[10px] uppercase font-bold tracking-wider", isDark ? "text-zinc-500" : "text-zinc-400")}>
                                        AI Insight
                                    </p>
                                    <p className={cn("text-xs leading-relaxed", isDark ? "text-zinc-400" : "text-zinc-500")}>
                                        {section.remarks}
                                    </p>
                                </div>
                            </div>

                            {/* Action Toolbar */}
                            <div className={cn(
                                "px-3 py-2 flex items-center justify-between border-t",
                                isDark ? "bg-[#0C0C0C] border-white/5" : "bg-white border-zinc-100"
                            )}>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={onCopy}
                                        className={cn(
                                            "h-7 px-2.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors",
                                            isCopied
                                                ? "bg-emerald-500/10 text-emerald-500"
                                                : isDark ? "text-zinc-400 hover:text-zinc-200 hover:bg-white/5" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                                        )}
                                    >
                                        {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                        {isCopied ? "Copied" : "Copy"}
                                    </button>

                                    <button
                                        onClick={onStartEdit}
                                        className={cn(
                                            "h-7 px-2.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors",
                                            isEditing
                                                ? "bg-zinc-100 text-zinc-900 dark:bg-white/10 dark:text-white"
                                                : isDark ? "text-zinc-400 hover:text-zinc-200 hover:bg-white/5" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                                        )}
                                    >
                                        <Edit3 className="w-3 h-3" />
                                        Edit
                                    </button>

                                    <button
                                        onClick={onDiscuss}
                                        className={cn(
                                            "h-7 px-2.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors",
                                            isDark ? "text-zinc-400 hover:text-zinc-200 hover:bg-white/5" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                                        )}
                                    >
                                        <RefreshCw className="w-3 h-3" />
                                        Regenerate
                                    </button>
                                </div>

                                {isEditing && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={onCancel}
                                            className={cn(
                                                "h-7 px-3 rounded text-xs font-medium transition-colors",
                                                isDark ? "text-zinc-400 hover:text-white" : "text-zinc-500 hover:text-zinc-900"
                                            )}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={onSave}
                                            className={cn(
                                                "h-7 px-3 rounded text-xs font-medium flex items-center gap-1.5 shadow-sm transition-colors",
                                                isDark ? "bg-white text-black hover:bg-zinc-200" : "bg-black text-white hover:bg-zinc-800"
                                            )}
                                        >
                                            <Check className="w-3 h-3" />
                                            Apply
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
