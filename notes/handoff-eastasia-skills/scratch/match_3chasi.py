import fitz, re, os, sys, glob
sys.stdout.reconfigure(encoding='utf-8')

BASE = "/mnt/c/Users/user/Inbox/Desktop/동아시아사 수업 자료/기출문제"

# 3차시 distinctive keywords (문물교류 + 제한무역)
STRONG = [
    "마테오리치","곤여만국전도","천주실의","아담샬","탕약망","시헌력",
    "카스틸리오네","직방외기","자명종","천리경","의산문답","난학","란가쿠",
    "해체신서","스기타","우키요에","매카트니","공행","삼각무역","전례",
    "곤여만국","조지3세","건륭제","원명원","황여전람도","부베","서광계","이지조",
]
# weaker/contextual (제한무역 거점 — 1차시와 겹칠 수 있음)
WEAK = ["광저우","광둥무역","데지마","동인도회사","아편","나가사키","왜관","홍대용","이익"]

def squash(s):
    return re.sub(r"\s+", "", s)

def split_questions(text):
    # 줄 시작의 "N." 패턴으로 문항 경계 추출 (1..20 증가 시퀀스)
    lines = text.split("\n")
    marks = []  # (qnum, char_offset)
    offset = 0
    for ln in lines:
        m = re.match(r"\s*(\d{1,2})\.\s*\S", ln)
        if m:
            qn = int(m.group(1))
            if 1 <= qn <= 20:
                marks.append((qn, offset))
        offset += len(ln) + 1
    # 증가 시퀀스 필터
    seq = []
    last = 0
    for qn, off in marks:
        if qn == last + 1:
            seq.append((qn, off))
            last = qn
        elif qn > last + 1 and qn <= last + 3 and last > 0:
            # 한두개 건너뛴 경우도 허용(추출 누락 대비)
            seq.append((qn, off))
            last = qn
    spans = []
    for i, (qn, off) in enumerate(seq):
        end = seq[i+1][1] if i+1 < len(seq) else len(text)
        spans.append((qn, text[off:end]))
    return spans

def exam_name(path):
    fn = os.path.basename(path).replace(".pdf","")
    return fn

pdfs = []
for sub in ["2023","2024","2025"]:
    pdfs += sorted(glob.glob(os.path.join(BASE, sub, "*.pdf")))
pdfs = [p for p in pdfs if "정답" not in p]

for path in pdfs:
    doc = fitz.open(path)
    full = "\n".join(doc[i].get_text() for i in range(len(doc)))
    spans = split_questions(full)
    name = exam_name(path)
    for qn, qtext in spans:
        h = squash(qtext)
        strong_hits = [k for k in STRONG if k in h]
        weak_hits = [k for k in WEAK if k in h]
        if strong_hits:
            # 스니펫: 첫 strong 키워드 주변
            kw = strong_hits[0]
            idx = h.find(kw)
            snip = h[max(0,idx-40):idx+60]
            print(f"[{name}] Q{qn:02d}  STRONG={strong_hits} weak={weak_hits}")
            print(f"     …{snip}…")
