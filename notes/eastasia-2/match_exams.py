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

# 2차시(은 유통) 강한 고유 키워드
STRONG = ['갈레온','일조편법','지정은제','회취법','이와미','마제은','포토시','아카풀코','사카테카스','은본위','세비야','신항로']
# 약한/문맥 키워드 (참고용)
WEAK = ['멕시코','아메리카 은','일본산 은','향신료','은 유입','은의 길','상품 작물','조세','은 유통','센고쿠','다이묘','암스테르담','마닐라']

def exam_name_from_file(path):
    fn = os.path.splitext(os.path.basename(path))[0]
    return fn  # 파일명이 이미 2023_수능 형태

for path in pdfs:
    doc = fitz.open(path)
    ename = exam_name_from_file(path)
    baselines = cq.detect_column_baselines(doc)
    questions = cq.detect_all_questions(doc, baselines)
    for q_num in sorted(questions.keys()):
        pg_idx = questions[q_num]
        page = doc[pg_idx]
        label_x = cq.detect_right_label_x(page)
        clip = cq.find_q_clip(page, q_num, label_x, baselines)
        if clip is None:
            continue
        qtext = page.get_text("text", clip=clip)
        # 선지 제거: 첫 ① 이전까지가 발문+제시문
        idx = qtext.find('①')
        stem = qtext[:idx] if idx > 0 else qtext
        stem_clean = re.sub(r'\s+', ' ', stem).strip()
        strong_hits = [k for k in STRONG if k in stem]
        weak_hits = [k for k in WEAK if k in stem]
        needs_vision = len(stem_clean) < 40
        if strong_hits or (len(weak_hits) >= 2):
            flag = 'STRONG' if strong_hits else 'weak2+'
            print(f"\n[{flag}] {ename} Q{q_num} (page{pg_idx}) vision={needs_vision}")
            print(f"  강={strong_hits} 약={weak_hits}")
            print(f"  STEM: {stem_clean[:300]}")
        elif needs_vision:
            # 이미지 제시문 후보 — 짧은 stem
            print(f"\n[VISION?] {ename} Q{q_num} (page{pg_idx}) stem_len={len(stem_clean)}")
            print(f"  STEM: {stem_clean[:120]}")
    doc.close()
print("\n=== DONE ===")
