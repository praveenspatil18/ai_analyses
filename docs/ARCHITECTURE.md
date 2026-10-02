# CareerAI Architecture & Intelligence Loop Documentation

CareerAI is an AI-powered Career Intelligence and Personalized Learning Platform designed for university students, self-taught developers, and career switchers aiming for engineering and tech careers.

## 1. The Core Intelligence Loop

```
PROFILE
   ↓
CAREER GOAL (e.g. Frontend Developer)
   ↓
CURRENT SKILLS (Self / Resume / Assessment)
   ↓
SKILL VECTOR (level 0.0 - 1.0, confidence 0.0 - 1.0)
   ↓
CAREERAI ROLE FIT SCORE (Skill weights & fulfillment)
   ↓
SKILL GAP ANALYSIS (Critical, High, Medium, Low)
   ↓
PERSONALIZED ROADMAP (Sequenced with prerequisites)
   ↓
LEARNING & PRACTICE (Curated documentation, courses, projects)
   ↓
PROGRESS
   ↓
REASSESSMENT (Adaptive testing & interview simulations)
   ↓
UPDATED SKILLS
   ↓
UPDATED ROLE FIT & ROADMAP RECALCULATION
```

## 2. Mathematical Formulations

### CareerAI Role Fit Score
For each skill required by the target role:
- $req_i$: Required skill level (0.0 to 1.0)
- $cur_i$: User current skill level in vector (0.0 to 1.0)
- $w_i$: Importance weight of the skill in the role
- $fulfillment_i = \min\left(1.0, \frac{cur_i}{\max(req_i, 0.01)}\right)$
- $gap_i = \max(req_i - cur_i, 0)$
- $priority\_score_i = gap_i \times w_i$

$$\text{Role Fit Score} = \text{round}\left(\frac{\sum_i fulfillment_i \times w_i}{\sum_i w_i} \times 100\right)$$

### Skill Status Classification:
- **Strong**: $cur_i \ge req_i$
- **Near Target**: $cur_i \ge 0.8 \times req_i$
- **Gap**: $cur_i < 0.8 \times req_i$

### Skill Gap Priority Categories:
- **Critical**: $priority\_score_i \ge 0.15$
- **High**: $priority\_score_i \ge 0.08$
- **Medium**: $priority\_score_i \ge 0.03$
- **Low**: $priority\_score_i < 0.03$
- **Strong**: $cur_i \ge req_i$

### Adaptive Assessment Difficulty Transition:
- Correct answer $\rightarrow$ Difficulty escalates: `easy` $\rightarrow$ `medium` $\rightarrow$ `hard`
- Incorrect answer $\rightarrow$ Difficulty drops: `hard` $\rightarrow$ `medium` $\rightarrow$ `easy`

## 3. Database Architecture & Row-Level Security (RLS)

All database entities are specified in `supabase/migrations/001_careerai_schema.sql` and populated via `supabase/seed.sql`.
- **Profiles**: Isolated by `auth.uid() = user_id`.
- **User Skills & Goals**: Private to the authenticated user.
- **Roadmaps & Attempts**: Track individual user learning milestones.
- **Roles, Skills, & Questions**: Publicly readable catalogs.

## 4. Google Gemini AI Integrations
Server-side calls via `@google/genai` utilizing the `gemini-3.8-flash` model:
- **AI Career Coach**: Contextual real-time mentorship based on user skills, target role, and active gaps.
- **Resume Analyzer**: Structural parsing into skills, experience, education, strengths, weaknesses, and missing role competencies.
- **Resume vs Job Matcher**: Strict keyword, experience alignment, and missing requirement diagnostic.
- **Mock Interview Simulator**: Technical, behavioral, and architectural question generation and multi-dimensional scoring (accuracy, clarity, completeness, communication).
