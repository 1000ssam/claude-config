---
name: reference_notion-formula-api-relation
description: Notion API로 만든 relation은 수식 map/join 순회 불가 — rollup으로 대체. eastasia-worksheet 폼 DB STEP4 함정.
metadata: 
  node_type: memory
  type: reference
  originSessionId: 87c586fe-9fd3-4ca4-8d2f-a75cb7e88fbd
---

Notion API(2026-03-11 data_source)로 **프로그램 생성한 relation**은 수식 엔진이 순회하지 못한다. `map(prop("관련 학생"), current.prop("학번"))` 같은 항등 매핑조차 `400 Type error with formula`로 거부됨. single/dual로 바꿔도 동일. UI로 만든 relation은 됨(템플릿이 그래서 작동).

**증상**: 수식 안에서 multi_select `join(prop("주제"))`, rollup 참조도 빈값 반환. 수식 PATCH는 통과하지만 런타임 계산이 비어 나옴.

**해결**:
- 관련 레코드 값(학번·학급·영역)은 **rollup(`show_original`)**으로 가져온다. 정상 계산됨.
- 요약 수식(누가기록 종합 등)은 relation/rollup/multi_select 참조 대신 **리터럴 + title(`prop("활동 내용")`)**로 구성. 폼이 단일 주제 전용이면 영역·주제를 문자열 리터럴로 박는 게 명시적이고 견고.
- 학생 명렬표 같은 **공유 DB에 dual_property 변환 실험 금지**(역방향 속성이 남음). 실수로 만들면 `PATCH /data_sources/{ds}` `{properties:{"<name>":null}}` raw call로 삭제(updateDatabase는 null 삭제 시 검증로직에 걸려 throw).

이 한계 때문에 [[project_eastasia-worksheet]] 스킬 STEP 4의 "템플릿 수식 ID 재매핑" 방식은 API에서 작동 안 함. 스킬을 rollup 기반으로 고쳐야 함.
