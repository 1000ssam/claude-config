import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';
const dsId = 'b6ff65a3-7756-479b-99b2-ce8024b56ca2';
const names = ['플래시카드', '퀴즈', 'AI 오디오 오버뷰', '마인드맵', '보고서', '동영상 개요', '슬라이드 자료', '인포그래픽', '데이터 표', '기타'];
const options = names.map((name) => ({ name }));
const r = await notion.call('PATCH', `/data_sources/${dsId}`, {
  properties: { '만든학습기능': { multi_select: { options } } },
});
console.log('updated options:', (r.properties?.['만든학습기능']?.multi_select?.options || []).map((o) => o.name).join(', '));
