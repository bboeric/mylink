import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "./firebase";

export async function loginWithGoogle(): Promise<void> {
  if (!auth) throw new Error("Firebase 설정이 필요합니다.");
  await signInWithPopup(auth, new GoogleAuthProvider());
}

export async function logout(): Promise<void> {
  if (auth) await signOut(auth);
}
