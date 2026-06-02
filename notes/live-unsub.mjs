// 해지 라이브 검증 헬퍼 (읽기/상태조정). 리포 비변경 — notes 아래에서만.
// 사용:
//   node --env-file=<phase3>/.env live-unsub.mjs check a@b.com[,c@d.com]
//   node --env-file=<phase3>/.env live-unsub.mjs restore a@b.com   (status=confirmed 복원)
import {
  findSubscriberByEmail,
  setSubscriberStatus,
} from "/mnt/c/dev/newsletter-self-host-phase3/lib/notion.ts";

const [mode, arg] = process.argv.slice(2);

if (mode === "check") {
  const emails = (arg || "").split(",").map((s) => s.trim()).filter(Boolean);
  for (const e of emails) {
    const sub = await findSubscriberByEmail(e);
    console.log(
      sub
        ? `${e}  →  status=${sub.status}  pageId=${sub.pageId}`
        : `${e}  →  (구독자 없음)`,
    );
  }
} else if (mode === "restore") {
  const sub = await findSubscriberByEmail(arg);
  if (!sub) { console.log(`${arg} → 구독자 없음, 복원 불가`); process.exit(1); }
  await setSubscriberStatus(sub.pageId, "confirmed");
  console.log(`${arg} → status=confirmed 로 복원 (이전: ${sub.status})`);
} else if (mode === "set") {
  const status = process.argv[4];
  const sub = await findSubscriberByEmail(arg);
  if (!sub) { console.log(`${arg} → 구독자 없음`); process.exit(1); }
  await setSubscriberStatus(sub.pageId, status);
  console.log(`${arg} → status=${status} (이전: ${sub.status})`);
} else {
  console.error("mode는 check | restore | set <email> <status>");
  process.exit(1);
}
