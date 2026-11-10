# mylink — 마이링크 프로젝트

한양대학교 바이브 코딩 수업 **9~13주차 교안**의 요구사항을 따라 만든 **Next.js + Firebase** 링크 모음 웹앱입니다. 참고 GitHub 저장소 [`april2901/mylink`](https://github.com/april2901/mylink)의 어두운 테마, 대시보드·공개 페이지·통계 UI 구성을 참고하되 소스는 새로 작성했습니다.

> **중요: 저장소와 교안은 백엔드가 다릅니다.** 참고 GitHub 구현은 Supabase 기반이지만, 수업 교안은 Firebase Authentication + Cloud Firestore를 사용합니다. 본 프로젝트는 **교안대로 Firebase를 선택**하였으며 Supabase 키/SQL은 필요 없습니다. 참고 저장소의 소스 전체를 가져온 복제본은 아닙니다.

## 기능

| 차시 | 요구사항 | 구현 내용 |
|---|---|---|
| 9주차 | Firebase 연동, 영구 저장 | Firestore `users/{uid}/links/{linkId}`에 추가/조회, 실시간 목록 |
| 10주차 | Update/Delete | 목록 내 인라인 편집, 삭제 확인 팝업, `updateDoc`/`deleteDoc` |
| 11주차 | Google 로그인 | Firebase Auth의 Google 팝업 로그인/로그아웃 및 로그인 상태 감지 |
| 12주차 | 개인별 공개 페이지, 보안 | 고유 `/username` 주소, 이름·소개 편집, 사용자별 데이터 분리, Firestore Security Rules |
| 13주차 | 클릭 통계 | 새 탭 열기, `increment(1)` 원자적 클릭 카운트, 총 클릭 수·링크별 막대 통계 |

추가로 Firebase 계정 없이 CRUD 화면을 만져볼 수 있도록 **`/demo` 체험 페이지**를 제공합니다. 이 페이지의 데이터는 실제 Firebase가 아니라 브라우저 `localStorage`에만 저장됩니다. 서로 다른 기기에서 공유되지 않습니다.

## 실행하기

Node.js **20.9+**가 필요합니다. 터미널에서:

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 열면 됩니다. **Firebase 설정을 하기 전에는 `/demo`에서 화면을 먼저 체험**할 수 있습니다.

## Firebase 연결 (실제 기능 사용)

1. [Firebase 콘솔](https://console.firebase.google.com/)에서 프로젝트를 새로 만듭니다.
2. 프로젝트 설정 → 내 앱 → **웹 앱(</>) 등록** 후 Firebase 설정값을 확인합니다.
3. 이 프로젝트 루트의 `.env.example`을 복사해 **`.env.local`**로 저장하고 실제 설정값을 입력합니다. (`NEXT_PUBLIC_` 설정값은 브라우저에 노출되는 공개 클라이언트 설정입니다. 접근 제어는 보안 규칙에서 합니다.)
4. Authentication → Sign-in method → **Google** 공급자를 사용 설정하고 지원 이메일을 지정합니다.
5. Authentication → Settings → Authorized domains에 로컬/배포 도메인을 추가합니다. 로컬 테스트 시 `localhost` 허용 여부를 확인합니다.
6. Firestore Database를 생성합니다(개발 중이라도 **테스트 모드 규칙을 계속 사용하면 안 됩니다**).
7. Firestore Database → **Rules** 탭에서 `firebase/firestore.rules`의 내용을 붙여넣고 게시합니다. 또는 `firebase` CLI를 이용해 동일한 규칙을 배포합니다.
8. `npm run dev`를 **재시작**한 뒤 `http://localhost:3000`에서 Google 로그인합니다.

### .env.local 예시

```dotenv
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:xxx
```

환경변수가 설정되지 않으면 홈페이지와 `/demo`는 열리지만, Google 로그인은 Firebase 설정 오류가 표시되고 실제 대시보드의 데이터 저장 기능은 동작하지 않습니다.

### Firestore 데이터 예시

```text
users (collection)
└── {uid} (document: uid, username, displayName, bio, photoURL, createdAt, updatedAt)
    └── links (subcollection)
        └── {linkId} (document: title, url, clickCount, position, createdAt, updatedAt)

usernames (collection)
└── {username} (document: uid)
```

교안의 `users/{userId}/profile` 데이터를 독립 문서로 분리하는 대신, 구현에서는 `users/{uid}` 사용자 문서에 프로필을 넣어 Firestore의 문서 경로 구조를 단순화했습니다. `/username`에서 사용자를 찾을 때 전체 사용자 프로필을 조회할 필요가 없도록 `usernames/{username}` 인덱스도 두었습니다. **계정 최초 생성과 username 점유/변경은 Firestore 트랜잭션**으로 수행합니다.

### 보안 및 클릭 통계 주의사항

- 모든 방문자는 프로필과 링크를 볼 수 있고, 링크 데이터의 일반 CRUD는 소유자만 할 수 있습니다.
- 방문자의 클릭 카운트 증가만 예외로 허용합니다. 보안 규칙에서 **`clickCount` 필드만 정확히 +1** 변경할 수 있고 `increment(1)`으로 동시 클릭 유실을 막습니다.
- 공개 클라이언트에서 클릭을 등록하는 방식은 **사람이 실제 클릭했는지 검증하거나 자동 클릭/봇 조작을 막지 못합니다.** 따라서 수업용 집계로 적합하며, 실제 운영 시에는 **서버 측 검증·요청 제한**(Cloud Functions 등)을 권장합니다.
- 인증 정보와 Firestore 접근 규칙이 유효한지 반드시 직접 테스트하세요. 다른 계정으로 타인 링크 수정/삭제가 거부되는지 확인하는 것도 중요합니다.
- 개인 사용자 페이지는 클라이언트에서 데이터를 불러옵니다. 검색엔진 노출용 서버 렌더링(SEO)은 추가 구현이 필요합니다.

## 테스트 절차

1. Google 계정 A로 로그인해 프로필을 확인합니다.
2. 링크를 등록하고 새로고침합니다. **링크가 남아 있어야** 합니다.
3. 링크 수정 → 저장, 링크 삭제 → 확인 모달을 테스트합니다.
4. `/mypage` → 프로필 편집에서 username을 변경하고 새 공개 URL에 접속합니다.
5. 로그아웃 상태에서도 `/username` 공개 페이지를 열 수 있는지 확인합니다.
6. 공개 페이지에서 링크를 클릭하면 새 탭에서 열리고 원래 탭의 Firestore 카운터가 +1 되는지 확인합니다.
7. 대시보드 통계 탭에 총 클릭수·링크별 클릭수가 반영되는지 확인합니다.
8. 계정 B로 로그인하여 계정 A의 링크를 수정할 수 없는지 규칙을 확인합니다.

## 주요 파일

```text
app/page.tsx                 랜딩 페이지
app/mypage/page.tsx          마이페이지 (링크·프로필·통계 관리)
app/[username]/page.tsx      개인별 공유 URL
app/demo/page.tsx            브라우저 로컬 체험 모드
components/DashboardClient.tsx
components/PublicProfile.tsx
components/AuthProvider.tsx
lib/data.ts                  Firebase 데이터 CRUD와 트랜잭션
lib/firebase.ts              Firebase 초기화
firebase/firestore.rules     Firestore 접근 권한
```

## 배포

Vercel 또는 Next.js를 지원하는 플랫폼에 저장소를 배포한 뒤, 해당 플랫폼의 환경변수에 `.env.local`의 여섯 값을 등록하세요. Firebase Authentication의 **Authorized domains**에 배포 도메인도 추가해야 합니다. 규칙은 반드시 Firebase 콘솔에 별도로 게시되어 있어야 합니다.

## 출처

- 학습 목적 요구사항: 사용자가 제공한 9주차~13주차 수업 교안
- 화면 및 기능 구상 참고: [`april2901/mylink`](https://github.com/april2901/mylink)
- Next.js: https://nextjs.org/docs
- Firebase: https://firebase.google.com/docs
