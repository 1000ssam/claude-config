const fs = require('fs');
const filePath = 'G:/내 드라이브/PC 백업/TASKS/정보부 인수인계/2026학년도 개인정보 수집·이용 동의서 가정통신문 - 보강.xml';
let content = fs.readFileSync(filePath, 'utf-8');

// 표준화 검사 텍스트 블록이 6번 반복됨. 첫 번째는 원본, 2~6번째를 교체.
// 각 행은 동일한 텍스트 패턴을 가짐. 순서대로 2~6번째를 찾아 교체.

const items = [
  {
    name: '온라인수업\n(구글 Workspace)',
    collect: {
      purpose: '구글 Workspace 계정 생성 및 Workspace 계정 활용 온라인 수업활동 참여',
      items: '학교명, 학번, 이름, 이메일, 아이디',
      period: '학생의 본교 재학 기간'
    },
    provide: {
      to: 'Google LLC',
      purpose: '구글 Workspace 계정 생성 및 온라인 수업 서비스 제공',
      items: '학교명, 학번, 이름, 이메일, 아이디',
      period: '학생의 본교 재학 기간'
    }
  },
  {
    name: '슈퍼스쿨',
    collect: {
      purpose: '교육활동(출결관리, 교육활동기록), 소통(교사-학생, 학부모), 교육활동 및 안전지도를 위한 교직원의 연락처 열람, 학생증',
      items: '[학생] 성명, 생년월일, 주소, 휴대전화 번호, 이메일, 아이디, 사진 / [보호자] 성명, 휴대전화 번호, 이메일',
      period: '졸업 후 2년'
    },
    provide: {
      to: '(주)클라우드스쿨(슈퍼스쿨 운영사)',
      purpose: '슈퍼스쿨 플랫폼 서비스 운영 및 제공',
      items: '[학생] 성명, 생년월일, 주소, 휴대전화 번호, 이메일, 아이디, 사진 / [보호자] 성명, 휴대전화 번호, 이메일',
      period: '졸업 후 2년'
    }
  },
  {
    name: '하이러닝',
    collect: {
      purpose: 'AI기반 교수·학습 플랫폼(하이러닝) 서비스 이용',
      items: '학번, 성명',
      period: '학생의 본교 재학 기간'
    },
    provide: {
      to: '경기도교육청(하이러닝 운영기관)',
      purpose: '하이러닝 플랫폼 회원 등록 및 서비스 제공',
      items: '학번, 성명',
      period: '학생의 본교 재학 기간'
    }
  },
  {
    name: '학교도서관\n업무관리시스템\n(독서로)',
    collect: {
      purpose: '학교도서관업무관리시스템(독서로 DLS), 독서로(에듀넷) 가입 및 활용',
      items: '학교명, 학번, 이름, 이메일, 아이디',
      period: '학생의 본교 재학 기간'
    },
    provide: {
      to: '한국교육학술정보원(KERIS)',
      purpose: '독서로 DLS 회원 등록 및 서비스 운영',
      items: '학교명, 학번, 이름, 이메일, 아이디',
      period: '학생의 본교 재학 기간'
    }
  },
  {
    name: '고교학점제\n수강신청',
    collect: {
      purpose: '상급 학년 과목 선택을 위한 고교학점제 수강 신청 시스템 이용',
      items: '학생(학번, 이름, 전화번호, 이메일), 보호자(성명, 전화번호)',
      period: '신청 학생의 과목 사전 수요조사 시기부터 차기 년도 진학 처리 시까지'
    },
    provide: {
      to: '경기도교육청(수강신청 시스템 운영기관)',
      purpose: '고교학점제 수강 신청 처리',
      items: '학생(학번, 이름, 전화번호, 이메일), 보호자(성명, 전화번호)',
      period: '신청 학생의 과목 사전 수요조사 시기부터 차기 년도 진학 처리 시까지'
    }
  }
];

// 표준화 검사 수집이용 텍스트 패턴 (원본에서 반복되는 블록)
const collectPattern = '1. 수집이용목적 : 학생 이해 및 지도';
const providePattern = '1. 제공받는 자 : 검사 실시 및 처리기관';
const namePattern = '표준화 검사';

// 각 출현 위치 찾기
function findAllPositions(str, substr) {
  const positions = [];
  let pos = 0;
  while ((pos = str.indexOf(substr, pos)) !== -1) {
    positions.push(pos);
    pos += substr.length;
  }
  return positions;
}

const namePositions = findAllPositions(content, namePattern);
const collectPositions = findAllPositions(content, collectPattern);
const providePositions = findAllPositions(content, providePattern);

console.log('업무명 위치:', namePositions.length, '개');
console.log('수집이용 위치:', collectPositions.length, '개');
console.log('제3자제공 위치:', providePositions.length, '개');

// 2번째~6번째 교체 (인덱스 1~5)
for (let i = 0; i < 5; i++) {
  const item = items[i];
  const idx = i + 1; // 원본이 0번, 복사본은 1~5번
  
  // 업무명 교체
  const namePos = namePositions[idx];
  content = content.substring(0, namePos) + item.name.split('\n')[0] + content.substring(namePos + namePattern.length);
  
  // 위치가 변경되었으므로 다시 찾기
  // 대신 텍스트 기반으로 순서대로 교체 (replace는 첫 번째만 바꾸므로 반복)
}

// 더 안전한 방법: 순차적으로 n번째 출현을 교체하는 함수
function replaceNth(str, search, replacement, n) {
  let pos = -1;
  for (let i = 0; i < n; i++) {
    pos = str.indexOf(search, pos + 1);
    if (pos === -1) return str;
  }
  return str.substring(0, pos) + replacement + str.substring(pos + search.length);
}

// 뒤에서부터 교체해야 위치가 안 밀림 (6번째 → 2번째 순)
let result = content;

for (let i = 4; i >= 0; i--) {
  const item = items[i];
  const nth = i + 2; // 2번째~6번째 출현
  
  // 업무명 교체
  result = replaceNth(result, namePattern, item.name.replace(/\n/g, ' '), nth);
  
  // 수집이용 목적
  result = replaceNth(result, '1. 수집이용목적 : 학생 이해 및 지도', '1. 수집이용목적 : ' + item.collect.purpose, nth);
  
  // 수집항목
  result = replaceNth(result, '2. 수집항목 : 학년, 반, 번호, 성명, 생년월일', '2. 수집항목 : ' + item.collect.items, nth);
  
  // 보유기간
  result = replaceNth(result, '3. 이용 및 보유기간 : 해당 학년도까지(다음해2월까지)', '3. 이용 및 보유기간 : ' + item.collect.period, nth);
  
  // 제3자 제공 - 제공받는 자
  result = replaceNth(result, '1. 제공받는 자 : 검사 실시 및 처리기관', '1. 제공받는 자 : ' + item.provide.to, nth);
  
  // 제공 목적
  result = replaceNth(result, '2. 제공받는 자의 이용 목적 : 검사 결과처리 및 송부', '2. 제공받는 자의 이용 목적 : ' + item.provide.purpose, nth);
  
  // 제공 항목
  result = replaceNth(result, '3. 제공하는 항목 : 학년, 반, 번호, 성명, 생년월일', '3. 제공하는 항목 : ' + item.provide.items, nth);
  
  // 제공 보유기간
  result = replaceNth(result, '해당 학년도까지(다음해2월까지)', item.provide.period, nth);
}

fs.writeFileSync(filePath, result, 'utf-8');

// 검증
const verify = ['온라인수업', '슈퍼스쿨', '하이러닝', '독서로', '고교학점제', 'Google LLC', '클라우드스쿨', 'KERIS'];
verify.forEach(kw => {
  const found = result.includes(kw);
  console.log(kw, ':', found ? 'OK' : 'MISSING');
});
