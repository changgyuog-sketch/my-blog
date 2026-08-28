# 지침: 모바일 초대장 웹페이지 — Review 단계

## 먼저 할 일
`C:\Users\chang\Desktop\my-blog\docs\invitation\spec.md` 전체를 읽는다. 이것이 정본 설계다
(개정판 — 방문간호센터 개업식 기준). `invitation/` 아래에 이미 구현이 완료되어 있다:

```
invitation/index.html
invitation/assets/css/invitation.css
invitation/assets/js/config.js
invitation/assets/js/countdown.js
invitation/assets/js/map.js
invitation/assets/js/share.js
invitation/assets/js/main.js
```

## 역할
너는 QA 담당이다. spec.md 기준으로 **초대장 페이지를 브라우저 프리뷰로 실제 열어서** 검증하고,
결과를 `docs/invitation/review.md`에 문서로 남긴다.

## 범위
- **테스트**: `invitation/`을 정적 서버로 띄워 실제로 확인한다(빌드 없이 바로 열 수 있는 정적
  파일이다 — `.claude/launch.json`에 `invitation-preview`라는 이름으로 `npx serve invitation
  -l 4321` 설정이 이미 추가되어 있으니 프리뷰 도구로 그 이름을 사용해 열어도 되고, 직접
  `npx serve invitation`을 실행해도 된다). 최소한 아래 항목을 전부 확인:
  1. **콘텐츠 정확성**: 5개 섹션(`#hero`, `#greeting`, `#dday`, `#location`, footer)에 실제
     행사 정보가 정확히 표시되는지 — 센터명 "밀양안심방문간호센터", 대표 "센터장 박미혜", 일시
     "2026년 9월 30일 수요일 오전 11시", 주소 "경남 밀양시 시청로2길 4". 결혼식 관련 문구/
     흔적(신랑·신부·청첩장·웨딩홀 등)이 전혀 없는지 페이지 텍스트와 소스 전체를 grep 등으로
     교차 확인.
  2. **D-Day 카운트다운**: 페이지 로드 시 즉시 값이 표시되고, 몇 초 기다렸다가 다시 확인해
     초 단위가 실제로 줄어드는지. days/hours/minutes/seconds 계산이 spec.md §4.1 공식과
     일치하는지(devtools 콘솔에서 직접 계산해 대조해도 좋음).
  3. **지도**: `#location`의 iframe이 정상 로드되고 "경남 밀양시 시청로2길 4" 근방을
     보여주는지. "카카오맵에서 보기", "네이버지도에서 보기" 링크의 실제 `href` 값이 spec.md
     §4.2 URL 형식(주소 기반, `encodeURIComponent(venue.address)`)과 일치하는지 devtools로
     확인(좌표 기반 URL이 아님을 반드시 확인). "주소 복사" 버튼 클릭 시 클립보드 동작(또는
     최소한 에러 없이 토스트/피드백이 발생하는지).
  4. **공유하기**: 클릭 시 `navigator.share` 미지원 환경에서는 링크 복사 + 토스트가 정상
     노출되는지.
  5. **반응형**: 모바일 폭(375px)에서 전체 폭 레이아웃, 데스크톱 폭(1280px 이상)에서 480px
     중앙 고정 카드 레이아웃(+바깥 배경)이 spec.md §1.4/§1.7대로 적용되는지.
  6. **다크모드**: `prefers-color-scheme: dark`에서 "안심 케어" 팔레트(§1.2 다크 모드 표)가
     적용되는지, 라이트 모드의 블러쉬/핑크 계열 색상이 전혀 남아있지 않은지.
  7. **진입 애니메이션 안전장치**: JS가 정상 동작할 때 스크롤 시 섹션이 페이드인되는지, 그리고
     `body`에서 `.js-ready` 클래스 관련 CSS 안전장치(§1.6/§4.5)가 소스에 존재하는지 확인.
  8. 브라우저 콘솔에 에러가 없는지.

- **통합 수정 허용 범위**: 위 테스트 중 발견한 **사소한 스타일/오타/문구 이슈**는 네가 직접
  고쳐도 된다(예: 줄바꿈 처리 오류, 버튼 정렬, 접근성 속성 누락 등). **단, 기능/동작 자체를
  바꾸는 큰 수정이나 새 섹션 추가, config.js의 실제 행사 정보(센터명/주소/일시/대표자) 값 변경은
  하지 않는다.** 구조적으로 큰 문제를 발견하면 직접 고치지 말고 review.md에 상세히 기록만
  한다(사용자 판단 필요).
- **금지**: 기존 블로그/스토어 파일(`build.js`, `dev.js`, `templates/`, `assets/`(블로그의),
  `content/`, `store/`, `package.json`, `CLAUDE.md`)은 절대 건드리지 않는다.

## 산출물
`docs/invitation/review.md` 파일 하나를 작성한다. 포함 내용:
- 테스트한 항목 목록과 각각의 결과(통과/실패, 실패 시 구체적 증상 — 스크린샷 설명 포함 가능).
- 지도/길찾기 링크의 실제 `href` 값 스냅샷(카카오맵/네이버지도/Google 임베드).
- 발견 후 네가 직접 고친 사항 목록(파일/변경 요약).
- 고치지 않고 남겨둔 이슈(있다면) — 재현 방법과 권장 조치 포함.
- 최종 결론: spec.md 요구사항(D-Day 카운트다운, 장소 지도, 실제 행사 정보 정확성, 반응형,
  다크모드, 프레임워크 없는 순수 HTML/CSS/JS, API 키 불필요)이 전부 충족되었는지 항목별
  체크리스트.

작업 완료 시 review.md의 최종 결론(전체 통과 여부, 고친 이슈 개수, 남은 이슈 개수)을 요약해서
보고하라.
