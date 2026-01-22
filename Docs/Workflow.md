# Resume Reviewer - Frontend Workflow

## Project Overview

Resume Reviewer (Job Studio) is a React-based web application that helps job seekers optimize their resumes using AI-powered analysis. The frontend is built with React 19, TypeScript, Vite, and integrates with AWS Amplify for authentication.

## User Journey - Technical Flow

### 1. Authentication Flow

```
User lands on app
    │
    ├─► Unauthenticated
    │       │
    │       └─► ProtectedRoute redirects to /signin
    │               │
    │               ├─► Sign In Page
    │               │       │
    │               │       ├─► User enters email/password
    │               │       │
    │               │       └─► AWS Amplify signIn()
    │               │               │
    │               │               ├─► Success → Store tokens → Redirect to /
    │               │               │
    │               │               └─► Error → Display error message
    │               │
    │               └─► Sign Up Page
    │                       │
    │                       ├─► User fills registration form
    │                       │
    │                       └─► AWS Amplify signUp()
    │                               │
    │                               ├─► Success → Show verification message
    │                               │       │
    │                               │       └─► "Please verify your email"
    │                               │               │
    │                               │               └─► User clicks Login button
    │                               │
    │                               └─► Error → Display error message
    │
    └─► Authenticated
            │
            └─► Render protected routes with sidebar layout
```

### 2. New Project Creation Flow

```
User on Home Page (/)
    │
    ├─► Fills job details form:
    │       • Job Title (required) ─► Validation: red border if empty
    │       • Company (optional)
    │       • Industry (optional)
    │       • LinkedIn URL (optional)
    │       • Job Description (optional)
    │
    ├─► Uploads resume file
    │       │
    │       ├─► Click "Attach Resume" button
    │       │       │
    │       │       └─► Opens file picker (PDF, DOCX)
    │       │
    │       ├─► Validation:
    │       │       • File type: .pdf, .doc, .docx
    │       │       • File size: ≤ 5MB
    │       │       • Red border if invalid/missing
    │       │
    │       └─► Display file chip with name and remove button
    │
    ├─► Selects destination (optional dropdown)
    │       │
    │       └─► "Where do you wish to start"
    │               • Resume Evaluation (default)
    │               • ATS Compatibility
    │               • Resume Rewrite
    │               • Credibility Builder
    │               • Elevator Pitch
    │               • Interview Prep
    │               • Resume Questionnaire
    │               • LinkedIn Optimization
    │
    └─► Clicks "Get Started"
            │
            ├─► Validation check
            │       │
            │       ├─► Invalid → Highlight errors (red borders)
            │       │
            │       └─► Valid → Continue
            │
            ├─► setIsUploading(true)
            │
            ├─► Step 1: Generate Upload URL
            │       │
            │       └─► resumeService.generateUploadUrl(filename, contentType)
            │               │
            │               └─► Returns { uploadUrl, key }
            │
            ├─► Step 2: Upload to S3
            │       │
            │       └─► resumeService.uploadResumeToS3(file, uploadUrl)
            │               │
            │               └─► Direct PUT to S3 presigned URL
            │
            ├─► Step 3: Evaluate Resume
            │       │
            │       └─► resumeService.evaluateResume({
            │               resume_s3_key,
            │               job_title,
            │               company,
            │               industry,
            │               linkedin,
            │               job_description
            │           })
            │               │
            │               └─► Returns { id, resume_evaluation, status }
            │
            ├─► Store in AppContext:
            │       • setResumeS3Key(key)
            │       • setResumeEvaluation(id, evaluation)
            │
            └─► Navigate to selected destination
                    │
                    └─► /resume/{id}/evaluation (or selected feature)
```

### 3. Feature Page Load Flow

```
User navigates to feature page
    │
    ├─► URL: /resume/:resumeId/{feature}
    │
    ├─► useParams() extracts resumeId
    │
    ├─► useEffect on mount/resumeId change
    │       │
    │       ├─► Check AppContext for cached data
    │       │       │
    │       │       ├─► currentResume?.id === resumeId
    │       │       │       │
    │       │       │       ├─► Has feature data → Use cached
    │       │       │       │
    │       │       │       └─► No feature data → Fetch
    │       │       │
    │       │       └─► Different resume → Fetch
    │       │
    │       └─► Fetch from API
    │               │
    │               └─► resumeService.getResume(resumeId)
    │                       │
    │                       ├─► Success → setCurrentResume(data)
    │                       │
    │                       └─► Error → setError(message)
    │
    ├─► Check if feature data exists
    │       │
    │       ├─► Exists → Display data
    │       │
    │       └─► Not exists → Show loading or trigger analysis
    │
    └─► Render feature-specific UI
```

### 4. Resume Switching Flow

```
User clicks different resume in sidebar
    │
    ├─► NavProjects component
    │       │
    │       └─► onClick handler
    │               │
    │               └─► navigate(`/resume/${newResumeId}/evaluation`)
    │
    ├─► URL changes → useParams gets new resumeId
    │
    ├─► Page component useEffect triggers
    │       │
    │       └─► Reset local state:
    │               • setData(null)
    │               • setLoading(true)
    │               • setError(null)
    │
    ├─► AppContext.setResumeItem resets:
    │       │
    │       └─► Complete state replacement (not merge)
    │               • Uses ?? instead of || for null handling
    │
    └─► Fetch new resume data
            │
            └─► Fresh data displayed (no stale data)
```

### 5. Edit Job Details Flow

```
User clicks "Edit" button in top nav
    │
    └─► Opens EditJobDetailsDialog
            │
            ├─► Pre-populated with current job details
            │       • jobTitle
            │       • company
            │       • industry
            │       • linkedin
            │       • jobDescription
            │
            ├─► User modifies fields
            │
            ├─► "Re-analyze resume" checkbox (optional)
            │
            └─► Clicks "Save Changes"
                    │
                    ├─► resumeService.updateJobDetails(resumeId, {
                    │       job_title,
                    │       company,
                    │       industry,
                    │       linkedin,
                    │       job_description,
                    │       re_analyze: boolean
                    │   })
                    │
                    ├─► If re_analyze:
                    │       │
                    │       ├─► Backend clears all analyses
                    │       │
                    │       ├─► Re-runs evaluation
                    │       │
                    │       └─► Triggers background analysis
                    │
                    ├─► Update AppContext with new data
                    │
                    └─► Close dialog
```

### 6. Regenerate Feature Flow (LinkedIn)

```
User on LinkedIn Optimization page
    │
    ├─► Clicks "Regenerate" on headline
    │       │
    │       └─► resumeService.regenerateHeadline(resumeId)
    │               │
    │               ├─► setRegeneratingHeadline(true)
    │               │
    │               ├─► API call
    │               │
    │               ├─► Update local state with new headline
    │               │
    │               └─► setRegeneratingHeadline(false)
    │
    └─► Clicks "Regenerate" on about section
            │
            └─► resumeService.regenerateAboutSection(resumeId)
                    │
                    └─► Same pattern as headline
```

## Component Hierarchy

```
App
├── BrowserRouter
│   └── Routes
│       ├── /signin → SignIn
│       ├── /signup → SignUp
│       ├── /forgot-password → ForgotPassword
│       │
│       └── ProtectedRoute
│           └── LayoutWithSidebar
│               ├── MobileHeader
│               ├── AppSidebar
│               │   ├── NavMain (feature links)
│               │   ├── NavProjects (resume list)
│               │   └── NavUser (account menu)
│               ├── AppTopNav
│               │   ├── ProjectDropdown
│               │   ├── EditJobDetailsDialog
│               │   └── ThemeToggle
│               │
│               └── SidebarInset
│                   └── Outlet (page content)
│                       ├── / → Home
│                       ├── /account → Account
│                       ├── /resume/:id/evaluation → ResumeEvaluation
│                       ├── /resume/:id/ats-compatibility → AtsCompatibility
│                       ├── /resume/:id/resume-rewrite → ResumeRewrite
│                       ├── /resume/:id/credibility-builder → CredibilityBuilder
│                       ├── /resume/:id/elevator-pitch → ElevatorPitch
│                       ├── /resume/:id/interview-prep → InterviewPrep
│                       ├── /resume/:id/resume-questionnaire → ResumeQuestionnaire
│                       └── /resume/:id/linkedin-optimization → LinkedinOptimization
```

## State Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Context Providers                              │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        AuthProvider                              │   │
│  │  • user: CognitoUser | null                                     │   │
│  │  • isAuthenticated: boolean                                     │   │
│  │  • isLoading: boolean                                           │   │
│  │  • signIn(), signOut(), signUp()                                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        AppProvider                               │   │
│  │  • currentResume: ResumeItem | null                             │   │
│  │  • resumes: ResumeItemSummary[]                                 │   │
│  │  • selectedFile: File | null                                    │   │
│  │  • jobDetails: JobDetails                                       │   │
│  │  • isUploading: boolean                                         │   │
│  │  • uploadError: string | null                                   │   │
│  │  • setResumeItem(), refreshResumes()                            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                       ThemeProvider                              │   │
│  │  • theme: 'light' | 'dark' | 'system'                           │   │
│  │  • setTheme(), toggleTheme()                                    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           Page Components                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      Local State (useState)                      │   │
│  │  • data: FeatureData | null                                     │   │
│  │  • loading: boolean                                             │   │
│  │  • error: string | null                                         │   │
│  │  • Feature-specific state (tabs, accordions, etc.)              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Summary

| Action | Source | Destination | Method |
|--------|--------|-------------|--------|
| Sign In | SignIn page | AuthContext | Amplify signIn() |
| Upload Resume | Home page | S3 | Presigned URL PUT |
| Evaluate Resume | Home page | Backend API | POST /evaluate-resume |
| Fetch Resume | Feature page | Backend API | GET /resumes/{id} |
| Update Job Details | Dialog | Backend API | PATCH /job-details |
| Switch Resume | Sidebar | URL + Context | navigate() + reset |
| Regenerate | Feature page | Backend API | POST /regenerate-* |

## Error Handling Flow

```
API Call
    │
    ├─► Try
    │       │
    │       └─► axios request with JWT token
    │               │
    │               ├─► 200 OK → Return data
    │               │
    │               └─► Error response
    │                       │
    │                       ├─► 401 Unauthorized → Redirect to /signin
    │                       │
    │                       ├─► 403 Forbidden → "Not authorized"
    │                       │
    │                       ├─► 404 Not Found → "Resume not found"
    │                       │
    │                       └─► 500 Server Error → "Something went wrong"
    │
    └─► Catch
            │
            └─► setError(errorMessage)
                    │
                    └─► Display error in UI
```
