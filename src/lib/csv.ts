import type { CsvData, DatasetKind } from './types';

export class CsvError extends Error {}

function detectDelimiter(text: string): string {
  const firstRecord = text.split(/\r?\n/, 1)[0] ?? '';
  const candidates = [',', ';', '\t'];
  return candidates
    .map((delimiter) => ({ delimiter, count: firstRecord.split(delimiter).length - 1 }))
    .sort((a, b) => b.count - a.count)[0]?.delimiter ?? ',';
}

export function parseCsv(text: string, kind: DatasetKind, fileName = `${kind}.csv`): CsvData {
  const clean = text.replace(/^\uFEFF/, '');
  if (!clean.trim()) throw new CsvError(`${fileName} is empty.`);
  const delimiter = detectDelimiter(clean);
  const matrix: string[][] = [];
  let record: string[] = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < clean.length; index += 1) {
    const char = clean[index];
    const next = clean[index + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"' && field === '') {
      quoted = true;
    } else if (char === delimiter) {
      record.push(field.trim());
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && next === '\n') index += 1;
      record.push(field.trim());
      if (record.some((value) => value !== '')) matrix.push(record);
      record = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (quoted) throw new CsvError(`${fileName} has an unclosed quoted field.`);
  record.push(field.trim());
  if (record.some((value) => value !== '')) matrix.push(record);

  const headers = matrix.shift()?.map((header) => header.trim()) ?? [];
  if (headers.length < 2 || headers.some((header) => !header)) {
    throw new CsvError(`${fileName} needs a header row with at least two named columns.`);
  }
  const normalized = headers.map((header) => header.toLocaleLowerCase());
  if (new Set(normalized).size !== normalized.length) {
    throw new CsvError(`${fileName} has duplicate column names. Rename them and try again.`);
  }
  const rows = matrix.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])));
  if (rows.length === 0) throw new CsvError(`${fileName} has headers but no data rows.`);

  return { kind, fileName, headers, rows, importedAt: new Date().toISOString() };
}

export function suggestColumn(headers: string[], aliases: string[]): string | undefined {
  const scored = headers.map((header) => {
    const clean = header.toLocaleLowerCase().replace(/[^a-z0-9]/g, '');
    const exact = aliases.findIndex((alias) => clean === alias);
    if (exact >= 0) return { header, score: 100 - exact };
    const contains = aliases.findIndex((alias) => clean.includes(alias));
    return { header, score: contains >= 0 ? 50 - contains : -1 };
  });
  return scored.sort((a, b) => b.score - a.score)[0]?.score! >= 0
    ? scored.sort((a, b) => b.score - a.score)[0]?.header
    : undefined;
}

export function escapeCsv(value: string | number): string {
  const string = String(value);
  return /[",\n\r]/.test(string) ? `"${string.replaceAll('"', '""')}"` : string;
}
