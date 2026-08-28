import { describe, expect, it } from 'vitest';
import { CsvError, escapeCsv, parseCsv, suggestColumn } from './csv';

describe('CSV parser', () => {
  it('parses quoted commas, escaped quotes, and newlines', () => {
    const csv = 'id,note,amount\r\n1,"hello, world",10.20\r\n2,"said ""yes""",-2.00';
    const result = parseCsv(csv, 'events', 'events.csv');
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]?.note).toBe('hello, world');
    expect(result.rows[1]?.note).toBe('said "yes"');
  });

  it('accepts semicolon-delimited exports', () => {
    const result = parseCsv('date;amount\n2026-08-01;12,50', 'bank');
    expect(result.headers).toEqual(['date', 'amount']);
    expect(result.rows[0]?.amount).toBe('12,50');
  });

  it('rejects empty and duplicate headers', () => {
    expect(() => parseCsv('', 'bank')).toThrow(CsvError);
    expect(() => parseCsv('Amount,amount\n1,2', 'bank')).toThrow(/duplicate/i);
  });

  it('suggests aliases without hiding the source header', () => {
    expect(suggestColumn(['Created At', 'Order Total'], ['date', 'createdat'])).toBe('Created At');
    expect(escapeCsv('a,b')).toBe('"a,b"');
  });
});
