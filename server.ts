import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { INITIAL_ROLES, INITIAL_QUESTIONS, INITIAL_RESOURCES, INITIAL_PROJECTS } from './src/data/seedData';
import { ROLE_QUESTIONS, SKILL_STUDY_GUIDES } from './src/data/roleQuestions';
import { calculateRoleFit, calculateUpdatedSkillScore } from './src/utils/calculations';
import { UserSkill, SkillSource } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize GoogleGenAI SDK
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// ---------------------------------------------------------------------------
// Robust Disk-Persisted Database
// ---------------------------------------------------------------------------
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'careerai-db.json');

interface DatabaseSchema {
  users: Array<{
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    avatar: string;
    education?: string;
    college?: string;
    degree?: string;
    graduationYear?: number;
    experienceLevel?: string;
    location?: string;
    preferredLanguage?: string;
    interests?: string[];
    bio?: string;
    onboardingCompleted: boolean;
    createdAt: string;
  }>;
  careerGoals: Record<string, {
    targetRoleId: string;
    targetRoleTitle: string;
    targetTimelineMonths: number;
    preferredLocation?: string;
    interests?: string[];
    savedAt: string;
  }>;
  userSkills: Record<string, any[]>;
  roadmaps: Record<string, {
    id: string;
    userId: string;
    targetRole: string;
    overallProgress: number;
    lastUpdated: string;
    items: Array<{
      id: string;
      title: string;
      skill: string;
      description: string;
      difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
      estimatedHours: number;
      prerequisites: string[];
      stepOrder: number;
      status: 'locked' | 'available' | 'in_progress' | 'completed';
      progress: number;
      resources: Array<{ title: string; url: string; type: string; duration?: string }>;
    }>;
  }>;
  assessmentAttempts: Array<{
    id: string;
    userId: string;
    skill: string;
    score: number;
    confidence: number;
    difficultyReached: string;
    totalQuestions: number;
    correctCount: number;
    durationSeconds: number;
    date: string;
    answers: any[];
  }>;
  learningProgress: Array<{
    id: string;
    userId: string;
    resourceId: string;
    skill: string;
    hoursSpent: number;
    isCompleted: boolean;
    completedAt: string;
  }>;
  userProjects: Array<{
    id: string;
    userId: string;
    projectId: string;
    title: string;
    skills: string[];
    status: 'not_started' | 'in_progress' | 'completed';
    completedMilestones: number[];
    notes?: string;
    githubUrl?: string;
    liveUrl?: string;
    startedAt: string;
    completedAt?: string;
  }>;
  resumes: Array<{
    id: string;
    userId: string;
    fileName: string;
    uploadedAt: string;
    extracted: any;
    roleFitSummary: string;
    strengths: string[];
    weaknesses: string[];
    missingSkills: string[];
    relevantSkills: string[];
    improvements: string[];
    estimatedRoleScore?: number;
  }>;
  jobMatches: Array<{
    id: string;
    userId: string;
    jobTitle: string;
    company?: string;
    matchScore: number;
    matchedSkills: string[];
    missingSkills: string[];
    keywords: string[];
    experienceAlignment: string;
    improvements: string[];
    disclaimer: string;
    createdAt: string;
  }>;
  interviews: Array<{
    id: string;
    userId: string;
    roleTitle: string;
    interviewType: string;
    difficulty: string;
    status: string;
    createdAt: string;
    completedAt?: string;
    questions: Array<{
      id: string;
      order: number;
      question: string;
      category: string;
      userAnswer?: string;
      evaluation?: any;
    }>;
    report?: any;
  }>;
  aiChats: Record<string, Array<{
    id: string;
    sender: 'user' | 'assistant';
    content: string;
    timestamp: string;
    suggestedActions?: Array<{ label: string; action: string }>;
  }>>;
}

function initDB(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const defaultUser = {
    id: 'user-default-1',
    email: 'praveen@careerai.dev',
    passwordHash: 'demo1234',
    name: 'Praveen Patil',
    avatar: '/src/assets/images/avatar_student_1790957486261.jpg',
    education: 'Bachelor of Technology',
    college: 'National Institute of Technology',
    degree: 'Computer Science and Engineering',
    graduationYear: 2026,
    experienceLevel: 'Entry-Level / Student',
    location: 'Bengaluru, India',
    preferredLanguage: 'English',
    interests: ['Web Development', 'React Architecture', 'System Design', 'AI Engineering'],
    bio: 'Aspiring Full Stack & Frontend Engineer passionate about high performance UI systems and scalable web applications.',
    onboardingCompleted: true,
    createdAt: new Date().toISOString(),
  };

  const defaultSkills = [
    { skill: 'HTML', level: 0.85, confidence: 0.80, source: 'self_assessment', lastUpdated: new Date().toISOString() },
    { skill: 'JavaScript', level: 0.45, confidence: 0.65, source: 'assessment', lastUpdated: new Date().toISOString() },
    { skill: 'React', level: 0.30, confidence: 0.50, source: 'learning', lastUpdated: new Date().toISOString() },
    { skill: 'CSS', level: 0.70, confidence: 0.75, source: 'self_assessment', lastUpdated: new Date().toISOString() },
    { skill: 'Git', level: 0.60, confidence: 0.70, source: 'self_assessment', lastUpdated: new Date().toISOString() },
  ];

  const defaultRoadmapItems = [
    {
      id: 'step-1',
      title: 'JavaScript Core Fundamentals',
      skill: 'JavaScript',
      description: 'Master lexical scope, hoisting, closures, prototypal inheritance, and ES6+ syntax patterns.',
      difficulty: 'Beginner' as const,
      estimatedHours: 12,
      prerequisites: [],
      stepOrder: 1,
      status: 'completed' as const,
      progress: 100,
      resources: [
        { title: 'MDN JavaScript Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', type: 'Documentation', duration: '10 Hours' }
      ]
    },
    {
      id: 'step-2',
      title: 'Asynchronous JavaScript & Event Loop',
      skill: 'JavaScript',
      description: 'Demystify Promises, async/await, microtasks vs macrotasks, and error propagation.',
      difficulty: 'Intermediate' as const,
      estimatedHours: 10,
      prerequisites: ['JavaScript Core Fundamentals'],
      stepOrder: 2,
      status: 'in_progress' as const,
      progress: 60,
      resources: [
        { title: 'Eloquent JavaScript - Async', url: 'https://eloquentjavascript.net/11_async.html', type: 'Article', duration: '6 Hours' }
      ]
    },
    {
      id: 'step-3',
      title: 'Modern React Fundamentals & JSX',
      skill: 'React',
      description: 'Component architecture, props contract, unidirectional data flow, and virtual DOM diffing.',
      difficulty: 'Beginner' as const,
      estimatedHours: 15,
      prerequisites: ['Asynchronous JavaScript & Event Loop'],
      stepOrder: 3,
      status: 'available' as const,
      progress: 0,
      resources: [
        { title: 'React Official Documentation', url: 'https://react.dev/', type: 'Documentation', duration: '12 Hours' }
      ]
    },
    {
      id: 'step-4',
      title: 'React Hooks & State Orchestration',
      skill: 'React',
      description: 'Deep dive into useState, useEffect lifecycle, useRef, useMemo, and custom hooks logic extraction.',
      difficulty: 'Intermediate' as const,
      estimatedHours: 18,
      prerequisites: ['Modern React Fundamentals & JSX'],
      stepOrder: 4,
      status: 'locked' as const,
      progress: 0,
      resources: [
        { title: 'Extracting Custom Hooks', url: 'https://react.dev/learn/reusing-logic-with-custom-hooks', type: 'Article', duration: '8 Hours' }
      ]
    },
    {
      id: 'step-5',
      title: 'Production Frontend Performance & Accessibility',
      skill: 'React',
      description: 'Code splitting, memoization, WCAG 2.1 AA accessibility standards, and Core Web Vitals optimization.',
      difficulty: 'Advanced' as const,
      estimatedHours: 14,
      prerequisites: ['React Hooks & State Orchestration'],
      stepOrder: 5,
      status: 'locked' as const,
      progress: 0,
      resources: [
        { title: 'Web Vitals & Performance', url: 'https://web.dev/explore/fast', type: 'Documentation', duration: '10 Hours' }
      ]
    },
  ];

  if (!fs.existsSync(DB_FILE)) {
    const initial: DatabaseSchema = {
      users: [defaultUser],
      careerGoals: {
        'user-default-1': {
          targetRoleId: 'role-frontend',
          targetRoleTitle: 'Frontend Developer',
          targetTimelineMonths: 6,
          preferredLocation: 'Remote / Bengaluru',
          interests: ['React', 'TypeScript', 'UI Engineering'],
          savedAt: new Date().toISOString(),
        },
      },
      userSkills: {
        'user-default-1': defaultSkills,
      },
      roadmaps: {
        'user-default-1': {
          id: 'roadmap-default-1',
          userId: 'user-default-1',
          targetRole: 'Frontend Developer',
          overallProgress: 32,
          lastUpdated: new Date().toISOString(),
          items: defaultRoadmapItems,
        },
      },
      assessmentAttempts: [
        {
          id: 'attempt-1',
          userId: 'user-default-1',
          skill: 'JavaScript',
          score: 65,
          confidence: 0.70,
          difficultyReached: 'medium',
          totalQuestions: 4,
          correctCount: 3,
          durationSeconds: 140,
          date: new Date(Date.now() - 86400000 * 2).toISOString(),
          answers: [],
        },
      ],
      learningProgress: [
        {
          id: 'prog-1',
          userId: 'user-default-1',
          resourceId: 'res-js-mdn',
          skill: 'JavaScript',
          hoursSpent: 4.5,
          isCompleted: true,
          completedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        },
      ],
      userProjects: [
        {
          id: 'uproj-1',
          userId: 'user-default-1',
          projectId: 'proj-ecommerce',
          title: 'Modern E-Commerce Storefront with Cart & Checkout',
          skills: ['React', 'JavaScript', 'CSS', 'HTML'],
          status: 'in_progress',
          completedMilestones: [1],
          startedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        },
      ],
      resumes: [],
      jobMatches: [],
      interviews: [],
      aiChats: {
        'user-default-1': [
          {
            id: 'msg-1',
            sender: 'assistant',
            content: "Hello Praveen! I am your CareerAI intelligence mentor. I've analyzed your target goal of becoming a Frontend Developer. You have strong HTML and solid CSS, but our role fit engine identifies key gaps in advanced JavaScript and React hooks. What would you like to focus on today?",
            timestamp: new Date().toISOString(),
            suggestedActions: [
              { label: 'Why is my Role Fit score 52%?', action: 'explain_score' },
              { label: 'What should I study this week?', action: 'weekly_plan' },
              { label: 'Suggest a portfolio project', action: 'suggest_project' },
            ],
          },
        ],
      },
    };

    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading DB file, recreating:', err);
    return initDB();
  }
}

let db = initDB();

function saveDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed saving DB file:', err);
  }
}

// Helper: current user ID simulation from session token or default
function getUserId(req: Request): string {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const found = db.users.find((u) => u.id === token || u.email === token);
    if (found) return found.id;
  }
  return db.users[0]?.id || 'user-default-1';
}

// ---------------------------------------------------------------------------
// 1. Authentication & Profile Routes
// ---------------------------------------------------------------------------
app.post('/api/auth/signup', (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    email,
    passwordHash: password,
    name,
    avatar: '/src/assets/images/avatar_student_1790957486261.jpg',
    experienceLevel: 'Student / Entry-Level',
    onboardingCompleted: false,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  db.userSkills[newUser.id] = [
    { skill: 'JavaScript', level: 0.20, confidence: 0.40, source: 'self_assessment', lastUpdated: new Date().toISOString() },
    { skill: 'HTML', level: 0.40, confidence: 0.50, source: 'self_assessment', lastUpdated: new Date().toISOString() },
    { skill: 'CSS', level: 0.30, confidence: 0.40, source: 'self_assessment', lastUpdated: new Date().toISOString() },
  ];
  db.careerGoals[newUser.id] = {
    targetRoleId: 'role-frontend',
    targetRoleTitle: 'Frontend Developer',
    targetTimelineMonths: 6,
    savedAt: new Date().toISOString(),
  };
  saveDB();

  res.status(201).json({
    user: newUser,
    token: newUser.id,
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = db.users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase());
  if (!user || user.passwordHash !== password) {
    // Also allow demo login
    if (email === 'demo' || email === 'demo@careerai.dev') {
      const demoUser = db.users[0];
      return res.json({ user: demoUser, token: demoUser.id });
    }
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  res.json({
    user,
    token: user.id,
  });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user });
});

app.put('/api/profile', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const index = db.users.findIndex((u) => u.id === userId);
  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const updated = {
    ...db.users[index],
    ...req.body,
    id: userId, // immutable
    email: db.users[index].email, // immutable
    updatedAt: new Date().toISOString(),
  };

  db.users[index] = updated;
  saveDB();
  res.json({ user: updated });
});

// ---------------------------------------------------------------------------
// 2. Roles & Career Goal
// ---------------------------------------------------------------------------
app.get('/api/roles', (_req: Request, res: Response) => {
  res.json({ roles: INITIAL_ROLES });
});

app.get('/api/career-goal', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const goal = db.careerGoals[userId] || {
    targetRoleId: 'role-frontend',
    targetRoleTitle: 'Frontend Developer',
    targetTimelineMonths: 6,
    savedAt: new Date().toISOString(),
  };
  res.json({ goal });
});

app.post('/api/career-goal', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { targetRoleId, targetRoleTitle, targetTimelineMonths, preferredLocation, interests } = req.body;

  db.careerGoals[userId] = {
    targetRoleId,
    targetRoleTitle,
    targetTimelineMonths: targetTimelineMonths || 6,
    preferredLocation,
    interests,
    savedAt: new Date().toISOString(),
  };

  // Re-generate or adjust roadmap for new role if needed
  saveDB();
  res.json({ success: true, goal: db.careerGoals[userId] });
});

// ---------------------------------------------------------------------------
// 3. User Skill Vector & Role Fit Calculation
// ---------------------------------------------------------------------------
app.get('/api/user-skills', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const skills = db.userSkills[userId] || [];
  const goal = db.careerGoals[userId] || { targetRoleId: 'role-frontend', targetRoleTitle: 'Frontend Developer' };
  const role = INITIAL_ROLES.find((r) => r.id === goal.targetRoleId) || INITIAL_ROLES[0];

  const fitResult = calculateRoleFit(role, skills);

  res.json({
    skills,
    roleFit: fitResult,
    targetRole: role,
  });
});

app.post('/api/user-skills', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { skills: updatedSkillsList } = req.body;

  if (!Array.isArray(updatedSkillsList)) {
    return res.status(400).json({ error: 'Skills must be an array' });
  }

  const existingSkills = db.userSkills[userId] || [];
  const skillMap = new Map<string, any>();
  existingSkills.forEach((s) => skillMap.set(s.skill.toLowerCase(), s));

  updatedSkillsList.forEach((incoming: any) => {
    const key = incoming.skill.toLowerCase();
    const prev = skillMap.get(key);
    skillMap.set(key, {
      skill: incoming.skill,
      level: Math.min(Math.max(Number(incoming.level), 0), 1),
      confidence: Math.min(Math.max(Number(incoming.confidence || 0.6), 0), 1),
      source: incoming.source || (prev ? prev.source : 'self_assessment'),
      lastUpdated: new Date().toISOString(),
    });
  });

  db.userSkills[userId] = Array.from(skillMap.values());
  saveDB();

  const goal = db.careerGoals[userId] || { targetRoleId: 'role-frontend', targetRoleTitle: 'Frontend Developer' };
  const role = INITIAL_ROLES.find((r) => r.id === goal.targetRoleId) || INITIAL_ROLES[0];
  const fitResult = calculateRoleFit(role, db.userSkills[userId]);

  res.json({
    skills: db.userSkills[userId],
    roleFit: fitResult,
  });
});

// ---------------------------------------------------------------------------
// 4. Role Assessment & Adaptive Skill Testing
// ---------------------------------------------------------------------------

// A. 10 Questions for Target Role
app.get('/api/assessments/role-questions', (req: Request, res: Response) => {
  const roleIdParam = (req.query.roleId as string) || '';
  const roleTitleParam = (req.query.roleTitle as string) || '';

  let matchedRoleId = 'role-frontend';
  if (roleIdParam && ROLE_QUESTIONS[roleIdParam]) {
    matchedRoleId = roleIdParam;
  } else if (roleTitleParam) {
    const role = INITIAL_ROLES.find(
      (r) =>
        r.title.toLowerCase() === roleTitleParam.toLowerCase() ||
        r.slug.toLowerCase() === roleTitleParam.toLowerCase().replace(/\s+/g, '-')
    );
    if (role && ROLE_QUESTIONS[role.id]) {
      matchedRoleId = role.id;
    }
  }

  const role = INITIAL_ROLES.find((r) => r.id === matchedRoleId) || INITIAL_ROLES[0];
  const questions = ROLE_QUESTIONS[matchedRoleId] || ROLE_QUESTIONS['role-frontend'];

  res.json({
    roleId: role.id,
    roleTitle: role.title,
    totalQuestions: questions.length,
    questions,
  });
});

// B. Submit 10 Answers for Role -> Calculate Score -> Skill Scores -> Weak Skills -> What to Study
app.post('/api/assessments/role-submit', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { roleId, roleTitle, answers, durationSeconds } = req.body;

  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: 'No answers provided' });
  }

  const role = INITIAL_ROLES.find((r) => r.id === roleId || r.title === roleTitle) || INITIAL_ROLES[0];

  const totalQuestions = answers.length;
  let correctCount = 0;
  const skillBuckets: Record<string, { total: number; correct: number }> = {};

  answers.forEach((ans: any) => {
    const isCorrect = Boolean(ans.isCorrect);
    if (isCorrect) correctCount++;

    const sk = ans.skill || 'General';
    if (!skillBuckets[sk]) {
      skillBuckets[sk] = { total: 0, correct: 0 };
    }
    skillBuckets[sk].total += 1;
    if (isCorrect) {
      skillBuckets[sk].correct += 1;
    }
  });

  const overallScore = Math.round((correctCount / totalQuestions) * 100);

  const skillScores = Object.entries(skillBuckets).map(([skill, data]) => {
    const percentage = Math.round((data.correct / data.total) * 100);
    const status = percentage >= 80 ? 'Strong' : percentage >= 50 ? 'Needs Attention' : 'Weak';
    return {
      skill,
      total: data.total,
      correct: data.correct,
      percentage,
      status: status as 'Strong' | 'Needs Attention' | 'Weak',
    };
  });

  const weakSkills = skillScores
    .filter((s) => s.percentage < 70)
    .sort((a, b) => a.percentage - b.percentage)
    .map((s) => s.skill);

  const targetWeakList = weakSkills.length > 0 ? weakSkills : [skillScores[0]?.skill || role.skills[0]?.skill || 'Core Concepts'];

  const whatToStudy = targetWeakList.map((skillName) => {
    const guide = SKILL_STUDY_GUIDES[skillName];
    if (guide) return guide;
    return {
      skill: skillName,
      description: `Targeted proficiency in ${skillName} required for ${role.title}.`,
      topics: [
        `Core principles and paradigms of ${skillName}`,
        `Practical exercises and real-world implementation patterns`,
        `Debugging, edge cases, and performance optimizations`,
      ],
      resources: [
        { title: `${skillName} Official Documentation`, type: 'documentation', url: 'https://developer.mozilla.org', platform: 'Official Docs' },
      ],
      recommendedAction: `Complete 3 hands-on practical exercises focusing on ${skillName}.`,
    };
  });

  // Save selected role to user's career goal
  db.careerGoals[userId] = {
    targetRoleId: role.id,
    targetRoleTitle: role.title,
    targetTimelineMonths: 6,
    savedAt: new Date().toISOString(),
  };

  // Update user's skill vector in DB
  const userSkills = db.userSkills[userId] || [];
  skillScores.forEach((item) => {
    const normalizedScore = item.percentage / 100;
    const existing = userSkills.find((s) => s.skill.toLowerCase() === item.skill.toLowerCase());
    if (existing) {
      existing.level = Math.min(1.0, Math.max(0.15, Number(((existing.level * 0.4) + (normalizedScore * 0.6)).toFixed(2))));
      existing.confidence = Math.min(1.0, Number((existing.confidence + 0.15).toFixed(2)));
      existing.source = 'assessment';
      existing.lastUpdated = new Date().toISOString();
    } else {
      userSkills.push({
        skill: item.skill,
        level: Math.max(0.15, normalizedScore),
        confidence: 0.75,
        source: 'assessment',
        lastUpdated: new Date().toISOString(),
      });
    }
  });
  db.userSkills[userId] = userSkills;

  // Recalculate Career Fit Score
  const roleFit = calculateRoleFit(role, userSkills);

  // Record attempt in history
  db.assessmentAttempts.push({
    id: `attempt-${Date.now()}`,
    userId,
    skill: role.title,
    score: overallScore,
    confidence: 0.85,
    difficultyReached: 'easy',
    totalQuestions,
    correctCount,
    durationSeconds: durationSeconds || 180,
    date: new Date().toISOString(),
    answers,
  });

  saveDB();

  let readinessStatus = 'Developing';
  if (overallScore >= 90) readinessStatus = 'Career Ready / Strong Mastery';
  else if (overallScore >= 70) readinessStatus = 'Solid Foundation / Developing';
  else readinessStatus = 'Foundational Gaps Identified';

  res.json({
    roleId: role.id,
    roleTitle: role.title,
    overallScore,
    correctCount,
    totalQuestions,
    readinessStatus,
    skillScores,
    weakSkills: targetWeakList,
    whatToStudy,
    roleFit,
  });
});

// C. Create / Generate Learning Roadmap from Assessment Weak Skills
app.post('/api/roadmap/generate-from-assessment', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { roleId, roleTitle, weakSkills } = req.body;

  const role = INITIAL_ROLES.find((r) => r.id === roleId || r.title === roleTitle) || INITIAL_ROLES[0];
  const targetWeak: string[] = Array.isArray(weakSkills) && weakSkills.length > 0
    ? weakSkills
    : role.skills.map((s) => s.skill).slice(0, 3);

  const items: any[] = [];
  let stepOrder = 1;

  // Phase 1: Foundation & Urgent Weak Skills (Steps 1 to N)
  targetWeak.forEach((skillName) => {
    const guide = SKILL_STUDY_GUIDES[skillName];
    items.push({
      id: `step-${stepOrder}`,
      title: `Master ${skillName} Fundamentals & Core Syntax`,
      skill: skillName,
      description: guide
        ? guide.topics.slice(0, 2).join(' • ')
        : `Overcome critical foundational knowledge gaps in ${skillName}.`,
      difficulty: 'Beginner',
      estimatedHours: 12,
      prerequisites: stepOrder > 1 ? [items[stepOrder - 2].title] : ['Role Onboarding'],
      stepOrder,
      status: stepOrder === 1 ? 'available' : 'locked',
      progress: 0,
      resources: guide?.resources?.map((r) => ({
        title: r.title,
        url: r.url,
        type: r.type,
        duration: '6 Hours',
      })) || [
        { title: `${skillName} Official Documentation`, url: 'https://developer.mozilla.org', type: 'Documentation', duration: '6 Hours' },
      ],
    });
    stepOrder++;
  });

  // Phase 2: Core Engineering & Architecture for Other Role Skills
  const remainingRoleSkills = role.skills
    .map((s) => s.skill)
    .filter((s) => !targetWeak.includes(s));

  (remainingRoleSkills.length > 0 ? remainingRoleSkills : ['Application Architecture']).forEach((skillName) => {
    const guide = SKILL_STUDY_GUIDES[skillName];
    items.push({
      id: `step-${stepOrder}`,
      title: `Production ${skillName} Patterns & Best Practices`,
      skill: skillName,
      description: guide
        ? guide.topics.slice(0, 2).join(' • ')
        : `Implement scalable patterns and error resilience with ${skillName}.`,
      difficulty: 'Intermediate',
      estimatedHours: 16,
      prerequisites: [items[stepOrder - 2].title],
      stepOrder,
      status: 'locked',
      progress: 0,
      resources: guide?.resources?.map((r) => ({
        title: r.title,
        url: r.url,
        type: r.type,
        duration: '8 Hours',
      })) || [
        { title: `${skillName} Best Practices Guide`, url: 'https://github.com', type: 'Article', duration: '8 Hours' },
      ],
    });
    stepOrder++;
  });

  // Phase 3: Applied Capstone & Portfolio
  items.push({
    id: `step-${stepOrder}`,
    title: `${role.title} Portfolio Capstone Project`,
    skill: role.skills[0]?.skill || 'Software Engineering',
    description: `Build and deploy an end-to-end ${role.title} project integrating all required competencies.`,
    difficulty: 'Advanced',
    estimatedHours: 24,
    prerequisites: [items[stepOrder - 2].title],
    stepOrder,
    status: 'locked',
    progress: 0,
    resources: [
      { title: `${role.title} Capstone Specification`, url: 'https://github.com', type: 'Project', duration: '24 Hours' },
    ],
  });
  stepOrder++;

  // Phase 4: Mock Interview & Industry Readiness
  items.push({
    id: `step-${stepOrder}`,
    title: `${role.title} Technical & Behavioral Interview Prep`,
    skill: 'Interview Readiness',
    description: `Complete simulated AI technical interviews and refine system architecture articulation.`,
    difficulty: 'Advanced',
    estimatedHours: 10,
    prerequisites: [items[stepOrder - 2].title],
    stepOrder,
    status: 'locked',
    progress: 0,
    resources: [
      { title: `${role.title} High-Yield Interview Topics`, url: 'https://leetcode.com', type: 'Practice', duration: '10 Hours' },
    ],
  });

  const generatedRoadmap = {
    id: `roadmap-${userId}-${Date.now()}`,
    userId,
    targetRole: role.title,
    overallProgress: 0,
    lastUpdated: new Date().toISOString(),
    items,
  };

  db.roadmaps[userId] = generatedRoadmap;
  saveDB();

  res.json({
    success: true,
    roadmap: generatedRoadmap,
    message: `Generated customized ${items.length}-step roadmap for ${role.title}!`,
  });
});

app.get('/api/assessments/questions', (req: Request, res: Response) => {
  const skill = (req.query.skill as string) || 'JavaScript';
  const difficulty = (req.query.difficulty as string) || 'easy';

  let filtered = INITIAL_QUESTIONS.filter(
    (q) => q.skill.toLowerCase() === skill.toLowerCase() && q.difficulty === difficulty
  );

  if (filtered.length === 0) {
    filtered = INITIAL_QUESTIONS.filter((q) => q.skill.toLowerCase() === skill.toLowerCase());
  }

  if (filtered.length === 0) {
    // Fallback to all questions if none match
    filtered = INITIAL_QUESTIONS;
  }

  res.json({ questions: filtered });
});

app.post('/api/assessments/submit', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { skill, answers, durationSeconds } = req.body;

  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: 'No answers provided' });
  }

  let correctCount = 0;
  let weightedPoints = 0;
  let maxPossiblePoints = 0;
  let highestDifficultyReached = 'easy';

  answers.forEach((ans: any) => {
    const diffWeight = ans.difficulty === 'hard' ? 3 : ans.difficulty === 'medium' ? 2 : 1;
    maxPossiblePoints += diffWeight;
    if (ans.isCorrect) {
      correctCount++;
      weightedPoints += diffWeight;
      highestDifficultyReached = ans.difficulty;
    }
  });

  const normalizedScore = maxPossiblePoints > 0 ? Math.round((weightedPoints / maxPossiblePoints) * 100) : 50;
  const confidence = Math.min(0.5 + (answers.length * 0.1), 0.95);

  const attempt = {
    id: `attempt-${Date.now()}`,
    userId,
    skill,
    score: normalizedScore,
    confidence,
    difficultyReached: highestDifficultyReached,
    totalQuestions: answers.length,
    correctCount,
    durationSeconds: durationSeconds || 120,
    date: new Date().toISOString(),
    answers,
  };

  db.assessmentAttempts.push(attempt);

  // Recalculate User Skill Vector
  const userSkills = db.userSkills[userId] || [];
  const existingSkill = userSkills.find((s) => s.skill.toLowerCase() === skill.toLowerCase());
  const currentLevel = existingSkill ? existingSkill.level : 0.2;
  const currentConfidence = existingSkill ? existingSkill.confidence : 0.5;

  const { newLevel, newConfidence } = calculateUpdatedSkillScore(
    currentLevel,
    currentConfidence,
    normalizedScore,
    0.45 // assessment has significant weight
  );

  if (existingSkill) {
    existingSkill.level = newLevel;
    existingSkill.confidence = newConfidence;
    existingSkill.source = 'assessment';
    existingSkill.lastUpdated = new Date().toISOString();
  } else {
    userSkills.push({
      skill,
      level: newLevel,
      confidence: newConfidence,
      source: 'assessment',
      lastUpdated: new Date().toISOString(),
    });
  }
  db.userSkills[userId] = userSkills;

  saveDB();

  // Recalculate Role Fit
  const goal = db.careerGoals[userId] || { targetRoleId: 'role-frontend', targetRoleTitle: 'Frontend Developer' };
  const role = INITIAL_ROLES.find((r) => r.id === goal.targetRoleId) || INITIAL_ROLES[0];
  const fitResult = calculateRoleFit(role, userSkills);

  res.json({
    attempt,
    updatedSkill: { skill, level: newLevel, confidence: newConfidence },
    roleFit: fitResult,
  });
});

// ---------------------------------------------------------------------------
// 5. Personalized Learning Roadmap & Progress
// ---------------------------------------------------------------------------
app.get('/api/roadmap', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const roadmap = db.roadmaps[userId] || {
    id: `roadmap-${userId}`,
    userId,
    targetRole: 'Frontend Developer',
    overallProgress: 32,
    lastUpdated: new Date().toISOString(),
    items: [],
  };
  res.json({ roadmap });
});

app.patch('/api/roadmap/item/:itemId', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { itemId } = req.params;
  const { status, progress } = req.body;

  const roadmap = db.roadmaps[userId];
  if (!roadmap) {
    return res.status(404).json({ error: 'Roadmap not found' });
  }

  const itemIndex = roadmap.items.findIndex((it) => it.id === itemId);
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Roadmap item not found' });
  }

  const item = roadmap.items[itemIndex];
  if (status) item.status = status;
  if (typeof progress === 'number') item.progress = progress;

  // If completed, unlock next step and update skill estimate
  if (status === 'completed' || progress === 100) {
    item.status = 'completed';
    item.progress = 100;

    // Unlock subsequent item if locked
    if (itemIndex + 1 < roadmap.items.length) {
      if (roadmap.items[itemIndex + 1].status === 'locked') {
        roadmap.items[itemIndex + 1].status = 'available';
      }
    }

    // Boost the skill vector for this skill!
    const userSkills = db.userSkills[userId] || [];
    const skillObj = userSkills.find((s) => s.skill.toLowerCase() === item.skill.toLowerCase());
    if (skillObj) {
      skillObj.level = Math.min(1.0, Number((skillObj.level + 0.12).toFixed(2)));
      skillObj.confidence = Math.min(1.0, Number((skillObj.confidence + 0.05).toFixed(2)));
      skillObj.source = 'learning';
      skillObj.lastUpdated = new Date().toISOString();
    } else {
      userSkills.push({
        skill: item.skill,
        level: 0.35,
        confidence: 0.60,
        source: 'learning',
        lastUpdated: new Date().toISOString(),
      });
    }
    db.userSkills[userId] = userSkills;
  }

  // Recalculate roadmap overall progress
  const totalItems = roadmap.items.length;
  const completedCount = roadmap.items.filter((it) => it.status === 'completed').length;
  roadmap.overallProgress = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;
  roadmap.lastUpdated = new Date().toISOString();

  saveDB();

  // Recalculate Role Fit
  const goal = db.careerGoals[userId] || { targetRoleId: 'role-frontend', targetRoleTitle: 'Frontend Developer' };
  const role = INITIAL_ROLES.find((r) => r.id === goal.targetRoleId) || INITIAL_ROLES[0];
  const roleFit = calculateRoleFit(role, db.userSkills[userId] || []);

  res.json({
    roadmap,
    roleFit,
    userSkills: db.userSkills[userId],
  });
});

// ---------------------------------------------------------------------------
// 6. Learning Resources
// ---------------------------------------------------------------------------
app.get('/api/resources', (req: Request, res: Response) => {
  const { skill, type, difficulty } = req.query;
  let items = [...INITIAL_RESOURCES];

  if (skill) {
    items = items.filter((r) => r.skill.toLowerCase().includes((skill as string).toLowerCase()));
  }
  if (type) {
    items = items.filter((r) => r.type.toLowerCase() === (type as string).toLowerCase());
  }
  if (difficulty) {
    items = items.filter((r) => r.difficulty.toLowerCase() === (difficulty as string).toLowerCase());
  }

  res.json({ resources: items });
});

app.post('/api/learning/complete', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { resourceId, skill, hoursSpent } = req.body;

  const record = {
    id: `prog-${Date.now()}`,
    userId,
    resourceId: resourceId || 'custom',
    skill: skill || 'General',
    hoursSpent: Number(hoursSpent) || 2,
    isCompleted: true,
    completedAt: new Date().toISOString(),
  };

  db.learningProgress.push(record);

  // Update skill score
  const userSkills = db.userSkills[userId] || [];
  const found = userSkills.find((s) => s.skill.toLowerCase() === skill.toLowerCase());
  if (found) {
    found.level = Math.min(1.0, Number((found.level + 0.08).toFixed(2)));
    found.confidence = Math.min(1.0, Number((found.confidence + 0.04).toFixed(2)));
    found.source = 'learning';
    found.lastUpdated = new Date().toISOString();
  }
  db.userSkills[userId] = userSkills;

  saveDB();

  const goal = db.careerGoals[userId] || { targetRoleId: 'role-frontend', targetRoleTitle: 'Frontend Developer' };
  const role = INITIAL_ROLES.find((r) => r.id === goal.targetRoleId) || INITIAL_ROLES[0];
  const roleFit = calculateRoleFit(role, userSkills);

  res.json({ success: true, record, roleFit });
});

// ---------------------------------------------------------------------------
// 7. Projects
// ---------------------------------------------------------------------------
app.get('/api/projects/templates', (_req: Request, res: Response) => {
  res.json({ templates: INITIAL_PROJECTS });
});

app.get('/api/projects/user', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const list = db.userProjects.filter((p) => p.userId === userId);
  res.json({ projects: list });
});

app.post('/api/projects/start', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { projectId } = req.body;

  const template = INITIAL_PROJECTS.find((p) => p.id === projectId);
  if (!template) {
    return res.status(404).json({ error: 'Project template not found' });
  }

  const existing = db.userProjects.find((p) => p.userId === userId && p.projectId === projectId);
  if (existing) {
    return res.json({ project: existing });
  }

  const userProj = {
    id: `uproj-${Date.now()}`,
    userId,
    projectId: template.id,
    title: template.title,
    skills: template.skills,
    status: 'in_progress' as const,
    completedMilestones: [],
    startedAt: new Date().toISOString(),
  };

  db.userProjects.push(userProj);
  saveDB();
  res.status(201).json({ project: userProj });
});

app.post('/api/projects/milestone', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { projectId, milestoneId, completed } = req.body;

  const proj = db.userProjects.find((p) => p.userId === userId && p.projectId === projectId);
  if (!proj) {
    return res.status(404).json({ error: 'User project not found' });
  }

  if (completed) {
    if (!proj.completedMilestones.includes(milestoneId)) {
      proj.completedMilestones.push(milestoneId);
    }
  } else {
    proj.completedMilestones = proj.completedMilestones.filter((m) => m !== milestoneId);
  }

  const template = INITIAL_PROJECTS.find((t) => t.id === projectId);
  if (template && proj.completedMilestones.length === template.milestones.length) {
    proj.status = 'completed';
    proj.completedAt = new Date().toISOString();

    // Boost skills for completing the project
    const userSkills = db.userSkills[userId] || [];
    template.skills.forEach((s) => {
      const found = userSkills.find((us) => us.skill.toLowerCase() === s.toLowerCase());
      if (found) {
        found.level = Math.min(1.0, Number((found.level + 0.15).toFixed(2)));
        found.confidence = Math.min(1.0, Number((found.confidence + 0.08).toFixed(2)));
        found.source = 'project';
      }
    });
    db.userSkills[userId] = userSkills;
  }

  saveDB();
  res.json({ project: proj });
});

// ---------------------------------------------------------------------------
// 8. Gemini AI Endpoints
// ---------------------------------------------------------------------------

// A. AI Career Coach
app.post('/api/ai/coach', async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { message, persona = 'mentor', modelChoice = 'balanced' } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  const user = db.users.find((u) => u.id === userId);
  const goal = db.careerGoals[userId] || { targetRoleId: 'role-frontend', targetRoleTitle: 'Frontend Developer' };
  const role = INITIAL_ROLES.find((r) => r.id === goal.targetRoleId) || INITIAL_ROLES[0];
  const skills = db.userSkills[userId] || [];
  const fit = calculateRoleFit(role, skills);
  const roadmap = db.roadmaps[userId];

  let personaInstruction = 'You are the CareerAI Master Intelligence Coach, an elite technical mentor and career strategist for aspiring engineers and students.';
  if (persona === 'interviewer') {
    personaInstruction = 'You are a Senior Staff Interviewer at a Tier-1 tech company. You drill candidates on rigorous technical concepts, behavioral scenarios, and architecture trade-offs. You give direct, blunt, yet highly constructive feedback.';
  } else if (persona === 'strategist') {
    personaInstruction = 'You are a Principal Career & Hiring Strategist. You specialize in role positioning, resume keyword optimization, salary progression, and strategic skill acquisition to maximize hiring velocity.';
  } else if (persona === 'code_mentor') {
    personaInstruction = 'You are a Senior Software Architect and hands-on coding mentor. You love breaking down algorithms, React internals, asynchronous JavaScript, database schema designs, and concrete code snippets.';
  }

  const systemContext = `
${personaInstruction}

User Profile:
- Name: ${user?.name || 'Student'}
- Target Role: ${role.title} (${role.category})
- Current CareerAI Role Fit Score: ${fit.fitScore}% (Readiness: ${fit.readinessLevel})
- Top Skill Gaps: ${fit.topGaps.map((g) => `${g.skill}: ${g.yourLevel}% vs Required ${g.requiredLevel}% (${g.category} priority)`).join(', ')}
- Current Skills: ${skills.map((s) => `${s.skill}: ${(s.level * 100).toFixed(0)}% (Confidence: ${(s.confidence * 100).toFixed(0)}%)`).join(', ')}
- Active Roadmap Item: ${roadmap?.items?.find((i) => i.status === 'in_progress')?.title || 'None active'}

Guidelines:
1. Provide actionable, high-conviction advice. Explain the exact "why" and "how".
2. When answering why their score is low, reference specific required skills, importance weights, and gap math.
3. Suggest concrete code patterns, project milestones, or study concepts.
4. Keep the tone encouraging, professional, and rigorous.
5. Provide 2-3 short, relevant follow-up actions as a JSON array if helpful.
`;

  // Select model according to user choice:
  // fast -> gemini-3.1-flash-lite, general/balanced -> gemini-3.8-flash
  let modelName = 'gemini-3.8-flash';
  if (modelChoice === 'fast') {
    modelName = 'gemini-3.1-flash-lite';
  }

  try {
    // Multi-turn context: fetch previous conversation messages
    const previousMsgs = (db.aiChats[userId] || []).slice(-6).map((m) => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n\n');
    const combinedPrompt = previousMsgs
      ? `Previous Conversation Context:\n${previousMsgs}\n\nCurrent User Query:\n${message}`
      : message;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: combinedPrompt,
      config: {
        systemInstruction: systemContext,
        temperature: 0.7,
      },
    });

    const assistantText = response.text || "I've reviewed your current skill vector and role requirements. Let's tackle your top priority gaps step-by-step.";

    // Store in history
    if (!db.aiChats[userId]) db.aiChats[userId] = [];
    const userMsg = {
      id: `msg-${Date.now()}-u`,
      sender: 'user' as const,
      content: message,
      timestamp: new Date().toISOString(),
    };
    const botMsg = {
      id: `msg-${Date.now()}-a`,
      sender: 'assistant' as const,
      content: assistantText,
      timestamp: new Date().toISOString(),
      suggestedActions: [
        { label: 'Deep dive into ' + (fit.topGaps[0]?.skill || 'Core Skills'), action: 'deep_dive' },
        { label: 'Recommended practice project', action: 'suggest_project' },
        { label: 'Start adaptive assessment', action: 'take_quiz' },
      ],
    };

    db.aiChats[userId].push(userMsg, botMsg);
    saveDB();

    res.json({ reply: assistantText, message: botMsg });
  } catch (error: any) {
    console.error('Gemini Coach error:', error);
    res.status(500).json({ error: 'AI Mentor temporarily unavailable', details: error?.message });
  }
});

app.get('/api/ai/coach/history', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const history = db.aiChats[userId] || [];
  res.json({ history });
});

// B. Resume Analyzer
app.post('/api/ai/analyze-resume', async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { resumeText, fileName } = req.body;

  if (!resumeText || resumeText.length < 50) {
    return res.status(400).json({ error: 'Please provide valid resume content.' });
  }

  const goal = db.careerGoals[userId] || { targetRoleId: 'role-frontend', targetRoleTitle: 'Frontend Developer' };
  const role = INITIAL_ROLES.find((r) => r.id === goal.targetRoleId) || INITIAL_ROLES[0];

  const prompt = `
Analyze the following resume specifically for the target role: "${role.title}".
Extract the structured data and evaluate strengths, weaknesses, missing skills, and actionable improvements.
Resume Content:
"""
${resumeText}
"""
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            extractedData: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                email: { type: Type.STRING },
                skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                education: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      degree: { type: Type.STRING },
                      institution: { type: Type.STRING },
                      year: { type: Type.STRING },
                    },
                  },
                },
                experience: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      role: { type: Type.STRING },
                      company: { type: Type.STRING },
                      duration: { type: Type.STRING },
                      summary: { type: Type.STRING },
                    },
                  },
                },
                projects: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      tech: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                  },
                },
                certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['skills'],
            },
            roleFitSummary: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            relevantSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
            estimatedRoleScore: { type: Type.NUMBER },
          },
          required: ['extractedData', 'roleFitSummary', 'strengths', 'weaknesses', 'missingSkills', 'relevantSkills', 'improvements', 'estimatedRoleScore'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');

    // Save resume record
    const resumeRecord = {
      id: `resume-${Date.now()}`,
      userId,
      fileName: fileName || 'Uploaded_Resume.pdf',
      uploadedAt: new Date().toISOString(),
      extracted: parsed.extractedData,
      roleFitSummary: parsed.roleFitSummary,
      strengths: parsed.strengths || [],
      weaknesses: parsed.weaknesses || [],
      missingSkills: parsed.missingSkills || [],
      relevantSkills: parsed.relevantSkills || [],
      improvements: parsed.improvements || [],
      estimatedRoleScore: parsed.estimatedRoleScore || 65,
    };

    db.resumes.push(resumeRecord);

    // Update User Skills Vector with extracted skills
    const userSkills = db.userSkills[userId] || [];
    if (parsed.extractedData?.skills) {
      parsed.extractedData.skills.forEach((rawSkill: string) => {
        const trimmed = rawSkill.trim();
        const existing = userSkills.find((s) => s.skill.toLowerCase() === trimmed.toLowerCase());
        if (!existing) {
          userSkills.push({
            skill: trimmed,
            level: 0.50,
            confidence: 0.60,
            source: 'resume',
            lastUpdated: new Date().toISOString(),
          });
        }
      });
      db.userSkills[userId] = userSkills;
    }

    saveDB();

    res.json({ analysis: resumeRecord });
  } catch (err: any) {
    console.error('Resume Analysis error:', err);
    res.status(500).json({ error: 'Failed to analyze resume', details: err?.message });
  }
});

// C. Resume vs Job Matching
app.post('/api/ai/match-job', async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { resumeText, jobDescription, jobTitle, company } = req.body;

  if (!resumeText || !jobDescription) {
    return res.status(400).json({ error: 'Both resume content and job description are required.' });
  }

  const prompt = `
Compare this candidate's resume with the target job description.
Job Title: ${jobTitle || 'Target Role'}
Company: ${company || 'Target Employer'}

Job Description:
"""
${jobDescription}
"""

Candidate Resume:
"""
${resumeText}
"""

Calculate the Application Match Score (0 to 100). Note that this is strictly a skill-to-job matching score and not a guaranteed hiring probability.
Identify matched skills, missing skills, missing keywords, experience alignment evaluation, and tailored bullet-point resume improvement recommendations.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchScore: { type: Type.NUMBER },
            matchedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            experienceAlignment: { type: Type.STRING },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['matchScore', 'matchedSkills', 'missingSkills', 'keywords', 'experienceAlignment', 'improvements'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const result = {
      id: `match-${Date.now()}`,
      userId,
      jobTitle: jobTitle || 'Software Engineer',
      company: company || 'Enterprise Tech',
      matchScore: Math.min(Math.max(Math.round(parsed.matchScore || 65), 0), 100),
      matchedSkills: parsed.matchedSkills || [],
      missingSkills: parsed.missingSkills || [],
      keywords: parsed.keywords || [],
      experienceAlignment: parsed.experienceAlignment || 'Moderate alignment with core technical requirements.',
      improvements: parsed.improvements || [],
      disclaimer: 'This is an application-specific matching score and does not represent guaranteed hiring probability.',
      createdAt: new Date().toISOString(),
    };

    db.jobMatches.push(result);
    saveDB();

    res.json({ match: result });
  } catch (err: any) {
    console.error('Job Matching error:', err);
    res.status(500).json({ error: 'Failed to analyze job match', details: err?.message });
  }
});

// D. AI Mock Interview Generation & Evaluation
app.post('/api/ai/interview-question', async (req: Request, res: Response) => {
  const { roleTitle, difficulty, interviewType, questionIndex, previousAnswers } = req.body;

  const prompt = `
Generate interview question #${(questionIndex || 0) + 1} for a candidate interviewing for "${roleTitle || 'Frontend Developer'}".
Difficulty Level: ${difficulty || 'medium'}
Interview Category: ${interviewType || 'Technical'}
Previous questions/answers context: ${JSON.stringify(previousAnswers || [])}

Provide a realistic, domain-authentic interview question and expected evaluation rubrics.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            category: { type: Type.STRING },
            expectedKeyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['question', 'category'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      question: parsed.question,
      category: parsed.category || interviewType || 'Technical',
      expectedKeyPoints: parsed.expectedKeyPoints || [],
    });
  } catch (err: any) {
    console.error('Interview question error:', err);
    res.status(500).json({ error: 'Failed to generate question', details: err?.message });
  }
});

app.post('/api/ai/evaluate-interview-answer', async (req: Request, res: Response) => {
  const { roleTitle, question, userAnswer, category } = req.body;

  if (!userAnswer || userAnswer.trim().length < 5) {
    return res.status(400).json({ error: 'Please provide your answer.' });
  }

  const prompt = `
Evaluate this interview answer for the role of ${roleTitle || 'Frontend Developer'}.
Question (${category}): "${question}"
Candidate Answer: "${userAnswer}"

Score the answer across:
- technical accuracy (0 to 100)
- clarity (0 to 100)
- completeness (0 to 100)
- communication (0 to 100)
Provide constructive feedback and a high-caliber sample tip on how a senior engineer would answer.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            accuracyScore: { type: Type.NUMBER },
            clarityScore: { type: Type.NUMBER },
            completenessScore: { type: Type.NUMBER },
            communicationScore: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            sampleAnswerTip: { type: Type.STRING },
          },
          required: ['accuracyScore', 'clarityScore', 'completenessScore', 'communicationScore', 'feedback', 'sampleAnswerTip'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ evaluation: parsed });
  } catch (err: any) {
    console.error('Interview evaluation error:', err);
    res.status(500).json({ error: 'Failed to evaluate answer', details: err?.message });
  }
});

app.post('/api/ai/final-interview-report', async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { roleTitle, interviewType, qaPairs } = req.body;

  const prompt = `
Generate a comprehensive final interview performance report for a mock interview:
Role: ${roleTitle}
Type: ${interviewType}
Questions and Evaluations:
${JSON.stringify(qaPairs)}

Provide:
- overall score (0 to 100)
- technical score
- behavioral score
- communication score
- project score
- key strengths (3-5 items)
- areas to improve (3-5 items)
- executive summary paragraph
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.NUMBER },
            technicalScore: { type: Type.NUMBER },
            behavioralScore: { type: Type.NUMBER },
            communicationScore: { type: Type.NUMBER },
            projectScore: { type: Type.NUMBER },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            areasToImprove: { type: Type.ARRAY, items: { type: Type.STRING } },
            executiveSummary: { type: Type.STRING },
          },
          required: ['overallScore', 'technicalScore', 'behavioralScore', 'communicationScore', 'projectScore', 'strengths', 'areasToImprove', 'executiveSummary'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const report = {
      id: `report-${Date.now()}`,
      userId,
      roleTitle,
      interviewType,
      ...parsed,
      completedAt: new Date().toISOString(),
    };

    // Store interview in db
    db.interviews.push({
      id: `interview-${Date.now()}`,
      userId,
      roleTitle,
      interviewType,
      difficulty: 'medium',
      status: 'completed',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      questions: qaPairs || [],
      report,
    });
    saveDB();

    res.json({ report });
  } catch (err: any) {
    console.error('Final interview report error:', err);
    res.status(500).json({ error: 'Failed to generate final report', details: err?.message });
  }
});

// E. Analytics Dashboard Aggregates
app.get('/api/analytics', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const goal = db.careerGoals[userId] || { targetRoleId: 'role-frontend', targetRoleTitle: 'Frontend Developer' };
  const role = INITIAL_ROLES.find((r) => r.id === goal.targetRoleId) || INITIAL_ROLES[0];
  const skills = db.userSkills[userId] || [];
  const fit = calculateRoleFit(role, skills);
  const roadmap = db.roadmaps[userId];

  // Generate historical trends
  const careerMatchHistory = [
    { date: 'Week 1', fitScore: Math.max(20, fit.fitScore - 25) },
    { date: 'Week 2', fitScore: Math.max(30, fit.fitScore - 18) },
    { date: 'Week 3', fitScore: Math.max(40, fit.fitScore - 10) },
    { date: 'Week 4', fitScore: Math.max(48, fit.fitScore - 5) },
    { date: 'Current', fitScore: fit.fitScore },
  ];

  const skillGrowth = skills.map((s) => ({
    skill: s.skill,
    current: Math.round(s.level * 100),
    required: Math.round((role.skills.find((rs) => rs.skill.toLowerCase() === s.skill.toLowerCase())?.requiredLevel || 0.7) * 100),
  }));

  const weeklyLearningHours = [
    { day: 'Mon', hours: 2.5 },
    { day: 'Tue', hours: 3.0 },
    { day: 'Wed', hours: 1.5 },
    { day: 'Thu', hours: 4.0 },
    { day: 'Fri', hours: 3.5 },
    { day: 'Sat', hours: 5.0 },
    { day: 'Sun', hours: 2.0 },
  ];

  res.json({
    careerMatchHistory,
    skillGrowth,
    weeklyLearningHours,
    fitScore: fit.fitScore,
    roadmapProgress: roadmap?.overallProgress || 0,
    totalSkillsTracked: skills.length,
    activeProjectsCount: db.userProjects.filter((p) => p.userId === userId && p.status === 'in_progress').length,
    completedAssessmentsCount: db.assessmentAttempts.filter((a) => a.userId === userId).length,
  });
});

// ---------------------------------------------------------------------------
// Vite Dev Server / Static Production Mounting
// ---------------------------------------------------------------------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CareerAI Platform full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
