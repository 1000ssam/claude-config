#!/usr/bin/env python3
"""학교명·비밀번호 마스킹 공유용 슬라이드 (v3 - 픽셀 분석 기반 정밀 좌표)"""

from PIL import Image, ImageDraw
import os

OUT = "/mnt/c/Users/user/OneDrive/그림/Screenshots/새 폴더/slides"
SHARE = "/mnt/c/Users/user/OneDrive/그림/Screenshots/새 폴더/slides_shared"
os.makedirs(SHARE, exist_ok=True)

BLACK = (0, 0, 0)
P = 5  # padding


def r(x0, y0, x1, y1):
    return (x0 - P, y0 - P, x1 + P, y1 + P)


def mask_and_save(filename, rects):
    img = Image.open(os.path.join(OUT, filename))
    draw = ImageDraw.Draw(img)
    for rect in rects:
        draw.rectangle(rect, fill=BLACK)
    img.save(os.path.join(SHARE, filename), quality=95)
    print(f"  masked: {filename} ({len(rects)} areas)")


def copy_as_is(filename):
    img = Image.open(os.path.join(OUT, filename))
    img.save(os.path.join(SHARE, filename), quality=95)
    print(f"  copied: {filename}")


# ===== SLIDE 0 (표지): 비밀번호 박스 =====
mask_and_save("slide_0_cover.jpg", [
    r(710, 790, 1210, 870),
])

# ===== SLIDE 1: 그대로 =====
copy_as_is("slide_1_access.jpg")

# ===== SLIDE 2 (학교검색) =====
# 원본 좌표 → 슬라이드 좌표 (ratio=0.7035, offset=(530,198))
mask_and_save("slide_2_school.jpg", [
    r(589, 636, 670, 655),     # 검색 입력란 "인창고등학교"
    r(902, 745, 987, 763),     # Row1 학교명
    r(1180, 745, 1543, 763),   # Row1 시도+시군구
    r(902, 787, 987, 804),     # Row2 학교명
    r(1180, 787, 1543, 804),   # Row2 시도+시군구
])

# ===== SLIDE 3 (정보입력) =====
mask_and_save("slide_3_info.jpg", [
    r(42, 155, 245, 210),       # 좌측 패널 "1111" + "(공통 비밀번호)"
    r(1022, 695, 1106, 713),    # 폼: 이름 "김인창"
    r(1486, 695, 1627, 713),    # 폼: 보호자 연락처
    r(1641, 695, 1711, 713),    # 폼: 비밀번호 "1111"
])

# ===== SLIDE 4 (검사선택) =====
mask_and_save("slide_4_select.jpg", [
    r(839, 415, 1557, 432),    # 확인 테이블 Row1 (학교명~연락처)
    r(832, 442, 1557, 457),    # 확인 테이블 Row2
])

# ===== SLIDE 5: 그대로 =====
copy_as_is("slide_5_survey.jpg")

# ===== PDF 합치기 =====
slides = [f"slide_{i}_{s}.jpg" for i, s in
          enumerate(["cover", "access", "school", "info", "select", "survey"])]
images = [Image.open(os.path.join(SHARE, s)).convert('RGB') for s in slides]
pdf_path = "/mnt/c/Users/user/OneDrive/그림/Screenshots/새 폴더/청소년_미디어_이용습관_진단조사_안내_공유용.pdf"
images[0].save(pdf_path, 'PDF', save_all=True, append_images=images[1:], resolution=150)
print(f"\n=== 공유용 PDF 저장 완료 ===")
