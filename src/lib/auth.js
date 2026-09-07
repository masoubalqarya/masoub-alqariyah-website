import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

export async function saveCustomer(user) {
  if (!user?.uid || user.isAnonymous) return;
  const customerRef = doc(db, "customers", user.uid);
  await setDoc(
    customerRef,
    {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function ensureAuth() {
  if (auth.currentUser) return auth.currentUser;
  const cred = await signInAnonymously(auth);
  return cred.user;
}

export async function signInWithEmail(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function signUpWithEmail(email, password, displayName) {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  if (displayName) {
    await updateProfile(userCredential.user, { displayName });
  }
  await saveCustomer(userCredential.user);
  return userCredential.user;
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  await saveCustomer(userCredential.user);
  return userCredential.user;
}

export async function signOut() {
  await firebaseSignOut(auth);
}

export function mapAuthError(code) {
  switch (code) {
    case "auth/invalid-email":
      return "invalidEmail";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "invalidCredentials";
    case "auth/email-already-in-use":
      return "emailInUse";
    case "auth/weak-password":
      return "weakPassword";
    default:
      return "authError";
  }
}
