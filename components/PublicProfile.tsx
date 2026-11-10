"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight, Link2, RefreshCcw } from "lucide-react";
import { getPublicProfile, registerClick } from "@/lib/data";
import type { MyLink, UserProfile } from "@/lib/types";
import { messageOf } from "@/lib/utils";

type Result = { profile: UserProfile; links: MyLink[] };
export function PublicProfile({ username }: { username: string }) {
  const [result, setResult] = useState<Result | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    setStatus("loading");
    getPublicProfile(username).then((data) => {
      if (!alive) return;
      if (!data) { setStatus("missing"); return; }
      setResult(data); setStatus("ready");
    }).catch((e) => { if (alive) { setError(messageOf(e)); setStatus("error"); } });
    return () => { alive = false; };
  }, [username]);
  if (status === "loading") return <div className="center-section"><div className="spinner"/><p>공개 링크를 불러오고 있어요...</p></div>;
  if (status === "missing") return <div className="center-section"><div className="icon-orb">404</div><h1>아직 없는 페이지예요</h1><p className="muted">/{username} 사용자를 찾지 못했습니다.</p><Link className="btn btn-primary" href="/"><ArrowLeft size={16}/> 홈으로 돌아가기</Link></div>;
  if (status === "error" || !result) return <div className="center-section"><h1>페이지를 불러올 수 없어요</h1><p className="error-line">{error}</p><button className="btn btn-outline" onClick={() => window.location.reload()}><RefreshCcw size={16}/> 다시 시도</button></div>;
  const { profile, links } = result;
  return <section className="public-shell"><div className="public-decoration decoration-left"/><div className="public-decoration decoration-right"/><div className="public-card"><div className="public-avatar">{profile.displayName.trim().slice(0, 1).toUpperCase() || "M"}</div><h1>{profile.displayName}</h1><span className="public-handle">@{profile.username}</span><p className="public-bio">{profile.bio}</p><div className="public-link-list">{links.map((link) => <a key={link.id} className="public-link" target="_blank" rel="noopener noreferrer" href={link.url} onClick={() => { void registerClick(profile.uid, link.id).catch(console.error); }}><span className="public-link-symbol"><Link2 size={18}/></span><span>{link.title}</span><ArrowUpRight size={19}/></a>)}{links.length === 0 && <div className="empty-public">아직 등록된 링크가 없어요.</div>}</div><Link className="made-with" href="/"><Link2 size={16}/> made with <b>mylink</b></Link></div></section>;
}
