import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  CheckCircle2,
  Clock,
  Play,
  Award,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ListTodo,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { projectsApi } from '../../services/api';
import { ProjectTemplate, UserProject } from '../../types';
import { useApp } from '../../context/AppContext';

export const ProjectRecommendationsPage: React.FC = () => {
  const { roleFit, targetRole, refreshData, showToast } = useApp();
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [userProjects, setUserProjects] = useState<UserProject[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const [tRes, uRes] = await Promise.all([
        projectsApi.getTemplates(),
        projectsApi.getUserProjects(),
      ]);
      setTemplates(tRes.templates);
      setUserProjects(uRes.projects);
    } catch (err: any) {
      showToast(err.message || 'Failed to load projects', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartProject = async (projectId: string) => {
    try {
      const res = await projectsApi.startProject(projectId);
      setUserProjects((prev) => [...prev.filter((p) => p.projectId !== projectId), res.project]);
      showToast(`Started "${res.project.title}"! Added to your portfolio backlog.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to start project', 'error');
    }
  };

  const handleToggleMilestone = async (
    projectId: string,
    milestoneId: number,
    currentCompleted: boolean
  ) => {
    try {
      const res = await projectsApi.toggleMilestone(projectId, milestoneId, !currentCompleted);
      setUserProjects((prev) =>
        prev.map((p) => (p.projectId === projectId ? res.project : p))
      );

      if (!currentCompleted) {
        showToast('Milestone completed!', 'success');
      }

      if (res.project.status === 'completed') {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
        await refreshData();
        showToast(`Project Completed! Skill Vector points credited.`, 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update milestone', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <FolderGit2 className="w-6 h-6 text-indigo-600" />
          <span>Personalized Project Recommendations</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          High-conviction portfolio projects calibrated to target your top skill gaps for{' '}
          <strong className="text-slate-800">{targetRole?.title || 'Frontend Developer'}</strong>.
        </p>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 gap-6">
        {templates.map((tpl) => {
          const userProject = userProjects.find((p) => p.projectId === tpl.id);
          const isStarted = Boolean(userProject);
          const isCompleted = userProject?.status === 'completed';
          const completedMilestoneCount = userProject?.completedMilestones?.length || 0;
          const totalMilestones = tpl.milestones.length;
          const progressPercent = Math.round((completedMilestoneCount / totalMilestones) * 100);

          return (
            <div
              key={tpl.id}
              className={`bg-white rounded-xl border transition-all p-6 shadow-xs ${
                isCompleted
                  ? 'border-emerald-200 bg-emerald-50/20'
                  : isStarted
                  ? 'border-indigo-300 ring-2 ring-indigo-500/10'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {tpl.difficulty}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      {tpl.estimatedTime}
                    </span>
                    {isCompleted && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Completed & Verified</span>
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{tpl.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                    {tpl.description}
                  </p>
                </div>

                {/* Top Action */}
                <div className="shrink-0">
                  {!isStarted ? (
                    <button
                      onClick={() => handleStartProject(tpl.id)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start Project</span>
                    </button>
                  ) : (
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Milestones Progress
                      </span>
                      <span className="font-mono text-base font-extrabold text-indigo-600">
                        {completedMilestoneCount} / {totalMilestones} ({progressPercent}%)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Skills Tagged & Portfolio Value */}
              <div className="py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-slate-500 font-medium">Skills Exercised:</span>
                  {tpl.skills.map((sk) => (
                    <span
                      key={sk}
                      className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-semibold"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
                <div className="text-[11px] text-slate-500 italic max-w-md">
                  💡 {tpl.portfolioValue}
                </div>
              </div>

              {/* Milestones Checklist */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <ListTodo className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Interactive Development Milestones</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {tpl.milestones.map((m) => {
                    const isDone = userProject?.completedMilestones?.includes(m.id) || false;
                    return (
                      <div
                        key={m.id}
                        onClick={() => isStarted && handleToggleMilestone(tpl.id, m.id, isDone)}
                        className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 transition-colors ${
                          !isStarted
                            ? 'opacity-60 bg-slate-50 border-slate-200 cursor-not-allowed'
                            : isDone
                            ? 'bg-emerald-50/50 border-emerald-300 cursor-pointer'
                            : 'bg-white border-slate-200 hover:border-slate-300 cursor-pointer'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isDone}
                          disabled={!isStarted}
                          onChange={() => {}} // handled by parent onClick
                          className="mt-0.5 accent-emerald-600 cursor-pointer"
                        />
                        <div>
                          <p className={`font-semibold ${isDone ? 'text-emerald-950 line-through' : 'text-slate-900'}`}>
                            {m.title}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                            {m.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
