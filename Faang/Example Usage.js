/// Example JS


async function paymentService() {
  if (Math.random() < 0.7) {
    throw new Error("Payment API failed");
  }
  return "Payment Success";
}

const breaker = new CircuitBreaker(paymentService, {
  failureThreshold: 3,
  recoveryTimeout: 3000,
  successThreshold: 2,
});

(async () => {
  for (let i = 0; i < 10; i++) {
    try {
      const result = await breaker.call();
      console.log("SUCCESS:", result);
    } catch (err) {
      console.log("ERROR:", err.message);
    }
  }
})();


//// possible output

// ERROR: Payment API failed
// ERROR: Payment API failed
// ERROR: Payment API failed
// ERROR: Circuit is OPEN. Request blocked.
// ERROR: Circuit is OPEN. Request blocked.

/// after timeout

// SUCCESS: Payment Success
// SUCCESS: Payment Success

// Then circuit closes again.
