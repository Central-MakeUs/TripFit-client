# CLAUDE.md

> **TripFit 클라이언트**
> 이 문서는 Claude Code가 프로젝트 작업 시 반드시 따라야 할 규칙 및 컨텍스트를 정의합니다.
> 팀원 전원이 공유하는 AI 협업 규약이며, 모든 코드 생성/리팩토링은 이 규약을 따릅니다.

---

## 🎯 프로젝트 컨텍스트

### 한 줄 정의

**여러 사람의 조건을 반영해 모두가 납득할 수 있는 여행 일정을 추천하는 의사결정 서비스**

### 서비스 배경

친구들과 여행을 계획할 때 날짜를 결정하는 과정이 가장 어렵다. 근무 일정, 연차, 개인 약속 등 고려해야 할 조건이 많고, 일정 조율은 총대(방장) 한 명에게 집중된다. TripFit은 일정 수집부터 의사결정까지 도와주어 일정 조율의 피로를 줄인다.

### 타겟 유저

- **Primary (방장/총대)**: 친구들과 여행을 계획하며 일정 조율을 주도하는 사람. 여행방 생성, 여행 날짜 범위·여행지 결정, 후보 일정 비교 후 최종안 공유까지 담당.
- **Secondary (참여자)**: 초대 링크를 통해 여행 가능 조건을 응답하는 사람. 앱 설치/가입 없이 링크에서 빠르게 응답하는 것이 핵심 니즈.

### 핵심 기능

- **여행방 생성 및 관리** — 여행 조건(기간, 일수, 인원) 설정 후 초대 링크 공유
- **일정 입력** — 오전/오후/저녁 단위, 가능/불가/미정 상태로 세분화된 일정 등록
- **근무 일정 & 연차 조건 입력** — 다양한 근무 패턴과 연차 사용 조건 반영
- **그룹 달력 시각화** — 참여자별 일정을 동심원으로 한눈에 파악
- **추천 일정 Top 3** — 참여 인원·연차·미정 일정을 고려한 최적 일정 후보 + 추천 근거 제공
- **리마인드 메시지** — 미응답 참여자에게 카카오톡 공유 메시지 발송

### 플랫폼 전략

**RN(Expo) 앱이 WebView로 Next.js 웹앱을 감싸는 구조.**
→ 실제 UI/비즈니스 로직은 `apps/web`에 집중. 네이티브 기능만 `apps/app`에서 처리.

---

## 💻 기술 스택

### 공통

- **패키지 매니저**: pnpm@9.0.0
- **모노레포**: Turborepo
- **언어**: TypeScript 5.9.2 (apps/app은 6.0.3)

### apps/web (Next.js)

- **프레임워크**: Next.js 16 (App Router)
- **React**: 19.2.0
- **스타일링**: Tailwind CSS v4
- **공유 UI**: 없음 — `components/common`에서 자체 관리 (RN 앱과 UI를 공유하지 않으므로 별도 workspace 패키지 불필요)
- **아이콘**: SVG 직접 관리 (외부 아이콘 라이브러리 사용 안 함)

### apps/app (React Native)

- **프레임워크**: React Native + Expo ~56
- **주요 역할**: WebView로 `apps/web` 렌더링

### packages

- **`@repo/eslint-config`**: 공유 ESLint 설정
- **`@repo/typescript-config`**: 공유 TypeScript 설정

### CI/CD

- **GitHub Actions**: PR 단위 빌드 검사 (`lint` → `check-types` → `build`)
- **필수 통과 조건**: `pnpm install --frozen-lockfile`

---

## 📁 프로젝트 구조

### 모노레포 루트

```
TripFit-client/
├── apps/
│   ├── app/              # React Native + Expo (WebView 래퍼)
│   └── web/               # Next.js 16 (메인 서비스)
├── docs/                  # 프로젝트 문서 모음 (마크다운, 별도 앱 아님)
├── packages/
│   ├── eslint-config/     # @repo/eslint-config
│   └── typescript-config/ # @repo/typescript-config
├── .prettierrc
├── pnpm-workspace.yaml
└── turbo.json
```

### apps/web 내부 (페이지별 폴더 구조)

```
apps/web/
├── app/                              # Next.js App Router (루트)
│   ├── layout.tsx
│   ├── page.tsx                      # 홈 = 내 여행 목록 (진행 중인 여행 / 전체 여행 보기)
│   ├── globals.css
│   ├── fonts/
│   ├── onboarding/                   # 온보딩 인트로 (서비스 소개 3단계)
│   │   └── page.tsx
│   ├── signup/                       # 회원가입 (소셜 로그인 → 기본정보 → 근무 일정 설정)
│   │   └── page.tsx
│   ├── room/                         # 여행방
│   │   ├── new/                      # 여행방 생성 (여행명/희망기간/일수/인원)
│   │   │   └── page.tsx
│   │   └── [roomId]/                 # 여행방 상세
│   │       ├── page.tsx              # 그룹 달력 tab / 추천 일정 tab (section 전환, route 아님)
│   │       ├── _common/              # roomId/* 하위 라우트 간 공유
│   │       │   ├── _components/      # 초대하기, 참여자 상세, 일정 확정하기 모달 등
│   │       │   ├── _hooks/
│   │       │   └── _types/
│   │       └── schedule/             # 내 일정 수정하기 (해당 여행방 기간에 맞춘 내 캘린더)
│   │           └── page.tsx
│   ├── my-schedule/                  # 내 일정관리 (근무 일정/연차 조건 모달 포함)
│   │   └── page.tsx
│   └── my-page/                      # 마이페이지
│       ├── page.tsx                  # 마이페이지 메인 (계정 관리 모달: 로그아웃/탈퇴)
│       ├── notifications/            # 알람센터
│       │   └── page.tsx
│       └── account/                  # 소셜 계정 연동
│           └── page.tsx
├── components/
│   └── common/   # app/ 밖 — top-level 라우트 간 공유 + 범용 UI
│       └── {component-name}/
│           ├── index.tsx
│           ├── {componentName}.style.ts
│           └── {componentName}.const.ts
├── apis/         # API 호출 함수
├── hooks/        # 커스텀 훅
├── utils/        # 공통 유틸리티 함수
├── types/        # 공통 타입 정의 (T suffix)
├── assets/       # 정적 리소스 (SVG 등)
└── consts/       # 상수 (API endpoint 등)
```

**Colocation 배치 (한 단계씩 레벨업):**

코드는 **가장 가까운 사용처**에 둔다. 재사용 범위가 넓어질 때만 **부모 라우트로 한 단계** 끌어올린다. 처음부터 `components/common/`에 두지 않는다.

| 재사용 범위                                                     | 배치 위치                                                                           |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 단일 `page.tsx` 전용                                            | 해당 라우트 폴더의 `_components/` (또는 `_hooks/`, `_apis/`, `_consts/`, `_types/`) |
| **같은 부모 아래 2개 이상** 하위 라우트에서 공유                | **부모 라우트**의 `_common/_components/` 등으로 끌어올림                            |
| **`app/` top-level 라우트 간** 공유 (room ↔ my-schedule 등)     | `components/common/{component-name}/` — **App Router 밖**으로 이동                  |
| **2개 이상 top-level 라우트 또는 앱 전역**에서 쓰는 API/훅/유틸 | `apis/`, `hooks/`, `utils/`, `consts/`, `types/`                                    |

```
예) [roomId]/page 전용                          → app/room/[roomId]/_components/
    schedule + 여행방 상세(그룹달력/추천) 에서 공유 → app/room/[roomId]/_common/_components/
    room/* 전체에서 공유                           → app/room/_common/_components/
    room + my-schedule 등 top-level 공유         → components/common/{name}/
    Button, Calendar 등 범용 UI                  → components/common/button/
```

**`components/common` (App Router 밖):**

- `{component-name}/` **kebab-case 폴더** 안에 둔다 — 바로 아래 `.tsx` 금지
- import는 폴더까지만 — `@/components/common/{component-name}`

**컴포넌트 폴더 내부 파일명:**

| 파일 종류         | 규칙                         | 예시                                       |
| ----------------- | ---------------------------- | ------------------------------------------ |
| **대표 컴포넌트** | `index.tsx` (default export) | `calendar/index.tsx`                       |
| **보조 컴포넌트** | PascalCase                   | `CalendarDay.tsx`, `RoomCard.tsx`          |
| **스타일 (cva)**  | camelCase + `.style.ts`      | `button.style.ts`, `scheduleChip.style.ts` |
| **상수/타입**     | camelCase + `.const.ts`      | `calendar.const.ts`                        |

```tsx
// ✅ Good
import Button from '@/components/common/button';
import ScheduleChip from '@/components/common/schedule-chip';

// ❌ Bad
import Button from '@/components/common/Button';
import Button from '@/components/common/button/Button';
```

### Path Alias

`@/*` → `apps/web/*` (예: `@/components/common/button`, `@/types/room`)

---

## 📝 네이밍 컨벤션

| 대상                     | 규칙                            | 예시                                                 |
| ------------------------ | ------------------------------- | ---------------------------------------------------- |
| **폴더**                 | kebab-case                      | `room-card/`, `schedule-chip/`                       |
| **공통 컴포넌트 본체**   | `index.tsx`                     | `components/common/button/index.tsx`                 |
| **보조 컴포넌트 파일**   | PascalCase                      | `RoomCard.tsx`, `ParticipantAvatar.tsx`              |
| **스타일/상수 파일**     | camelCase                       | `button.style.ts`, `roomCard.const.ts`               |
| **일반 파일** (훅, 유틸) | camelCase                       | `useRoom.ts`, `formatDate.ts`                        |
| **타입**                 | T suffix                        | `RoomT`, `ParticipantT`, `ScheduleT`                 |
| **API 함수**             | HTTP 메서드 prefix              | `getRoom`, `postRoom`, `patchSchedule`, `deleteRoom` |
| **API 요청/응답 타입**   | 함수명 + `RequestT`/`ResponseT` | `PostRoomRequestT`, `PostRoomResponseT`              |
| **API 훅**               | `use` + 함수명                  | `useGetRoom`, `usePostRoom`, `usePatchSchedule`      |
| **공통 객체 타입**       | `types/` 에 위치, T suffix      | `RoomT`, `ParticipantT`, `RecommendationT`           |

---

## 🌐 API 컨벤션

- **요청/응답 타입**: 함수명을 PascalCase로 한 뒤 `RequestT` / `ResponseT` 접미
  - `postRoom` → `PostRoomRequestT`, `PostRoomResponseT`
- **API 훅**: `use` + 함수명
  - `getRoom` → `useGetRoom`, `patchSchedule` → `usePatchSchedule`
- **API endpoint**: `consts/api.ts`에 상수로 모아서 관리
- **공통 객체 타입**: `types/<domain>.ts`
  - 예: `types/room.ts` → `RoomT`, `types/participant.ts` → `ParticipantT`
- **API 함수 위치**:
  - 단일 페이지 전용 → `app/<page>/_apis/`
  - 2개 이상 페이지에서 공유 → `apis/`

---

## 🎨 코딩 컨벤션

### 컴포넌트

- **`function` 키워드 + default export**

```tsx
function RoomCard({ roomId, title }: RoomCardProps) {
  return <div>{title}</div>;
}

export default RoomCard;
```

### 유틸 함수

- **화살표 함수** 사용

```ts
const formatDate = (date: Date) => date.toISOString();
```

### 타입 선언

- **`type` 사용** (interface 대신)
- **T suffix**
- Props 타입명: `{ComponentName}Props`

```ts
type RoomT = {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  hostId: number;
};

type RoomCardProps = {
  roomId: number;
  title: string;
};
```

### Props 네이밍

- **내부 핸들러**: `handle-` (예: `handleClick`, `handleSubmit`)
- **외부에서 받는 props**: `on-` (예: `onClick`, `onSubmit`)

```tsx
function InviteButton({ onInvite }: InviteButtonProps) {
  const handleClick = () => {
    // 내부 로직
    onInvite?.();
  };
  return <button onClick={handleClick}>초대하기</button>;
}
```

### API 훅 반환값 네이밍 (TanStack Query 도입 시)

훅 내부에서 의미 있는 이름으로 rename 후 반환.

- **Query**: `data` → `{도메인}Data`
- **Mutation**:
  - `mutate` → `{HTTP 메서드 prefix + 도메인}Mutation`
  - `isPending` → `is{Http메서드 prefix + 도메인}Pending`

```ts
// Query
export const useGetRoom = (roomId: number) => {
  const { data: roomData } = useQuery({
    queryKey: ['room', roomId],
    queryFn: () => getRoom(roomId),
  });
  return { roomData };
};

// Mutation
export const usePostRoom = () => {
  const { mutate: postRoomMutation, isPending: isPostRoomPending } =
    useMutation({
      mutationFn: postRoom,
    });
  return { postRoomMutation, isPostRoomPending };
};
```

### 기타

- **세미콜론**: 사용 (`semi: true`)
- **따옴표**: `singleQuote: true` (`'홑따옴표'`)
- **tabWidth**: 2
- **trailingComma**: `'all'`
- **printWidth**: 80

---

## 🧩 RSC / UI / Next 가이드

- **`page.tsx`는 가능하면 RSC** — `'use client'`는 상호작용이 필요한 자식 컴포넌트로 내림
- **고정 width 지양** — 모바일은 `w-full + px-5` 패턴, 상한은 `max-w-*`로
- **Semantic tag** — 컨테이너는 `<main>`, 타이틀은 `<h1>`/`<h2>`
- **클릭 요소엔 `cursor-pointer`** (Tailwind v4는 자동 적용 X)
- **Next 기능 우선** — `<Link>`, `<Image>`, `next/font` 등. `router.push`는 부수 작업(모달 닫기, API 후 처리)이 있을 때만
- **탭 전환(그룹 달력 ↔ 추천 일정)은 클라이언트 상태로 처리** — 별도 라우트 이동이 아니므로 `router.push` 대신 로컬 state로 탭 전환

---

## 📦 Import 규칙

### 정렬 순서

```
1. 외부 라이브러리
2. 절대경로 (@/ 또는 @repo/)
3. 상대경로 (./ ../)
```

### 예시

```tsx
import { useState } from 'react';

import Button from '@/components/common/button';
import { RoomT } from '@/types/room';

import { formatDate } from './utils';
```

---

## 🚨 ESLint 주요 규칙

현재 `@repo/eslint-config/next-js` 기반. 주요 적용 규칙:

- `@typescript-eslint/no-explicit-any`: warn (`any` 지양)
- `react-hooks/rules-of-hooks`: error
- `react-hooks/exhaustive-deps`: warn
- `no-unused-vars`: warn
- `eslint-config-prettier` 적용 (스타일 충돌 방지)

---

## 🔀 Git 전략

### 브랜치 구조

```
main ← dev ← {type}/{issue-number}-{description}
```

### 브랜치 네이밍

- **패턴**: `{type}/{issue-number}-{description}`
- **예시**: `feat/1-room-creation`, `chore/3-eslint-setup`, `fix/5-calendar-bug`
- **타입**: `feat`, `fix`, `chore`, `docs`, `refactor`, `style`, `test`

### 커밋 메시지

- **형식**: `{type}: {한글 설명}`
- **예시**:
  - `feat: 여행방 생성 페이지 구현`
  - `chore: Prettier 설정 추가`
  - `fix: 캘린더 날짜 표시 오류 수정`

### 머지 방식

- **Squash Merge** 사용
- PR 제목이 그대로 dev의 커밋 메시지가 됨 → PR 제목 신중히 작성

### PR 컨벤션

- **base 브랜치**: `dev` (main 아님)
- **템플릿** (`.github/pull_request_template.md`):

```markdown
## 작업 요약

## 작업 세부 내용

## 스크린샷 (선택)

## 연관 이슈
```

---

## 🌐 API 통신 — Response Schema 규약

### 기본 원칙

1. **성공/실패는 HTTP Status Code로만 판단** — Body에 `status`/`success` 필드 없음 (헤더와 중복·모순 방지)
2. **HTTP Status는 REST 의미대로 사용** (200, 201, 400, 401, 403, 404, 409, 500)
3. **Body envelope**: `data` / `message` / `code` 조합
4. **`fetch`는 4xx/5xx에서 자동 throw 안 함** → 반드시 `response.ok` 확인

### 응답 구조

성공 — 단순 조회 (메시지 불필요 시 `data`만):

```json
{
  "data": {
    "tripId": 1,
    "title": "제주 3박 4일"
  }
}
```

성공 — 생성/수정 등 사용자 피드백 필요 시:

```json
{
  "code": "COMMON_SUCCESS",
  "message": "조회가 완료되었습니다.",
  "data": {}
}
```

실패:

```json
{
  "code": "TRIP_NOT_FOUND",
  "message": "여행방을 찾을 수 없습니다."
}
```

검증 오류 (400 + `INVALID_INPUT`일 때만 `errors` 포함):

```json
{
  "code": "INVALID_INPUT",
  "message": "입력값이 올바르지 않습니다.",
  "errors": [{ "field": "title", "message": "제목은 필수입니다." }]
}
```

### 프론트엔드 fetch 처리 표준

```ts
export async function request(url: string, options?: RequestInit) {
  const response = await fetch(url, options);

  let body;
  try {
    body = await response.json();
  } catch {
    throw new Error('서버 응답을 해석할 수 없습니다.');
  }

  if (response.ok) {
    return body.data;
  }

  throw new Error(body.message || '요청 처리 중 오류가 발생했습니다.');
}
```

### HTTP Status 사용 기준

| 상황                  | HTTP Status               | `code` 예시                                       |
| --------------------- | ------------------------- | ------------------------------------------------- |
| 조회 성공             | 200 OK                    | (생략 가능) 또는 `COMMON_SUCCESS`                 |
| 생성 성공             | 201 Created               | `COMMON_SUCCESS`                                  |
| 잘못된 요청/검증 실패 | 400 Bad Request           | `INVALID_INPUT`                                   |
| 인증 실패             | 401 Unauthorized          | `UNAUTHORIZED`, `LOGIN_REQUIRED`, `TOKEN_EXPIRED` |
| 권한 없음             | 403 Forbidden             | `FORBIDDEN`                                       |
| 리소스 없음           | 404 Not Found             | `*_NOT_FOUND`                                     |
| 충돌 (중복·상태 불가) | 409 Conflict              | `*_CONFLICT`                                      |
| 서버 오류             | 500 Internal Server Error | `INTERNAL_ERROR`                                  |

### `code` 네이밍

- `SCREAMING_SNAKE_CASE`
- 공통: `COMMON_SUCCESS`, `INVALID_INPUT`, `UNAUTHORIZED`, `FORBIDDEN`, `INTERNAL_ERROR`
- 도메인: `{리소스}_{상황}` — 예: `TRIP_NOT_FOUND`, `TRIP_ALREADY_CONFIRMED`

### 목록·페이지네이션

`[미정]` — offset vs cursor 확정 전까지 pagination 구현·가정 금지. 확정되면 `data.items` + `data.pageInfo` 형태로 반영.

---

## 🤖 Claude 작업 지침

### 코드 생성 시

- **위 컨벤션을 반드시 준수**
- **화면 Type 정의(page/section/modal/action/toast)를 먼저 판단** 후 route로 만들지 컴포넌트로 만들지 결정
- 신규 컴포넌트: `function` 키워드 + default export
- 신규 훅: 화살표 함수 + camelCase 파일명
- 신규 타입: `type` 키워드 + T suffix
- API 함수: HTTP 메서드 prefix (`getRoom`, `postRoom` 등)
- `components/common`에 재사용 가능한 컴포넌트가 있는지 먼저 확인 후 사용
- 경로는 `@/*` 절대경로 우선, 같은 디렉토리는 상대경로 (path alias 설정 후 적용)

### 도메인 용어 일관성

- 코드에서 영어 도메인 용어는 위의 **도메인 용어 정리** 표를 따름
- 예: 여행방 → `room`, 방장 → `host`, 참여자 → `participant`, 추천 후보 → `candidate`
- 마이페이지 route → `my-page/`, 알람센터 route → `my-page/notifications/`

### 커밋 메시지 제안 시

- `{type}: {한글 설명}` 형식 사용

### PR 작성 시

- 제목: `{type}: {한글 설명}` 형식
- base 브랜치는 `dev`

### API 관련 코드 생성 시

- HTTP status 기반 분기 (`response.ok`)
- body 구조: `{ data, message, code }` 가정 (`status` 필드 없음)

### 의심스러울 때

- 기존 코드 패턴 확인
- 팀 컨벤션 우선 (이 문서)
- 판단 어려우면 사용자에게 확인
