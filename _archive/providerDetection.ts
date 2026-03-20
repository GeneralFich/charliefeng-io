/**
 * @fileoverview AI Provider Detection
 *
 * Determines which AI provider to use at runtime by probing network
 * connectivity to the Google Generative Language API.  If the probe
 * succeeds (or is uncertain), we default to Gemini.  If it times out
 * or fails with a network error (typical in mainland China where
 * Google services are blocked), we fall back to DeepSeek.
 *
 * The result is cached in sessionStorage so the probe only runs once
 * per browser session.
 */

export type AIProvider = 'gemini' | 'deepseek';

const CACHE_KEY = 'ai_provider_v1';
const PROBE_TIMEOUT_MS = 5000;

/**
 * Probes connectivity to the Google Generative Language API.
 * Returns true if the endpoint appears reachable, false otherwise.
 */
async function probeGemini(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);

    // mode: 'no-cors' returns an opaque response for reachable hosts but
    // throws a network error (AbortError / TypeError) when the host is
    // blocked at the network level (e.g. GFW in mainland China).
    await fetch('https://generativelanguage.googleapis.com/', {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal,
    });

    clearTimeout(timer);
    return true;
  } catch {
    // Network blocked, DNS failure, or probe timed out — assume unavailable.
    return false;
  }
}

/**
 * Detects which AI provider should be used for this session.
 *
 * Strategy:
 * 1. Return a cached result from sessionStorage if available.
 * 2. Otherwise, probe Google's API endpoint with a 5-second timeout.
 * 3. If the probe succeeds → Gemini.  If it fails → DeepSeek.
 *
 * The probe runs in parallel with the user composing their first message,
 * so by the time they hit send the decision is almost always ready.
 */
export async function detectProvider(): Promise<AIProvider> {
  // Return cached result from a previous detection this session.
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached === 'gemini' || cached === 'deepseek') return cached;
  } catch {
    // sessionStorage unavailable (e.g. private browsing restrictions) — proceed.
  }

  const reachable = await probeGemini();
  const provider: AIProvider = reachable ? 'gemini' : 'deepseek';

  try {
    sessionStorage.setItem(CACHE_KEY, provider);
  } catch {
    // Ignore storage errors — detection still works, just not cached.
  }

  return provider;
}
