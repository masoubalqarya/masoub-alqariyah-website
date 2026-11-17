export const isPickup = (order) => order?.fulfillmentType === "pickup";

export function orderStatusKey(order, status = order?.status) {
  if (isPickup(order) && status === "onTheWay") return "readyForPickup";
  if (isPickup(order) && status === "delivered") return "collected";
  return status;
}

// Missing fulfillmentType preserves the existing car-service contract.
export function fulfillmentFields(order) {
  const fulfillmentType = order.fulfillmentType ?? "driveThrough";
  if (!["driveThrough", "pickup"].includes(fulfillmentType)) {
    throw new Error("Invalid fulfillment type");
  }
  const pickup = fulfillmentType === "pickup";
  const plateNumber = pickup ? "" : (order.plateNumber ?? "").trim();
  if (!pickup && !plateNumber) throw new Error("Car plate is required");
  return {
    fulfillmentType,
    plateNumber,
    carColor: pickup ? "" : order.carColor ?? "",
    carModel: pickup ? "" : order.carModel ?? "",
  };
}
