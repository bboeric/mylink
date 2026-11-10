import Link from "next/link";
export default function NotFound() {
  return <section className="center-section"><div className="icon-orb">404</div><h1>페이지를 찾을 수 없어요</h1><p className="muted">주소를 다시 확인해 주세요.</p><Link className="btn btn-primary" href="/">홈으로 돌아가기</Link></section>;
}
