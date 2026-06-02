import fitz, sys
sys.stdout.reconfigure(encoding='utf-8')
path = "/mnt/c/Users/user/Inbox/Desktop/동아시아사 수업 자료/교과서/3. 동아시아의 사회 변동과 문화 교류_08. 교역망의 발달과 은 유통.pdf"
doc = fitz.open(path)
print(f"총 페이지: {len(doc)}")
for i in range(len(doc)):
    print(f"\n========== PAGE {i+1} (PDF index {i}) ==========")
    print(doc[i].get_text())
