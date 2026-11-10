# mylink — 마이링크

나의 링크(SNS, 블로그, 포트폴리오 등)를 한 페이지에 모아 공유하는 링크트리 스타일 웹서비스입니다.
「아이디어를 현실로 - 바이브 코딩」 수업 프로젝트로, Next.js + Firebase로 만들고 Vercel로 배포했습니다.

- **배포 주소:** https://mylink-beige-chi.vercel.app/
- **GitHub:** https://github.com/bboeric/mylink

## 주요 기능

- **링크 관리 (CRUD):** 링크 추가·수정·삭제, 삭제 확인 모달, Firestore 영구 저장
- **Google 로그인:** Firebase Authentication
- **개인 공개 페이지:** `/아이디` 주소로 누구나 열람, 프로필(아이디·이름·소개) 편집
- **보안:** Firestore Security Rules — 읽기는 누구나, 쓰기는 본인만
- **클릭 통계:** 링크 클릭 수 집계, 총 클릭 수·링크별 통계

## 페이지

| 주소 | 설명 |
|---|---|
| `/` | 메인 페이지 |
| `/mypage` | 내 링크·프로필·통계 관리 (로그인 필요) |
| `/아이디` | 공개 링크 페이지 |
| `/demo` | 로그인 없이 체험 |

## 기술 스택

Next.js 15 · React 19 · TypeScript · Firebase (Auth, Firestore) · Vercel

## 로컬 실행

```bash
npm install
npm run dev
```

`.env.example`을 참고해 `.env.local`에 Firebase 설정값을 넣은 뒤 http://localhost:3000 에서 확인합니다.
