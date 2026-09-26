import fs from 'fs';
import * as XLSX from 'xlsx';
import { DocumentModel, DocumentType, IDocumentDetected } from '../models/Document.model';
import { IntakeBundle } from '../models/IntakeBundle.model';
import { Project } from '../models/Project.model';
import { AppError } from '../utils/AppError';
import { getDomainTemplate } from '../config/domainTemplates';

// pdf-parse's package index runs a debug harness on import; use the lib entry.
// Typed via annotation (the /lib subpath has no bundled types).
const pdfParse: (buffer: Buffer) => Promise<{ text: string; numpages: number }> =
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('pdf-parse/lib/pdf-parse.js');

export interface SheetExtraction {
  name: string;
  columns: string[];
  rowCount: number;
  sampleRows: Record<string, any>[];
}
export interface ExcelExtraction {
  kind: 'sheets';
  sheets: SheetExtraction[];
}
export interface PdfExtraction {
  kind: 'text';
  pageCount: number;
  snippet: string;
  text: string;
}
export type Extraction = ExcelExtraction | PdfExtraction;

// ── Type detection ────────────────────────────────────────────────

export const typeOf = (mime: string, name: string): DocumentType => {
  const ext = name.toLowerCase().split('.').pop() ?? '';
  if (ext === 'pdf' || mime === 'application/pdf') return 'pdf';
  if (ext === 'csv' || mime === 'text/csv' || mime === 'application/csv') return 'csv';
  return 'excel';
};

// ── Parsing ───────────────────────────────────────────────────────

/** Parse an Excel/CSV buffer into per-sheet columns + sample rows (via SheetJS). */
export const parseSpreadsheet = (buffer: Buffer): ExcelExtraction => {
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const sheets: SheetExtraction[] = wb.SheetNames.map((name) => {
    const ws = wb.Sheets[name];
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' });
    const columns = rows.length ? Object.keys(rows[0]) : [];
    return { name, columns, rowCount: rows.length, sampleRows: rows.slice(0, 5) };
  });
  return { kind: 'sheets', sheets };
};

/** Parse a searchable PDF buffer into text (+ a short snippet). */
export const parsePdfBuffer = async (buffer: Buffer): Promise<PdfExtraction> => {
  const res = await pdfParse(buffer);
  const text = (res.text || '').replace(/\r/g, '').trim();
  return { kind: 'text', pageCount: res.numpages ?? 0, snippet: text.slice(0, 800), text };
};

// ── Heuristic detection ───────────────────────────────────────────

const IGNORE_COL = new Set(['id', 'no', 'sno', 'srno', 'created', 'createdat', 'updated', 'updatedat', 'timestamp']);

const titleCase = (s: string): string =>
  s
    .trim()
    .replace(/[_\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');

/** Case-insensitive union preserving first-seen casing. */
export const mergeUnique = (...lists: string[][]): string[] => {
  const seen = new Map<string, string>();
  for (const list of lists) {
    for (const raw of list ?? []) {
      const t = String(raw).trim();
      if (!t) continue;
      const k = t.toLowerCase();
      if (!seen.has(k)) seen.set(k, t);
    }
  }
  return [...seen.values()];
};

const ROLE_LEXICON = [
  'admin', 'administrator', 'manager', 'owner', 'staff', 'doctor', 'nurse', 'receptionist',
  'physician', 'teacher', 'principal', 'officer', 'accountant', 'accounts', 'clerk', 'patient',
  'student', 'guardian', 'parent', 'cashier', 'coordinator', 'supervisor', 'director',
];

const RULE_KW = /\b(must|only|require|required|cannot|can't|at least|before|after|deadline|minimum|maximum|approv|within|mandatory|no more than)\b/i;

/** Best-effort candidate roles / fields / rules from a parsed document. */
export const detectItems = (
  extraction: Extraction,
  domain: 'clinic' | 'school'
): IDocumentDetected => {
  const roleNames = getDomainTemplate(domain).roles.map((r) => r.name);
  const lexicon = mergeUnique(ROLE_LEXICON, roleNames.map((r) => r.toLowerCase()));

  let fields: string[] = [];
  let rules: string[] = [];
  let haystack = '';

  if (extraction.kind === 'sheets') {
    const cols = extraction.sheets.flatMap((s) => s.columns);
    fields = mergeUnique(
      cols
        .filter((c) => c && !IGNORE_COL.has(c.toLowerCase().replace(/[^a-z]/g, '')))
        .map(titleCase)
    );
    haystack = cols.join(' ').toLowerCase();
  } else {
    haystack = extraction.text.toLowerCase();
    rules = mergeUnique(
      extraction.text
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.replace(/\s+/g, ' ').trim())
        .filter((s) => s.length > 15 && s.length < 200 && RULE_KW.test(s))
    ).slice(0, 6);
  }

  const roles = mergeUnique(
    lexicon.filter((w) => haystack.includes(w)).map(titleCase)
  );

  return { roles, fields, rules };
};

// ── Persistence + service methods ─────────────────────────────────

const assertProject = async (userId: string, projectId: string) => {
  const project = await Project.findOne({ _id: projectId, userId });
  if (!project) throw new AppError('Project not found.', 404, 'NOT_FOUND');
  return project;
};

/** Parse + detect + persist a batch of uploaded documents. Never rejects the
 *  whole batch on one bad file — that file is stored with status 'failed'. */
export const uploadDocumentsService = async (
  userId: string,
  projectId: string,
  files: Express.Multer.File[]
) => {
  const project = await assertProject(userId, projectId);
  if (!files || files.length === 0) throw new AppError('No files uploaded.', 400, 'NO_FILES');

  const created = [];
  for (const file of files) {
    const type = typeOf(file.mimetype, file.originalname);
    const base = {
      projectId,
      userId,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      storageKey: file.filename,
      type,
    };
    try {
      const buffer = fs.readFileSync(file.path);
      const extraction: Extraction = type === 'pdf' ? await parsePdfBuffer(buffer) : parseSpreadsheet(buffer);
      const detected = detectItems(extraction, project.domain);
      const doc = await DocumentModel.create({ ...base, status: 'parsed', extraction, detected });
      created.push(doc);
    } catch (err: any) {
      const doc = await DocumentModel.create({
        ...base,
        status: 'failed',
        extraction: {},
        detected: { roles: [], fields: [], rules: [] },
        error: String(err?.message || err),
      });
      created.push(doc);
    }
  }
  return created;
};

export const listDocumentsService = async (userId: string, projectId: string) => {
  await assertProject(userId, projectId);
  return DocumentModel.find({ projectId, userId }).sort({ createdAt: -1 });
};

export const deleteDocumentService = async (userId: string, projectId: string, docId: string) => {
  await assertProject(userId, projectId);
  const doc = await DocumentModel.findOneAndDelete({ _id: docId, projectId, userId });
  if (!doc) throw new AppError('Document not found.', 404, 'NOT_FOUND');
  // Best-effort remove the on-disk file (ignore failures — disk is ephemeral).
  return doc;
};

export interface DocumentItems {
  roles: string[];
  fields: string[];
  rules: string[];
}

const cleanItems = (input: any): DocumentItems => ({
  roles: Array.isArray(input?.roles) ? input.roles.map(String) : [],
  fields: Array.isArray(input?.fields) ? input.fields.map(String) : [],
  rules: Array.isArray(input?.rules) ? input.rules.map(String) : [],
});

/** Merge confirmed extracted items into the project's IntakeBundle (idempotent union). */
export const mergeDocumentDataService = async (
  userId: string,
  projectId: string,
  confirmed: any
): Promise<DocumentItems> => {
  await assertProject(userId, projectId);
  const bundle = await IntakeBundle.findOne({ projectId, userId });
  if (!bundle) throw new AppError('Complete the intake form before merging documents.', 400, 'NO_BUNDLE');

  const incoming = cleanItems(confirmed);
  const existing = cleanItems((bundle as any).documentItems);
  const merged: DocumentItems = {
    roles: mergeUnique(existing.roles, incoming.roles),
    fields: mergeUnique(existing.fields, incoming.fields),
    rules: mergeUnique(existing.rules, incoming.rules),
  };

  (bundle as any).documentItems = merged;
  bundle.markModified('documentItems');
  await bundle.save();

  await DocumentModel.updateMany({ projectId, userId, status: 'parsed' }, { $set: { status: 'merged' } });
  return merged;
};
