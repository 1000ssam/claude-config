#!/usr/bin/env python3
"""청소년 인터넷 이용습관 진단조사 안내 슬라이드 생성"""

from PIL import Image, ImageDraw, ImageFont
import os

# === Config ===
W, H = 1920, 1080
BG_COLOR = (255, 255, 255)
PRIMARY = (0, 105, 92)       # 진한 초록 (사이트 테마 컬러)
ACCENT = (220, 53, 69)       # 빨간색 강조
DARK = (33, 37, 41)          # 본문 텍스트
LIGHT_BG = (245, 248, 250)   # 연한 배경
STEP_BG = (0, 105, 92)       # 스텝 배지 배경
STEP_FG = (255, 255, 255)

FONT_DIR = os.path.expanduser("~/.local/share/fonts")
FONT_BOLD = os.path.join(FONT_DIR, "Pretendard-ExtraBold.otf")
FONT_SEMI = os.path.join(FONT_DIR, "Pretendard-SemiBold.otf")
FONT_REG = os.path.join(FONT_DIR, "Pretendard-Regular.otf")

SRC = "/mnt/c/Users/user/OneDrive/그림/Screenshots/새 폴더"
OUT = "/mnt/c/Users/user/OneDrive/그림/Screenshots/새 폴더/slides"
QR_PATH = "/tmp/qr_ejindan.png"

SCREENSHOTS = [
    "스크린샷 2026-03-30 152615.png",
    "스크린샷 2026-03-30 152735.png",
    "스크린샷 2026-03-30 153323.png",
    "스크린샷 2026-03-30 153404.png",
    "스크린샷 2026-03-30 153427.png",
]

os.makedirs(OUT, exist_ok=True)


def font(path, size):
    return ImageFont.truetype(path, size)


def draw_rounded_rect(draw, xy, radius, fill):
    x0, y0, x1, y1 = xy
    draw.rectangle([x0 + radius, y0, x1 - radius, y1], fill=fill)
    draw.rectangle([x0, y0 + radius, x1, y1 - radius], fill=fill)
    draw.pieslice([x0, y0, x0 + 2*radius, y0 + 2*radius], 180, 270, fill=fill)
    draw.pieslice([x1 - 2*radius, y0, x1, y0 + 2*radius], 270, 360, fill=fill)
    draw.pieslice([x0, y1 - 2*radius, x0 + 2*radius, y1], 90, 180, fill=fill)
    draw.pieslice([x1 - 2*radius, y1 - 2*radius, x1, y1], 0, 90, fill=fill)


def draw_step_badge(draw, x, y, step_num):
    """스텝 번호 원형 배지"""
    r = 32
    draw.ellipse([x - r, y - r, x + r, y + r], fill=STEP_BG)
    f = font(FONT_BOLD, 34)
    text = str(step_num)
    bbox = f.getbbox(text)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    draw.text((x - tw // 2, y - th // 2 - 4), text, fill=STEP_FG, font=f)


def draw_arrow(draw, start, end, color=ACCENT, width=3):
    """간단한 화살표"""
    draw.line([start, end], fill=color, width=width)
    # 화살표 머리
    import math
    dx = end[0] - start[0]
    dy = end[1] - start[1]
    angle = math.atan2(dy, dx)
    arrow_len = 15
    a1 = angle + math.pi * 0.8
    a2 = angle - math.pi * 0.8
    p1 = (end[0] + arrow_len * math.cos(a1), end[1] + arrow_len * math.sin(a1))
    p2 = (end[0] + arrow_len * math.cos(a2), end[1] + arrow_len * math.sin(a2))
    draw.polygon([end, p1, p2], fill=color)


def place_screenshot(canvas, img_path, region, border=True):
    """스크린샷을 지정 영역에 맞춰 배치"""
    x, y, max_w, max_h = region
    img = Image.open(os.path.join(SRC, img_path))

    # 비율 유지하며 리사이즈
    ratio = min(max_w / img.width, max_h / img.height)
    new_w = int(img.width * ratio)
    new_h = int(img.height * ratio)
    img = img.resize((new_w, new_h), Image.LANCZOS)

    # 중앙 정렬
    px = x + (max_w - new_w) // 2
    py = y + (max_h - new_h) // 2

    if border:
        # 그림자 효과
        shadow = Image.new('RGBA', (new_w + 6, new_h + 6), (0, 0, 0, 40))
        canvas.paste(shadow, (px + 3, py + 3), shadow)
        # 테두리
        draw = ImageDraw.Draw(canvas)
        draw.rectangle([px - 2, py - 2, px + new_w + 2, py + new_h + 2], outline=(200, 200, 200), width=2)

    canvas.paste(img, (px, py))
    return (px, py, new_w, new_h)


def wrap_text(text, f, max_width):
    """텍스트 줄바꿈"""
    lines = []
    for paragraph in text.split('\n'):
        if not paragraph:
            lines.append('')
            continue
        words = list(paragraph)
        current = ''
        for char in words:
            test = current + char
            bbox = f.getbbox(test)
            if bbox[2] - bbox[0] > max_width:
                lines.append(current)
                current = char
            else:
                current = test
        if current:
            lines.append(current)
    return lines


def draw_text_block(draw, x, y, lines, f, color=DARK, line_spacing=8):
    """여러 줄 텍스트 그리기"""
    cy = y
    for line in lines:
        draw.text((x, cy), line, fill=color, font=f)
        bbox = f.getbbox(line) if line else f.getbbox("가")
        cy += (bbox[3] - bbox[1]) + line_spacing
    return cy


def draw_instruction_bullet(draw, x, y, text, f, bullet_color=PRIMARY, text_color=DARK, max_width=500):
    """불릿 포인트 안내 텍스트"""
    # 불릿
    draw.ellipse([x, y + 8, x + 10, y + 18], fill=bullet_color)
    # 텍스트
    lines = wrap_text(text, f, max_width - 25)
    cy = y
    for line in lines:
        draw.text((x + 22, cy), line, fill=text_color, font=f)
        bbox = f.getbbox(line) if line else f.getbbox("가")
        cy += (bbox[3] - bbox[1]) + 6
    return cy + 8


# ============================================================
# SLIDE 0: 표지
# ============================================================
def make_slide_cover():
    canvas = Image.new('RGB', (W, H), BG_COLOR)
    draw = ImageDraw.Draw(canvas)

    # 상단 초록 바
    draw.rectangle([0, 0, W, 8], fill=PRIMARY)

    # 중앙 큰 제목
    title_f = font(FONT_BOLD, 60)
    title = "청소년 미디어 이용습관 진단조사"
    bbox = title_f.getbbox(title)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) // 2, 260), title, fill=PRIMARY, font=title_f)

    # 부제
    sub_f = font(FONT_SEMI, 32)
    sub = "학생용 온라인 검사 안내"
    bbox = sub_f.getbbox(sub)
    sw = bbox[2] - bbox[0]
    draw.text(((W - sw) // 2, 345), sub, fill=DARK, font=sub_f)

    # 구분선
    draw.rectangle([(W - 200) // 2, 405, (W + 200) // 2, 408], fill=PRIMARY)

    # 사이트 주소
    url_f = font(FONT_SEMI, 36)
    url = "https://e-jindan.kr"
    bbox = url_f.getbbox(url)
    uw = bbox[2] - bbox[0]
    draw.text(((W - uw) // 2, 440), url, fill=PRIMARY, font=url_f)

    # QR 코드
    qr = Image.open(QR_PATH).resize((200, 200), Image.LANCZOS)
    qx = (W - 200) // 2
    canvas.paste(qr, (qx, 510))

    # QR 아래 안내
    note_f = font(FONT_REG, 22)
    note = "QR코드를 스캔하면 검사 페이지로 이동합니다"
    bbox = note_f.getbbox(note)
    nw = bbox[2] - bbox[0]
    draw.text(((W - nw) // 2, 725), note, fill=(120, 120, 120), font=note_f)

    # 비밀번호 안내 박스
    draw_rounded_rect(draw, ((W - 500) // 2, 790, (W + 500) // 2, 870), 12, (255, 243, 205))
    draw.rectangle([(W - 500) // 2, 790, (W - 500) // 2 + 6, 870], fill=(255, 193, 7))
    pw_f = font(FONT_SEMI, 28)
    pw_text = "공통 비밀번호:  1111"
    bbox = pw_f.getbbox(pw_text)
    pw = bbox[2] - bbox[0]
    draw.text(((W - pw) // 2, 815), pw_text, fill=(133, 100, 4), font=pw_f)

    # 하단 바
    draw.rectangle([0, H - 8, W, H], fill=PRIMARY)

    canvas.save(os.path.join(OUT, "slide_0_cover.jpg"), quality=95)
    print("slide_0_cover.jpg OK")


# ============================================================
# SLIDE 1: 사이트 접속 및 진단조사 클릭
# ============================================================
def make_slide_1():
    canvas = Image.new('RGB', (W, H), BG_COLOR)
    draw = ImageDraw.Draw(canvas)

    # 상단 바
    draw.rectangle([0, 0, W, 8], fill=PRIMARY)

    # 스텝 배지 + 제목
    draw_step_badge(draw, 80, 60, 1)
    title_f = font(FONT_BOLD, 38)
    draw.text((125, 40), "사이트 접속 후 [진단조사] 클릭", fill=DARK, font=title_f)

    # 좌측 안내 텍스트
    inst_f = font(FONT_REG, 24)
    y = 130
    y = draw_instruction_bullet(draw, 50, y, "인터넷 브라우저에서 e-jindan.kr 접속", inst_f, max_width=480)
    y = draw_instruction_bullet(draw, 50, y, "메인 화면에서 [학교용] 영역 확인", inst_f, max_width=480)
    y = draw_instruction_bullet(draw, 50, y, "좌측 상단의 [진단조사] 버튼 클릭", inst_f, max_width=480)

    # 강조 박스
    draw_rounded_rect(draw, (50, y + 10, 520, y + 70), 8, (232, 245, 243))
    tip_f = font(FONT_SEMI, 22)
    draw.text((70, y + 25), "💡 '추가설문조사'가 아닌 [진단조사]를 클릭하세요!", fill=PRIMARY, font=tip_f)

    # QR + URL (좌하단)
    qr = Image.open(QR_PATH).resize((120, 120), Image.LANCZOS)
    canvas.paste(qr, (60, H - 200))
    url_f = font(FONT_SEMI, 20)
    draw.text((60, H - 68), "e-jindan.kr", fill=PRIMARY, font=url_f)

    # 스크린샷 (우측 넓게)
    place_screenshot(canvas, SCREENSHOTS[0], (530, 80, 1350, 950))

    # 하단 바
    draw.rectangle([0, H - 8, W, H], fill=PRIMARY)

    canvas.save(os.path.join(OUT, "slide_1_access.jpg"), quality=95)
    print("slide_1_access.jpg OK")


# ============================================================
# SLIDE 2: 학교 검색
# ============================================================
def make_slide_2():
    canvas = Image.new('RGB', (W, H), BG_COLOR)
    draw = ImageDraw.Draw(canvas)

    draw.rectangle([0, 0, W, 8], fill=PRIMARY)

    draw_step_badge(draw, 80, 60, 2)
    title_f = font(FONT_BOLD, 38)
    draw.text((125, 40), "학교 검색 및 선택", fill=DARK, font=title_f)

    inst_f = font(FONT_REG, 24)
    y = 130
    y = draw_instruction_bullet(draw, 50, y, "학교명을 3글자 이상 입력 후 [검색] 클릭", inst_f, max_width=480)
    y = draw_instruction_bullet(draw, 50, y, "검색 결과에서 우리 학교를 찾아 [선택] 클릭", inst_f, max_width=480)
    y = draw_instruction_bullet(draw, 50, y, "같은 이름의 학교가 여러 개 나올 수 있으니", inst_f, max_width=480)

    # 강조 박스
    draw_rounded_rect(draw, (50, y + 5, 520, y + 65), 8, (255, 235, 238))
    tip_f = font(FONT_SEMI, 22)
    draw.text((70, y + 20), "⚠️ 시·도와 시·군·구를 꼭 확인하세요!", fill=ACCENT, font=tip_f)

    # 스크린샷
    place_screenshot(canvas, SCREENSHOTS[1], (530, 80, 1350, 950))

    draw.rectangle([0, H - 8, W, H], fill=PRIMARY)
    canvas.save(os.path.join(OUT, "slide_2_school.jpg"), quality=95)
    print("slide_2_school.jpg OK")


# ============================================================
# SLIDE 3: 학교정보 입력
# ============================================================
def make_slide_3():
    canvas = Image.new('RGB', (W, H), BG_COLOR)
    draw = ImageDraw.Draw(canvas)

    draw.rectangle([0, 0, W, 8], fill=PRIMARY)

    draw_step_badge(draw, 80, 60, 3)
    title_f = font(FONT_BOLD, 38)
    draw.text((125, 40), "학교정보 입력", fill=DARK, font=title_f)

    inst_f = font(FONT_REG, 24)
    y = 130
    y = draw_instruction_bullet(draw, 50, y, "학년, 반, 번호를 정확히 선택/입력", inst_f, max_width=480)
    y = draw_instruction_bullet(draw, 50, y, "이름, 성별, 생년월일 입력", inst_f, max_width=480)
    y = draw_instruction_bullet(draw, 50, y, "보호자 연락처 입력 (010-0000-0000 형식)", inst_f, max_width=480)

    # 비밀번호 강조 박스
    y += 15
    draw_rounded_rect(draw, (50, y, 520, y + 90), 10, (255, 243, 205))
    draw.rectangle([50, y, 56, y + 90], fill=(255, 193, 7))
    pw_title_f = font(FONT_BOLD, 26)
    draw.text((75, y + 12), "비밀번호", fill=(133, 100, 4), font=pw_title_f)
    pw_f = font(FONT_BOLD, 40)
    draw.text((75, y + 45), "1111", fill=ACCENT, font=pw_f)
    note_f = font(FONT_REG, 20)
    draw.text((180, y + 55), "(공통 비밀번호)", fill=(133, 100, 4), font=note_f)

    y += 110
    # 다음으로 안내
    draw_rounded_rect(draw, (50, y, 520, y + 55), 8, (232, 245, 243))
    tip_f = font(FONT_SEMI, 22)
    draw.text((70, y + 15), "모두 입력 후 [다음으로 가기] 버튼 클릭", fill=PRIMARY, font=tip_f)

    # 스크린샷
    place_screenshot(canvas, SCREENSHOTS[2], (530, 80, 1350, 950))

    draw.rectangle([0, H - 8, W, H], fill=PRIMARY)
    canvas.save(os.path.join(OUT, "slide_3_info.jpg"), quality=95)
    print("slide_3_info.jpg OK")


# ============================================================
# SLIDE 4: 검사 선택
# ============================================================
def make_slide_4():
    canvas = Image.new('RGB', (W, H), BG_COLOR)
    draw = ImageDraw.Draw(canvas)

    draw.rectangle([0, 0, W, 8], fill=PRIMARY)

    draw_step_badge(draw, 80, 60, 4)
    title_f = font(FONT_BOLD, 38)
    draw.text((125, 40), "입력정보 확인 및 검사 시작", fill=DARK, font=title_f)

    inst_f = font(FONT_REG, 24)
    y = 130
    y = draw_instruction_bullet(draw, 50, y, "입력한 정보가 맞는지 확인", inst_f, max_width=480)
    y = draw_instruction_bullet(draw, 50, y, "참여할 검사 목록을 확인", inst_f, max_width=480)
    y = draw_instruction_bullet(draw, 50, y, "[시작하기] 버튼을 눌러 검사 시작", inst_f, max_width=480)

    # 안내
    draw_rounded_rect(draw, (50, y + 10, 520, y + 100), 8, (232, 245, 243))
    tip_f = font(FONT_SEMI, 22)
    draw.text((70, y + 22), "검사 종류:", fill=PRIMARY, font=tip_f)
    item_f = font(FONT_REG, 20)
    draw.text((70, y + 52), "• 인터넷 이용습관 진단조사", fill=DARK, font=item_f)
    draw.text((70, y + 76), "• 스마트폰 이용습관 진단조사", fill=DARK, font=item_f)

    # 스크린샷
    place_screenshot(canvas, SCREENSHOTS[3], (530, 80, 1350, 950))

    draw.rectangle([0, H - 8, W, H], fill=PRIMARY)
    canvas.save(os.path.join(OUT, "slide_4_select.jpg"), quality=95)
    print("slide_4_select.jpg OK")


# ============================================================
# SLIDE 5: 설문 응답
# ============================================================
def make_slide_5():
    canvas = Image.new('RGB', (W, H), BG_COLOR)
    draw = ImageDraw.Draw(canvas)

    draw.rectangle([0, 0, W, 8], fill=PRIMARY)

    draw_step_badge(draw, 80, 60, 5)
    title_f = font(FONT_BOLD, 38)
    draw.text((125, 40), "설문 문항에 솔직하게 응답", fill=DARK, font=title_f)

    inst_f = font(FONT_REG, 24)
    y = 130
    y = draw_instruction_bullet(draw, 50, y, "각 문항을 읽고 자신에게 해당하는 정도를", inst_f, max_width=480)
    y = draw_instruction_bullet(draw, 50, y, "① 전혀 그렇지않다 ~ ④ 매우 그렇다", inst_f, max_width=480)
    y = draw_instruction_bullet(draw, 50, y, "중에서 선택합니다", inst_f, max_width=480)

    # 안내
    draw_rounded_rect(draw, (50, y + 10, 520, y + 100), 8, (255, 243, 205))
    draw.rectangle([50, y + 10, 56, y + 100], fill=(255, 193, 7))
    tip_f = font(FONT_SEMI, 22)
    draw.text((70, y + 25), "💡 정답이 없는 설문입니다.", fill=(133, 100, 4), font=tip_f)
    note_f = font(FONT_REG, 20)
    draw.text((70, y + 58), "솔직하게 평소 자신의 모습을 떠올리며", fill=(133, 100, 4), font=note_f)
    draw.text((70, y + 82), "응답해 주세요.", fill=(133, 100, 4), font=note_f)

    y += 125
    # 완료 안내
    draw_rounded_rect(draw, (50, y, 520, y + 55), 8, (232, 245, 243))
    done_f = font(FONT_SEMI, 22)
    draw.text((70, y + 15), "모든 문항 응답 후 [제출] 버튼을 눌러 완료!", fill=PRIMARY, font=done_f)

    # 스크린샷
    place_screenshot(canvas, SCREENSHOTS[4], (530, 80, 1350, 950))

    draw.rectangle([0, H - 8, W, H], fill=PRIMARY)
    canvas.save(os.path.join(OUT, "slide_5_survey.jpg"), quality=95)
    print("slide_5_survey.jpg OK")


# ============================================================
if __name__ == "__main__":
    make_slide_cover()
    make_slide_1()
    make_slide_2()
    make_slide_3()
    make_slide_4()
    make_slide_5()
    print(f"\n=== 6개 슬라이드 생성 완료: {OUT} ===")
