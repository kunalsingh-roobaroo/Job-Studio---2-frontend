import { useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Check,
    X,
    Copy,
    Edit3,
    Sparkles,
    ChevronDown,
    ChevronUp
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CreationCardProps {
    id: string
    title: string
    content: string
    isDark: boolean
    isExpanded: boolean
    isEditing: boolean
    isCopied: boolean
    currentEditContent: string
    onToggle: () => void
    onEditChange: (value: string) => void
    onSave: () => void
    onCancel: () => void
    onStartEdit: () => void
    onCopy: () => void
    onDiscuss: () => void
}

export function CreationCard({
    title,
    isDark,
    isExpanded,
    isEditing,
    isCopied,
    currentEditContent,
    onToggle,
    onEditChange,
    onSave,
    onCancel,
    onStartEdit,
    onCopy,
    onDiscuss,
}: CreationCardProps) {
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

    // Magic Button
    const MagicButton = () => (
        <button
            onClick={(e) => {
                e.stopPropagation()
                onDiscuss()
            }}
            className="group relative px-4 py-2 overflow-hidden rounded-lg bg-white shadow-sm transition-all hover:shadow border border-[#BC9CE2] hover:bg-[#DFC4FF]/20 flex items-center gap-2"
        >
            <Sparkles className="w-4 h-4 text-[#815FAA] group-hover:scale-110 transition-transform" />
            <span className="text-sm font-semibold text-[#684C8A]">Refine with Copilot</span>
        </button>
    )

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "rounded-2xl overflow-hidden mb-4 transition-all duration-300",
                isDark
                    ? "bg-zinc-900/50 backdrop-blur-md border border-white/10 shadow-none"
                    : "bg-white border border-zinc-200 shadow-sm"
            )}
        >
            {/* Header - Always Visible */}
            <div
                onClick={onToggle}
                className={cn(
                    "w-full px-6 py-4 flex items-center justify-between cursor-pointer transition-colors select-none",
                    isDark ? "hover:bg-white/5" : "hover:bg-zinc-50"
                )}
            >
                <h3 className={cn("text-sm font-bold tracking-wide", isDark ? "text-white" : "text-zinc-900")}>
                    {title}
                </h3>
                <div className="flex items-center gap-3">
                    {/* Quick Actions (Visible when collapsed) */}
                    {!isExpanded && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onCopy()
                            }}
                            className={cn(
                                "p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100",
                                isCopied
                                    ? "bg-emerald-500/10 text-emerald-500"
                                    : isDark ? "hover:bg-white/10 text-zinc-400" : "hover:bg-zinc-100 text-zinc-500"
                            )}
                        >
                            {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                    )}

                    <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                        isDark ? "bg-white/5 text-zinc-400" : "bg-zinc-100 text-zinc-500"
                    )}>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
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
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className={cn(
                            "px-6 pb-6 pt-2 border-t",
                            isDark ? "border-white/5" : "border-zinc-100"
                        )}>
                            {/* Content Area */}
                            <div className={cn(
                                "p-5 rounded-xl mb-4",
                                isDark ? "bg-black/20" : "bg-zinc-50"
                            )}>
                                {isEditing ? (
                                    <textarea
                                        ref={textareaRef}
                                        value={currentEditContent}
                                        onChange={handleInput}
                                        className={cn(
                                            "w-full min-h-[120px] text-base leading-relaxed bg-transparent focus:outline-none resize-none",
                                            isDark ? "text-white placeholder-zinc-700" : "text-zinc-900 placeholder-zinc-400"
                                        )}
                                        placeholder="Enter content..."
                                    />
                                ) : (
                                    <p className={cn(
                                        "text-base leading-relaxed whitespace-pre-line",
                                        isDark ? "text-zinc-300" : "text-zinc-700"
                                    )}>
                                        {currentEditContent}
                                    </p>
                                )}
                            </div>

                            {/* Action Bar */}
                            <div className="flex items-center justify-end gap-3">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={onSave}
                                            className="px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-all flex items-center gap-2"
                                        >
                                            <Check className="h-4 w-4" />
                                            Save
                                        </button>
                                        <button
                                            onClick={onCancel}
                                            className={cn(
                                                "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                                                isDark
                                                    ? "bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10"
                                                    : "bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                                            )}
                                        >
                                            <X className="h-4 w-4" />
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={onCopy}
                                            className={cn(
                                                "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                                                isCopied
                                                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                                    : isDark
                                                        ? "bg-white/5 text-zinc-400 hover:text-white border border-white/10 hover:border-white/20"
                                                        : "bg-white text-zinc-600 hover:text-zinc-900 border border-zinc-200 hover:border-zinc-300"
                                            )}
                                        >
                                            {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                            {isCopied ? "Copied" : "Copy"}
                                        </button>

                                        <button
                                            onClick={onStartEdit}
                                            className={cn(
                                                "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                                                isDark
                                                    ? "bg-white/5 text-zinc-400 hover:text-white border border-white/10 hover:border-white/20"
                                                    : "bg-white text-zinc-600 hover:text-zinc-900 border border-zinc-200 hover:border-zinc-300"
                                            )}
                                        >
                                            <Edit3 className="h-4 w-4" />
                                            Edit
                                        </button>

                                        <MagicButton />
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
