---
name: zoom 회의 기본값
description: zoom-meeting 스킬로 회의 생성 시 사용자가 선호하는 기본 설정 (대기실/PMI/비밀번호 등)
type: feedback
originSessionId: 151b3836-a950-42ec-a480-21d91357e2b5
---
zoom-meeting 스킬로 줌 회의를 만들 때 명시적 지시가 없으면 다음 기본값을 사용한다:
- 대기실 OFF (`waiting_room: false`)
- 입장 시 음소거 ON (`mute_upon_entry: true`)
- 호스트 없어도 입장 가능 ON (`join_before_host: true`)
- 개인 회의 ID 사용 (`use_pmi: true`)
- 비밀번호 `"1000"` (4자리)

**Why:** 사용자가 2026-04-28 명문고 노션 연수 회의를 만들면서 명시. 연수·강의 등 다수 참가자 시나리오에서 호스트가 일일이 admit하지 않아도 되도록 대기실 OFF + join_before_host ON, 매번 다른 회의 ID 외우는 부담을 없애려 PMI 사용, 안내가 쉬운 짧은 비밀번호.

**How to apply:** `scripts/zoom-api.mjs`의 `createMeeting` 시그니처 기본값에 이미 반영됨. 사용자가 다른 값을 명시할 때만 override한다. PMI 사용 시 모든 회의가 같은 입장 ID를 공유하므로 시간대가 겹치는 동시 회의가 필요하면 그때만 `use_pmi: false` override 안내.
