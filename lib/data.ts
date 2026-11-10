import type { User } from "firebase/auth";
import {
  addDoc, collection, deleteDoc, doc, getDoc, getDocs, increment,
  onSnapshot, orderBy, query, runTransaction, serverTimestamp, updateDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { requireDb } from "./firebase";
import type { LinkInput, MyLink, UserProfile } from "./types";
import { checkUsername, normalizeUsername, normalizeWebUrl } from "./utils";

function profileRef(uid: string) { return doc(requireDb(), "users", uid); }
function usernameRef(username: string) { return doc(requireDb(), "usernames", username); }
function linksRef(uid: string) { return collection(requireDb(), "users", uid, "links"); }
function linkRef(uid: string, id: string) { return doc(requireDb(), "users", uid, "links", id); }

function toProfile(data: Record<string, unknown>): UserProfile {
  return {
    uid: String(data.uid ?? ""), username: String(data.username ?? ""),
    displayName: String(data.displayName ?? ""), bio: String(data.bio ?? ""),
    photoURL: String(data.photoURL ?? ""), createdAt: data.createdAt, updatedAt: data.updatedAt,
  };
}

/** First login creates a profile + globally unique username in one transaction. */
export async function ensureProfile(user: User): Promise<UserProfile> {
  const db = requireDb();
  const current = await getDoc(profileRef(user.uid));
  if (current.exists()) return toProfile(current.data());

  // Email prefix is suggested by lecture; collision handled with suffix.
  const base = normalizeUsername(user.email?.split("@")[0] || user.displayName || "user")
    .replace(/^_+|_+$/g, "");
  const prefix = base.length >= 3 ? base : `user_${base}`;
  for (let attempt = 0; attempt < 30; attempt++) {
    const suffix = attempt ? `_${Math.random().toString(36).slice(2, 6)}` : "";
    const candidate = `${prefix.slice(0, 24 - suffix.length)}${suffix}`;
    if (!checkUsername(candidate)) continue;
    const created = await runTransaction(db, async (tx) => {
      const mine = await tx.get(profileRef(user.uid));
      if (mine.exists()) return toProfile(mine.data());
      const existing = await tx.get(usernameRef(candidate));
      if (existing.exists()) return null;
      const profile: UserProfile = {
        uid: user.uid, username: candidate,
        displayName: user.displayName || "새 사용자",
        bio: "안녕하세요! 저의 링크 모음입니다.",
        photoURL: user.photoURL || "",
      };
      tx.set(usernameRef(candidate), { uid: user.uid });
      tx.set(profileRef(user.uid), { ...profile, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      return profile;
    });
    if (created) return created;
  }
  throw new Error("사용 가능한 아이디를 생성하지 못했어요. 다시 시도해 주세요.");
}

export async function updateProfile(uid: string, next: Pick<UserProfile, "username" | "displayName" | "bio">): Promise<void> {
  const username = normalizeUsername(next.username);
  if (!checkUsername(username)) throw new Error("아이디는 영문 소문자, 숫자, 밑줄 3~24자로 입력해 주세요.");
  if (!next.displayName.trim() || next.displayName.trim().length > 60) throw new Error("표시 이름은 1~60자로 입력해 주세요.");
  if (next.bio.length > 250) throw new Error("소개는 250자 이내로 작성해 주세요.");
  const db = requireDb();
  await runTransaction(db, async (tx) => {
    const userDoc = await tx.get(profileRef(uid));
    if (!userDoc.exists()) throw new Error("프로필을 찾을 수 없습니다.");
    const before = toProfile(userDoc.data());
    if (username !== before.username) {
      const reserved = await tx.get(usernameRef(username));
      if (reserved.exists()) throw new Error("이미 사용 중인 아이디입니다.");
    }
    tx.update(profileRef(uid), {
      username, displayName: next.displayName.trim(), bio: next.bio.trim(), updatedAt: serverTimestamp(),
    });
    if (username !== before.username) {
      tx.set(usernameRef(username), { uid });
      tx.delete(usernameRef(before.username));
    }
  });
}

export function subscribeProfile(uid: string, callback: (profile: UserProfile | null) => void, onError: (error: Error) => void): Unsubscribe {
  return onSnapshot(profileRef(uid), (snap) => callback(snap.exists() ? toProfile(snap.data()) : null), onError);
}

export function subscribeLinks(uid: string, callback: (links: MyLink[]) => void, onError: (error: Error) => void): Unsubscribe {
  const q = query(linksRef(uid), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as MyLink)));
  }, onError);
}

export async function createLink(uid: string, value: LinkInput): Promise<void> {
  const title = value.title.trim();
  if (!title || title.length > 100) throw new Error("링크 제목은 1~100자로 입력해 주세요.");
  await addDoc(linksRef(uid), {
    title, url: normalizeWebUrl(value.url), clickCount: 0, position: Date.now(),
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  });
}

export async function editLink(uid: string, id: string, value: LinkInput): Promise<void> {
  const title = value.title.trim();
  if (!title || title.length > 100) throw new Error("링크 제목은 1~100자로 입력해 주세요.");
  await updateDoc(linkRef(uid, id), { title, url: normalizeWebUrl(value.url), updatedAt: serverTimestamp() });
}

export async function removeLink(uid: string, id: string): Promise<void> {
  await deleteDoc(linkRef(uid, id));
}

export async function getPublicProfile(username: string): Promise<{ profile: UserProfile; links: MyLink[] } | null> {
  if (!checkUsername(username)) return null;
  const name = await getDoc(usernameRef(username));
  if (!name.exists()) return null;
  const uid = name.data().uid;
  if (typeof uid !== "string") return null;
  const profileSnap = await getDoc(profileRef(uid));
  if (!profileSnap.exists()) return null;
  const profile = toProfile(profileSnap.data());
  if (profile.username !== username) return null;
  const snap = await getDocs(query(linksRef(uid), orderBy("createdAt", "desc")));
  return { profile, links: snap.docs.map((item) => ({ id: item.id, ...item.data() } as MyLink)) };
}

/** Atomic increment; Firestore rules allow only exactly +1 to a public counter. */
export async function registerClick(uid: string, linkId: string): Promise<void> {
  await updateDoc(linkRef(uid, linkId), { clickCount: increment(1) });
}
