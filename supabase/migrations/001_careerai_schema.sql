-- CareerAI Supabase PostgreSQL Schema with RLS and Indexes
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    avatar TEXT,
    education TEXT,
    college TEXT,
    degree TEXT,
    graduation_year INT,
    experience_level TEXT DEFAULT 'entry_level',
    location TEXT,
    preferred_language TEXT DEFAULT 'en',
    interests TEXT[],
    bio TEXT,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Skills Catalog
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Career Roles Catalog
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    prerequisites TEXT[],
    recommended_projects TEXT[],
    interview_topics TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Role Required Skills
CREATE TABLE IF NOT EXISTS role_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    required_level NUMERIC(4, 2) NOT NULL CHECK (required_level >= 0 AND required_level <= 1),
    importance_weight NUMERIC(4, 2) NOT NULL CHECK (importance_weight >= 0 AND importance_weight <= 1),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. User Career Goals
CREATE TABLE IF NOT EXISTS career_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    target_role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    target_role_title TEXT NOT NULL,
    target_timeline_months INT DEFAULT 6,
    target_salary_range TEXT,
    preferred_location TEXT,
    interests TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. User Skill Vector
CREATE TABLE IF NOT EXISTS user_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    level NUMERIC(4, 2) NOT NULL DEFAULT 0.1 CHECK (level >= 0 AND level <= 1),
    confidence NUMERIC(4, 2) NOT NULL DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
    source TEXT NOT NULL CHECK (source IN ('self_assessment', 'resume', 'assessment', 'learning', 'project', 'interview')),
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, skill_name)
);

-- 7. Assessment Catalog & Questions
CREATE TABLE IF NOT EXISTS assessment_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    skill_name TEXT NOT NULL,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer INT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    explanation TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Assessment Attempts
CREATE TABLE IF NOT EXISTS assessment_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    score NUMERIC(5, 2) NOT NULL,
    confidence NUMERIC(4, 2) NOT NULL,
    difficulty_reached TEXT NOT NULL,
    total_questions INT NOT NULL,
    correct_count INT NOT NULL,
    duration_seconds INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assessment_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID REFERENCES assessment_attempts(id) ON DELETE CASCADE,
    question_id UUID REFERENCES assessment_questions(id) ON DELETE CASCADE,
    selected_option INT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    difficulty TEXT NOT NULL,
    response_time_ms INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Roadmaps & Roadmap Items
CREATE TABLE IF NOT EXISTS roadmaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    role_title TEXT NOT NULL,
    total_items INT DEFAULT 0,
    completed_items INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roadmap_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    roadmap_id UUID REFERENCES roadmaps(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    skill_name TEXT NOT NULL,
    description TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    estimated_hours INT DEFAULT 10,
    prerequisites TEXT[],
    step_order INT NOT NULL,
    status TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'available', 'in_progress', 'completed')),
    progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    resources JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Learning Resources
CREATE TABLE IF NOT EXISTS learning_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    provider TEXT NOT NULL,
    url TEXT NOT NULL,
    skill_name TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    language TEXT DEFAULT 'English',
    duration TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Video', 'Course', 'Documentation', 'Article', 'Practice', 'Project')),
    rating NUMERIC(3, 1) DEFAULT 4.8,
    is_free BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Learning Progress
CREATE TABLE IF NOT EXISTS learning_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    resource_id UUID REFERENCES learning_resources(id) ON DELETE CASCADE,
    roadmap_item_id UUID REFERENCES roadmap_items(id) ON DELETE SET NULL,
    skill_name TEXT NOT NULL,
    hours_spent NUMERIC(5, 2) DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Project Recommendations & User Projects
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    skills TEXT[] NOT NULL,
    estimated_time TEXT NOT NULL,
    portfolio_value TEXT NOT NULL,
    requirements TEXT[] NOT NULL,
    milestones JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    completed_milestones INT[] DEFAULT '{}',
    repo_url TEXT,
    live_url TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 13. Resumes & Analyses
CREATE TABLE IF NOT EXISTS resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    raw_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resume_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    extracted_data JSONB NOT NULL,
    role_fit_summary TEXT,
    strengths TEXT[],
    weaknesses TEXT[],
    missing_skills TEXT[],
    relevant_skills TEXT[],
    improvements TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Job Descriptions & Matching
CREATE TABLE IF NOT EXISTS job_descriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    company TEXT,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resume_job_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
    job_id UUID REFERENCES job_descriptions(id) ON DELETE CASCADE,
    match_score NUMERIC(5, 2) NOT NULL,
    matched_skills TEXT[] NOT NULL,
    missing_skills TEXT[] NOT NULL,
    keywords TEXT[] NOT NULL,
    experience_alignment TEXT,
    improvements TEXT[] NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Interviews
CREATE TABLE IF NOT EXISTS interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role_title TEXT NOT NULL,
    interview_type TEXT NOT NULL CHECK (interview_type IN ('Technical', 'Behavioral', 'HR', 'Project', 'Mixed')),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS interview_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,
    question_order INT NOT NULL,
    question_text TEXT NOT NULL,
    category TEXT NOT NULL,
    user_answer TEXT,
    feedback JSONB,
    scores JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS interview_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interview_id UUID UNIQUE REFERENCES interviews(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    overall_score NUMERIC(5, 2) NOT NULL,
    technical_score NUMERIC(5, 2),
    behavioral_score NUMERIC(5, 2),
    communication_score NUMERIC(5, 2),
    project_score NUMERIC(5, 2),
    strengths TEXT[],
    areas_to_improve TEXT[],
    executive_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. AI Career Coach Conversations
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'Career Advisory',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant')),
    content TEXT NOT NULL,
    suggested_actions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all user-specific tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_job_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Public read access for catalogs
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read for roles" ON roles FOR SELECT USING (true);
CREATE POLICY "Public read for role_skills" ON role_skills FOR SELECT USING (true);
CREATE POLICY "Public read for skills" ON skills FOR SELECT USING (true);
CREATE POLICY "Public read for assessment_questions" ON assessment_questions FOR SELECT USING (true);
CREATE POLICY "Public read for learning_resources" ON learning_resources FOR SELECT USING (true);
CREATE POLICY "Public read for projects" ON projects FOR SELECT USING (true);

-- User Isolation Policies
CREATE POLICY "Users can manage own profile" ON profiles
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own skills" ON user_skills
    FOR ALL USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own career goals" ON career_goals
    FOR ALL USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own roadmaps" ON roadmaps
    FOR ALL USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own resumes" ON resumes
    FOR ALL USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own interviews" ON interviews
    FOR ALL USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own AI chats" ON ai_conversations
    FOR ALL USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
