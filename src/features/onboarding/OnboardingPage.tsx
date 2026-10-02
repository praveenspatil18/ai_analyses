import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Award,
  ArrowRight,
  Compass,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { authApi } from '../../services/api';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, roleFit, updateCareerGoal, updateUserSkills, refreshData } = useApp();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [selectedRole, setSelectedRole] = useState('Frontend Developer');
  const [skills, setSkills] = useState([
    { skill: 'JavaScript', level: 0.45 },
    { skill: 'HTML', level: 0.85 },
    { skill: 'CSS', level: 0.70 },
    { skill: 'React', level: 0.30 },
    { skill: 'Git', level: 0.60 },
  ]);

  const handleNext = async () => {
    if (step === 2) {
      await updateCareerGoal({
        targetRoleId: 'role-frontend',
        targetRoleTitle: selectedRole,
      });
    }

    if (step === 3) {
      await updateUserSkills(
        skills.map((s) => ({
          skill: s.skill,
          level: s.level,
          confidence: 0.7,
          source: 'self_assessment',
        }))
      );
    }

    if (step < totalSteps) {
      setStep((prev) => prev + 1);
    } else {
      try {
        await authApi.updateProfile({ onboardingCompleted: true });
        await refreshData();
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch (err) {
        console.warn(err);
      }
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-8 text-white">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-10 shadow-2xl space-y-8 relative">
        {/* Progress indicator */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold text-indigo-400 uppercase tracking-wider">
              Step {step} of {totalSteps}
            </span>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-slate-500 hover:text-slate-300"
            >
              Skip to Dashboard
            </button>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white mx-auto shadow-lg">
              <Sparkles className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Welcome, {user?.name || 'Engineer'}!
            </h1>
            <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
              CareerAI is built to accelerate your career readiness. Let's configure your target career goal and calibrate your initial skill vector.
            </p>
          </div>
        )}

        {/* Step 2: Choose Career Goal */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold">Select Target Career Goal</h2>
              <p className="text-xs text-slate-400 mt-1">
                Your role fit score and learning roadmaps will calibrate to this industry spec.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: 'Frontend Developer', desc: 'React, TypeScript, CSS, UI Systems' },
                { title: 'Backend Developer', desc: 'Node.js, PostgreSQL, APIs, Microservices' },
                { title: 'Full Stack Developer', desc: 'End-to-End Web, State, Cloud' },
                { title: 'Data Scientist', desc: 'Python, ML, Statistical Modeling' },
                { title: 'DevOps Engineer', desc: 'Kubernetes, Docker, CI/CD, Linux' },
                { title: 'Cybersecurity Analyst', desc: 'Network Security, Threat Hunting, Auth' },
              ].map((role) => (
                <div
                  key={role.title}
                  onClick={() => setSelectedRole(role.title)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedRole === role.title
                      ? 'bg-indigo-950/60 border-indigo-500 ring-1 ring-indigo-500'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">{role.title}</h3>
                    {selectedRole === role.title && (
                      <Check className="w-4 h-4 text-indigo-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{role.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Baseline Skills */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold">Baseline Skill Levels</h2>
              <p className="text-xs text-slate-400 mt-1">
                Estimate your initial competence for core {selectedRole} skills.
              </p>
            </div>

            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              {skills.map((s, idx) => (
                <div key={s.skill} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{s.skill}</span>
                    <span className="font-mono text-indigo-400 font-bold">
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
                      setSkills((prev) =>
                        prev.map((item, i) => (i === idx ? { ...item, level: val } : item))
                      );
                    }}
                    className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Role Fit Calculated & Launch */}
        {step === 4 && (
          <div className="text-center space-y-6 py-4">
            <div className="w-16 h-16 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/30">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-white">
                Initial CareerAI Role Fit: {roleFit?.fitScore || 52}%
              </h2>
              <p className="text-xs md:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                We've initialized your learning roadmap, detected your top priority skill gaps, and calibrated your dashboard for{' '}
                <strong className="text-indigo-400">{selectedRole}</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          {step > 1 ? (
            <button
              onClick={() => setStep((prev) => prev - 1)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={handleNext}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs md:text-sm font-bold rounded-lg shadow-sm transition-all flex items-center gap-2"
          >
            <span>{step === totalSteps ? 'Enter CareerAI Dashboard' : 'Continue'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
