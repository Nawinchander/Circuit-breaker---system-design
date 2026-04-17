/// Circuit Breaker for Notification Service

class CircuitBreaker {
  constructor(service, fallback, threshold = 2, timeout = 4000) {
    this.service = service;
    this.fallback = fallback;
    this.threshold = threshold;
    this.timeout = timeout;
    this.failures = 0;
    this.state = "CLOSED";
    this.nextTry = Date.now();
  }

  async call(user) {
    if (this.state === "OPEN") {
      if (Date.now() > this.nextTry) {
        this.state = "HALF";
      } else {
        return this.fallback(user);
      }
    }

    try {
      const result = await this.service(user);
      this.failures = 0;
      this.state = "CLOSED";
      return result;
    } catch {
      this.failures++;
      if (this.failures >= this.threshold) {
        this.state = "OPEN";
        this.nextTry = Date.now() + this.timeout;
      }
      return this.fallback(user);
    }
  }
}

async function sendSMS(user) {
  throw new Error("SMS gateway down");
}

async function sendEmail(user) {
  return `Email sent to ${user}`;
}

const notifyBreaker = new CircuitBreaker(sendSMS, sendEmail);

(async () => {
  console.log(await notifyBreaker.call("user@example.com"));
})();


