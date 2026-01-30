import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Sparkles, TrendingUp, Target, Zap, CornerDownLeft } from "lucide-react"

interface FloatingPromptsProps {
  onPromptClick: (prompt: string) => void
  profileContext?: {
    hasHeadlineIssues?: boolean
    hasAboutIssues?: boolean
    hasExperienceIssues?: boolean
    hasSkillsIssues?: boolean
    overallScore?: number
  }
  currentSection?: string | null  // NEW: Currently selected section
}

// Categorized prompts based on profile issues
const PROMPT_CATEGORIES = {
  headline: [
    "How can I make my headline stand out to recruiters?",
    "Give me 5 viral headline examples for my industry",
    "What keywords should I add to my headline?",
    "How do I add metrics to my headline?",
  ],
  about: [
    "Help me write a compelling About section hook",
    "How do I tell my professional story effectively?",
    "What's the best structure for my About section?",
    "How can I add a strong call-to-action?",
  ],
  experience: [
    "How do I quantify my achievements with metrics?",
    "Give me power verbs for my experience descriptions",
    "Show me examples of impact statements",
    "How should I structure my experience bullets?",
  ],
  skills: [
    "What skills should I add to reach 30+?",
    "How do I get more endorsements for my skills?",
    "Which skills are most important for my industry?",
    "Should I prioritize hard skills or soft skills?",
  ],
  photo: [
    "What makes a great LinkedIn profile photo?",
    "Should I use a professional headshot or casual photo?",
    "What background works best for profile photos?",
    "How do I optimize my photo for LinkedIn?",
  ],
  profile_photo: [
    "What makes a great LinkedIn profile photo?",
    "Should I use a professional headshot or casual photo?",
    "What background works best for profile photos?",
    "How do I optimize my photo for LinkedIn?",
  ],
  banner: [
    "What should I put in my LinkedIn banner?",
    "How do I create a custom banner image?",
    "What are the best banner dimensions for LinkedIn?",
    "Should my banner match my personal brand?",
  ],
  education: [
    "Should I include my GPA on LinkedIn?",
    "How do I highlight academic achievements?",
    "What coursework should I list?",
    "How far back should my education history go?",
  ],
  certifications: [
    "Which certifications are most valuable for my field?",
    "How do I display certifications effectively?",
    "Should I include expired certifications?",
    "What's the ROI of professional certifications?",
  ],
  certs: [
    "Which certifications are most valuable for my field?",
    "How do I display certifications effectively?",
    "Should I include expired certifications?",
    "What's the ROI of professional certifications?",
  ],
  url: [
    "How do I create a custom LinkedIn URL?",
    "What's the best format for my LinkedIn URL?",
    "Can I change my LinkedIn URL later?",
    "Should my URL match other social profiles?",
  ],
  custom_url: [
    "How do I create a custom LinkedIn URL?",
    "What's the best format for my LinkedIn URL?",
    "Can I change my LinkedIn URL later?",
    "Should my URL match other social profiles?",
  ],
  general: [
    "What's the #1 thing I should fix first?",
    "How can I increase my profile views?",
    "What makes a LinkedIn profile go viral?",
    "How does the LinkedIn algorithm work?",
    "Give me a 30-day LinkedIn optimization plan",
    "What are recruiters looking for in profiles?",
  ],
}

export function FloatingPrompts({ onPromptClick, profileContext, currentSection }: FloatingPromptsProps) {
  const [currentPrompts, setCurrentPrompts] = useState<string[]>([])

  // Generate smart prompts based on current section or profile context
  useEffect(() => {
    const prompts: string[] = []
    
    // If a specific section is selected, show section-specific prompts
    if (currentSection) {
      const sectionKey = currentSection.toLowerCase()
      
      // Try to match section key to prompt categories
      const matchedCategory = Object.keys(PROMPT_CATEGORIES).find(key => 
        sectionKey.includes(key) || key.includes(sectionKey)
      )
      
      if (matchedCategory && PROMPT_CATEGORIES[matchedCategory as keyof typeof PROMPT_CATEGORIES]) {
        prompts.push(...PROMPT_CATEGORIES[matchedCategory as keyof typeof PROMPT_CATEGORIES])
      } else {
        // For unmatched sections, show general prompts
        prompts.push(...PROMPT_CATEGORIES.general)
      }
    } else {
      // No specific section - use profile context to determine prompts
      // Add issue-specific prompts
      if (profileContext?.hasHeadlineIssues) {
        prompts.push(...PROMPT_CATEGORIES.headline.slice(0, 2))
      }
      if (profileContext?.hasAboutIssues) {
        prompts.push(...PROMPT_CATEGORIES.about.slice(0, 2))
      }
      if (profileContext?.hasExperienceIssues) {
        prompts.push(...PROMPT_CATEGORIES.experience.slice(0, 1))
      }
      if (profileContext?.hasSkillsIssues) {
        prompts.push(...PROMPT_CATEGORIES.skills.slice(0, 1))
      }
      
      // Always add some general prompts
      prompts.push(...PROMPT_CATEGORIES.general.slice(0, 3))
    }
    
    // Shuffle and limit to 4 prompts (2x2 grid)
    const shuffled = prompts.sort(() => Math.random() - 0.5).slice(0, 4)
    setCurrentPrompts(shuffled)
  }, [profileContext, currentSection])

  if (currentPrompts.length === 0) return null

  const icons = [Sparkles, TrendingUp, Target, Zap]

  return (
    <div className="mb-8 max-w-2xl mx-auto">
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
        Quick Actions
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {currentPrompts.map((prompt, index) => {
          const Icon = icons[index % icons.length]
          return (
            <motion.button
              key={index}
              onClick={() => onPromptClick(prompt)}
              className="relative text-left p-4 rounded-xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 group"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-start gap-3">
                <Icon className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors flex-1 pr-6">
                  {prompt}
                </span>
              </div>
              <CornerDownLeft className="absolute bottom-3 right-3 w-3 h-3 text-slate-300 group-hover:text-slate-400 transition-colors" />
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
