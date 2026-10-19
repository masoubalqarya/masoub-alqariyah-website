import {
  collection,
  addDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { db, auth } from "./firebase";
import { ensureAuth } from "./auth";

/**
 * Create a new order document in Firestore.
 * Payload matches mobile `src/firebase/orders.js`.
 *
 * @param {Object} orderData
 * @param {Array} cartItems
 * @returns {Promise<string>} Firestore document ID
 */
export async function createOrder(orderData, cartItems) {
  const user = await ensureAuth();
  const orderDoc = {
    orderNumber: orderData.orderNumber ?? null,
    plateNumber: orderData.plateNumber ?? "",
    carColor: orderData.carColor ?? "",
    carModel: orderData.carModel ?? "",
    paymentMethod: orderData.paymentMethod ?? null,
    cashAmount: orderData.cashAmount ?? 0,
    changeAmount: orderData.changeAmount ?? 0,
    needsChange: orderData.needsChange ?? true,
    restaurantId: orderData.restaurantId ?? null,
    restaurantName: orderData.restaurantName ?? "",
    estimatedTime: orderData.estimatedTime ?? 15,
    status: "pending",
    userId: user.uid,
    items: cartItems.map((item) => ({
      itemId: item.id ?? null,
      nameEn: item.nameEn ?? item.name ?? "",
      nameAr: item.nameAr ?? item.name ?? "",
      price: item.price ?? 0,
      quantity: item.quantity ?? 1,
      ...(item.selectedSize && { selectedSize: item.selectedSize }),
      ...(item.selectedCookingOption && {
        selectedCookingOption: item.selectedCookingOption,
      }),
      ...(item.selectedExtras?.length > 0 && {
        selectedExtras: item.selectedExtras,
      }),
      ...(item.offerGroupId && {
        offerGroupId: item.offerGroupId,
        offerId: item.offerId ?? null,
        offerQty: item.offerQty ?? 1,
        offerTitleEn: item.offerTitleEn ?? "",
        offerTitleAr: item.offerTitleAr ?? "",
      }),
      subtotal: item.price * item.quantity,
    })),
    total: cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, "orders"), orderDoc);
  return docRef.id;
}

export function subscribeToOrder(docId, callback, onError) {
  const docRef = doc(db, "orders", docId);
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() });
      } else {
        callback(null);
      }
    },
    (error) => {
      if (onError) onError(error);
    },
  );
}

export async function fetchUserOrders() {
  const uid = auth.currentUser?.uid;
  if (!uid) return [];

  const q = query(
    collection(db, "orders"),
    where("userId", "==", uid),
    orderBy("createdAt", "desc"),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}
