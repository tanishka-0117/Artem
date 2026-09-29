import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import AppLayout from '@/components/layout/AppLayout';

// Pages (Lazy loaded for optimization)
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Practice = lazy(() => import('@/pages/Practice'));
const AIInterview = lazy(() => import('@/pages/AIInterview'));
const Coding = lazy(() => import('@/pages/Coding'));
const ResumeAnalyzer = lazy(() => import('@/pages/ResumeAnalyzer'));
const QuestionBank = lazy(() => import('@/pages/QuestionBank'));
const Progress = lazy(() => import('@/pages/Progress'));
const Roadmap = lazy(() => import('@/pages/Roadmap'));
const Profile = lazy(() => import('@/pages/Profile'));

// Auth (Lazy loaded)
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'));
const VerifyEmail = lazy(() => import('@/pages/auth/VerifyEmail'));

// 404
const NotFound: React.FC = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
    <h1 className="text-display artem-gradient-text mb-2">404</h1>
    <p className="text-body-lg text-text-secondary mb-6">Page not found</p>
    <a href="/" className="text-primary hover:text-primary-hover font-medium">
      Go to Dashboard
    </a>
  </div>
);

// Loading fallback for Suspense
const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// Protected route wrapper — redirects to /login if not authenticated
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const location = useLocation();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Guest-only route — redirects to / if already authenticated
const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) {
    return <PageLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const checkSession = useAuthStore((s) => s.checkSession);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Auth routes — only for guests */}
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
        <Route path="/reset-password" element={<GuestRoute><ResetPassword /></GuestRoute>} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* App routes — protected */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/ai-interview" element={<AIInterview />} />
          <Route path="/coding" element={<Coding />} />
          <Route path="/resume" element={<ResumeAnalyzer />} />
          <Route path="/questions" element={<QuestionBank />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default App;
