// Token-bucket rate limiter for Bitrix24 REST. Honours rps + burst and is
// drained per logical request (each nested call inside a batch counts too).
export class TokenBucket {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private readonly capacity: number,
    private readonly refillPerMs: number,
  ) {
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    this.tokens = Math.min(this.capacity, this.tokens + (elapsed * this.refillPerMs));
    this.lastRefill = now;
  }

  /** Wait until one token is available, then consume it. */
  async acquire(count = 1): Promise<void> {
    while (true) {
      this.refill();
      if (this.tokens >= count) {
        this.tokens -= count;
        return;
      }
      const deficit = count - this.tokens;
      const waitMs = Math.ceil(deficit / this.refillPerMs);
      await new Promise((r) => setTimeout(r, Math.max(waitMs, 1)));
    }
  }
}