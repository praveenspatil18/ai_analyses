import React, { useState } from 'react';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Compass,
  FileText,
  Sliders,
  Award,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { authApi } from '../../services/api';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
}) => {
  const { user, targetRole, roleFit, updateCareerGoal, updateUserSkills, refreshData } = useApp();
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const [selectedRoleTitle, setSelectedRoleTitle] = useState('Frontend Developer');
  const [educationLevel, setEducationLevel] = useState('B.Tech Computer Science');
  const [initialSkills, setInitialSkills] = useState([
    { skill: 'JavaScript', level: 0.45 },
    { skill: 'HTML', level: 0.80 },
    { skill: 'CSS', level: 0.70 },
    { skill: 'React', level: 0.35 },
  ]);

  if (!isOpen) return null;

  const handleNext = async () => {
    if (step === 2) {
      await updateCareerGoal({
        targetRoleId: 'role-frontend',
        targetRoleTitle: selectedRoleTitle,
      });
    }

    if (step === 3) {
      await updateUserSkills(
        initialSkills.map((s) => ({
          skill: s.skill,
          level: s.level,
          confidence: 0.65,
          source: 'self_assessment',
        }))
      );
    }

    if (step < totalSteps) {
      setStep((prev) => prev + 1);
    } else {
      // Finish onboarding
      try {
        await authApi.updateProfile({ onboardingCompleted: true });
        await refreshData();
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch (err) {
        console.warn(err);
      }
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 md:p-8 space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Progress Bar & Header */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold text-indigo-600 uppercase tracking-wider">
              Step {step} of {totalSteps}
            </span>
            <button
              onClick={onComplete}
              className="text-slate-400 hover:text-slate-600 text-xs"
            >
              Skip to Dashboard
            </button>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="space-y-4 text-center py-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center mx-auto shadow-md">
              <Sparkles className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Welcome to CareerAI, {user?.name || 'Engineer'}!
            </h2>
            <p className="text-xs md:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              We guide students and aspiring developers to target tech careers through real skill vector calculations, personalized roadmaps, and AI mock simulations.
            </p>
          </div>
        )}

        {/* Step 2: Choose Career */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="text-left">
              <h2 className="text-lg font-bold text-slate-900">Choose Your Target Career Role</h2>
              <p className="text-xs text-slate-500">
                Your CareerAI Role Fit will be computed against this specific industry specification.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                'Frontend Developer',
                'Backend Developer',
                'Full Stack Developer',
                'Data Analyst',
                'Data Scientist',
                'Machine Learning Engineer',
              ].map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRoleTitle(role)}
                  className={`p-3 rounded-lg border text-left text-xs font-semibold transition-all ${
                    selectedRoleTitle === role
                      ? 'border-indigo-600 bg-indigo-50/60 text-indigo-950 ring-1 ring-indigo-500'
                      : 'border-slate-200 hover:border-slate-300 text-slate-800'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Initial Skills */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="text-left">
              <h2 className="text-lg font-bold text-slate-900">Baseline Skill Estimates</h2>
              <p className="text-xs text-slate-500">
                Provide a quick initial self-estimate for common web technologies.
              </p>
            </div>

            <div className="space-y-3">
              {initialSkills.map((s, idx) => (
                <div key={s.skill} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800">{s.skill}</span>
                    <span className="font-mono text-indigo-600">
                      {Math.round(s.level * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round(s.level * 100)}
                    onChange={(e) => {
                      const val = Number(e.target.value) / 100;
                      setInitialSkills((prev) =>
                        prev.map((item, i) => (i === idx ? { ...item, level: val } : item))
                      );
                    }}
                    className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Role Fit Score Calculated */}
        {step === 4 && (
          <div className="space-y-4 text-center py-2">
            <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-200">
              <Award className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900">
                Initial CareerAI Role Fit: {roleFit?.fitScore || 52}%
              </h2>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Target Role: <strong>{selectedRoleTitle}</strong>. We've detected your top skill gaps and organized your learning sequence.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-left text-xs max-w-md mx-auto space-y-1">
              <span className="font-bold text-slate-800 block">Top Skills Contributing to Gap:</span>
              <ul className="space-y-1 text-slate-600">
                <li>• JavaScript: 45% (Required: 85%)</li>
                <li>• React: 35% (Required: 75%)</li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 5: Ready to Launch */}
        {step === 5 && (
          <div className="space-y-4 text-center py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              You're Ready to Accelerate!
            </h2>
            <p className="text-xs md:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Your personalized learning roadmap, adaptive testing arena, and AI Career Mentor are ready. Let's start learning!
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep((prev) => prev - 1)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={handleNext}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <span>{step === totalSteps ? 'Enter CareerAI Dashboard' : 'Continue'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
