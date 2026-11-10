"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, ArrowUpRight, BarChart3, Link2, LockKeyhole, Sparkles, Globe2, Plus } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { loginWithGoogle } from "@/lib/auth";
import { messageOf } from "@/lib/utils";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function start() {
    if (user) { router.push("/mypage"); return; }
    setBusy(true); setError("");
    try { await loginWithGoogle(); router.push("/mypage"); } catch (e) { setError(messageOf(e)); } finally { setBusy(false); }
  }
  return (
    <div className="landing">
      <div className="ambient ambient-a" /><div className="ambient ambient-b" />
      <section className="hero wrap">
        <div className="eyebrow"><Sparkles size={15}/> 당신의 온라인 공간, 하나의 링크로</div>
        <h1>당신의 모든 링크,<br/><span className="gradient-text">하나의 공간에.</span></h1>
        <p className="hero-desc">SNS, 포트폴리오, 블로그까지. 나를 소개하는 모든 링크를 아름다운 페이지 하나에 담아보세요.</p>
        <div className="hero-actions"><button className="btn btn-primary btn-large" onClick={start} disabled={busy}>무료로 시작하기 <ArrowRight size={19}/></button><Link className="btn btn-outline btn-large" href="/demo">데모 체험하기 <ArrowUpRight size={18}/></Link></div>
        {error && <p className="error-line" role="alert">{error}</p>}
        <div className="hero-trust"><span className="online-dot"/> 클릭 통계 · Google 로그인 · 안전한 개인 페이지</div>
        <div className="hero-preview">
          <div className="preview-sidebar"><span className="pill-muted">DASHBOARD PREVIEW</span><div className="preview-heading">내 공간 관리하기</div><div className="preview-kpis"><div><strong>3</strong><span>등록된 링크</span></div><div><strong>1,284</strong><span>총 클릭 수</span></div></div><div className="preview-item"><span className="preview-icon">◈</span><span><b>나의 포트폴리오</b><small>portfolio.example.com</small></span><span className="preview-count">842</span></div><div className="preview-item"><span className="preview-icon">◎</span><span><b>Instagram</b><small>instagram.com</small></span><span className="preview-count">321</span></div><div className="preview-item"><span className="preview-icon">✳</span><span><b>GitHub</b><small>github.com</small></span><span className="preview-count">121</span></div><div className="preview-add"><Plus size={15}/> 새 링크 추가</div></div>
          <div className="preview-phone"><div className="preview-avatar">M</div><h3>My Creative Space</h3><p>만드는 것을 좋아하는 사람입니다 ✨</p><div className="phone-link">포트폴리오 <ArrowUpRight size={16}/></div><div className="phone-link">Instagram <ArrowUpRight size={16}/></div><div className="phone-link">GitHub <ArrowUpRight size={16}/></div><small>made with mylink</small></div>
        </div>
      </section>
      <section className="features wrap"><div className="section-kicker">EVERYTHING YOU NEED</div><h2>링크 관리, 이보다 쉬울 수 없어요.</h2><p className="section-desc">필요한 기능은 모두 담고, 복잡함은 덜었습니다.</p>
        <div className="features-grid"><article className="feature-card"><span className="feature-icon purple"><Link2 size={23}/></span><h3>쉬운 링크 관리</h3><p>링크 추가·수정·삭제를 간편하게. 모든 변경은 클라우드에 안전하게 저장됩니다.</p></article><article className="feature-card"><span className="feature-icon blue"><BarChart3 size={23}/></span><h3>한눈에 보는 클릭 통계</h3><p>어떤 링크에 관심이 많은지 확인하고, 인기 링크를 통계로 확인하세요.</p></article><article className="feature-card"><span className="feature-icon teal"><Globe2 size={23}/></span><h3>나만의 공유 페이지</h3><p>mylink.site/username처럼 기억하기 쉬운 주소를 만들어 친구들에게 공유해요.</p></article><article className="feature-card"><span className="feature-icon rose"><LockKeyhole size={23}/></span><h3>내 데이터는 내가 관리</h3><p>누구나 링크를 볼 수 있지만, 프로필과 링크를 수정할 수 있는 건 나뿐이에요.</p></article></div>
      </section>
      <section className="bottom-cta wrap"><div className="cta-panel"><span className="section-kicker">READY TO GET STARTED?</span><h2>나만의 링크 페이지를<br/>지금 만들어보세요.</h2><p>몇 번의 클릭이면 충분합니다.</p><button className="btn btn-primary btn-large" onClick={start}>시작하기 <ArrowRight size={18}/></button></div></section>
      <footer className="footer">© 2026 mylink · Next.js + Firebase 학습 프로젝트</footer>
    </div>
  );
}
