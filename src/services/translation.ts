
const API_KEY = "AIzaSyAMxx4VsB7tQGazt9qB3GWAuJTjWcAn8jk" // User provided key
const API_URL = "https://translation.googleapis.com/language/translate/v2"

// Cache to store translated strings to reduce API usage
const translationCache: Record<string, Record<string, string>> = {}

export interface TranslationResult {
    translatedText: string
}

export async function translateText(text: string, targetLang: string): Promise<string> {
    if (!text || targetLang === "en") return text

    // Check cache first
    if (translationCache[targetLang] && translationCache[targetLang][text]) {
        return translationCache[targetLang][text]
    }

    try {
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                q: text,
                target: targetLang,
                format: "text"
            }),
        })

        const data = await response.json()

        if (data.error) {
            console.error("Translation API Error:", data.error)
            return text // Fallback to original
        }

        if (data.data && data.data.translations && data.data.translations.length > 0) {
            const translated = data.data.translations[0].translatedText

            // Update cache
            if (!translationCache[targetLang]) {
                translationCache[targetLang] = {}
            }
            translationCache[targetLang][text] = translated

            return translated
        }

        return text
    } catch (error) {
        console.error("Translation Request Failed:", error)
        return text
    }
}

export async function translateBatch(texts: string[], targetLang: string): Promise<string[]> {
    if (texts.length === 0 || targetLang === "en") return texts

    // Filter out what's already in cache to save API calls
    const missingIndices: number[] = []
    const textsToTranslate: string[] = []
    const results: string[] = [...texts]

    texts.forEach((text, index) => {
        if (translationCache[targetLang] && translationCache[targetLang][text]) {
            results[index] = translationCache[targetLang][text]
        } else {
            missingIndices.push(index)
            textsToTranslate.push(text)
        }
    })

    if (textsToTranslate.length === 0) return results

    try {
        // API supports array for 'q'
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                q: textsToTranslate,
                target: targetLang,
                format: "text"
            }),
        })

        const data = await response.json()

        if (data.data && data.data.translations) {
            data.data.translations.forEach((item: any, i: number) => {
                const originalIndex = missingIndices[i]
                const originalText = textsToTranslate[i]
                const translated = item.translatedText

                results[originalIndex] = translated

                // Update cache
                if (!translationCache[targetLang]) {
                    translationCache[targetLang] = {}
                }
                translationCache[targetLang][originalText] = translated
            })
        }
    } catch (error) {
        console.error("Batch Translation Failed:", error)
        // Fallback is already in 'results' (original text)
    }

    return results
}
