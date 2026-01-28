/**
 * TypeScript interfaces for API requests and responses
 * These types match the backend Pydantic schemas
 */

// ==================== Resume Upload ====================

export interface GenerateUploadUrlRequest {
  file_name: string;
  content_type?: string;
  expires_in?: number;
}

export interface GenerateUploadUrlResponse {
  uploadUrl: string;
  key: string;
}

export interface GenerateDownloadUrlRequest {
  key: string;
  expires_in?: number;
  extra_params?: Record<string, string>;
}

export interface GenerateDownloadUrlResponse {
  downloadUrl: string;
  key: string;
}

// ==================== Resume Evaluation ====================

export interface ResumeEvaluationRequest {
  resume_s3_key: string;
  job_title: string;
  company: string;
  industry: string;
  linkedin?: string;
  job_description: string;
}

export interface MetricScore {
  score: number;
  reasoning: string;
  suggestions: string[];
}

export interface ResumeScores {
  roleFit: MetricScore;
  skills: MetricScore;
  experience: MetricScore;
  projects: MetricScore;
  storyline: MetricScore;
  keywords: MetricScore;
  leadership: MetricScore;
  motivation: MetricScore;
}

export interface SWOTAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface ResumeEvaluation {
  scores: ResumeScores;
  swot: SWOTAnalysis;
}

export interface ResumeEvaluationResponse {
  id: string;
  resume_evaluation: ResumeEvaluation;
  status: string;
  message: string;
}

// ==================== Resume Items ====================

export interface ResumeItemSummary {
  id: string;
  createdAt: number;
  updatedAt: number;
  name?: string | null;
}

// Reuse existing JobDetails interface from frontend UI types for nested job details

// ==================== LinkedIn Optimization ====================

export interface LinkedInPostIdeas {
  Post: string[];
  Carousel: string[];
  Reel: string[];
}

export interface LinkedInWorkExperience {
  jobTitle: string;
  company: string;
  duration: string;
  location?: string | null;
  descriptionBefore: string;
  descriptionAfter: string;
  keyAchievements: string[];
  skillsUsed: string[];
}

export interface LinkedInOptimizationPayload {
  headlineBefore: string;
  headlineAfter: string;
  aboutBefore: string;
  aboutAfter: string;
  profileOptimizationTips: string[];
  linkedinSkills: string[];
  skillOptimizationTips: string[];
  workExperience: LinkedInWorkExperience[];
  postIdeas: LinkedInPostIdeas;
  whoToFollowAdvice: string;
  engagementTips: string[];
}

export interface LinkedInOptimizationResponse {
  status: string;
  message: string;
  id: string;
  linkedinOptimization: LinkedInOptimizationPayload | null;
}

export interface RegenerateHeadlineResponse {
  status: string;
  headlineBefore: string;
  headlineAfter: string;
}

export interface RegenerateAboutSectionResponse {
  status: string;
  aboutBefore: string;
  aboutAfter: string;
}

// ==================== Full Resume Item ====================

export interface ResumeItem {
  id: string;
  createdAt: number;
  updatedAt: number;
  name?: string | null;
  userID?: string | null;
  resumeS3Key?: string | null;
  jobDetails?: JobDetails | null;
  resumeEvaluation?: ResumeEvaluation | null;
  linkedinOptimization?: LinkedInOptimizationPayload | null;
  parsedProfile?: ParsedProfile | null;
  linkedInAudit?: LinkedInAudit | UnifiedLinkedInAudit | EnhancedLinkedInAuditResult | null;
}

// ==================== Parsed Profile (The Architect) ====================

export interface ParsedBasics {
  name: string;
  headline: string;
  about: string;
  location: string;
  email: string;
  phone?: string | null;
  linkedinUrl?: string | null;
}

export interface ParsedExperience {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  location?: string | null;
}

export interface ParsedEducation {
  institution: string;
  degree: string;
  field?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  gpa?: string | null;
}

export interface ParsedCertification {
  name: string;
  issuer: string;
  date?: string | null;
  credentialId?: string | null;
}

export interface ParsedProject {
  name: string;
  description: string;
  technologies: string[];
  url?: string | null;
}

export interface ParsedAnalysis {
  missingSections: string[];
  overallScore: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface ParsedProfile {
  basics: ParsedBasics;
  experience: ParsedExperience[];
  education: ParsedEducation[];
  skills: string[];
  certifications: ParsedCertification[];
  projects: ParsedProject[];
  languages: string[];
  analysis: ParsedAnalysis;
}

export interface ParseResumeResponse {
  id: string;
  status: string;
  message: string;
  parsedProfile: ParsedProfile;
}

// ==================== Frontend UI Types ====================

/**
 * Frontend metric type used in the UI
 * Maps to backend MetricScore with additional UI properties
 */
export interface Metric {
  id: string;
  title: string;
  reasoning: string;
  improvement: string;
  score: number;
}

/**
 * Job details collected from the Home page form
 */
export interface JobDetails {
  jobTitle: string;
  company: string;
  industry: string;
  linkedin: string;
  jobDescription: string;
}

// ==================== API Error Response ====================

export interface APIError {
  detail: string;
  status?: number;
}

// ==================== Update Job Details ====================

export interface UpdateJobDetailsRequest {
  job_title?: string;
  company?: string;
  industry?: string;
  linkedin?: string;
  job_description?: string;
  re_analyze?: boolean;
}

export interface UpdateJobDetailsResponse {
  id: string;
  status: string;
  message: string;
  job_details: JobDetails;
  resume_evaluation?: ResumeEvaluation | null;
}

// ==================== Rename Project ====================

export interface RenameProjectRequest {
  role: string;
  resume_name: string;
}

export interface RenameProjectResponse {
  id: string;
  status: string;
  message: string;
  name: string;
}

// ==================== LinkedIn Audit (PDF Auditor) ====================

export interface LinkedInReviewPillar {
  id: string;
  title: string;
  score: number;
  reason: string;
  fixChecklist: string[];
  copilotPrompts: string[];
}

export interface LinkedInReviewSummary {
  strengths: string[];
  gaps: string[];
  opportunities: string[];
}

export interface LinkedInReviewModule {
  overallScore: number;
  summary: string | LinkedInReviewSummary; // Support both old and new format
  pillars: LinkedInReviewPillar[];
}

export interface LinkedInImproveSection {
  sectionId: string;
  title: string;
  existingContent: string;
  remarks: string;
  suggestedContent: string;
  improvementTip: string;
}

export interface LinkedInUserProfile {
  fullName: string;
  headline: string;
  about: string;
  location: string;
  email?: string | null;
  profilePictureUrl?: string | null;
  profile_picture_url?: string | null;
  profile_picture_url_large?: string | null;
  backgroundPictureUrl?: string | null;
  background_picture_url?: string | null;
  experience: any[]; // Keeping as any[] for now as structure is complex
  education: any[];
  skills: string[];
  certifications: any[];
  connections?: string;
  languages?: string[];
  publications?: any[];
}

export interface LinkedInAudit {
  userProfile: LinkedInUserProfile;
  reviewModule: LinkedInReviewModule;
  improveModule: LinkedInImproveSection[];
}

export interface LinkedInAuditResponse {
  id: string;
  status: string;
  message: string;
  audit: LinkedInAudit | UnifiedLinkedInAudit | EnhancedLinkedInAuditResult;
}

export interface LinkedInCopilotResponse {
  message: string;
  suggestions: string[];
}




// ==================== NEW: Unified Optimizer Types ====================

export interface ChecklistItem {
  id: string;
  category: "Headline" | "About" | "Experience" | "Skills" | "Keywords" | "Certifications";
  title: string;
  status: "pass" | "warning" | "critical";
  scoreImpact: number;
  reasoning: string;
  bestPractice: string;
  example: string;
  fixSuggestion: string | null;
}

export interface CategoryScores {
  headline: number;  // 0-20
  about: number;     // 0-24
  experience: number; // 0-32
  skills: number;    // 0-12
  keywords: number;  // 0-8
  certifications: number; // 0-4
}

export interface OptimizationReport {
  totalScore: number; // 0-100
  categoryScores: CategoryScores;
  checklist: ChecklistItem[];
}

export interface UnifiedLinkedInAudit {
  userProfile: LinkedInUserProfile;
  optimizationReport: OptimizationReport;
  checklistAudit?: ChecklistBasedAudit;  // NEW: Include checklist audit for enhanced scoring display
}

// ==================== NEW: Checklist-Based Scoring (100-Point System) ====================

export interface ChecklistCriterion {
  criterion: string;
  status: "pass" | "fail" | "warning";
  points: number;
  reasoning: string;
  actionableFix?: string;  // NEW: Detailed, personalized fix instructions from LLM (250-400 words)
}

export interface ExperienceEntry {
  jobTitle: string;
  company: string;
  duration?: string;
  summary: string;  // Brief analysis of this specific experience
  score: number;  // Score for this specific experience
  maxScore: number;
  checklistItems: ChecklistCriterion[];
}

export interface BannerSection {
  id: string;  // "profile_photo", "banner", "headline", etc.
  title: string;  // "Profile Photo", "Banner", "Headline", etc.
  score: number;  // Actual score earned
  maxScore: number;  // Maximum possible score
  breakdown: string;  // Insights and analysis based on actual profile data
  bannerSummary?: string;  // NEW: Why they got this score with context
  howToImprove?: string;  // NEW: Overall improvement directions for this banner
  checklistItems: ChecklistCriterion[];  // Specific checklist items
  bestPractices: string[];  // 3-4 actionable tips
  experienceEntries?: ExperienceEntry[];  // NEW: For Experience banner only - individual experience analysis
}

export interface SectionChecklist {
  section: string;
  totalPoints: number;
  maxPoints: number;
  items: ChecklistCriterion[];
}

export interface DetailedScores {
  profileCompleteness: number;  // 0-20
  photoBanner: number;           // 0-8
  headline: number;              // 0-12
  about: number;                 // 0-15
  experience: number;            // 0-20
  skills: number;                // 0-8
  education: number;             // 0-7
  recommendations: number;       // 0-5
  additionalSections: number;    // 0-5
}

export interface PriorityImprovement {
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  issue: string;
  impact: number;
  timeEstimate: string;
  section: string;
}

export interface QuickWin {
  action: string;
  time: string;
  impact: number;
}

export interface ChecklistBasedAudit {
  overallScore: number;          // 0-100
  grade: string;                 // A+, A, A-, B+, B, B-, C+, C, C-, D, F
  profileStrength: string;       // "Exceptional", "Very Good", etc.
  banners: BannerSection[];      // NEW: 12 banner sections with checklist, best practices, breakdown
  sectionScores?: DetailedScores; // Legacy - optional for backward compatibility
  bonuses: number;
  penalties: number;
  checklistResults: SectionChecklist[];  // Legacy - kept for backward compatibility
  priorityImprovements: PriorityImprovement[];
  quickWins: QuickWin[];
  strengths: string[];
  summary: string;
}

export interface EnhancedLinkedInAuditResult {
  userProfile: LinkedInUserProfile;
  reviewModule: LinkedInReviewModule;
  improveModule: LinkedInImproveSection[];
  checklistAudit?: ChecklistBasedAudit;
}
