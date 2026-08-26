/**
 * main.js
 * 다크모드 토글 버튼 동작. 프레임워크 없이 순수 JS로 동작한다.
 * (초기 테마 적용은 깜빡임 방지를 위해 각 HTML의 <head> 인라인 스크립트에서 먼저 처리됨)
 */
(function () {
  var STORAGE_KEY = 'theme';
  var root = document.documentElement;
  var toggleBtn = document.getElementById('theme-toggle');

  function getSystemTheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function setStoredTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      /* 저장소를 못 쓰는 환경이면 조용히 무시 */
    }
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      var current = root.getAttribute('data-theme') || getSystemTheme();
      var next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      setStoredTheme(next);
    });
  }
})();
