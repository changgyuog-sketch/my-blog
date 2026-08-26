# My Blog

마크다운 파일을 정적 HTML 블로그로 변환하는 프로젝트입니다.
프레임워크 없이 순수 HTML/CSS/JavaScript로 동작하며, 다크모드와 모바일 반응형을 지원합니다.

자세한 구조와 설계는 [CLAUDE.md](CLAUDE.md)를 참고하세요.

## 시작하기

```bash
npm install        # marked, gray-matter 설치 (빌드 시에만 사용)
npm run build       # content/posts/*.md → dist/ 에 정적 사이트 생성
npm run dev         # 로컬 서버(http://localhost:3000) + 파일 변경 시 자동 재빌드
```

## 새 글 작성하기

`content/posts/` 폴더에 `YYYY-MM-DD-제목.md` 형식으로 파일을 추가하세요.

```markdown
---
title: "글 제목"
date: "2026-08-26"
tags: ["태그1", "태그2"]
description: "목록 페이지에 보여줄 한 줄 설명"
---

본문은 여기에 마크다운으로 작성합니다.
```

작성 후 `npm run build`(또는 `npm run dev` 실행 중이면 자동으로)를 실행하면
`dist/posts/제목.html`이 생성되고 홈 목록에도 반영됩니다.

## 배포

`npm run build` 결과물인 `dist/` 폴더를 그대로 정적 호스팅(GitHub Pages, Netlify,
Vercel, S3 등)에 올리면 됩니다. `dist/`는 완전한 정적 파일이라 별도 서버가 필요 없습니다.
