/**
 * Deterministic identifier normalization for the code generator.
 *
 * One tokenizer feeds three casings and a no-library pluralizer, so a human
 * field/entity name like "Follow-up Date" or "Fee Plan" maps consistently to
 * snake_case columns, camelCase attributes, PascalCase class names, and plural
 * table/route names everywhere in the emitted app.
 */

/**
 * Split a human string into lowercase word tokens, breaking camelCase,
 * acronym boundaries, and any non-alphanumeric runs.
 *   "Follow-up Date"    -> ['follow','up','date']
 *   "GradeApplyingFor"  -> ['grade','applying','for']
 *   "Date of Birth"     -> ['date','of','birth']
 */
export const tokenize = (input: string): string[] =>
  input
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => t.toLowerCase());

const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

export const snake = (input: string): string => tokenize(input).join('_');

export const camel = (input: string): string => {
  const t = tokenize(input);
  if (t.length === 0) return '';
  return t[0] + t.slice(1).map(cap).join('');
};

export const pascal = (input: string): string => tokenize(input).map(cap).join('');

const IRREGULAR_PLURALS: Record<string, string> = {
  person: 'people',
  child: 'children',
  man: 'men',
  woman: 'women',
  tooth: 'teeth',
  foot: 'feet',
  mouse: 'mice',
  datum: 'data',
};

/** Pluralize a single lowercase word deterministically (no external library). */
export const pluralizeWord = (word: string): string => {
  if (!word) return word;
  if (IRREGULAR_PLURALS[word]) return IRREGULAR_PLURALS[word];
  if (/(s|x|z|ch|sh)$/.test(word)) return word + 'es';
  if (/[^aeiou]y$/.test(word)) return word.slice(0, -1) + 'ies';
  if (/(?:[^f]fe|[^f]f)$/.test(word)) return word.replace(/fe?$/, 'ves');
  return word + 's';
};

/** Pluralize only the last token of a multi-word name: "fee plan" -> ["fee","plans"]. */
export const pluralizeTokens = (tokens: string[]): string[] => {
  if (tokens.length === 0) return tokens;
  const out = tokens.slice();
  out[out.length - 1] = pluralizeWord(out[out.length - 1]);
  return out;
};

/** snake_case plural table name from a human entity name. */
export const tableName = (name: string): string =>
  pluralizeTokens(tokenize(name)).join('_');

/** kebab-case plural REST path segment from a human entity name. */
export const routeBase = (name: string): string =>
  pluralizeTokens(tokenize(name)).join('-');

/** camelCase plural (used for hasMany association aliases). */
export const camelPlural = (name: string): string => {
  const t = pluralizeTokens(tokenize(name));
  if (t.length === 0) return '';
  return t[0] + t.slice(1).map(cap).join('');
};

/**
 * Make a snake_case column identifier safe: prefix a leading digit with '_' so
 * it is a legal SQL/JS identifier. Reserved words (date/time/type/status/…) are
 * NOT special-cased here because the emitter always double-quotes SQL
 * identifiers and Sequelize quotes them too.
 */
export const safeColumn = (col: string): string =>
  /^[0-9]/.test(col) ? '_' + col : col;

/**
 * Deduplicate a candidate snake_case name against an already-used set,
 * appending _2, _3, … The returned name is registered in `used`.
 */
export const dedupeColumn = (candidate: string, used: Set<string>): string => {
  let name = candidate;
  let n = 2;
  while (used.has(name)) name = `${candidate}_${n++}`;
  used.add(name);
  return name;
};

/** camelCase attribute name derived from a (possibly de-duplicated) snake column. */
export const columnToAttr = (column: string): string => {
  // column may carry an underscore prefix or numeric suffix from dedupe/safety.
  const leading = column.startsWith('_') ? '_' : '';
  const body = column.replace(/^_+/, '');
  return leading + camel(body.replace(/_/g, ' '));
};

/** A safe npm package name for the emitted app. */
export const packageName = (name: string): string => {
  const slug = tokenize(name).join('-');
  return slug ? `flowforge-${slug}-app` : 'flowforge-generated-app';
};
