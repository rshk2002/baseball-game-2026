# ⚾ Baseball Game 2026 — 기획 및 개발계획

> 2020년 버전(Angular + Flask + 파일 저장)을 Next.js + Supabase + Vercel 구조로 재구축한다.
> 목표: 외부 사용자가 URL만으로 접속해 플레이할 수 있는 숫자야구 게임 서비스.

---

## 1. 기획

### 1.1 게임 규칙 (확정)

- 컴퓨터가 **0~9 중 중복 없는 숫자 3자리**를 무작위로 생성한다.
- 사용자가 3자리 숫자를 제출하면 판정 결과를 받는다.
  - **STRIKE**: 숫자와 위치가 모두 일치
  - **BALL**: 숫자는 있으나 위치가 다름
  - **OUT**: 해당 숫자가 정답에 없음
- **3 STRIKE = 승리.** 시도 횟수 제한 없음 (확장 옵션으로 제한 모드 고려).
- **포기하기**: 언제든 포기 가능. 포기 시 정답 공개, 기록은 GIVE_UP으로 남는다.
  - 구버전의 `000` 치트 코드는 제거하고 이 기능으로 대체한다.

### 1.2 사용자 시나리오

1. 홈에서 게임 규칙 확인 → 닉네임 입력 → 게임 시작
2. 숫자 키패드/입력창으로 3자리 제출 → S/B/O 배지로 결과 확인 → 시도 내역 누적 표시
3. 정답 시 축하 화면(시도 횟수, 소요 시간) → 다시하기 / 랭킹 보기
4. 랭킹 페이지에서 전체 사용자 순위 확인 (실시간)

계정/로그인 없음. 닉네임만으로 가볍게 플레이하는 기존 컨셉 유지.
`localStorage`에 최근 닉네임과 내 플레이 기록 요약을 저장해 재방문 시 이어지는 느낌을 준다.

### 1.3 페이지 구성

| 경로 | 페이지 | 내용 |
|---|---|---|
| `/` | 홈 | 타이틀, 게임 시작 버튼, 규칙 요약, 랭킹 미리보기(TOP 3) |
| `/play` | 게임 | 닉네임 입력 → 게임 진행 → 결과. 단일 페이지 내 단계 전환 |
| `/ranking` | 랭킹 | 실시간 리더보드 (다승 / 승률 / 최소 평균 시도) |
| `/instruction` | 규칙 | 게임 규칙 상세 설명 |

### 1.4 UI/UX 방향

- **야구 테마**: 스코어보드 스타일의 시도 내역, 전광판 느낌의 결과 표시
- S/B/O를 색상 배지로 구분: 🟢 STRIKE / 🟡 BALL / ⚪ OUT
- **모바일 우선 반응형**: 숫자 키패드 UI 제공 (데스크톱은 키보드 입력 병행)
- 보조 도구: 사용한 숫자 표시판 (0~9 중 시도한 숫자를 흐리게 표시)
- 정답 시 컨페티 애니메이션 + 결과 카드 (시도 횟수, 소요 시간)
- 다크모드 대응

### 1.5 기능 명세

**MVP (1차 배포 범위)**
- [ ] 게임 시작 (닉네임 → 게임 생성)
- [ ] 숫자 제출 및 판정 (서버 측 검증 포함)
- [ ] 시도 내역 표시
- [ ] 승리 처리 및 결과 화면
- [ ] 포기하기 (정답 공개)
- [ ] 실시간 랭킹 페이지
- [ ] 게임 규칙 페이지
- [ ] 모바일 반응형

**확장 (2차 이후)**
- [ ] 난이도 옵션: 4자리 모드, 시도 횟수 제한 모드
- [ ] 기간별 랭킹 (오늘/이번 주)
- [ ] 닉네임 필터 (금칙어)
- [ ] 게임 결과 공유 (이모지 그리드, Wordle 스타일)
- [ ] 소요 시간 랭킹

### 1.6 API 설계

정답(`answer`)은 어떤 API 응답에도 포함하지 않는다 (포기/종료 시 제외).

| 메서드 | 경로 | 요청 | 응답 | 설명 |
|---|---|---|---|---|
| POST | `/api/game` | `{ nickname }` | `{ gameId }` | 게임 생성. 정답은 서버(DB)에만 저장 |
| POST | `/api/game/[id]/guess` | `{ guess: "123" }` | `{ strike, ball, out, status, tryCount, answer? }` | 판정. 3S면 `status: "WIN"` + `answer` 포함 |
| POST | `/api/game/[id]/giveup` | - | `{ status: "GIVE_UP", answer }` | 포기. 정답 공개 |
| GET | `/api/stats` | `?sort=wins\|winRate\|avgTries` | `{ rankings: [...] }` | 랭킹 조회 |

**서버 측 검증 (구버전 미비점 해결)**
- `guess`: 정확히 3자리 숫자, 중복 숫자 없음
- 게임 상태가 `IN_PROGRESS`인 경우에만 판정 허용
- `nickname`: 1~12자, 공백 제거, 허용 문자 검증
- 존재하지 않는 gameId → 404

**어뷰징 방지**
- API rate limit (IP 기준, 예: 분당 30회) — Vercel 미들웨어 또는 Upstash Ratelimit
- 닉네임당 하루 게임 수 상한 (랭킹 오염 방지, 수치는 운영하며 조정)

### 1.7 DB 스키마 (Supabase Postgres)

```sql
create table games (
  id          uuid primary key default gen_random_uuid(),
  nickname    text not null,
  answer      char(3) not null,
  status      text not null default 'IN_PROGRESS',  -- IN_PROGRESS | WIN | GIVE_UP
  try_count   int  not null default 0,
  created_at  timestamptz not null default now(),
  finished_at timestamptz
);

create table guesses (
  id         bigint generated always as identity primary key,
  game_id    uuid not null references games(id) on delete cascade,
  guess      char(3) not null,
  strike     int not null,
  ball       int not null,
  "out"      int not null,
  created_at timestamptz not null default now()
);

create index on games (nickname);
create index on guesses (game_id);
```

**랭킹 쿼리** (구버전 stats2.py 배치를 SQL로 대체):

```sql
select nickname,
       count(*)                                    as game_cnt,
       count(*) filter (where status = 'WIN')      as win_cnt,
       round(count(*) filter (where status = 'WIN')::numeric / count(*), 3) as win_rate,
       round(avg(try_count) filter (where status = 'WIN'), 2) as win_try_avg
from games
where status <> 'IN_PROGRESS'
group by nickname
order by win_cnt desc, win_rate desc;
```

- 접근은 **서버(API Route)에서만** Supabase 서비스 키로 수행. 클라이언트에 anon 키를 노출하지 않는다 (RLS 설정 불필요, answer 유출 원천 차단).
- 방치된 `IN_PROGRESS` 게임은 랭킹에서 제외 (구버전에서 전부 LOSE로 집계되던 문제 해결).

---

## 2. 개발계획

### 2.1 기술 스택

| 영역 | 선택 | 비고 |
|---|---|---|
| 프레임워크 | Next.js (App Router) + TypeScript | 프론트 + API 통합 |
| 스타일 | Tailwind CSS | 반응형/다크모드 유틸리티 |
| DB | Supabase (Postgres) | games / guesses 2테이블 |
| 테스트 | Vitest | 게임 로직 단위 테스트 |
| 배포 | Vercel (GitHub 연동 자동 배포) | 무료 티어 |

### 2.2 단계별 계획

**Phase 1 — 스캐폴딩 + 게임 코어** ✦ 완료 기준: 로직 테스트 전체 통과
1. Next.js 프로젝트 생성 (TypeScript, Tailwind, App Router)
2. `lib/game.ts`: 정답 생성, 입력 검증, S/B/O 판정 — 순수 함수
3. Vitest 단위 테스트 (판정 케이스, 엣지 케이스: 중복 입력, 자릿수 오류 등)

**Phase 2 — DB + API** ✦ 완료 기준: API 4종이 로컬에서 동작
1. Supabase 프로젝트 생성, 스키마 적용
2. `lib/db.ts` + API Route 4종 구현 (game / guess / giveup / stats)
3. 서버 측 검증 및 에러 응답 정리

**Phase 3 — 게임 UI** ✦ 완료 기준: 모바일/데스크톱에서 전체 플로우 플레이 가능
1. 홈 / 규칙 페이지
2. 게임 화면: 닉네임 → 플레이 → 결과 단계 전환
3. 숫자 키패드, S/B/O 배지, 스코어보드형 시도 내역, 사용 숫자 표시판
4. 승리 연출 (컨페티, 결과 카드), 포기 플로우

**Phase 4 — 랭킹 + 마감** ✦ 완료 기준: 랭킹 실시간 반영 확인
1. 랭킹 페이지 (정렬 기준 전환: 다승/승률/평균 시도)
2. 홈에 TOP 3 미리보기
3. localStorage 닉네임 기억, 다크모드 점검

**Phase 5 — 배포** ✦ 완료 기준: 외부 URL로 타인이 플레이 가능
1. GitHub 저장소 생성 및 push
2. Vercel Import + 환경변수(Supabase) 설정
3. 프로덕션 동작 확인 (실기기 모바일 포함)
4. rate limit 적용
5. (선택) 커스텀 도메인 연결

### 2.3 리스크 및 대응

| 리스크 | 대응 |
|---|---|
| 서버리스 콜드 스타트로 첫 요청 지연 | API가 전부 경량이라 영향 미미. 필요시 Edge Runtime 검토 |
| 랭킹 어뷰징 (봇, 닉네임 도용) | rate limit + 닉네임당 일일 게임 상한. 계정제 도입은 과설계로 보류 |
| Supabase 무료 티어 슬립 (7일 미사용 시) | 초기엔 무시 가능. 트래픽 생기면 자연 해소, 필요시 cron ping |

---

## 3. 구버전 대비 개선 요약

| 항목 | 구버전 (baseball-game) | 신버전 (baseball-game-2026) |
|---|---|---|
| 구조 | Angular + Flask 2개 서비스 | Next.js 단일 앱 |
| 저장소 | 서버 로컬 텍스트 파일 | Supabase Postgres |
| 입력 검증 | 프론트만 (서버 TODO) | 서버 측 검증 필수 |
| 정답 처리 치트 | `000` 입력 시 정답 처리 | 명시적 포기 API |
| 통계 | 배치 스크립트 수동 실행 | SQL 실시간 집계 |
| 배포 | 불가 (localhost 하드코딩) | Vercel 자동 배포 |
| 미완 게임 집계 | 전부 LOSE 처리 | IN_PROGRESS 제외 |
