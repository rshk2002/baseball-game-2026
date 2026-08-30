/**
 * 베스트에포트 인메모리 rate limiter.
 * 서버리스에서는 인스턴스별로 카운트되지만, 단일 인스턴스로 몰리는
 * 악의적 반복 호출을 막는 1차 방어선으로는 충분하다.
 * 트래픽이 커지면 Upstash Ratelimit 등으로 교체.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30; // 분당 30회

export function rateLimit(key: string): { allowed: boolean } {
  const now = Date.now();

  // 주기적으로 만료 버킷 정리 (메모리 누수 방지)
  if (buckets.size > 10_000) {
    for (const [k, b] of buckets) {
      if (b.resetAt < now) buckets.delete(k);
    }
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }
  bucket.count += 1;
  return { allowed: bucket.count <= MAX_REQUESTS };
}

export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0].trim() ?? "unknown";
}
