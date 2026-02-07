import { useEffect, useRef, useState } from "react"
import { MessageBubble } from "./MessageBubble"
import type { Message } from "./ChatShell"
import { TypingIndicator } from "./TypingIndicator"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnimatedOrb } from "./AnimatedOrb"
import { FloatingPrompts } from "./FloatingPrompts"
import { motion } from "framer-motion"

interface MessageListProps {
  messages: Message[]
  isStreaming: boolean
  error: string | null
  onRetry: () => void
  isLoaded: boolean
  onPromptClick?: (prompt: string) => void
  profileContext?: {
    hasHeadlineIssues?: boolean
    hasAboutIssues?: boolean
    hasExperienceIssues?: boolean
    hasSkillsIssues?: boolean
    overallScore?: number
  }
  currentSection?: string | null
  improvePrompts?: Array<{ label: string; prompt: string }>
}

const LAUNCH_SOUND_URL = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/launch-SUi0itAGHr1wtvdDYYG5bzFLsIYHtP.mp3"

export function MessageList({ messages, isStreaming, error, onRetry, isLoaded, onPromptClick, profileContext, currentSection, improvePrompts }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const rafRef = useRef<number | null>(null)
  const [hasAnimated, setHasAnimated] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const lastScrollRef = useRef<number>(0)
  const hasPlayedIntroRef = useRef(false)

  useEffect(() => {
    if (!isLoaded) return

    if (messages.length === 0 && !hasPlayedIntroRef.current) {
      setHasAnimated(true)
      hasPlayedIntroRef.current = true

      audioRef.current = new Audio(LAUNCH_SOUND_URL)
      audioRef.current.volume = 0.5
      audioRef.current.play().catch(() => {})
    } else if (messages.length > 0) {
      setHasAnimated(false)
      hasPlayedIntroRef.current = true
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [isLoaded, messages.length])

  useEffect(() => {
    if (!containerRef.current) return
    const container = containerRef.current
    container.scrollTop = container.scrollHeight
    setAutoScroll(true)
  }, [messages.length])

  useEffect(() => {
    if (!isStreaming || !autoScroll || !containerRef.current) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      return
    }

    const container = containerRef.current
    lastScrollRef.current = container.scrollTop

    const smoothScroll = () => {
      if (!container) return

      const { scrollHeight, clientHeight } = container
      const targetScroll = scrollHeight - clientHeight
      const currentScroll = lastScrollRef.current
      const diff = targetScroll - currentScroll

      if (diff > 0.5) {
        const newScroll = currentScroll + diff * 0.03
        lastScrollRef.current = newScroll
        container.scrollTop = newScroll
      }

      rafRef.current = requestAnimationFrame(smoothScroll)
    }

    rafRef.current = requestAnimationFrame(smoothScroll)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [isStreaming, autoScroll])

  const handleScroll = () => {
    if (!containerRef.current || isStreaming) return

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 150
    setAutoScroll(isAtBottom)
  }

  const lastMessage = messages[messages.length - 1]
  const showTypingIndicator =
    isStreaming &&
    (messages.length === 0 ||
      lastMessage?.role === "user" ||
      (lastMessage?.role === "assistant" && lastMessage?.content === ""))

  if (!isLoaded) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatedOrb size={64} />
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="absolute inset-0 overflow-y-auto pt-16 pb-40 space-y-4 border-none pl-6 pr-[25px] custom-scrollbar"
      role="log"
      aria-label="Chat messages"
      aria-live="polite"
    >
      {messages.length === 0 && !error && !isStreaming && (
        <div className="flex flex-col items-center justify-center h-full text-center text-stone-400 px-4">
          <div className={`mb-4 ${hasAnimated ? "orb-intro" : ""}`}>
            <AnimatedOrb size={128} />
          </div>
          <p className={`text-lg font-medium text-gray-500 ${hasAnimated ? "text-blur-intro" : ""}`}>
            Hi, my name is Roo
          </p>
          <p className={`text-sm mt-1 mb-8 text-gray-400 ${hasAnimated ? "text-blur-intro-delay" : ""}`}>
            {improvePrompts && improvePrompts.length > 0
              ? "I found some issues in your profile. Choose one to fix:"
              : "Ask me anything about optimizing your LinkedIn profile"}
          </p>
          
          {/* Issue-based Prompts for Improve Mode */}
          {improvePrompts && improvePrompts.length > 0 && onPromptClick ? (
            <div className="w-full max-w-md mt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {improvePrompts.map((item, index) => (
                  <motion.button
                    key={index}
                    onClick={() => onPromptClick(item.prompt)}
                    className="relative text-center p-4 rounded-xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08, type: "spring", stiffness: 300, damping: 24 }}
                  >
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors block leading-snug">
                      {item.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            /* Default Floating Prompts for non-improve modes */
            onPromptClick && (
              <div className="w-full max-w-md mt-4">
                <FloatingPrompts 
                  onPromptClick={onPromptClick}
                  profileContext={profileContext}
                  currentSection={currentSection}
                />
              </div>
            )
          )}
        </div>
      )}

      {messages
        .filter((message) => {
          if (isStreaming && message.role === "assistant" && message === lastMessage && message.content === "") {
            return false
          }
          return true
        })
        .map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isStreaming={isStreaming && message.role === "assistant" && message === lastMessage}
          />
        ))}

      {showTypingIndicator && <TypingIndicator />}

      {error && (
        <div
          className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl"
          role="alert"
          style={{
            boxShadow:
              "rgba(14, 63, 126, 0.04) 0px 0px 0px 1px, rgba(42, 51, 69, 0.04) 0px 1px 1px -0.5px, rgba(42, 51, 70, 0.04) 0px 3px 3px -1.5px, rgba(42, 51, 70, 0.04) 0px 6px 6px -3px, rgba(14, 63, 126, 0.04) 0px 12px 12px -6px, rgba(14, 63, 126, 0.04) 0px 24px 24px -12px",
          }}
        >
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Something went wrong</p>
            <p className="text-xs text-red-600 mt-0.5">{error}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="text-red-600 hover:text-red-700 hover:bg-red-100 transition-colors"
            aria-label="Retry sending message"
          >
            <RefreshCw className="w-4 h-4 mr-1" aria-hidden="true" />
            Retry
          </Button>
        </div>
      )}

      <div ref={bottomRef} aria-hidden="true" className="h-20" />
    </div>
  )
}
