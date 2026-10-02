import {
  UserProfile,
  CareerRole,
  CareerGoal,
  UserSkill,
  CareerFitResult,
  AssessmentQuestion,
  AssessmentAttempt,
  Roadmap,
  RoadmapItem,
  LearningResource,
  ProjectTemplate,
  UserProject,
  ResumeAnalysis,
  ResumeJobMatchResult,
  InterviewEvaluation,
  InterviewReport,
  AICoachMessage,
  RoleAssessmentResult,
} from '../types';

const TOKEN_KEY = 'careerai_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || data.details || `Request failed with status ${res.status}`);
  }
  return data;
}

// Auth API
export const authApi = {
  signup: async (data: { name: string; email: string; password: string }) => {
    const res = await request<{ user: UserProfile; token: string }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setStoredToken(res.token);
    return res;
  },
  login: async (data: { email: string; password: string }) => {
    const res = await request<{ user: UserProfile; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setStoredToken(res.token);
    return res;
  },
  logout: async () => {
    clearStoredToken();
  },
  getCurrentUser: async () => {
    return request<{ user: UserProfile }>('/api/auth/me');
  },
  updateProfile: async (data: Partial<UserProfile>) => {
    return request<{ user: UserProfile }>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Roles & Career Goals API
export const careerApi = {
  getRoles: async () => {
    return request<{ roles: CareerRole[] }>('/api/roles');
  },
  getCareerGoal: async () => {
    return request<{ goal: CareerGoal }>('/api/career-goal');
  },
  saveCareerGoal: async (goal: {
    targetRoleId: string;
    targetRoleTitle: string;
    targetTimelineMonths?: number;
    preferredLocation?: string;
    interests?: string[];
  }) => {
    return request<{ success: boolean; goal: CareerGoal }>('/api/career-goal', {
      method: 'POST',
      body: JSON.stringify(goal),
    });
  },
};

// Skills & Fit API
export const skillsApi = {
  getUserSkills: async () => {
    return request<{
      skills: UserSkill[];
      roleFit: CareerFitResult;
      targetRole: CareerRole;
    }>('/api/user-skills');
  },
  saveUserSkills: async (skills: Array<{ skill: string; level: number; confidence?: number; source?: string }>) => {
    return request<{
      skills: UserSkill[];
      roleFit: CareerFitResult;
    }>('/api/user-skills', {
      method: 'POST',
      body: JSON.stringify({ skills }),
    });
  },
};

// Adaptive & Role Assessment API
export const assessmentApi = {
  getRoleQuestions: async (roleId: string, roleTitle?: string) => {
    const params = new URLSearchParams();
    if (roleId) params.append('roleId', roleId);
    if (roleTitle) params.append('roleTitle', roleTitle);
    return request<{
      roleId: string;
      roleTitle: string;
      totalQuestions: number;
      questions: AssessmentQuestion[];
    }>(`/api/assessments/role-questions?${params.toString()}`);
  },
  submitRoleAssessment: async (data: {
    roleId: string;
    roleTitle: string;
    answers: Array<{
      questionId: string;
      skill: string;
      selectedOption: number;
      isCorrect: boolean;
    }>;
    durationSeconds?: number;
  }) => {
    return request<RoleAssessmentResult>('/api/assessments/role-submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  getQuestions: async (skill: string, difficulty: 'easy' | 'medium' | 'hard' = 'easy') => {
    return request<{ questions: AssessmentQuestion[] }>(
      `/api/assessments/questions?skill=${encodeURIComponent(skill)}&difficulty=${difficulty}`
    );
  },
  submitAssessment: async (data: {
    skill: string;
    answers: Array<{
      questionId: string;
      difficulty: string;
      selectedOption: number;
      isCorrect: boolean;
    }>;
    durationSeconds?: number;
  }) => {
    return request<{
      attempt: AssessmentAttempt;
      updatedSkill: { skill: string; level: number; confidence: number };
      roleFit: CareerFitResult;
    }>('/api/assessments/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Roadmap API
export const roadmapApi = {
  getRoadmap: async () => {
    return request<{ roadmap: Roadmap }>('/api/roadmap');
  },
  generateFromAssessment: async (data: {
    roleId: string;
    roleTitle: string;
    weakSkills: string[];
    overallScore?: number;
  }) => {
    return request<{ success: boolean; roadmap: Roadmap; message: string }>(
      '/api/roadmap/generate-from-assessment',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },
  updateRoadmapItem: async (itemId: string, data: { status?: string; progress?: number }) => {
    return request<{
      roadmap: Roadmap;
      roleFit: CareerFitResult;
      userSkills: UserSkill[];
    }>(`/api/roadmap/item/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

// Learning Resources API
export const resourcesApi = {
  getResources: async (params?: { skill?: string; type?: string; difficulty?: string }) => {
    const q = new URLSearchParams();
    if (params?.skill) q.set('skill', params.skill);
    if (params?.type) q.set('type', params.type);
    if (params?.difficulty) q.set('difficulty', params.difficulty);
    return request<{ resources: LearningResource[] }>(`/api/resources?${q.toString()}`);
  },
  completeResource: async (data: { resourceId: string; skill: string; hoursSpent: number }) => {
    return request<{ success: boolean; record: any; roleFit: CareerFitResult }>(
      '/api/learning/complete',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },
};

// Projects API
export const projectsApi = {
  getTemplates: async () => {
    return request<{ templates: ProjectTemplate[] }>('/api/projects/templates');
  },
  getUserProjects: async () => {
    return request<{ projects: UserProject[] }>('/api/projects/user');
  },
  startProject: async (projectId: string) => {
    return request<{ project: UserProject }>('/api/projects/start', {
      method: 'POST',
      body: JSON.stringify({ projectId }),
    });
  },
  toggleMilestone: async (projectId: string, milestoneId: number, completed: boolean) => {
    return request<{ project: UserProject }>('/api/projects/milestone', {
      method: 'POST',
      body: JSON.stringify({ projectId, milestoneId, completed }),
    });
  },
};

// Gemini AI API
export const aiApi = {
  askCoach: async (message: string) => {
    return request<{ reply: string; message: AICoachMessage }>('/api/ai/coach', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },
  getCoachHistory: async () => {
    return request<{ history: AICoachMessage[] }>('/api/ai/coach/history');
  },
  analyzeResume: async (resumeText: string, fileName: string) => {
    return request<{ analysis: ResumeAnalysis }>('/api/ai/analyze-resume', {
      method: 'POST',
      body: JSON.stringify({ resumeText, fileName }),
    });
  },
  matchJob: async (data: {
    resumeText: string;
    jobDescription: string;
    jobTitle?: string;
    company?: string;
  }) => {
    return request<{ match: ResumeJobMatchResult }>('/api/ai/match-job', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  getInterviewQuestion: async (data: {
    roleTitle: string;
    difficulty: string;
    interviewType: string;
    questionIndex: number;
    previousAnswers?: any[];
  }) => {
    return request<{
      question: string;
      category: string;
      expectedKeyPoints: string[];
    }>('/api/ai/interview-question', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  evaluateInterviewAnswer: async (data: {
    roleTitle: string;
    question: string;
    userAnswer: string;
    category: string;
  }) => {
    return request<{ evaluation: InterviewEvaluation }>('/api/ai/evaluate-interview-answer', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  generateFinalInterviewReport: async (data: {
    roleTitle: string;
    interviewType: string;
    qaPairs: any[];
  }) => {
    return request<{ report: InterviewReport }>('/api/ai/final-interview-report', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Analytics API
export const analyticsApi = {
  getAnalytics: async () => {
    return request<{
      careerMatchHistory: Array<{ date: string; fitScore: number }>;
      skillGrowth: Array<{ skill: string; current: number; required: number }>;
      weeklyLearningHours: Array<{ day: string; hours: number }>;
      fitScore: number;
      roadmapProgress: number;
      totalSkillsTracked: number;
      activeProjectsCount: number;
      completedAssessmentsCount: number;
    }>('/api/analytics');
  },
};
