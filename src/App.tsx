import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './layouts/AppLayout';
import { LandingPage } from './features/landing/LandingPage';
import { LoginPage } from './features/authentication/LoginPage';
import { SignupPage } from './features/authentication/SignupPage';
import { OnboardingPage } from './features/onboarding/OnboardingPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { CareerGoalPage } from './features/career-goal/CareerGoalPage';
import { SkillGapPage } from './features/skill-gap/SkillGapPage';
import { LearningRoadmapPage } from './features/learning-roadmap/LearningRoadmapPage';
import { SkillAssessmentPage } from './features/skill-assessment/SkillAssessmentPage';
import { ProjectRecommendationsPage } from './features/project-recommendations/ProjectRecommendationsPage';
import { ResumeAnalyzerPage } from './features/resume-analyzer/ResumeAnalyzerPage';
import { ResumeJobMatchPage } from './features/resume-job-matching/ResumeJobMatchPage';
import { InterviewSimulatorPage } from './features/interview-preparation/InterviewSimulatorPage';
import { AICareerCoachPage } from './features/ai-career-coach/AICareerCoachPage';
import { AnalyticsPage } from './features/analytics/AnalyticsPage';
import { ProfileSettingsPage } from './features/user-profile/ProfileSettingsPage';
import { AuthModal } from './features/authentication/AuthModal';
import { OnboardingModal } from './features/authentication/OnboardingModal';

function AppRoutes() {
  const { user, isLoading } = useApp();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // If user hasn't completed onboarding and is logged in, show onboarding
  React.useEffect(() => {
    if (user && user.onboardingCompleted === false) {
      setShowOnboarding(true);
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-lg mb-4 animate-pulse">
          CA
        </div>
        <p className="text-sm font-semibold tracking-wide text-slate-300">
          Initializing CareerAI Intelligence Engine...
        </p>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Unauthenticated / Marketing Pages without sidebar */}
        <Route path="/welcome" element={<LandingPage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />

        {/* Core Platform Dashboard Pages with Dark Navy Sidebar & Floating Coach */}
        <Route
          path="/*"
          element={
            <AppLayout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/career" element={<CareerGoalPage />} />
                <Route path="/skill-gap" element={<SkillGapPage />} />
                <Route path="/roadmap" element={<LearningRoadmapPage />} />
                <Route path="/assessments" element={<SkillAssessmentPage />} />
                <Route path="/projects" element={<ProjectRecommendationsPage />} />
                <Route path="/resume" element={<ResumeAnalyzerPage />} />
                <Route path="/job-match" element={<ResumeJobMatchPage />} />
                <Route path="/interview" element={<InterviewSimulatorPage />} />
                <Route path="/ai-coach" element={<AICareerCoachPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/settings" element={<ProfileSettingsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AppLayout>
          }
        />
      </Routes>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
      />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
