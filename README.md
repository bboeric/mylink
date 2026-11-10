# mylink — 마이링크

나의 모든 링크(SNS, 블로그, 포트폴리오 등)를 한 페이지에 모아 공유하는 **링크트리 스타일 웹서비스**입니다.
한양대학교 「아이디어를 현실로 - 바이브 코딩」 수업의 마이링크 프로젝트로, AI 코딩 도구와 함께 **Next.js + Firebase**로 만들고 **Vercel**로 배포했습니다.

- **GitHub:** https://github.com/bboeric/mylink
- **배포 주소:** Vercel 배포 주소 (Vercel 대시보드 → mylink 프로젝트 → Domains)

## 주요 기능

| 주차 | 기능 | 구현 내용 |
|---|---|---|
| 6~7주차 | 링크 목록·추가 | `/mypage`에서 링크 추가, 빈 칸·주소 형식 검증 |
| 9주차 | 영구 저장 | Cloud Firestore `users/{uid}/links/{linkId}`에 저장, 새로고침해도 유지 |
| 10주차 | 수정·삭제 | 목록에서 바로 수정(인라인 편집), 삭제 확인 모달 |
| 11주차 | 로그인 | Firebase Authentication Google 로그인, 헤더에 "OOO님 + 로그아웃" |
| 12주차 | 개인 페이지·보안 | `/username` 공개 페이지, 프로필(아이디·이름·소개) 편집, 아이디 중복 방지, Security Rules(읽기는 누구나, 쓰기는 본인만) |
| 13주차 | 클릭 통계 | 링크 클릭 시 새 탭 열기 + 클릭 수 +1(`increment`로 동시 클릭도 정확히), 총 클릭 수·링크별 통계 |
| 14주차 | 배포 | GitHub 저장소 연동 Vercel 자동 배포 |

로그인 없이 화면과 기능을 체험할 수 있는 **`/demo`** 페이지도 있습니다. 데모 데이터는 브라우저(localStorage)에만 저장됩니다.

## 페이지 구성

| 주소 | 설명 | 로그인 |
|---|---|---|
| `/` | 메인(소개) 페이지 | 불필요 |
| `/mypage` | 내 링크 관리, 프로필 편집, 클릭 통계 | 필요 |
| `/아이디` | 공개 링크 페이지 (친구에게 공유하는 주소) | 불필요 |
| `/demo` | 체험 모드 | 불필요 |

## 기술 스택

- **프레임워크:** Next.js 15 (App Router), React 19, TypeScript
- **백엔드(BaaS):** Firebase Authentication(Google), Cloud Firestore
- **배포:** Vercel
- **아이콘:** lucide-react

## 데이터 구조 (Firestore)

```text
users/{uid}                 프로필: username, displayName, bio, photoURL, createdAt, updatedAt
users/{uid}/links/{linkId}  링크: title, url, clickCount, position, createdAt, updatedAt
usernames/{username}        아이디 → uid 매핑 (중복 방지, /아이디 주소 조회용)
```

교안의 `users/{userId}/profile` 대신 프로필을 `users/{uid}` 문서에 바로 저장하고, `/아이디` 주소로 사용자를 빠르게 찾기 위해 `usernames` 컬렉션을 두었습니다. 첫 로그인 시 이메일 앞부분으로 아이디를 자동 생성하며, 아이디 생성·변경은 트랜잭션으로 처리해 중복을 막습니다.

## 보안 규칙

규칙 파일: [`firebase/firestore.rules`](firebase/firestore.rules) (Firebase 콘솔 → Firestore Database → 규칙 탭에 게시)

- 프로필과 링크는 **누구나 읽기** 가능, **추가·수정·삭제는 로그인한 본인만** 가능
- 방문자는 링크의 `clickCount`를 **정확히 +1 하는 것만** 허용
- 공개 클라이언트에서 집계하는 방식이라 자동 클릭(봇)까지 막지는 못합니다. 실제 서비스라면 서버 측 검증이 필요합니다.

## 로컬에서 실행하기

Node.js 20 이상이 필요합니다.

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:3000 을 엽니다.

### Firebase 설정

1. [Firebase 콘솔](https://console.firebase.google.com/)에서 프로젝트 생성
2. **Authentication** → 로그인 방법 → **Google** 사용 설정
3. **Firestore Database** 생성(프로덕션 모드, `asia-northeast3`) → 규칙 탭에 `firebase/firestore.rules` 게시
4. 프로젝트 설정 → 내 앱 → 웹 앱(`</>`) 등록 후 설정값 확인
5. `.env.example`을 복사해 `.env.local`을 만들고 설정값 입력 (`.env.local`은 GitHub에 올라가지 않습니다)

```dotenv
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

## 배포 (Vercel)

1. Vercel에 GitHub 계정으로 로그인 → **Add New → Project** → `mylink` 저장소 Import
2. **Environment Variables**에 위 6개 값 등록 → **Deploy**
3. Firebase 콘솔 → Authentication → 설정 → **승인된 도메인**에 Vercel 주소(`xxx.vercel.app`) 추가
4. 이후 GitHub `main` 브랜치에 push하면 Vercel이 자동으로 다시 배포합니다.

## 프로젝트 구조

```text
app/page.tsx              메인 페이지
app/mypage/page.tsx       마이페이지 (링크·프로필·통계 관리)
app/[username]/page.tsx   개인 공개 페이지
app/demo/page.tsx         체험 모드
components/               헤더, 로그인 상태(AuthProvider), 마이페이지, 공개 페이지 컴포넌트
lib/firebase.ts           Firebase 초기화
lib/data.ts               Firestore CRUD, 프로필·아이디 트랜잭션, 클릭 카운트
firebase/firestore.rules  Firestore 보안 규칙
```

## 참고

- 수업 교안: 「아이디어를 현실로 - 바이브 코딩」 1~13주차
- 화면 구성 참고: [april2901/mylink](https://github.com/april2901/mylink) (해당 저장소는 Supabase 기반, 본 프로젝트는 교안대로 Firebase 사용)
- [Next.js 문서](https://nextjs.org/docs) · [Firebase 문서](https://firebase.google.com/docs)
