import fitz, sys
sys.stdout.reconfigure(encoding='utf-8')
path = "/mnt/c/Users/user/Inbox/Desktop/동아시아사 수업 자료/교과서/3. 동아시아의 사회 변동과 문화 교류_08. 교역망의 발달과 은 유통.pdf"
doc = fitz.open(path)
print(f"총 페이지: {len(doc)}")
# 3차시 = PDF p7~10 (1-indexed) → 0-indexed 6~9
for i in range(6, min(10, len(doc))):
    print(f"\n===== PDF p{i+1} (idx {i}) =====")
    print(doc[i].get_text())
