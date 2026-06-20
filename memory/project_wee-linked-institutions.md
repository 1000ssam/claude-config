---
name: project_wee-linked-institutions
description: wee-linked 게시판 개편 + 유관기관 지도 디렉토리(정보공유 게시판). 입력 UI는 다음 단계
metadata: 
  node_type: memory
  type: project
  originSessionId: b5bd21e4-5b9e-4bb9-b9a2-a66581b1565b
---

wee-linked 커뮤니티 개편(2026-06-20, 브랜치 `feat/board-restructure`).

**게시판 개편(0026)**: 자유수다 카테고리=학교급 축(일상·초등·중등·고등·위센터/위스쿨·기타). '정보공유' 게시판 신설(물품·위클래스 구축·수퍼바이저). 순서=공지·자유수다·정보공유·질문있어요·사례고민·모임/모집. NAV(site.ts)도 갱신(게시판은 데이터주도지만 드롭다운은 하드코딩).

**유관기관 디렉토리(0027/0028/0029, `/institutions`)**: 게시판 글이 아니라 별도 표(institutions/institution_categories, 자료실 0007 패턴 복제·staff 입력/공개 조회 RLS). **2컬럼**: 좌=한국 시/도 클릭 SVG 지도(simplemaps 상업무료, sticky)/우=검색+필터+**기관 테이블**(스타일=게시판 PostList border-y+divide-y 무라디우스, 열 지역·이름·종류·번호·홈피, 좁은 화면 종류 숨김). **필터 3종**: 시도(지도 클릭) / 시군구(시도 선택 후 체크박스 다중, district 컬럼 데이터주도) / 유형(드롭다운). 시도 드롭다운은 제거(지도가 담당). region_code=ISO 3166-2:KR 숫자부(서울11…세종50), 지도 path id "KR"+code. 필터=서버 GET폼('적용' 버튼)·sanitizeSearchQuery 재사용, district는 다중 param→.in(). 정보공유 게시판=콜아웃 배너 + CategoryFilter '유관기관' 알약(→/institutions) 둘 다. 유형 10종 + 실재 공공기관 4곳(전화/주소는 비움·운영진 보완) 시드. 입력은 **카카오 우편번호 서비스**(무료·키X·sido/sigungu 자동) 기반 설계. 설계 SSOT=`docs/institutions-design.md`, regions.ts에 sido→code 정규화 포함.

**상태**: 🟢 **프로덕션 라이브**(2026-06-20). main 머지 + origin 푸시 + `vercel --prod` 완료, wee-linked.com/institutions·/community/info 검증됨. DB(0026~0029) 적용 완료. 🚩 **다음 단계 = 운영진(staff) 전용 입력 UI** `/admin/institutions`(자료실 업로드 패턴 + 카카오 우편번호 위젯 → region_code/district 자동). 필터는 즉시 적용형(InstitutionFilters 클라이언트, 검색=디바운스/유형·시군구=즉시).

**부수**: 마이그레이션 이력 드리프트 해소 — 프로덕션 적용본 0021(wee-log 구독 subs_* 스키마, [[project_wee-consent-backend]])을 git서 로컬 복원, 미배포 0024(검색 trgm 인덱스) 함께 반영. 관련 [[project_wee-linked-deploy]](main push≠prod, vercel --prod 필요).
