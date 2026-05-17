#!/usr/bin/env python3
"""미보유·부분 결락으로 표시한 항목이 실제로 다른 종합 문서(내부관리계획, 추진계획,
재난방지대책, 처리방침 등)에 양식·내용으로 포함되어 있는지 키워드 스캔."""
from pathlib import Path
import re
import subprocess
import zipfile
import fitz  # PyMuPDF

BASE = Path("/mnt/c/Users/user/Desktop/정보보호감사 준비/최종")

# 1순위: 양식/세부 내용이 들어있을 가능성이 높은 종합 문서 첨부(HWP) + 본문(PDF/ODT)
CANDIDATES = [
    # 개인정보보호 내부관리계획 — 가장 만능
    "개인정보보호/02. 개인정보보호 내부관리계획/(인창고등학교-6223 (첨부)) 2026 인창고등학교 개인정보보호 내부관리계획.hwp",
    # 개인정보 보호 업무 추진계획
    "정보보안/01. 정보보호업무 세부추진계획/(인창고등학교-6356 (첨부)) 2026년 인창고등학교 개인정보 보호 업무 추진계획.hwp",
    # 정보통신망 재난방지대책
    "정보보안/05. 정보통신망 재난 방지대책/(인창고등학교-6516 (첨부)) 2026 인창고등학교 정보통신망 재난 방지대책 계획(수정).hwp",
    # 내부관리계획 이행 실태 점검
    "개인정보보호/03. 내부관리계획 이행 실태 점검/(인창고등학교-21429 (첨부)) 2025학년도 인창고등학교 개인정보 내부 관리계획 이행실태 점검.hwp",
    # 영상정보처리기기 운영계획
    "개인정보보호/09. 영상정보처리기기/(인창고등학교-4975 (첨부)) 2026학년도 영상정보처리기기 설치ㆍ운영 계획.hwp",
    # 개인정보 처리방침
    "개인정보보호/04. 개인정보 처리방침/(인창고등학교-3971 (첨부)) 개인정보 처리방침 개정(25.3.17.).hwpx",
    # 위탁 계약
    "개인정보보호/05. 개인정보 처리업무 위탁 관리·감독/(인창고등학교-3729 (첨부) 경기도구리남양주교육지원청 평생교육건강과) [붙임] 개인정보처리 위탁 계약 체결 및 공개.hwpx",
    # 정보보안 본문(.pdf 또는 .odt)
    "정보보안/01. 정보보호업무 세부추진계획/(인창고등학교-6356 (본문)) 2026년 인창고등학교 개인정보 보호 업무 추진계획.pdf",
    "정보보안/05. 정보통신망 재난 방지대책/(인창고등학교-6516 (본문)) 2026년도 인창고등학교 정보통신망 재난 방지대책 계획(수정).pdf",
    "개인정보보호/02. 개인정보보호 내부관리계획/(인창고등학교-6223 (본문)) 2026 인창고등학교 개인정보 내부 관리계획 수립.pdf",
    "개인정보보호/09. 영상정보처리기기/(인창고등학교-4975 (본문)) 2026학년도 영상정보처리기기 설치 및 운영 계획.pdf",
]

# 점검 대상 키워드 (미보유·부분결락 9개 항목)
KEYWORDS = {
    "1.통제구역 출입자대장": ["통제구역", "보호구역", "상시출입", "출입자 대장", "출입 대장", "출입인가"],
    "2.외부용역 보안서약서": ["보안서약서", "보안확약서", "외부용역", "용역 보안", "인계인수"],
    "3.유지관리 용역 계약": ["유지관리 용역", "유지보수 계약", "용역사업 계약", "유지관리 계약"],
    "4.휴대 저장매체": ["휴대용 저장매체", "반·출입", "반출입 대장", "이동저장매체"],
    "5.망 현황(관리대장/IP/구성도)": ["정보시스템 관리대장", "IP관리대장", "IP 관리대장", "망구성도", "정보통신망 구성", "정보통신망 현황"],
    "6.취급자 보호서약서": ["개인정보취급자 서약", "취급자 보안서약", "취급자 서약", "개인정보 보호 서약"],
    "7.파일 파기 관리대장": ["파기 관리대장", "파기관리대장", "파기 일정", "파기계획", "파기 실적"],
    "8.수집·이용·제공 동의서": ["동의서", "수집·이용 동의", "수집ㆍ이용 동의", "제3자 제공 동의", "민감정보 동의"],
    "9.위탁 사례(보건일지 외)": ["NEIS", "나이스", "학교알리미", "급식", "졸업앨범", "수학여행", "교육행정정보시스템", "수탁업체", "수탁자"],
    # 추가 확인 항목
    "A.정보보안 추진계획 포함": ["정보보안", "사이버보안", "정보보호", "재난방지", "보안성 검토"],
    "B.책임자 지정(영상정보)": ["책임자", "관리책임자", "운영자"],
}

def extract(path: Path) -> str:
    """파일 형식에 따라 텍스트 추출."""
    ext = path.suffix.lower()
    if ext == ".pdf":
        try:
            doc = fitz.open(str(path))
            text = "\n".join(p.get_text() for p in doc)
            doc.close()
            return text
        except Exception as e:
            return f"[PDF 오류: {e}]"
    if ext == ".odt":
        try:
            with zipfile.ZipFile(path) as z:
                xml = z.read("content.xml").decode("utf-8", errors="replace")
            return re.sub(r"<[^>]+>", " ", xml)
        except Exception as e:
            return f"[ODT 오류: {e}]"
    if ext == ".hwpx":
        try:
            with zipfile.ZipFile(path) as z:
                texts = []
                for name in z.namelist():
                    if name.endswith(".xml") and "section" in name.lower():
                        xml = z.read(name).decode("utf-8", errors="replace")
                        # <hp:t>...</hp:t> 텍스트 추출
                        for m in re.findall(r"<hp:t[^>]*>([^<]*)</hp:t>", xml):
                            texts.append(m)
                return "\n".join(texts)
        except Exception as e:
            return f"[HWPX 오류: {e}]"
    if ext == ".hwp":
        try:
            result = subprocess.run(
                ["hwp5txt", str(path)],
                capture_output=True, text=True, timeout=30
            )
            return result.stdout or result.stderr
        except Exception as e:
            return f"[HWP 오류: {e}]"
    return ""

def scan(text: str):
    """키워드별 매칭 + 주변 컨텍스트."""
    results = {}
    for cat, kws in KEYWORDS.items():
        hits = []
        for kw in kws:
            for m in re.finditer(re.escape(kw), text):
                start = max(0, m.start() - 40)
                end = min(len(text), m.end() + 80)
                snippet = text[start:end].replace("\n", " ").strip()
                snippet = re.sub(r"\s+", " ", snippet)
                hits.append((kw, snippet))
        if hits:
            results[cat] = hits
    return results

def main():
    for rel in CANDIDATES:
        path = BASE / rel
        if not path.exists():
            print(f"\n❌ 파일 없음: {rel}")
            continue
        print(f"\n{'='*80}\n📄 {path.name}\n{'='*80}")
        text = extract(path)
        if not text or text.startswith("["):
            print(f"  추출 실패: {text[:100]}")
            continue
        print(f"  텍스트 길이: {len(text):,}자")
        results = scan(text)
        if not results:
            print("  ⚠️ 키워드 매치 없음")
            continue
        for cat, hits in results.items():
            print(f"\n  ▶ {cat} ({len(hits)} hits)")
            seen = set()
            shown = 0
            for kw, snippet in hits:
                if snippet in seen:
                    continue
                seen.add(snippet)
                print(f"    [{kw}] …{snippet}…")
                shown += 1
                if shown >= 3:
                    break

if __name__ == "__main__":
    main()
