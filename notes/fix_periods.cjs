const fs = require('fs');
const filePath = 'G:/내 드라이브/PC 백업/TASKS/정보부 인수인계/2026학년도 개인정보 수집·이용 동의서 가정통신문 - 보강.xml';
let content = fs.readFileSync(filePath, 'utf-8');

// 전략: 각 항목의 제공받는 자 키워드를 앵커로 사용해서 해당 블록의 보유기간을 정확히 교체

function fixPeriodNear(anchor, wrongPeriod, correctPeriod, range) {
  const idx = content.indexOf(anchor);
  if (idx < 0) { console.log('NOT FOUND:', anchor); return; }
  
  // anchor 기준 range 내에서 wrongPeriod 찾기
  const start = Math.max(0, idx - range);
  const end = Math.min(content.length, idx + range);
  const slice = content.substring(start, end);
  const wrongIdx = slice.indexOf(wrongPeriod);
  
  if (wrongIdx >= 0) {
    const absIdx = start + wrongIdx;
    content = content.substring(0, absIdx) + correctPeriod + content.substring(absIdx + wrongPeriod.length);
    console.log('Fixed near', anchor.substring(0, 30), ':', wrongPeriod.substring(0, 40), '->', correctPeriod.substring(0, 40));
  } else {
    console.log('No fix needed near', anchor.substring(0, 30));
  }
}

// 온라인수업 제3자 제공 보유기간 (Google LLC 블록)
fixPeriodNear('Google LLC', 
  '신청 학생의 과목 사전 수요조사 시기부터 차기 년도 진학 처리 시까지',
  '학생의 본교 재학 기간', 800);

// 슈퍼스쿨 수집이용 보유기간 (클라우드스쿨 블록 앞쪽)
// 슈퍼스쿨 1번 표에서 수집이용 보유기간 = 졸업 후 2년
// 근데 현재 '이름표 제작 시부터 졸업 시까지'로 되어있음 - 이건 학생증 행의 것
// 슈퍼스쿨 행을 정확히 찾아야 함
const superCollectIdx = content.indexOf('교직원의 연락처 열람, 학생증');
if (superCollectIdx > 0) {
  // 이 뒤의 첫 번째 보유기간
  const afterSuper = content.substring(superCollectIdx, superCollectIdx + 2000);
  
  // 수집이용 보유기간 찾기 - '이름표 제작 시부터 졸업 시까지' 를 '졸업 후 2년'으로
  const wrongP = '이름표 제작 시부터 졸업 시까지';
  const wi = afterSuper.indexOf(wrongP);
  if (wi >= 0) {
    const absI = superCollectIdx + wi;
    content = content.substring(0, absI) + '졸업 후 2년' + content.substring(absI + wrongP.length);
    console.log('Fixed 슈퍼스쿨 수집 보유기간');
  }
  
  // 제3자 제공 보유기간 - '이름표 제작 시부터 학교에 학생증 납품 시까지' 를 '졸업 후 2년'으로
  // 다시 읽기 (위에서 content 변경됨)
  const afterSuper2 = content.substring(superCollectIdx, superCollectIdx + 2000);
  const wrongP2 = '이름표 제작 시부터 학교에 학생증 납품 시까지';
  const wi2 = afterSuper2.indexOf(wrongP2);
  if (wi2 >= 0) {
    const absI2 = superCollectIdx + wi2;
    content = content.substring(0, absI2) + '졸업 후 2년' + content.substring(absI2 + wrongP2.length);
    console.log('Fixed 슈퍼스쿨 제3자 보유기간');
  }
}

// 고교학점제 수집이용 보유기간
// 현재: '해당 학년도까지(다음해2월까지)' -> 맞는 것은 '신청 학생의 과목 사전 수요조사 시기부터 차기 년도 진학 처리 시까지'
const gogyoIdx = content.indexOf('고교학점제 수강 신청 처리');
if (gogyoIdx > 0) {
  // 이 블록 앞쪽에 수집이용 보유기간이 있음
  const beforeGogyo = content.substring(gogyoIdx - 2000, gogyoIdx);
  const wrongGP = '해당 학년도까지(다음해2월까지)';
  // 마지막 출현 찾기 (수집이용 쪽)
  let lastIdx = -1, searchPos = 0;
  while (true) {
    const found = beforeGogyo.indexOf(wrongGP, searchPos);
    if (found < 0) break;
    lastIdx = found;
    searchPos = found + 1;
  }
  if (lastIdx >= 0) {
    const absI = (gogyoIdx - 2000) + lastIdx;
    content = content.substring(0, absI) + '신청 학생의 과목 사전 수요조사 시기부터 차기 년도 진학 처리 시까지' + content.substring(absI + wrongGP.length);
    console.log('Fixed 고교학점제 수집 보유기간');
  }
  
  // 고교학점제 제3자 제공 보유기간도 확인
  const afterGogyo = content.substring(gogyoIdx, gogyoIdx + 800);
  const wrongGP2 = '해당 학년도까지(다음해2월까지)';
  const gi2 = afterGogyo.indexOf(wrongGP2);
  if (gi2 >= 0) {
    const absI2 = gogyoIdx + gi2;
    content = content.substring(0, absI2) + '신청 학생의 과목 사전 수요조사 시기부터 차기 년도 진학 처리 시까지' + content.substring(absI2 + wrongGP2.length);
    console.log('Fixed 고교학점제 제3자 보유기간');
  }
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('\nDone. Verifying...');

// 최종 검증
const final = fs.readFileSync(filePath, 'utf-8');
const text = final.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

const anchors = [
  { name: '온라인수업', anchor: 'Google LLC' },
  { name: '슈퍼스쿨', anchor: '클라우드스쿨' },
  { name: '하이러닝', anchor: '하이러닝 플랫폼 회원' },
  { name: '학교도서관', anchor: 'KERIS' },
  { name: '고교학점제', anchor: '수강 신청 처리' },
];

anchors.forEach(a => {
  const idx = text.indexOf(a.anchor);
  const slice = text.substring(idx - 500, idx + 300);
  const periods = slice.match(/보유[^□]{5,60}/g);
  console.log('\n' + a.name + ':');
  if (periods) periods.forEach(p => console.log('  ', p.trim()));
});
