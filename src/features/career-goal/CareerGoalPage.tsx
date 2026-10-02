import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Search,
  Check,
  Award,
  AlertCircle,
  Sliders,
  Plus,
  RefreshCw,
  BookOpen,
  Briefcase,
  Layers,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { careerApi } from '../../services/api';
import { CareerRole } from '../../types';

export const CareerGoalPage: React.FC = () => {
  const navigate = useNavigate();
  const { userSkills, roleFit, targetRole, updateCareerGoal, updateUserSkills, showToast } = useApp();
  const [roles, setRoles] = useState<CareerRole[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<CareerRole | null>(targetRole);
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState(50);
  const [isSavingGoal, setIsSavingGoal] = useState(false);

  useEffect(() => {
    careerApi.getRoles().then((res) => {
      setRoles(res.roles);
      if (!selectedRole && res.roles.length > 0) {
        setSelectedRole(res.roles[0]);
      }
    });
  }, [selectedRole]);

  useEffect(() => {
    if (targetRole) {
      setSelectedRole(targetRole);
    }
  }, [targetRole]);

  const filteredRoles = roles.filter(
    (r) =>
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectRole = async (role: CareerRole) => {
    setSelectedRole(role);
    setIsSavingGoal(true);
    try {
      await updateCareerGoal({
        targetRoleId: role.id,
        targetRoleTitle: role.title,
      });
    } finally {
      setIsSavingGoal(false);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkillName.trim()) return;
    const levelFloat = Number((newSkillLevel / 100).toFixed(2));
    const existing = userSkills.map((s) => ({
      skill: s.skill,
      level: s.level,
      confidence: s.confidence,
      source: s.source,
    }));
    existing.push({
      skill: newSkillName.trim(),
      level: levelFloat,
      confidence: 0.6,
      source: 'self_assessment',
    });
    await updateUserSkills(existing);
    setNewSkillName('');
    showToast(`Added ${newSkillName} to your skill vector`, 'success');
  };

  const handleUpdateSkillSlider = async (skillName: string, newPercent: number) => {
    const updated = userSkills.map((s) => {
      if (s.skill.toLowerCase() === skillName.toLowerCase()) {
        return {
          ...s,
          level: Number((newPercent / 100).toFixed(2)),
          source: 'self_assessment',
        };
      }
      return { skill: s.skill, level: s.level, confidence: s.confidence, source: s.source };
    });
    await updateUserSkills(updated);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Compass className="w-6 h-6 text-indigo-600" />
            <span>Target Career & Skill Vector</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Choose your target professional goal, view requisite skills & weights, and calibrate your current skill vector.
          </p>
        </div>

        {/* Selected Goal Indicator */}
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Active Target Goal
            </span>
            <span className="text-sm font-bold text-indigo-700">
              {targetRole?.title || 'Frontend Developer'}
            </span>
          </div>
          <div className="w-9 h-9 rounded-md bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold font-mono">
            {roleFit?.fitScore || 52}%
          </div>
        </div>
      </div>

      {/* Role Selection Carousel / Grid */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-slate-600" />
            <span>Select Target Career Role</span>
          </h2>

          {/* Search Roles */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search career roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Roles Pill Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {filteredRoles.map((role) => {
            const isTarget = targetRole?.id === role.id;
            const isSelected = selectedRole?.id === role.id;
            return (
              <button
                key={role.id}
                onClick={() => handleSelectRole(role)}
                disabled={isSavingGoal}
                className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border ${
                  isTarget
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                    : isSelected
                    ? 'bg-indigo-50 text-indigo-900 border-indigo-300'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{role.title}</span>
                {isTarget && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Role Specification & Skill Gap Matrix */}
      {selectedRole && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Role Fit Table & Gap Breakdown */}
          <div className="lg:col-span-2 space-y-6">
            {/* Role Fit Breakdown Table */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">CareerAI Role Fit Analysis</h3>
                  <p className="text-xs text-slate-500">
                    Skill-by-skill evaluation against <strong className="text-slate-800">{selectedRole.title}</strong> requirements
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Overall Match:</span>
                    <span className="font-mono text-base font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {roleFit?.fitScore}%
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(`/assessments?role=${selectedRole.id}`)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs flex items-center gap-1.5 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Take 10-Question Test</span>
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                      <th className="py-2.5 px-3">Role Skill</th>
                      <th className="py-2.5 px-3">Your Level</th>
                      <th className="py-2.5 px-3">Required</th>
                      <th className="py-2.5 px-3">Weight</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Priority Impact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {roleFit?.skillRows.map((row) => (
                      <tr key={row.skill} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-900">
                          {row.skill}
                        </td>
                        <td className="py-3 px-3 font-mono font-medium tabular-nums text-slate-700">
                          {row.yourLevel}%
                        </td>
                        <td className="py-3 px-3 font-mono font-medium tabular-nums text-slate-700">
                          {row.requiredLevel}%
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-500 tabular-nums">
                          {row.weight}%
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                              row.status === 'Strong'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : row.status === 'Near Target'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`font-semibold text-[11px] ${
                              row.category === 'Critical'
                                ? 'text-rose-600 font-bold'
                                : row.category === 'High'
                                ? 'text-amber-600 font-bold'
                                : 'text-slate-500'
                            }`}
                          >
                            {row.category}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* User Skill Vector Calibration Panel */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Calibrate Your Skill Vector</h3>
                  <p className="text-xs text-slate-500">
                    Adjust current skill levels directly or log new skills into your vector
                  </p>
                </div>
                <button
                  onClick={() => setIsEditingSkills(!isEditingSkills)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{isEditingSkills ? 'Done Adjusting' : 'Adjust Sliders'}</span>
                </button>
              </div>

              {/* Skill Sliders */}
              <div className="space-y-4">
                {userSkills.map((s) => (
                  <div key={s.skill} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{s.skill}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-mono">
                          Source: {s.source} · Conf: {(s.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <span className="font-mono tabular-nums font-bold text-indigo-700">
                        {(s.level * 100).toFixed(0)}%
                      </span>
                    </div>

                    {isEditingSkills ? (
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={Math.round(s.level * 100)}
                        onChange={(e) => handleUpdateSkillSlider(s.skill, Number(e.target.value))}
                        className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                      />
                    ) : (
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all"
                          style={{ width: `${Math.round(s.level * 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Custom Skill Form */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2 items-center">
                <input
                  type="text"
                  placeholder="Add custom skill (e.g. Docker, GraphQL)..."
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="flex-1 w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs text-slate-500 font-mono whitespace-nowrap">
                    Level: {newSkillLevel}%
                  </span>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={newSkillLevel}
                    onChange={(e) => setNewSkillLevel(Number(e.target.value))}
                    className="w-24 accent-indigo-600 cursor-pointer"
                  />
                  <button
                    onClick={handleAddSkill}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors shrink-0 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Role Profile Specifications */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                  Industry Role Blueprint
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{selectedRole.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {selectedRole.description}
                </p>
              </div>

              {/* Prerequisites */}
              <div className="pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                  <span>Foundational Prerequisites</span>
                </h4>
                <ul className="space-y-1">
                  {selectedRole.prerequisites.map((pre, idx) => (
                    <li key={idx} className="text-xs text-slate-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                      <span>{pre}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Projects */}
              <div className="pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                  <span>Recommended Industry Projects</span>
                </h4>
                <ul className="space-y-1">
                  {selectedRole.recommendedProjects.map((proj, idx) => (
                    <li key={idx} className="text-xs text-slate-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                      <span>{proj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Interview Topics */}
              <div className="pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                  <span>Common Interview Topics</span>
                </h4>
                <ul className="space-y-1">
                  {selectedRole.interviewTopics.map((topic, idx) => (
                    <li key={idx} className="text-xs text-slate-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
