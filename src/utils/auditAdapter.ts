/**
 * Adapter to convert old LinkedInAudit format to new UnifiedLinkedInAudit format
 * This allows us to use the new UI with existing audit data
 */

import type {
  LinkedInAudit,
  UnifiedLinkedInAudit,
  ChecklistItem,
  CategoryScores,
  OptimizationReport,
  EnhancedLinkedInAuditResult,
  ChecklistBasedAudit
} from "@/services/api/types"

/**
 * Check if audit has the new checklist-based scoring
 */
export function hasChecklistAudit(audit: any): audit is EnhancedLinkedInAuditResult {
  return audit && 'checklistAudit' in audit && audit.checklistAudit !== null
}

/**
 * Convert checklist-based audit to unified format for UI display
 */
export function convertChecklistAuditToUnified(audit: EnhancedLinkedInAuditResult): UnifiedLinkedInAudit {
  const checklistAudit = audit.checklistAudit!
  
  // Convert checklist results to ChecklistItem format
  const checklist: ChecklistItem[] = []
  let itemId = 1
  
  checklistAudit.checklistResults.forEach(section => {
    section.items.forEach(item => {
      // Map section names to categories
      const categoryMap: Record<string, ChecklistItem['category']> = {
        'Headline': 'Headline',
        'About': 'About',
        'About Section': 'About',
        'Experience': 'Experience',
        'Skills': 'Skills',
        'Keywords': 'Keywords',
        'Certifications': 'Certifications',
        'Profile Completeness': 'Skills', // Map to closest category
        'Profile Photo & Banner': 'About',
        'Education': 'Experience',
        'Recommendations': 'Experience',
        'Additional Sections': 'Skills'
      }
      
      const category = categoryMap[section.section] || 'Skills'
      const status = item.status === 'pass' ? 'pass' : item.status === 'fail' ? 'critical' : 'warning'
      
      checklist.push({
        id: `checklist-${itemId++}`,
        category,
        title: item.criterion,
        status,
        scoreImpact: Math.round(item.points),
        reasoning: item.reasoning,
        bestPractice: `Best practice for ${item.criterion}`,
        example: `See LinkedIn best practices`,
        fixSuggestion: null
      })
    })
  })
  
  // Map detailed scores to category scores (approximate mapping)
  const categoryScores: CategoryScores = {
    headline: checklistAudit.sectionScores.headline,
    about: checklistAudit.sectionScores.about,
    experience: checklistAudit.sectionScores.experience,
    skills: checklistAudit.sectionScores.skills,
    keywords: 0, // Not directly mapped in new system
    certifications: 0 // Not directly mapped in new system
  }
  
  const optimizationReport: OptimizationReport = {
    totalScore: checklistAudit.overallScore,
    categoryScores,
    checklist
  }
  
  return {
    userProfile: audit.userProfile,
    optimizationReport
  }
}

export function convertAuditToUnified(audit: LinkedInAudit | UnifiedLinkedInAudit | EnhancedLinkedInAuditResult): UnifiedLinkedInAudit {
  // Check if it's the new checklist-based format
  if (hasChecklistAudit(audit)) {
    return convertChecklistAuditToUnified(audit)
  }
  
  // Check if it's already in the unified format
  if ('optimizationReport' in audit) {
    return audit as UnifiedLinkedInAudit
  }

  const oldAudit = audit as LinkedInAudit
  const checklist: ChecklistItem[] = []
  let checklistIdCounter = 1

  // Handle case where reviewModule might be missing (defensive programming)
  if (!oldAudit.reviewModule?.pillars) {
    console.warn("Audit data missing reviewModule.pillars", oldAudit)
    return {
      userProfile: oldAudit.userProfile,
      optimizationReport: {
        totalScore: 0,
        categoryScores: { headline: 0, about: 0, experience: 0, skills: 0, keywords: 0, certifications: 0 },
        checklist: []
      }
    }
  }

  // Convert review pillars to checklist items
  oldAudit.reviewModule.pillars.forEach((pillar, pillarIndex) => {
    const category = pillar.title as any // "Headline", "About", etc.
    const status = pillar.score >= 8 ? "pass" : pillar.score >= 6 ? "warning" : "critical"

    // Create main item for this section
    checklist.push({
      id: `pillar-${pillarIndex}-main-${checklistIdCounter++}`,
      category,
      title: `${pillar.title} optimization`,
      status,
      scoreImpact: Math.round((pillar.score / 10) * 4), // Convert 0-10 to 0-4 points
      reasoning: pillar.reason,
      bestPractice: pillar.fixChecklist[0] || "Follow LinkedIn best practices for this section",
      example: `Example: [See improved version in preview]`,
      fixSuggestion: oldAudit.improveModule?.find(s => s.sectionId === pillar.id)?.suggestedContent || ""
    })

    // Create sub-items from fix checklist
    pillar.fixChecklist.slice(1).forEach((fix, fixIndex) => {
      checklist.push({
        id: `pillar-${pillarIndex}-fix-${fixIndex}-${checklistIdCounter++}`,
        category,
        title: fix,
        status: "warning",
        scoreImpact: 2,
        reasoning: `This item needs attention: ${fix}`,
        bestPractice: `Best practice: ${fix}`,
        example: "See examples in the preview panel",
        fixSuggestion: ""
      })
    })
  })

  // Calculate category scores from checklist
  const categoryScores: CategoryScores = {
    headline: 0,
    about: 0,
    experience: 0,
    skills: 0,
    keywords: 0,
    certifications: 0
  }

  checklist.forEach(item => {
    const category = item.category.toLowerCase() as keyof CategoryScores
    if (category in categoryScores && item.status === "pass") {
      categoryScores[category] += item.scoreImpact
    }
  })

  // Calculate total score (use existing overall score or calculate from categories)
  const totalScore = oldAudit.reviewModule.overallScore ||
    Object.values(categoryScores).reduce((sum, score) => sum + score, 0)

  const optimizationReport: OptimizationReport = {
    totalScore,
    categoryScores,
    checklist
  }

  return {
    userProfile: oldAudit.userProfile,
    optimizationReport
  }
}
