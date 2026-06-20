// 위링 샘플 데이터 시드 (발행 상태). 칼럼=slowly007, 커뮤니티·자료=slowly008.
// 재실행 안전: 동일 제목 샘플은 먼저 삭제 후 재삽입.
const { Client } = require("/mnt/c/dev/wee-linked/node_modules/pg");
const fs = require("fs");
const env = {};
for (const l of fs.readFileSync("/mnt/c/dev/wee-linked/.env.local", "utf8").split("\n")) {
  const m = l.match(/^([A-Z_]+)=(.*)$/); if (m) env[m[1]] = m[2].trim();
}
const POOLER = `postgresql://postgres.msmiqcinohvomkgmezta:${env.SUPABASE_DB_PASSWORD}@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres`;

const ADMIN = "dd8982d8-bdcf-4e0d-8e1c-6d049dc1a18b";   // slowly007 (칼럼)
const MEMBER = "c66de593-367a-4f0f-b8aa-4f2b30fc9bd2";  // slowly008 (커뮤니티·자료)
const BOARD = {
  notice: "4e5ab32e-f364-437e-9653-1683d9c5edc5",
  free: "79e2f25d-7a49-4529-aa79-1dd87875c7c3",
  cases: "505bdda5-436c-432f-bc82-70310a09e8ad",
  qna: "ba22d338-e90c-4815-b78c-079baf5aa5ac",
};
const CAT = {
  activity: "d9774a25-ab80-4573-bb2f-6f0beb15b471",
  group: "d2979ef5-2a41-46d3-bb35-7681af41c145",
  survey: "1878566e-8668-4017-8e88-eb8c264fe387",
  letter: "436a1ebd-d0ac-4bbf-973e-fa4bbcbcfb60",
  class: "f53f69cf-34de-4541-bd91-1e961b85c29a",
};

const doc = (paras) => JSON.stringify({ type: "doc", content: paras.map((t) => ({ type: "paragraph", content: [{ type: "text", text: t }] })) });
const text = (paras) => paras.join("\n");

// ── 콘텐츠 정의 ──────────────────────────────────────────────────────────────
const COLUMNS = [
  { slug: "emotion-coaching-5steps", title: "교실에서 바로 쓰는 감정 코칭 5단계",
    summary: "화내는 아이 앞에서 당황하지 않도록, 감정을 다루는 다섯 단계를 정리했어요.",
    paras: ["감정 코칭은 아이의 감정을 '없애야 할 문제'가 아니라 '함께 읽어줄 신호'로 봅니다.",
      "1단계는 알아차리기입니다. 표정과 몸짓에서 감정의 단서를 먼저 포착해요. 2단계는 다가가기, 3단계는 들어주기입니다.",
      "4단계에서 감정에 이름을 붙여주고, 5단계에서 함께 해결책을 찾습니다. 순서를 지키는 것만으로도 대화의 결이 달라집니다."], hours: 72 },
  { slug: "rapport-first-session-questions", title: "상담 첫 회기, 라포 형성을 위한 질문들",
    summary: "첫 만남의 어색함을 녹이는, 부담 없는 시작 질문 모음.",
    paras: ["첫 회기의 목표는 정보 수집이 아니라 안전감입니다. 학생이 '여기서는 혼나지 않는다'를 느끼게 하는 것이 먼저예요.",
      "요즘 가장 자주 듣는 노래, 쉬는 시간에 주로 하는 것 같은 가벼운 질문으로 문을 엽니다.",
      "침묵을 두려워하지 마세요. 기다림 자체가 '네 속도를 존중한다'는 메시지가 됩니다."], hours: 36 },
  { slug: "peer-conflict-facilitator", title: "또래관계 갈등, 중재자가 아니라 조력자로",
    summary: "누가 옳은지 판결하지 않고도 관계를 회복시키는 접근.",
    paras: ["갈등 상담에서 교사가 판사가 되는 순간, 진 쪽은 마음을 닫습니다.",
      "사실 확인보다 각자의 감정과 바람을 먼저 분리해 듣습니다. '무엇을 원했는지'에 초점을 맞추면 공통점이 보입니다.",
      "해결책은 아이들이 직접 제안하게 합니다. 스스로 만든 약속이 가장 오래갑니다."], hours: 6 },
];

const POSTS = [
  { board: "notice", title: "위링 커뮤니티에 오신 것을 환영해요", hours: 96,
    paras: ["상담교사들이 마음으로 이어지는 공간, 위링 커뮤니티가 문을 열었어요.", "사례 나눔과 질문, 자유로운 이야기 모두 환영합니다. 서로 존중하며 따뜻하게 나눠요."] },
  { board: "free", title: "새 학기 첫 주, 다들 어떻게 보내고 계세요?", hours: 80,
    paras: ["새 학기 첫 주는 늘 정신이 없네요. 상담 신청도 벌써 밀리기 시작했어요.", "선생님들은 학기 초 루틴을 어떻게 잡으시는지 궁금해요."] },
  { board: "free", title: "상담실 환경 꾸미기, 작은 변화 공유해요", hours: 54,
    paras: ["조명을 따뜻한 색으로 바꿨더니 아이들이 더 오래 머물러요.", "작은 화분 하나 뒀을 뿐인데 분위기가 한결 부드러워졌습니다."] },
  { board: "cases", title: "전학 후 적응을 힘들어하는 학생, 어떻게 도울까요", hours: 40,
    paras: ["2학기에 전학 온 학생이 친구를 못 사귀어 점심시간마다 혼자예요.", "담임선생님과 협력해 또래 도우미를 붙여봤는데, 비슷한 경험 있으신 분 조언 구해요."] },
  { board: "cases", title: "분리불안이 심한 1학년 상담을 나눕니다", hours: 22,
    paras: ["등교할 때마다 우는 1학년 학생, 학부모님도 많이 지치셨더라고요.", "짧은 분리부터 단계적으로 늘려가는 중인데 작은 진전이 보여요. 과정을 공유합니다."] },
  { board: "qna", title: "위(Wee)클래스 운영계획서 양식 있으신 분?", hours: 30,
    paras: ["올해 처음 위클래스를 맡았어요. 연간 운영계획서 양식을 참고하고 싶은데 공유 가능하실까요?"] },
  { board: "qna", title: "집단상담 인원, 보통 몇 명으로 진행하세요?", hours: 8,
    paras: ["초등 고학년 대상 집단상담을 준비 중이에요. 적정 인원과 회기 수가 궁금합니다."] },
];

// 댓글: [게시글 인덱스, 본문, 부모댓글 인덱스(없으면 null)]
const COMMENTS = [
  { post: 1, body: "저도 첫 주엔 신청서만 정리하다 끝나요. 둘째 주부터 우선순위 잡으니 한결 낫더라고요." },
  { post: 1, body: "공감해요. 학기 초엔 긴급 사례부터 보고 정기 상담은 2주차에 배치해요.", reply: 0 },
  { post: 3, body: "또래 도우미 좋은 방법이에요. 점심 같이 먹을 단짝 한 명만 연결돼도 크게 달라지더라고요." },
  { post: 5, body: "운영계획서는 자료실에 양식 올라오면 같이 보면 좋겠네요!" },
  { post: 6, body: "초등 고학년이면 6~8명 정도가 상호작용도 활발하고 관리도 됐어요." },
];

const RESOURCES = [
  { cat: "activity", title: "감정 온도계 활동지", desc: "오늘의 감정을 0~100으로 표현하며 정서를 점검하는 1회기 활동지.", file: "감정온도계_활동지.pdf", mime: "application/pdf", size: 184320, dl: 27 },
  { cat: "group", title: "자존감 향상 집단상담 8회기 프로그램", desc: "초등 고학년 대상 8회기 구조화 집단상담 운영안과 회기별 활동지.", file: "자존감향상_집단상담_8회기.pdf", mime: "application/pdf", size: 612000, dl: 41 },
  { cat: "survey", title: "또래관계 점검 설문지", desc: "학급 또래관계와 소외 위험을 살피는 간이 설문 양식.", file: "또래관계_점검설문.pdf", mime: "application/pdf", size: 96000, dl: 18 },
  { cat: "letter", title: "상담 동의 안내 가정통신문", desc: "개인상담 시작 전 보호자 동의를 받는 가정통신문 예시.", file: "상담동의_가정통신문.pdf", mime: "application/pdf", size: 72000, dl: 33 },
  { cat: "class", title: "사회정서학습(SEL) 수업 자료", desc: "감정 인식과 공감을 다루는 1차시 사회정서학습 수업 슬라이드.", file: "SEL_1차시_수업자료.pdf", mime: "application/pdf", size: 1048576, dl: 12 },
];

(async () => {
  const c = new Client({ connectionString: POOLER, ssl: { rejectUnauthorized: false } });
  await c.connect();

  // ── 기존 샘플 정리(제목/슬러그 기준) ──
  await c.query(`delete from public.columns where slug = any($1)`, [COLUMNS.map((x) => x.slug)]);
  await c.query(`delete from public.posts where author_id=$1 and title = any($2)`, [MEMBER, POSTS.map((x) => x.title)]); // 댓글 cascade
  await c.query(`delete from public.resources where uploader_id=$1 and title = any($2)`, [MEMBER, RESOURCES.map((x) => x.title)]);

  // ── 칼럼(slowly007, 발행) ──
  for (const x of COLUMNS) {
    await c.query(
      `insert into public.columns(author_id,slug,title,summary,content,content_text,status,view_count,like_count,published_at,created_at,updated_at)
       values($1,$2,$3,$4,$5::jsonb,$6,'published',$7,$8, now()-make_interval(hours=>$9), now()-make_interval(hours=>$9), now()-make_interval(hours=>$9))`,
      [ADMIN, x.slug, x.title, x.summary, doc(x.paras), text(x.paras), 40 + Math.floor(x.hours / 2), 3 + (x.hours % 7), x.hours]
    );
  }

  // ── 게시글(slowly008, 발행) ──
  const postIds = [];
  for (const p of POSTS) {
    const r = await c.query(
      `insert into public.posts(board_id,author_id,title,content,content_text,status,view_count,created_at,updated_at)
       values($1,$2,$3,$4::jsonb,$5,'published',$6, now()-make_interval(hours=>$7), now()-make_interval(hours=>$7)) returning id`,
      [BOARD[p.board], MEMBER, p.title, doc(p.paras), text(p.paras), 15 + (p.hours % 50), p.hours]
    );
    postIds.push(r.rows[0].id);
  }

  // ── 댓글(slowly008, 발행) — reply는 같은 게시글의 N번째 댓글을 부모로 ──
  const perPostComments = {};
  for (const cm of COMMENTS) {
    const pid = postIds[cm.post];
    let parentId = null;
    if (cm.reply != null) parentId = (perPostComments[cm.post] || [])[cm.reply] || null;
    const r = await c.query(
      `insert into public.comments(post_id,parent_id,author_id,body) values($1,$2,$3,$4) returning id`,
      [pid, parentId, MEMBER, cm.body]
    );
    (perPostComments[cm.post] = perPostComments[cm.post] || []).push(r.rows[0].id);
  }

  // ── 자료실(slowly008, 발행) — 메타데이터(파일 실물 없음) ──
  for (const r of RESOURCES) {
    await c.query(
      `insert into public.resources(uploader_id,category_id,title,description,file_path,file_name,mime,size_bytes,status,download_count,created_at,updated_at)
       values($1,$2,$3,$4,$5,$6,$7,$8,'published',$9, now(), now())`,
      [MEMBER, CAT[r.cat], r.title, r.desc, `${MEMBER}/sample-${Math.abs(hash(r.title))}.pdf`, r.file, r.mime, r.size, r.dl]
    );
  }

  const counts = await c.query(`select
    (select count(*) from public.columns where status='published') as cols,
    (select count(*) from public.posts where status='published' and deleted_at is null) as posts,
    (select count(*) from public.comments where deleted_at is null) as comments,
    (select count(*) from public.resources where status='published') as resources`);
  console.log("발행 합계:", counts.rows[0]);
  await c.end();
})().catch((e) => { console.error(e.message); process.exit(1); });

function hash(s){let h=0;for(let i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))|0;}return h;}
