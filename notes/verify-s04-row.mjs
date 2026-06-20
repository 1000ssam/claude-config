import { notion } from 'file:///mnt/c/Users/user/.claude/skills/scripts/notion-api.mjs';
const PID = '37cdd1dc-d644-8154-93ac-ffcfe5ae6df4';
const p = await notion.call('GET', `/pages/${PID}`);
const props = p.properties;
const txt = (rt) => (rt || []).map(t => t.plain_text || t.text?.content || '').join('');
console.log('이름:', txt(props['이름']?.title));
console.log('이메일:', props['이메일']?.email);
console.log('공부주제단원:', txt(props['공부주제단원']?.rich_text));
console.log('만든학습기능:', (props['만든학습기능']?.multi_select || []).map(o => o.name).join(', '));
console.log('AI자료검수:', txt(props['AI자료검수']?.rich_text));
console.log('친구자료소감:', txt(props['친구자료소감']?.rich_text));
console.log('다음에만들것:', txt(props['다음에만들것']?.rich_text));
// 검증 후 테스트 행 휴지통 이동
await notion.call('PATCH', `/pages/${PID}`, { in_trash: true });
console.log('\n→ 테스트 행 휴지통 이동 완료');
