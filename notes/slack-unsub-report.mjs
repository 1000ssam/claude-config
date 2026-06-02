import { slack } from 'file:///mnt/c/Users/user/.claude/skills/scripts/slack-api.mjs';

const msg = `✅ 작업 완료: 뉴스레터 *해지 라이브 검증 + 후속 4건*

*① 해지 라이브 E2E = PASS (양 경로)*
• 본문 링크(GET)·원클릭 POST(RFC8058) 모두 프로덕션에서 노션 confirmed→unsubscribed 확인
• 원클릭 POST가 308 리다이렉트 두 번 내내 메서드 유지(=깨지지 않음) 증명
• *사용자가 실제 Gmail에서 원클릭 버튼 클릭 → unsubscribed 육안 확인까지 완료*

*② 발견·보정: apex→www + trailing-slash 308 두 번*
• 코드: 해지링크 \`/api/unsubscribe?token=\`→\`/api/unsubscribe/?token=\` (send.ts×3+welcome.ts). 브랜치 \`fix/unsub-link-www-slash\` 푸시, 테스트 175통과. *main 머지하면 적용*(Actions는 main 체크아웃)
• env: PUBLIC_BASE_URL → www.notiontalk.com/newsletter (GitHub 시크릿+phase3 .env)

*③ Actions↔Vercel 시크릿 보장*
• 시크릿은 write-only라 비교 불가 → 검증된 값(phase3=Vercel 입증)으로 GitHub TOKEN_SIGNING_SECRET 재설정해 일치 보장. Actions mode=test 실발송도 성공

*④ 리스트 위생*
• 554명 전원 confirmed, 형식오류·중복 0. 도메인 오타 2건만 제외(kakap.com, hanmail.ne) → *confirmed 552*

▶️ 첫 대량발송 #1 차단요소(해지) 해소. 남은 Tier A = SNS 바운스/신고 토픽(AWS 콘솔) + 배치/워밍업. ⏳ 권장: \`fix/unsub-link-www-slash\` 머지.`;

const res = await slack.sendMessage('#자동화메시지', msg);
console.log('sent:', res.ts || JSON.stringify(res));
