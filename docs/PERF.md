# 성능 기준선 (M1 착수 전)

랭킹을 서버 컴포넌트로 전환(M1)하기 **전**에 남기는 기준선이다.
개선 후 같은 방법으로 다시 측정해 비교한다.

- 측정일: 2026-09-19
- 대상: 프로덕션 <https://baseball-game-2026.vercel.app>
- 커밋: `050eed1`
- 도구: Lighthouse 12 (mobile, simulated throttling), Chrome 153
- 랭킹 데이터: 9명 / 완료된 게임 38판

---

## 1. Lighthouse — 이미 만점이다

3회 측정 중앙값.

| | 홈 `/` | 랭킹 `/ranking` |
|---|---:|---:|
| Performance | **100** | **100** |
| FCP | 797 ms | 813 ms |
| LCP | 1,890 ms | 1,892 ms |
| Speed Index | 800 ms | 1,298 ms |
| TBT | 26 ms | 44 ms |
| CLS | 0 | 0 |
| TTI | 1,894 ms | 1,943 ms |
| 전송량 | 236 KB | 236 KB |

> 개별 실행 점수 — 홈 100/100/100, 랭킹 97/100/100

**따라서 M1의 성과를 Lighthouse 점수로는 보여줄 수 없다.** 이미 천장이다.
이 사실 자체가 M4를 M1보다 먼저 한 이유고, 기준선을 안 재고 작업했다면
"성능을 개선했다"고 쓴 뒤 근거를 대지 못했을 것이다.

---

## 2. 왜 만점인데 문제가 있는가 — LCP 요소가 푸터다

랭킹 페이지 3회 측정 모두 LCP 요소가 동일했다.

```
ranking-1 LCP 요소: <footer class="border-t border-border-line py-6 text-center …
ranking-2 LCP 요소: <footer class="border-t border-border-line py-6 text-center …
ranking-3 LCP 요소: <footer class="border-t border-border-line py-6 text-center …
```

랭킹 페이지에서 가장 큰 콘텐츠로 측정된 것이 **순위표가 아니라 사이트 푸터**다.
LCP 시점에 순위표는 아직 존재하지 않고 "불러오는 중..." 자리만 있기 때문이다.

서버가 내려주는 HTML에도 순위는 없다.

```
$ curl -s https://baseball-game-2026.vercel.app/ranking | grep -c "투타왕5841"
0        # 1위 닉네임이 HTML에 없다
$ curl -s https://baseball-game-2026.vercel.app/ranking | grep -c "불러오는 중"
1        # 대신 로딩 문구가 들어있다
```

빌드 산출물에서도 동일하다 (`/`, `/ranking` 각 1건).

**Lighthouse 점수는 페이지가 비어 있을수록 좋아진다.** 측정 대상을 잘못 고르면
지표가 문제를 가려준다는 사례이고, M1의 성과는 다른 지표로 재야 한다.

---

## 3. 진짜 기준선 — 순위가 화면에 나타나기까지

Navigation Timing + Resource Timing으로 직접 측정. 프로덕션 콜드 로드 4회.

| 회차 | HTML 도착 | `/api/stats` 시작 | **순위 도달** | API 소요 |
|---:|---:|---:|---:|---:|
| 1 | 56 ms | 182 ms | **1,217 ms** | 1,035 ms |
| 2 | 26 ms | 43 ms | **1,119 ms** | 1,076 ms |
| 3 | 22 ms | 39 ms | **2,204 ms** | 2,165 ms |
| 4 | 19 ms | 37 ms | **2,500 ms** | 2,463 ms |
| **중앙값** | **24 ms** | — | **1,710 ms** | **1,620 ms** |

핵심 두 가지.

1. **HTML은 24 ms에 도착하는데 순위는 1.7초에야 나타난다 — 약 70배 차이.**
   그 사이 사용자는 "불러오는 중..."을 본다.
2. **편차가 크다 (1.1초 ~ 2.5초).** 매 요청이 Supabase 집계 쿼리를 그대로
   때리기 때문이고, 무료 플랜의 콜드 스타트가 그대로 노출된다.

---

## 4. M1 이후 다시 잴 항목

| 지표 | 현재 | 목표 | 확인 방법 |
|---|---|---|---|
| HTML에 1위 닉네임 포함 | ❌ 0건 | ✅ 1건 이상 | `curl … \| grep -c "<1위 닉네임>"` |
| HTML에 "불러오는 중" | 1건 | 0건 | `grep -c "불러오는 중"` |
| 순위 도달 시간 (중앙값) | 1,710 ms | HTML 도착과 동시 | Resource Timing |
| 캐시 적중 시 DB 쿼리 | 매 요청 | 0회 | Supabase 로그 |
| 응답 시간 편차 | 1.1–2.5초 | 좁아짐 | 4회 측정 범위 |
| LCP 요소 | 푸터 | 순위표 | `largest-contentful-paint-element` |
| Lighthouse 점수 | 100 | 100 유지 | 회귀 방지선 |

Lighthouse는 **개선 지표가 아니라 회귀 방지선**으로 쓴다.

---

## 5. 재현 방법

```bash
export CHROME_PATH="/Applications/Chrome.app/Contents/MacOS/Google Chrome"

npx lighthouse@12 https://baseball-game-2026.vercel.app/ranking \
  --only-categories=performance \
  --form-factor=mobile --screenEmulation.mobile \
  --throttling-method=simulate \
  --chrome-flags="--headless=new --no-sandbox" \
  --output=json --output-path=./ranking.json --quiet
```

순위 도달 시간은 페이지 로드 후 콘솔에서:

```js
const n = performance.getEntriesByType('navigation')[0];
const s = performance.getEntriesByType('resource').find(r => r.name.includes('/api/stats'));
({ html: Math.round(n.responseEnd), 순위도달: Math.round(s.responseEnd), api: Math.round(s.duration) })
```

---

## 6. 남은 항목

- [ ] Vercel Analytics 연결 — 실사용자(RUM) 기준선. Vercel 대시보드에서
      Analytics를 켜야 하므로 계정 소유자의 조작이 필요하다.
- [ ] Lighthouse CI를 워크플로에 추가해 점수 하한을 게이트로 건다 (S3 이후)
