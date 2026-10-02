export type SkillSource =
  | 'self_assessment'
  | 'resume'
  | 'assessment'
  | 'learning'
  | 'project'
  | 'interview';

export type SkillGapCategory = 'Critical' | 'High' | 'Medium' | 'Low' | 'Strong';

export interface UserSkill {
  skill: string;
  level: number; // 0.0 to 1.0 (internal float)
  confidence: number; // 0.0 to 1.0
  source: SkillSource;
  lastUpdated?: string;
}

export interface RoleSkill {
  skill: string;
  requiredLevel: number; // 0.0 to 1.0
  importanceWeight: number; // 0.0 to 1.0
}

export interface CareerRole {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  skills: RoleSkill[];
  prerequisites: string[];
  recommendedProjects: string[];
  interviewTopics: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  education?: string;
  college?: string;
  degree?: string;
  graduationYear?: number;
  experienceLevel?: string;
  location?: string;
  preferredLanguage?: string;
  interests?: string[];
  bio?: string;
  onboardingCompleted?: boolean;
  createdAt?: string;
}

export interface CareerGoal {
  userId: string;
  targetRoleId: string;
  targetRoleTitle: string;
  targetTimelineMonths: number;
  preferredLocation?: string;
  interests?: string[];
  savedAt?: string;
}

export interface SkillMatchRow {
  skill: string;
  yourLevel: number; // 0 to 100%
  requiredLevel: number; // 0 to 100%
  gap: number; // 0 to 100%
  weight: number; // percentage weight
  status: 'Strong' | 'Near Target' | 'Gap';
  category: SkillGapCategory;
  priorityScore: number;
}

export interface CareerFitResult {
  roleTitle: string;
  fitScore: number; // 0 to 100%
  totalSkills: number;
  matchedSkillsCount: number;
  skillRows: SkillMatchRow[];
  topGaps: SkillMatchRow[];
  readinessLevel: 'Beginning' | 'Developing' | 'Career Ready' | 'Advanced';
}

export type AssessmentDifficulty = 'easy' | 'medium' | 'hard';

export interface AssessmentQuestion {
  id: string;
  skill: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: AssessmentDifficulty;
  explanation: string;
  roleId?: string;
  roleTitle?: string;
}

export interface RoleSkillScore {
  skill: string;
  total: number;
  correct: number;
  percentage: number;
  status: 'Strong' | 'Needs Attention' | 'Weak';
}

export interface WhatToStudyGuide {
  skill: string;
  description: string;
  topics: string[];
  resources: Array<{ title: string; type: string; url: string; platform: string }>;
  recommendedAction: string;
}

export interface RoleAssessmentResult {
  roleId: string;
  roleTitle: string;
  overallScore: number;
  correctCount: number;
  totalQuestions: number;
  readinessStatus: string;
  skillScores: RoleSkillScore[];
  weakSkills: string[];
  whatToStudy: WhatToStudyGuide[];
  roleFit?: CareerFitResult;
  generatedRoadmap?: Roadmap;
}

export interface AssessmentAnswerRecord {
  questionId: string;
  skill: string;
  difficulty: AssessmentDifficulty;
  selectedOption: number;
  isCorrect: boolean;
  timeSpentMs: number;
}

export interface AssessmentAttempt {
  id: string;
  userId: string;
  skill: string;
  score: number; // 0 to 100
  confidence: number; // 0.0 to 1.0
  difficultyReached: AssessmentDifficulty;
  totalQuestions: number;
  correctCount: number;
  durationSeconds: number;
  date: string;
  answers: AssessmentAnswerRecord[];
}

export type RoadmapItemStatus = 'locked' | 'available' | 'in_progress' | 'completed';

export interface RoadmapItemResource {
  title: string;
  url: string;
  type: string;
  duration?: string;
}

export interface RoadmapItem {
  id: string;
  title: string;
  skill: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedHours: number;
  prerequisites: string[];
  stepOrder: number;
  status: RoadmapItemStatus;
  progress: number; // 0 to 100%
  resources: RoadmapItemResource[];
}

export interface Roadmap {
  id: string;
  userId: string;
  targetRole: string;
  items: RoadmapItem[];
  overallProgress: number;
  lastUpdated: string;
}

export type ResourceType =
  | 'Video'
  | 'Course'
  | 'Documentation'
  | 'Article'
  | 'Practice'
  | 'Project';

export interface LearningResource {
  id: string;
  title: string;
  provider: string;
  url: string;
  skill: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  language: string;
  duration: string;
  type: ResourceType;
  rating?: number;
  isFree?: boolean;
}

export interface ProjectMilestone {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

export interface ProjectTemplate {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  skills: string[];
  estimatedTime: string;
  portfolioValue: string;
  requirements: string[];
  milestones: ProjectMilestone[];
}

export interface UserProject {
  id: string;
  projectId: string;
  title: string;
  skills: string[];
  status: 'not_started' | 'in_progress' | 'completed';
  completedMilestones: number[];
  notes?: string;
  githubUrl?: string;
  liveUrl?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface ResumeExtractedData {
  name?: string;
  email?: string;
  skills: string[];
  education: Array<{ degree?: string; institution?: string; year?: string }>;
  experience: Array<{ role?: string; company?: string; duration?: string; summary?: string }>;
  projects: Array<{ title?: string; description?: string; tech?: string[] }>;
  certifications: string[];
  links: string[];
}

export interface ResumeAnalysis {
  id: string;
  fileName: string;
  uploadedAt: string;
  extracted: ResumeExtractedData;
  roleFitSummary: string;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  relevantSkills: string[];
  improvements: string[];
  estimatedRoleScore?: number;
}

export interface ResumeJobMatchResult {
  id: string;
  jobTitle: string;
  company?: string;
  matchScore: number; // 0 to 100
  matchedSkills: string[];
  missingSkills: string[];
  keywords: string[];
  experienceAlignment: string;
  improvements: string[];
  disclaimer: string;
}

export interface InterviewEvaluation {
  accuracyScore: number; // 0 to 100
  clarityScore: number; // 0 to 100
  completenessScore: number; // 0 to 100
  communicationScore: number; // 0 to 100
  feedback: string;
  sampleAnswerTip: string;
}

export interface InterviewQuestionItem {
  id: string;
  order: number;
  question: string;
  category: 'Technical' | 'Behavioral' | 'Project' | 'HR';
  userAnswer?: string;
  evaluation?: InterviewEvaluation;
}

export interface InterviewReport {
  id: string;
  roleTitle: string;
  interviewType: string;
  overallScore: number;
  technicalScore: number;
  behavioralScore: number;
  communicationScore: number;
  projectScore: number;
  strengths: string[];
  areasToImprove: string[];
  executiveSummary: string;
  completedAt: string;
}

export interface AICoachMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedActions?: Array<{ label: string; action: string }>;
}
