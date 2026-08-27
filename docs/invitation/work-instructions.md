# 지침: 모바일 초대장 웹페이지 — Work 단계 (구현)

## 먼저 할 일
`C:\Users\chang\Desktop\my-blog\docs\invitation\spec.md` 전체를 읽고 그대로 따른다(이 문서는
**개정판**이다 — 최초 버전은 행사 종류가 미정이라 결혼식을 예시로 삼았으나, 현재는 실제 행사가
**방문간호센터 개업식**으로 확정되어 데이터 모델과 문구가 전면 수정되었다).
이 지침 파일은 네가 담당할 **범위**만 정의하며, 세부 설계(컬러 값, 데이터, 동작 규칙, URL 형태 등)는
전부 spec.md가 정본이다. spec.md와 이 지침이 충돌하면 spec.md를 따른다.

spec.md §6 판단에 따라 이번 Work 단계는 화면 수가 1개(단일 페이지)이고 파일들이 서로 강하게
결합되어 있어 **서브에이전트 1개가 전체를 담당**한다. 네가 그 서브에이전트다.

## ⚠️ 기존 파일 존재함 — 새로 만드는 게 아니라 전면 교체한다
아래 7개 파일은 **이전(결혼식 예시 버전) Work 단계에서 이미 생성되어 있다.** 그 내용은 결혼식
문구/데이터(신랑신부, 파스텔 포멀 디자인 등)로 되어 있으므로 그대로 두면 안 된다. 각 파일을 열어
기존 내용을 확인한 뒤, **개정된 spec.md 기준으로 전면 재작성(덮어쓰기)**하라. 결혼식 관련 문구,
클래스명, 변수명(예: host.groom/host.bride 관련 코드)이 하나도 남지 않게 한다.

## 담당 범위 (네가 소유하는 파일 — 아래 목록을 전면 재작성한다)
- `invitation/index.html` — 단일 페이지, spec.md §2.3 섹션 구조(`#hero`, `#greeting`, `#dday`,
  `#location`, footer) 전부 포함
- `invitation/assets/css/invitation.css` — spec.md §1 전체(컬러 변수 라이트/다크 — "안심 케어"
  틸/민트 팔레트로 교체, 타이포그래피, 여백/그리드, 버튼/카드 스타일, 애니메이션, 반응형
  브레이크포인트)
- `invitation/assets/js/config.js` — spec.md §3.3의 `INVITATION_CONFIG` 객체(밀양안심방문간호센터
  실제 확정 데이터를 그대로 사용 — 임의로 값을 바꾸거나 좌표를 지어내지 않는다)
- `invitation/assets/js/countdown.js` — spec.md §4.1 D-Day 계산/렌더링/`setInterval` 로직(문구를
  "개업식" 기준으로 갱신)
- `invitation/assets/js/map.js` — spec.md §4.2 지도 iframe src 조립 + 길찾기/지도 링크 href 조립
  (**좌표가 아니라 `venue.address` 문자열 기반 쿼리로 변경됨** — 이전 버전의 lat/lng 참조 코드는
  모두 제거)
- `invitation/assets/js/share.js` — spec.md §4.3 공유하기 버튼 동작
- `invitation/assets/js/main.js` — spec.md §4.5 초기화 진입점(각 모듈 호출 + `IntersectionObserver`
  진입 애니메이션), `DOMContentLoaded`에서 실행

## 절대 금지
- 위 목록에 없는 파일은 생성/수정하지 않는다.
- 기존 파일(`build.js`, `dev.js`, `templates/`, `assets/`(블로그의), `content/`, `store/`,
  `package.json`, `CLAUDE.md`, `docs/` 등)은 절대 수정하지 않는다.
- React/Vue 등 프레임워크, 번들러, npm 패키지, CDN 외부 JS 라이브러리 사용 금지(Google Fonts
  `<link>` 태그는 spec.md §1.3에서 허용된 예외이므로 사용 가능). 순수 HTML/CSS/ES6+ JS.
- `invitation.css`의 클래스명은 `inv-` 접두사를 사용해 블로그/스토어 CSS와 충돌하지 않게 한다
  (spec.md §1.2, §1.4).
- 지도/공유 기능에 API 키가 필요한 방식(Google Maps JavaScript API, 카카오 SDK 등)을 쓰지 않는다.
  spec.md §4.2, §4.3에서 정한 키 불필요 방식(iframe embed, 딥링크, Web Share API)만 사용한다.

## 구현 시 유의사항
- `config.js`의 `INVITATION_CONFIG`는 다른 모든 JS 파일이 값만 읽어 쓰는 단일 출처다. 하드코딩된
  이름/날짜/주소 문자열을 `config.js` 밖의 다른 파일에 직접 넣지 않는다.
- D-Day 계산은 spec.md §4.1의 상태 3단계(예정/당일/종료)와 `diffMs` 부호 기준 판정 로직을 정확히
  따른다.
- 지도 iframe URL과 카카오맵/네이버지도 링크 URL은 spec.md §4.2에 명시된 형식 그대로
  `encodeURIComponent(venue.address)`를 조합해 생성한다(좌표 사용 금지 — §3.2 참고).
- 진입 애니메이션은 JS 실행 전/실패 시에도 콘텐츠가 기본적으로 보이도록 spec.md §4.5의 이중
  안전장치(`body:not(.js-ready) section { opacity:1; transform:none; }`)를 반드시 포함한다.
- `prefers-reduced-motion: reduce` 대응(spec.md §1.6)을 CSS에 포함한다.

## 완료 조건
- 정적 서버(예: `npx serve invitation` 또는 브라우저 프리뷰)로 `invitation/index.html`을 열었을 때:
  - 5개 섹션(`#hero`, `#greeting`, `#dday`, `#location`, footer)이 모두 정상 렌더링된다.
  - D-Day 카운트다운이 페이지 로드 즉시 값을 표시하고, 1초마다 초 단위가 갱신된다(브라우저
    프리뷰로 직접 확인).
  - 지도 iframe이 `venue.address`("경남 밀양시 시청로2길 4") 검색 결과 위치를 보여주고,
    길찾기/지도 링크 버튼과 주소 복사 버튼이 존재한다(외부 지도 앱으로의 실제 이동까지 확인할
    필요는 없으나 href 값이 spec.md §4.2 형식과 일치하는지는 확인).
  - 공유하기 버튼 클릭 시(Web Share API 미지원 환경이면) 링크 복사 + 토스트 노출 동작.
  - 모바일 뷰포트(예: 375px 폭)와 데스크톱 뷰포트에서 레이아웃이 spec.md §1.4/§1.7대로 다르게
    보인다(모바일 전체폭 vs 데스크톱 480px 중앙 고정).
  - 라이트/다크 모드 각각에서 색상이 spec.md §1.2 팔레트대로 적용된다.
  - 브라우저 콘솔에 에러가 없다.
- 위 사항을 가능하면 브라우저 프리뷰 도구로 직접 확인한 뒤, 작업 완료 보고 시 확인한 내용과
  스크린샷(가능하다면)을 요약해서 보고한다.
