import { YouLearnSidebar } from '@/components/YouLearnSidebar';
import Home from '@/pages/Home';
import ResumeEvaluation from '@/pages/ResumeEvaluation';
import LinkedInLanding from '@/pages/LinkedInLanding';
import LinkedInCreate from '@/pages/LinkedInCreate';
import LinkedInReview from '@/pages/LinkedInReview';
import LinkedInImprove from '@/pages/LinkedInImprove';
import LinkedInWorkspace from '@/pages/LinkedInWorkspace';
import WorkspaceDemo from '@/pages/WorkspaceDemo';
import Account from '@/pages/Account';
import SignIn from '@/pages/SignIn';
import SignUp from '@/pages/SignUp';
import VerifyOTP from '@/pages/VerifyOTP';
import PersonalDetails from '@/pages/PersonalDetails';
import UsageGoals from '@/pages/UsageGoals';
import ForgotPassword from '@/pages/ForgotPassword';
import DebugPDF from '@/pages/DebugPDF';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import * as React from 'react';
import { cn } from '@/lib/utils';

function LayoutWithYouLearnSidebar() {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    return saved === 'true'
  })

  React.useEffect(() => {
    const handleSidebarToggle = (e: CustomEvent) => {
      setSidebarCollapsed(e.detail.isCollapsed)
    }
    window.addEventListener('sidebar-toggle', handleSidebarToggle as EventListener)
    return () => window.removeEventListener('sidebar-toggle', handleSidebarToggle as EventListener)
  }, [])

  return (
    <div className="flex w-full min-h-screen h-screen">
      <YouLearnSidebar />
      <main
        className={cn(
          "flex-1 overflow-auto bg-white dark:bg-[#0C0C0C] transition-all duration-300",
          sidebarCollapsed ? "ml-[60px]" : "ml-[260px]"
        )}
      >
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/personal-details" element={<PersonalDetails />} />
        <Route path="/usage-goals" element={<UsageGoals />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/debug-pdf" element={<DebugPDF />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<LayoutWithYouLearnSidebar />}>
            <Route path="/" element={<Home />} />
            <Route path="/linkedin" element={<LinkedInLanding />} />
            <Route path="/linkedin/create" element={<LinkedInCreate />} />
            <Route path="/linkedin/review" element={<LinkedInReview />} />
            <Route path="/linkedin/improve" element={<LinkedInImprove />} />
            <Route path="/linkedin/workspace/:resumeId" element={<LinkedInWorkspace />} />
            <Route path="/workspace-demo" element={<WorkspaceDemo />} />
            <Route path="/account" element={<Account />} />
            <Route path="/resume/:resumeId/evaluation" element={<ResumeEvaluation />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
