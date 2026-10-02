export type SkillCompetencyStatus =
  | 'Strong'
  | 'Good'
  | 'Needs Improvement'
  | 'Weak'
  | 'Very Weak';

export function getCompetencyStatus(score: number): SkillCompetencyStatus {
  if (score >= 90) return 'Strong';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Needs Improvement';
  if (score >= 30) return 'Weak';
  return 'Very Weak';
}

export interface SkillScoreSummary {
  skill: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number; // 0 to 100
  status: SkillCompetencyStatus;
}

export interface StudyRecommendation {
  skill: string;
  score: number;
  status: SkillCompetencyStatus;
  title: string;
  reason: string;
  topicsToStudy: string[];
}

// Curated topics for every skill in every role
export const SKILL_STUDY_TOPICS: Record<string, string[]> = {
  // Data Science / Machine Learning / Data Analyst
  Python: ['Python syntax & data structures (lists, dicts)', 'Functions & scope', 'List comprehensions', 'Object-Oriented Programming basics'],
  SQL: ['SELECT & WHERE filtering', 'GROUP BY & HAVING aggregation', 'INNER / LEFT / RIGHT JOINs', 'Window functions (RANK, ROW_NUMBER)'],
  Statistics: ['Measures of central tendency (mean, median, mode)', 'Variance & standard deviation', 'Probability distributions', 'Hypothesis testing & p-values'],
  'Machine Learning': ['Supervised vs unsupervised learning', 'Regression vs classification', 'Train/test split & cross-validation', 'Model evaluation metrics (Accuracy, Precision, Recall)'],
  Pandas: ['Series and DataFrames creation', 'Filtering & conditional selections', 'Grouping & aggregations (.groupby)', 'Handling missing data (.fillna, .dropna)'],
  NumPy: ['Array indexing & slicing', 'Vectorized math operations', 'Broadcasting principles', 'Linear algebra functions (.dot, .linalg)'],
  'Data Visualization': ['Choosing the right chart type', 'Distribution plots (Histograms, Boxplots)', 'Correlation plots (Scatter, Heatmaps)', 'Dashboard design & visual hierarchy'],
  'Deep Learning': ['Neural network architecture (Perceptrons)', 'Activation functions (ReLU, Sigmoid, Softmax)', 'Loss functions & Backpropagation', 'Convolutional Neural Networks (CNNs)'],
  'Data Processing': ['Feature scaling (StandardScaler, MinMaxScaler)', 'Handling categorical variables (One-Hot Encoding)', 'Outlier detection', 'Imputation techniques'],
  'Model Evaluation': ['Confusion Matrix analysis', 'Precision, Recall, and F1-score', 'ROC-AUC curve interpretation', 'Diagnosing Overfitting vs Underfitting'],
  Deployment: ['Containerization with Docker', 'REST APIs with FastAPI / Flask', 'Model serialization (Pickle, ONNX)', 'Monitoring model drift'],
  Excel: ['VLOOKUP and modern XLOOKUP', 'Pivot Tables & calculated fields', 'Logical functions (IF, AND, OR)', 'Data formatting & conditional rules'],
  'Data Cleaning': ['Deduplication strategies', 'Parsing inconsistent formats & timestamps', 'Null value imputation', 'Validating data schema integrity'],
  'Power BI/Tableau': ['Data source connections', 'Interactive filters and slicers', 'Calculated fields and DAX basics', 'Executive KPI dashboard assembly'],

  // Frontend
  HTML: ['Semantic HTML elements (<header>, <nav>, <main>, <article>)', 'Form controls, inputs, and validation', 'Accessible attributes (aria-* tags)', 'Document Object Model (DOM) tree structure'],
  CSS: ['CSS Box Model (margin, border, padding, content)', 'Flexbox layout (justify-content, align-items)', 'CSS Grid two-dimensional layouts', 'Media queries & responsive breakpoints'],
  JavaScript: ['Variables & scope (let, const vs var)', 'Array methods (map, filter, reduce)', 'Asynchronous JavaScript & Promises', 'DOM event handling & manipulation'],
  React: ['Component hierarchy & JSX syntax', 'Managing state with useState', 'Side-effects lifecycle with useEffect', 'Passing data with props and context'],
  Git: ['git init, add, and commit workflow', 'Branching & merging (git branch, git checkout)', 'Remote synchronization (git push, git pull)', 'Resolving merge conflicts'],

  // Backend
  Programming: ['Data structures (Arrays, Objects, Maps)', 'Control flow and error handling', 'Writing modular, reusable functions', 'Asynchronous execution and Promises'],
  APIs: ['RESTful HTTP conventions (GET, POST, PUT, DELETE)', 'Status codes (200, 201, 400, 404, 500)', 'Request headers, query params, and JSON bodies', 'API rate limiting and error responses'],
  Databases: ['Relational schema design & tables', 'Primary and Foreign keys', 'Indexing for query speed', 'ACID transactions and consistency'],
  Authentication: ['User registration & password hashing with salt', 'JSON Web Tokens (JWT) vs Sessions', 'Authorization headers & Bearer tokens', 'Role-Based Access Control (RBAC)'],
  'Backend Frameworks': ['Express.js routing and middleware', 'Handling JSON requests and responses', 'Centralized error-handling middleware', 'Connecting backend to database drivers'],

  // Full Stack
  Backend: ['Node.js runtime environment', 'REST API server design', 'Database integration & query builders', 'Environment configuration & secrets'],

  // Cloud / DevOps
  Linux: ['Terminal navigation (cd, ls, pwd)', 'File manipulation (cat, nano, rm, cp, mv)', 'Permissions & ownership (chmod, chown)', 'Process management (ps, kill, top)'],
  Networking: ['IP addresses, subnets, and CIDR blocks', 'TCP/IP and OSI model layers', 'DNS resolution and records', 'Firewalls, ports, and security groups'],
  'Cloud Fundamentals': ['Cloud service models (IaaS, PaaS, SaaS)', 'Public vs private vs hybrid cloud', 'Regions, Availability Zones, and data residency', 'Pay-as-you-go cost governance'],
  'AWS/Azure/GCP': ['Object storage (AWS S3 / GCS)', 'Compute instances (AWS EC2 / GCE)', 'IAM roles and user policies', 'Serverless execution (AWS Lambda / Cloud Functions)'],
  Security: ['Principle of Least Privilege', 'Encrypting data at rest and in transit', 'Vulnerability scanning', 'Secure SSH key authentication'],
  Containers: ['Container fundamentals vs Virtual Machines', 'Writing Dockerfiles (FROM, COPY, RUN, CMD)', 'Building and running container images', 'Port mapping and persistent volumes'],
  'CI/CD': ['Automated build and test pipelines', 'GitHub Actions workflow configurations', 'Continuous Delivery vs Continuous Deployment', 'Automated release versioning'],
  Docker: ['Dockerfile syntax & multi-stage builds', 'Docker CLI commands (build, run, stop, ps)', 'Docker Compose multi-container setups', 'Managing environment variables in containers'],
  Kubernetes: ['Kubernetes architecture (Control Plane & Nodes)', 'Deploying Pods and Deployments', 'Services and Ingress controllers', 'ConfigMaps and Secrets'],
  Cloud: ['Cloud infrastructure provisioning', 'Auto-scaling groups', 'Load balancers (ALB/NLB)', 'Cloud backup and disaster recovery'],
  Monitoring: ['Metrics collection with Prometheus', 'Visualizing telemetry with Grafana', 'Log aggregation (ELK / Loki)', 'Configuring alerts for latency and downtime'],

  // Cybersecurity
  'Security Fundamentals': ['The CIA Triad (Confidentiality, Integrity, Availability)', 'Defense-in-depth principles', 'Common vulnerabilities (OWASP Top 10)', 'Security compliance standards'],
  'Threat Detection': ['Recognizing phishing and social engineering', 'Malware types (Ransomware, Trojans, Spyware)', 'SIEM log analysis and alert triaging', 'Incident response lifecycle'],
  Cryptography: ['Symmetric encryption (AES)', 'Asymmetric encryption (RSA, ECC)', 'Hashing functions (SHA-256) vs encryption', 'Public Key Infrastructure (PKI) and SSL/TLS'],

  // UI/UX
  'UX Principles': ['User-centered design process', 'Heuristic evaluation principles', 'Information architecture & navigation flows', 'Cognitive load reduction and usability'],
  'UI Principles': ['Visual hierarchy and focal points', 'Grid systems and consistent spacing', 'Accessible design systems and tokens', 'Micro-interactions and feedback states'],
  Typography: ['Font pairing (Serif vs Sans-Serif)', 'Type scale and line-heights', 'Readability and measure (line length)', 'Web font performance'],
  Color: ['Color theory and emotional harmony', '60-30-10 palette distribution', 'Accessible contrast ratios (WCAG AA 4.5:1)', 'Dark mode palettes'],
  Wireframing: ['Low-fidelity sketching and structural layouts', 'Content zoning and layout hierarchy', 'Translating requirements into screens', 'Wireframe review and iteration'],
  Prototyping: ['Clickable screen interactions', 'Micro-animations and transitions', 'User flow validation', 'Stakeholder demonstration'],
  'User Research': ['User personas and empathy maps', 'Conducting usability testing sessions', 'User interview techniques', 'Analyzing user feedback and surveys'],
};

export function generateStudyRecommendations(
  skillScores: SkillScoreSummary[]
): StudyRecommendation[] {
  // Sort from weakest to strongest score
  const sorted = [...skillScores].sort((a, b) => a.score - b.score);

  return sorted.map((item) => {
    const topics = SKILL_STUDY_TOPICS[item.skill] || [
      `${item.skill} core fundamentals`,
      `${item.skill} best practices`,
      `${item.skill} hands-on practical exercises`,
    ];

    let reason = '';
    let topicsToStudy: string[] = [];

    if (item.status === 'Very Weak' || item.status === 'Weak') {
      reason = `Assessment score was ${item.score}% (${item.status}). High priority foundational study required.`;
      topicsToStudy = topics;
    } else if (item.status === 'Needs Improvement') {
      reason = `Assessment score was ${item.score}% (${item.status}). Core understanding present, but needs reinforcement on key patterns.`;
      topicsToStudy = topics.slice(1);
    } else if (item.status === 'Good') {
      reason = `Assessment score was ${item.score}% (${item.status}). Good baseline competency. Review advanced concepts.`;
      topicsToStudy = topics.slice(2);
    } else {
      reason = `Assessment score was ${item.score}% (${item.status}). Strong competence verified. Skip beginner topics and proceed to advanced projects.`;
      topicsToStudy = [`Skip beginner ${item.skill} topics`, `Proceed directly to production projects & advanced patterns`];
    }

    return {
      skill: item.skill,
      score: item.score,
      status: item.status,
      title: `${item.skill} Study Guide`,
      reason,
      topicsToStudy,
    };
  });
}

// Generate sequential roadmap items prioritizing weakest skills
export function generateRoadmapFromWeakSkills(
  roleTitle: string,
  skillScores: SkillScoreSummary[]
) {
  // Sort from weakest to strongest
  const sortedWeakestFirst = [...skillScores].sort((a, b) => a.score - b.score);

  let stepOrder = 1;
  const items = sortedWeakestFirst.map((item) => {
    const status = item.score < 50 ? 'available' : item.score < 80 ? 'available' : 'completed';
    return {
      id: `step-${stepOrder}`,
      title: `${item.skill} Mastery`,
      skill: item.skill,
      description: item.score < 70
        ? `Focus study on ${item.skill} to bridge your verified gap (current score: ${item.score}%).`
        : `Advanced exercises and practical applications for ${item.skill}.`,
      difficulty: (item.score < 50 ? 'Beginner' : item.score < 80 ? 'Intermediate' : 'Advanced') as 'Beginner' | 'Intermediate' | 'Advanced',
      estimatedHours: item.score < 50 ? 16 : item.score < 80 ? 10 : 6,
      prerequisites: stepOrder > 1 ? [`Step ${stepOrder - 1}`] : [],
      stepOrder: stepOrder++,
      status: (status === 'completed' ? 'completed' : stepOrder === 2 ? 'in_progress' : 'available') as any,
      progress: item.score,
      resources: [
        {
          title: `${item.skill} Official Documentation & Guides`,
          url: `https://www.google.com/search?q=${encodeURIComponent(item.skill + ' documentation tutorial')}`,
          type: 'Documentation',
          duration: '6 Hours',
        },
      ],
    };
  });

  // Always append a culminating projects step
  items.push({
    id: `step-${stepOrder}`,
    title: `${roleTitle} Capstone Portfolio Project`,
    skill: sortedWeakestFirst[0]?.skill || 'Full Stack',
    description: `Synthesize your skills into an end-to-end production application for your ${roleTitle} portfolio.`,
    difficulty: 'Advanced',
    estimatedHours: 24,
    prerequisites: items.map((it) => it.title).slice(0, 2),
    stepOrder: stepOrder,
    status: 'locked',
    progress: 0,
    resources: [
      {
        title: `${roleTitle} Project Template & Architecture`,
        url: 'https://github.com',
        type: 'Project',
        duration: '24 Hours',
      },
    ],
  });

  return items;
}
