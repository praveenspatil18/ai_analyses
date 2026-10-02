import React, { useState, useEffect } from 'react';
import {
  User,
  Save,
  Check,
  Building,
  GraduationCap,
  MapPin,
  Globe,
  Tag,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { authApi } from '../../services/api';

export const ProfileSettingsPage: React.FC = () => {
  const { user, refreshData, showToast } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [education, setEducation] = useState('');
  const [college, setCollege] = useState('');
  const [degree, setDegree] = useState('');
  const [graduationYear, setGraduationYear] = useState<number>(2026);
  const [experienceLevel, setExperienceLevel] = useState('Entry-Level / Student');
  const [location, setLocation] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('English');
  const [interests, setInterests] = useState('');
  const [bio, setBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setEducation(user.education || 'Bachelor of Technology');
      setCollege(user.college || 'National Institute of Technology');
      setDegree(user.degree || 'Computer Science & Engineering');
      setGraduationYear(user.graduationYear || 2026);
      setExperienceLevel(user.experienceLevel || 'Entry-Level / Student');
      setLocation(user.location || 'Bengaluru, India');
      setPreferredLanguage(user.preferredLanguage || 'English');
      setInterests((user.interests || ['React', 'TypeScript', 'Web Architecture']).join(', '));
      setBio(user.bio || 'Passionate software engineer building resilient, accessible web experiences.');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const interestsArray = interests.split(',').map((s) => s.trim()).filter(Boolean);
      await authApi.updateProfile({
        name,
        education,
        college,
        degree,
        graduationYear: Number(graduationYear),
        experienceLevel,
        location,
        preferredLanguage,
        interests: interestsArray,
        bio,
      });
      await refreshData();
      showToast('Profile updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-indigo-600" />
          <span>Profile & Account Settings</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your student credentials, educational milestones, and AI personalization parameters.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-6">
        {/* Profile Avatar & Identity */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <img
            src={user?.avatar || '/src/assets/images/avatar_student_1790957486261.jpg'}
            alt="User avatar"
            referrerPolicy="no-referrer"
            className="w-16 h-16 rounded-full object-cover border-2 border-indigo-200 shadow-xs"
          />
          <div>
            <h2 className="text-base font-bold text-slate-900">{name || 'Student Name'}</h2>
            <p className="text-xs text-slate-500">{email}</p>
            <span className="inline-block mt-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              Verified Student Account
            </span>
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
            <input
              type="email"
              disabled
              value={email}
              className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-md text-slate-500 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Education & Experience */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Institution / College</label>
            <input
              type="text"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Degree Program</label>
            <input
              type="text"
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Graduation Year</label>
            <input
              type="number"
              value={graduationYear}
              onChange={(e) => setGraduationYear(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md"
            />
          </div>
        </div>

        {/* Experience Level & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Experience Level</label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md"
            >
              <option value="Entry-Level / Student">Entry-Level / Student</option>
              <option value="Junior Engineer (1-2 yrs)">Junior Engineer (1-2 yrs)</option>
              <option value="Mid-Level (3-5 yrs)">Mid-Level (3-5 yrs)</option>
              <option value="Career Switcher">Career Switcher</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Preferred Language</label>
            <input
              type="text"
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md"
            />
          </div>
        </div>

        {/* Interests & Bio */}
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Technical Interests (comma separated)
            </label>
            <input
              type="text"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Bio & Aspirations</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md leading-relaxed resize-none"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
