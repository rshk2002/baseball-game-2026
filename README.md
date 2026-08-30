# ⚾ 숫자야구 2026

중복 없는 3자리 숫자를 추리하는 웹 숫자야구 게임.
[2020년 버전](https://github.com/) (Angular + Flask + 파일 저장)을 Next.js 단일 앱으로 재구축한 프로젝트입니다.

- 기획/개발계획: [docs/PLAN.md](docs/PLAN.md)

## 게임 규칙

- 컴퓨터가 0~9 중 **중복 없는 숫자 3자리**를 숨깁니다.
- **STRIKE**: 숫자·위치 모두 일치 / **BALL**: 숫자만 일치 / **OUT**: 없는 숫자
- 3 스트라이크면 승리. 포기하면 정답이 공개되고 기록에 남습니다.

## 기술 스택

| 영역 | 기술 |
|---|---|
| 앱 | Next.js (App Router) + TypeScript + Tailwind CSS |
| DB | Supabase (Postgres) — 환경변수 없으면 개발용 인메모리 저장소 |
| 테스트 | Vitest |
| 배포 | Vercel |

## 실행 방법

```bash
npm install
npm run dev        # http://localhost:3000 (인메모리 저장소로 동작)
npm test           # 게임 로직 단위 테스트
```

### Supabase 연결 (운영)

1. [Supabase](https://supabase.com)에서 프로젝트 생성
2. SQL Editor에서 [supabase/schema.sql](supabase/schema.sql) 실행
3. `.env.local`에 키 입력 (`.env.example` 참고)

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
```

## API

| 메서드 | 경로 | 설명 |
|---|---|---|
| POST | `/api/game` | 게임 생성 (`{ nickname }` → `{ gameId }`) |
| POST | `/api/game/[id]/guess` | 판정 (`{ guess }` → `{ strike, ball, out, status, tryCount }`) |
| POST | `/api/game/[id]/giveup` | 포기 (정답 공개) |
| GET | `/api/stats?sort=wins\|winRate\|avgTries` | 실시간 랭킹 |

정답은 승리/포기 시에만 응답에 포함됩니다. 게임 생성·판정 API에는 IP 기준 rate limit(분당 30회)이 적용됩니다.

## 배포

GitHub 저장소를 Vercel에 연결하고 환경변수(`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`)를 등록하면
`git push`만으로 자동 배포됩니다.
