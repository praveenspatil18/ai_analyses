import React, { useState } from 'react';
import {
  FileCheck2,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Building,
} from 'lucide-react';
import { aiApi } from '../../services/api';
import { ResumeJobMatchResult } from '../../types';
import { useApp } from '../../context/AppContext';

export const ResumeJobMatchPage: React.FC = () => {
  const { showToast } = useApp();
  const [jobTitle, setJobTitle] = useState('Frontend Software Engineer');
  const [company, setCompany] = useState('Stripe / Modern FinTech');
  const [jobDescription, setJobDescription] = useState(`About the Role:
We are looking for a Frontend Engineer to craft fluid, accessible payment interfaces.

Responsibilities:
- Build high-performance web applications using React, TypeScript, and modern CSS.
- Collaborate with product designers on component design systems and token architecture.
- Optimize client-side bundle sizes and Core Web Vitals performance.
- Write resilient unit and integration tests.

Requirements:
- Strong proficiency in JavaScript (ES6+), React hooks, and asynchronous programming.
- Experience with TypeScript, state orchestration, and REST API integration.
- Familiarity with Git version control, CI/CD pipelines, and web accessibility standards (WCAG).`);

  const [resumeText, setResumeText] = useState(`Praveen Patil - Frontend & Full Stack Developer
Skills: JavaScript (ES6+), React.js, HTML5, CSS3, Tailwind CSS, Git, GitHub, Node.js, Express, PostgreSQL basics.
Projects:
- E-Commerce Storefront: Built with React and Tailwind, featuring cart drawer, category filters, and form checkout.
- Kanban Board: Drag-and-drop task workflow engine with local storage state management.
Education: B.Tech Computer Science & Engineering, 2026.`);

  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<ResumeJobMatchResult | null>(null);

  const handleRunMatch = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      showToast('Please provide both resume text and job description.', 'error');
      return;
    }

    setIsMatching(true);
    try {
      const res = await aiApi.matchJob({
        resumeText,
        jobDescription,
        jobTitle,
        company,
      });
      setMatchResult(res.match);
      showToast('Job match calculation completed!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to match job description with Gemini AI', 'error');
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <FileCheck2 className="w-6 h-6 text-indigo-600" />
          <span>Resume vs Job Description Matcher</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Evaluate keyword alignment, verify ATS keyword coverage, and diagnose skill parity for any target posting.
        </p>
      </div>

      {/* Two Column Input Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Job Description Form */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Building className="w-4 h-4 text-slate-500" />
            <span>Target Job Posting</span>
          </h2>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Job Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Company</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              Job Description Content
            </label>
            <textarea
              rows={9}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-md font-mono resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Right: Candidate Resume */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-3">Your Resume Content</h2>
            <textarea
              rows={11}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste the resume you want to benchmark against this role..."
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-md font-mono resize-none leading-relaxed"
            />
          </div>

          <button
            onClick={handleRunMatch}
            disabled={isMatching}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            {isMatching ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Benchmarking Application Parity...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Calculate Application Match Score</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Match Result Display */}
      {matchResult && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-6 animate-in fade-in duration-200">
          {/* Header Result */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Target Evaluation
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {matchResult.jobTitle} @ {matchResult.company}
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mt-1">Application Match Score</h3>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-4xl font-extrabold text-indigo-600 font-mono tabular-nums">
                {matchResult.matchScore}%
              </span>
            </div>
          </div>

          {/* Mandatory Disclaimer */}
          <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="font-medium">{matchResult.disclaimer}</p>
          </div>

          {/* Alignment Evaluation Summary */}
          <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
            <strong className="text-slate-900 block mb-1">Experience Alignment:</strong>
            {matchResult.experienceAlignment}
          </div>

          {/* Matched vs Missing Skills Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Matched Skills */}
            <div className="p-4 rounded-lg bg-emerald-50/40 border border-emerald-200/80 space-y-2">
              <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Matched Role Skills & Keywords ({matchResult.matchedSkills.length})</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {matchResult.matchedSkills.map((sk, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-medium"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="p-4 rounded-lg bg-rose-50/40 border border-rose-200/80 space-y-2">
              <h4 className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Missing Requirements & Gaps ({matchResult.missingSkills.length})</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {matchResult.missingSkills.map((sk, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[11px] font-medium"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Tailored Improvements */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-slate-900">
              Targeted Enhancements for this Application
            </h4>
            <ul className="space-y-1.5">
              {matchResult.improvements.map((imp, idx) => (
                <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                  <span>{imp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
