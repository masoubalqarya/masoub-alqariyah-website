"use client";

import { useEffect, useReducer, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useMenuBuilders() {
  const [attempt, retry] = useReducer((value) => value + 1, 0);
  const [state, setState] = useState({ builders: null, loading: true, error: false });

  useEffect(() => onSnapshot(doc(db, "appSettings", "mobile"), { includeMetadataChanges: true }, (snapshot) => {
    // An unconfirmed missing offline document must not override explicit links.
    if (snapshot.metadata.fromCache && !snapshot.exists()) return;
    setState({ builders: snapshot.data()?.builders || {}, loading: false, error: false });
  }, () => {
    setState((current) => ({ ...current, loading: false, error: true }));
  }), [attempt]);

  return { ...state, retry };
}
