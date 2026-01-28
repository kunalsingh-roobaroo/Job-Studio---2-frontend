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
  EnhancedLinkedInAuditResult
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
  
  // Convert checklist results to ChecklistItem format (if using legacy checklistResults)
  const checklist: ChecklistItem[] = []
  let itemId = 1
  
  // NEW: Check if we have banners (V2 format)
  if (checklistAudit.banners && checklistAudit.banners.length > 0) {
    // Use new banner structure
    checklistAudit.banners.forEach(banner => {
      banner.checklistItems.forEach(item => {
        const categoryMap: Record<string, ChecklistItem['category']> = {
          'profile_photo': 'About',
          'banner': 'About',
          'headline': 'Headline',
          'about': 'About',
          'experience': 'Experience',
          'skills': 'Skills',
          'custom_url': 'About',
          'education': 'Skills',  // Map education to Skills to avoid showing in Experience checklist
          'certifications': 'Certifications'
        }
        
        const category = categoryMap[banner.id] || 'Skills'
        const status = item.status === 'pass' ? 'pass' : item.status === 'fail' ? 'critical' : 'warning'
        
        // Use reasoning for analysis and actionableFix for the fix suggestion
        const reasoning = item.reasoning || `Analysis for ${item.criterion}`
        const fixSuggestion = item.actionableFix || null
        
        // Create best practice from the criterion and context
        let bestPractice = item.reasoning
        if (item.status === 'fail' || item.status === 'warning') {
          // For failed/warning items, provide actionable advice
          bestPractice = `Fix: ${item.criterion}. ${item.reasoning.substring(0, 150)}...`
        }
        
        checklist.push({
          id: `checklist-${itemId++}`,
          category,
          title: item.criterion,
          status,
          scoreImpact: Math.round(item.points),
          reasoning: reasoning,
          bestPractice: bestPractice,
          example: `See LinkedIn best practices`,
          fixSuggestion: fixSuggestion
        })
      })
    })
  } else if (checklistAudit.checklistResults && checklistAudit.checklistResults.length > 0) {
    // Legacy: Use checklistResults
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
          'Profile Completeness': 'Skills',
          'Profile Photo & Banner': 'About',
          'Education': 'Skills',  // Map education to Skills to avoid showing in Experience checklist
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
  }
  
  // Map detailed scores to category scores (approximate mapping)
  // Handle both V2 (banners) and legacy (sectionScores) formats
  let categoryScores: CategoryScores
  
  if (checklistAudit.banners && checklistAudit.banners.length > 0) {
    // Calculate from banners
    categoryScores = {
      headline: Math.round(checklistAudit.banners.find(b => b.id === 'headline')?.score || 0),
      about: Math.round(checklistAudit.banners.find(b => b.id === 'about')?.score || 0),
      experience: Math.round(checklistAudit.banners.find(b => b.id === 'experience')?.score || 0),
      skills: Math.round(checklistAudit.banners.find(b => b.id === 'skills')?.score || 0),
      keywords: 0,
      certifications: Math.round(checklistAudit.banners.find(b => b.id === 'certifications')?.score || 0)
    }
  } else if (checklistAudit.sectionScores) {
    // Legacy: Use sectionScores
    categoryScores = {
      headline: checklistAudit.sectionScores.headline || 0,
      about: checklistAudit.sectionScores.about || 0,
      experience: checklistAudit.sectionScores.experience || 0,
      skills: checklistAudit.sectionScores.skills || 0,
      keywords: 0,
      certifications: 0
    }
  } else {
    // Fallback: Calculate from checklist
    categoryScores = {
      headline: 0,
      about: 0,
      experience: 0,
      skills: 0,
      keywords: 0,
      certifications: 0
    }
    
    checklist.forEach(item => {
      const category = item.category.toLowerCase() as keyof CategoryScores
      if (category in categoryScores && item.status === 'pass') {
        categoryScores[category] += item.scoreImpact
      }
    })
  }
  
  const optimizationReport: OptimizationReport = {
    totalScore: checklistAudit.overallScore,
    categoryScores,
    checklist
  }
  
  return {
    userProfile: audit.userProfile,
    optimizationReport,
    checklistAudit: checklistAudit  // Pass through the full checklist audit with banners
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
