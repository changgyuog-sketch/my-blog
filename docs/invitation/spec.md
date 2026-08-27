# 모바일 초대장 웹페이지 — spec.md

> 이 문서는 Plan 단계 산출물이다. 코드는 포함하지 않으며, Work 단계에서 서브에이전트가
> 그대로 구현에 착수할 수 있을 만큼 구체적인 설계 결정을 담는다.
>
> **개정 이력**: 최초 버전은 행사 종류가 확정되지 않아 "모바일 청첩장(결혼식)"을 예시로
> 삼아 작성했다. 이후 사용자로부터 실제 행사가 **방문간호센터 개업식**이며 실제 상호·주소·
> 대표자·일시가 확정되었다는 요청을 받아, 이번 개정판에서 데이터 모델과 문구를 실제 행사에
> 맞게 전면 수정했다. 아래 §0~§6은 개정판 기준 최종 내용이다.

## 목차

1. [디자인 방향](#1-디자인-방향)
2. [정보구조 / 섹션 목록](#2-정보구조--섹션-목록)
3. [데이터 모델 / 설정(config)](#3-데이터-모델--설정config)
4. [기능 명세](#4-기능-명세)
5. [파일/디렉토리 구조](#5-파일디렉토리-구조)
6. [Work 단계 분할 계획](#6-work-단계-분할-계획)

---

## 0. 배치 위치 및 행사 정보

기존 블로그(`build.js` → `content/posts/*.md` → `dist/`)는 빌드 타임 마크다운 변환 파이프라인이고,
이번 초대장은 **손으로 작성한 순수 정적 HTML/CSS/JS 한 벌**이라 빌드 절차 자체가 다르다.
`build.js`는 실행할 때마다 `dist/`를 통째로 정리하므로, 산출물을 `dist/` 안에 두면 블로그를
빌드할 때마다 사라진다. 앞서 추가된 `store/`(온라인 스토어)와 동일한 선례를 따라,

**결정: 초대장은 저장소 최상위의 별도 디렉토리 `invitation/`로 분리한다.**
블로그 빌드(`npm run build`)는 `invitation/`을 전혀 건드리지 않으며, `invitation/`은 그 자체로
완성된 정적 파일 트리라 별도 빌드 없이 `file://` 직접 열람 또는 정적 서버로 바로 볼 수 있다.

**행사 정보 (사용자 확정, 실제 값)**

| 항목 | 값 |
|---|---|
| 행사 종류 | 방문간호센터 개업식 |
| 센터(상호)명 | 밀양안심방문간호센터 |
| 대표자 | 박미혜 (대표) |
| 주소 | 경남 밀양시 시청로2길 4 |
| 일시 | 2026년 8월 30일 일요일 오전 11시 (`2026-08-30T11:00:00+09:00`) |

이 값들은 실제 업체 정보이므로 예시/가상 데이터가 아니다. §3의 단일 `config` 객체에만 존재하도록
설계해, 이후 시간이나 주소가 변경되면 `config.js` 값만 수정하면 되게 한다(마크업/스크립트 수정
불필요).

---

## 1. 디자인 방향

### 1.1 컨셉

**"안심 케어(Trust & Care)"** — 방문간호센터라는 업종 특성상 결혼식 초대장에 쓰이던 블러쉬 핑크
톤(파스텔 포멀)은 더 이상 어울리지 않는다. 대신 의료/돌봄 서비스에서 신뢰감과 안정감을 주는
**저채도 틸/민트 그린**을 포인트 컬러로, 아이보리에 가까운 화이트를 배경으로 쓰는 차분한 팔레트로
바꾼다. 근거:

- 방문간호센터는 어르신·환자 가족을 대상으로 "믿고 맡길 수 있는 곳"이라는 인상이 가장 중요하다.
  녹색·청록 계열은 병원·헬스케어 브랜딩에서 보편적으로 "안전, 회복, 신뢰"를 상징하는 색으로
  쓰인다. 센터명의 "안심"이라는 단어와도 어울린다.
- 개업식 초대장은 결혼식만큼 화려할 필요가 없고, 지역 주민·보건소·협력기관 관계자 등 폭넓은
  연령대가 받아보므로 과한 장식보다 정갈하고 읽기 쉬운 타이포그래피 중심 레이아웃이 적합하다.
- 다크모드는 라이트 모드의 톤을 유지한 톤다운 버전으로 설계한다(§1.2).

### 1.2 컬러 팔레트 (CSS 변수, `invitation/assets/css/invitation.css`의 `:root`에 정의, 접두사 `inv-`)

**라이트 모드 (기본값)**

| 변수 | 값 | 용도 |
|---|---|---|
| `--inv-bg` | `#fbfdfc` | 페이지 배경 (아이보리 화이트) |
| `--inv-bg-secondary` | `#eef6f4` | 섹션 배경, 강조 블록 배경 (연한 민트) |
| `--inv-bg-elevated` | `#ffffff` | 카드/D-Day 박스처럼 배경 위에 얹히는 표면 |
| `--inv-text` | `#20302c` | 본문/제목 텍스트 (완전한 검정 대신 부드러운 딥그린블랙) |
| `--inv-text-secondary` | `#5c6f6a` | 보조 텍스트, 설명 문구 |
| `--inv-text-tertiary` | `#93a29d` | 캡션, 라벨(D-Day 숫자 아래 "일/시/분/초" 등) |
| `--inv-accent` | `#3f8f7d` | 포인트 컬러 — 버튼, 강조 텍스트, D-Day 숫자 |
| `--inv-accent-hover` | `#357566` | 포인트 요소 hover |
| `--inv-border` | `#d3e6e0` | 구분선, 카드 테두리 |
| `--inv-success` | `#3f8f7d` | "복사되었습니다" 등 피드백 토스트 (accent와 동일 계열 재사용) |
| `--inv-shadow` | `0 4px 24px rgba(30,60,50,0.08)` | 카드 그림자 |

**다크 모드** (`prefers-color-scheme: dark` 미디어쿼리 + `[data-theme="dark"]` 속성 토글, 블로그/
스토어와 동일한 이중 지원 패턴을 따른다)

| 변수 | 값 |
|---|---|
| `--inv-bg` | `#12201d` |
| `--inv-bg-secondary` | `#1a2b26` |
| `--inv-bg-elevated` | `#1f332c` |
| `--inv-text` | `#eaf3f0` |
| `--inv-text-secondary` | `#b7c9c3` |
| `--inv-text-tertiary` | `#82938d` |
| `--inv-accent` | `#5cc2a8` |
| `--inv-accent-hover` | `#74d1b9` |
| `--inv-border` | `#2c453c` |
| `--inv-success` | `#5cc2a8` |
| `--inv-shadow` | `0 4px 24px rgba(0,0,0,0.5)` |

다크모드 토글은 이번 범위에서는 **자동 감지만 지원**한다(`prefers-color-scheme`). 수동 토글 버튼/
localStorage 저장은 넣지 않는다 — 초대장은 1회성 열람 페이지 성격이 강해 설정을 "기억"할 필요가
낮고, UI를 더 단순하게 유지하기 위함(향후 필요하면 `store`의 `store_theme_v1` 패턴을 그대로
가져와 확장 가능).

### 1.3 타이포그래피

- 제목용 세리프 스택: `"Noto Serif KR", "Nanum Myeongjo", "Apple SD Gothic Neo", serif`
  (센터명, 섹션 타이틀처럼 격식 있는 느낌이 필요한 곳에 사용). `Noto Serif KR`은 시스템 기본
  폰트가 아니므로 `<head>`에 Google Fonts `<link>`(`display=swap`)로 로드하고, 네트워크가 막힌
  환경에서도 레이아웃이 깨지지 않도록 fallback(`Nanum Myeongjo` → `Apple SD Gothic Neo` →
  `serif`)을 반드시 함께 지정한다.
- 본문용 산세리프 스택(블로그와 동일 관례): `-apple-system, BlinkMacSystemFont, "Segoe UI",
  "Malgun Gothic", "Apple SD Gothic Neo", "Noto Sans KR", Roboto, Helvetica, Arial, sans-serif`
- 스케일(모바일 기준, 데스크톱도 컨테이너 폭을 480px로 고정하므로 동일 크기 사용 — §1.4 참고):

  | 용도 | font-family | font-size | font-weight |
  |---|---|---|---|
  | 센터명(히어로) | 세리프 | 28px | 600 |
  | 섹션 타이틀(예: "오시는 길") | 세리프 | 22px | 600 |
  | D-Day 숫자 | 세리프 | 30px | 600 |
  | 본문/인사말 | 산세리프 | 16px | 400, `line-height: 1.75` |
  | 보조 텍스트(주소, 캡션) | 산세리프 | 14px | 400 |
  | 버튼 라벨 | 산세리프 | 15px | 600 |

### 1.4 여백 / 그리드 원칙 (mobile-first)

- **모바일(< 768px, 기본값)**: 콘텐츠가 뷰포트 전체 폭을 사용, 좌우 패딩 `24px`.
- **태블릿/데스크톱(≥ 768px)**: 콘텐츠 컨테이너를 `max-width: 480px`로 제한하고 `margin: 0 auto`로
  가운데 정렬한다 — 데스크톱에서도 "휴대폰 화면처럼" 보이게 하는 방식. 바깥 여백(뷰포트 배경)은
  `--inv-bg-secondary`로 은은하게 채워 카드가 화면 중앙에 떠 있는 느낌을 준다. 480px 카드 자체에는
  `box-shadow: var(--inv-shadow)`를 데스크톱 구간에서만 추가로 적용(모바일에서는 그림자 없이
  전체화면).
- 섹션 간 세로 여백: 모바일 `56px`, 데스크톱 `64px`(카드 폭이 고정이라 세로 간격만 소폭 확대).
- CSS는 `min-width` 기반 미디어쿼리로 작성(블로그 `assets/css/style.css`, 스토어 `store.css`와
  동일한 관례). `invitation.css`는 블로그/스토어 CSS와 완전히 독립된 파일이며, 클래스명 접두사
  `inv-`를 사용해 다른 스타일시트와 충돌하지 않게 한다.

### 1.5 버튼 / 카드 스타일

- **Primary 버튼**(길찾기, 공유하기): `background: var(--inv-accent)`, 흰 글자,
  `border-radius: 999px`(필 형태), `padding: 14px 20px`, hover/active 시 `--inv-accent-hover`로
  배경 전환(`180ms ease`).
- **Secondary 버튼**(주소 복사, 지도 앱에서 보기): 배경 투명, `border: 1px solid var(--inv-border)`,
  `border-radius: 999px`, 텍스트 색 `--inv-text-secondary`, hover 시 배경만 `--inv-bg-secondary`.
- **카드**(D-Day 박스, 인사말 블록): `background: var(--inv-bg-elevated)`,
  `border-radius: 20px`(부드러운 큰 라운드), `box-shadow: var(--inv-shadow)`, 테두리 없음.
- **D-Day 숫자 박스**: 일/시/분/초 4개를 가로 4등분 그리드로 배치, 각 박스는 정사각형에 가깝게
  (`aspect-ratio: 1`), 배경 `--inv-bg-secondary`, 숫자는 `--inv-accent` 색.

### 1.6 애니메이션 원칙 (최소한으로)

- 각 섹션이 스크롤로 뷰포트에 처음 들어올 때 `opacity: 0 → 1`, `transform: translateY(16px) → 0`,
  `400ms ease-out`, **1회만** 재생(`IntersectionObserver`로 감지 후 클래스 `.is-visible` 부여,
  재퇴장 시 되돌리지 않음). JS가 실패해도 콘텐츠는 기본적으로 보이는 것이 안전값이므로, CSS는
  `body.js-ready` 클래스가 붙은 경우에만 초기 숨김 상태(`opacity:0`)를 적용하고, `.js-ready`가
  없으면(JS 실행 실패) `opacity:1`이 기본값이 되도록 이중 안전장치를 둔다(§4.5 참고).
- `prefers-reduced-motion: reduce` 사용자는 모든 트랜지션/애니메이션을 즉시 종료 상태로 표시(모션
  없이 바로 나타남).
- D-Day 숫자가 1초마다 바뀔 때는 별도 애니메이션 없이 텍스트만 교체(과한 tick 애니메이션은 배터리
  소모와 산만함을 이유로 배제).
- 페이지 전환 애니메이션 없음(단일 페이지이므로 해당 없음).

### 1.7 반응형 브레이크포인트

| 구간 | 폭 | 비고 |
|---|---|---|
| 모바일 | `< 768px` | 전체 폭 사용, 좌우 패딩 24px, D-Day 4박스 가로 배치 유지 |
| 태블릿 | `768px ~ 1023px` | 콘텐츠 480px로 제한 + 중앙 정렬, 바깥 여백 배경 표시 |
| 데스크톱 | `>= 1024px` | 태블릿과 동일(480px 고정) — 초대장 콘텐츠 특성상 폭을 더 넓힐 이유가 없어 두 구간을 사실상 통합 처리 |

---

## 2. 정보구조 / 섹션 목록

### 2.1 구성 판단: 단일 페이지(1화면) 스크롤

여러 파일로 화면을 나누지 않고 **단일 정적 HTML 페이지(`invitation/index.html`) 내 앵커 섹션
스크롤 구성**으로 설계한다. 근거:

- 모바일 초대장은 관례적으로 "링크 하나 → 끝까지 스크롤"하는 단일 세션 UX이며, 페이지 전환이
  있으면 카카오톡/문자 인앱 브라우저 등에서 이동/로딩이 튀는 경험을 줄 수 있다.
- 상태(장바구니 등)를 여러 화면에 걸쳐 유지할 필요가 없어 다중 페이지로 얻는 이점이 없다.

### 2.2 포함/제외 섹션 결정

사용자가 명시한 핵심 기능은 **D-Day 카운트다운**과 **장소 지도**이며, 이 두 가지를 중심으로 초대장의
기본 뼈대(인사말, 일시 안내)를 포함한다.

| 구성 요소 | 포함 여부 | 근거 |
|---|---|---|
| 커버(센터명 + 날짜 요약) | **포함** | 초대장의 기본 뼈대 |
| 인사말 + 대표자 소개 | **포함** | 개업식 초대장의 기본 구성 요소, 방문 명분을 전달 |
| 일시 안내 | **포함** | D-Day와 짝을 이루는 기본 정보 |
| D-Day 카운트다운 | **포함 (핵심)** | 사용자가 명시적으로 요청 |
| 장소 지도 + 주소 + 길찾기 | **포함 (핵심)** | 사용자가 명시적으로 요청 |
| 공유하기(링크 복사/공유) | **포함** | 구현 비용이 매우 낮고, 지역 주민에게 카카오톡 등으로 전달하기 쉬워야 하는 개업식 초대장 성격상 체감 가치가 큼 |
| 갤러리(시설 사진) | **제외** | 실제 시설 사진 자산이 없어 이번 범위를 벗어나는 확장. `config`에 이미지 배열만 추가하면 되는 구조이므로 후속 요청으로 미룸 |
| 방명록 / 참석 회신(RSVP) | **제외** | 폼 검증 + localStorage 스키마 관리가 추가로 필요해 과도한 기능 확장에 해당. 사용자가 명시하지 않아 제외 |

### 2.3 섹션 순서 및 앵커 구조

단일 파일 `invitation/index.html` 내부에서 `id` 앵커로 구분한다.

```
invitation/index.html
├─ #hero        커버 — 센터명 "밀양안심방문간호센터" + "개업식에 초대합니다" + 날짜 한 줄 요약
├─ #greeting    인사말 — 개업 인사 문구 + 대표자(박미혜 대표) 소개
├─ #dday        일시 안내 + D-Day 카운트다운 카드
├─ #location    오시는 길 — 지도(iframe) + 센터명/주소 + 길찾기·주소복사 버튼
└─ footer       마무리 문구 + 공유하기 버튼
```

섹션 내부 이동 링크(목차 네비게이션)는 페이지가 짧아 불필요하다고 판단해 넣지 않는다.

---

## 3. 데이터 모델 / 설정(config)

### 3.1 설계 원칙

**데이터(콘텐츠)와 렌더링 로직을 분리**한다. 행사 정보, 대표자 정보, 장소 등 "내용"에 해당하는
모든 값은 `invitation/assets/js/config.js` 한 파일에 전역 상수 객체 `INVITATION_CONFIG`로 모아
두고, 나머지 JS 파일(§5)은 이 객체를 읽기만 할 뿐 하드코딩된 문자열/숫자를 직접 갖지 않는다.

### 3.2 스키마

```
INVITATION_CONFIG {
  event: {
    type: string              // 행사 종류 식별자, 예: "opening"
    title: string              // 페이지 상단 대표 문구
    dateTimeISO: string         // ISO 8601, 반드시 타임존 오프셋 포함 (KST "+09:00")
    dateDisplay: string          // 사람이 읽는 고정 문구 (브라우저 로케일 변환에 의존하지 않음)
  },
  organizer: {
    name: string                // 대표자 이름
    role: string                 // 직함, 예: "대표"
  },
  greeting: {
    message: string             // 줄바꿈은 "\n"으로 표현, 렌더링 시 <br>로 치환
  },
  venue: {
    name: string                // 센터(상호)명
    address: string               // 도로명 주소 전체 문자열 (지도 검색 쿼리로도 그대로 사용)
    tel: string                   // 연락처 (선택 표기, 없으면 빈 문자열 → 미표시)
  },
  share: {
    title: string                // Web Share API / 링크 복사 시 사용할 제목
    description: string           // Web Share API 설명 텍스트
  }
}
```

> **좌표(lat/lng) 필드를 두지 않는 이유**: 실제 위도/경도를 임의로 추정해 넣으면 지도가 엉뚱한
> 위치를 가리킬 위험이 있다. §4.2에서 채택하는 지도 연동 방식은 **주소 문자열 검색 기반**이라
> 좌표 없이도 정확하게 동작하므로, 신뢰할 수 없는 좌표를 스키마에 넣지 않는다.

### 3.3 실제 데이터 (확정값)

```
INVITATION_CONFIG = {
  event: {
    type: "opening",
    title: "밀양안심방문간호센터 개업식에 초대합니다",
    dateTimeISO: "2026-08-30T11:00:00+09:00",
    dateDisplay: "2026년 8월 30일 일요일 오전 11시"
  },
  organizer: {
    name: "박미혜",
    role: "대표"
  },
  greeting: {
    message: "소중한 이웃의 곁을 지키는 마음으로\n" +
              "밀양안심방문간호센터가 문을 엽니다.\n\n" +
              "한 걸음 한 걸음, 어르신과 가족 곁에서\n" +
              "정성을 다해 건강을 살피겠습니다.\n\n" +
              "새로운 시작을 함께 축하해 주시면\n" +
              "더없는 힘이 되겠습니다."
  },
  venue: {
    name: "밀양안심방문간호센터",
    address: "경남 밀양시 시청로2길 4",
    tel: ""
  },
  share: {
    title: "밀양안심방문간호센터 개업식에 초대합니다",
    description: "2026년 8월 30일 일요일 오전 11시, 경남 밀양시 시청로2길 4"
  }
}
```

`venue.tel`은 사용자가 제공하지 않아 빈 문자열로 둔다(§4.4에서 빈 값이면 해당 줄 자체를 렌더링하지
않도록 규정). 추후 연락처가 확정되면 이 값만 채우면 된다.

---

## 4. 기능 명세

### 4.1 D-Day 카운트다운 (`#dday` 섹션, `invitation/assets/js/countdown.js`)

- **계산 기준**: `target = new Date(INVITATION_CONFIG.event.dateTimeISO)`,
  `now = new Date()`, `diffMs = target.getTime() - now.getTime()`.
- **시간대 처리**: `dateTimeISO`에 `+09:00` 오프셋을 반드시 포함시켜 저장한다. `Date` 객체는 오프셋
  포함 문자열을 절대 시각(UTC epoch)으로 해석하므로, `diffMs` 계산 자체는 방문자의 브라우저가 어느
  시간대에 있든 항상 정확하다. 화면에 노출하는 날짜 문구(`event.dateDisplay`)는 로케일 자동 변환
  없이 **고정 한국어 문구를 그대로 표시**한다(국내 대상 서비스 전제).
- **표시 단위**: 일(days) / 시(hours) / 분(minutes) / 초(seconds) 4단위를 모두 표시한다.
  - `days = Math.floor(diffMs / 86400000)`
  - `hours = Math.floor((diffMs % 86400000) / 3600000)`
  - `minutes = Math.floor((diffMs % 3600000) / 60000)`
  - `seconds = Math.floor((diffMs % 60000) / 1000)`
- **갱신 방식**: 페이지 로드 시 즉시 1회 계산·렌더링 후 `setInterval(tick, 1000)`으로 매초 갱신.
  `pagehide`/`beforeunload` 시 `clearInterval` 호출(모범 사례 차원, 필수는 아님).
- **상태별 문구**:
  | 상태 | 조건 | 표시 |
  |---|---|---|
  | 예정 | `diffMs > 0` | 상단 문구 "밀양안심방문간호센터 개업식이 **D-{days}**일 남았습니다" + 일/시/분/초 4박스 |
  | 당일 | `diffMs <= 0 && now < target + 24h` | 4박스 대신 큰 뱃지 "D-DAY" + 문구 "오늘은 밀양안심방문간호센터 개업식 날입니다" (이 상태 진입 시 `clearInterval`로 갱신 정지) |
  | 종료 | `now >= target + 24h` | "찾아주셔서 감사합니다" 문구만 표시, 카운트다운 UI 자체를 숨김 |
- days가 0인데 아직 당일 이전(예: 개업식 18시간 전)인 경우에도 "D-0"으로 표시하고 시/분/초로 세분화된
  값을 함께 보여줘 정보량을 유지한다(D-0을 "당일" 상태와 혼동하지 않도록 상태 판정은 날짜가 아니라
  `diffMs` 부호로만 한다).

### 4.2 장소 지도 (`#location` 섹션, `invitation/assets/js/map.js` + 정적 HTML)

**채택 방식**: API 키 발급이 전혀 필요 없는 **Google 지도 `output=embed` iframe**을 지도 시각화의
기본으로 채택하되, **좌표가 아니라 주소 문자열을 검색 쿼리로 사용**한다(§3.2에서 좌표를 스키마에
두지 않기로 한 결정과 일관). 그 아래에 **주소 텍스트 + 카카오맵/네이버지도 외부 링크 버튼**을 항상
함께 배치한다. 이유:

- `output=embed` 방식은 API 키 발급·과금 등록·도메인 제한 설정 같은 사전 절차가 전혀 없이 URL만
  구성하면 즉시 동작한다.
- 주소 문자열 검색은 Google/카카오/네이버 지도 모두 정확한 지오코딩을 서버 측에서 수행해 주므로,
  임의로 추정한 좌표보다 훨씬 신뢰할 수 있다.
- 순수 `<iframe>` 태그이므로 JavaScript가 비활성화된 환경에서도 지도 자체는 그대로 로드된다.
- 카카오톡 인앱 브라우저 등 일부 웹뷰나 사내망처럼 iframe이 차단되는 환경, 오프라인 상태로
  `file://`을 열어본 경우에는 iframe이 로드되지 않을 수 있으므로, **텍스트 주소 + 외부 링크
  버튼은 iframe 로드 여부와 무관하게 항상 렌더링**해 페이지가 "깨지지" 않게 한다.

**지도 임베드 URL 형태** (주소 기반, `venue.address` 사용):

```
https://maps.google.com/maps?q={encodeURIComponent(venue.address)}&z=17&output=embed
```

예시 데이터 적용 시:

```
https://maps.google.com/maps?q=%EA%B2%BD%EB%82%A8%20%EB%B0%80%EC%96%91%EC%8B%9C%20%EC%8B%9C%EC%B2%AD%EB%A1%9C2%EA%B8%B8%204&z=17&output=embed
```

`<iframe>`에는 `loading="lazy"`, `title="{venue.name} 위치 지도"`(접근성), `referrerpolicy
="no-referrer-when-downgrade"`를 지정한다.

**길찾기 / 외부 지도 앱 버튼**:

| 버튼 | URL 형태 | 비고 |
|---|---|---|
| 카카오맵에서 보기 | `https://map.kakao.com/link/search/{encodeURIComponent(venue.address)}` | 주소 문자열로 검색하는 공식 딥링크 패턴. API 키 불필요. 모바일에서 카카오맵 앱이 설치돼 있으면 앱으로 연결을 시도 |
| 네이버지도에서 보기 | `https://map.naver.com/v5/search/{encodeURIComponent(venue.address)}` | 주소 검색 결과 페이지 URL. 안정적으로 항상 열림. 도착 후 사용자가 검색 결과에서 직접 "길찾기"를 누르는 한 단계가 추가되지만 깨지지 않는 것을 우선함 |
| 주소 복사 | JS `navigator.clipboard.writeText(venue.address)` | 클립보드 API 미지원 브라우저를 위해 `document.execCommand('copy')` 폴백 또는 최소한 주소가 이미 텍스트로 화면에 노출되어 있어 수동 선택-복사가 가능함(완전 실패해도 페이지가 깨지지 않음) |

버튼 3개는 `#location` 섹션 안에서 지도 iframe 아래, 주소 텍스트(`venue.name`, `venue.address`,
있으면 `venue.tel`) 바로 아래에 가로 배치(모바일 좁은 화면에서는 세로 스택 또는 2+1 배치, 이
섹션 내부는 `flex-wrap`으로 자동 줄바꿈).

### 4.3 공유하기 (`footer` 영역, `invitation/assets/js/share.js`)

- 버튼 1개, 라벨 "공유하기". 클릭 시:
  1. `navigator.share`가 지원되면(대부분 모바일 브라우저) `navigator.share({ title:
     share.title, text: share.description, url: location.href })` 호출 — OS 기본 공유 시트 노출.
  2. 미지원 환경(주로 데스크톱 브라우저)이면 현재 페이지 URL을 클립보드로 복사하고 "링크가
     복사되었습니다" 토스트를 `--inv-success` 색으로 하단에 2초간 노출.
- 별도 페이지 이동 없음. 카카오톡 공유 SDK 연동은 JavaScript 앱 키 발급이 필요해 "API 키 없이
  바로 동작" 원칙에 어긋나므로 이번 범위에서는 제외한다(주석으로 향후 확장 지점만 표시).

### 4.4 인사말 / 커버 섹션

- `#hero`: `event.title`("밀양안심방문간호센터 개업식에 초대합니다"), `event.dateDisplay` 요약 한
  줄. 배경은 실제 시설 사진 자산이 없으므로 **그라디언트 블록 + 세리프 타이포그래피**로 대체한다
  (`linear-gradient(160deg, var(--inv-bg-secondary), var(--inv-bg))` 등). 향후 실제 시설 사진을
  쓰고 싶다면 `venue`와 같은 방식으로 `config.js`에 `hero.imageUrl` 필드를 추가하고 CSS
  `background-image`만 조건부로 교체하면 되는 구조로 여지를 남긴다(이번 스키마에는 필드를 추가하지
  않음).
- `#greeting`: `greeting.message`(줄바꿈 포함 문자열, `\n` → `<br>` 치환)를 먼저 표시하고, 그 아래
  대표자 소개를 `"{organizer.name} {organizer.role}"`(예: "박미혜 대표") 형태로 표시한다.
  `venue.tel`이 빈 문자열이면 연락처 줄 자체를 렌더링하지 않는다(빈 줄이나 "정보 없음" 문구를
  남기지 않음).

### 4.5 반응형 및 진입 애니메이션 동작

- §1.7 브레이크포인트에 따라 480px 카드 레이아웃으로 통일(모바일=전체폭, 태블릿/데스크톱=중앙
  고정폭). 별도의 컴포넌트 단위 반응형 분기는 없음(단일 컬럼 세로 스크롤 구조).
- 진입 애니메이션(§1.6)은 `invitation/assets/js/main.js`에서 `document.body`에 `.js-ready` 클래스를
  부여한 뒤 `IntersectionObserver`로 각 섹션에 `.is-visible`을 토글하는 방식으로 구현한다. CSS는
  `body:not(.js-ready) section { opacity: 1; transform: none; }` 같은 규칙으로 JS 실행 전/실패 시
  기본적으로 콘텐츠가 그대로 보이게 하여, 스크립트 오류가 나도 페이지 내용 자체는 항상 정상
  노출되게 한다.

---

## 5. 파일/디렉토리 구조

```
my-blog/
├── docs/
│   └── invitation/
│       ├── plan-instructions.md   (기존)
│       ├── work-instructions.md   (기존)
│       └── spec.md                 (이 문서, 개정판)
└── invitation/                       ← 저장소 최상위
    ├── index.html                    단일 페이지 (전체 섹션 포함)
    └── assets/
        ├── css/
        │   └── invitation.css        전체 스타일 (다크모드 포함, 클래스 프리픽스 inv-)
        └── js/
            ├── config.js              INVITATION_CONFIG 데이터 (전역 상수, §3)
            ├── countdown.js            D-Day 계산/렌더링/setInterval 로직 (§4.1)
            ├── map.js                  지도 iframe src 조립 + 길찾기 링크 href 조립 (§4.2)
            ├── share.js                공유하기 버튼 동작 (§4.3)
            └── main.js                 초기화 진입점 — 각 모듈 호출 + IntersectionObserver 진입
                                          애니메이션 (§4.5), DOMContentLoaded에서 실행
```

기존 파일(`build.js`, `dev.js`, `templates/`, `assets/`, `content/`, `store/`, `package.json` 등)은
전혀 수정하지 않는다. `invitation/`은 완전히 독립적인 정적 파일 트리이며, 로컬 확인은 `file://`
직접 열람 또는 아무 정적 서버(`npx serve invitation` 등)로 가능하다.

---

## 6. Work 단계 분할 계획

### 6.1 판단

이번 구성은 화면(페이지) 수 기준으로는 **1개**(단일 페이지, §2.1)이므로 CLAUDE.md의 "화면 3개
이상이면 화면별로 서브에이전트를 나눈다" 규칙이 그대로 적용되지는 않는다. 산출 파일은 `index.html`
1개, `invitation.css` 1개, JS 5개(`config.js`, `countdown.js`, `map.js`, `share.js`, `main.js`)로
총 7개이며, 모두 서로 강하게 결합되어 있어 분할 이득이 크지 않다.

**결론: Work 단계는 서브에이전트 1개로 처리한다.** 해당 서브에이전트가 `invitation/` 트리 전체
(§5의 7개 파일)를 소유하며, 본 spec.md의 §1~§4를 그대로 구현 지침으로 사용한다. 이번 개정판은
최초 Work 단계에서 이미 생성된 7개 파일의 내용을 이 spec.md의 새 데이터/문구/디자인에 맞게
전면 갱신하는 작업이다(파일 목록 자체는 변경 없음).

### 6.2 소유 파일 요약

| 서브에이전트 | 담당 범위 | 소유 파일 |
|---|---|---|
| **A (단독)** | 초대장 전체(마크업 + 디자인 시스템 + 데이터 + 전 기능) | `invitation/index.html`, `invitation/assets/css/invitation.css`, `invitation/assets/js/config.js`, `invitation/assets/js/countdown.js`, `invitation/assets/js/map.js`, `invitation/assets/js/share.js`, `invitation/assets/js/main.js` |

### 6.3 향후 확장 시 분할 기준(참고용)

이번 범위는 아니지만, 나중에 시설 갤러리·오시는 길 상세 안내 등이 추가되어 파일 수와 상호작용
복잡도가 늘어나면 그때는 "공통 파일(디자인 시스템/데이터/공용 유틸)을 먼저 만드는 선행
서브에이전트 + 신규 섹션별 후행 서브에이전트"로 나누는 것을 권장한다.
