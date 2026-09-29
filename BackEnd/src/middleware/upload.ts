import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

// Allowed MIME types
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// Storage configuration — saves files to uploads/ with a unique name
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (_req, file, cb) => {
    const uniqueId = crypto.randomBytes(12).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueId}${ext}`);
  },
});

// File filter — reject anything that isn't PDF/DOC/DOCX
const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

export default upload;
