import sys, os, re, glob
sys.path.insert(0, '/home/user/.claude/skills/exam-analyzer/scripts')
sys.stdout.reconfigure(encoding='utf-8')
import crop_questions as cq
import fitz

BASE = "/mnt/c/Users/user/Inbox/Desktop/동아시아사 수업 자료/기출문제"
pdfs = []
for yr in ['2023','2024','2025']:
    for p in sorted(glob.glob(os.path.join(BASE, yr, '*.pdf'))):
        if '정답' in os.path.basename(p):
            continue
        pdfs.append(p)

# 2차시(은 유통) 키워드
P2 = ['갈레온','일조편법','지정은제','회취법','이와미','마제은','포토시','아카풀코','사카테카스','은본위','단천','수은 아말감','은의 길','은 유통','은본위제']
# 1차시(교역 관계) 키워드
P1 = ['해금','조공','감합','류큐','천계령','슈인장','왜관','믈라카','데지마','공행','광둥','삼각 무역','책봉','정화','마카오','신패','호이안','바타비아','나가사키','조선의 중계']

# 이미 채택한 5문항
HAVE = {('2023_6월모평',12),('2025_5월학평',14),('2025_7월학평',14),('2025_9월모평',12),('2025_10월학평',11)}

for path in pdfs:
    doc = fitz.open(path)
    ename = os.path.splitext(os.path.basename(path))[0]
    baselines = cq.detect_column_baselines(doc)
    questions = cq.detect_all_questions(doc, baselines)
    for q_num in sorted(questions.keys()):
        pg_idx = questions[q_num]
        page = doc[pg_idx]
        label_x = cq.detect_right_label_x(page)
        clip = cq.find_q_clip(page, q_num, label_x, baselines)
        if clip is None:
            continue
        full = page.get_text("text", clip=clip)
        full_clean = re.sub(r'\s+', ' ', full).strip()
        p2_hits = sorted(set(k for k in P2 if k in full))
        p1_hits = sorted(set(k for k in P1 if k in full))
        if not p2_hits:
            continue  # 2차시 키워드 전무 → 스킵
        tag = 'ALREADY' if (ename, q_num) in HAVE else ('INTEGRATED' if p1_hits else '2차시-only')
        print(f"\n[{tag}] {ename} Q{q_num} (page{pg_idx})")
        print(f"  2차시={p2_hits}  1차시={p1_hits}")
        print(f"  FULL: {full_clean[:500]}")
    doc.close()
print("\n=== DONE ===")
