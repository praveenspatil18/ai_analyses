import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  TrendingUp,
  Award,
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SkillMatchRow } from '../../types';

export const SkillGapPage: React.FC = () => {
  const { roleFit, targetRole } = useApp();
  const navigate = useNavigate();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [simulatedSkill, setSimulatedSkill] = useState<string>('');
  const [simulatedLevel, setSimulatedLevel] = useState<number>(85);

  const skillRows = roleFit?.skillRows || [];

  const filteredRows =
    categoryFilter === 'all'
      ? skillRows
      : skillRows.filter((r) => r.category.toLowerCase() === categoryFilter.toLowerCase());

  // Count by category
  const criticalCount = skillRows.filter((r) => r.category === 'Critical').length;
  const highCount = skillRows.filter((r) => r.category === 'High').length;
  const mediumCount = skillRows.filter((r) => r.category === 'Medium').length;
  const strongCount = skillRows.filter((r) => r.status === 'Strong').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-rose-600" />
          <span>Skill Gap Intelligence & Priority Ranking</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Skills analyzed and ranked by impact multiplier ($gap \times importance\_weight$) for{' '}
          <strong className="text-slate-800">{targetRole?.title || 'Frontend Developer'}</strong>.
        </p>
      </div>

      {/* Category Metric Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Critical Gaps</span>
            <span className="text-2xl font-extrabold text-rose-600 font-mono tabular-nums">
              {criticalCount}
            </span>
          </div>
          <span className="p-2 rounded-lg bg-rose-50 text-rose-600">
            <AlertTriangle className="w-4 h-4" />
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">High Priority</span>
            <span className="text-2xl font-extrabold text-amber-600 font-mono tabular-nums">
              {highCount}
            </span>
          </div>
          <span className="p-2 rounded-lg bg-amber-50 text-amber-600">
            <Zap className="w-4 h-4" />
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Medium Priority</span>
            <span className="text-2xl font-extrabold text-blue-600 font-mono tabular-nums">
              {mediumCount}
            </span>
          </div>
          <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
            <Layers className="w-4 h-4" />
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Strong Skills</span>
            <span className="text-2xl font-extrabold text-emerald-600 font-mono tabular-nums">
              {strongCount}
            </span>
          </div>
          <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
        {['all', 'critical', 'high', 'medium', 'strong'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize whitespace-nowrap transition-colors border ${
              categoryFilter === cat
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat} ({cat === 'all' ? skillRows.length : skillRows.filter((r) => r.category.toLowerCase() === cat.toLowerCase()).length})
          </button>
        ))}
      </div>

      {/* Main Priority Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Ranked Skill Gaps</h2>
            <p className="text-xs text-slate-500">Sorted by mathematical priority impact on hiring readiness</p>
          </div>
          <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200">
            Role Fit: {roleFit?.fitScore}%
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px] bg-slate-50">
                <th className="py-3 px-4">Skill</th>
                <th className="py-3 px-4">Your Vector</th>
                <th className="py-3 px-4">Required</th>
                <th className="py-3 px-4">Deficit Gap</th>
                <th className="py-3 px-4">Weight</th>
                <th className="py-3 px-4">Priority Score</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.map((row) => (
                <tr key={row.skill} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {row.skill}
                  </td>
                  <td className="py-3 px-4 font-mono font-medium tabular-nums text-slate-700">
                    {row.yourLevel}%
                  </td>
                  <td className="py-3 px-4 font-mono font-medium tabular-nums text-slate-700">
                    {row.requiredLevel}%
                  </td>
                  <td className="py-3 px-4 font-mono font-bold tabular-nums text-rose-600">
                    {row.gap > 0 ? `-${row.gap}%` : '0%'}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500 tabular-nums">
                    {row.weight}%
                  </td>
                  <td className="py-3 px-4 font-mono font-bold tabular-nums text-slate-800">
                    {row.priorityScore.toFixed(3)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                        row.category === 'Critical'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : row.category === 'High'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : row.category === 'Medium'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {row.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => navigate(`/assessments?skill=${encodeURIComponent(row.skill)}`)}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded transition-colors mr-1.5"
                    >
                      Assess
                    </button>
                    <button
                      onClick={() => navigate('/roadmap')}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded transition-colors"
                    >
                      Roadmap
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
