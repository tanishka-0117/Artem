import dotenv from 'dotenv';
dotenv.config();

const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/artem',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  jwtExpiry: process.env.JWT_EXPIRY || '7d',
  aiProvider: process.env.AI_PROVIDER || 'openai',
  openaiApiKey: process.env.OPENAI_API_KEY,
  groqApiKey: process.env.GROQ_API_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY,
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
  },
  codeExecutorUrl: process.env.CODE_EXECUTOR_URL || 'http://localhost:5050',
};

export default config;
