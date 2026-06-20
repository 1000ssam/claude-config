import { slack } from "file:///mnt/c/Users/user/.claude/skills/scripts/slack-api.mjs";

const url = "https://wee-linked-m7jn5uz5a-1000s-projects-a51f0c2a.vercel.app";
const text = [
  "🔧 위링 리디자인 프리뷰 갱신 (피드백 2건 반영)",
  "• 히어로 보드 카드 글자 세로분해 버그 수정",
  "• 내비 '상담앱 링글' 로즈 알약 제거 → 타이포 악센트(회원가입 CTA와 구분)",
  `새 프리뷰: ${url}`,
  "※ 이전 프리뷰 URL은 폐기. 프로덕션(wee-linked.com) 여전히 미반영.",
].join("\n");

const res = await slack.sendMessage("#자동화메시지", text);
console.log("sent ok:", JSON.stringify({ ok: res?.ok, ts: res?.ts }));
