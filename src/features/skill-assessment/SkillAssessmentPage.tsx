import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  Award,
  Clock,
  RotateCcw,
  Sparkles,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Briefcase,
  Layers,
  Code2,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { assessmentApi, roadmapApi } from '../../services/api';
import { AssessmentQuestion, RoleAssessmentResult } from '../../types';
import { useApp } from '../../context/AppContext';

// The 10 available roles with metadata and skill focus
const AVAILABLE_ROLES = [
  {
    id: 'role-frontend',
    title: 'Frontend Developer',
    category: 'Engineering',
    skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Git'],
    description: 'User interfaces, responsive layouts, web performance, and state management.',
  },
  {
    id: 'role-backend',
    title: 'Backend Developer',
    category: 'Engineering',
    skills: ['Programming', 'APIs', 'Databases', 'Authentication', 'Backend Frameworks', 'Git'],
    description: 'Server logic, REST/gRPC APIs, databases, authentication, and microservices.',
  },
  {
    id: 'role-fullstack',
    title: 'Full Stack Developer',
    category: 'Engineering',
    skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Backend', 'APIs', 'Databases', 'Git'],
    description: 'End-to-end web engineering from client-side UI to databases and server pipelines.',
  },
  {
    id: 'role-data-analyst',
    title: 'Data Analyst',
    category: 'Data & Analytics',
    skills: ['Excel', 'SQL', 'Python', 'Statistics', 'Data Cleaning', 'Data Visualization', 'Power BI/Tableau'],
    description: 'Mining business data, KPI dashboards, statistical reporting, and exploratory insights.',
  },
  {
    id: 'role-data-scientist',
    title: 'Data Scientist',
    category: 'AI & Data Science',
    skills: ['Python', 'SQL', 'Machine Learning', 'Statistics', 'Pandas', 'Data Visualization'],
    description: 'Predictive statistical models, machine learning algorithms, and hypothesis testing.',
  },
  {
    id: 'role-ml-engineer',
    title: 'Machine Learning Engineer',
    category: 'AI & Data Science',
    skills: ['Python', 'Machine Learning', 'Deep Learning', 'Model Evaluation', 'Data Preprocessing', 'Math'],
    description: 'Training neural networks, production model serving, evaluation, and MLOps.',
  },
  {
    id: 'role-cloud-engineer',
    title: 'Cloud Engineer',
    category: 'Infrastructure',
    skills: ['Cloud Concepts', 'AWS/Azure/GCP', 'Networking', 'Storage', 'Security', 'Docker'],
    description: 'Elastic cloud infrastructure, IAM security, VPC networks, and serverless hosting.',
  },
  {
    id: 'role-devops',
    title: 'DevOps Engineer',
    category: 'Infrastructure',
    skills: ['Linux', 'Git', 'CI/CD', 'Docker', 'Kubernetes', 'Monitoring'],
    description: 'Automated CI/CD release engineering, container orchestration, and monitoring.',
  },
  {
    id: 'role-security',
    title: 'Cybersecurity Analyst',
    category: 'Security',
    skills: ['Network Security', 'Threats & Attacks', 'Encryption', 'Security Tools', 'Compliance/Firewalls'],
    description: 'Defending systems against attacks, SIEM log monitoring, vulnerability defense, and PKI.',
  },
  {
    id: 'role-uiux',
    title: 'UI/UX Designer',
    category: 'Design & Product',
    skills: ['Wireframing', 'Prototyping', 'Figma', 'User Research', 'Color Theory', 'Typography'],
    description: 'User-centered product design, responsive wireframes, Figma systems, and usability research.',
  },
];

export const SkillAssessmentPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { targetRole, updateCareerGoal, refreshData, showToast } = useApp();

  // Role query param or default to active target role or first role
  const roleParam = searchParams.get('role');
  const initialRole =
    AVAILABLE_ROLES.find((r) => r.id === roleParam || r.title.toLowerCase() === roleParam?.toLowerCase()) ||
    (targetRole
      ? AVAILABLE_ROLES.find((r) => r.id === targetRole.id || r.title === targetRole.title)
      : null) ||
    AVAILABLE_ROLES[0];

  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<RoleAssessmentResult | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isCreatingRoadmap, setIsCreatingRoadmap] = useState(false);
  const [roadmapCreatedSuccess, setRoadmapCreatedSuccess] = useState(false);

  // Load questions whenever selected role changes
  useEffect(() => {
    loadRoleQuestions(selectedRole.id, selectedRole.title);
  }, [selectedRole.id]);

  const loadRoleQuestions = async (roleId: string, roleTitle: string) => {
    setIsLoadingQuestions(true);
    setAssessmentResult(null);
    setUserAnswers({});
    setCurrentIndex(0);
    setRoadmapCreatedSuccess(false);

    try {
      const res = await assessmentApi.getRoleQuestions(roleId, roleTitle);
      setQuestions(res.questions);
      setStartTime(Date.now());
    } catch (err: any) {
      showToast(err.message || 'Failed to load assessment questions', 'error');
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleSelectRole = (role: typeof AVAILABLE_ROLES[0]) => {
    setSelectedRole(role);
    setSearchParams({ role: role.id });
    // Also synchronize target career goal in background
    updateCareerGoal({
      targetRoleId: role.id,
      targetRoleTitle: role.title,
    });
  };

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmitAllAnswers = async () => {
    if (questions.length === 0) return;

    // Check how many questions answered
    const answeredCount = Object.keys(userAnswers).length;
    if (answeredCount < questions.length) {
      const unanswered = questions.length - answeredCount;
      const confirmSubmit = window.confirm(
        `You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Unanswered questions will be marked as incorrect. Submit anyway?`
      );
      if (!confirmSubmit) return;
    }

    setIsSubmitting(true);
    const durationSeconds = Math.round((Date.now() - startTime) / 1000);

    const formattedAnswers = questions.map((q, idx) => {
      const selectedOption = userAnswers[idx] !== undefined ? userAnswers[idx] : -1;
      const isCorrect = selectedOption === q.correctAnswer;
      return {
        questionId: q.id,
        skill: q.skill,
        selectedOption,
        isCorrect,
      };
    });

    try {
      const res = await assessmentApi.submitRoleAssessment({
        roleId: selectedRole.id,
        roleTitle: selectedRole.title,
        answers: formattedAnswers,
        durationSeconds,
      });

      setAssessmentResult(res);
      await refreshData();

      if (res.overallScore >= 70) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      showToast(`Assessment submitted! Score: ${res.overallScore}% (${res.correctCount}/10)`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit assessment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    if (!assessmentResult) return;

    setIsCreatingRoadmap(true);
    try {
      const res = await roadmapApi.generateFromAssessment({
        roleId: assessmentResult.roleId,
        roleTitle: assessmentResult.roleTitle,
        weakSkills: assessmentResult.weakSkills,
        overallScore: assessmentResult.overallScore,
      });

      setRoadmapCreatedSuccess(true);
      await refreshData();
      showToast(res.message || 'Personalized roadmap created successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to generate roadmap', 'error');
    } finally {
      setIsCreatingRoadmap(false);
    }
  };

  const handleRetake = () => {
    setUserAnswers({});
    setCurrentIndex(0);
    setAssessmentResult(null);
    setRoadmapCreatedSuccess(false);
    setStartTime(Date.now());
  };

  const currentQ = questions[currentIndex];
  const answeredTotal = Object.keys(userAnswers).length;
  const progressPercent = questions.length > 0 ? Math.round((answeredTotal / questions.length) * 100) : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md">
              Career Readiness Engine
            </span>
            <span className="text-xs text-slate-400 font-semibold">• 10 Fundamental Questions</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-600" />
            <span>Role Skill Assessment & Study Roadmap</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Choose your target career role, test fundamental knowledge across role skills, diagnose weak skills, and generate a customized study roadmap.
          </p>
        </div>

        {/* Selected Role Badge */}
        <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Active Assessment Role
            </span>
            <span className="text-sm font-bold text-slate-800">{selectedRole.title}</span>
          </div>
        </div>
      </div>

      {/* STEP 1: SELECT CAREER ROLE CAROUSEL / TABS */}
      {!assessmentResult && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold font-mono">
                1
              </span>
              <h2 className="text-sm font-bold text-slate-900">Select Target Career Role</h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              10 specialized question banks tailored per role
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {AVAILABLE_ROLES.map((role) => {
              const isSelected = selectedRole.id === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => handleSelectRole(role)}
                  className={`p-3 rounded-lg text-left transition-all border flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs ring-2 ring-indigo-500/20'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="text-xs font-bold leading-tight">{role.title}</span>
                    {isSelected && <Check className="w-4 h-4 text-white shrink-0 stroke-[3]" />}
                  </div>
                  <span
                    className={`text-[10px] truncate block ${
                      isSelected ? 'text-indigo-100' : 'text-slate-400'
                    }`}
                  >
                    {role.skills.slice(0, 3).join(', ')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* LOADING STATE */}
      {isLoadingQuestions && (
        <div className="bg-white rounded-xl p-12 border border-slate-200 text-center shadow-xs">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">
            Loading 10 fundamental questions for {selectedRole.title}...
          </p>
        </div>
      )}

      {/* STEP 2: 10 MULTIPLE CHOICE QUESTIONS FLOW */}
      {!isLoadingQuestions && !assessmentResult && currentQ && (
        <div className="space-y-4">
          {/* Progress Header & Question Navigator */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold font-mono">
                  2
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Question {currentIndex + 1} of {questions.length}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      Skill: {currentQ.skill}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Fundamental / Easy
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Stat */}
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-500">
                  {answeredTotal} of {questions.length} answered ({progressPercent}%)
                </span>
                <div className="w-full sm:w-48 bg-slate-100 h-2 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-indigo-600 h-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Jump Question Pill Grid */}
            <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 overflow-x-auto pb-1">
              {questions.map((q, idx) => {
                const isAnswered = userAnswers[idx] !== undefined;
                const isCurrent = currentIndex === idx;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center border ${
                      isCurrent
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs ring-2 ring-indigo-500/30'
                        : isAnswered
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                    title={`Question ${idx + 1}: ${q.skill} (${isAnswered ? 'Answered' : 'Unanswered'})`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Question Card */}
          <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Question {currentIndex + 1}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                {currentQ.question}
              </h2>
            </div>

            {/* 4 Multiple Choice Options (A, B, C, D) */}
            <div className="space-y-3">
              {currentQ.options.map((option, optIdx) => {
                const isSelected = userAnswers[currentIndex] === optIdx;
                const letter = String.fromCharCode(65 + optIdx); // A, B, C, D

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(currentIndex, optIdx)}
                    className={`w-full p-4 rounded-xl text-left transition-all border flex items-center gap-4 ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-500 text-indigo-950 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'bg-white hover:bg-slate-50/80 text-slate-800 border-slate-200'
                    }`}
                  >
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold font-mono text-sm shrink-0 border ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-700'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="text-sm font-medium leading-relaxed flex-1">{option}</span>
                    {isSelected && <Check className="w-5 h-5 text-indigo-600 shrink-0 stroke-[2.5]" />}
                  </button>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-100">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Question</span>
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={handleNext}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 flex items-center justify-center gap-2"
                  >
                    <span>Next Question</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : null}

                <button
                  onClick={handleSubmitAllAnswers}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Evaluating Results...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Submit 10 Answers</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3, 4, 5, 6, 7: ASSESSMENT RESULTS DASHBOARD */}
      {assessmentResult && (
        <div className="space-y-6">
          {/* Top Score Banner */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white border border-indigo-900/50 shadow-md">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Assessment Evaluation Complete</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {selectedRole.title} Assessment Score
                </h2>
                <p className="text-sm text-slate-300 max-w-xl">
                  {assessmentResult.readinessStatus}. We analyzed your answers across all required skills to identify strengths, pinpoint knowledge gaps, and construct your study plan.
                </p>
              </div>

              {/* Big Score Dial */}
              <div className="flex items-center gap-6 bg-white/10 backdrop-blur-md px-6 py-4 rounded-xl border border-white/10">
                <div className="text-center">
                  <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white block">
                    {assessmentResult.overallScore}%
                  </span>
                  <span className="text-xs text-indigo-200 font-medium">
                    {assessmentResult.correctCount} / {assessmentResult.totalQuestions} Correct
                  </span>
                </div>

                <div className="h-12 w-px bg-white/20" />

                <div className="text-left">
                  <span className="text-[10px] text-indigo-300 uppercase tracking-wider font-bold block">
                    Readiness Tier
                  </span>
                  <span className="text-sm font-bold text-white block">
                    {assessmentResult.readinessStatus}
                  </span>
                  <button
                    onClick={handleRetake}
                    className="mt-1 text-xs text-indigo-300 hover:text-white underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Retake Quiz</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 4: CALCULATE SKILL SCORES BREAKDOWN */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold font-mono">
                  3
                </span>
                <h3 className="text-base font-bold text-slate-900">Skill-by-Skill Score Breakdown</h3>
              </div>
              <span className="text-xs text-slate-500">
                Evaluated against {selectedRole.title} core competencies
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {assessmentResult.skillScores.map((s) => (
                <div
                  key={s.skill}
                  className={`p-4 rounded-xl border transition-all ${
                    s.status === 'Strong'
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : s.status === 'Needs Attention'
                      ? 'bg-amber-50/50 border-amber-200'
                      : 'bg-rose-50/50 border-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-slate-900">{s.skill}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        s.status === 'Strong'
                          ? 'bg-emerald-100 text-emerald-800'
                          : s.status === 'Needs Attention'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between text-xs mb-1">
                    <span className="font-mono font-bold text-slate-700">{s.percentage}%</span>
                    <span className="text-slate-500 text-[11px]">
                      {s.correct} / {s.total} correct
                    </span>
                  </div>

                  <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        s.status === 'Strong'
                          ? 'bg-emerald-500'
                          : s.status === 'Needs Attention'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${s.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STEP 5: IDENTIFY WEAK SKILLS ALERT */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-5 flex items-start gap-4 shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-950">
                Identified Weak Skills / Focus Areas ({assessmentResult.weakSkills.length})
              </h4>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                Based on missed questions, the following skills require targeted study to meet {selectedRole.title} standards:{' '}
                <strong className="font-semibold underline">
                  {assessmentResult.weakSkills.join(', ')}
                </strong>
                .
              </p>
            </div>
          </div>

          {/* STEP 6: SHOW WHAT TO STUDY */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold font-mono">
                  4
                </span>
                <h3 className="text-base font-bold text-slate-900">What to Study (Targeted Curriculum)</h3>
              </div>
              <span className="text-xs text-slate-500">
                Actionable concepts & curated learning links
              </span>
            </div>

            <div className="space-y-4">
              {assessmentResult.whatToStudy.map((guide) => (
                <div
                  key={guide.skill}
                  className="p-5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-600" />
                      <span>{guide.skill} Study Guide</span>
                    </h4>
                    <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      Priority Focus
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{guide.description}</p>

                  {/* Key Topics List */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Core Concepts to Master:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {guide.topics.map((t, tidx) => (
                        <div
                          key={tidx}
                          className="flex items-start gap-2 text-xs text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200/80"
                        >
                          <ChevronRight className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                          <span>{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Action / Hands-on practice */}
                  <div className="bg-indigo-50/80 border border-indigo-200 rounded-lg p-3 text-xs text-indigo-950 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">Recommended Practice Project: </strong>
                      <span>{guide.recommendedAction}</span>
                    </div>
                  </div>

                  {/* Curated Resources */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-xs text-slate-400 font-semibold mr-1">Study Links:</span>
                    {guide.resources.map((res, ridx) => (
                      <a
                        key={ridx}
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:border-indigo-300 transition-colors shadow-2xs"
                      >
                        <span>{res.title}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STEP 7: CREATE LEARNING ROADMAP CTA */}
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-xs text-indigo-200 font-bold uppercase tracking-wider block">
                Step 5 • Intelligence Loop
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Generate Your Personalized Learning Roadmap
              </h3>
              <p className="text-xs text-indigo-100 max-w-lg leading-relaxed">
                Automatically generate a sequenced, milestone-driven roadmap targeting your exact weak skills ({assessmentResult.weakSkills.join(', ')}), followed by capstone projects and interview prep.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              {!roadmapCreatedSuccess ? (
                <button
                  onClick={handleGenerateRoadmap}
                  disabled={isCreatingRoadmap}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-bold bg-white text-indigo-900 hover:bg-indigo-50 shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isCreatingRoadmap ? (
                    <>
                      <div className="w-4 h-4 border-2 border-indigo-900 border-t-transparent rounded-full animate-spin" />
                      <span>Creating Roadmap...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span>Create Learning Roadmap</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <span className="text-xs font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-400/40 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Roadmap Created!</span>
                  </span>
                  <button
                    onClick={() => navigate('/roadmap')}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white text-indigo-900 hover:bg-indigo-50 shadow-md flex items-center gap-2"
                  >
                    <span>View Roadmap</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
