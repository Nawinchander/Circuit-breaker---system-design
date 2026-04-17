//// Circuit Breaker for Inventory Service

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

  async call(itemId) {
    if (this.state === "OPEN") {
      if (Date.now() > this.nextTry) {
        this.state = "HALF";
      } else {
        return this.fallback(itemId);
      }
    }

    try {
      const result = await this.service(itemId);
      this.failures = 0;
      this.state = "CLOSED";
      return result;
    } catch {
      this.failures++;
      if (this.failures >= this.threshold) {
        this.state = "OPEN";
        this.nextTry = Date.now() + this.timeout;
      }
      return this.fallback(itemId);
    }
  }
}

async function inventoryCheck(itemId) {
  if (Math.random() < 0.8) throw new Error("Inventory service down");
  return { itemId, stock: 10 };
}

async function inventoryFallback(itemId) {
  return { itemId, stock: "Unknown" };
}

const inventoryBreaker = new CircuitBreaker(
  inventoryCheck,
  inventoryFallback
);

(async () => {
  console.log(await inventoryBreaker.call("ITEM123"));
})();


