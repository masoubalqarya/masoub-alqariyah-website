"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { docWithId } from "@/lib/menuDefaults";

export function useRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "restaurants"), (snapshot) => {
      setRestaurants(snapshot.docs.map(docWithId));
      setLoading(false);
    });
    return unsub;
  }, []);

  const activeRestaurants = restaurants.filter((r) => r.isActive);

  return { restaurants, activeRestaurants, loading };
}
