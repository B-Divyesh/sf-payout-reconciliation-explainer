const SLUG = 'payout-reconciliation-explainer';
const STORAGE_KEY = `sb_license:${SLUG}`;
const VERDICT_KEY = `${STORAGE_KEY}:verdict`;
const DAY = 86_400_000;
/** Production is the safe default. Staging must opt into the pilot host explicitly. */
export const billingBase = (import.meta.env.VITE_BILLING_BASE || 'https://api.sociobot.in').replace(/\/$/, '');

export interface LicenseState {
  unlocked: boolean;
  checking: boolean;
  message: string;
}

interface CachedVerdict { valid: boolean; checkedAt: number; }

export const checkoutUrl = `${billingBase}/api/v1/products/${SLUG}/checkout`;

export function captureReturnedLicense(): void {
  const url = new URL(location.href);
  const token = url.searchParams.get('license');
  if (!token) return;
  localStorage.setItem(STORAGE_KEY, token);
  url.searchParams.delete('license');
  history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

export function storeLicense(token: string): void {
  localStorage.setItem(STORAGE_KEY, token.trim());
  localStorage.removeItem(VERDICT_KEY);
}

export function clearLicense(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(VERDICT_KEY);
}

export async function getLicenseState(force = false): Promise<LicenseState> {
  const token = localStorage.getItem(STORAGE_KEY);
  if (!token) return { unlocked: false, checking: false, message: '' };
  const cached = JSON.parse(localStorage.getItem(VERDICT_KEY) || 'null') as CachedVerdict | null;
  if (!force && cached && Date.now() - cached.checkedAt < DAY) {
    return { unlocked: cached.valid, checking: false, message: cached.valid ? 'Desk license active.' : 'License no longer active.' };
  }
  const optimistic = cached?.valid === true;
  try {
    const response = await fetch(`${billingBase}/api/v1/products/${SLUG}/verify?license=${encodeURIComponent(token)}`);
    if (response.status === 429) {
      return { unlocked: optimistic, checking: false, message: optimistic ? 'Using your last verified license while verification is temporarily rate limited.' : 'License verification is temporarily rate limited. Please try again shortly.' };
    }
    if (!response.ok) throw new Error('Verification service unavailable');
    const verdict = await response.json() as { valid: boolean; reason?: string };
    localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: verdict.valid, checkedAt: Date.now() } satisfies CachedVerdict));
    return { unlocked: verdict.valid, checking: false, message: verdict.valid ? 'Desk license active.' : 'License no longer active. You can restore another license below.' };
  } catch {
    return { unlocked: optimistic, checking: false, message: optimistic ? 'Using your last verified license while offline.' : 'Could not verify this license. Check your connection and try again.' };
  }
}
