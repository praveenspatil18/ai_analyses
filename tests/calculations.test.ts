import { calculateRoleFit, getNextDifficulty, calculateUpdatedSkillScore } from '../src/utils/calculations';
import { CareerRole, UserSkill } from '../src/types';

// Self-contained test suite runner
function describe(suiteName: string, fn: () => void) {
  console.log(`Running suite: ${suiteName}`);
  fn();
}

function test(testName: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${testName}`);
  } catch (err: any) {
    console.error(`  ✗ ${testName}: ${err.message}`);
    throw err;
  }
}

function expect(val: any) {
  return {
    toBe: (expected: any) => {
      if (val !== expected) throw new Error(`Expected ${expected} but received ${val}`);
    },
    toBeGreaterThan: (expected: any) => {
      if (!(val > expected)) throw new Error(`Expected ${val} > ${expected}`);
    },
    toBeLessThanOrEqual: (expected: any) => {
      if (!(val <= expected)) throw new Error(`Expected ${val} <= ${expected}`);
    },
  };
}

describe('CareerAI Math & Intelligence Calculations', () => {
  const mockRole: CareerRole = {
    id: 'role-test-frontend',
    title: 'Frontend Developer',
    slug: 'frontend-developer',
    category: 'Engineering',
    description: 'Test Frontend Role',
    prerequisites: ['HTML', 'CSS'],
    recommendedProjects: ['E-Commerce'],
    interviewTopics: ['React Hooks'],
    skills: [
      { skill: 'JavaScript', requiredLevel: 0.85, importanceWeight: 0.30 },
      { skill: 'React', requiredLevel: 0.75, importanceWeight: 0.25 },
      { skill: 'HTML', requiredLevel: 0.70, importanceWeight: 0.15 },
      { skill: 'CSS', requiredLevel: 0.75, importanceWeight: 0.15 },
      { skill: 'Git', requiredLevel: 0.70, importanceWeight: 0.15 },
    ],
  };

  test('calculates correct Role Fit score and status for user skills', () => {
    const userSkills: UserSkill[] = [
      { skill: 'HTML', level: 0.85, confidence: 0.8, source: 'self_assessment' },
      { skill: 'JavaScript', level: 0.45, confidence: 0.7, source: 'assessment' },
      { skill: 'React', level: 0.20, confidence: 0.5, source: 'learning' },
      { skill: 'Git', level: 0.60, confidence: 0.7, source: 'self_assessment' },
      { skill: 'CSS', level: 0.75, confidence: 0.8, source: 'self_assessment' },
    ];

    const result = calculateRoleFit(mockRole, userSkills);

    expect(result.roleTitle).toBe('Frontend Developer');
    expect(result.fitScore).toBeGreaterThan(0);
    expect(result.fitScore).toBeLessThanOrEqual(100);

    const htmlRow = result.skillRows.find((r) => r.skill === 'HTML');
    expect(htmlRow?.status).toBe('Strong');

    const jsRow = result.skillRows.find((r) => r.skill === 'JavaScript');
    expect(jsRow?.status).toBe('Gap');

    const gitRow = result.skillRows.find((r) => r.skill === 'Git');
    expect(gitRow?.status).toBe('Near Target');
  });

  test('handles adaptive difficulty transitions correctly', () => {
    expect(getNextDifficulty('easy', true)).toBe('medium');
    expect(getNextDifficulty('medium', true)).toBe('hard');
    expect(getNextDifficulty('hard', true)).toBe('hard');

    expect(getNextDifficulty('hard', false)).toBe('medium');
    expect(getNextDifficulty('medium', false)).toBe('easy');
    expect(getNextDifficulty('easy', false)).toBe('easy');
  });

  test('calculates updated skill score blending level and confidence', () => {
    const { newLevel, newConfidence } = calculateUpdatedSkillScore(0.5, 0.6, 90, 0.4);
    expect(newLevel).toBeGreaterThan(0.5);
    expect(newConfidence).toBeGreaterThan(0.6);
  });
});
