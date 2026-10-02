-- Seed Data for CareerAI
-- Roles
INSERT INTO roles (id, title, slug, category, description, prerequisites, recommended_projects, interview_topics)
VALUES
('a1111111-1111-1111-1111-111111111111', 'Frontend Developer', 'frontend-developer', 'Software Engineering', 'Builds user-facing web applications using modern JavaScript/TypeScript, UI frameworks, responsive design, and state management.', ARRAY['Basic Computer Science', 'Web fundamentals'], ARRAY['Portfolio Website', 'E-commerce Storefront', 'Task Board Kanban'], ARRAY['DOM Manipulation', 'React Lifecycle & Hooks', 'CSS Flexbox/Grid', 'Asynchronous JS', 'Web Performance']),
('a2222222-2222-2222-2222-222222222222', 'Backend Developer', 'backend-developer', 'Software Engineering', 'Architects scalable APIs, databases, microservices, authentication systems, and server infrastructure.', ARRAY['Data Structures', 'Networking basics'], ARRAY['RESTful API with Auth', 'Distributed Task Queue', 'Real-time Chat Engine'], ARRAY['SQL indexing', 'REST vs GraphQL', 'Caching with Redis', 'Concurrency & Threads', 'Database migrations']),
('a3333333-3333-3333-3333-333333333333', 'Full Stack Developer', 'full-stack-developer', 'Software Engineering', 'Bridges client interfaces and server infrastructure, developing end-to-end features and cloud deployments.', ARRAY['Web fundamentals', 'Database basics'], ARRAY['SaaS Collaboration Platform', 'Social Feed with Real-time Updates'], ARRAY['System Design', 'State Synchronization', 'API Contracts', 'JWT Auth Flows']),
('a4444444-4444-4444-4444-444444444444', 'Data Analyst', 'data-analyst', 'Data & Analytics', 'Transforms raw datasets into business intelligence, reports, executive dashboards, and actionable insights.', ARRAY['Basic Statistics', 'Spreadsheets'], ARRAY['Sales Performance Dashboard', 'Customer Churn Analysis'], ARRAY['SQL Window Functions', 'Data Cleaning', 'A/B Testing Metrics', 'Visualization best practices']),
('a5555555-5555-5555-5555-555555555555', 'Data Scientist', 'data-scientist', 'AI & Data Science', 'Applies statistical modeling, exploratory analysis, and machine learning to extract patterns from complex datasets.', ARRAY['Linear Algebra', 'Multivariate Calculus', 'Probability'], ARRAY['Predictive Maintenance Model', 'Customer Segmentation Engine'], ARRAY['Feature Engineering', 'Bias-Variance Tradeoff', 'Model Evaluation Metrics', 'Hypothesis Testing']),
('a6666666-6666-6666-6666-666666666666', 'Machine Learning Engineer', 'machine-learning-engineer', 'AI & Data Science', 'Productionizes machine learning models, builds training pipelines, and deploys inference engines at scale.', ARRAY['Python mastery', 'Deep Learning fundamentals'], ARRAY['Real-time Object Detection API', 'LLM Retrieval-Augmented Generator'], ARRAY['Model Quantization', 'MLOps Pipelines', 'Distributed Training', 'Latency Optimization']),
('a7777777-7777-7777-7777-777777777777', 'Cloud Engineer', 'cloud-engineer', 'Cloud & Infrastructure', 'Designs and maintains highly available, secure, cost-effective infrastructure on cloud providers.', ARRAY['Linux fundamentals', 'Networking'], ARRAY['Multi-region Terraform Infrastructure', 'Serverless Microservices Architecture'], ARRAY['VPC & Subnets', 'IAM Least Privilege', 'Kubernetes Architecture', 'Disaster Recovery']),
('a8888888-8888-8888-8888-888888888888', 'DevOps Engineer', 'devops-engineer', 'Cloud & Infrastructure', 'Automates CI/CD delivery pipelines, manages container orchestration, and monitors infrastructure observability.', ARRAY['Linux', 'Git', 'Scripting'], ARRAY['GitOps Pipeline with ArgoCD', 'Prometheus & Grafana Observability Suite'], ARRAY['Docker Container Internals', 'Zero-downtime Deployments', 'Infrastructure as Code', 'Incident Response']),
('a9999999-9999-9999-9999-999999999999', 'Cybersecurity Analyst', 'cybersecurity-analyst', 'Security', 'Protects systems, networks, and data from cyber threats through monitoring, threat hunting, and vulnerability remediation.', ARRAY['Networking', 'Operating Systems'], ARRAY['Automated Vulnerability Scanner', 'SOC Incident Playbook Automation'], ARRAY['OWASP Top 10', 'SIEM log analysis', 'Cryptography basics', 'Network packet inspection']),
('b1111111-1111-1111-1111-111111111111', 'UI/UX Designer', 'ui-ux-designer', 'Design & Product', 'Creates intuitive, accessible, and aesthetically engaging digital experiences through research, wireframing, and design systems.', ARRAY['Design principles', 'User research basics'], ARRAY['Mobile Banking Redesign', 'Design System Component Library'], ARRAY['User Journey Mapping', 'Heuristic Evaluation', 'Design Tokens', 'Accessibility Standards'])
ON CONFLICT (title) DO NOTHING;

-- Role Skills (Required level 0.0 - 1.0, importance weight 0.0 - 1.0)
-- Frontend Developer
INSERT INTO role_skills (role_id, skill_name, required_level, importance_weight) VALUES
('a1111111-1111-1111-1111-111111111111', 'JavaScript', 0.85, 0.30),
('a1111111-1111-1111-1111-111111111111', 'React', 0.75, 0.25),
('a1111111-1111-1111-1111-111111111111', 'CSS', 0.75, 0.15),
('a1111111-1111-1111-1111-111111111111', 'HTML', 0.70, 0.15),
('a1111111-1111-1111-1111-111111111111', 'Git', 0.70, 0.15),
('a1111111-1111-1111-1111-111111111111', 'TypeScript', 0.70, 0.20),
-- Backend Developer
('a2222222-2222-2222-2222-222222222222', 'Node.js', 0.85, 0.25),
('a2222222-2222-2222-2222-222222222222', 'SQL & Databases', 0.80, 0.25),
('a2222222-2222-2222-2222-222222222222', 'API Design & REST', 0.80, 0.20),
('a2222222-2222-2222-2222-222222222222', 'Authentication & Security', 0.75, 0.15),
('a2222222-2222-2222-2222-222222222222', 'Git', 0.70, 0.15),
-- Full Stack Developer
('a3333333-3333-3333-3333-333333333333', 'JavaScript / TypeScript', 0.85, 0.25),
('a3333333-3333-3333-3333-333333333333', 'React', 0.75, 0.20),
('a3333333-3333-3333-3333-333333333333', 'Node.js', 0.75, 0.20),
('a3333333-3333-3333-3333-333333333333', 'SQL & Databases', 0.70, 0.20),
('a3333333-3333-3333-3333-333333333333', 'Git & CI/CD', 0.70, 0.15);
