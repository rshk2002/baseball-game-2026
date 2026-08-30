-- Baseball Game 2026 스키마
-- Supabase 대시보드 > SQL Editor에서 실행

create table if not exists games (
  id          uuid primary key default gen_random_uuid(),
  nickname    text not null,
  answer      char(3) not null,
  status      text not null default 'IN_PROGRESS'
              check (status in ('IN_PROGRESS', 'WIN', 'GIVE_UP')),
  try_count   int  not null default 0,
  created_at  timestamptz not null default now(),
  finished_at timestamptz
);

create table if not exists guesses (
  id         bigint generated always as identity primary key,
  game_id    uuid not null references games(id) on delete cascade,
  guess      char(3) not null,
  strike     int not null,
  ball       int not null,
  "out"      int not null,
  created_at timestamptz not null default now()
);

create index if not exists games_nickname_idx on games (nickname);
create index if not exists guesses_game_id_idx on guesses (game_id);

-- 시도 기록 시 try_count 증가 + 승리 처리 (원자적 갱신)
create or replace function increment_try(p_game_id uuid, p_win boolean)
returns void
language sql
as $$
  update games
  set try_count = try_count + 1,
      status = case when p_win then 'WIN' else status end,
      finished_at = case when p_win then now() else finished_at end
  where id = p_game_id;
$$;

-- 실시간 랭킹 뷰 (진행 중인 게임은 집계에서 제외)
create or replace view rankings as
select nickname,
       count(*)::int                                as game_cnt,
       count(*) filter (where status = 'WIN')::int  as win_cnt,
       round(count(*) filter (where status = 'WIN')::numeric / count(*), 3)
                                                    as win_rate,
       round(avg(try_count) filter (where status = 'WIN'), 2)
                                                    as win_try_avg
from games
where status <> 'IN_PROGRESS'
group by nickname;

-- 외부 접근 차단: API는 service role 키로만 접근하므로 RLS로 anon 접근을 막는다
alter table games enable row level security;
alter table guesses enable row level security;

-- "Automatically expose new tables"를 끈 프로젝트에서는 service_role에도
-- 권한이 자동 부여되지 않으므로 명시적으로 부여한다 (RLS는 service_role을 우회)
grant usage on schema public to service_role;
grant select, insert, update on public.games to service_role;
grant select, insert on public.guesses to service_role;
grant usage, select on all sequences in schema public to service_role;
grant select on public.rankings to service_role;
grant execute on function public.increment_try(uuid, boolean) to service_role;
