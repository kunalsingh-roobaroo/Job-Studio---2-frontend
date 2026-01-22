# Resume Ready Rocket - Frontend Developer Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Recent Changes & Improvements](#recent-changes--improvements)
4. [Project Structure](#project-structure)
5. [Core Components](#core-components)
6. [Pages](#pages)
7. [Authentication](#authentication)
8. [State Management](#state-management)
9. [API Integration](#api-integration)
10. [Styling & Theming](#styling--theming)
11. [Development Workflow](#development-workflow)
12. [Build & Deployment](#build--deployment)
13. [Future Improvements](#future-improvements)

---

## Project Overview

Resume Ready Rocket is a modern React application that helps job seekers optimize their resumes using AI-powered analysis. The frontend provides an intuitive interface for uploading resumes, viewing analysis results, and accessing career improvement tools.

### Key Features
- **Resume Upload**: Drag-and-drop or click to upload PDF/DOCX files
- **Resume Evaluation**: Visual scoring dashboard with 8 metrics
- **ATS Compatibility**: Keyword analysis and formatting tips
- **Resume Rewrite**: Before/after comparison of optimized sections
- **Credibility Builder**: Personalized learning recommendations
- **Elevator Pitch**: Generated professional pitch and LinkedIn about
- **Interview Prep**: Tailored Q&A for job interviews
- **Resume Questionnaire**: Specific questions to improve content
- **LinkedIn Optimization**: Profile headline, about, post ideas, work experience

### Tech Stack
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui + Radix UI
- **Routing**: React Router DOM 7
- **Forms**: React Hook Form + Zod
- **Auth**: AWS Amplify + Cognito
- **HTTP Client**: Axios
- **Icons**: Lucide React

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Application                     │
├─────────────────────────────────────────────────────────┤
│  Pages (Routes)                                          │
│  ├── Home (Upload)                                       │
│  ├── ResumeEvaluation                                    │
│  ├── AtsCompatibility                                    │
│  ├── ResumeRewrite                                       │
│  ├── CredibilityBuilder                                  │
│  ├── ElevatorPitch                                       │
│  ├── InterviewPrep                                       │
│  ├── ResumeQuestionnaire                                 │
│  └── LinkedinOptimization                                │
├─────────────────────────────────────────────────────────┤
│  Components                                              │
│  ├── UI (shadcn/ui)                                      │
│  ├── Sidebar Navigation                                  │
│  ├── Top Navigation                                      │
│  └── Dialogs & Forms                                     │
├─────────────────────────────────────────────────────────┤
│  Services                                                │
│  ├── API Client (Axios)                                  │
│  └── Type Definitions                                    │
├─────────────────────────────────────────────────────────┤
│  Contexts                                                │
│  ├── AuthContext (Cognito)                               │
│  ├── AppContext (Resume State)                           │
│  └── ThemeContext (Dark/Light)                           │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Action → Component → API Service → Backend → DynamoDB
                                           ↓
User View ← Component ← State Update ← API Response
```

### Route Structure

```
/                                    → Home (Upload)
/signin                              → Sign In
/signup                              → Sign Up
/forgot-password                     → Password Reset
/account                             → User Account
/resume/:resumeId/evaluation         → Resume Evaluation
/resume/:resumeId/ats-compatibility  → ATS Analysis
/resume/:resumeId/resume-rewrite     → Resume Rewrite
/resume/:resumeId/credibility-builder → Credibility Builder
/resume/:resumeId/elevator-pitch     → Elevator Pitch
/resume/:resumeId/interview-prep     → Interview Prep
/resume/:resumeId/resume-questionnaire → Questionnaire
/resume/:resumeId/linkedin-optimization → LinkedIn
```

---

## Recent Changes & Improvements

### 1. LinkedIn Work Experience Section
**Problem**: LinkedIn optimization page lacked work experience details

**Solution**:
- Added `LinkedInWorkExperience` interface to `types.ts`
- Created new "Work Experience" tab in `linkedinOptimization.tsx`
- Displays accordion with before/after descriptions
- Shows key achievements and skills used for each role

**Files Changed**:
- `frontend/src/services/api/types.ts`
- `frontend/src/pages/linkedinOptimization.tsx`

### 2. Post Ideas with Proper Titles
**Problem**: LinkedIn post ideas showed generic "Idea 1", "Idea 2" labels

**Solution**:
- Created `extractIdeaTitle()` helper function
- Extracts first sentence or ~60 characters as meaningful title
- Provides better UX with descriptive accordion labels

**Files Changed**:
- `frontend/src/pages/linkedinOptimization.tsx`

### 3. Email Verification Message After SignUp
**Problem**: Users were redirected immediately after registration without verification notice

**Solution**:
- Added `registrationComplete` and `registeredEmail` states
- Shows verification message screen after successful registration
- Displays email icon, verification message, and "Login" button
- User must verify email before signing in

**Files Changed**:
- `frontend/src/pages/SignUp.tsx`

---

## Project Structure

```
frontend/
├── public/                     # Static assets
│   └── vite.svg
│
├── src/
│   ├── assets/                 # Images and media
│   │   ├── Favicon.png
│   │   ├── newBanner.png
│   │   └── resumeReviewer_banner.png
│   │
│   ├── auth/                   # Authentication
│   │   ├── cognito.ts          # Cognito API calls
│   │   ├── config.ts           # Amplify configuration
│   │   ├── context.tsx         # AuthContext provider
│   │   ├── hooks.ts            # useAuth hook
│   │   ├── ProtectedRoute.tsx  # Route guard
│   │   └── types.ts            # Auth types
│   │
│   ├── components/
│   │   ├── menubar/            # Menu bar components
│   │   ├── sidebar/            # Sidebar navigation
│   │   │   ├── nav-main.tsx    # Main navigation items
│   │   │   ├── nav-projects.tsx # Project list
│   │   │   └── nav-user.tsx    # User menu
│   │   ├── top-nav/            # Top navigation
│   │   │   ├── AppTopNav.tsx   # Main top nav
│   │   │   └── ProjectDropdown.tsx # Project selector
│   │   ├── ui/                 # shadcn/ui components
│   │   │   ├── accordion.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── tooltip.tsx
│   │   │   └── ...
│   │   ├── app-sidebar.tsx     # Main sidebar
│   │   ├── EditJobDetailsDialog.tsx # Job details form
│   │   └── MobileHeader.tsx    # Mobile navigation
│   │
│   ├── config/
│   │   └── env.ts              # Environment variables
│   │
│   ├── contexts/
│   │   ├── AppContext.tsx      # Global app state
│   │   └── ThemeContext.tsx    # Theme management
│   │
│   ├── hooks/
│   │   └── use-mobile.ts       # Mobile detection
│   │
│   ├── lib/
│   │   └── utils.ts            # Utility functions (cn)
│   │
│   ├── pages/
│   │   ├── Account.tsx         # User account
│   │   ├── atsCompatibility.tsx
│   │   ├── credibilityBuilder.tsx
│   │   ├── elevatorPitch.tsx
│   │   ├── ForgotPassword.tsx
│   │   ├── Home.tsx            # Upload page
│   │   ├── interviewPrep.tsx
│   │   ├── linkedinOptimization.tsx
│   │   ├── ResumeEvaluation.tsx
│   │   ├── resumeQuestionnaire.tsx
│   │   ├── resumeRewrite.tsx
│   │   ├── SignIn.tsx
│   │   └── SignUp.tsx
│   │
│   ├── services/
│   │   └── api/
│   │       ├── client.ts       # Axios instance
│   │       ├── endpoints.ts    # API endpoint functions
│   │       └── types.ts        # TypeScript interfaces
│   │
│   ├── App.tsx                 # Main app with routes
│   ├── index.css               # Global styles
│   └── main.tsx                # Entry point
│
├── .env                        # Environment variables
├── .env.example                # Example env file
├── .env.production             # Production env
├── components.json             # shadcn/ui config
├── eslint.config.js            # ESLint config
├── index.html                  # HTML template
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── tsconfig.app.json           # App TS config
├── tsconfig.node.json          # Node TS config
└── vite.config.ts              # Vite config
```

---

## Core Components

### Sidebar (`components/app-sidebar.tsx`)

Main navigation sidebar with:
- Logo and branding
- Main navigation items (features)
- Project list (user's resumes)
- User menu (account, logout)

```tsx
<AppSidebar hideProjectsAndUser={false} />
```

### Top Navigation (`components/top-nav/AppTopNav.tsx`)

Fixed top navigation with:
- Project dropdown selector
- Edit job details button
- Theme toggle
- User avatar

### UI Components (`components/ui/`)

shadcn/ui components customized for the app:

| Component | Usage |
|-----------|-------|
| `Button` | Primary actions, variants: default, outline, ghost |
| `Card` | Content containers |
| `Accordion` | Expandable sections (post ideas, work experience) |
| `Tabs` | Tab navigation (LinkedIn optimization) |
| `Dialog` | Modal dialogs (edit job details) |
| `Input` | Form inputs |
| `Label` | Form labels |
| `Tooltip` | Hover tooltips |
| `Separator` | Visual dividers |

### Edit Job Details Dialog (`components/EditJobDetailsDialog.tsx`)

Modal form for updating job context:
- Job title
- Company
- Industry
- LinkedIn URL
- Job description
- Re-analyze checkbox

---

## Pages

### Home (`pages/Home.tsx`)

Resume upload page with:
- Drag-and-drop file upload
- Job details form
- Submit for analysis

### Resume Evaluation (`pages/ResumeEvaluation.tsx`)

Dashboard showing:
- 8 metric scores with visual indicators
- SWOT analysis (Strengths, Weaknesses, Opportunities, Threats)
- Suggestions for improvement

### ATS Compatibility (`pages/atsCompatibility.tsx`)

ATS analysis results:
- Overall ATS score
- Missing keywords list
- Section-specific tips
- Format recommendations

### Resume Rewrite (`pages/resumeRewrite.tsx`)

Before/after comparison:
- Section-by-section rewrites
- High-impact bullet points
- Changes summary
- Suggestions

### Credibility Builder (`pages/credibilityBuilder.tsx`)

Learning recommendations:
- Courses with providers and URLs
- Certifications
- Project ideas with steps
- Tools to learn
- Additional resources

### Elevator Pitch (`pages/elevatorPitch.tsx`)

Generated content:
- Elevator pitch text
- LinkedIn about section
- Tone and delivery tips
- When to use tips
- LinkedIn optimization tips

### Interview Prep (`pages/interviewPrep.tsx`)

Interview preparation:
- Questions organized by category
- Model answers
- Tips for each question

### Resume Questionnaire (`pages/resumeQuestionnaire.tsx`)

Improvement questions:
- Specific questions based on resume content
- Categories: Work Experience, Skills, Projects, Education, Strategy
- Each question references actual resume details

### LinkedIn Optimization (`pages/linkedinOptimization.tsx`)

Profile optimization with tabs:
- **Headline**: Optimized headline with regenerate option
- **About Section**: Professional summary with regenerate option
- **Post Ideas**: Content ideas with meaningful titles
- **Work Experience**: Before/after descriptions, achievements, skills

---

## Authentication

### AWS Amplify + Cognito

Authentication is handled by AWS Amplify with Cognito:

```tsx
// src/auth/config.ts
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'ap-south-1_PUDYyIAQg',
      userPoolClientId: '2gs2kdn307akpftudbgckod669',
      signUpVerificationMethod: 'code',
    }
  }
});
```

### Auth Context (`src/auth/context.tsx`)

Provides authentication state and methods:

```tsx
const { user, isAuthenticated, isLoading, signIn, signOut } = useAuth();
```

### Protected Routes (`src/auth/ProtectedRoute.tsx`)

Guards routes that require authentication:

```tsx
<Route element={<ProtectedRoute />}>
  <Route path="/" element={<Home />} />
  {/* Protected routes */}
</Route>
```

### Auth Flow

1. **Sign Up**: User registers → Cognito sends verification email
2. **Verify**: User clicks email link → Account verified
3. **Sign In**: User enters credentials → Cognito returns JWT
4. **API Calls**: JWT sent in Authorization header
5. **Sign Out**: Clear tokens and redirect to sign in

### Sign Up with Verification Message

```tsx
// After successful registration
if (registrationComplete) {
  return (
    <div className="verification-message">
      <MailIcon />
      <p>Please verify your account via the link sent to your email id</p>
      <p>{registeredEmail}</p>
      <Button onClick={() => navigate('/signin')}>Login</Button>
    </div>
  );
}
```

---

## State Management

### App Context (`src/contexts/AppContext.tsx`)

Global state for resume data:

```tsx
interface AppContextType {
  currentResume: ResumeItem | null;
  setCurrentResume: (resume: ResumeItem | null) => void;
  resumes: ResumeItemSummary[];
  setResumes: (resumes: ResumeItemSummary[]) => void;
  refreshResumes: () => Promise<void>;
}
```

### Theme Context (`src/contexts/ThemeContext.tsx`)

Dark/light mode management:

```tsx
const { theme, setTheme, toggleTheme } = useTheme();
```

### Local State Pattern

Each page manages its own loading and data state:

```tsx
const [data, setData] = useState<AnalysisType | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  fetchData();
}, [resumeId]);
```

---

## API Integration

### API Client (`src/services/api/client.ts`)

Axios instance with auth interceptor:

```tsx
import axios from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

apiClient.interceptors.request.use(async (config) => {
  const session = await fetchAuthSession();
  const token = session.tokens?.accessToken?.toString();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### API Endpoints (`src/services/api/endpoints.ts`)

Functions for each API call:

```tsx
export const evaluateResume = async (data: ResumeEvaluationRequest) => {
  const response = await apiClient.post('/resumes/evaluate-resume', data);
  return response.data;
};

export const getResume = async (resumeId: string) => {
  const response = await apiClient.get(`/resumes/${resumeId}`);
  return response.data;
};

export const runAtsAnalysis = async (resumeId: string) => {
  const response = await apiClient.post(`/resumes/${resumeId}/ats-analysis`);
  return response.data;
};
```

### Type Definitions (`src/services/api/types.ts`)

TypeScript interfaces matching backend schemas:

```tsx
export interface LinkedInWorkExperience {
  jobTitle: string;
  company: string;
  duration: string;
  location: string;
  descriptionBefore: string;
  descriptionAfter: string;
  keyAchievements: string[];
  skillsUsed: string[];
}

export interface LinkedInOptimization {
  headline: string;
  aboutSection: string;
  postIdeas: LinkedInPostIdea[];
  workExperience: LinkedInWorkExperience[];
}
```

---

## Styling & Theming

### Tailwind CSS 4

Utility-first CSS framework with custom configuration:

```tsx
// Example usage
<div className="flex items-center gap-4 p-6 bg-background text-foreground">
  <Button variant="default" size="lg">
    Click me
  </Button>
</div>
```

### CSS Variables

Theme colors defined in `index.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --secondary: 210 40% 96.1%;
  /* ... */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... */
}
```

### Component Styling

Using `cn()` utility for conditional classes:

```tsx
import { cn } from '@/lib/utils';

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  variant === "primary" && "primary-classes"
)} />
```

### Glass Effect

Custom glass morphism utility:

```css
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

---

## Development Workflow

### Setup

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

Create `.env` file:

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_AWS_REGION=ap-south-1
VITE_COGNITO_USER_POOL_ID=ap-south-1_PUDYyIAQg
VITE_COGNITO_CLIENT_ID=2gs2kdn307akpftudbgckod669
```

### Adding a New Page

1. **Create page component** in `src/pages/`
2. **Add route** in `src/App.tsx`
3. **Add navigation item** in `src/components/sidebar/nav-main.tsx`
4. **Add API types** in `src/services/api/types.ts`
5. **Add API endpoint** in `src/services/api/endpoints.ts`

### Adding a New Component

1. **Create component** in `src/components/`
2. **Use shadcn/ui** as base when possible
3. **Add TypeScript props interface**
4. **Export from component file**

### Code Style

- Use TypeScript for all files
- Use functional components with hooks
- Use named exports (not default)
- Follow React naming conventions (PascalCase for components)
- Use `cn()` for conditional class names
- Prefer composition over inheritance

---

## Build & Deployment

### Production Build

```bash
npm run build
```

Output in `dist/` folder.

### Environment Files

- `.env` - Local development
- `.env.production` - Production build

### Deployment Options

1. **Static hosting** (S3 + CloudFront, Vercel, Netlify)
2. **Docker container**
3. **AWS Amplify Hosting**

### Build Optimization

Vite automatically:
- Tree-shakes unused code
- Minifies JavaScript and CSS
- Generates source maps
- Splits code into chunks

---

## Future Improvements

### High Priority

1. **Add loading skeletons** for better perceived performance
2. **Implement error boundaries** for graceful error handling
3. **Add toast notifications** for user feedback
4. **Implement offline support** with service workers
5. **Add keyboard shortcuts** for power users

### Medium Priority

1. **Add unit tests** with Vitest and React Testing Library
2. **Implement E2E tests** with Playwright
3. **Add analytics tracking** (Google Analytics, Mixpanel)
4. **Implement lazy loading** for routes
5. **Add PWA support** for mobile installation

### Low Priority

1. **Add internationalization** (i18n) support
2. **Implement drag-and-drop** for resume sections
3. **Add export to PDF** functionality
4. **Create onboarding tour** for new users
5. **Add collaborative features** (share resume)

### UI/UX Improvements

1. **Add progress indicators** for background analysis
2. **Implement comparison view** for resume versions
3. **Add print-friendly styles** for analysis results
4. **Create mobile-optimized layouts** for all pages
5. **Add accessibility improvements** (ARIA labels, focus management)

### Technical Debt

1. **Refactor large page components** into smaller pieces
2. **Add comprehensive TypeScript types** for all data
3. **Implement proper error handling** for all API calls
4. **Add request caching** with React Query or SWR
5. **Create shared hooks** for common patterns

---

## Troubleshooting

### Common Issues

**"Network Error" on API calls**
- Check if backend is running
- Verify VITE_API_URL in .env
- Check CORS configuration on backend

**Authentication not working**
- Verify Cognito configuration matches backend
- Check if tokens are being sent in headers
- Clear localStorage and try again

**Styles not applying**
- Run `npm run dev` to rebuild
- Check Tailwind class names
- Verify CSS imports in main.tsx

**Build fails**
- Check TypeScript errors with `npm run lint`
- Verify all imports are correct
- Check for circular dependencies

### Debug Tips

```tsx
// Log API responses
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response);
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Log auth state
useEffect(() => {
  console.log('Auth state:', { user, isAuthenticated });
}, [user, isAuthenticated]);
```

---

## Component Reference

### Button Variants

```tsx
<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>
```

### Card Usage

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
  <CardFooter>
    Footer actions
  </CardFooter>
</Card>
```

### Accordion Usage

```tsx
<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Section Title</AccordionTrigger>
    <AccordionContent>
      Section content
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

### Tabs Usage

```tsx
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

---

## Contact & Resources

- **React Docs**: https://react.dev
- **Vite Docs**: https://vitejs.dev
- **Tailwind CSS**: https://tailwindcss.com
- **shadcn/ui**: https://ui.shadcn.com
- **Radix UI**: https://www.radix-ui.com
- **AWS Amplify**: https://docs.amplify.aws
