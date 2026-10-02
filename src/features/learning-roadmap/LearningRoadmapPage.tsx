import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Map,
  CheckCircle2,
  Lock,
  Play,
  Clock,
  BookOpen,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  Filter,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { roadmapApi, resourcesApi } from '../../services/api';
import { RoadmapItem, LearningResource } from '../../types';

export const LearningRoadmapPage: React.FC = () => {
  const navigate = useNavigate();
  const { roadmap, roleFit, targetRole, refreshData, showToast } = useApp();
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [filterSkill, setFilterSkill] = useState<string>('all');
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedItemId(expandedItemId === id ? null : id);
  };

  const handleUpdateStatus = async (
    item: RoadmapItem,
    newStatus: 'in_progress' | 'completed'
  ) => {
    setUpdatingItemId(item.id);
    try {
      await roadmapApi.updateRoadmapItem(item.id, {
        status: newStatus,
        progress: newStatus === 'completed' ? 100 : Math.max(item.progress, 50),
      });

      if (newStatus === 'completed') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      }

      await refreshData();
      showToast(
        newStatus === 'completed'
          ? `Completed "${item.title}"! Skill vector & Role Fit updated.`
          : `Started "${item.title}"`,
        'success'
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to update roadmap item', 'error');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const items = roadmap?.items || [];
  const filteredItems =
    filterSkill === 'all'
      ? items
      : items.filter((i) => i.skill.toLowerCase() === filterSkill.toLowerCase());

  const uniqueSkills = Array.from(new Set(items.map((i) => i.skill)));

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-xs font-semibold mb-1.5 border border-indigo-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Personalized Adaptive Learning Path</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Roadmap to {targetRole?.title || 'Frontend Developer'}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Prerequisite-aware progression sequenced based on your target role, current skill vector, and verified gap impact.
          </p>
        </div>

        {/* Overall Completion Gauge & Action */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <button
            onClick={() => navigate('/assessments')}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all whitespace-nowrap"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Recalibrate from Assessment</span>
          </button>

          <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-lg border border-slate-200 shrink-0">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Roadmap Progress
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
                  {roadmap?.overallProgress || 0}%
                </span>
                <span className="text-xs text-slate-500">
                  ({items.filter((i) => i.status === 'completed').length} of {items.length} steps)
                </span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-full border-4 border-slate-200 border-t-indigo-600 flex items-center justify-center font-mono font-bold text-xs text-indigo-600">
              {roadmap?.overallProgress || 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
          <button
            onClick={() => setFilterSkill('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors border ${
              filterSkill === 'all'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Skills ({items.length})
          </button>
          {uniqueSkills.map((sk) => (
            <button
              key={sk}
              onClick={() => setFilterSkill(sk)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors border ${
                filterSkill === sk
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {sk}
            </button>
          ))}
        </div>
      </div>

      {/* Sequential Timeline Nodes */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-slate-200 text-center shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto">
            <Map className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Roadmap Generated Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Take the 10-Question Role Assessment to test your fundamental skills, identify your exact weak areas, and generate a customized study roadmap.
          </p>
          <button
            onClick={() => navigate('/assessments')}
            className="mt-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs inline-flex items-center gap-2"
          >
            <Award className="w-4 h-4" />
            <span>Start 10-Question Assessment</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4 relative before:absolute before:inset-0 before:left-6 before:w-0.5 before:bg-slate-200 before:hidden md:before:block">
          {filteredItems.map((item, idx) => {
          const isCompleted = item.status === 'completed';
          const isInProgress = item.status === 'in_progress';
          const isLocked = item.status === 'locked';
          const isExpanded = expandedItemId === item.id;

          return (
            <div
              key={item.id}
              className={`relative bg-white rounded-xl border transition-all shadow-xs ${
                isInProgress
                  ? 'border-indigo-400 ring-2 ring-indigo-500/10'
                  : isCompleted
                  ? 'border-emerald-200 bg-emerald-50/20'
                  : 'border-slate-200'
              }`}
            >
              <div className="p-5 md:pl-16 relative">
                {/* Node Milestone Marker on Left */}
                <div
                  className={`hidden md:flex absolute left-4 top-6 -ml-1 w-6 h-6 rounded-full border items-center justify-center text-xs font-bold font-mono ${
                    isCompleted
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : isInProgress
                      ? 'bg-indigo-600 text-white border-indigo-600 animate-pulse'
                      : 'bg-white text-slate-400 border-slate-300'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : isLocked ? <Lock className="w-3 h-3" /> : idx + 1}
                </div>

                {/* Card Header Content */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {item.skill}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : isInProgress
                            ? 'bg-indigo-100 text-indigo-800'
                            : isLocked
                            ? 'bg-slate-100 text-slate-500'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {item.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {item.estimatedHours}h
                      </span>
                      <span className="text-xs text-slate-400">· {item.difficulty}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                      {item.description}
                    </p>
                  </div>

                  {/* Action Controls */}
                  <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
                    {!isCompleted && !isLocked && (
                      <button
                        onClick={() => handleUpdateStatus(item, 'completed')}
                        disabled={updatingItemId === item.id}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold rounded-md shadow-xs transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Complete</span>
                      </button>
                    )}

                    {!isCompleted && !isInProgress && !isLocked && (
                      <button
                        onClick={() => handleUpdateStatus(item, 'in_progress')}
                        disabled={updatingItemId === item.id}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold rounded-md shadow-xs transition-colors flex items-center gap-1"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Start Step</span>
                      </button>
                    )}

                    <button
                      onClick={() => toggleExpand(item.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
                      aria-label="Toggle resources"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expandable Resources Drawer */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 animate-in fade-in duration-150">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Curated Learning Resources</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {item.resources?.map((res, rIdx) => (
                        <a
                          key={rIdx}
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all flex items-center justify-between text-xs group"
                        >
                          <div>
                            <p className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                              {res.title}
                            </p>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {res.type} {res.duration ? `· ${res.duration}` : ''}
                            </span>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0 ml-2" />
                        </a>
                      ))}
                    </div>

                    {item.prerequisites && item.prerequisites.length > 0 && (
                      <div className="pt-2 text-[11px] text-slate-500">
                        <strong className="text-slate-700">Prerequisites: </strong>
                        {item.prerequisites.join(', ')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};
