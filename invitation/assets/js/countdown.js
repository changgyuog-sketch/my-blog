// invitation/assets/js/countdown.js
// #dday 섹션의 D-Day 계산/렌더링/setInterval 로직 (spec.md §4.1)

(function () {
  "use strict";

  let intervalId = null;

  function getEls() {
    return {
      upcomingWrap: document.getElementById("dday-upcoming"),
      todayWrap: document.getElementById("dday-today"),
      endedWrap: document.getElementById("dday-ended"),
      headline: document.getElementById("dday-headline"),
      todayMessage: document.getElementById("dday-today-message"),
      endedMessage: document.getElementById("dday-ended-message"),
      days: document.getElementById("dday-days"),
      hours: document.getElementById("dday-hours"),
      minutes: document.getElementById("dday-minutes"),
      seconds: document.getElementById("dday-seconds")
    };
  }

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function render() {
    const els = getEls();
    if (!els.upcomingWrap || !els.todayWrap || !els.endedWrap) return;

    const config = window.INVITATION_CONFIG;
    const venueName = config.venue.name;
    const target = new Date(config.event.dateTimeISO);
    const now = new Date();
    const diffMs = target.getTime() - now.getTime();
    const dayMs = 24 * 60 * 60 * 1000;

    if (diffMs > 0) {
      // 예정
      const days = Math.floor(diffMs / 86400000);
      const hours = Math.floor((diffMs % 86400000) / 3600000);
      const minutes = Math.floor((diffMs % 3600000) / 60000);
      const seconds = Math.floor((diffMs % 60000) / 1000);

      els.upcomingWrap.hidden = false;
      els.todayWrap.hidden = true;
      els.endedWrap.hidden = true;

      if (els.headline) {
        els.headline.textContent = `${venueName} 개업식이 D-${days}일 남았습니다`;
      }
      if (els.days) els.days.textContent = pad2(days);
      if (els.hours) els.hours.textContent = pad2(hours);
      if (els.minutes) els.minutes.textContent = pad2(minutes);
      if (els.seconds) els.seconds.textContent = pad2(seconds);
    } else if (diffMs <= 0 && now.getTime() < target.getTime() + dayMs) {
      // 당일
      els.upcomingWrap.hidden = true;
      els.todayWrap.hidden = false;
      els.endedWrap.hidden = true;

      if (els.todayMessage) {
        els.todayMessage.textContent = `오늘은 ${venueName} 개업식 날입니다`;
      }

      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    } else {
      // 종료
      els.upcomingWrap.hidden = true;
      els.todayWrap.hidden = true;
      els.endedWrap.hidden = false;

      if (els.endedMessage) {
        els.endedMessage.textContent = "찾아주셔서 감사합니다";
      }

      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }
  }

  function initCountdown() {
    render();
    intervalId = setInterval(render, 1000);

    const stop = function () {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };
    window.addEventListener("pagehide", stop);
    window.addEventListener("beforeunload", stop);
  }

  window.InvitationCountdown = { init: initCountdown };
})();
