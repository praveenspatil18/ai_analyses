import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Award,
  BookOpen,
  CheckCircle2,
  FolderGit2,
  Mic,
  FileText,
  Target,
  Clock,
  Play,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DashboardPage: React.FC = () => {
  const { user, roleFit, targetRole, roadmap } = useApp();
  const navigate = useNavigate();

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name ? user.name.split(' ')[0] : 'Engineer';

  const activeRoadmapItem = roadmap?.items?.find((i) => i.status === 'in_progress') || roadmap?.items?.[0];
  const topCriticalGaps = roleFit?.topGaps.slice(0, 3) || [];

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-xl bg-slate-900 border border-slate-800 p-6 md:p-8 text-white shadow-sm">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Career Intelligence Active</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-2">
            {greeting}, {firstName}!
          </h1>
          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            Your intelligence loop is synchronized for{' '}
            <span className="text-indigo-400 font-semibold">{targetRole?.title || 'Frontend Developer'}</span>.
            {roleFit && roleFit.fitScore >= 70
              ? ' You are in the Career Ready zone with strong foundational competence.'
              : ' Closing your high-priority skill gaps will dramatically raise your role readiness score.'}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/assessments')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow transition-colors"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Take 10-Question Test</span>
            </button>
            <button
              onClick={() => navigate('/roadmap')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Learning Roadmap</span>
            </button>
            <button
              onClick={() => navigate('/ai-coach')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Consult AI Coach</span>
            </button>
          </div>
        </div>

        {/* Luminous Background Accent */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-600/15 via-purple-600/10 to-transparent pointer-events-none hidden md:block" />
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: CareerAI Role Fit Score */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-medium">CareerAI Role Fit</span>
              <Award className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                {roleFit ? `${roleFit.fitScore}%` : '52%'}
              </span>
              <span className="text-xs font-medium text-emerald-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" />
                +12% this month
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Readiness:</span>
            <span className="font-semibold text-slate-900">{roleFit?.readinessLevel || 'Developing'}</span>
          </div>
        </div>

        {/* Metric 2: Target Career */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-medium">Target Career Goal</span>
              <Target className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-lg font-bold text-slate-900 mt-2 truncate">
              {targetRole?.title || 'Frontend Developer'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{targetRole?.category || 'Software Engineering'}</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={() => navigate('/career')}
              className="text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-1"
            >
              <span>Explore Role Specs</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Metric 3: Roadmap Progress */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-medium">Learning Roadmap</span>
              <BookOpen className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                {roadmap ? `${roadmap.overallProgress}%` : '32%'}
              </span>
              <span className="text-xs text-slate-500">completed</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full"
                style={{ width: `${roadmap?.overallProgress || 32}%` }}
              />
            </div>
          </div>
        </div>

        {/* Metric 4: Skill Gaps Tracked */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-medium">Priority Skill Gaps</span>
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                {roleFit?.topGaps.length || 0}
              </span>
              <span className="text-xs text-slate-500">skills need focus</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Primary:</span>
            <span className="font-semibold text-rose-600 truncate max-w-[120px]">
              {roleFit?.topGaps[0]?.skill || 'None'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Workflow Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Active Learning Step + Priority Skill Gaps */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Learning Module Card */}
          <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                  Current Milestone
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-0.5">Today's Focus Learning</h2>
              </div>
              <button
                onClick={() => navigate('/roadmap')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>Full Timeline</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {activeRoadmapItem ? (
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-indigo-100 text-indigo-800">
                      {activeRoadmapItem.skill}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {activeRoadmapItem.estimatedHours}h estimated
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{activeRoadmapItem.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 max-w-xl">
                    {activeRoadmapItem.description}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/roadmap')}
                  className="shrink-0 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold rounded-md shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <span>Continue</span>
                  <Play className="w-3 h-3 fill-current" />
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-500">No active roadmap steps. Click generate in Roadmap.</p>
            )}

            {/* Weekly Progress Bar */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                <span>Weekly Study Goal (12h)</span>
                <span className="font-mono tabular-nums font-semibold text-slate-900">7.5 / 12 Hours (62%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: '62%' }} />
              </div>
            </div>
          </div>

          {/* Top Priority Skill Gaps Breakdown */}
          <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Highest-Impact Skill Gaps</h2>
                <p className="text-xs text-slate-500">
                  Targeted by CareerAI role importance weights and current vector scores
                </p>
              </div>
              <button
                onClick={() => navigate('/career')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                View Full Vector
              </button>
            </div>

            <div className="space-y-3">
              {topCriticalGaps.map((gap) => (
                <div
                  key={gap.skill}
                  className="p-3.5 rounded-lg border border-slate-200/80 hover:border-slate-300 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{gap.skill}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          gap.category === 'Critical'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : gap.category === 'High'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {gap.category} Gap
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-3">
                      <span>Your Level: <strong className="font-mono text-slate-800">{gap.yourLevel}%</strong></span>
                      <span>Required: <strong className="font-mono text-slate-800">{gap.requiredLevel}%</strong></span>
                      <span>Weight: <strong className="font-mono text-slate-800">{gap.weight}%</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => navigate(`/assessments?skill=${encodeURIComponent(gap.skill)}`)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded transition-colors"
                    >
                      Test Skill
                    </button>
                    <button
                      onClick={() => navigate('/roadmap')}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded transition-colors"
                    >
                      Learn
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Quick Action Hub & AI Assist */}
        <div className="space-y-6">
          {/* Quick Actions Hub */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-3">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => navigate('/roadmap')}
                className="w-full p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-3 text-left"
              >
                <div className="w-8 h-8 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Continue Learning</p>
                  <p className="text-[11px] text-slate-500">Pick up current roadmap item</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/assessments')}
                className="w-full p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-3 text-left"
              >
                <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Take Adaptive Assessment</p>
                  <p className="text-[11px] text-slate-500">Calibrate skill vector levels</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/resume')}
                className="w-full p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-3 text-left"
              >
                <div className="w-8 h-8 rounded bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Analyze Resume</p>
                  <p className="text-[11px] text-slate-500">Extract skills & role fit</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/interview')}
                className="w-full p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-3 text-left"
              >
                <div className="w-8 h-8 rounded bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Practice Mock Interview</p>
                  <p className="text-[11px] text-slate-500">AI audio/text question simulation</p>
                </div>
              </button>
            </div>
          </div>

          {/* AI Mentor Prompt Box */}
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 rounded-xl p-5 border border-indigo-900/60 text-white shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                AI Career Coach
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              "Need immediate guidance on whether to master TypeScript or React Query first for entry-level roles?"
            </p>
            <button
              onClick={() => navigate('/ai-coach')}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors text-center"
            >
              Ask AI Coach Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
