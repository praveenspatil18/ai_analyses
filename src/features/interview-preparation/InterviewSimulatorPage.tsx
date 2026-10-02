import React, { useState } from 'react';
import {
  Mic,
  Award,
  Sparkles,
  ChevronRight,
  RefreshCw,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { aiApi } from '../../services/api';
import { InterviewReport } from '../../types';
import { useApp } from '../../context/AppContext';

export const InterviewSimulatorPage: React.FC = () => {
  const { targetRole, showToast } = useApp();
  const [roleTitle, setRoleTitle] = useState(targetRole?.title || 'Frontend Developer');
  const [interviewType, setInterviewType] = useState<'Technical' | 'Behavioral' | 'Project' | 'HR' | 'Mixed'>('Technical');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const [sessionActive, setSessionActive] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [questionCategory, setQuestionCategory] = useState<string>('Technical');
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<any>(null);
  const [qaPairs, setQaPairs] = useState<Array<{
    question: string;
    category: string;
    userAnswer: string;
    evaluation: any;
  }>>([]);
  const [finalReport, setFinalReport] = useState<InterviewReport | null>(null);
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);

  const startInterview = async () => {
    setSessionActive(true);
    setQaPairs([]);
    setQuestionIndex(0);
    setFinalReport(null);
    setCurrentEvaluation(null);
    setUserAnswer('');
    await fetchNextQuestion(0, []);
  };

  const fetchNextQuestion = async (index: number, existingQa: any[]) => {
    setIsGeneratingQuestion(true);
    try {
      const res = await aiApi.getInterviewQuestion({
        roleTitle,
        difficulty,
        interviewType,
        questionIndex: index,
        previousAnswers: existingQa,
      });
      setCurrentQuestion(res.question);
      setQuestionCategory(res.category || interviewType);
      setUserAnswer('');
      setCurrentEvaluation(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to generate interview question', 'error');
    } finally {
      setIsGeneratingQuestion(false);
    }
  };

  const handleEvaluateAnswer = async () => {
    if (!userAnswer.trim() || userAnswer.length < 5) {
      showToast('Please type your interview answer.', 'error');
      return;
    }

    setIsEvaluating(true);
    try {
      const res = await aiApi.evaluateInterviewAnswer({
        roleTitle,
        question: currentQuestion,
        userAnswer,
        category: questionCategory,
      });

      setCurrentEvaluation(res.evaluation);
    } catch (err: any) {
      showToast(err.message || 'Evaluation failed', 'error');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextOrFinish = async () => {
    const updatedPairs = [
      ...qaPairs,
      {
        question: currentQuestion,
        category: questionCategory,
        userAnswer,
        evaluation: currentEvaluation,
      },
    ];
    setQaPairs(updatedPairs);

    // If 3 questions completed, generate final report!
    if (updatedPairs.length >= 3) {
      setIsEvaluating(true);
      try {
        const reportRes = await aiApi.generateFinalInterviewReport({
          roleTitle,
          interviewType,
          qaPairs: updatedPairs,
        });
        setFinalReport(reportRes.report);
        setSessionActive(false);

        if (reportRes.report.overallScore >= 70) {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
          });
        }
      } catch (err: any) {
        showToast(err.message || 'Failed to compile final report', 'error');
      } finally {
        setIsEvaluating(false);
      }
    } else {
      const nextIdx = questionIndex + 1;
      setQuestionIndex(nextIdx);
      await fetchNextQuestion(nextIdx, updatedPairs);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Mic className="w-6 h-6 text-amber-600" />
          <span>AI Mock Interview Simulator</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Interactive domain-authentic technical and behavioral simulation with real-time scoring and diagnostic debriefing.
        </p>
      </div>

      {/* Setup Screen (Before Starting) */}
      {!sessionActive && !finalReport && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-900">Configure Interview Parameters</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Target Role</label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Interview Type</label>
              <select
                value={interviewType}
                onChange={(e) => setInterviewType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md"
              >
                <option value="Technical">Technical Competency</option>
                <option value="Behavioral">Behavioral / Leadership</option>
                <option value="Project">Project Architecture Deep Dive</option>
                <option value="HR">HR & Cultural Alignment</option>
                <option value="Mixed">Mixed Industry Simulation</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Difficulty Level</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md"
              >
                <option value="easy">Entry-Level / Intern</option>
                <option value="medium">Associate / Mid-Level</option>
                <option value="hard">Senior / Staff Engineer</option>
              </select>
            </div>
          </div>

          <button
            onClick={startInterview}
            className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <Mic className="w-4 h-4" />
            <span>Launch Mock Interview Session</span>
          </button>
        </div>
      )}

      {/* Active Session Question & Answer Arena */}
      {sessionActive && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-6 p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
            <span className="font-bold text-slate-900">
              Question {questionIndex + 1} of 3
            </span>
            <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
              {questionCategory}
            </span>
          </div>

          {isGeneratingQuestion ? (
            <div className="py-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Interviewer formulating question for {roleTitle}...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-base md:text-lg font-bold text-slate-900 leading-snug">
                "{currentQuestion}"
              </h2>

              {/* Answer Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Your Verbal / Text Response:</label>
                <textarea
                  rows={6}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Provide your structured response. Reference concrete technical trade-offs, architecture decisions, or STAR method outcomes..."
                  disabled={Boolean(currentEvaluation)}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 leading-relaxed resize-none font-sans"
                />
              </div>

              {/* Evaluate Button */}
              {!currentEvaluation ? (
                <button
                  onClick={handleEvaluateAnswer}
                  disabled={isEvaluating || !userAnswer.trim()}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2"
                >
                  {isEvaluating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Evaluating response against senior rubrics...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Submit Answer for AI Evaluation</span>
                    </>
                  )}
                </button>
              ) : (
                /* Instant AI Evaluation Feedback */
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                    <div className="p-2.5 rounded bg-slate-50 border text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Accuracy</span>
                      <span className="text-lg font-bold font-mono text-slate-900">{currentEvaluation.accuracyScore}%</span>
                    </div>
                    <div className="p-2.5 rounded bg-slate-50 border text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Clarity</span>
                      <span className="text-lg font-bold font-mono text-slate-900">{currentEvaluation.clarityScore}%</span>
                    </div>
                    <div className="p-2.5 rounded bg-slate-50 border text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Completeness</span>
                      <span className="text-lg font-bold font-mono text-slate-900">{currentEvaluation.completenessScore}%</span>
                    </div>
                    <div className="p-2.5 rounded bg-slate-50 border text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Communication</span>
                      <span className="text-lg font-bold font-mono text-slate-900">{currentEvaluation.communicationScore}%</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Interviewer Feedback:</span>
                    </p>
                    <p>{currentEvaluation.feedback}</p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                    <strong className="text-slate-900 block">How a Senior Engineer Would Structure This:</strong>
                    <p className="italic">"{currentEvaluation.sampleAnswerTip}"</p>
                  </div>

                  <button
                    onClick={handleNextOrFinish}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <span>{questionIndex >= 2 ? 'Generate Final Report' : 'Next Question'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Final Comprehensive Interview Report */}
      {finalReport && (
        <div className="bg-white rounded-xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Simulation Debrief Report
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
                {finalReport.roleTitle} Mock Interview
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-medium">Overall Performance:</span>
              <span className="text-3xl font-extrabold text-indigo-600 font-mono tabular-nums">
                {finalReport.overallScore}%
              </span>
            </div>
          </div>

          {/* Metric Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-slate-50 border text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Technical</span>
              <span className="text-xl font-extrabold font-mono text-slate-800">{finalReport.technicalScore}%</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Behavioral</span>
              <span className="text-xl font-extrabold font-mono text-slate-800">{finalReport.behavioralScore}%</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Communication</span>
              <span className="text-xl font-extrabold font-mono text-slate-800">{finalReport.communicationScore}%</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Project Explanation</span>
              <span className="text-xl font-extrabold font-mono text-slate-800">{finalReport.projectScore}%</span>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
            <strong className="text-slate-900 block mb-1">Executive Summary:</strong>
            {finalReport.executiveSummary}
          </div>

          {/* Strengths & Areas to Improve */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-200/80 space-y-2">
              <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Demonstrated Strengths</span>
              </h4>
              <ul className="space-y-1">
                {finalReport.strengths?.map((st, i) => (
                  <li key={i} className="text-xs text-emerald-800">• {st}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-rose-50/50 border border-rose-200/80 space-y-2">
              <h4 className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Areas to Polish</span>
              </h4>
              <ul className="space-y-1">
                {finalReport.areasToImprove?.map((ar, i) => (
                  <li key={i} className="text-xs text-rose-800">• {ar}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => {
                setFinalReport(null);
                setSessionActive(false);
              }}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Start New Interview</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
