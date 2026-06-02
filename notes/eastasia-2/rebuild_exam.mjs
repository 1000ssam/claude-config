import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';

const PAGE = '36ddd1dc-d644-8162-9ceb-c200f45c8d52';
const ROSTER_DS = '2eedd1dc-d644-81b7-814d-000b7c0ba6e2';
const SHOT = '/mnt/c/Users/user/Inbox/Desktop/동아시아사 수업 자료/08_기출_스크린샷';

const rt = (parts) => parts.map(p => ({
  type: 'text', text: { content: p.t },
  annotations: { bold: !!p.b, italic: false, strikethrough: false, underline: false, code: false, color: 'default' },
}));
const bullet = (parts) => ({ type: 'bulleted_list_item', bulleted_list_item: { rich_text: rt(parts) } });
const divider = () => ({ type: 'divider', divider: {} });
const txtOf = (b) => (b[b.type]?.rich_text || []).map(r => r.plain_text).join('');

// 8문항 (연대순)
const Q = [
  { title: '2023 6월모평 12번', file: '2023_6월모평_Q12.webp', cue: '(가) 물품 = 은. 에스파냐의 마닐라 건설, 포토시 은, 갈레온선, 아카풀코 회항' },
  { title: '2024 6월모평 9번', file: '2024_6월모평_Q09.webp', cue: '밑줄 ‘반란’ = 삼번의 난(청). 선지에 지정은제·연행사·휘저우 상인 회관 — 청 시기 동아시아 상황 종합 판별' },
  { title: '2024 6월모평 11번', file: '2024_6월모평_Q11.webp', cue: '(가) = 포르투갈. 믈라카 거점·말루쿠 향신료, 나가사키에서 얻은 은으로 중국 비단 구매. 선지에 갈레온(에스파냐)·데지마·바타비아 혼합' },
  { title: '2024 9월모평 9번', file: '2024_9월모평_Q09.webp', cue: '(가) 왕조 = 청(『대의각미록』). 보기에 마제은(명·청 화폐)·삼포왜란·도요토미 토지조사·덴메이 기근 — 시기 판별' },
  { title: '2025 5월학평 14번', file: '2025_5월학평_Q14.webp', cue: '(가) = 은. 단천 광산 상납, 납을 활용한 회취법 제련, 일조편법 세금 납부' },
  { title: '2025 7월학평 14번', file: '2025_7월학평_Q14.webp', cue: '‘이 국가’ = 에스파냐. 수은 아말감법, 포토시 은, 아카풀코→마닐라, 갈레온 무역' },
  { title: '2025 9월모평 12번', file: '2025_9월모평_Q12.webp', cue: '(가) = 은. 하카타 상인의 회취법(재·납 제련), 이와미 항구, 갈레온 무역·일조편법' },
  { title: '2025 10월학평 11번', file: '2025_10월학평_Q11.webp', cue: '(가) = 은. 16세기 유럽 제작 지도, 이와미 광산, 조선에서 회취법 도입' },
];

// 1) 현재 children
const ch = await notion.call('GET', `/blocks/${PAGE}/children?page_size=200`);
const kids = ch.results;

// 2) orange/blue 콜아웃 갱신
let orangeId = null, blueId = null;
for (const b of kids) {
  if (b.type === 'callout' && b.callout.color === 'orange_background' && txtOf(b) === '출제 요약') orangeId = b.id;
  if (b.type === 'callout' && b.callout.color === 'blue_background' && txtOf(b) === '출제 방식 분석') blueId = b.id;
}
const oc = await notion.call('GET', `/blocks/${orangeId}/children?page_size=50`);
for (const b of oc.results) {
  const t = txtOf(b);
  if (t.startsWith('총 5문항')) await notion.call('PATCH', `/blocks/${b.id}`, { bulleted_list_item: { rich_text: rt([{ t: '총 8문항 — 2023 6월 / 2024 6월(9·11번)·9월 / 2025 5월·7월·9월·10월' }]) } });
  else if (t.startsWith('빈출 소재')) await notion.call('PATCH', `/blocks/${b.id}`, { bulleted_list_item: { rich_text: rt([{ t: '빈출 소재: 은(銀)의 정체 추론, 갈레온 무역, 회취법, 이와미 은광, 일조편법·지정은제, 마제은, 포토시 은광' }]) } });
  else if (t.startsWith('유형')) await notion.call('PATCH', `/blocks/${b.id}`, { bulleted_list_item: { rich_text: rt([{ t: '유형: (가) 물품(은) 식별형, 유럽 국가 식별형, 명·청 시기통합 보기형, 제련법·무역 제시문 합답형' }]) } });
}
// blue에 통합형 불릿 1개 추가 (중복 방지: 이미 있으면 skip)
const bc = await notion.call('GET', `/blocks/${blueId}/children?page_size=50`);
const hasIntegr = bc.results.some(b => txtOf(b).includes('통합형 多'));
if (!hasIntegr) {
  await notion.call('PATCH', `/blocks/${blueId}/children`, { children: [
    bullet([{ t: '1차시(교역망)+2차시(은 유통)을 한 문항에서 함께 묻는 통합형 多 — 마닐라·갈레온(에스파냐)과 데지마·바타비아(네덜란드)를 선지에 섞어 유럽 국가·거점을 식별시킴 (예: 2024 6월 Q11)' }]),
  ] });
}
console.log('callouts updated');

// 3) "2023 6월모평 12번"부터 끝까지 삭제
const idx = kids.findIndex(b => b.type === 'bulleted_list_item' && txtOf(b).startsWith('2023 6월모평 12번'));
if (idx < 0) throw new Error('start bullet not found');
const toDelete = kids.slice(idx);
console.log('deleting ' + toDelete.length + ' blocks');
for (const b of toDelete) {
  await notion.call('DELETE', `/blocks/${b.id}`);
}
console.log('deleted');

// 4) 8개 이미지 재업로드
for (const q of Q) {
  q.uploadId = await notion.uploadFile(`${SHOT}/${q.file}`);
}
console.log('uploaded 8 images');

// 5) 8문항 + 구분선 + "# 4. 기출 풀이" 헤딩 append
const blocks = [];
Q.forEach((q) => {
  blocks.push(bullet([{ t: q.title, b: true }]));
  blocks.push({ type: 'callout', callout: { rich_text: rt([{ t: '핵심 제시어  ', b: true }, { t: q.cue }]), icon: { type: 'emoji', emoji: '📝' }, color: 'gray_background' } });
  blocks.push({ type: 'image', image: { type: 'file_upload', file_upload: { id: q.uploadId } } });
  blocks.push(divider());
});
blocks.push({ type: 'heading_1', heading_1: { rich_text: rt([{ t: '4. 기출 풀이' }]) } });
await notion.appendBlocks(PAGE, blocks);
console.log('appended ' + blocks.length + ' blocks');

// 6) 폼 DB 재생성 (8문항)
const props = {
  '제출 제목': { title: {} },
  '관련 학생': { relation: { data_source_id: ROSTER_DS, single_property: {} } },
  '주제': { multi_select: { options: [{ name: '08. 교역망의 발달과 은 유통' }] } },
};
for (const q of Q) props[q.title] = { rich_text: {} };
props['답안 메모'] = { rich_text: {} };

const db = await notion.createDatabase(PAGE, '동아시아사_08. 교역망의 발달과 은 유통 (2차시)_기출문제 답 입력', '📝', props);
console.log('FORM_DB_ID=' + db.id);
console.log('ALL DONE');
