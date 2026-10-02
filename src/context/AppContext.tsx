import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserProfile,
  CareerGoal,
  UserSkill,
  CareerFitResult,
  CareerRole,
  Roadmap,
} from '../types';
import { authApi, careerApi, skillsApi, roadmapApi, getStoredToken } from '../services/api';

interface AppContextType {
  user: UserProfile | null;
  careerGoal: CareerGoal | null;
  userSkills: UserSkill[];
  roleFit: CareerFitResult | null;
  targetRole: CareerRole | null;
  roadmap: Roadmap | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<void>;
  signup: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  refreshData: () => Promise<void>;
  updateUserSkills: (skills: Array<{ skill: string; level: number; confidence?: number; source?: string }>) => Promise<void>;
  updateCareerGoal: (goal: { targetRoleId: string; targetRoleTitle: string }) => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [careerGoal, setCareerGoal] = useState<CareerGoal | null>(null);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [roleFit, setRoleFit] = useState<CareerFitResult | null>(null);
  const [targetRole, setTargetRole] = useState<CareerRole | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load user
      const userRes = await authApi.getCurrentUser();
      setUser(userRes.user);

      // Load goal
      const goalRes = await careerApi.getCareerGoal();
      setCareerGoal(goalRes.goal);

      // Load skills & fit
      const skillsRes = await skillsApi.getUserSkills();
      setUserSkills(skillsRes.skills);
      setRoleFit(skillsRes.roleFit);
      setTargetRole(skillsRes.targetRole);

      // Load roadmap
      const roadmapRes = await roadmapApi.getRoadmap();
      setRoadmap(roadmapRes.roadmap);
    } catch (err: any) {
      console.warn('Refresh data notice:', err.message);
      // Auto-fallback if not logged in
      if (!getStoredToken()) {
        try {
          const loginRes = await authApi.login({ email: 'demo@careerai.dev', password: 'demo1234' });
          setUser(loginRes.user);
        } catch (e) {
          // ignore
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.login({ email, password: pass });
      setUser(res.user);
      await refreshData();
      showToast('Welcome back to CareerAI!', 'success');
    } catch (err: any) {
      setError(err.message);
      showToast(err.message || 'Login failed', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.signup({ name, email, password: pass });
      setUser(res.user);
      await refreshData();
      showToast('Account created successfully!', 'success');
    } catch (err: any) {
      setError(err.message);
      showToast(err.message || 'Signup failed', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    showToast('Logged out successfully', 'info');
  };

  const updateUserSkills = async (skills: Array<{ skill: string; level: number; confidence?: number; source?: string }>) => {
    try {
      const res = await skillsApi.saveUserSkills(skills);
      setUserSkills(res.skills);
      setRoleFit(res.roleFit);
      showToast('Skill vector updated & Role Fit recalculated', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update skills', 'error');
    }
  };

  const updateCareerGoal = async (goal: { targetRoleId: string; targetRoleTitle: string }) => {
    try {
      const res = await careerApi.saveCareerGoal(goal);
      setCareerGoal(res.goal);
      await refreshData();
      showToast(`Target goal updated to ${goal.targetRoleTitle}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update career goal', 'error');
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        careerGoal,
        userSkills,
        roleFit,
        targetRole,
        roadmap,
        isLoading,
        error,
        login,
        signup,
        logout,
        refreshData,
        updateUserSkills,
        updateCareerGoal,
        showToast,
        toast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
