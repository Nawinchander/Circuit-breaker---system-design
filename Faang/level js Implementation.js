// Level JavaScript Implementation

// This is a production-style JS implementation.


class CircuitBreaker {
  constructor(service, options = {}) {
    this.service = service;

    this.failureThreshold = options.failureThreshold || 5;
    this.recoveryTimeout = options.recoveryTimeout || 5000;
    this.successThreshold = options.successThreshold || 2;

    this.state = "CLOSED";
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = Date.now();
  }

  async call(...args) {
    if (this.state === "OPEN") {
      if (Date.now() > this.nextAttempt) {
        this.state = "HALF_OPEN";
      } else {
        throw new Error("Circuit is OPEN. Request blocked.");
      }
    }

    try {
      const response = await this.service(...args);
      return this.onSuccess(response);
    } catch (error) {
      return this.onFailure(error);
    }
  }

  onSuccess(response) {
    if (this.state === "HALF_OPEN") {
      this.successCount++;

      if (this.successCount >= this.successThreshold) {
        this.state = "CLOSED";
        this.failureCount = 0;
        this.successCount = 0;
      }
    }

    return response;
  }

  onFailure(error) {
    this.failureCount++;

    if (this.failureCount >= this.failureThreshold) {
      this.state = "OPEN";
      this.nextAttempt = Date.now() + this.recoveryTimeout;
    }

    throw error;
  }
}




