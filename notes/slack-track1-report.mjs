import { slack } from 'file:///mnt/c/Users/user/.claude/skills/scripts/slack-api.mjs';

const msg = `✅ 작업 완료: 뉴스레터 첫 대량발송 전 *트랙1 감사 4건* (읽기전용, 병렬)

🟢 *안전 (발송 가능 수준)*
• 리스트 위생: *554명*(552로 알았으나 실제 554) 전원 confirmed, 매우 깨끗. 형식오류·중복·테스트주소 0건. 도메인 오타 *2건만* 수정/제외하면 됨 (kakap.com→kakao, hanmail.ne→hanmail.net). 전체목록: \`notes/list-hygiene-suspects.txt\`
• 해지 로직: 토큰검증·상태전환(confirmed만 발송)·위조거부 모두 코드상 견고(PASS)

🟡 *발송 전 선결*
• *해지 라이브검증 미완*: 실주소 1건으로 ① 발송환경 PUBLIC_BASE_URL=notiontalk.com/newsletter 확인 ② GET/POST(원클릭) 실제 unsubscribed 전환 확인 필요. 해지링크 슬래시 누락→308 리다이렉트 의존, 일부 메일클라가 원클릭 POST 리다이렉트 안 따르면 무력화 위험.
• 디자인: home↔letter 본문 일관성 양호. accent #1F5D5C를 rgba로 하드코딩 중복 2곳(page.tsx:63, SubscribeForm.tsx:192) — 토큰화 권장(발송 차단 아님)

🔴 *레터 추가발행 전 선결 (웹 아카이브)*
• 슬러그 *중복 사일런트 콜리전* (page_size:1 첫결과+정렬없음, 비결정적) + 홈링크 encodeURIComponent 누락(page.tsx:81) → 공백/한글 슬러그면 자기링크 404. 레터 더 올리기 전 유니크 보장+인코딩 선결.

▶️ 다음 차단요소 = *해지 라이브검증*. 진행 여부 대기 중.`;

const res = await slack.sendMessage('#자동화메시지', msg);
console.log('sent:', res.ts || JSON.stringify(res));
