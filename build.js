/**
 * build.js
 * content/posts/*.md 를 읽어 dist/ 아래에 정적 HTML 블로그를 생성한다.
 * (빌드 타임 변환 — 브라우저는 순수 HTML/CSS/JS만 받는다.)
 */
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const ROOT = __dirname;
const POSTS_DIR = path.join(ROOT, 'content', 'posts');
const TEMPLATES_DIR = path.join(ROOT, 'templates');
const ASSETS_DIR = path.join(ROOT, 'assets');
const DIST_DIR = path.join(ROOT, 'dist');

const SITE = {
  title: 'My Blog',
  description: '마크다운으로 쓰는 개인 블로그',
};

// 파일명 규칙: YYYY-MM-DD-slug.md
const FILENAME_RE = /^(\d{4}-\d{2}-\d{2})-(.+)\.md$/;

function readTemplate(name) {
  return fs.readFileSync(path.join(TEMPLATES_DIR, name), 'utf-8');
}

// {{key}} 형태의 아주 단순한 플레이스홀더 치환 (템플릿 엔진 없음)
function render(template, data) {
  return template.replace(/{{\s*([\w.]+)\s*}}/g, (match, key) => {
    return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : '';
  });
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyDir(src, dest) {
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function loadPosts() {
  if (!fs.existsSync(POSTS_DIR)) return [];
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'));

  return files
    .map((filename) => {
      const raw = fs.readFileSync(path.join(POSTS_DIR, filename), 'utf-8');
      const { data, content } = matter(raw);

      const match = filename.match(FILENAME_RE);
      const dateFromName = match ? match[1] : null;
      const slugSource = match ? match[2] : filename.replace(/\.md$/, '');

      const date = data.date ? String(data.date).slice(0, 10) : dateFromName;
      const title = data.title || slugSource;
      const slug = slugify(data.slug || slugSource);
      const tags = Array.isArray(data.tags) ? data.tags : [];
      const description = data.description || '';

      return {
        slug,
        title,
        date: date || '1970-01-01',
        tags,
        description,
        html: marked.parse(content),
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

function formatDisplayDate(dateStr) {
  const [y, m, d] = String(dateStr).split('-');
  if (!y || !m || !d) return dateStr;
  return `${y}년 ${Number(m)}월 ${Number(d)}일`;
}

function tagsToHtml(tags) {
  if (!tags || !tags.length) return '';
  const items = tags.map((t) => `<span class="tag">#${t}</span>`).join(' ');
  return ` <span class="post-tags">${items}</span>`;
}

function buildPostPage(post, postTemplate) {
  const html = render(postTemplate, {
    title: post.title,
    description: post.description,
    date: post.date,
    displayDate: formatDisplayDate(post.date),
    tagsHtml: tagsToHtml(post.tags),
    content: post.html,
    rootPath: '../',
    year: String(new Date().getFullYear()),
    siteTitle: SITE.title,
  });

  const outDir = path.join(DIST_DIR, 'posts');
  ensureDir(outDir);
  fs.writeFileSync(path.join(outDir, `${post.slug}.html`), html, 'utf-8');
}

function buildIndexPage(posts, indexTemplate) {
  const listHtml = posts.length
    ? posts
        .map(
          (post) => `      <li class="post-item">
        <a class="post-item-title" href="posts/${post.slug}.html">${post.title}</a>
        <p class="post-item-meta"><time datetime="${post.date}">${formatDisplayDate(post.date)}</time>${tagsToHtml(post.tags)}</p>
        ${post.description ? `<p class="post-item-desc">${post.description}</p>` : ''}
      </li>`
        )
        .join('\n')
    : '      <li class="post-item post-item-empty">아직 작성된 글이 없습니다.</li>';

  const html = render(indexTemplate, {
    title: SITE.title,
    description: SITE.description,
    postListHtml: listHtml,
    rootPath: '',
    year: String(new Date().getFullYear()),
    siteTitle: SITE.title,
  });

  ensureDir(DIST_DIR);
  fs.writeFileSync(path.join(DIST_DIR, 'index.html'), html, 'utf-8');
}

function build() {
  console.log('빌드 시작...');

  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  }
  ensureDir(DIST_DIR);

  const postTemplate = readTemplate('post.html');
  const indexTemplate = readTemplate('index.html');

  const posts = loadPosts();

  posts.forEach((post) => buildPostPage(post, postTemplate));
  buildIndexPage(posts, indexTemplate);

  if (fs.existsSync(ASSETS_DIR)) {
    copyDir(ASSETS_DIR, path.join(DIST_DIR, 'assets'));
  }

  console.log(`완료: 글 ${posts.length}개 생성, 결과물은 dist/ 에 있습니다.`);
}

build();
