export type UserProfile = {
  uid: string;
  username: string;
  displayName: string;
  bio: string;
  photoURL: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type MyLink = {
  id: string;
  title: string;
  url: string;
  clickCount: number;
  position: number;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type LinkInput = Pick<MyLink, "title" | "url">;
