import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Award,
  ArrowRight,
  TrendingUp,
  FileCheck,
  RefreshCw,
} from 'lucide-react';
import { aiApi } from '../../services/api';
import { ResumeAnalysis } from '../../types';
import { useApp } from '../../context/AppContext';

export const ResumeAnalyzerPage: React.FC = () => {
  const navigate = useNavigate();
  const { targetRole, refreshData, showToast } = useApp();
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);

  // Sample prefill resume for quick one-click testing
  const handleLoadSampleResume = () => {
    setFileName('Praveen_Patil_Resume.pdf');
    setResumeText(`Praveen Patil
Email: praveen@careerai.dev | Phone: +91 98765 43210 | Bengaluru, India
GitHub: github.com/praveen-dev | Portfolio: praveenpatil.dev

EDUCATION
Bachelor of Technology in Computer Science & Engineering
National Institute of Technology (NIT) | Expected Graduation: 2026 | GPA: 8.7/10

TECHNICAL SKILLS
Languages: JavaScript (ES6+), HTML5, CSS3/Tailwind, TypeScript basics, Python fundamentals
Frameworks & Libraries: React.js, Express.js, Node.js, Redux Toolkit
Tools & Databases: Git, GitHub, PostgreSQL, VS Code, Figma basics

PROJECTS
E-Commerce Frontend Showcase (React, Tailwind CSS, LocalStorage)
- Built responsive online shop with category filters, dynamic shopping cart drawer, and client checkout.
- Optimized rendering performance with memoization and lazy-loaded image assets.

Kanban Task Management Application (JavaScript, HTML, CSS)
- Implemented accessible drag-and-drop task column ordering with local persistence.
- Built custom modal dialogs and tag filters for priority classifications.

WORK / CAMPUS EXPERIENCE
Web Development Lead - Open Source Student Club (2024 - Present)
- Conducted hands-on technical workshops introducing 120+ first-year students to Git version control and modern CSS layouts.`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    // Read text from file
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setResumeText(content);
    };
    reader.readAsText(file);
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim() || resumeText.length < 50) {
      showToast('Please upload or paste your resume content (at least 50 characters).', 'error');
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await aiApi.analyzeResume(resumeText, fileName || 'Pasted_Resume.txt');
      setAnalysis(res.analysis);
      await refreshData();
      showToast('Resume analyzed! Extracted skills added to your vector.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to analyze resume with Gemini AI', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-600" />
            <span>AI Resume Intelligence Analyzer</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Gemini parses your resume structure, identifies matched & missing competencies for{' '}
            <strong className="text-slate-800">{targetRole?.title || 'Frontend Developer'}</strong>, and updates your skill vector.
          </p>
        </div>

        <button
          onClick={handleLoadSampleResume}
          className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold rounded-md border border-purple-200 transition-colors self-start sm:self-auto shrink-0"
        >
          Load Sample Resume
        </button>
      </div>

      {/* Input / Upload Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Card */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Upload className="w-4 h-4 text-slate-500" />
              <span>Resume Input (PDF, DOCX, or Text)</span>
            </h2>
            {fileName && (
              <span className="text-xs font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 truncate max-w-[200px]">
                {fileName}
              </span>
            )}
          </div>

          {/* File Drag and Drop Target */}
          <label className="border-2 border-dashed border-slate-200 hover:border-purple-400 bg-slate-50/60 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors group">
            <input
              type="file"
              accept=".txt,.pdf,.docx,.doc"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-800">
              Click to upload or drag resume file
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Supports .pdf, .docx, and plain text
            </p>
          </label>

          {/* Resume Raw Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Or Paste Resume Content</label>
            <textarea
              rows={8}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste raw text or Markdown representation of your resume here..."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none leading-relaxed"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !resumeText.trim()}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Gemini Parsing & Evaluating Resume...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze with Gemini AI</span>
              </>
            )}
          </button>
        </div>

        {/* Live Analysis Output Card */}
        <div className="space-y-6">
          {analysis ? (
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Analysis Summary</h3>
                  <p className="text-xs text-slate-500">Target Role: {targetRole?.title}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    Estimated Match
                  </span>
                  <span className="text-xl font-extrabold text-purple-700 font-mono tabular-nums">
                    {analysis.estimatedRoleScore || 68}%
                  </span>
                </div>
              </div>

              {/* Summary Paragraph */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                {analysis.roleFitSummary}
              </div>

              {/* Extracted Skills Badges */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-2">
                  Extracted Skills ({analysis.extracted.skills?.length || 0})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.extracted.skills?.map((sk, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-medium border border-slate-200"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Strengths & Weaknesses Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-200/80 space-y-1.5">
                  <h5 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Candidate Strengths</span>
                  </h5>
                  <ul className="space-y-1">
                    {analysis.strengths.slice(0, 3).map((st, i) => (
                      <li key={i} className="text-[11px] text-emerald-800 leading-snug">
                        • {st}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-lg bg-rose-50/50 border border-rose-200/80 space-y-1.5">
                  <h5 className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Missing Role Skills</span>
                  </h5>
                  <ul className="space-y-1">
                    {analysis.missingSkills.slice(0, 3).map((ms, i) => (
                      <li key={i} className="text-[11px] text-rose-800 leading-snug">
                        • {ms}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Tailored Resume Improvements */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <h4 className="text-xs font-bold text-slate-800">
                  Recommended Resume Enhancements
                </h4>
                <ul className="space-y-1.5">
                  {analysis.improvements.map((imp, idx) => (
                    <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 shrink-0" />
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[300px] bg-slate-50/80 rounded-xl border border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-center">
              <FileCheck className="w-10 h-10 text-slate-300 mb-3" />
              <h3 className="text-sm font-bold text-slate-700">No Resume Analyzed Yet</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Upload your resume or click "Load Sample Resume" to generate structured AI analysis and skill extractions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
