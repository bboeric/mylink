"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Link2, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { loginWithGoogle, logout } from "@/lib/auth";
import { messageOf } from "@/lib/utils";

export function Header() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function doLogin() {
    setBusy(true); setMessage("");
    try { await loginWithGoogle(); router.push("/mypage"); } catch (e) { setMessage(messageOf(e)); } finally { setBusy(false); }
  }
  async function doLogout() {
    setBusy(true);
    try { await logout(); router.push("/"); } catch (e) { setMessage(messageOf(e)); } finally { setBusy(false); }
  }
  return (
    <header className="topbar">
      <div className="nav-inner">
        <Link className="brand" href="/"><span className="brand-icon"><Link2 size={20} strokeWidth={2.7} /></span><span>my<span className="gradient-text">link</span></span></Link>
        <nav className="nav-actions">
          <Link className="nav-link" href="/demo">미리 체험 <ArrowUpRight size={14} /></Link>
          {user ? (
            <><span className="nav-link">{profile?.displayName || user.displayName || "사용자"}님</span><Link className="btn btn-ghost btn-small" href="/mypage"><LayoutDashboard size={16}/> 마이페이지</Link><button className="btn btn-outline btn-small" disabled={busy} onClick={doLogout}><LogOut size={15} /> 로그아웃</button></>
          ) : <button className="btn btn-primary btn-small" onClick={doLogin} disabled={busy || loading}>Google로 시작하기 <ArrowUpRight size={15}/></button>}
        </nav>
      </div>
      {message && <div className="nav-error" role="alert">{message}</div>}
    </header>
  );
}
