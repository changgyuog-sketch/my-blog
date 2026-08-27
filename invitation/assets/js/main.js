// invitation/assets/js/main.js
// 초기화 진입점 — 각 모듈 호출 + IntersectionObserver 진입 애니메이션 (spec.md §4.5)
// DOMContentLoaded에서 실행

(function () {
  "use strict";

  // 토스트 유틸 (share.js, map.js에서 공용으로 사용)
  let toastTimeoutId = null;
  function showToast(message) {
    const toastEl = document.getElementById("inv-toast");
    if (!toastEl) return;

    toastEl.textContent = message;
    toastEl.classList.add("is-visible");

    if (toastTimeoutId !== null) {
      clearTimeout(toastTimeoutId);
    }
    toastTimeoutId = setTimeout(function () {
      toastEl.classList.remove("is-visible");
      toastTimeoutId = null;
    }, 2000);
  }
  window.InvitationToast = { show: showToast };

  function renderHeroAndGreeting() {
    const config = window.INVITATION_CONFIG;

    // hero
    const heroTitle = document.getElementById("hero-title");
    if (heroTitle) heroTitle.textContent = config.event.title;

    const heroDate = document.getElementById("hero-date");
    if (heroDate) heroDate.textContent = config.event.dateDisplay;

    // greeting
    const greetingMessage = document.getElementById("greeting-message");
    if (greetingMessage) {
      const lines = config.greeting.message.split("\n");
      greetingMessage.innerHTML = "";
      lines.forEach(function (line, idx) {
        if (idx > 0) greetingMessage.appendChild(document.createElement("br"));
        greetingMessage.appendChild(document.createTextNode(line));
      });
    }

    const organizer = config.organizer;
    const organizerInfo = document.getElementById("organizer-info");
    if (organizerInfo) {
      organizerInfo.textContent = `${organizer.name} ${organizer.role}`;
    }

    // #dday 상단 일시 안내
    const ddayDateDisplay = document.getElementById("dday-date-display");
    if (ddayDateDisplay) ddayDateDisplay.textContent = config.event.dateDisplay;
  }

  function initEntranceAnimation() {
    document.body.classList.add("js-ready");

    const sections = document.querySelectorAll(".inv-section, .inv-footer");
    if (!("IntersectionObserver" in window) || sections.length === 0) {
      sections.forEach(function (section) {
        section.classList.add("is-visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  function init() {
    renderHeroAndGreeting();

    if (window.InvitationCountdown) window.InvitationCountdown.init();
    if (window.InvitationMap) window.InvitationMap.init();
    if (window.InvitationShare) window.InvitationShare.init();

    initEntranceAnimation();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
