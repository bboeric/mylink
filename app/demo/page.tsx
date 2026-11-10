"use client";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowUpRight, BarChart3, Link2, Plus, Trash2, Pencil, Save, Eye, RefreshCw } from "lucide-react";
import { normalizeWebUrl, messageOf } from "@/lib/utils";

type DemoLink = { id: string; title: string; url: string; clickCount: number };
const initialLinks: DemoLink[] = [
  { id: "1", title: "나의 포트폴리오", url: "https://example.com", clickCount: 27 },
  { id: "2", title: "GitHub", url: "https://github.com", clickCount: 14 },
  { id: "3", title: "Instagram", url: "https://instagram.com", clickCount: 9 },
];
const STORAGE_KEY = "mylink_demo_v1";
export default function DemoPage() {
  const [links, setLinks] = useState<DemoLink[]>(initialLinks);
  const [loaded, setLoaded] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    try { const saved = localStorage.getItem(STORAGE_KEY); if (saved) { const parsed = JSON.parse(saved); if (Array.isArray(parsed)) setLinks(parsed); } } catch { /* ignore broken demo storage */ }
    setLoaded(true);
  }, []);
  useEffect(() => { if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(links)); }, [loaded, links]);
  const clicks = useMemo(() => links.reduce((a, b) => a + b.clickCount, 0), [links]);
  function submit(e: FormEvent) {
    e.preventDefault();
    try {
      if (!title.trim() || title.length > 100) throw new Error("제목은 1~100자로 입력해 주세요.");
      const normalized = normalizeWebUrl(url);
      if (editId) setLinks((items) => items.map((item) => item.id === editId ? { ...item, title: title.trim(), url: normalized } : item));
      else setLinks((items) => [{ id: `${Date.now()}_${Math.random().toString(36).slice(2)}`, title: title.trim(), url: normalized, clickCount: 0 }, ...items]);
      setTitle(""); setUrl(""); setEditId(null); setFormOpen(false); setError("");
    } catch (err) { setError(messageOf(err)); }
  }
  function openEdit(item: DemoLink) { setTitle(item.title); setUrl(item.url); setEditId(item.id); setFormOpen(true); setPreview(false); }
  function clickLink(id: string) { setLinks((items) => items.map((l) => l.id === id ? { ...l, clickCount: l.clickCount + 1 } : l)); }
  return <div className="dashboard wrap"><div className="dash-greeting"><div><span className="section-kicker">INTERACTIVE DEMO</span><h1>마이링크 미리 체험하기 <span className="wave">✳</span></h1><p className="muted">Firebase 연결 없이 화면과 CRUD 흐름을 확인할 수 있어요.</p></div><button className="btn btn-outline" onClick={() => setPreview((v) => !v)}><Eye size={16}/>{preview ? "관리 화면" : "공개 페이지"} 보기</button></div><div className="demo-banner">체험 모드입니다. 링크는 현재 브라우저의 localStorage에만 저장되고, 실제 Google 로그인·Firestore·공유 기능은 동작하지 않습니다. 실제 서비스는 Firebase를 설정한 뒤 이용해 주세요.</div>
    {!preview ? <><div className="stats-overview"><div className="kpi"><span className="kpi-label"><Link2 size={16}/> 등록한 링크</span><strong>{links.length}</strong></div><div className="kpi"><span className="kpi-label"><BarChart3 size={16}/> 총 클릭 수</span><strong>{clicks}</strong></div><div className="kpi kpi-accent"><span className="kpi-label">데모 상태</span><strong className="kpi-username">로컬 체험</strong><button className="text-action" onClick={() => { if (confirm("체험 데이터를 초기화할까요?")) setLinks(initialLinks); }}><RefreshCw size={14}/> 초기화</button></div></div><section className="panel"><div className="panel-head"><div><h2>링크 관리</h2><p>추가·수정·삭제하고 공개 페이지에서 클릭을 테스트해 보세요.</p></div><button className="btn btn-primary" onClick={() => { setFormOpen(true); setEditId(null); setTitle(""); setUrl(""); }}><Plus size={17}/> 링크 추가</button></div>{error && <div className="alert error" role="alert">{error}</div>}{formOpen && <form className="editor-card" onSubmit={submit}><h3>{editId ? "링크 수정" : "새 링크"}</h3><label className="field-label">제목<input required value={title} maxLength={100} onChange={e => setTitle(e.target.value)} placeholder="포트폴리오"/></label><label className="field-label">URL<input required value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com"/></label><div className="editor-actions"><button type="button" className="btn btn-outline" onClick={() => setFormOpen(false)}>취소</button><button className="btn btn-primary"><Save size={16}/> 저장</button></div></form>}{links.length === 0 ? <div className="empty">링크가 없습니다. 링크를 추가해 보세요.</div> : <div className="link-list">{links.map((item) => <div className="link-row" key={item.id}><div className="link-favicon">{item.title[0]?.toUpperCase() || "L"}</div><div className="link-info"><b>{item.title}</b><a target="_blank" rel="noopener noreferrer" href={item.url}>{item.url.slice(0, 46)} <ArrowUpRight size={13}/></a></div><div className="row-clicks"><BarChart3 size={14}/>{item.clickCount}</div><button aria-label="수정" className="icon-button" onClick={() => openEdit(item)}><Pencil size={17}/></button><button aria-label="삭제" className="icon-button danger-icon" onClick={() => { if (confirm(`'${item.title}' 링크를 삭제할까요?`)) setLinks((ls) => ls.filter((l) => l.id !== item.id)); }}><Trash2 size={17}/></button></div>)}</div>}<h3 className="chart-heading">링크별 클릭 수</h3><div className="chart-list">{[...links].sort((a,b) => b.clickCount-a.clickCount).map((item) => <div key={item.id} className="chart-line"><div className="chart-row-head"><span>{item.title}</span><strong>{item.clickCount}회</strong></div><div className="chart-track"><div className="chart-fill" style={{width:`${clicks ? 100*item.clickCount/Math.max(1,...links.map(l=>l.clickCount)) : 0}%`}}/></div></div>)}</div></section></> : <section className="public-shell" style={{minHeight:"600px",borderRadius:"22px"}}><div className="public-card"><div className="public-avatar">M</div><h1>My Creative Space</h1><span className="public-handle">@demo</span><p className="public-bio">만드는 것을 좋아하는 사람입니다 ✨<br/>아래에서 제가 하는 일을 확인해 보세요.</p><div className="public-link-list">{links.map((item) => <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="public-link" onClick={() => clickLink(item.id)}><span className="public-link-symbol"><Link2 size={18}/></span><span>{item.title}</span><ArrowUpRight size={19}/></a>)}{links.length === 0 && <div className="empty-public">등록된 링크가 없어요.</div>}</div><p className="made-with"><Link2 size={16}/> demo with mylink</p></div></section>}
  </div>;
}
