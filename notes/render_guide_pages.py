import fitz, glob, os

paths = glob.glob('/mnt/c/Users/user/Documents/카카오톡 받은 파일/*상담기록관리*2026*.pdf')
doc = fitz.open(paths[0])
os.makedirs('/mnt/c/dev/notes/wee_guide', exist_ok=True)

# render pages 31,32,33 (0-indexed 30,31,32) at 170 DPI
for p in (30, 31, 32):
    page = doc[p]
    pix = page.get_pixmap(dpi=170)
    out = f'/mnt/c/dev/notes/wee_guide/p{p+1}.png'
    pix.save(out)
    print(f'saved {out}  {pix.width}x{pix.height}')
