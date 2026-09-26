import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { RequestHandler } from 'express';

/** Absolute uploads directory (created on boot if missing). */
export const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || './uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const MAX_FILE_SIZE = (parseInt(process.env.MAX_FILE_SIZE_MB || '5') || 5) * 1024 * 1024;

const ALLOWED_IMAGE_MIME = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/svg+xml',
  'image/webp',
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
    cb(null, `logo_${unique}${ext}`);
  },
});

/**
 * multer middleware for a single image logo upload (field name "logo").
 * Wrap with catchUpload() so multer errors return a clean 400 envelope.
 */
export const uploadLogo = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_IMAGE_MIME.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PNG, JPG, SVG, or WEBP images are allowed.'));
    }
  },
}).single('logo');

// ── Document uploads (Excel / CSV / PDF) — Module 3 ─────────────────

const ALLOWED_DOC_MIME = new Set([
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls (also some .csv)
  'text/csv',
  'application/csv',
  'application/pdf',
]);

const DOC_EXTS = ['.xlsx', '.xls', '.csv', '.pdf'];

const docStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
    cb(null, `doc_${unique}${ext}`);
  },
});

/** multer middleware for up to 5 document files (field name "documents"). */
export const uploadDocuments = multer({
  storage: docStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_DOC_MIME.has(file.mimetype) || DOC_EXTS.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel (.xlsx/.xls), CSV, or PDF files are allowed.'));
    }
  },
}).array('documents', 5);

/** Wrap a multer middleware so its errors become a clean 400 envelope. */
export const catchUpload =
  (mw: RequestHandler): RequestHandler =>
  (req, res, next) => {
    mw(req, res, (err: any) => {
      if (err) {
        res.status(400).json({ success: false, code: 'UPLOAD_ERROR', message: err.message || 'Upload failed.' });
        return;
      }
      next();
    });
  };
