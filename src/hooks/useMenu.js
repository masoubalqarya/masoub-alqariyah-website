"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { docWithId } from "@/lib/menuDefaults";

export function useMenu() {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [offers, setOffers] = useState([]);
  const [sizeOptions, setSizeOptions] = useState([]);
  const [extrasOptions, setExtrasOptions] = useState([]);
  const [allergiesOptions, setAllergiesOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribers = [
      onSnapshot(collection(db, "categories"), (snap) => {
        setCategories(snap.docs.map(docWithId));
      }),
      onSnapshot(collection(db, "menuItems"), (snap) => {
        setMenuItems(snap.docs.map(docWithId));
      }),
      onSnapshot(
        query(collection(db, "offers"), where("isActive", "==", true)),
        (snap) => {
          setOffers(snap.docs.map(docWithId));
        },
      ),
      onSnapshot(collection(db, "sizeOptions"), (snap) => {
        setSizeOptions(snap.docs.map(docWithId));
      }),
      onSnapshot(collection(db, "extrasOptions"), (snap) => {
        setExtrasOptions(snap.docs.map(docWithId));
      }),
      onSnapshot(collection(db, "allergiesOptions"), (snap) => {
        setAllergiesOptions(snap.docs.map(docWithId));
        setLoading(false);
      }),
    ];

    return () => unsubscribers.forEach((u) => u());
  }, []);

  return {
    categories,
    menuItems,
    offers,
    sizeOptions,
    extrasOptions,
    allergiesOptions,
    loading,
  };
}
