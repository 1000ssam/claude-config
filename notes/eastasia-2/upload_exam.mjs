import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';

const PAGE = '36ddd1dc-d644-8162-9ceb-c200f45c8d52';
const SHOT = '/mnt/c/Users/user/Inbox/Desktop/동아시아사 수업 자료/08_기출_스크린샷';

// rich_text 헬퍼: [{t:'plain'}, {t:'bold', b:true}]
const rt = (parts) => parts.map(p => ({
  type: 'text', text: { content: p.t },
  annotations: { bold: !!p.b, italic: false, strikethrough: false, underline: false, code: false, color: 'default' },
}));
const bullet = (parts) => ({ type: 'bulleted_list_item', bulleted_list_item: { rich_text: rt(parts) } });
const divider = () => ({ type: 'divider', divider: {} });

// 문항 정의 (연대순)
const Q = [
  { title: '2023 6월모평 12번', file: '2023_6월모평_Q12.webp',
    cue: '(가) 물품 = 은. 에스파냐의 마닐라 건설, 포토시 은, 갈레온선, 아카풀코 회항' },
  { title: '2025 5월학평 14번', file: '2025_5월학평_Q14.webp',
    cue: '(가) = 은. 단천 광산 상납, 납을 활용한 회취법 제련, 일조편법 세금 납부' },
  { title: '2025 7월학평 14번', file: '2025_7월학평_Q14.webp',
    cue: '‘이 국가’ = 에스파냐. 수은 아말감법, 포토시 은, 아카풀코→마닐라, 갈레온 무역' },
  { title: '2025 9월모평 12번', file: '2025_9월모평_Q12.webp',
    cue: '(가) = 은. 하카타 상인의 회취법(재·납 제련), 이와미 항구, 갈레온 무역·일조편법' },
  { title: '2025 10월학평 11번', file: '2025_10월학평_Q11.webp',
    cue: '(가) = 은. 16세기 유럽 제작 지도, 이와미 광산, 조선에서 회취법 도입' },
];

// 1) 이미지 업로드
for (const q of Q) {
  q.uploadId = await notion.uploadFile(`${SHOT}/${q.file}`);
  console.log(`uploaded ${q.file} -> ${q.uploadId}`);
}

// 2) 블록 조립
const blocks = [];
blocks.push(divider());
blocks.push({ type: 'heading_1', heading_1: { rich_text: rt([{ t: '3. 기출 분석' }]) } });

// 출제 요약 (orange)
blocks.push({
  type: 'callout',
  callout: {
    rich_text: rt([{ t: '출제 요약', b: true }]),
    icon: { type: 'emoji', emoji: '📊' },
    color: 'orange_background',
    children: [
      bullet([{ t: '총 5문항 — 2023 6월모평 / 2025 5월·7월·9월·10월' }]),
      bullet([{ t: '빈출 소재: 은(銀)의 정체 추론, 갈레온 무역, 회취법, 이와미 은광, 일조편법, 포토시 은광' }]),
      bullet([{ t: '유형: (가) 물품(은) 식별형, 밑줄 ‘이 국가’(에스파냐) 추론형, 제련법·무역 제시문 + <보기> 합답형' }]),
    ],
  },
});

// 출제 방식 분석 (blue)
blocks.push({
  type: 'callout',
  callout: {
    rich_text: rt([{ t: '출제 방식 분석', b: true }]),
    icon: { type: 'emoji', emoji: '📊' },
    color: 'blue_background',
    children: [
      bullet([{ t: '제시문에 회취법·갈레온·이와미·포토시 등 단서를 주고 ‘(가) 물품 = 은’을 추론시키는 패턴 최빈' }]),
      bullet([{ t: '<보기> ㄱㄴㄷㄹ에 은의 용도(일조편법 세금 납부, 중국 비단 구입, 초량왜관 수출)를 분산 배치 → 은의 동아시아 유통 경로 종합 이해 요구' }]),
      bullet([{ t: '갈레온 무역 = 에스파냐(포토시·아카풀코·마닐라) 식별 단골' }]),
      bullet([{ t: '회취법 = 조선(단천) → 일본(이와미) 기술 이전 맥락으로 반복 출제' }]),
      bullet([{ t: '함정: 마제은·징더전 자기·초량왜관 등 인접 주제 선지로 교란 → 제시문 핵심어로 (가) 특정' }]),
    ],
  },
});

blocks.push({ type: 'heading_2', heading_2: { rich_text: rt([{ t: '시험별 기출 문항' }]) } });

Q.forEach((q, i) => {
  blocks.push(bullet([{ t: q.title, b: true }]));
  blocks.push({
    type: 'callout',
    callout: {
      rich_text: rt([{ t: '핵심 제시어  ', b: true }, { t: q.cue }]),
      icon: { type: 'emoji', emoji: '📝' },
      color: 'gray_background',
    },
  });
  blocks.push({ type: 'image', image: { type: 'file_upload', file_upload: { id: q.uploadId } } });
  if (i < Q.length - 1) blocks.push(divider());
});

await notion.appendBlocks(PAGE, blocks);
console.log('APPEND_DONE blocks=' + blocks.length);
