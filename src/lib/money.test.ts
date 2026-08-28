import { describe, expect, it } from 'vitest';
import { currencyDecimals, minorToDecimal, parseMoney } from './money';

describe('minor-unit money math', () => {
  it('parses common export styles without floating point', () => {
    expect(parseMoney('$1,234.56', 2)).toBe(123456);
    expect(parseMoney('(25.10)', 2)).toBe(-2510);
    expect(parseMoney('1.234,56', 2)).toBe(123456);
    expect(parseMoney('1,234', 2)).toBe(123400);
  });

  it('retains currency precision', () => {
    expect(currencyDecimals('JPY')).toBe(0);
    expect(currencyDecimals('KWD')).toBe(3);
    expect(minorToDecimal(-1234, 3)).toBe('-1.234');
  });

  it('rejects non-numeric cells', () => {
    expect(() => parseMoney('not available', 2)).toThrow(/not a number/i);
  });
});
