import fitz, glob, sys

paths = glob.glob('/mnt/c/Users/user/Documents/카카오톡 받은 파일/*상담기록관리*2026*.pdf')
if not paths:
    paths = glob.glob('/mnt/c/Users/user/Documents/**/*상담기록관리*.pdf', recursive=True)
print('FOUND:', paths)
if not paths:
    sys.exit('no pdf')

doc = fitz.open(paths[0])
print('PAGES:', doc.page_count)

# 1) keyword scan across whole doc
keys = ['비전자', '이관', '생산', '편철', '보존', '보관', '인계', '파기', '폐기', '출력', '인쇄']
hits = {}
for i in range(doc.page_count):
    t = doc[i].get_text()
    for k in keys:
        if k in t:
            hits.setdefault(k, []).append(i + 1)
print('\n=== KEYWORD HITS (1-indexed pages) ===')
for k in keys:
    print(f'  {k}: {hits.get(k, [])}')

# 2) full text of pages 30-34 (the Q&A region around p32)
for i in range(29, min(35, doc.page_count)):
    print(f'\n===================== PAGE {i+1} =====================')
    print(doc[i].get_text())
