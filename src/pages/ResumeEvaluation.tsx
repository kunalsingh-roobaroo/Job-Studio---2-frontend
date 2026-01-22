import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ArrowRight } from "lucide-react"
import { useApp } from "@/contexts/AppContext"
import type { Metric } from "@/services/api/types"
import { TopMenubar } from "@/components/menubar/TopMenubar"
import resumeService from "@/services/api/resumeService"

const SWOT_TEMPLATE = {
  strengths: [
    "Quantified business impact in multiple roles, showcasing data-driven decision-making.",
    "Clear ownership of cross-functional deliverables with executive visibility.",
    "Consistent progression into more strategic responsibilities across companies.",
  ],
  weaknesses: [
    "Limited emphasis on team leadership outcomes beyond headcount figures.",
    "Technical stack coverage misses a few emerging tools referenced in the job description.",
    "Some bullets rely on generic verbs, reducing the perceived distinctiveness of achievements.",
  ],
  opportunities: [
    "Integrate recently acquired certifications to signal ongoing upskilling.",
    "Tailor project narratives to better align with the target company’s business model.",
    "Leverage the summary to position yourself for broader strategic ownership roles.",
  ],
  threats: [
    "Competing candidates may highlight more industry-specific metrics by default.",
    "ATS filters could under-rank the resume if niche keywords remain absent.",
    "Current resume length may cause hiring managers to skim and miss key results.",
  ],
}

const scoreBadgeVariants = (score: number) => {
  if (score >= 8) {
    return {
      badge: "border-emerald-500/40 bg-emerald-500/15 text-emerald-500",
      bar: "bg-emerald-500",
    }
  }
  if (score >= 4) {
    return {
      badge: "border-amber-500/40 bg-amber-500/15 text-amber-500",
      bar: "bg-amber-500",
    }
  }
  return {
    badge: "border-rose-500/40 bg-rose-500/15 text-rose-500",
    bar: "bg-rose-500",
  }
}

const ResumeEvaluation: React.FC = () => {
  const navigate = useNavigate()
  const { resumeId } = useParams<{ resumeId: string }>()
  const {
    resumeEvaluation,
    evaluationError,
    setEvaluationError,
    setResumeItem,
    resumeId: contextResumeId,
  } = useApp()

  const [metrics, setMetrics] = React.useState<Metric[]>([])
  const [swot, setSWOT] = React.useState(SWOT_TEMPLATE)
  const [isLoading, setIsLoading] = React.useState(true)

  // Load evaluation data from context or refetch from backend
  React.useEffect(() => {
    let isMounted = true

    async function loadEvaluation() {
      // Fast path: if we have evaluation data in context and it matches current resumeId, use it immediately
      if (resumeEvaluation && resumeId === contextResumeId) {
        convertBackendToFrontend(resumeEvaluation)
        setEvaluationError(null) // Clear any stale errors
        setIsLoading(false)
        return
      }

      // If no resume ID, show error
      if (!resumeId) {
        setEvaluationError("Invalid resume ID. Please start from the home page.")
        setIsLoading(false)
        return
      }

      // If we reach here, evaluation is missing from context (e.g., page refresh)
      // Try to refetch from backend
      try {
        setIsLoading(true)
        const resume = await resumeService.getResume(resumeId)
        
        if (!isMounted) return

        // Always hydrate full context
        setResumeItem(resume)

        // Check if the resume has evaluation data
        if (resume.resumeEvaluation) {
          convertBackendToFrontend(resume.resumeEvaluation)
          setEvaluationError(null)
        } else {
          // Resume exists but has no evaluation yet
          setEvaluationError(
            "This resume has no evaluation yet. Please run a new evaluation from the home page."
          )
        }
      } catch (error: any) {
        if (!isMounted) return
        
        setEvaluationError(
          "We couldn't load your evaluation. Please try again or run a new evaluation from the home page."
        )
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadEvaluation()

    return () => {
      isMounted = false
    }
  }, [resumeId, resumeEvaluation, contextResumeId, setResumeItem, setEvaluationError])

  // Convert backend evaluation to frontend format
  function convertBackendToFrontend(evaluation: typeof resumeEvaluation) {
    if (!evaluation) return

    const backendMetrics: Metric[] = [
      {
        id: "role-fit",
        title: "Role Fit & Clarity",
        score: evaluation.scores.roleFit.score,
        reasoning: evaluation.scores.roleFit.reasoning,
        improvement: evaluation.scores.roleFit.suggestions.join(" "),
      },
      {
        id: "skills-tools",
        title: "Skills & Tools",
        score: evaluation.scores.skills.score,
        reasoning: evaluation.scores.skills.reasoning,
        improvement: evaluation.scores.skills.suggestions.join(" "),
      },
      {
        id: "experience",
        title: "Experience & Outcomes",
        score: evaluation.scores.experience.score,
        reasoning: evaluation.scores.experience.reasoning,
        improvement: evaluation.scores.experience.suggestions.join(" "),
      },
      {
        id: "projects",
        title: "Projects",
        score: evaluation.scores.projects.score,
        reasoning: evaluation.scores.projects.reasoning,
        improvement: evaluation.scores.projects.suggestions.join(" "),
      },
      {
        id: "storyline",
        title: "Resume Storyline",
        score: evaluation.scores.storyline.score,
        reasoning: evaluation.scores.storyline.reasoning,
        improvement: evaluation.scores.storyline.suggestions.join(" "),
      },
      {
        id: "keywords",
        title: "Keyword Match",
        score: evaluation.scores.keywords.score,
        reasoning: evaluation.scores.keywords.reasoning,
        improvement: evaluation.scores.keywords.suggestions.join(" "),
      },
      {
        id: "leadership",
        title: "Leadership & Soft Skills",
        score: evaluation.scores.leadership.score,
        reasoning: evaluation.scores.leadership.reasoning,
        improvement: evaluation.scores.leadership.suggestions.join(" "),
      },
      {
        id: "motivation",
        title: "Motivation Fit",
        score: evaluation.scores.motivation.score,
        reasoning: evaluation.scores.motivation.reasoning,
        improvement: evaluation.scores.motivation.suggestions.join(" "),
      },
    ]

    setMetrics(backendMetrics)
    setSWOT(evaluation.swot)
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-10 pt-6 md:px-8 lg:px-12">
        <TopMenubar />
        <Card className="gap-8">
          <CardHeader className="border-b border-border pb-6">
            <CardTitle className="text-3xl font-semibold">Resume Evaluation</CardTitle>
            <CardDescription>
              Loading your evaluation results...
            </CardDescription>
          </CardHeader>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-sm text-muted-foreground">
                Loading your resume analysis...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show error state
  if (evaluationError) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-10 pt-6 md:px-8 lg:px-12">
        <TopMenubar />
        <Card className="gap-8">
          <CardHeader className="border-b border-border pb-6">
            <CardTitle className="text-3xl font-semibold">Resume Evaluation</CardTitle>
            <CardDescription className="text-destructive">
              {evaluationError}
            </CardDescription>
          </CardHeader>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <p className="text-sm text-muted-foreground">
                Please go back and try again, or contact support if the issue persists.
              </p>
              <Button onClick={() => navigate("/")}>
                Go Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-10 pt-6 md:px-8 lg:px-12">
      <TopMenubar />
      <Card className="gap-8">
        <CardHeader className="border-b border-border pb-6">
          <CardTitle className="text-3xl font-semibold">Resume Evaluation</CardTitle>
          <CardDescription>
            AI generated analysis based on your uploaded resume and target role context.
          </CardDescription>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Last evaluated · just now
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-dashed">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">Score Breakdown</CardTitle>
                <CardDescription>
                  Each metric is scored from 0–10. Expand to see why the score was assigned and how to improve it.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Accordion type="single" collapsible className="w-full">
                  {metrics.map((metric) => {
                    const { badge, bar } = scoreBadgeVariants(metric.score)
                    return (
                      <AccordionItem
                        key={metric.id}
                        value={metric.id}
                        className="rounded-lg border border-border/60 bg-muted/20 px-4"
                      >
                        <AccordionTrigger className="px-0">
                          <div className="flex w-full flex-col gap-3">
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-sm font-semibold text-foreground">{metric.title}</span>
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
                                  badge,
                                )}
                              >
                                {metric.score} / 10
                              </span>
                            </div>
                            <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                              <div
                                className={cn("h-full rounded-full transition-all duration-300 ease-out", bar)}
                                style={{ width: `${metric.score * 10}%` }}
                              />
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-0">
                          <div className="space-y-4 pt-2">
                            <div className="space-y-1">
                              <h4 className="text-sm font-semibold text-foreground">Why you earned this score</h4>
                              <p className="text-sm leading-relaxed text-muted-foreground">{metric.reasoning}</p>
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-sm font-semibold text-foreground">How to improve</h4>
                              <p className="text-sm leading-relaxed text-muted-foreground">{metric.improvement}</p>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )
                  })}
                </Accordion>
              </CardContent>
            </Card>

            <Card className="border-dashed">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">SWOT Analysis</CardTitle>
                <CardDescription>
                  Snapshot of strengths, gaps, opportunities, and external risks inferred from the current resume content.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {(
                  [
                    { label: "Strengths", data: SWOT_TEMPLATE.strengths, accent: "bg-emerald-500/10 border-emerald-500/30" },
                    { label: "Weaknesses", data: SWOT_TEMPLATE.weaknesses, accent: "bg-rose-500/10 border-rose-500/30" },
                    { label: "Opportunities", data: SWOT_TEMPLATE.opportunities, accent: "bg-sky-500/10 border-sky-500/30" },
                    { label: "Threats", data: SWOT_TEMPLATE.threats, accent: "bg-amber-500/10 border-amber-500/30" },
                  ] as const
                ).map((section) => {
                  // Use backend SWOT data if available, otherwise use template
                  const data = section.label === "Strengths" ? swot.strengths
                    : section.label === "Weaknesses" ? swot.weaknesses
                    : section.label === "Opportunities" ? swot.opportunities
                    : swot.threats
                  
                  return (
                    <div
                      key={section.label}
                      className={cn("flex flex-col gap-3 rounded-xl border p-4 text-sm shadow-sm", section.accent)}
                    >
                      <div className="text-sm font-semibold uppercase tracking-wide text-foreground">
                        {section.label}
                      </div>
                      <ul className="space-y-2 text-muted-foreground">
                        {data.map((item, index) => (
                          <li key={index} className="leading-relaxed">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={() => {
            // Navigate to ATS compatibility page with resume ID
            // The ATS analysis will be triggered on that page
            navigate(`/resume/${resumeId}/ats-compatibility`)
          }}
          className="gap-2"
        >
          Next: ATS Compatibility
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default ResumeEvaluation