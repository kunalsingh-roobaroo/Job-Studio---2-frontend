# Resume Reviewer - Frontend Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              React Application                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         App Component                                │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐ │   │
│  │  │   Router    │  │  Providers  │  │      Layout Components      │ │   │
│  │  │ (React      │  │ • Auth      │  │  • Sidebar                  │ │   │
│  │  │  Router)    │  │ • App       │  │  • TopNav                   │ │   │
│  │  │             │  │ • Theme     │  │  • MobileHeader             │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                           Pages                                      │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐  │   │
│  │  │  Home   │ │Evaluation│ │   ATS   │ │ Rewrite │ │ Credibility │  │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────────┘  │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                   │   │
│  │  │  Pitch  │ │Interview│ │Question.│ │LinkedIn │                   │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         Services                                     │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │                    API Client (Axios)                        │   │   │
│  │  │  • Auth interceptor (JWT token injection)                   │   │   │
│  │  │  • Error handling                                           │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTPS
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           External Services                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐     │
│  │  FastAPI Backend │  │   AWS Cognito   │  │        AWS S3           │     │
│  │  /api/v1/        │  │  Authentication │  │  (Direct Upload)        │     │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Project Structure

```
frontend/
├── public/                         # Static assets
│   └── vite.svg
│
├── src/
│   ├── assets/                     # Images and media
│   │   ├── Favicon.png
│   │   ├── newBanner.png
│   │   └── resumeReviewer_banner.png
│   │
│   ├── auth/                       # Authentication Module
│   │   ├── cognito.ts              # Cognito API calls
│   │   ├── config.ts               # Amplify configuration
│   │   ├── context.tsx             # AuthContext provider
│   │   ├── hooks.ts                # useAuth hook
│   │   ├── ProtectedRoute.tsx      # Route guard component
│   │   └── types.ts                # Auth type definitions
│   │
│   ├── components/
│   │   ├── menubar/                # Menu bar components
│   │   ├── sidebar/                # Sidebar navigation
│   │   │   ├── nav-main.tsx        # Main navigation items
│   │   │   ├── nav-projects.tsx    # Project/resume list
│   │   │   └── nav-user.tsx        # User menu
│   │   ├── top-nav/                # Top navigation
│   │   │   ├── AppTopNav.tsx       # Main top nav bar
│   │   │   └── ProjectDropdown.tsx # Project selector dropdown
│   │   ├── ui/                     # shadcn/ui components
│   │   │   ├── accordion.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── tooltip.tsx
│   │   │   └── ...
│   │   ├── app-sidebar.tsx         # Main sidebar component
│   │   ├── EditJobDetailsDialog.tsx # Job details edit modal
│   │   └── MobileHeader.tsx        # Mobile navigation header
│   │
│   ├── config/
│   │   └── env.ts                  # Environment variables
│   │
│   ├── contexts/
│   │   ├── AppContext.tsx          # Global app state
│   │   └── ThemeContext.tsx        # Theme management
│   │
│   ├── hooks/
│   │   └── use-mobile.ts           # Mobile detection hook
│   │
│   ├── lib/
│   │   └── utils.ts                # Utility functions (cn)
│   │
│   ├── pages/
│   │   ├── Account.tsx             # User account settings
│   │   ├── atsCompatibility.tsx    # ATS analysis page
│   │   ├── credibilityBuilder.tsx  # Learning recommendations
│   │   ├── elevatorPitch.tsx       # Pitch generation
│   │   ├── ForgotPassword.tsx      # Password reset
│   │   ├── Home.tsx                # Upload page
│   │   ├── interviewPrep.tsx       # Interview Q&A
│   │   ├── linkedinOptimization.tsx # LinkedIn optimization
│   │   ├── ResumeEvaluation.tsx    # Evaluation dashboard
│   │   ├── resumeQuestionnaire.tsx # Improvement questions
│   │   ├── resumeRewrite.tsx       # Resume rewrite
│   │   ├── SignIn.tsx              # Login page
│   │   └── SignUp.tsx              # Registration page
│   │
│   ├── services/
│   │   └── api/
│   │       ├── client.ts           # Axios instance with interceptors
│   │       ├── resumeService.ts    # Resume API functions
│   │       └── types.ts            # TypeScript interfaces
│   │
│   ├── App.tsx                     # Main app with routes
│   ├── index.css                   # Global styles + Tailwind
│   └── main.tsx                    # Entry point
│
├── Docs/                           # Documentation
│   ├── Workflow.md                 # User journey & technical flow
│   └── Architecture.md             # This file
│
├── .env                            # Environment variables (local)
├── .env.production                 # Production environment
├── components.json                 # shadcn/ui configuration
├── eslint.config.js                # ESLint configuration
├── index.html                      # HTML template
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript configuration
├── tsconfig.app.json               # App-specific TS config
├── tsconfig.node.json              # Node-specific TS config
└── vite.config.ts                  # Vite configuration
```

## Authentication

### AWS Amplify + Cognito Integration

Authentication is handled by AWS Amplify with Cognito User Pools.

```typescript
// src/auth/config.ts
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
      signUpVerificationMethod: 'code',
    }
  }
});
```

### Auth Context

```typescript
// Usage in components
const { user, isAuthenticated, isLoading, signIn, signOut } = useAuth();
```

### Protected Routes

```typescript
// src/auth/ProtectedRoute.tsx
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/signin" />;
  
  return <Outlet />;
}
```

### Authentication Flow

```
1. User enters credentials on SignIn page
2. AWS Amplify signIn() called
3. Cognito validates and returns JWT tokens
4. Tokens stored in localStorage (Amplify handles this)
5. AuthContext updates isAuthenticated = true
6. ProtectedRoute allows access to protected pages
7. API client interceptor adds token to requests
```

### Configuration

| Setting | Environment Variable |
|---------|---------------------|
| User Pool ID | VITE_COGNITO_USER_POOL_ID |
| Client ID | VITE_COGNITO_CLIENT_ID |
| Region | VITE_AWS_REGION |

## State Management

### Context Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        main.tsx                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                     ThemeProvider                          │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │                   AuthProvider                       │ │ │
│  │  │  ┌───────────────────────────────────────────────┐ │ │ │
│  │  │  │                 AppProvider                    │ │ │ │
│  │  │  │  ┌─────────────────────────────────────────┐ │ │ │ │
│  │  │  │  │                  App                     │ │ │ │ │
│  │  │  │  └─────────────────────────────────────────┘ │ │ │ │
│  │  │  └───────────────────────────────────────────────┘ │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### AppContext State

```typescript
interface AppContextType {
  // Resume data
  currentResume: ResumeItem | null;
  setCurrentResume: (resume: ResumeItem | null) => void;
  resumes: ResumeItemSummary[];
  setResumes: (resumes: ResumeItemSummary[]) => void;
  refreshResumes: () => Promise<void>;
  
  // Upload state
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  jobDetails: JobDetails;
  setJobDetails: (details: JobDetails) => void;
  resumeS3Key: string | null;
  setResumeS3Key: (key: string | null) => void;
  
  // UI state
  isUploading: boolean;
  setIsUploading: (uploading: boolean) => void;
  uploadError: string | null;
  setUploadError: (error: string | null) => void;
  
  // Feature data setters
  setResumeEvaluation: (id: string, evaluation: ResumeEvaluation) => void;
  setResumeItem: (item: Partial<ResumeItem>) => void;
}
```

### State Reset on Resume Switch

```typescript
// Each page component resets local state when resumeId changes
useEffect(() => {
  // Reset all local state
  setData(null);
  setLoading(true);
  setError(null);
}, [resumeId]);

// AppContext uses complete replacement (not merge)
const setResumeItem = (item: Partial<ResumeItem>) => {
  setCurrentResume(prev => ({
    ...prev,
    ...item,
    // Use ?? for null handling (not ||)
    resumeEvaluation: item.resumeEvaluation ?? null,
    atsAnalysis: item.atsAnalysis ?? null,
    // ... other fields
  }));
};
```

## API Integration

### API Client Setup

```typescript
// src/services/api/client.ts
import axios from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth interceptor
apiClient.interceptors.request.use(async (config) => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.accessToken?.toString();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Failed to get auth token:', error);
  }
  return config;
});

export default apiClient;
```

### Resume Service

```typescript
// src/services/api/resumeService.ts
const resumeService = {
  // Upload
  generateUploadUrl: (fileName: string, contentType: string) => 
    apiClient.post('/resumes/generate-upload-url', { file_name: fileName, content_type: contentType }),
  
  uploadResumeToS3: (file: File, uploadUrl: string) =>
    axios.put(uploadUrl, file, { headers: { 'Content-Type': file.type } }),
  
  // Evaluation
  evaluateResume: (data: ResumeEvaluationRequest) =>
    apiClient.post('/resumes/evaluate-resume', data),
  
  // CRUD
  getResume: (resumeId: string) =>
    apiClient.get(`/resumes/${resumeId}`),
  
  listResumes: () =>
    apiClient.get('/resumes/'),
  
  // Updates
  updateJobDetails: (resumeId: string, data: UpdateJobDetailsRequest) =>
    apiClient.patch(`/resumes/${resumeId}/job-details`, data),
  
  renameProject: (resumeId: string, role: string, resumeName: string) =>
    apiClient.patch(`/resumes/${resumeId}/rename`, { role, resume_name: resumeName }),
  
  // Feature-specific
  runAtsAnalysis: (resumeId: string) =>
    apiClient.post(`/resumes/${resumeId}/ats-analysis`),
  
  regenerateHeadline: (resumeId: string) =>
    apiClient.post(`/resumes/${resumeId}/linkedin-optimization/regenerate-headline`),
  
  regenerateAboutSection: (resumeId: string) =>
    apiClient.post(`/resumes/${resumeId}/linkedin-optimization/regenerate-about`),
};
```

### Type Definitions

```typescript
// src/services/api/types.ts
export interface ResumeItem {
  id: string;
  userID: string;
  name: string;
  resumeS3Key: string;
  jobDetails: JobDetails;
  resumeEvaluation: ResumeEvaluation | null;
  atsAnalysis: ATSAnalysis | null;
  resumeRewrite: ResumeRewrite | null;
  credibilityBoost: CredibilityBoost | null;
  elevatorPitchAnalysis: ElevatorPitchAnalysis | null;
  interviewPrep: InterviewPrep | null;
  resumeQuestionnaire: ResumeQuestionnaire | null;
  linkedinOptimization: LinkedInOptimization | null;
  createdAt: string;
  updatedAt: string;
}

export interface LinkedInOptimization {
  headline: string;
  aboutSection: string;
  postIdeas: LinkedInPostIdea[];
  workExperience: LinkedInWorkExperience[];
}
```

## Build and Deployment

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Environment Variables

```env
# .env (local development)
VITE_API_URL=http://localhost:8000/api/v1
VITE_AWS_REGION=ap-south-1
VITE_COGNITO_USER_POOL_ID=ap-south-1_PUDYyIAQg
VITE_COGNITO_CLIENT_ID=2gs2kdn307akpftudbgckod669
```

```env
# .env.production
VITE_API_URL=https://api.roobaroo.ai/api/v1
VITE_AWS_REGION=ap-south-1
VITE_COGNITO_USER_POOL_ID=ap-south-1_PUDYyIAQg
VITE_COGNITO_CLIENT_ID=2gs2kdn307akpftudbgckod669
```

### Build Output

```bash
npm run build
# Output in dist/ folder
# - index.html
# - assets/
#   - index-[hash].js
#   - index-[hash].css
#   - vendor-[hash].js
```

### Server Deployment

**AWS Amplify Hosting:**
1. Connect GitHub repository
2. Configure build settings
3. Set environment variables
4. Deploy

**Static Hosting (S3 + CloudFront):**
```bash
# Build
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### Deployment URLs

| Environment | URL |
|-------------|-----|
| Production | https://product.roobaroo.ai |
| Development | https://dev.d2ufxxuon3fudk.amplifyapp.com |
| Local | http://localhost:5173 |

## Styling

### Tailwind CSS Configuration

```javascript
// tailwind.config.js (via Vite)
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: 'hsl(var(--primary))',
        // ... more CSS variables
      },
    },
  },
};
```

### CSS Variables (Theme)

```css
/* src/index.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --secondary: 210 40% 96.1%;
  --muted: 210 40% 96.1%;
  --accent: 210 40% 96.1%;
  --destructive: 0 84.2% 60.2%;
  --border: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  /* ... dark mode values */
}
```

### Component Styling Pattern

```typescript
import { cn } from '@/lib/utils';

// Conditional classes
<div className={cn(
  "base-classes",
  isActive && "active-classes",
  hasError && "!border-red-500 ring-2 ring-red-500/30"
)} />
```

## Testing

### Run Tests

```bash
# Unit tests (if configured)
npm run test

# E2E tests (if configured)
npm run test:e2e

# Type checking
npm run typecheck
```

### Test Structure (Recommended)

```
src/
├── __tests__/
│   ├── components/
│   │   └── Button.test.tsx
│   ├── pages/
│   │   └── Home.test.tsx
│   └── services/
│       └── resumeService.test.ts
```

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "Network Error" | Backend not running | Start backend: `uvicorn app.main:app --reload` |
| Auth not working | Wrong Cognito config | Verify VITE_COGNITO_* env vars |
| Stale data on switch | State not reset | Check useEffect dependencies |
| CORS error | Backend CORS config | Add frontend URL to backend CORS |
| Build fails | TypeScript errors | Run `npm run lint` to find issues |

### Debug Tips

```typescript
// Log API responses
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.url, response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', error.config?.url, error.response?.data);
    return Promise.reject(error);
  }
);

// Log auth state
useEffect(() => {
  console.log('Auth state:', { user, isAuthenticated, isLoading });
}, [user, isAuthenticated, isLoading]);

// Log context state
useEffect(() => {
  console.log('AppContext:', { currentResume, resumes });
}, [currentResume, resumes]);
```
