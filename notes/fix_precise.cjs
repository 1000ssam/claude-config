const fs = require('fs');
const filePath = 'G:/내 드라이브/PC 백업/TASKS/정보부 인수인계/2026학년도 개인정보 수집·이용 동의서 가정통신문 - 보강.xml';
let content = fs.readFileSync(filePath, 'utf-8');

// 1번 표 내 새로 추가된 5개 행의 정확한 수집이용목적을 앵커로 사용
// 각 앵커 뒤 첫 번째 보유기간만 수정

function fixFirstPeriodAfter(anchor, correctCollectPeriod, correctProvidePeriod) {
  const idx = content.indexOf(anchor);
  if (idx < 0) { console.log('ANCHOR NOT FOUND:', anchor); return; }
  
  // 앵커 이후 텍스트에서 보유기간 패턴 찾기
  // pubdoc XML에서 보유기간은 다양한 형태로 존재
  // 수집이용 보유기간: "이용 및 보유기간 :" 또는 "보유기간 :"
  // 제3자 제공 보유기간: "보유·이용기간 :"
  
  const after = content.substring(idx);
  
  // 수집이용 보유기간 교체
  const collectPeriodRe = /이용 및 보유기간 : ([^<]+)/;
  const cm = after.match(collectPeriodRe);
  if (cm) {
    const oldVal = cm[1].trim();
    if (oldVal !== correctCollectPeriod) {
      const absPos = idx + after.indexOf(cm[0]);
      const newStr = '이용 및 보유기간 : ' + correctCollectPeriod;
      content = content.substring(0, absPos) + newStr + content.substring(absPos + cm[0].length);
      console.log(anchor.substring(0, 30) + ' 수집 보유기간: ' + oldVal + ' -> ' + correctCollectPeriod);
    }
  }
  
  // 다시 idx 이후 다시 읽기 (content 변경됨)
  const after2 = content.substring(idx);
  const providePeriodRe = /보유·이용기간 : ([^<]+)/;
  const pm = after2.match(providePeriodRe);
  if (pm) {
    const oldVal = pm[1].trim();
    if (oldVal !== correctProvidePeriod) {
      const absPos = idx + after2.indexOf(pm[0]);
      const newStr = '보유·이용기간 : ' + correctProvidePeriod;
      content = content.substring(0, absPos) + newStr + content.substring(absPos + pm[0].length);
      console.log(anchor.substring(0, 30) + ' 제공 보유기간: ' + oldVal + ' -> ' + correctProvidePeriod);
    }
  }
}

// 각 항목의 수집이용목적 텍스트를 앵커로 사용 (1번 표 내 유일한 텍스트)
fixFirstPeriodAfter('구글 Workspace 계정 생성 및 Workspace 계정 활용 온라인 수업활동 참여', 
  '학생의 본교 재학 기간', '학생의 본교 재학 기간');

fixFirstPeriodAfter('교직원의 연락처 열람, 학생증',
  '졸업 후 2년', '졸업 후 2년');

fixFirstPeriodAfter('AI기반 교수·학습 플랫폼(하이러닝)',
  '학생의 본교 재학 기간', '학생의 본교 재학 기간');

fixFirstPeriodAfter('학교도서관업무관리시스템(독서로 DLS), 독서로(에듀넷) 가입 및 활용',
  '학생의 본교 재학 기간', '학생의 본교 재학 기간');

fixFirstPeriodAfter('상급 학년 과목 선택을 위한 고교학점제 수강 신청 시스템 이용',
  '신청 학생의 과목 사전 수요조사 시기부터 차기 년도 진학 처리 시까지',
  '신청 학생의 과목 사전 수요조사 시기부터 차기 년도 진학 처리 시까지');

fs.writeFileSync(filePath, content, 'utf-8');
console.log('\n=== 최종 검증 ===');

// 최종 검증
const final = fs.readFileSync(filePath, 'utf-8');
const text = final.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

const checks = [
  { name: '온라인수업', anchor: 'Workspace 계정 활용 온라인' },
  { name: '슈퍼스쿨', anchor: '교직원의 연락처 열람' },
  { name: '하이러닝', anchor: 'AI기반 교수' },
  { name: '학교도서관', anchor: '독서로 DLS' },
  { name: '고교학점제', anchor: '고교학점제 수강 신청 시스템' },
];

checks.forEach(c => {
  const idx = text.indexOf(c.anchor);
  // 해당 앵커 이후 ~ 다음 앵커 전까지 슬라이스
  const nextAnchorIdx = checks.findIndex(x => text.indexOf(x.anchor) > idx && x.name !== c.name);
  const endIdx = nextAnchorIdx >= 0 ? text.indexOf(checks[nextAnchorIdx].anchor) : idx + 1000;
  const slice = text.substring(idx, Math.min(endIdx, idx + 1000));
  const periods = slice.match(/보유[^□]{5,80}까지|보유[^□]{5,30}기간/g);
  console.log(c.name + ':');
  if (periods) periods.forEach(p => console.log('  ', p.trim()));
  console.log('');
});
