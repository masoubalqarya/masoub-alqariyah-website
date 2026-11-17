const inFlight = new Map();

/** Persist the original request before sending, so a lost response can be retried safely. */
export function submitOrderOnce({ userId, payload, storage, createRequestId, send }) {
  if (inFlight.has(userId)) return inFlight.get(userId);
  const task = (async () => {
    const key = `pending-order-v1:${userId}`;
    const saved = await storage.getItem(key);
    const pending = saved ? JSON.parse(saved) : { requestId: createRequestId(), order: payload };
    await storage.setItem(key, JSON.stringify(pending));
    let result;
    try {
      result = await send(pending);
    } catch (error) {
      // These errors reject creation. Let the customer correct the draft/branch.
      // Timeouts, network errors and unknown outcomes must keep the original ID.
      if (["functions/invalid-argument", "functions/failed-precondition", "functions/unauthenticated", "functions/permission-denied"].includes(error?.code)) {
        await storage.removeItem(key);
      }
      throw error;
    }
    if (!result?.id || !/^[1-9]\d*$/.test(result.orderNumber) || !result.orderDate)
      throw new Error("Invalid order confirmation");
    await storage.removeItem(key);
    return result;
  })();
  inFlight.set(userId, task);
  task.finally(() => {
    if (inFlight.get(userId) === task) inFlight.delete(userId);
  }).catch(() => {});
  return task;
}
