/**
 * Resume API Service
 * API calls for resume upload and LinkedIn optimization
 */

import apiClient from './client';
import type {
  GenerateUploadUrlRequest,
  GenerateUploadUrlResponse,
  ResumeEvaluationRequest,
  ResumeEvaluationResponse,
  ResumeItemSummary,
  ResumeItem,
  LinkedInOptimizationResponse,
  LinkedInAuditResponse,
  LinkedInAudit,
  UnifiedLinkedInAudit,
  ParseResumeResponse,
  ParsedProfile,
  LinkedInCopilotResponse,
} from './types';

// Types for LinkedIn project creation
interface CreateLinkedInProjectRequest {
  resume_s3_key: string;
  job_title?: string;
  company?: string;
  industry?: string;
  linkedin_url?: string;
}

/**
 * Generate a presigned S3 URL for uploading a resume file
 */
export async function generateUploadUrl(
  fileName: string,
  contentType?: string,
  expiresIn?: number
): Promise<GenerateUploadUrlResponse> {
  const request: GenerateUploadUrlRequest = {
    file_name: fileName,
    content_type: contentType,
    expires_in: expiresIn,
  };
  const response = await apiClient.post<GenerateUploadUrlResponse>(
    '/resumes/generate-upload-url',
    request
  );
  return response.data;
}

/**
 * Upload a file directly to S3 using a presigned URL
 */
export async function uploadResumeToS3(file: File, uploadUrl: string): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });
  if (!response.ok) {
    throw new Error(`Failed to upload file to S3: ${response.statusText}`);
  }
}

/**
 * Create a LinkedIn project and parse resume using The Architect
 * Returns structured profile data for immediate preview
 */
export async function createLinkedInProject(
  data: CreateLinkedInProjectRequest
): Promise<ParseResumeResponse> {
  const response = await apiClient.post<ParseResumeResponse>(
    '/resumes/create-linkedin-project',
    data,
    { timeout: 120000 } // 2 min timeout for AI parsing
  );
  return response.data;
}

/**
 * Combined upload and create LinkedIn project flow
 * This parses the resume and returns structured profile data
 */
export async function uploadAndCreateLinkedInProject(
  file: File,
  options?: {
    job_title?: string;
    company?: string;
    industry?: string;
    linkedin_url?: string;
  }
): Promise<{ projectId: string; s3Key: string; parsedProfile: ParsedProfile }> {
  // Step 1: Get presigned URL
  const { uploadUrl, key } = await generateUploadUrl(file.name, file.type);

  // Step 2: Upload to S3
  await uploadResumeToS3(file, uploadUrl);

  // Step 3: Create LinkedIn project and parse resume
  const result = await createLinkedInProject({
    resume_s3_key: key,
    ...options,
  });

  return {
    projectId: result.id,
    s3Key: key,
    parsedProfile: result.parsedProfile,
  };
}

/**
 * Submit a resume for evaluation with job details
 */
export async function evaluateResume(data: ResumeEvaluationRequest): Promise<ResumeEvaluationResponse> {
  const response = await apiClient.post<ResumeEvaluationResponse>('/resumes/evaluate-resume', data);
  return response.data;
}

/**
 * List resumes with summary information only
 */
export async function listResumes(limit?: number): Promise<ResumeItemSummary[]> {
  const response = await apiClient.get<ResumeItemSummary[]>('/resumes/', {
    params: limit ? { limit } : undefined,
  });
  return response.data;
}

/**
 * Get a single resume by ID with full details
 */
export async function getResume(resumeId: string): Promise<ResumeItem> {
  const response = await apiClient.get<ResumeItem>(`/resumes/${resumeId}`);
  return response.data;
}

/**
 * Fetch LinkedIn profile quickly (no audit) - for progressive loading
 * Returns profile data immediately, call extractLinkedInFromUrl for full audit
 */
export async function fetchLinkedInProfile(
  linkedinUrl: string
): Promise<{ projectId: string; profile: ParsedProfile }> {
  const result = await apiClient.post<{ id: string; profile: any }>(
    '/linkedin/fetch-profile',
    {
      linkedin_url: linkedinUrl,
    },
    { timeout: 30000 } // 30 seconds - just Unipile fetch
  );

  // Convert backend profile format to ParsedProfile
  const profile: ParsedProfile = {
    basics: {
      name: result.data.profile.fullName || '',
      headline: result.data.profile.headline || '',
      about: result.data.profile.about || '',
      location: result.data.profile.location || '',
      email: result.data.profile.email || '',
    },
    experience: result.data.profile.experience || [],
    education: result.data.profile.education || [],
    skills: result.data.profile.skills || [],
    certifications: result.data.profile.certifications || [],
    projects: [],
    languages: result.data.profile.languages || [],
    analysis: {
      missingSections: [],
      overallScore: 0,
      feedback: '',
      strengths: [],
      improvements: [],
    },
    // Store raw profile for preview
    _rawProfile: result.data.profile,
  };

  return {
    projectId: result.data.id,
    profile,
  };
}

/**
 * Run audit on existing project (after profile fetch) - ASYNC with polling
 * Now uses background processing to avoid CloudFront timeout
 */
export async function runLinkedInAudit(
  projectId: string,
  options?: {
    target_role?: string;
    onProgress?: (progress: string) => void;
  }
): Promise<{ audit: LinkedInAudit | UnifiedLinkedInAudit }> {
  // Start async job (returns immediately)
  const result = await apiClient.post<{
    id: string;
    status: string;
    message: string;
    audit?: any;
    progress?: string;
  }>(
    `/linkedin/audit-project/${projectId}`,
    {
      target_role: options?.target_role,
    },
    { timeout: 30000 } // 30 seconds - just to start the job
  );

  // If already completed (cached audit exists), return immediately
  if (result.data.status === 'completed' && result.data.audit) {
    return { audit: result.data.audit };
  }

  // Initial progress update
  if (options?.onProgress && result.data.progress) {
    options.onProgress(result.data.progress);
  }

  // Poll for completion
  const audit = await pollForJobCompletion(projectId, options?.onProgress);

  return { audit };
}

/**
 * Check job status for async LinkedIn analysis
 */
export async function checkLinkedInJobStatus(
  jobId: string
): Promise<{
  status: 'processing' | 'completed' | 'failed';
  message: string;
  audit?: LinkedInAudit | UnifiedLinkedInAudit;
  error?: string;
  progress?: string;
}> {
  const result = await apiClient.get<{
    id: string;
    status: string;
    message: string;
    audit?: any;
    error?: string;
    progress?: string;
  }>(`/linkedin/job-status/${jobId}`);

  return {
    status: result.data.status as 'processing' | 'completed' | 'failed',
    message: result.data.message,
    audit: result.data.audit,
    error: result.data.error,
    progress: result.data.progress,
  };
}

/**
 * Poll for job completion with exponential backoff
 */
async function pollForJobCompletion(
  jobId: string,
  onProgress?: (progress: string) => void,
  maxAttempts: number = 60, // 60 attempts
  initialDelay: number = 2000 // Start with 2 seconds
): Promise<LinkedInAudit | UnifiedLinkedInAudit> {
  let attempts = 0;
  let delay = initialDelay;

  while (attempts < maxAttempts) {
    attempts++;
    
    // Wait before checking
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Check status
    const status = await checkLinkedInJobStatus(jobId);
    
    if (status.status === 'completed') {
      if (!status.audit) {
        throw new Error('Job completed but no audit data returned');
      }
      return status.audit;
    }
    
    if (status.status === 'failed') {
      throw new Error(status.error || 'LinkedIn analysis failed');
    }
    
    // Still processing - update progress
    if (onProgress && status.progress) {
      onProgress(status.progress);
    }
    
    // Exponential backoff: 2s, 3s, 4s, 5s, then stay at 5s
    delay = Math.min(delay + 1000, 5000);
  }
  
  throw new Error('LinkedIn analysis timed out after 5 minutes');
}

/**
 * Accepts LinkedIn URL or username and returns comprehensive audit (ASYNC)
 * Now uses background processing with polling
 */
export async function extractLinkedInFromUrl(
  linkedinUrl: string,
  options?: {
    target_role?: string;
    onProgress?: (progress: string) => void;
  }
): Promise<{ projectId: string; audit: LinkedInAudit | UnifiedLinkedInAudit }> {
  // Start async job
  const result = await apiClient.post<{
    id: string;
    status: string;
    message: string;
    progress?: string;
  }>(
    '/linkedin/extract-from-url',
    {
      linkedin_url: linkedinUrl,
      target_role: options?.target_role,
    },
    { timeout: 30000 } // 30 seconds - just to start the job
  );

  const jobId = result.data.id;
  
  // Initial progress update
  if (options?.onProgress && result.data.progress) {
    options.onProgress(result.data.progress);
  }

  // Poll for completion
  const audit = await pollForJobCompletion(jobId, options?.onProgress);

  return {
    projectId: jobId,
    audit,
  };
}

/**
 * Generate a complete LinkedIn optimization plan for an existing resume
 */
export async function optimizeLinkedInProfile(resumeId: string): Promise<LinkedInOptimizationResponse> {
  const response = await apiClient.post<LinkedInOptimizationResponse>(
    `/resumes/${resumeId}/linkedin-optimization`,
    {},
    { timeout: 120000 }
  );
  return response.data;
}

/**
 * Audit LinkedIn profile from PDF export
 * Generates comprehensive review and improve modules
 */
export async function auditLinkedInProfile(resumeId: string): Promise<LinkedInAuditResponse> {
  const response = await apiClient.post<LinkedInAuditResponse>(
    `/resumes/${resumeId}/linkedin-audit`,
    {},
    { timeout: 120000 }
  );
  return response.data;
}

/**
 * Review LinkedIn profile from PDF export
 * Upload LinkedIn PDF and get audit with scores
 */
export async function reviewLinkedInProfile(
  file: File,
  options?: {
    target_role?: string;
  }
): Promise<{ projectId: string; s3Key: string; audit: LinkedInAudit | UnifiedLinkedInAudit }> {
  // Step 1: Get presigned URL
  const { uploadUrl, key } = await generateUploadUrl(file.name, file.type);

  // Step 2: Upload to S3
  await uploadResumeToS3(file, uploadUrl);

  // Step 3: Review LinkedIn profile
  const result = await apiClient.post<LinkedInAuditResponse>(
    '/linkedin/review-profile',
    {
      linkedin_pdf_s3_key: key,
      target_role: options?.target_role,
    },
    { timeout: 120000 }
  );

  return {
    projectId: result.data.id,
    s3Key: key,
    audit: result.data.audit,
  };
}

/**
 * Improve LinkedIn profile from PDF export
 * Upload LinkedIn PDF and get before/after rewrites
 */
export async function improveLinkedInProfile(
  file: File,
  options?: {
    target_role?: string;
  }
): Promise<{ projectId: string; s3Key: string; audit: LinkedInAudit | UnifiedLinkedInAudit }> {
  // Step 1: Get presigned URL
  const { uploadUrl, key } = await generateUploadUrl(file.name, file.type);

  // Step 2: Upload to S3
  await uploadResumeToS3(file, uploadUrl);

  // Step 3: Improve LinkedIn profile
  const result = await apiClient.post<LinkedInAuditResponse>(
    '/linkedin/improve-profile',
    {
      linkedin_pdf_s3_key: key,
      target_role: options?.target_role,
    },
    { timeout: 120000 }
  );

  return {
    projectId: result.data.id,
    s3Key: key,
    audit: result.data.audit,
  };
}

/**
 * Combined upload and evaluate flow
 */
export async function uploadAndEvaluateResume(
  file: File,
  jobDetails: Omit<ResumeEvaluationRequest, 'resume_s3_key'>
): Promise<{ resumeId: string; s3Key: string; evaluation: ResumeEvaluationResponse }> {
  const { uploadUrl, key } = await generateUploadUrl(file.name, file.type);
  await uploadResumeToS3(file, uploadUrl);
  const evaluation = await evaluateResume({ ...jobDetails, resume_s3_key: key });
  return { resumeId: evaluation.id, s3Key: key, evaluation };
}

const resumeService = {
  generateUploadUrl,
  uploadResumeToS3,
  createLinkedInProject,
  uploadAndCreateLinkedInProject,
  evaluateResume,
  uploadAndEvaluateResume,
  listResumes,
  getResume,
  optimizeLinkedInProfile,
  auditLinkedInProfile,
  fetchLinkedInProfile,
  runLinkedInAudit,
  extractLinkedInFromUrl,
  reviewLinkedInProfile,
  improveLinkedInProfile,
  chatWithLinkedInCopilot,
};

/**
 * Chat with LinkedIn Copilot
 */
export async function chatWithLinkedInCopilot(
  projectId: string,
  message: string,
  history: Array<{ role: string; content: string }>,
  sectionId?: string
): Promise<{ message: string; suggestions: string[] }> {
  try {
    const response = await apiClient.post<LinkedInCopilotResponse>(
      '/linkedin/copilot',
      {
        project_id: projectId,
        user_message: message,
        conversation_history: history,
        section_id: sectionId,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Copilot chat error:", error);
    throw error;
  }
}


export default resumeService;
