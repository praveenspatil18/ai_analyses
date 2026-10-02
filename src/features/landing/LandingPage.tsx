import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Award,
  BookOpen,
  FolderGit2,
  Mic,
  FileText,
  Target,
  Layers,
  ChevronRight,
  BarChart3,
  Bot,
  Compass,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useApp();
  const [selectedDemoRole, setSelectedDemoRole] = useState('Frontend Developer');

  const demoRoles = [
    { title: 'Frontend Developer', fit: 68, topSkill: 'JavaScript', gap: 'React Hooks' },
    { title: 'Backend Developer', fit: 55, topSkill: 'Node.js', gap: 'Database Indexing' },
    { title: 'Data Scientist', fit: 48, topSkill: 'Python', gap: 'Machine Learning' },
    { title: 'DevOps Engineer', fit: 40, topSkill: 'Linux', gap: 'Kubernetes' },
  ];

  const currentRole = demoRoles.find((r) => r.title === selectedDemoRole) || demoRoles[0];

  const handleLaunchDemo = async () => {
    try {
      await login('demo@careerai.dev', 'demo1234');
      navigate('/dashboard');
    } catch {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navigation */}
      <header className="h-16 px-6 md:px-12 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-sm font-bold text-sm tracking-tight">
            CA
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white block leading-none">
              CareerAI
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Intelligence Platform</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-400">
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#role-fit" className="hover:text-white transition-colors">Role Fit Engine</a>
          <a href="#features" className="hover:text-white transition-colors">Platform Modules</a>
          <a href="#ai-coach" className="hover:text-white transition-colors">AI Mentor</a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={handleLaunchDemo}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
          >
            <span>Explore App</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 md:px-12 max-w-7xl mx-auto overflow-hidden">
        {/* Glow Background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="text-center max-w-3xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Career Intelligence & Personalized Learning</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Stop guessing your career readiness. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-200">
              Measure your exact Role Fit.
            </span>
          </h1>

          <p className="text-sm md:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            CareerAI correlates your verified skills against industry role benchmarks, detects critical capability gaps, generates dynamic roadmaps, and conducts real-time AI mock interviews.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleLaunchDemo}
              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs md:text-sm font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group"
            >
              <span>Launch CareerAI Platform</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs md:text-sm font-semibold rounded-xl border border-slate-800 transition-colors"
            >
              Create Student Account
            </button>
          </div>
        </div>

        {/* Interactive Role Fit Simulator Card */}
        <div id="role-fit" className="mt-14 max-w-4xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl relative">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-slate-800/80 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                CareerAI Role Fit Simulator
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">
                Real-Time Benchmark Alignment
              </h3>
            </div>

            <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
              {demoRoles.map((role) => (
                <button
                  key={role.title}
                  onClick={() => setSelectedDemoRole(role.title)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
                    selectedDemoRole === role.title
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {role.title}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col justify-between">
              <span className="text-xs text-slate-400">CareerAI Role Fit</span>
              <div className="my-2">
                <span className="text-4xl font-extrabold text-white font-mono tabular-nums">
                  {currentRole.fit}%
                </span>
                <p className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Calculated via skill weights</span>
                </p>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${currentRole.fit}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col justify-between">
              <span className="text-xs text-slate-400">Strong Competency</span>
              <div className="my-2">
                <span className="text-xl font-bold text-slate-200">
                  {currentRole.topSkill}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">Exceeds industry required threshold</p>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                Status: Strong
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col justify-between">
              <span className="text-xs text-slate-400">Primary Skill Gap</span>
              <div className="my-2">
                <span className="text-xl font-bold text-rose-400">
                  {currentRole.gap}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">Directly targeted by roadmap</p>
              </div>
              <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">
                Priority: Critical
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Intelligence Loop Architecture Section */}
      <section id="how-it-works" className="py-20 border-t border-slate-900 bg-slate-950 px-6 md:px-12">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              The Intelligence Loop
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">
              From Baseline Assessment to Career Readiness
            </h2>
            <p className="text-xs md:text-sm text-slate-400">
              A continuous, mathematically-grounded cycle that personalizes every step of your learning.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                01
              </div>
              <h3 className="text-sm font-bold text-white">Vector Calibration</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Parse your resume or take adaptive skill assessments to calculate a normalized skill vector ($0.0 \rightarrow 1.0$) with confidence scores.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                02
              </div>
              <h3 className="text-sm font-bold text-white">Role Fit Scoring</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Benchmark your skills against real role requirement profiles and importance weights to calculate your exact Role Fit Score.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                03
              </div>
              <h3 className="text-sm font-bold text-white">Dynamic Roadmapping</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generate an individualized learning path sequenced by prerequisites and prioritized by the skills contributing most to your gap.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                04
              </div>
              <h3 className="text-sm font-bold text-white">Continuous Reassessment</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Complete roadmap steps and projects to automatically recalibrate your skill levels, boost your Role Fit score, and advance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modules Showcase Grid */}
      <section id="features" className="py-20 border-t border-slate-900 bg-slate-900/40 px-6 md:px-12">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Core Platform Capabilities
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">
              Everything You Need to Land Your Target Role
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <Compass className="w-6 h-6 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Target Career & Role Spec</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Explore comprehensive skill blueprints for 10 top engineering roles with exact requirement thresholds and importance weights.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Adaptive Skill Testing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Questions automatically adjust in difficulty based on correctness, ensuring high diagnostic accuracy and objective competency scoring.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <FileText className="w-6 h-6 text-purple-400" />
              <h3 className="text-sm font-bold text-white">Resume AI Intelligence</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Upload your resume for structured skill extraction, gap diagnostics, and side-by-side job description match scoring.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <BookOpen className="w-6 h-6 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Sequenced Learning Path</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Prerequisite-aware progression with curated documentation, practice problems, and step-by-step progress tracking.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <FolderGit2 className="w-6 h-6 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Portfolio Projects</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Build industry-grade projects with interactive milestone checklists calibrated to prove your skills in interview loops.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <Mic className="w-6 h-6 text-rose-400" />
              <h3 className="text-sm font-bold text-white">AI Mock Interview Simulator</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Simulate technical, behavioral, and architectural interviews with real-time scoring, senior sample answers, and diagnostic reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="py-16 border-t border-slate-900 bg-slate-950 px-6 md:px-12 text-center space-y-6">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          Ready to discover your CareerAI Role Fit?
        </h2>
        <p className="text-xs md:text-sm text-slate-400 max-w-md mx-auto">
          Sign up with your student email or jump straight into the full demo environment.
        </p>
        <button
          onClick={handleLaunchDemo}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs md:text-sm font-bold rounded-xl shadow-lg transition-all inline-flex items-center gap-2"
        >
          <span>Get Started Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        <div className="pt-8 text-xs text-slate-600">
          CareerAI · AI Career Intelligence & Personalized Learning Platform
        </div>
      </footer>
    </div>
  );
};
