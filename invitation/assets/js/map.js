// invitation/assets/js/map.js
// #location 섹션 — 지도 iframe src 조립 + 길찾기/지도 링크 href 조립 (spec.md §4.2)
// 좌표(lat/lng)가 아니라 venue.address 문자열 기반 쿼리로 조립한다.

(function () {
  "use strict";

  function buildMapEmbedUrl(address) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=17&output=embed`;
  }

  function buildKakaoMapUrl(address) {
    return `https://map.kakao.com/link/search/${encodeURIComponent(address)}`;
  }

  function buildNaverMapUrl(address) {
    return `https://map.naver.com/v5/search/${encodeURIComponent(address)}`;
  }

  function initMap() {
    const config = window.INVITATION_CONFIG;
    const venue = config.venue;

    const iframe = document.getElementById("venue-map-iframe");
    if (iframe) {
      iframe.src = buildMapEmbedUrl(venue.address);
      iframe.title = `${venue.name} 위치 지도`;
      iframe.loading = "lazy";
      iframe.referrerPolicy = "no-referrer-when-downgrade";
    }

    const nameEl = document.getElementById("venue-name");
    if (nameEl) nameEl.textContent = venue.name;

    const addressEl = document.getElementById("venue-address");
    if (addressEl) addressEl.textContent = venue.address;

    const telEl = document.getElementById("venue-tel");
    if (telEl) {
      if (venue.tel) {
        telEl.textContent = venue.tel;
        telEl.hidden = false;
      } else {
        telEl.hidden = true;
      }
    }

    const kakaoBtn = document.getElementById("btn-kakao-map");
    if (kakaoBtn) {
      kakaoBtn.href = buildKakaoMapUrl(venue.address);
      kakaoBtn.target = "_blank";
      kakaoBtn.rel = "noopener noreferrer";
    }

    const naverBtn = document.getElementById("btn-naver-map");
    if (naverBtn) {
      naverBtn.href = buildNaverMapUrl(venue.address);
      naverBtn.target = "_blank";
      naverBtn.rel = "noopener noreferrer";
    }

    const copyBtn = document.getElementById("btn-copy-address");
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        copyAddress(venue.address);
      });
    }
  }

  function copyAddress(address) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(address).then(
        function () {
          window.InvitationToast && window.InvitationToast.show("주소가 복사되었습니다");
        },
        function () {
          fallbackCopy(address);
        }
      );
    } else {
      fallbackCopy(address);
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
      window.InvitationToast && window.InvitationToast.show("주소가 복사되었습니다");
    } catch (e) {
      // 복사 완전 실패해도 주소는 이미 화면에 텍스트로 노출되어 있어 수동 선택-복사가 가능하다.
    }
  }

  window.InvitationMap = { init: initMap };
})();
