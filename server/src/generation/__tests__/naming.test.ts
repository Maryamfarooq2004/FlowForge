import { tokenize, snake, camel, pascal, tableName, dedupeColumn, safeColumn } from '../naming';

describe('naming normalization', () => {
  const cases: Array<[string, string, string, string]> = [
    // input, snake, camel, pascal
    ['Full Name', 'full_name', 'fullName', 'FullName'],
    ['Follow-up Date', 'follow_up_date', 'followUpDate', 'FollowUpDate'],
    ['Date of Birth', 'date_of_birth', 'dateOfBirth', 'DateOfBirth'],
    ['Grade Applying For', 'grade_applying_for', 'gradeApplyingFor', 'GradeApplyingFor'],
    ['Fee Plan', 'fee_plan', 'feePlan', 'FeePlan'],
    ['Date', 'date', 'date', 'Date'],
    ['Time', 'time', 'time', 'Time'],
    ['Type', 'type', 'type', 'Type'],
    ['Status', 'status', 'status', 'Status'],
  ];

  it.each(cases)('normalizes "%s"', (input, s, c, p) => {
    expect(snake(input)).toBe(s);
    expect(camel(input)).toBe(c);
    expect(pascal(input)).toBe(p);
  });

  it('pluralizes table names on the last token', () => {
    expect(tableName('Patient')).toBe('patients');
    expect(tableName('Fee Plan')).toBe('fee_plans');
    expect(tableName('Consultation')).toBe('consultations');
    expect(tableName('Application')).toBe('applications');
    expect(tableName('Category')).toBe('categories');
  });

  it('prefixes leading-digit identifiers', () => {
    expect(safeColumn(snake('3rd Contact'))).toBe('_3rd_contact');
  });

  it('deduplicates colliding columns deterministically', () => {
    const used = new Set<string>(['id', 'created_at', 'updated_at']);
    expect(dedupeColumn('status', used)).toBe('status');
    expect(dedupeColumn('status', used)).toBe('status_2');
    expect(dedupeColumn('status', used)).toBe('status_3');
  });

  it('tokenizes camelCase and acronyms', () => {
    expect(tokenize('GradeApplyingFor')).toEqual(['grade', 'applying', 'for']);
    expect(tokenize('testScoreID')).toEqual(['test', 'score', 'id']);
  });
});
