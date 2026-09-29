import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'candidate' | 'admin';
  profileImage?: string;
  targetRole?: string;
  experienceLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  isEmailVerified: boolean;
  resetPasswordToken?: string;
  resetPasswordExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['candidate', 'admin'], default: 'candidate' },
    profileImage: String,
    targetRole: String,
    experienceLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'] },
    isEmailVerified: { type: Boolean, default: false },
    resetPasswordToken: String,
    resetPasswordExpiry: Date,
  },
  { timestamps: true },
);

export const User = mongoose.model<IUser>('User', userSchema);

// Resume
export interface IWeakDescription {
  section: string;
  issue: string;
  suggestion: string;
}

export interface IResume extends Document {
  userId: mongoose.Types.ObjectId;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  skills: string[];
  education: any[];
  experience: any[];
  projects: any[];
  resumeScore: number;
  atsScore: number;
  missingSkills: string[];
  weakDescriptions: IWeakDescription[];
  grammarIssues: number;
  suggestions: string[];
  interviewQuestions: string[];
  aiAnalysis?: Record<string, any>;
  createdAt: Date;
}

const resumeSchema = new Schema<IResume>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number, default: 0 },
    skills: [String],
    education: [Schema.Types.Mixed],
    experience: [Schema.Types.Mixed],
    projects: [Schema.Types.Mixed],
    resumeScore: { type: Number, default: 0 },
    atsScore: { type: Number, default: 0 },
    missingSkills: [String],
    weakDescriptions: [
      {
        section: String,
        issue: String,
        suggestion: String,
      },
    ],
    grammarIssues: { type: Number, default: 0 },
    suggestions: [String],
    interviewQuestions: [String],
    aiAnalysis: Schema.Types.Mixed,
  },
  { timestamps: true },
);

resumeSchema.index({ userId: 1, createdAt: -1 });

export const Resume = mongoose.model<IResume>('Resume', resumeSchema);

// Interview
export interface IInterview extends Document {
  userId: mongoose.Types.ObjectId;
  type: string;
  difficulty: string;
  targetRole: string;
  questions: any[];
  answers: any[];
  score?: number | Record<string, any>;
  feedback?: Record<string, any>;
  duration?: number;
  status: 'active' | 'completed' | 'abandoned';
  createdAt: Date;
}

const interviewSchema = new Schema<IInterview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true, enum: ['Technical', 'HR', 'Behavioral', 'System Design', 'Resume Based', 'Company Specific'] },
    difficulty: { type: String, required: true, enum: ['Beginner', 'Intermediate', 'Advanced'] },
    targetRole: { type: String, required: true },
    questions: [Schema.Types.Mixed],
    answers: [Schema.Types.Mixed],
    score: Schema.Types.Mixed,
    feedback: Schema.Types.Mixed,
    duration: Number,
    status: { type: String, enum: ['active', 'completed', 'abandoned'], default: 'active' },
  },
  { timestamps: true },
);

interviewSchema.index({ userId: 1, createdAt: -1 });

export const Interview = mongoose.model<IInterview>('Interview', interviewSchema);

// Question
export interface IQuestion extends Document {
  title: string;
  description: string;
  category: string;
  topic: string;
  difficulty: string;
  answer?: string;
  tags: string[];
  company?: string;
}

const questionSchema = new Schema<IQuestion>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    topic: { type: String, required: true },
    difficulty: { type: String, required: true, enum: ['Easy', 'Medium', 'Hard'] },
    answer: String,
    tags: [String],
    company: String,
  },
  { timestamps: true },
);

questionSchema.index({ category: 1, topic: 1, difficulty: 1 });
questionSchema.index({ tags: 1 });

export const Question = mongoose.model<IQuestion>('Question', questionSchema);

// CodingProblem
export interface ICodingProblem extends Document {
  title: string;
  description: string;
  difficulty: string;
  category: string;
  constraints: string[];
  examples: any[];
  testCases: any[];
  solutions: any[];
}

const codingProblemSchema = new Schema<ICodingProblem>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { type: String, required: true, enum: ['Easy', 'Medium', 'Hard'] },
    category: { type: String, required: true },
    constraints: [String],
    examples: [Schema.Types.Mixed],
    testCases: { type: [Schema.Types.Mixed], select: false } as any, // hidden from public queries
    solutions: { type: [Schema.Types.Mixed], select: false } as any,
  },
  { timestamps: true },
);

codingProblemSchema.index({ category: 1, difficulty: 1 });

export const CodingProblem = mongoose.model<ICodingProblem>('CodingProblem', codingProblemSchema);

// Submission
export interface ISubmission extends Document {
  userId: mongoose.Types.ObjectId;
  problemId: mongoose.Types.ObjectId;
  language: string;
  code: string;
  status: string;
  runtime?: number;
  memory?: number;
  createdAt: Date;
}

const submissionSchema = new Schema<ISubmission>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    problemId: { type: Schema.Types.ObjectId, ref: 'CodingProblem', required: true },
    language: { type: String, required: true, enum: ['C++', 'Java', 'Python', 'JavaScript'] },
    code: { type: String, required: true },
    status: { type: String, required: true, enum: ['Accepted', 'Wrong Answer', 'Runtime Error', 'Compilation Error', 'Time Limit Exceeded', 'Pending'] },
    runtime: Number,
    memory: Number,
  },
  { timestamps: true },
);

submissionSchema.index({ userId: 1, createdAt: -1 });
submissionSchema.index({ problemId: 1, createdAt: -1 });

export const Submission = mongoose.model<ISubmission>('Submission', submissionSchema);

// Progress
export interface IProgress extends Document {
  userId: mongoose.Types.ObjectId;
  topic: string;
  questionsAttempted: number;
  questionsCorrect: number;
  averageScore: number;
  lastPracticed: Date;
}

const progressSchema = new Schema<IProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    topic: { type: String, required: true },
    questionsAttempted: { type: Number, default: 0 },
    questionsCorrect: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    lastPracticed: Date,
  },
  { timestamps: true },
);

progressSchema.index({ userId: 1, topic: 1 }, { unique: true });

export const Progress = mongoose.model<IProgress>('Progress', progressSchema);

// Recommendation
export interface IRecommendation extends Document {
  userId: mongoose.Types.ObjectId;
  type: string;
  title: string;
  reason: string;
  priority: number;
  completed: boolean;
  createdAt: Date;
}

const recommendationSchema = new Schema<IRecommendation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    reason: { type: String, required: true },
    priority: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true },
);

recommendationSchema.index({ userId: 1, completed: 1, priority: 1 });

export const Recommendation = mongoose.model<IRecommendation>('Recommendation', recommendationSchema);

// Notification
export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
