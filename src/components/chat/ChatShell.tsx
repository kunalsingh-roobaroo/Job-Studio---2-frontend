import { useState, useEffect, useCallback, useRef } from "react"
import * as React from "react"
import { MessageSquareDashed, X } from "lucide-react"
import { MessageList } from "./MessageList"
import { Composer, type AIModel } from "./Composer"
import { Button } from "@/components/ui/button"

// Data model for messages
export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: Date
  imageData?: string
}

// localStorage key prefix for persisting messages (per project)
const STORAGE_KEY_PREFIX = "chat-messages"
const MODEL_STORAGE_KEY = "chat-selected-model"

// Generates a unique ID for messages
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Get project ID from URL
function getProjectIdFromUrl(): string {
  const pathParts = window.location.pathname.split('/')
  const workspaceIndex = pathParts.indexOf('workspace')
  if (workspaceIndex !== -1 && pathParts[workspaceIndex + 1]) {
    return pathParts[workspaceIndex + 1]
  }
  return 'default'
}

// Helper to get auth token
async function getAuthToken(): Promise<string | undefined> {
  try {
    const { fetchAuthSession } = await import('aws-amplify/auth')
    const session = await fetchAuthSession()
    return session.tokens?.accessToken?.toString()
  } catch {
    return undefined
  }
}

// API helper for chat history
const chatHistoryAPI = {
  async load(projectId: string): Promise<Message[]> {
    if (projectId === 'default') return []
    
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const apiVersion = import.meta.env.VITE_API_VERSION || '/api/v1'
      const token = await getAuthToken()
      
      const response = await fetch(`${apiBaseUrl}${apiVersion}/linkedin/chat-history/${projectId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
      })
      
      if (!response.ok) {
        console.warn(`Failed to load chat history: ${response.status}`)
        return []
      }
      
      const data = await response.json()
      return (data.messages || []).map((msg: { id: string; role: string; content: string; createdAt: number }) => ({
        id: msg.id,
        role: msg.role as "user" | "assistant",
        content: msg.content,
        createdAt: new Date(msg.createdAt),
      }))
    } catch (e) {
      console.warn("Failed to load chat history from server:", e)
      return []
    }
  },
  
  async save(projectId: string, messages: Message[]): Promise<void> {
    if (projectId === 'default' || messages.length === 0) return
    
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const apiVersion = import.meta.env.VITE_API_VERSION || '/api/v1'
      const token = await getAuthToken()
      
      await fetch(`${apiBaseUrl}${apiVersion}/linkedin/chat-history/${projectId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          messages: messages.map(msg => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            createdAt: msg.createdAt.getTime(),
          })),
        }),
      })
    } catch (e) {
      console.warn("Failed to save chat history to server:", e)
    }
  },
  
  async clear(projectId: string): Promise<void> {
    if (projectId === 'default') return
    
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const apiVersion = import.meta.env.VITE_API_VERSION || '/api/v1'
      const token = await getAuthToken()
      
      await fetch(`${apiBaseUrl}${apiVersion}/linkedin/chat-history/${projectId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ messages: [] }),
      })
    } catch (e) {
      console.warn("Failed to clear chat history on server:", e)
    }
  }
}

interface ChatShellProps {
  onClose?: () => void
  initialMessage?: string
  onInitialMessageSent?: () => void
  profileContext?: {
    hasHeadlineIssues?: boolean
    hasAboutIssues?: boolean
    hasExperienceIssues?: boolean
    hasSkillsIssues?: boolean
    overallScore?: number
  }
  currentSection?: string | null
  projectId?: string // Optional: pass project ID directly
  improvePrompts?: Array<{ label: string; prompt: string }> // Specific issue-based prompts for improve mode
}

export function ChatShell({ onClose, initialMessage, onInitialMessageSent, profileContext, currentSection, projectId: propProjectId, improvePrompts }: ChatShellProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const [selectedModel, setSelectedModel] = useState<AIModel>("google/gemini-2.0-flash-001")
  const [isLoaded, setIsLoaded] = useState(false)
  const hasProcessedInitialMessage = React.useRef(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedMessagesRef = useRef<string>("")
  
  // Get project ID from props or URL
  const projectId = propProjectId || getProjectIdFromUrl()
  const storageKey = `${STORAGE_KEY_PREFIX}-${projectId}`

  // Load messages from backend and localStorage on mount (per project)
  useEffect(() => {
    let isMounted = true
    
    const loadMessages = async () => {
      try {
        // Reset messages when project changes
        setMessages([])
        hasProcessedInitialMessage.current = false
        setIsLoaded(false)
        
        // Try to load from backend first
        const backendMessages = await chatHistoryAPI.load(projectId)
        
        if (!isMounted) return
        
        if (backendMessages.length > 0) {
          setMessages(backendMessages)
          // Also update localStorage as cache
          localStorage.setItem(storageKey, JSON.stringify(backendMessages))
          lastSavedMessagesRef.current = JSON.stringify(backendMessages)
        } else {
          // Fall back to localStorage
          const stored = localStorage.getItem(storageKey)
          if (stored) {
            const parsed = JSON.parse(stored)
            const messagesWithDates = parsed.map((msg: Message) => ({
              ...msg,
              createdAt: new Date(msg.createdAt),
            }))
            setMessages(messagesWithDates)
            lastSavedMessagesRef.current = stored
          }
        }
        
        const savedModel = localStorage.getItem(MODEL_STORAGE_KEY) as AIModel | null
        if (savedModel) {
          setSelectedModel(savedModel)
        }
      } catch (e) {
        console.error("Failed to load messages:", e)
      } finally {
        if (isMounted) {
          setIsLoaded(true)
        }
      }
    }
    
    loadMessages()
    
    return () => {
      isMounted = false
    }
  }, [projectId, storageKey]) // Re-run when project changes

  // Persist messages to localStorage and backend whenever they change (per project)
  // Uses debouncing for backend saves to avoid too many API calls
  useEffect(() => {
    if (!isLoaded) return // Don't save until initial load is complete
    
    const currentMessagesJson = JSON.stringify(messages)
    
    // Skip if messages haven't changed
    if (currentMessagesJson === lastSavedMessagesRef.current) return
    
    // Save to localStorage immediately (fast)
    try {
      localStorage.setItem(storageKey, currentMessagesJson)
    } catch (e) {
      console.error("Failed to save messages to localStorage:", e)
    }
    
    // Debounce backend save (2 seconds after last change)
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      chatHistoryAPI.save(projectId, messages)
      lastSavedMessagesRef.current = currentMessagesJson
    }, 2000)
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [messages, storageKey, isLoaded, projectId])

  const handleModelChange = useCallback((model: AIModel) => {
    setSelectedModel(model)
    localStorage.setItem(MODEL_STORAGE_KEY, model)
  }, [])

  // Send a message to the AI
  const sendMessage = useCallback(
    async (content: string, imageData?: string) => {
      if ((!content.trim() && !imageData) || isStreaming) return

      setError(null)

      const userMessage: Message = {
        id: generateId(),
        role: "user",
        content: content.trim() || "Describe this image",
        createdAt: new Date(),
        imageData,
      }

      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: "",
        createdAt: new Date(),
      }

      const newMessages = [...messages, userMessage, assistantMessage]
      setMessages(newMessages)
      setIsStreaming(true)

      const controller = new AbortController()
      setAbortController(controller)

      try {
        // Import config to get API base URL
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
        const apiVersion = import.meta.env.VITE_API_VERSION || '/api/v1'
        
        // Get auth token from AWS Amplify
        const { fetchAuthSession } = await import('aws-amplify/auth')
        const session = await fetchAuthSession()
        const token = session.tokens?.accessToken?.toString()
        
        const response = await fetch(`${apiBaseUrl}${apiVersion}/linkedin/copilot`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            project_id: projectId,
            user_message: content.trim() || "Describe this image",
            conversation_history: messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            section_id: null, // Could be passed as a prop if needed
          }),
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (!reader) {
          throw new Error("No response body")
        }

        let accumulatedContent = ""

        while (true) {
          const { done, value } = await reader.read()

          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          accumulatedContent += chunk

          setMessages((prev) =>
            prev.map((msg) => (msg.id === assistantMessage.id ? { ...msg, content: accumulatedContent } : msg)),
          )
        }
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessage.id ? { ...msg, content: msg.content || "[Cancelled]" } : msg,
            ),
          )
        } else {
          console.error("Error sending message:", e)
          setError(e instanceof Error ? e.message : "An error occurred")
          setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessage.id))
        }
      } finally {
        setIsStreaming(false)
        setAbortController(null)
      }
    },
    [messages, isStreaming, projectId],
  )

  // Handle initial message - must be after sendMessage is defined
  useEffect(() => {
    if (initialMessage && isLoaded && !hasProcessedInitialMessage.current && !isStreaming) {
      hasProcessedInitialMessage.current = true
      sendMessage(initialMessage)
      onInitialMessageSent?.()
    }
  }, [initialMessage, isLoaded, isStreaming, sendMessage, onInitialMessageSent])

  const retry = useCallback(() => {
    if (messages.length === 0) return
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")
    if (lastUserMessage) {
      const index = messages.findIndex((m) => m.id === lastUserMessage.id)
      setMessages(messages.slice(0, index))
      setError(null)
      setTimeout(() => sendMessage(lastUserMessage.content, lastUserMessage.imageData), 100)
    }
  }, [messages, sendMessage])

  const stopStreaming = useCallback(() => {
    if (abortController) {
      abortController.abort()
    }
  }, [abortController])

  const clearChat = useCallback(() => {
    setMessages([])
    setError(null)
    localStorage.removeItem(storageKey)
    lastSavedMessagesRef.current = ""
    // Also clear from backend
    chatHistoryAPI.clear(projectId)
  }, [storageKey, projectId])

  return (
    <div
      className="relative h-full w-full bg-stone-50 flex flex-col custom-scrollbar"
      style={{
        boxShadow:
          "rgba(14, 63, 126, 0.04) 0px 0px 0px 1px, rgba(42, 51, 69, 0.04) 0px 1px 1px -0.5px, rgba(42, 51, 70, 0.04) 0px 3px 3px -1.5px, rgba(42, 51, 70, 0.04) 0px 6px 6px -3px, rgba(14, 63, 126, 0.04) 0px 12px 12px -6px, rgba(14, 63, 126, 0.04) 0px 24px 24px -12px",
      }}
    >
      {onClose && (
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-20 h-8 w-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-stone-600"
          aria-label="Close chat"
        >
          <X className="w-4 h-4" />
        </Button>
      )}

      <Button
        onClick={clearChat}
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4 z-20 h-8 w-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-stone-600"
        aria-label="Reset chat"
      >
        <MessageSquareDashed className="w-4 h-4" />
      </Button>

      <MessageList 
        messages={messages} 
        isStreaming={isStreaming} 
        error={error} 
        onRetry={retry} 
        isLoaded={isLoaded}
        onPromptClick={sendMessage}
        profileContext={profileContext}
        currentSection={currentSection}
        improvePrompts={improvePrompts}
      />

      <Composer
        onSend={sendMessage}
        onStop={stopStreaming}
        isStreaming={isStreaming}
        disabled={!!error}
        selectedModel={selectedModel}
        onModelChange={handleModelChange}
      />
    </div>
  )
}
