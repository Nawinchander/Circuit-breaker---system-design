//// redis cache

class CircuitBreaker {
  constructor(service, fallback, threshold = 3, timeout = 5000) {
    this.service = service;
    this.fallback = fallback;
    this.threshold = threshold;
    this.timeout = timeout;
    this.failures = 0;
    this.state = "CLOSED";
    this.nextTry = Date.now();
  }

  async call(...args) {
    if (this.state === "OPEN") {
      if (Date.now() > this.nextTry) {
        this.state = "HALF";
      } else {
        return this.fallback(...args);
      }
    }

    try {
      const result = await this.service(...args);
      this.failures = 0;
      this.state = "CLOSED";
      return result;
    } catch (err) {
      this.failures++;
      if (this.failures >= this.threshold) {
        this.state = "OPEN";
        this.nextTry = Date.now() + this.timeout;
      }
      return this.fallback(...args);
    }
  }
}

// Redis service
async function fetchFromRedis(productId) {
  if (Math.random() < 0.7) throw new Error("Redis unavailable");
  return { productId, source: "Redis Cache" };
}

// Fallback to DB
async function fetchFromDB(productId) {
  return { productId, source: "Database" };
}

const cacheBreaker = new CircuitBreaker(fetchFromRedis, fetchFromDB);

(async () => {
  console.log(await cacheBreaker.call(101));
})();



