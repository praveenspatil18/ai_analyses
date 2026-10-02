import { CareerRole, UserSkill, CareerFitResult, SkillMatchRow, SkillGapCategory } from '../types';

/**
 * Calculates CareerAI Role Fit Score and detailed skill breakdown
 * based on role skills, user skills, importance weights, and gap analysis.
 */
export function calculateRoleFit(
  role: CareerRole,
  userSkills: Array<{ skill: string; level: number; [key: string]: any }>
): CareerFitResult {
  if (!role || !role.skills || role.skills.length === 0) {
    return {
      roleTitle: role?.title || 'Unknown Role',
      fitScore: 0,
      totalSkills: 0,
      matchedSkillsCount: 0,
      skillRows: [],
      topGaps: [],
      readinessLevel: 'Beginning',
    };
  }

  // Create lookup map for user skills
  const skillMap = new Map<string, any>();
  userSkills.forEach((s) => {
    skillMap.set(s.skill.toLowerCase().trim(), s);
  });

  let totalWeight = 0;
  let weightedFulfillmentSum = 0;
  const rows: SkillMatchRow[] = [];

  role.skills.forEach((rs) => {
    const userSkill = skillMap.get(rs.skill.toLowerCase().trim());
    const currentFloat = userSkill ? userSkill.level : 0.0;
    const reqFloat = rs.requiredLevel;
    const weight = rs.importanceWeight;

    totalWeight += weight;

    // Fulfillment ratio for this skill, capped at 1.0 (100% of requirement)
    const fulfillment = Math.min(currentFloat / Math.max(reqFloat, 0.01), 1.0);
    weightedFulfillmentSum += fulfillment * weight;

    const gapFloat = Math.max(reqFloat - currentFloat, 0);
    const priorityScore = gapFloat * weight;

    // Status classification
    let status: 'Strong' | 'Near Target' | 'Gap' = 'Gap';
    if (currentFloat >= reqFloat) {
      status = 'Strong';
    } else if (currentFloat >= reqFloat * 0.8) {
      status = 'Near Target';
    } else {
      status = 'Gap';
    }

    // Category classification by priority impact
    let category: SkillGapCategory = 'Low';
    if (status === 'Strong') {
      category = 'Strong';
    } else if (priorityScore >= 0.15) {
      category = 'Critical';
    } else if (priorityScore >= 0.08) {
      category = 'High';
    } else if (priorityScore >= 0.03) {
      category = 'Medium';
    } else {
      category = 'Low';
    }

    rows.push({
      skill: rs.skill,
      yourLevel: Math.round(currentFloat * 100),
      requiredLevel: Math.round(reqFloat * 100),
      gap: Math.round(gapFloat * 100),
      weight: Math.round(weight * 100),
      status,
      category,
      priorityScore: Number(priorityScore.toFixed(4)),
    });
  });

  const normalizedFitScore = totalWeight > 0 ? Math.round((weightedFulfillmentSum / totalWeight) * 100) : 0;

  // Sort gap rows by priority impact descending
  const sortedGaps = [...rows]
    .filter((r) => r.status !== 'Strong')
    .sort((a, b) => b.priorityScore - a.priorityScore);

  let readinessLevel: 'Beginning' | 'Developing' | 'Career Ready' | 'Advanced' = 'Beginning';
  if (normalizedFitScore >= 85) readinessLevel = 'Advanced';
  else if (normalizedFitScore >= 70) readinessLevel = 'Career Ready';
  else if (normalizedFitScore >= 45) readinessLevel = 'Developing';

  return {
    roleTitle: role.title,
    fitScore: normalizedFitScore,
    totalSkills: role.skills.length,
    matchedSkillsCount: rows.filter((r) => r.status === 'Strong').length,
    skillRows: rows,
    topGaps: sortedGaps,
    readinessLevel,
  };
}

/**
 * Adaptive Difficulty Progression Logic
 */
export function getNextDifficulty(
  currentDifficulty: 'easy' | 'medium' | 'hard',
  isCorrect: boolean
): 'easy' | 'medium' | 'hard' {
  if (isCorrect) {
    if (currentDifficulty === 'easy') return 'medium';
    if (currentDifficulty === 'medium') return 'hard';
    return 'hard';
  } else {
    if (currentDifficulty === 'hard') return 'medium';
    if (currentDifficulty === 'medium') return 'easy';
    return 'easy';
  }
}

/**
 * Calculate updated skill level & confidence after learning or assessment
 */
export function calculateUpdatedSkillScore(
  currentLevel: number,
  currentConfidence: number,
  newScore: number, // 0 to 100
  sourceWeight: number = 0.4
): { newLevel: number; newConfidence: number } {
  const normalizedNewScore = Math.min(Math.max(newScore / 100, 0), 1.0);
  
  // Exponential moving average blend weighted by confidence
  const blendedLevel = currentLevel * (1 - sourceWeight) + normalizedNewScore * sourceWeight;
  const updatedConfidence = Math.min(1.0, currentConfidence + 0.1);

  return {
    newLevel: Number(blendedLevel.toFixed(2)),
    newConfidence: Number(updatedConfidence.toFixed(2)),
  };
}
