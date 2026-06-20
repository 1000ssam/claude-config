# Fresh-eye 시각 검토 요청

아래 슬라이드 이미지들을 **처음 보는 사람** 관점에서 검토하세요.
이미지 경로: /mnt/c/dev/notes/eastasia-ppt/seomin-culture-lecture_qa/images  (slide*.png)
금지 패턴 기준: /home/user/.claude/skills/ppt-lab-rebuild/references/tools/forbidden-patterns.md

각 슬라이드마다 확인:
1. AI tell 12종 위반 (제목 밑 액센트바 / 본문 중앙정렬 / emoji / 텍스트전용 / 모티프 불일치 등)
2. 텍스트 잘림·오버플로우·여백 침범
3. 차트 라벨 누락·축 깨짐
4. 팔레트 일관성 (한 덱 = 한 톤)
5. 카피 규칙 위반 (불릿 줄글, 숫자 단위 누락)

출력: 슬라이드 번호별 이슈 목록 + 심각도(blocker/minor) + 수정 제안.
이슈 0건이면 "QA PASS" 선언.
