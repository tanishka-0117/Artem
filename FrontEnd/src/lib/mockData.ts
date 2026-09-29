/* ============================================================
   ARTEM — Mock Data for UI Development
   Comprehensive dataset for all pages
   ============================================================ */

export const mockUser = {
  _id: 'demo-user-1',
  name: 'Alex Morgan',
  email: 'alex.morgan@example.com',
  role: 'candidate',
  profileImage: '',
  targetRole: 'Full Stack Developer',
  experienceLevel: 'Intermediate',
};

// Dashboard
export const mockDashboard = {
  readinessScore: 72,
  preparationScore: 68,
  questionsAttempted: 247,
  interviewsCompleted: 12,
  codingProblemsSolved: 38,
  averageAnswerScore: 7.4,
  weakAreas: ['System Design', 'Dynamic Programming', 'Behavioral Questions'],
  recommendedTopics: ['System Design Patterns', 'Graph Algorithms', 'STAR Method'],
};

export const mockPerformanceData = [
  { date: 'Mon', score: 65, questions: 8 },
  { date: 'Tue', score: 72, questions: 12 },
  { date: 'Wed', score: 68, questions: 6 },
  { date: 'Thu', score: 78, questions: 15 },
  { date: 'Fri', score: 74, questions: 10 },
  { date: 'Sat', score: 82, questions: 18 },
  { date: 'Sun', score: 79, questions: 9 },
];

export const mockSkillRadar = [
  { skill: 'DSA', score: 78, fullMark: 100 },
  { skill: 'Web Dev', score: 85, fullMark: 100 },
  { skill: 'System Design', score: 52, fullMark: 100 },
  { skill: 'HR', score: 70, fullMark: 100 },
  { skill: 'Communication', score: 65, fullMark: 100 },
  { skill: 'Problem Solving', score: 75, fullMark: 100 },
];

export const mockRecommendations = [
  {
    id: '1',
    title: 'Practice System Design',
    reason: 'Your system design score is 52% — below your target role requirements.',
    priority: 1,
    type: 'practice',
    completed: false,
  },
  {
    id: '2',
    title: 'Review Dynamic Programming',
    reason: 'You solved only 3 out of 12 DP problems correctly in recent attempts.',
    priority: 2,
    type: 'coding',
    completed: false,
  },
  {
    id: '3',
    title: 'Take a Behavioral Interview',
    reason: 'No behavioral interview completed in the last 14 days.',
    priority: 3,
    type: 'interview',
    completed: false,
  },
];

export const mockRecentActivity = [
  {
    id: '1',
    type: 'interview',
    title: 'Technical Interview — React & Node.js',
    score: 78,
    date: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: '2',
    type: 'coding',
    title: 'Two Sum — Easy',
    score: 100,
    date: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: '3',
    type: 'resume',
    title: 'Resume Analysis Complete',
    score: 84,
    date: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: '4',
    type: 'interview',
    title: 'System Design — URL Shortener',
    score: 62,
    date: new Date(Date.now() - 48 * 3600000).toISOString(),
  },
  {
    id: '5',
    type: 'coding',
    title: 'Merge K Sorted Lists — Hard',
    score: 0,
    date: new Date(Date.now() - 72 * 3600000).toISOString(),
  },
];

export const mockGoals = [
  { id: '1', title: 'Complete 5 System Design problems', progress: 40, total: 5, completed: 2 },
  { id: '2', title: 'Score 80%+ on a Technical Interview', progress: 75, total: 1, completed: 0 },
  { id: '3', title: 'Solve 10 Medium DSA problems', progress: 60, total: 10, completed: 6 },
  { id: '4', title: 'Complete STAR Method practice', progress: 20, total: 5, completed: 1 },
];

// Question Bank
export const mockQuestions = [
  {
    _id: 'q1',
    title: 'Explain the difference between TCP and UDP',
    description: 'Compare and contrast TCP and UDP protocols, including use cases for each.',
    category: 'Computer Networks',
    topic: 'Protocols',
    difficulty: 'Easy',
    tags: ['networking', 'protocols', 'tcp', 'udp'],
    company: 'Amazon',
    bookmarked: true,
    completed: true,
  },
  {
    _id: 'q2',
    title: 'What is the Virtual DOM in React?',
    description: 'Explain how the Virtual DOM works and why React uses it for rendering.',
    category: 'Web Development',
    topic: 'React',
    difficulty: 'Easy',
    tags: ['react', 'virtual-dom', 'frontend'],
    company: 'Meta',
    bookmarked: false,
    completed: true,
  },
  {
    _id: 'q3',
    title: 'Design a URL Shortener',
    description: 'Design a system that converts long URLs into short unique aliases.',
    category: 'System Design',
    topic: 'URL Shortening',
    difficulty: 'Medium',
    tags: ['system-design', 'hashing', 'scalability'],
    company: 'Google',
    bookmarked: true,
    completed: false,
  },
  {
    _id: 'q4',
    title: 'Implement LRU Cache',
    description: 'Design and implement a data structure for Least Recently Used cache.',
    category: 'DSA',
    topic: 'Data Structures',
    difficulty: 'Medium',
    tags: ['cache', 'linked-list', 'hashmap'],
    company: 'Microsoft',
    bookmarked: false,
    completed: false,
  },
  {
    _id: 'q5',
    title: 'Explain ACID Properties',
    description: 'Explain the ACID properties in the context of database transactions.',
    category: 'DBMS',
    topic: 'Transactions',
    difficulty: 'Easy',
    tags: ['database', 'transactions', 'acid'],
    company: 'Oracle',
    bookmarked: false,
    completed: true,
  },
  {
    _id: 'q6',
    title: 'What are the four pillars of OOP?',
    description: 'Explain encapsulation, abstraction, inheritance and polymorphism with examples.',
    category: 'OOP',
    topic: 'Fundamentals',
    difficulty: 'Easy',
    tags: ['oop', 'fundamentals', 'java', 'cpp'],
    company: '',
    bookmarked: false,
    completed: true,
  },
  {
    _id: 'q7',
    title: 'Design a Rate Limiter',
    description: 'Design a rate limiter that handles millions of requests per second.',
    category: 'System Design',
    topic: 'Rate Limiting',
    difficulty: 'Hard',
    tags: ['system-design', 'rate-limiting', 'distributed'],
    company: 'Stripe',
    bookmarked: true,
    completed: false,
  },
  {
    _id: 'q8',
    title: 'Tell me about a time you handled conflict',
    description: 'Behavioral question about conflict resolution in a team setting.',
    category: 'HR',
    topic: 'Behavioral',
    difficulty: 'Medium',
    tags: ['behavioral', 'star', 'teamwork'],
    company: '',
    bookmarked: false,
    completed: false,
  },
];

// Coding Problems
export const mockCodingProblems = [
  {
    _id: 'p1',
    title: 'Two Sum',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    difficulty: 'Easy',
    category: 'Arrays',
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9'],
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]', explanation: '' },
    ],
    acceptanceRate: 78,
    submissions: 1247,
  },
  {
    _id: 'p2',
    title: 'Merge K Sorted Lists',
    description: 'You are given an array of k linked-lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.',
    difficulty: 'Hard',
    category: 'Linked Lists',
    constraints: ['k == lists.length', '0 <= k <= 10^4', '0 <= lists[i].length <= 500'],
    examples: [
      { input: 'lists = [[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,3,4,4,5,6]', explanation: '' },
    ],
    acceptanceRate: 45,
    submissions: 623,
  },
  {
    _id: 'p3',
    title: 'Valid Parentheses',
    description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
    difficulty: 'Easy',
    category: 'Stacks',
    constraints: ['1 <= s.length <= 10^4', 's consists of parentheses only \'()[]{}\''],
    examples: [
      { input: 's = "()"', output: 'true', explanation: '' },
      { input: 's = "()[]{}"', output: 'true', explanation: '' },
      { input: 's = "(]"', output: 'false', explanation: '' },
    ],
    acceptanceRate: 82,
    submissions: 987,
  },
  {
    _id: 'p4',
    title: 'Longest Palindromic Substring',
    description: 'Given a string s, return the longest palindromic substring in s.',
    difficulty: 'Medium',
    category: 'Strings',
    constraints: ['1 <= s.length <= 1000', 's consist of only digits and English letters.'],
    examples: [
      { input: 's = "babad"', output: '"bab"', explanation: '"aba" is also a valid answer.' },
    ],
    acceptanceRate: 56,
    submissions: 845,
  },
];

// Resume
export const mockResume = {
  _id: 'r1',
  fileUrl: '/resume.pdf',
  resumeScore: 76,
  atsScore: 82,
  skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'MongoDB', 'Express.js', 'Git', 'REST APIs', 'HTML/CSS', 'SQL'],
  missingSkills: ['Docker', 'Kubernetes', 'CI/CD', 'System Design', 'AWS', 'GraphQL'],
  weakDescriptions: [
    { section: 'Project: E-commerce App', issue: 'No measurable impact or scale mentioned', suggestion: 'Add metrics: "Served 500+ users" or "Reduced load time by 40%"' },
    { section: 'Experience: Intern at TechCorp', issue: 'Vague responsibilities', suggestion: 'Use action verbs and quantify contributions' },
  ],
  grammarIssues: 2,
  suggestions: [
    'Add Docker and containerization experience to match Full Stack Developer requirements',
    'Include measurable impact statements in project descriptions',
    'Add a section for certifications or relevant coursework',
    'Mention specific database optimization or performance work',
  ],
  interviewQuestions: [
    'Can you walk me through your E-commerce App architecture?',
    'How did you implement authentication in your Node.js projects?',
    'What challenges did you face with MongoDB in your projects?',
    'Describe your experience with React state management.',
  ],
};

// Interview
export const mockInterviewHistory = [
  {
    _id: 'i1',
    type: 'Technical',
    difficulty: 'Intermediate',
    targetRole: 'Full Stack Developer',
    score: 78,
    feedback: { strengths: ['Good React knowledge', 'Clear communication'], weaknesses: ['Weak system design', 'Missed edge cases'] },
    duration: 25,
    questionsCount: 8,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    _id: 'i2',
    type: 'System Design',
    difficulty: 'Advanced',
    targetRole: 'Full Stack Developer',
    score: 62,
    feedback: { strengths: ['Good problem breakdown'], weaknesses: ['Scalability concerns', 'Missing caching layer'] },
    duration: 30,
    questionsCount: 5,
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
  },
  {
    _id: 'i3',
    type: 'HR',
    difficulty: 'Beginner',
    targetRole: 'Full Stack Developer',
    score: 85,
    feedback: { strengths: ['Confident answers', 'Good examples'], weaknesses: ['Could elaborate more on failures'] },
    duration: 20,
    questionsCount: 6,
    createdAt: new Date(Date.now() - 96 * 3600000).toISOString(),
  },
];

// Progress / Analytics
export const mockWeeklyTrend = [
  { week: 'W1', dsa: 65, web: 78, system: 45, hr: 60, overall: 62 },
  { week: 'W2', dsa: 68, web: 80, system: 48, hr: 65, overall: 65 },
  { week: 'W3', dsa: 72, web: 82, system: 50, hr: 68, overall: 68 },
  { week: 'W4', dsa: 75, web: 83, system: 52, hr: 70, overall: 70 },
  { week: 'W5', dsa: 78, web: 85, system: 52, hr: 70, overall: 72 },
];

export const mockTopicPerformance = [
  { topic: 'Arrays', score: 85, attempted: 24, correct: 20 },
  { topic: 'Trees', score: 72, attempted: 18, correct: 13 },
  { topic: 'Graphs', score: 60, attempted: 15, correct: 9 },
  { topic: 'DP', score: 45, attempted: 12, correct: 5 },
  { topic: 'Strings', score: 80, attempted: 20, correct: 16 },
  { topic: 'Stacks', score: 88, attempted: 16, correct: 14 },
  { topic: 'Linked Lists', score: 76, attempted: 14, correct: 11 },
  { topic: 'System Design', score: 52, attempted: 8, correct: 4 },
];

// Roadmap
export const mockRoadmap = [
  {
    id: '1',
    title: 'Master Dynamic Programming Basics',
    reason: 'DP score is at 45% — significantly below your target role needs.',
    priority: 1,
    category: 'DSA',
    status: 'in-progress',
    tasks: [
      { id: 't1', title: 'Complete Fibonacci variations', done: true },
      { id: 't2', title: 'Solve 5 1D DP problems', done: true },
      { id: 't3', title: 'Solve 5 2D DP problems', done: false },
      { id: 't4', title: 'Practice DP on strings', done: false },
    ],
  },
  {
    id: '2',
    title: 'System Design Fundamentals',
    reason: 'System design scored 52% in your last interview.',
    priority: 2,
    category: 'System Design',
    status: 'not-started',
    tasks: [
      { id: 't5', title: 'Study CAP theorem', done: false },
      { id: 't6', title: 'Design URL Shortener', done: false },
      { id: 't7', title: 'Design Chat System', done: false },
      { id: 't8', title: 'Study caching strategies', done: false },
    ],
  },
  {
    id: '3',
    title: 'Improve Behavioral Responses',
    reason: 'No behavioral practice in 14 days. Communication score: 65%.',
    priority: 3,
    category: 'HR',
    status: 'not-started',
    tasks: [
      { id: 't9', title: 'Practice STAR method', done: false },
      { id: 't10', title: 'Prepare 5 conflict-resolution stories', done: false },
      { id: 't11', title: 'Take a behavioral mock interview', done: false },
    ],
  },
  {
    id: '4',
    title: 'Strengthen Graph Algorithms',
    reason: 'Graph problem accuracy is 60% — below your 75% target.',
    priority: 4,
    category: 'DSA',
    status: 'completed',
    tasks: [
      { id: 't12', title: 'BFS and DFS implementations', done: true },
      { id: 't13', title: 'Shortest path algorithms', done: true },
      { id: 't14', title: 'Topological sort', done: true },
    ],
  },
];

// Notifications
export const mockNotifications = [
  { id: '1', title: 'Interview Complete', message: 'Your Technical Interview scored 78%.', type: 'success', read: false, createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: '2', title: 'New Recommendation', message: 'Practice System Design based on your performance.', type: 'info', read: false, createdAt: new Date(Date.now() - 6 * 3600000).toISOString() },
  { id: '3', title: 'Resume Analyzed', message: 'Your resume scored 76/100 with 6 missing skills.', type: 'warning', read: true, createdAt: new Date(Date.now() - 24 * 3600000).toISOString() },
];

// Practice categories
export const mockPracticeCategories = [
  { id: '1', name: 'DSA & Core CS', icon: 'code', topics: ['Arrays', 'Trees', 'Graphs', 'DP', 'Stacks', 'Linked Lists'], totalQuestions: 120, completed: 48, color: 'primary' },
  { id: '2', name: 'Web Development', icon: 'globe', topics: ['React', 'Node.js', 'HTML/CSS', 'JavaScript', 'TypeScript'], totalQuestions: 85, completed: 52, color: 'cyan' },
  { id: '3', name: 'System Design', icon: 'layers', topics: ['Scalability', 'Databases', 'Caching', 'Load Balancing'], totalQuestions: 45, completed: 12, color: 'purple' },
  { id: '4', name: 'DBMS', icon: 'database', topics: ['SQL', 'Normalization', 'Transactions', 'Indexing'], totalQuestions: 40, completed: 28, color: 'success' },
  { id: '5', name: 'Operating Systems', icon: 'cpu', topics: ['Processes', 'Memory', 'Scheduling', 'Deadlocks'], totalQuestions: 35, completed: 18, color: 'warning' },
  { id: '6', name: 'HR & Behavioral', icon: 'users', topics: ['STAR Method', 'Conflict', 'Leadership', 'Teamwork'], totalQuestions: 30, completed: 8, color: 'info' },
];

export const mockInterviewScoreBreakdown = [
  { dimension: 'Technical', score: 78 },
  { dimension: 'Communication', score: 72 },
  { dimension: 'Problem Solving', score: 80 },
  { dimension: 'Confidence', score: 68 },
  { dimension: 'Completeness', score: 74 },
];
