// invitation/assets/js/share.js
// footer 영역 — 공유하기 버튼 동작 (spec.md §4.3)

(function () {
  "use strict";

  function initShare() {
    const btn = document.getElementById("btn-share");
    if (!btn) return;

    btn.addEventListener("click", function () {
      const config = window.INVITATION_CONFIG;
      const share = config.share;

      if (navigator.share) {
        navigator.share({
          title: share.title,
          text: share.description,
          url: location.href
        }).catch(function () {
          // 사용자가 공유를 취소한 경우 등 — 별도 처리 없음
        });
      } else {
        copyLink();
      }
    });

    // 향후 확장 지점: 카카오톡 공유 SDK 연동(Kakao.Share.sendDefault 등)은
    // JavaScript 앱 키 발급이 필요해 "API 키 없이 바로 동작" 원칙에 어긋나므로
    // 이번 범위에서는 제외한다.
  }

  function copyLink() {
    const url = location.href;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(
        function () {
          window.InvitationToast && window.InvitationToast.show("링크가 복사되었습니다");
        },
        function () {
          fallbackCopy(url);
        }
      );
    } else {
      fallbackCopy(url);
    }
  }

  function fallbackCopy(text) {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      window.InvitationToast && window.InvitationToast.show("링크가 복사되었습니다");
    } catch (e) {
      // 완전 실패해도 페이지가 깨지지 않음
    }
  }

  window.InvitationShare = { init: initShare };
})();
