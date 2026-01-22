import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, X, MessageSquare, FileText, Pen, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

export type ChatMessage = {
    role: "user" | "ai"
    content: string
}

interface LinkedInChatInterfaceProps {
    isDark: boolean
    copilotContext: string
    chatMessages: ChatMessage[]
    copilotPrompts: string[]
    handleSendMessage: (message: string) => void
    onClose: () => void
    onClear: () => void
    isLoading?: boolean
}

export function LinkedInChatInterface({
    isDark,
    chatMessages,
    handleSendMessage,
    onClose,
    onClear,
    isLoading = false
}: LinkedInChatInterfaceProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const [inputMessage, setInputMessage] = useState("")

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [chatMessages, isLoading])

    const onSend = () => {
        if (!inputMessage.trim()) return
        handleSendMessage(inputMessage)
        setInputMessage("")
    }

    const quickActions = [
        {
            icon: FileText,
            title: "Full Profile Audit",
            description: "Analyze my profile for optimization opportunities",
            prompt: "Analyze my LinkedIn profile and tell me what I should improve"
        },
        {
            icon: Pen,
            title: "Rewrite Headline",
            description: "Make my headline more impactful",
            prompt: "Rewrite my headline to be more impactful and keyword-rich"
        }
    ]

    return (
        <div className={cn(
            "h-full flex flex-col",
            isDark ? "bg-zinc-950" : "bg-white"
        )}>
            <div className={cn(
                "flex items-center justify-between px-4 py-3 border-b shrink-0",
                isDark ? "border-zinc-800" : "border-zinc-100"
            )}>
                <span className={cn(
                    "text-sm font-medium",
                    isDark ? "text-zinc-200" : "text-zinc-800"
                )}>
                    AI Assistant
                </span>
                <div className="flex items-center gap-2">
                    {chatMessages.length > 0 && (
                        <button
                            onClick={onClear}
                            className={cn(
                                "text-xs font-medium px-2 py-1 rounded transition-colors",
                                isDark 
                                    ? "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800" 
                                    : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
                            )}
                        >
                            Clear
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className={cn(
                            "w-7 h-7 rounded flex items-center justify-center transition-colors",
                            isDark 
                                ? "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800" 
                                : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
                        )}
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {chatMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center px-6">
                        <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center mb-4",
                            isDark ? "bg-zinc-800" : "bg-zinc-100"
                        )}>
                            <MessageSquare className={cn(
                                "w-5 h-5",
                                isDark ? "text-zinc-400" : "text-zinc-500"
                            )} />
                        </div>
                        
                        <h3 className={cn(
                            "text-base font-semibold mb-1 text-center",
                            isDark ? "text-white" : "text-zinc-900"
                        )}>
                            How can I help?
                        </h3>
                        <p className={cn(
                            "text-sm text-center mb-8 max-w-xs",
                            isDark ? "text-zinc-500" : "text-zinc-500"
                        )}>
                            I can analyze your profile, rewrite sections, or suggest improvements.
                        </p>

                        <div className="w-full max-w-sm space-y-2">
                            {quickActions.map((action) => (
                                <button
                                    key={action.title}
                                    onClick={() => !isLoading && handleSendMessage(action.prompt)}
                                    disabled={isLoading}
                                    className={cn(
                                        "w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all group",
                                        isDark 
                                            ? "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900" 
                                            : "bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-sm"
                                    )}
                                >
                                    <div className={cn(
                                        "w-8 h-8 rounded-md flex items-center justify-center shrink-0 transition-colors",
                                        isDark ? "bg-zinc-800 group-hover:bg-zinc-700" : "bg-zinc-100 group-hover:bg-zinc-200"
                                    )}>
                                        <action.icon className={cn(
                                            "w-4 h-4",
                                            isDark ? "text-zinc-400" : "text-zinc-600"
                                        )} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <span className={cn(
                                                "text-sm font-medium",
                                                isDark ? "text-zinc-200" : "text-zinc-800"
                                            )}>
                                                {action.title}
                                            </span>
                                            <ArrowUpRight className={cn(
                                                "w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity",
                                                isDark ? "text-zinc-500" : "text-zinc-400"
                                            )} />
                                        </div>
                                        <p className={cn(
                                            "text-xs mt-0.5",
                                            isDark ? "text-zinc-500" : "text-zinc-500"
                                        )}>
                                            {action.description}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="p-4 space-y-4">
                        {chatMessages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "flex",
                                    msg.role === "user" ? "justify-end" : "justify-start"
                                )}
                            >
                                <div className={cn(
                                    "max-w-[85%] rounded-xl px-4 py-2.5 text-sm",
                                    msg.role === "user"
                                        ? "bg-zinc-900 text-white"
                                        : isDark
                                            ? "bg-zinc-800 text-zinc-200"
                                            : "bg-zinc-100 text-zinc-800"
                                )}>
                                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className={cn(
                                    "rounded-xl px-4 py-3",
                                    isDark ? "bg-zinc-800" : "bg-zinc-100"
                                )}>
                                    <div className="flex items-center gap-1.5">
                                        <div className={cn(
                                            "w-1.5 h-1.5 rounded-full animate-pulse",
                                            isDark ? "bg-zinc-500" : "bg-zinc-400"
                                        )} />
                                        <div className={cn(
                                            "w-1.5 h-1.5 rounded-full animate-pulse [animation-delay:150ms]",
                                            isDark ? "bg-zinc-500" : "bg-zinc-400"
                                        )} />
                                        <div className={cn(
                                            "w-1.5 h-1.5 rounded-full animate-pulse [animation-delay:300ms]",
                                            isDark ? "bg-zinc-500" : "bg-zinc-400"
                                        )} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            <div className={cn(
                "p-3 border-t shrink-0",
                isDark ? "border-zinc-800" : "border-zinc-100"
            )}>
                <div className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-2",
                    isDark 
                        ? "bg-zinc-900 border-zinc-800 focus-within:border-zinc-700" 
                        : "bg-zinc-50 border-zinc-200 focus-within:border-zinc-300"
                )}>
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && onSend()}
                        placeholder="Ask anything..."
                        disabled={isLoading}
                        className={cn(
                            "flex-1 bg-transparent border-none outline-none text-sm placeholder:text-zinc-400",
                            isDark ? "text-white" : "text-zinc-900"
                        )}
                    />
                    <button
                        onClick={onSend}
                        disabled={!inputMessage.trim() || isLoading}
                        className={cn(
                            "w-7 h-7 rounded-md flex items-center justify-center transition-colors",
                            inputMessage.trim()
                                ? isDark
                                    ? "bg-white text-black hover:bg-zinc-200"
                                    : "bg-zinc-900 text-white hover:bg-zinc-700"
                                : isDark
                                    ? "bg-zinc-800 text-zinc-600"
                                    : "bg-zinc-200 text-zinc-400"
                        )}
                    >
                        <Send className="w-3.5 h-3.5" />
                    </button>
                </div>
                <p className={cn(
                    "text-[10px] text-center mt-2",
                    isDark ? "text-zinc-600" : "text-zinc-400"
                )}>
                    AI responses may need review for accuracy
                </p>
            </div>
        </div>
    )
}
