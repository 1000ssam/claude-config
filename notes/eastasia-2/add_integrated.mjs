import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';

const PAGE = '36ddd1dc-d644-8162-9ceb-c200f45c8d52';
const FORM_DS = '5276fb2a-ced9-4cf8-a2d6-d2b102d7ad6a';
const SHOT = '/mnt/c/Users/user/Inbox/Desktop/동아시아사 수업 자료/08_기출_스크린샷';

const rt = (parts) => parts.map(p => ({
  type: 'text', text: { content: p.t },
  annotations: { bold: !!p.b, italic: false, strikethrough: false, underline: false, code: false, color: 'default' },
}));
const bullet = (parts) => ({ type: 'bulleted_list_item', bulleted_list_item: { rich_text: rt(parts) } });
const divider = () => ({ type: 'divider', divider: {} });

const NEW = [
  { title: '2024 6월모평 9번', file: '2024_6월모평_Q09.webp',
    cue: '밑줄 ‘반란’ = 삼번의 난(청). 선지에 지정은제·연행사·휘저우 상인 회관 — 청 시기 동아시아 상황 종합 판별' },
  { title: '2024 6월모평 11번', file: '2024_6월모평_Q11.webp',
    cue: '(가) = 포르투갈. 믈라카 거점·말루쿠 향신료, 나가사키에서 얻은 은으로 중국 비단 구매. 선지에 갈레온(에스파냐)·데지마·바타비아 혼합' },
  { title: '2024 9월모평 9번', file: '2024_9월모평_Q09.webp',
    cue: '(가) 왕조 = 청(『대의각미록』). 보기에 마제은(명·청 화폐)·삼포왜란·도요토미 토지조사·덴메이 기근 — 시기 판별' },
];

// 1) 업로드
for (const q of NEW) {
  q.uploadId = await notion.uploadFile(`${SHOT}/${q.file}`);
  console.log(`uploaded ${q.file}`);
}

// 2) 앵커 찾기: "2025 5월학평 14번" 불릿 직전의 divider
const ch = await notion.call('GET', `/blocks/${PAGE}/children?page_size=200`);
const kids = ch.results;
const txtOf = (b) => (b[b.type]?.rich_text || []).map(r => r.plain_text).join('');
let anchorId = null;
for (let i = 0; i < kids.length; i++) {
  if (kids[i].type === 'bulleted_list_item' && txtOf(kids[i]).startsWith('2025 5월학평 14번')) {
    const prev = kids[i - 1];
    if (prev && prev.type === 'divider') anchorId = prev.id;
    break;
  }
}
if (!anchorId) throw new Error('anchor divider not found');
console.log('anchor divider=' + anchorId);

// 3) 신규 문항 블록 (연대순)
const ins = [];
for (const q of NEW) {
  ins.push(bullet([{ t: q.title, b: true }]));
  ins.push({ type: 'callout', callout: { rich_text: rt([{ t: '핵심 제시어  ', b: true }, { t: q.cue }]), icon: { type: 'emoji', emoji: '📝' }, color: 'gray_background' } });
  ins.push({ type: 'image', image: { type: 'file_upload', file_upload: { id: q.uploadId } } });
  ins.push(divider());
}
await notion.call('PATCH', `/blocks/${PAGE}/children`, { children: ins, after: anchorId });
console.log('inserted ' + ins.length + ' blocks after anchor');

// 4) 출제 요약(orange) 불릿 갱신 + 출제 방식(blue)에 통합형 불릿 추가
let orangeId = null, blueId = null;
for (const b of kids) {
  if (b.type === 'callout' && b.callout.color === 'orange_background' && txtOf(b) === '출제 요약') orangeId = b.id;
  if (b.type === 'callout' && b.callout.color === 'blue_background' && txtOf(b) === '출제 방식 분석') blueId = b.id;
}
console.log('orange=' + orangeId + ' blue=' + blueId);

// 4a) orange callout 자식 불릿 갱신
const oc = await notion.call('GET', `/blocks/${orangeId}/children?page_size=50`);
for (const b of oc.results) {
  const t = txtOf(b);
  if (t.startsWith('총 5문항')) {
    await notion.call('PATCH', `/blocks/${b.id}`, { bulleted_list_item: { rich_text: rt([{ t: '총 8문항 — 2023 6월 / 2024 6월(9·11번)·9월 / 2025 5월·7월·9월·10월' }]) } });
  } else if (t.startsWith('빈출 소재')) {
    await notion.call('PATCH', `/blocks/${b.id}`, { bulleted_list_item: { rich_text: rt([{ t: '빈출 소재: 은(銀)의 정체 추론, 갈레온 무역, 회취법, 이와미 은광, 일조편법·지정은제, 마제은, 포토시 은광' }]) } });
  } else if (t.startsWith('유형')) {
    await notion.call('PATCH', `/blocks/${b.id}`, { bulleted_list_item: { rich_text: rt([{ t: '유형: (가) 물품(은) 식별형, 유럽 국가 식별형, 명·청 시기통합 보기형, 제련법·무역 제시문 합답형' }]) } });
  }
}
console.log('orange bullets updated');

// 4b) blue callout에 통합형 불릿 추가
await notion.call('PATCH', `/blocks/${blueId}/children`, { children: [
  bullet([{ t: '1차시(교역망)+2차시(은 유통)을 한 문항에서 함께 묻는 통합형 多 — 마닐라·갈레온(에스파냐)과 데지마·바타비아(네덜란드)를 선지에 섞어 유럽 국가·거점을 식별시킴 (예: 2024 6월 Q11)' }]),
] });
console.log('blue bullet appended');

// 5) 폼 DB에 신규 문항 rich_text 속성 추가
await notion.call('PATCH', `/data_sources/${FORM_DS}`, { properties: {
  '2024 6월모평 9번': { rich_text: {} },
  '2024 6월모평 11번': { rich_text: {} },
  '2024 9월모평 9번': { rich_text: {} },
} });
console.log('form props added');
console.log('ALL DONE');
