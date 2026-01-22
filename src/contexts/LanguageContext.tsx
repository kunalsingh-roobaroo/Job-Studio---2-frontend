import React, { createContext, useContext, useState, useEffect } from "react"
import { translateText, translateBatch } from "../services/translation"

type Language = {
    code: string
    name: string
    nativeName: string
}

export const SUPPORTED_LANGUAGES: Language[] = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
    { code: "es", name: "Spanish", nativeName: "Español" },
    { code: "zh", name: "Chinese (Simplified)", nativeName: "简体中文" },
    { code: "ja", name: "Japanese", nativeName: "日本語" },
]

interface LanguageContextType {
    currentLanguage: Language
    setLanguage: (code: string) => void
    t: (text: string) => Promise<string>
    tBatch: (texts: string[]) => Promise<string[]>
    translateSync: (text: string) => string // For immediate return (might be loading)
    isTranslating: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [currentLanguage, setCurrentLanguage] = useState<Language>(SUPPORTED_LANGUAGES[0])
    const [isTranslating, setIsTranslating] = useState(false)

    // Simple in-memory cache for sync access in UI components after async load
    const [syncCache, setSyncCache] = useState<Record<string, Record<string, string>>>({})

    const setLanguage = (code: string) => {
        const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code)
        if (lang) {
            setCurrentLanguage(lang)
            // Persist choice if needed
            localStorage.setItem("app-language", code)
        }
    }

    // Load saved language on mount
    useEffect(() => {
        const saved = localStorage.getItem("app-language")
        if (saved) {
            const lang = SUPPORTED_LANGUAGES.find((l) => l.code === saved)
            if (lang) setCurrentLanguage(lang)
        }
    }, [])

    const t = async (text: string): Promise<string> => {
        if (currentLanguage.code === "en") return text

        // Check sync cache
        if (syncCache[currentLanguage.code]?.[text]) {
            return syncCache[currentLanguage.code][text]
        }

        setIsTranslating(true)
        const result = await translateText(text, currentLanguage.code)

        setSyncCache(prev => ({
            ...prev,
            [currentLanguage.code]: {
                ...(prev[currentLanguage.code] || {}),
                [text]: result
            }
        }))

        setIsTranslating(false)
        return result
    }

    const tBatch = async (texts: string[]): Promise<string[]> => {
        if (currentLanguage.code === "en") return texts
        setIsTranslating(true)
        const results = await translateBatch(texts, currentLanguage.code)

        // Update sync cache
        const newCache = { ...(syncCache[currentLanguage.code] || {}) }
        texts.forEach((text, i) => {
            newCache[text] = results[i]
        })

        setSyncCache(prev => ({
            ...prev,
            [currentLanguage.code]: newCache
        }))

        setIsTranslating(false)
        return results
    }

    // Synchronous helper that returns original text if translation not yet ready
    // Triggers background fetch?? No, that might be too aggressive. 
    // For now, it just returns cache or key.
    const translateSync = (text: string) => {
        if (currentLanguage.code === "en") return text
        return syncCache[currentLanguage.code]?.[text] || text
    }

    return (
        <LanguageContext.Provider value={{ currentLanguage, setLanguage, t, tBatch, translateSync, isTranslating }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider")
    }
    return context
}
