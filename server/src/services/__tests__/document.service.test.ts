// Mock the Mongoose models (no live DB; repo convention).
jest.mock('../../models/Document.model', () => ({
  DocumentModel: { create: jest.fn(), find: jest.fn(), findOneAndDelete: jest.fn(), updateMany: jest.fn() },
}));
jest.mock('../../models/IntakeBundle.model', () => ({ IntakeBundle: { findOne: jest.fn() } }));
jest.mock('../../models/Project.model', () => ({ Project: { findOne: jest.fn() } }));

import * as XLSX from 'xlsx';
import {
  typeOf,
  parseSpreadsheet,
  detectItems,
  mergeUnique,
  mergeDocumentDataService,
  ExcelExtraction,
  PdfExtraction,
} from '../document.service';
import { IntakeBundle } from '../../models/IntakeBundle.model';
import { Project } from '../../models/Project.model';
import { DocumentModel } from '../../models/Document.model';

const projectFindOne = Project.findOne as jest.Mock;
const bundleFindOne = IntakeBundle.findOne as jest.Mock;
const docUpdateMany = DocumentModel.updateMany as jest.Mock;

const xlsxBuffer = (): Buffer => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([
    ['Patient Name', 'Phone Number', 'Age', 'ID'],
    ['Ayesha', '0300', 30, 1],
    ['Bilal', '0311', 45, 2],
  ]);
  XLSX.utils.book_append_sheet(wb, ws, 'Patients');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
};

beforeEach(() => {
  jest.clearAllMocks();
  docUpdateMany.mockResolvedValue({});
});

describe('typeOf', () => {
  it('classifies by mimetype + extension', () => {
    expect(typeOf('application/pdf', 'x.pdf')).toBe('pdf');
    expect(typeOf('text/csv', 'x.csv')).toBe('csv');
    expect(typeOf('application/octet-stream', 'roster.csv')).toBe('csv');
    expect(typeOf('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'x.xlsx')).toBe('excel');
  });
});

describe('parseSpreadsheet', () => {
  it('parses an .xlsx buffer into columns + sample rows', () => {
    const ex = parseSpreadsheet(xlsxBuffer());
    expect(ex.kind).toBe('sheets');
    expect(ex.sheets[0].name).toBe('Patients');
    expect(ex.sheets[0].columns).toEqual(['Patient Name', 'Phone Number', 'Age', 'ID']);
    expect(ex.sheets[0].rowCount).toBe(2);
    expect(ex.sheets[0].sampleRows.length).toBe(2);
  });

  it('parses a CSV buffer', () => {
    const ex = parseSpreadsheet(Buffer.from('Full Name,Guardian,Grade\nAli,Sara,5\nZoya,Omar,6\n', 'utf8'));
    expect(ex.sheets[0].columns).toEqual(['Full Name', 'Guardian', 'Grade']);
    expect(ex.sheets[0].rowCount).toBe(2);
  });
});

describe('detectItems', () => {
  it('derives candidate fields from columns (dropping id/audit columns)', () => {
    const ex = parseSpreadsheet(xlsxBuffer());
    const detected = detectItems(ex, 'clinic');
    expect(detected.fields).toContain('Patient Name');
    expect(detected.fields).toContain('Phone Number');
    expect(detected.fields.map((f) => f.toLowerCase())).not.toContain('id');
  });

  it('detects rules + roles from PDF text, not fields', () => {
    const pdf: PdfExtraction = {
      kind: 'text',
      pageCount: 1,
      snippet: '',
      text: 'Only doctors can edit diagnoses. Appointments must be cancelled at least 24 hours in advance. The weather is nice today.',
    };
    const detected = detectItems(pdf, 'clinic');
    expect(detected.fields).toEqual([]);
    expect(detected.roles).toContain('Doctor');
    expect(detected.rules.some((r) => /must be cancelled/i.test(r))).toBe(true);
    expect(detected.rules.some((r) => /weather is nice/i.test(r))).toBe(false);
  });
});

describe('mergeUnique', () => {
  it('unions case-insensitively, first casing wins', () => {
    expect(mergeUnique(['Doctor', 'Nurse'], ['doctor', 'Manager', ''])).toEqual(['Doctor', 'Nurse', 'Manager']);
  });
});

describe('mergeDocumentDataService', () => {
  it('unions incoming items into the bundle and marks docs merged', async () => {
    projectFindOne.mockResolvedValue({ domain: 'clinic' });
    const save = jest.fn().mockResolvedValue(undefined);
    const bundle: any = { documentItems: { roles: ['Doctor'], fields: ['Name'], rules: [] }, markModified: jest.fn(), save };
    bundleFindOne.mockResolvedValue(bundle);

    const result = await mergeDocumentDataService('u1', 'p1', { roles: ['nurse'], fields: ['Name', 'Age'], rules: ['R1'] });

    expect(result.roles).toEqual(['Doctor', 'nurse']);
    expect(result.fields).toEqual(['Name', 'Age']);
    expect(result.rules).toEqual(['R1']);
    expect(bundle.documentItems).toEqual(result);
    expect(save).toHaveBeenCalled();
    expect(docUpdateMany).toHaveBeenCalled();
  });

  it('throws when the intake bundle does not exist', async () => {
    projectFindOne.mockResolvedValue({ domain: 'clinic' });
    bundleFindOne.mockResolvedValue(null);
    await expect(mergeDocumentDataService('u1', 'p1', { fields: ['X'] })).rejects.toThrow(/intake form/i);
  });
});
