import * as React from "react"
import { ParameterCard } from "./ParameterCard"
import type { ChecklistItem as ChecklistItemType } from "@/services/api/types"

interface OptimizationChecklistProps {
  checklist: ChecklistItemType[]
  onAutoFix: (itemId: string) => void
  onFocusSection: (sectionId: string) => void
  isDark?: boolean
}

// 1. Hardcoded Schema (The "Control Panel" Structure)
const PARAMETER_GROUPS = [
  {
    id: "visuals",
    title: "SECTION 1: VISUALS & BRANDING",
    items: [
      { id: "photo_quality", title: "Profile Photo Quality", keywords: ["photo", "picture", "face"], defaultReason: "High-quality headshots increase profile views by 21x." },
      { id: "banner_image", title: "Banner Image", keywords: ["banner", "background", "cover"], defaultReason: "Your banner is the first thing recruiters see. Use it to show your value." },
      { id: "custom_url", title: "Custom URL", keywords: ["url", "link", "clean"], defaultReason: "A clean URL (linkedin.com/in/name) looks professional on resumes." }
    ]
  },
  {
    id: "headline",
    title: "SECTION 2: HEADLINE OPTIMIZATION",
    items: [
      { id: "char_count", title: "Character Count", keywords: ["character", "length", "120"], defaultReason: "Headlines between 120-220 characters perform best in search." },
      { id: "keywords", title: "High-Volume Keywords", keywords: ["keyword", "search", "terms"], defaultReason: "Include role-specific keywords to appear in recruiter searches." },
      { id: "value_prop", title: "Value Proposition", keywords: ["value", "proposition", "helping", "achievement"], defaultReason: "Explain not just what you do, but the value you bring." }
    ]
  },
  {
    id: "about",
    title: "SECTION 3: ABOUT SECTION",
    items: [
      { id: "hook", title: "Hook Strength (First 3 Lines)", keywords: ["hook", "first", "opening"], defaultReason: "The first 3 lines must grab attention before 'See More'." },
      { id: "contact", title: "Contact Info Visibility", keywords: ["contact", "email", "reach"], defaultReason: "Make it easy for recruiters to contact you directly." },
      { id: "skills_integration", title: "Skills Integration", keywords: ["skills", "integrate", "natural"], defaultReason: "Weave hard skills naturally into your narrative." }
    ]
  },
  {
    id: "experience",
    title: "SECTION 4: EXPERIENCE & IMPACT",
    items: [
      { id: "role_desc", title: "Role Descriptions", keywords: ["description", "clarity", "role"], defaultReason: "Clearly define your scope of responsibility." },
      { id: "action_verbs", title: "Action Verbs", keywords: ["verb", "action", "led", "drove"], defaultReason: "Start bullets with strong power verbs (e.g., 'Spearheaded')." },
      { id: "metrics", title: "Quantifiable Metrics", keywords: ["metric", "quantity", "number", "%", "$"], defaultReason: "Quantify your impact to prove your worth." }
    ]
  },
  {
    id: "skills_endorsements",
    title: "SECTION 5: SKILLS & ENDORSEMENTS",
    items: [
      { id: "top_skills", title: "Top 3 Skills Relevance", keywords: ["top", "relevant", "pinned"], defaultReason: "Your top 3 pinned skills heavily influence search ranking." },
      { id: "skill_count", title: "Skill Count (Target 50)", keywords: ["50", "listing", "count"], defaultReason: "Maximize discoverability by using all 50 skill slots." },
      { id: "endorsements", title: "Endorsements Quality", keywords: ["endorsement", "colleague", "social proof"], defaultReason: "Endorsements validate your expertise to recruiters." }
    ]
  }
]

export function OptimizationChecklist({
  checklist,
  onAutoFix,
  isDark = false
}: OptimizationChecklistProps) {
  const [expandedItem, setExpandedItem] = React.useState<string | null>(null)

  // 2. Mapping Helper (Fuzzy Matcher)
  const mapToSchema = (schemaItem: any, dynamicItems: ChecklistItemType[]): ChecklistItemType => {
    // Try to find a dynamic item that matches the keywords
    const match = dynamicItems.find(item =>
      schemaItem.keywords.some((k: string) => item.title.toLowerCase().includes(k)) ||
      schemaItem.keywords.some((k: string) => item.reasoning?.toLowerCase().includes(k)) ||
      (schemaItem.title.toLowerCase().includes(item.category.toLowerCase()) && item.title.includes("optimization")) // Generic fallback
    )

    if (match) {
      return { ...match, title: schemaItem.title } // Use schema title for consistency
    }

    // Default "Missing Data" item if no match found
    return {
      id: `virtual-${schemaItem.id}`,
      category: "Keywords", // Use valid category fallback
      title: schemaItem.title,
      status: "warning", // Assume warning if we can't verify
      scoreImpact: 0,
      reasoning: schemaItem.defaultReason + " (Data not found in audit)",
      bestPractice: schemaItem.defaultReason,
      example: "No example available",
      fixSuggestion: ""
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-8 pb-20">
      {PARAMETER_GROUPS.map(group => (
        <div key={group.id}>
          {/* Section Header */}
          <div className="text-[10px] font-bold text-gray-900 uppercase tracking-widest mb-3 ml-1">
            {group.title}
          </div>

          <div className="space-y-2">
            {group.items.map(schemaItem => {
              // Find matching items for this section (e.g., Headline items for Headline section)
              // We filter dynamic checklist roughly by group ID to avoid cross-contamination
              // But since group.id might not match category exactly ("visuals" vs "profile"), we do broad filtering

              let relevantItems = checklist
              if (group.id === "headline") relevantItems = checklist.filter(i => i.category.toLowerCase().includes("headline"))
              else if (group.id === "about") relevantItems = checklist.filter(i => i.category.toLowerCase().includes("about"))
              else if (group.id === "experience") relevantItems = checklist.filter(i => i.category.toLowerCase().includes("experience"))
              else if (group.id === "skills_endorsements") relevantItems = checklist.filter(i => i.category.toLowerCase().includes("skills"))

              const item = mapToSchema(schemaItem, relevantItems)

              return (
                <ParameterCard
                  key={item.id}
                  item={item}
                  isExpanded={expandedItem === item.id}
                  onToggle={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                  onAutoFix={() => onAutoFix(item.id)}
                  isDark={isDark}
                />
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
