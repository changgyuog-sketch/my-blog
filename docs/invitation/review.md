# invitation/ — Review 결과 (QA)

> 대상: `invitation/` (spec.md 개정판 — 방문간호센터 개업식 기준)
> 테스트 방법: `.claude/launch.json`의 `invitation-preview`(`npx serve invitation -l 4321`)로
> 정적 서버를 띄우고, 브라우저 프리뷰 도구로 `http://localhost:4321`을 실제 열어 확인.
> 테스트 시각: 2026-08-27 (KST, 시스템 시각 기준 `2026-08-27T02:26:10Z` 전후)

---

## 1. 테스트 항목 및 결과

| # | 항목 | 결과 | 비고 |
|---|---|---|---|
| 1 | 콘텐츠 정확성 | **통과** | 아래 §2 참고 |
| 2 | D-Day 카운트다운 | **통과** | 아래 §3 참고 |
| 3 | 지도 (iframe + 길찾기 링크) | **통과** | 아래 §4 참고 |
| 4 | 공유하기 | **통과** | 아래 §5 참고 |
| 5 | 반응형 (모바일/데스크톱) | **통과** | 아래 §6 참고 |
| 6 | 다크모드 | **통과** | 아래 §7 참고 |
| 7 | 진입 애니메이션 안전장치 | **통과** | 아래 §8 참고 |
| 8 | 콘솔 에러 | **통과 (에러 없음)** | 라이트/다크, 모바일/데스크톱, 상호작용(주소 복사·공유·다크모드 전환) 전 구간에서 콘솔 로그 0건. 네트워크 요청 전부 200 OK(캐시 시 304) |

### 1.1 요약
- 실행한 정적 서버 요청(`index.html`, `invitation.css`, `config.js`, `countdown.js`, `map.js`,
  `share.js`, `main.js`) 전부 200 OK / 304 Not Modified. 404 등 누락 없음.
- 8개 항목 전부 통과. **수정 사항 없음**(코드 리뷰 + 실제 브라우저 검증 결과 spec.md와 구현이
  이미 정확히 일치해, "사소한 스타일/오타/문구 이슈"조차 발견되지 않았음).

---

## 2. 콘텐츠 정확성

`get_page_text`로 렌더링된 전체 텍스트를 추출해 확인:

```
밀양안심방문간호센터 개업식에 초대합니다
2026년 9월 30일 수요일 오전 11시
...
소중한 이웃의 곁을 지키는 마음으로
밀양안심방문간호센터가 문을 엽니다.
...
센터장 박미혜
...
밀양안심방문간호센터 개업식이 D-2일 남았습니다
...
밀양안심방문간호센터
경남 밀양시 시청로2길 4
카카오맵에서 보기 / 네이버지도에서 보기 / 주소 복사
...
공유하기
```

- 센터명 "밀양안심방문간호센터", 대표 "센터장 박미혜", 일시 "2026년 9월 30일 수요일 오전 11시",
  주소 "경남 밀양시 시청로2길 4" — `#hero`, `#greeting`, `#dday`, `#location`, footer 5개
  섹션 모두에서 정확히 일치.
- `invitation/` 디렉토리 전체를 `신랑|신부|청첩장|웨딩|결혼|wedding|bride|groom` 패턴으로
  대소문자 무시 grep — **매치 0건**. 결혼식 관련 문구/흔적 없음 확인.
- `config.js`의 `INVITATION_CONFIG` 값이 spec.md §3.3의 확정 데이터와 필드 단위로 완전히 동일.

---

## 3. D-Day 카운트다운

- 페이지 로드 즉시 값 표시됨(로딩 지연 없음): 최초 확인 시 `02일 23시 33분 57초`.
- devtools 콘솔에서 spec.md §4.1 공식대로 직접 계산해 대조:

  ```js
  target = new Date("2026-09-30T11:00:00+09:00")  // → 2026-09-30T02:00:00.000Z
  now     = 2026-08-27T02:26:10.489Z
  diffMs  = 257629511
  days=2, hours=23, minutes=33, seconds=49
  ```

  같은 순간 DOM 값: `days=02, hours=23, minutes=33, seconds=50`(계산~DOM 조회 사이 약 1초
  경과분 차이로, 오차 범위 내 정상). **공식 일치 확인.**
- 4초 대기 후 재확인: 초 단위가 `50 → 39`로 실제 감소함을 확인(초 단위 tick이 살아있음,
  `setInterval(tick, 1000)` 정상 동작).
- 상태 판정 로직(`diffMs` 부호 기준, days=0에서도 시/분/초 세분화 유지, 당일/종료 시
  `clearInterval`) 코드 리뷰로 spec.md §4.1 표와 문장 단위까지 일치 확인.
  (현재 시각이 예정 상태이므로 당일/종료 상태는 시스템 시각을 바꿀 수 없어 실기기 렌더링으로는
  재현하지 못했고, 소스코드 리딩으로만 검증함 — §9 참고)

---

## 4. 지도

### 4.1 iframe
- `#venue-map-iframe`의 `src`가 로드된 뒤 실제 값:
  ```
  https://maps.google.com/maps?q=%EA%B2%BD%EB%82%A8%20%EB%B0%80%EC%96%91%EC%8B%9C%20%EC%8B%9C%EC%B2%AD%EB%A1%9C2%EA%B8%B8%204&z=17&output=embed
  ```
  (`encodeURIComponent("경남 밀양시 시청로2길 4")` 결과와 정확히 일치, `q=` 파라미터가
  좌표가 아니라 주소 문자열임을 확인 — spec.md §4.2 요구사항 그대로.)
- `title` 속성 JS 실행 후 `"밀양안심방문간호센터 위치 지도"`로 갱신됨(접근성 요구사항 충족).
- 실제로 지도 섹션까지 스크롤해 스크린샷 촬영 — Google 지도 임베드가 정상 로드되어 "밀양안심
  방문간호센터" 라벨과 "지도에서 열기" 링크가 노출되는 것을 시각적으로 확인.

### 4.2 길찾기 버튼 href 스냅샷
| 버튼 | 실제 href |
|---|---|
| 카카오맵에서 보기 | `https://map.kakao.com/link/search/%EA%B2%BD%EB%82%A8%20%EB%B0%80%EC%96%91%EC%8B%9C%20%EC%8B%9C%EC%B2%AD%EB%A1%9C2%EA%B8%B8%204` |
| 네이버지도에서 보기 | `https://map.naver.com/v5/search/%EA%B2%BD%EB%82%A8%20%EB%B0%80%EC%96%91%EC%8B%9C%20%EC%8B%9C%EC%B2%AD%EB%A1%9C2%EA%B8%B8%204` |
| Google 지도 임베드 | `https://maps.google.com/maps?q=%EA%B2%BD%EB%82%A8%20%EB%B0%80%EC%96%91%EC%8B%9C%20%EC%8B%9C%EC%B2%AD%EB%A1%9C2%EA%B8%B8%204&z=17&output=embed` |

두 링크 모두 `encodeURIComponent(venue.address)` 기반이며 좌표 파라미터가 전혀 없음을 확인
(spec.md §4.2 표의 URL 형태와 완전히 일치). 두 버튼 모두 `target="_blank"`,
`rel="noopener noreferrer"`가 JS로 부여됨을 확인.

### 4.3 주소 복사
- "주소 복사" 버튼 클릭 → `navigator.clipboard.writeText` 성공 → 토스트
  `"주소가 복사되었습니다"`가 `is-visible` 클래스와 함께 정상 노출됨을 DOM에서 확인.
  에러 없음.

---

## 5. 공유하기

- 테스트 환경(브라우저 프리뷰)에서 `navigator.share`는 `undefined`(데스크톱 브라우저 특성상
  미지원) — spec.md가 상정한 "미지원 환경" 케이스를 그대로 테스트.
- "공유하기" 버튼 클릭 → 클립보드로 현재 페이지 URL 복사 → 토스트 `"링크가 복사되었습니다"`가
  `is-visible` 상태로 정상 노출됨을 확인. 에러 없음.
- (모바일 실기기 등 `navigator.share` 지원 환경에서의 OS 공유 시트 자체는 브라우저 프리뷰
  환경 특성상 실기기로 재현하지 못했으나, `share.js` 코드 리뷰상 `navigator.share` 분기가
  spec.md §4.3 그대로 구현되어 있음을 확인.)

---

## 6. 반응형

| 폭 | 확인 결과 |
|---|---|
| 375px (모바일) | `.inv-page`의 `max-width: none`, `box-shadow: none`, 좌우 padding `24px`, 실제 렌더 폭 `375.2px` — 전체 폭 레이아웃, 그림자 없음. 스크린샷으로 시각 확인. |
| 1280px (데스크톱) | `.inv-page`의 `max-width: 480px`, `margin: 0 auto`(좌우 `392.4px`로 대칭), `box-shadow: rgba(30,60,50,0.08) 0 4px 24px`, 실제 렌더 폭 `480px` — 중앙 고정 카드 + 바깥 배경(`rgb(238,246,244)` = `--inv-bg-secondary`) 정상 적용. 스크린샷으로 카드가 화면 중앙에 뜬 모습 시각 확인. |

spec.md §1.4/§1.7 요구사항과 정확히 일치.

---

## 7. 다크모드

`prefers-color-scheme: dark`로 에뮬레이션 후 `:root`의 CSS 변수 실제 계산값을 devtools로 추출:

```json
{
  "--inv-bg": "#12201d",
  "--inv-bg-secondary": "#1a2b26",
  "--inv-bg-elevated": "#1f332c",
  "--inv-text": "#eaf3f0",
  "--inv-text-secondary": "#b7c9c3",
  "--inv-text-tertiary": "#82938d",
  "--inv-accent": "#5cc2a8",
  "--inv-accent-hover": "#74d1b9",
  "--inv-border": "#2c453c",
  "--inv-success": "#5cc2a8"
}
```

spec.md §1.2 다크 모드 표의 값과 변수 단위로 완전히 동일. 스크린샷으로 딥그린 배경 + 밝은
텍스트가 실제 렌더링됨을 시각 확인했고, 라이트 모드의 블러쉬/핑크 계열 색상은 CSS 소스
전체(`invitation.css`)에도, 렌더링 결과에도 전혀 존재하지 않음(애초에 라이트 팔레트 자체가
민트/틸 계열이라 핑크 계열 값 자체가 코드에 없음).

---

## 8. 진입 애니메이션 안전장치

- **동작 확인**: 페이지를 새로고침한 직후 스크린샷을 연속으로 찍어, 섹션이
  `opacity: 0 → 1`, `translateY(16px) → 0`로 페이드인되는 전환 과정을 실제로 포착함(첫
  스크린샷에서 텍스트가 흐릿하게 나타나다가, 1초 뒤 스크린샷에서 완전히 선명해짐 — 트랜지션이
  실제로 재생되고 있다는 증거).
- **안전장치 소스 확인** (`invitation.css` §12):
  ```css
  body:not(.js-ready) .inv-section,
  body:not(.js-ready) .inv-footer {
    opacity: 1;
    transform: none;
  }
  .js-ready .inv-section,
  .js-ready .inv-footer {
    opacity: 0;
    transform: translateY(16px);
    transition: opacity 400ms ease-out, transform 400ms ease-out;
  }
  ```
  `main.js`가 `document.body.classList.add("js-ready")`를 호출하기 전까지는 `body`에
  `.js-ready`가 없으므로 위 첫 번째 규칙이 적용되어 콘텐츠가 기본적으로 보임 — spec.md §1.6/
  §4.5의 이중 안전장치 요구사항과 정확히 일치.
- `prefers-reduced-motion: reduce` 규칙도 `invitation.css`에 존재(트랜지션 제거, 즉시
  `opacity:1`/`transform:none`).
- `IntersectionObserver` 미지원 환경 폴백(모든 섹션에 `.is-visible` 즉시 부여)도 `main.js`에
  존재.

---

## 9. 직접 고친 사항

**없음.** 코드 리뷰와 브라우저 실측 검증 결과, 구현이 spec.md 개정판과 이미 정확히
일치했으며, 허용 범위(줄바꿈 오류, 버튼 정렬, 접근성 속성 누락 등) 내에서 고칠 만한 사소한
이슈조차 발견되지 않았다. `invitation/` 트리는 전혀 수정하지 않았다.

---

## 10. 고치지 않고 남겨둔 이슈

구조적 문제는 없었다. 참고용으로 테스트 환경의 한계만 기록한다(코드 결함 아님, 조치 불필요):

- **D-Day "당일"/"종료" 상태**, **`navigator.share` 지원 환경(모바일 실기기)의 OS 공유 시트**는
  테스트 시점의 시스템 시각(2026-08-27, 개업식 D-2)과 브라우저 프리뷰 환경(데스크톱 UA) 특성상
  실제 렌더링으로 재현하지 못했다. 두 경우 모두 `countdown.js`/`share.js` 소스 코드가 spec.md
  §4.1/§4.3의 조건·로직을 정확히 구현하고 있음을 코드 리뷰로 확인했다. 실제 개업식 당일(또는
  `event.dateTimeISO`를 임시로 과거 값으로 바꾼 로컬 테스트, 혹은 모바일 실기기 브라우저)에서
  한 번 더 육안 확인을 권장한다(선택 사항).

---

## 11. 최종 결론 — spec.md 요구사항 충족 체크리스트

| 요구사항 | 충족 여부 |
|---|---|
| D-Day 카운트다운 (일/시/분/초, 실시간 갱신, 상태별 문구) | ✅ |
| 장소 지도 (주소 기반 iframe + 길찾기 링크, 좌표 미사용) | ✅ |
| 실제 행사 정보 정확성 (센터명/대표/일시/주소, 결혼식 흔적 없음) | ✅ |
| 반응형 (모바일 전체폭 / 데스크톱 480px 중앙 카드) | ✅ |
| 다크모드 ("안심 케어" 팔레트, `prefers-color-scheme` 자동 감지) | ✅ |
| 프레임워크 없는 순수 HTML/CSS/JS | ✅ (라이브러리/프레임워크 스크립트 태그 없음, 바닐라 JS 5개 파일만 사용) |
| API 키 불필요 (Google `output=embed`, 주소 기반 딥링크만 사용) | ✅ |
| 진입 애니메이션 안전장치 (`.js-ready` 이중 안전장치, reduced-motion) | ✅ |
| 공유하기 (Web Share API + 클립보드 폴백) | ✅ |
| 콘솔 에러 없음 | ✅ |

**전체 통과.** 고친 이슈 0개, 남은 이슈 0개(테스트 환경 한계로 인한 참고 사항 1건만 기록,
조치 불필요).
