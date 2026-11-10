"use client";
import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowUpRight, BarChart3, Check, Copy, ExternalLink, Link2, Pencil, Plus, Save, Trash2, X, Globe2, UserRound } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { createLink, editLink, removeLink, subscribeLinks, updateProfile } from "@/lib/data";
import type { MyLink } from "@/lib/types";
import { messageOf, prettyHost } from "@/lib/utils";

export function DashboardClient() {
  const { user, profile, loading, error: authError } = useAuth();
  const [links, setLinks] = useState<MyLink[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [tab, setTab] = useState<"links" | "profile" | "stats">("links");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [newOpen, setNewOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<MyLink | null>(null);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");

  const uid = user?.uid;
  const hasProfile = Boolean(profile);
  useEffect(() => {
    if (!uid || !hasProfile) { setLoadingLinks(false); return; }
    setLoadingLinks(true);
    return subscribeLinks(uid, (items) => { setLinks(items); setLoadingLinks(false); }, (e) => { setError(messageOf(e)); setLoadingLinks(false); });
  }, [uid, hasProfile]);
  useEffect(() => {
    if (!profile) return;
    setUsername(profile.username); setDisplayName(profile.displayName); setBio(profile.bio);
  }, [profile]);

  const totalClicks = useMemo(() => links.reduce((sum, l) => sum + (l.clickCount || 0), 0), [links]);
  const topLinks = useMemo(() => [...links].sort((a, b) => b.clickCount - a.clickCount), [links]);
  const sharePath = profile ? `/${profile.username}` : "";
  async function addLink(event: FormEvent) {
    event.preventDefault(); if (!user) return;
    setSaving(true); setError("");
    try { await createLink(user.uid, { title, url }); setTitle(""); setUrl(""); setNewOpen(false); setNotice("링크를 추가했어요."); }
    catch (e) { setError(messageOf(e)); } finally { setSaving(false); }
  }
  async function saveLink(event: FormEvent) {
    event.preventDefault(); if (!user || !editId) return;
    setSaving(true); setError("");
    try { await editLink(user.uid, editId, { title: editTitle, url: editUrl }); setEditId(null); setNotice("링크를 수정했어요."); }
    catch (e) { setError(messageOf(e)); } finally { setSaving(false); }
  }
  async function confirmDelete() {
    if (!user || !deleteTarget) return;
    setSaving(true); setError("");
    try { await removeLink(user.uid, deleteTarget.id); setDeleteTarget(null); setNotice("링크를 삭제했어요."); }
    catch (e) { setError(messageOf(e)); } finally { setSaving(false); }
  }
  async function saveProfile(event: FormEvent) {
    event.preventDefault(); if (!user) return;
    setSaving(true); setError("");
    try { await updateProfile(user.uid, { username, displayName, bio }); setNotice("프로필을 저장했어요."); }
    catch (e) { setError(messageOf(e)); } finally { setSaving(false); }
  }
  async function copyShare() {
    if (!sharePath) return;
    try { await navigator.clipboard.writeText(`${window.location.origin}${sharePath}`); setNotice("공유 주소를 복사했어요."); }
    catch { setError("주소 복사가 차단되었어요. 주소창에서 직접 복사해 주세요."); }
  }
  if (loading) return <div className="center-section"><div className="spinner"/><p>내 공간을 불러오고 있어요...</p></div>;
  if (!user) return <section className="center-section"><div className="icon-orb"><UserRound size={30}/></div><h1>로그인이 필요해요</h1><p className="muted">상단의 Google로 시작하기 버튼으로 로그인해 주세요.</p><Link href="/demo" className="btn btn-outline">로그인 없이 체험하기</Link></section>;
  if (authError || !profile) return <section className="center-section"><h1>프로필을 준비하지 못했어요</h1><p className="error-line">{authError || "다시 새로고침해 주세요."}</p><p className="muted">Firestore 데이터베이스와 보안 규칙이 설정되었는지 확인해 주세요.</p></section>;

  return (
    <div className="dashboard wrap">
      <div className="dash-greeting"><div><span className="section-kicker">MY WORKSPACE</span><h1>안녕하세요, {profile.displayName}님 <span className="wave">✳</span></h1><p className="muted">나만의 링크 공간을 관리해 보세요.</p></div><Link href={sharePath} target="_blank" className="btn btn-outline"><ExternalLink size={17}/> 내 페이지 보기</Link></div>
      <div className="stats-overview"><div className="kpi"><span className="kpi-label"><Link2 size={16}/> 등록한 링크</span><strong>{links.length}<small>개</small></strong><span className="kpi-foot">현재 공개 중</span></div><div className="kpi"><span className="kpi-label"><BarChart3 size={16}/> 총 클릭 수</span><strong>{totalClicks.toLocaleString()}<small>회</small></strong><span className="kpi-foot">모든 링크 합계</span></div><div className="kpi kpi-accent"><span className="kpi-label"><Globe2 size={16}/> 내 공유 주소</span><strong className="kpi-username">/{profile.username}</strong><button className="text-action" onClick={copyShare}><Copy size={14}/> 주소 복사</button></div></div>
      <div className="dashboard-main"><div className="dashboard-content">
        <div className="tab-row"><button className={`tab ${tab === "links" ? "active" : ""}`} onClick={() => setTab("links")}><Link2 size={17}/> 링크 관리</button><button className={`tab ${tab === "profile" ? "active" : ""}`} onClick={() => setTab("profile")}><UserRound size={17}/> 프로필 편집</button><button className={`tab ${tab === "stats" ? "active" : ""}`} onClick={() => setTab("stats")}><BarChart3 size={17}/> 클릭 통계</button></div>
        {error && <div className="alert error" role="alert">{error}<button aria-label="닫기" onClick={() => setError("")}><X size={16}/></button></div>}
        {notice && <div className="alert success" role="status">{notice}<button aria-label="닫기" onClick={() => setNotice("")}><X size={16}/></button></div>}
        {tab === "links" && <section className="panel"><div className="panel-head"><div><h2>내 링크 <span className="count-badge">{links.length}</span></h2><p>공유 페이지에 표시할 링크를 관리해요.</p></div><button className="btn btn-primary" onClick={() => setNewOpen((v) => !v)}><Plus size={18}/> 링크 추가</button></div>
          {newOpen && <form className="editor-card" onSubmit={addLink}><h3>새 링크 추가</h3><label className="field-label">링크 이름<input autoFocus required maxLength={100} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 나의 포트폴리오" /></label><label className="field-label">웹사이트 주소<input required value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" /></label><div className="editor-actions"><button type="button" className="btn btn-outline" onClick={() => setNewOpen(false)}>취소</button><button type="submit" className="btn btn-primary" disabled={saving}><Plus size={16}/> 추가하기</button></div></form>}
          {loadingLinks ? <div className="empty">링크를 불러오고 있어요...</div> : links.length === 0 ? <div className="empty"><div className="empty-icon"><Link2 size={28}/></div><h3>아직 등록한 링크가 없어요</h3><p>첫 번째 링크를 등록하고 나만의 페이지를 완성해 보세요.</p><button className="btn btn-primary" onClick={() => setNewOpen(true)}><Plus size={17}/> 첫 링크 추가</button></div> : <div className="link-list">{links.map((item) => <div className="link-row" key={item.id}>{editId === item.id ? <form className="inline-edit" onSubmit={saveLink}><label className="field-label">제목<input required maxLength={100} value={editTitle} onChange={e => setEditTitle(e.target.value)}/></label><label className="field-label">URL<input required value={editUrl} onChange={e => setEditUrl(e.target.value)}/></label><div className="editor-actions"><button type="button" className="btn btn-outline btn-small" onClick={() => setEditId(null)}>취소</button><button className="btn btn-primary btn-small" disabled={saving}><Save size={15}/> 저장</button></div></form> : <><div className="link-favicon">{item.title.slice(0, 1).toUpperCase()}</div><div className="link-info"><b>{item.title}</b><a target="_blank" rel="noopener noreferrer" href={item.url}>{prettyHost(item.url)} <ArrowUpRight size={13}/></a></div><div className="row-clicks"><BarChart3 size={14}/>{item.clickCount || 0}</div><button className="icon-button" title="수정" aria-label={`${item.title} 수정`} onClick={() => { setEditId(item.id); setEditTitle(item.title); setEditUrl(item.url); }}><Pencil size={17}/></button><button className="icon-button danger-icon" title="삭제" aria-label={`${item.title} 삭제`} onClick={() => setDeleteTarget(item)}><Trash2 size={17}/></button></>}</div>)}</div>}
        </section>}
        {tab === "profile" && <section className="panel"><div className="panel-head"><div><h2>프로필 편집</h2><p>공개 페이지에서 보이는 정보를 변경할 수 있어요.</p></div></div><form onSubmit={saveProfile} className="profile-form"><div className="form-avatar">{displayName.trim().slice(0, 1).toUpperCase() || "M"}</div><label className="field-label">공유 아이디<span className="field-hint">영문 소문자, 숫자, 밑줄 3~24자 · 중복 사용 불가</span><div className="prefix-input"><span>/</span><input required minLength={3} maxLength={24} pattern="[a-z0-9_]{3,24}" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())}/></div></label><label className="field-label">표시할 이름<input required maxLength={60} value={displayName} onChange={(e) => setDisplayName(e.target.value)} /></label><label className="field-label">소개글<textarea rows={4} maxLength={250} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="나를 표현하는 짧은 글"/></label><button type="submit" className="btn btn-primary" disabled={saving}><Save size={17}/> 프로필 저장</button></form></section>}
        {tab === "stats" && <section className="panel"><div className="panel-head"><div><h2>클릭 통계</h2><p>어떤 링크가 가장 인기 있는지 확인해 보세요.</p></div></div><div className="stat-highlight"><span>전체 링크 클릭 수</span><strong>{totalClicks.toLocaleString()} <small>clicks</small></strong></div><h3 className="chart-heading">링크별 클릭 수</h3>{links.length === 0 ? <div className="empty">등록된 링크가 없습니다.</div> : <div className="chart-list">{topLinks.map((link) => <div className="chart-line" key={link.id}><div className="chart-row-head"><span>{link.title}</span><strong>{link.clickCount || 0}회</strong></div><div className="chart-track"><div className="chart-fill" style={{width: `${totalClicks === 0 ? 0 : (link.clickCount || 0) / Math.max(1, topLinks[0].clickCount) * 100}%`}}/></div></div>)}</div>}</section>}
      </div><aside className="dashboard-aside"><div className="aside-card"><span className="section-kicker">LIVE PREVIEW</span><div className="aside-profile"><div className="form-avatar small">{profile.displayName.slice(0,1)}</div><h3>{profile.displayName}</h3><p>{profile.bio}</p></div><div className="aside-links">{links.slice(0, 3).map((link) => <div key={link.id}>{link.title} <ArrowUpRight size={15}/></div>)}{links.length === 0 && <span className="muted">링크를 추가하면 이곳에 표시돼요.</span>}</div><Link className="btn btn-outline btn-block" href={sharePath} target="_blank">공개 페이지 열기 <ExternalLink size={16}/></Link></div><div className="tip-card"><Check size={17}/><div><b>공개 페이지는 누구나 열람 가능해요.</b><p>링크 추가, 수정, 삭제는 로그인한 본인만 할 수 있습니다.</p></div></div></aside></div>
      {deleteTarget && <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setDeleteTarget(null); }}><div className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-title"><div className="delete-symbol"><Trash2 size={25}/></div><h2 id="delete-title">이 링크를 삭제할까요?</h2><p><b>{deleteTarget.title}</b> 링크가 영구 삭제됩니다. 클릭 통계도 함께 사라져요.</p><div className="modal-buttons"><button className="btn btn-outline" onClick={() => setDeleteTarget(null)}>취소</button><button className="btn btn-danger" onClick={confirmDelete} disabled={saving}>삭제하기</button></div></div></div>}
    </div>
  );
}
