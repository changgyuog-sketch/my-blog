// invitation/assets/js/config.js
// 초대장 콘텐츠 단일 출처(single source of truth).
// 행사 정보를 교체하려면 이 파일의 값만 수정하면 된다(마크업/스크립트 수정 불필요).
// 좌표(lat/lng) 필드는 두지 않는다 — 지도는 venue.address 문자열 검색 기반으로 동작한다.

window.INVITATION_CONFIG = {
  event: {
    type: "opening",
    title: "밀양안심방문간호센터 개업식에 초대합니다",
    dateTimeISO: "2026-08-30T11:00:00+09:00",
    dateDisplay: "2026년 8월 30일 일요일 오전 11시"
  },
  organizer: {
    name: "박미혜",
    role: "대표"
  },
  greeting: {
    message: "소중한 이웃의 곁을 지키는 마음으로\n" +
              "밀양안심방문간호센터가 문을 엽니다.\n\n" +
              "한 걸음 한 걸음, 어르신과 가족 곁에서\n" +
              "정성을 다해 건강을 살피겠습니다.\n\n" +
              "새로운 시작을 함께 축하해 주시면\n" +
              "더없는 힘이 되겠습니다."
  },
  venue: {
    name: "밀양안심방문간호센터",
    address: "경남 밀양시 시청로2길 4",
    tel: ""
  },
  share: {
    title: "밀양안심방문간호센터 개업식에 초대합니다",
    description: "2026년 8월 30일 일요일 오전 11시, 경남 밀양시 시청로2길 4"
  }
};
