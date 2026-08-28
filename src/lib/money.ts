const ZERO_DECIMAL = new Set(['BIF', 'CLP', 'DJF', 'GNF', 'ISK', 'JPY', 'KMF', 'KRW', 'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF']);
const THREE_DECIMAL = new Set(['BHD', 'IQD', 'JOD', 'KWD', 'LYD', 'OMR', 'TND']);

export function currencyDecimals(currency: string): number {
  const code = currency.toUpperCase();
  if (ZERO_DECIMAL.has(code)) return 0;
  if (THREE_DECIMAL.has(code)) return 3;
  return 2;
}

export function parseMoney(raw: string, decimals: number): number {
  let value = raw.trim();
  if (!value) return 0;
  const negative = /^\(.*\)$/.test(value) || /^-/.test(value) || value.includes('−');
  value = value.replace(/[()−\-+\s\u00A0]/g, '').replace(/[^0-9.,]/g, '');
  if (!value) throw new Error(`“${raw}” is not a number.`);

  const lastDot = value.lastIndexOf('.');
  const lastComma = value.lastIndexOf(',');
  let decimalMark = '';
  if (lastDot >= 0 && lastComma >= 0) decimalMark = lastDot > lastComma ? '.' : ',';
  else {
    const mark = lastDot >= 0 ? '.' : lastComma >= 0 ? ',' : '';
    const tail = mark ? value.length - value.lastIndexOf(mark) - 1 : 0;
    if (mark && tail > 0 && tail <= Math.max(3, decimals) && !(tail === 3 && decimals !== 3)) decimalMark = mark;
  }

  const pieces = decimalMark ? value.split(decimalMark) : [value];
  const fraction = decimalMark ? pieces.pop() ?? '' : '';
  const whole = pieces.join('').replace(/[.,]/g, '') || '0';
  const padded = (fraction + '0'.repeat(decimals)).slice(0, decimals);
  const minor = Number(whole) * 10 ** decimals + Number(padded || 0);
  if (!Number.isSafeInteger(minor)) throw new Error(`“${raw}” is too large to reconcile safely.`);
  return negative ? -minor : minor;
}

export function minorToDecimal(minor: number, decimals: number): string {
  const sign = minor < 0 ? '-' : '';
  const absolute = Math.abs(minor);
  if (decimals === 0) return `${sign}${absolute}`;
  return `${sign}${Math.floor(absolute / 10 ** decimals)}.${String(absolute % 10 ** decimals).padStart(decimals, '0')}`;
}

export function formatMoney(minor: number, currency: string, decimals = currencyDecimals(currency)): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency', currency, minimumFractionDigits: decimals, maximumFractionDigits: decimals,
    }).format(minor / 10 ** decimals);
  } catch {
    return `${currency} ${minorToDecimal(minor, decimals)}`;
  }
}
