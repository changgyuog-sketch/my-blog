/**
 * dev.js
 * dist/ 를 정적으로 서빙하고, content/templates/assets 변경을 감지해
 * 자동으로 build.js 를 다시 실행하는 아주 가벼운 개발 서버.
 * 외부 의존성 없이 Node.js 내장 모듈만 사용한다.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, 'dist');
const WATCH_DIRS = ['content', 'templates', 'assets'].map((d) => path.join(__dirname, d));

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

function runBuild() {
  try {
    execFileSync(process.execPath, [path.join(__dirname, 'build.js')], { stdio: 'inherit' });
  } catch (err) {
    console.error('빌드 실패:', err.message);
  }
}

function serve() {
  const server = http.createServer((req, res) => {
    let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    if (urlPath === '/') urlPath = '/index.html';

    const filePath = path.join(DIST_DIR, urlPath);

    // 경로 탈출 방지
    if (!filePath.startsWith(DIST_DIR)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
        return;
      }
      const ext = path.extname(filePath);
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      res.end(data);
    });
  });

  server.listen(PORT, () => {
    console.log(`개발 서버 실행 중: http://localhost:${PORT}`);
    console.log('content/templates/assets 변경 시 자동으로 다시 빌드합니다.');
  });
}

runBuild();
serve();

let rebuildTimer = null;
function scheduleRebuild(eventType, filename) {
  clearTimeout(rebuildTimer);
  rebuildTimer = setTimeout(() => {
    console.log(`변경 감지 (${filename || '?'}) → 재빌드`);
    runBuild();
  }, 200);
}

WATCH_DIRS.forEach((dir) => {
  if (fs.existsSync(dir)) {
    try {
      fs.watch(dir, { recursive: true }, scheduleRebuild);
    } catch (e) {
      // 일부 플랫폼은 recursive 옵션을 지원하지 않을 수 있음
      fs.watch(dir, scheduleRebuild);
    }
  }
});
