import fitz, re, os, sys, glob
sys.stdout.reconfigure(encoding='utf-8')
BASE = "/mnt/c/Users/user/Inbox/Desktop/동아시아사 수업 자료/기출문제"

# 매칭된 strong 후보 (exam_filename_stem, qnum) — 중복(1·2차시) 제외 안 함, 전부 확인용
TARGETS = {
 "2023_6월모평": [5,6,11,19],
 "2023_9월모평": [4,15],
 "2023_수능": [3,7],
 "2024_6월모평": [12,14],
 "2024_9월모평": [12,13],
 "2024_수능": [6],
 "2025_3월학평": [12,13],
 "2025_6월모평": [6],
 "2025_7월학평": [6,8],
 "2025_9월모평": [3,8],
 "2025_10월학평": [6,10],
 "2025_수능": [9,12],
 "2025_5월학평": [8],
}

def split_questions(text):
    lines = text.split("\n"); marks=[]; off=0
    for ln in lines:
        m=re.match(r"\s*(\d{1,2})\.\s*\S",ln)
        if m:
            qn=int(m.group(1))
            if 1<=qn<=20: marks.append((qn,off))
        off+=len(ln)+1
    seq=[];last=0
    for qn,o in marks:
        if qn==last+1 or (last>0 and last+1<qn<=last+3):
            seq.append((qn,o));last=qn
    spans={}
    for i,(qn,o) in enumerate(seq):
        end=seq[i+1][1] if i+1<len(seq) else len(text)
        spans[qn]=text[o:end]
    return spans

for sub in ["2023","2024","2025"]:
    for path in sorted(glob.glob(os.path.join(BASE,sub,"*.pdf"))):
        if "정답" in path: continue
        name=os.path.basename(path).replace(".pdf","")
        if name not in TARGETS: continue
        doc=fitz.open(path)
        full="\n".join(doc[i].get_text() for i in range(len(doc)))
        spans=split_questions(full)
        for qn in TARGETS[name]:
            t=spans.get(qn,"(없음)")
            # 선지 앞까지 = stem 위주로 보되 전체 600자
            t=re.sub(r"[ \t]+"," ",t).strip()
            print(f"\n########## [{name}] Q{qn:02d} ##########")
            print(t[:650])
