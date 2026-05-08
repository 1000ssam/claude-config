import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';

const updates = [
  {
    id: '2f4dd1dc-d644-80d0-9885-dbbb41a98e39',
    label: 'mandatory-training-2025',
    metaTitle: '2025 법정의무교육 관리 노션 템플릿 - 교직원 이수 현황 | 노션톡',
    metaDesc: '법정의무교육 이수 현황을 한글·엑셀로 일일이 정리하시나요? 교육 프로그램·교직원 명단·이수 현황 3개 DB로 한 화면에서 관리하는 노션 샘플 템플릿입니다.',
  },
  {
    id: '2f4dd1dc-d644-8007-9c9c-f82f09c8f578',
    label: 'notion-class-placement',
    metaTitle: '노션 반편성 템플릿 - 차트로 한눈에 보는 학년 배정 | 노션톡',
    metaDesc: '학년 반편성을 엑셀·종이로 하시나요? 차트로 남녀 구성비·가나다 인원이 한눈에 보이는 학년부장 노하우 노션 템플릿이에요. 특별 학생 기배정 원칙도 포함.',
  },
  {
    id: '2f4dd1dc-d644-80a7-822d-c40d45f41848',
    label: 'notion-study-time-tracker',
    metaTitle: '노션 공부시간 자동 측정 템플릿 - 버튼+datebetween | 노션톡',
    metaDesc: '공부 시간을 매번 손으로 적으시나요? 시작·종료 버튼 한 번에 datebetween 함수로 분 단위 자동 계산되는 노션 공부 시간 트래커 템플릿입니다.',
  },
  {
    id: '2f4dd1dc-d644-8014-b08b-e84fd11c15fe',
    label: 'notion-make-class-challenge',
    metaTitle: '노션+Make 학급 챌린지 자동화 - 인증부터 보상까지 | 노션톡',
    metaDesc: '학급 챌린지 운영을 노션과 Make 자동화로 끝내는 시나리오. 학생 스터디플래너 인증·꾸준 참여자 보상 지급까지 자동화하는 템플릿과 가이드를 공유합니다.',
  },
  {
    id: '2f4dd1dc-d644-80b7-9004-df063b9748e3',
    label: 'student-sticker-board (학생 참여도 기록)',
    metaTitle: '학생 참여도 기록 노션 템플릿 - 발표·질문 자동 누적 | 노션톡',
    metaDesc: '수업 중 누가 발표했는지 까먹으시나요? 버튼 한 번으로 학생별 참여도가 누적되고 차트로 시각화되어 생기부 작성까지 이어주는 무료 노션 템플릿입니다.',
  },
  {
    id: '2f4dd1dc-d644-80b6-8256-cb61a72c7618',
    label: 'autumn-dashboard-template',
    metaTitle: '가을 무드 노션 대시보드 템플릿 - 교사 업무 무료 공유 | 노션톡',
    metaDesc: '매일 보는 노션 화면이 무미건조하지 않으세요? 가을 분위기로 꾸민 업무 대시보드와 홈 캘린더로 새 에너지를 채우는 노션 템플릿을 무료로 공유합니다.',
  },
  {
    id: '2f4dd1dc-d644-80de-b489-d8f174f9ae79',
    label: 'notion-progress-macro',
    metaTitle: '진도표 자동 생성 매크로 - 엑셀에서 노션으로 한 번에 | 노션톡',
    metaDesc: '한 학기 진도표를 손으로 만드시나요? 시간표만 입력하면 매크로가 진도표를 자동 생성하고, 노션에 붙여 한 학기 진도 관리 자료를 만드는 템플릿입니다.',
  },
  {
    id: '2f4dd1dc-d644-80d8-a805-f787471ecb5b',
    label: 'ultimate-teachers-log',
    metaTitle: '2026 노션 교무수첩 종결자 - 1000쌤 노하우 집약 | 노션톡',
    metaDesc: '교무수첩 라이트가 손에 익으셨나요? 1000쌤이 자동화·리마인드·애널리틱스·AI 생기부까지 집약한 본격 노션 교무수첩 종결자로 한 단계 올라가세요.',
  },
];

console.log(`총 ${updates.length}건 메타 업데이트 시작\n`);

for (const u of updates) {
  await notion.call('PATCH', `/pages/${u.id}`, {
    properties: {
      'Meta Title': { rich_text: [{ text: { content: u.metaTitle } }] },
      'Meta Description': { rich_text: [{ text: { content: u.metaDesc } }] },
    },
  });
  console.log(`✓ ${u.label}`);
  console.log(`  Title  (${u.metaTitle.length}자): ${u.metaTitle}`);
  console.log(`  Desc   (${u.metaDesc.length}자): ${u.metaDesc}`);
  console.log('');
}

console.log('=== 완료 ===');
