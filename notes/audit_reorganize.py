#!/usr/bin/env python3
"""정보보호감사 준비 폴더 재정리 스크립트.

별첨1(2026 보안감사 수감 자료 목록) 23개 항목에 맞춰 폴더 구조를 정규화하고,
누락된 카테고리는 (비어있음) 마커가 달린 빈 폴더로 생성한다.
"""
from pathlib import Path
import shutil
import sys

BASE = Path("/mnt/c/Users/user/Desktop/정보보호감사 준비/최종")

# 별첨1 23개 항목에 대응하는 표준 폴더 (정보보안 12 + 개인정보보호 11)
T = {
    "is_01": "정보보안/01. 정보보호업무 세부추진계획",
    "is_02": "정보보안/02. 사이버보안진단의 날",
    "is_03": "정보보안/03. 보안성 검토",
    "is_04": "정보보안/04. 정보보안 및 개인정보보호 교육",
    "is_05": "정보보안/05. 정보통신망 재난 방지대책",
    "is_06": "정보보안/06. 통제구역출입자 대장 (비어있음)",
    "is_07": "정보보안/07. 저장매체 불용처리",
    "is_08": "정보보안/08. 외부용역 보안서약서·보안교육 확인서 (비어있음)",
    "is_09": "정보보안/09. 정보시스템 유지관리 용역사업 계약서 (비어있음)",
    "is_10": "정보보안/10. 휴대용 저장매체 반·출입 대장 (비어있음, 해당 시)",
    "is_11": "정보보안/11. 정보통신망 현황 자료 (비어있음)",
    "is_12": "정보보안/12. 학교홈페이지 운영 계획",
    "pi_01": "개인정보보호/01. 개인정보보호책임자 지정",
    "pi_02": "개인정보보호/02. 개인정보보호 내부관리계획",
    "pi_03": "개인정보보호/03. 내부관리계획 이행 실태 점검",
    "pi_04": "개인정보보호/04. 개인정보 처리방침",
    "pi_05": "개인정보보호/05. 개인정보 처리업무 위탁 관리·감독",
    "pi_06": "개인정보보호/06. 개인정보 파일 관리 (비어있음)",
    "pi_07": "개인정보보호/07. 접속기록 정기점검 (사이버보안진단 첨부 참조)",
    "pi_08": "개인정보보호/08. 개인정보보호 서약서 (비어있음)",
    "pi_09": "개인정보보호/09. 영상정보처리기기",
    "pi_10": "개인정보보호/10. 개인정보파일 파기 관리대장 (비어있음)",
    "pi_11": "개인정보보호/11. 개인정보 수집·이용·제공 동의서 양식 (비어있음)",
}

EMPTY_KEYS = ["is_06", "is_08", "is_09", "is_10", "is_11", "pi_06", "pi_08", "pi_10", "pi_11"]


def classify(name: str, parent_rel: str) -> str | None:
    """파일명 + 부모 폴더 힌트로 분류. None이면 미분류."""
    n = name

    # --- 파일명 키워드 우선 (잘못 분류된 파일도 교정) ---
    edu_keys = [
        "개인정보 보호 교육", "개인정보보호 교육", "개인정보 보호 연수", "개인정보보호 연수",
        "정보보안 및 개인정보보호 교직원 연수", "정보보안 및 개인정보보호, 인터넷",
        "스마트폰 과의존 예방", "원격 교육 실시 결과", "과의존 예방교육", "과의존 예방 교육",
        "교직원 연수자료", "교직원연수", "정보보안 및 개인정보보호 교육",
    ]
    if any(k in n for k in edu_keys):
        return "is_04"

    disp_keys = [
        "불용처리", "불용물품", "불용 폐기", "불용 결정조서", "불용결정조서", "불용결정 조서",
        "정보기자재 물품 불용", "정보화 기기 불용", "정보화기기) 매각",
        "(불용물품매입)", "(불용물품 매입)", "사진 대지", "불용물품 사진",
        "사업자등록증", "매각 불용물품", "물품목록정보", "매각 처분",
    ]
    if any(k in n for k in disp_keys):
        return "is_07"

    if "재난 방지대책" in n or "재난방지대책" in n:
        return "is_05"
    if "보안성 검토" in n:
        return "is_03"

    cyber_keys = [
        "사이버보안진단", "내PC지키미", "내PC지킴이", "내pc지킴이", "Privacy-i", "privacy-i",
        "개인정보처리시스템 접속기록", "개인정보처리시스템 점검표",
        "개인정보시스템 접속기록", "개인정보시스템 이력관리",
        "홈페이지 개인정보처리시스템 이력관리", "홈페이지 운영 현황 점검표",
        "내PC지킴이 보안 점검", "내PC지키미(3월)",
    ]
    if any(k in n for k in cyber_keys):
        return "is_02"

    if "영상정보처리기기" in n:
        return "pi_09"

    homepage_keys = ["홈페이지 운영 계획", "홈페이지 관리·운영", "홈페이지 문서별 담당자"]
    if any(k in n for k in homepage_keys):
        return "is_12"

    if "이행 실태 점검" in n or "이행실태 점검" in n:
        return "pi_03"
    if "개인정보 내부 관리계획" in n or "개인정보보호 내부관리계획" in n:
        return "pi_02"
    if "분임보안담당관" in n or "개인정보보호책임자 지정" in n:
        return "pi_01"
    if "처리방침" in n:
        return "pi_04"
    if "위탁 처리" in n or "위탁 계약" in n or "보건일지" in n:
        return "pi_05"
    if "개인정보 보호 업무 추진계획" in n or "개인정보 보호 업무 업무추진 계획" in n:
        return "is_01"

    # --- 부모 폴더 힌트 (이미 분류된 파일은 그 카테고리로) ---
    sub = parent_rel.replace("\\", "/")
    folder_map = {
        "정보보안/사이버보안진단": "is_02",
        "정보보안/저장매체불용처리": "is_07",
        "정보보안/보안성 검토": "is_03",
        "정보보안/정보보안 및 개인정보 교육": "is_04",
        "정보보안/정보보호업무 세부추진계획": "is_01",
        "정보보안/정보통신망 재난 방지대책수립공문": "is_05",
        "정보보안/홈페이지": "is_12",
        "정보보안/01.": "is_01",
        "정보보안/02.": "is_02",
        "정보보안/03.": "is_03",
        "정보보안/04.": "is_04",
        "정보보안/05.": "is_05",
        "정보보안/07.": "is_07",
        "정보보안/12.": "is_12",
        "개인정보보호/개인정보 처리 업무 위탁": "pi_05",
        "개인정보보호/개인정보 처리방침": "pi_04",
        "개인정보보호/개인정보내부 관리계획 이행": "pi_03",
        "개인정보보호/개인정보보호내부관리계획": "pi_02",
        "개인정보보호/개인정보파일 관리": "pi_06",
        "개인정보보호/개인정보호책임자": "pi_01",
        "개인정보보호/영상정보처리기기": "pi_09",
        "개인정보보호/저장매체": "is_07",
        "개인정보보호/01.": "pi_01",
        "개인정보보호/02.": "pi_02",
        "개인정보보호/03.": "pi_03",
        "개인정보보호/04.": "pi_04",
        "개인정보보호/05.": "pi_05",
        "개인정보보호/09.": "pi_09",
    }
    for prefix, cat in folder_map.items():
        if sub.startswith(prefix):
            return cat
    return None


def main():
    # 1. 모든 대상 폴더 생성
    for key, rel in T.items():
        (BASE / rel).mkdir(parents=True, exist_ok=True)

    moved = []
    dup_removed = []
    unclassified = []

    # 2. 모든 파일 순회 (deepest first; 폴더 정리 위해)
    all_files = sorted([p for p in BASE.rglob("*") if p.is_file()],
                       key=lambda p: -len(str(p)))

    for path in all_files:
        rel = path.relative_to(BASE)
        parent_rel = str(rel.parent)
        name = path.name

        cat = classify(name, parent_rel)
        if not cat:
            unclassified.append(str(rel))
            continue

        target_dir = BASE / T[cat]

        # 저장매체 불용처리는 연도 하위폴더 유지
        sub_preserve = ""
        if cat == "is_07":
            parts = parent_rel.replace("\\", "/").split("/")
            for part in parts:
                if part.isdigit() and len(part) == 4:  # 연도 폴더
                    sub_preserve = part
                    break

        if sub_preserve:
            target_dir = target_dir / sub_preserve
            target_dir.mkdir(parents=True, exist_ok=True)

        target = target_dir / name

        if path == target:
            continue  # 이미 정확한 위치

        if target.exists():
            # 중복 (동일 파일명이 대상에 이미 존재) → 소스 삭제
            path.unlink()
            dup_removed.append((str(rel), str(target.relative_to(BASE))))
            continue

        shutil.move(str(path), str(target))
        moved.append((str(rel), str(target.relative_to(BASE))))

    # 3. 빈 디렉토리 정리 (대상 폴더는 제외)
    target_paths = {BASE / rel for rel in T.values()}
    # 대상 폴더의 모든 상위 경로도 보존
    keep_paths = set(target_paths)
    for tp in target_paths:
        for parent in tp.parents:
            if BASE in parent.parents or parent == BASE:
                keep_paths.add(parent)

    for d in sorted([p for p in BASE.rglob("*") if p.is_dir()],
                    key=lambda p: -len(str(p))):
        if d in keep_paths:
            continue
        try:
            if not any(d.iterdir()):
                d.rmdir()
        except OSError:
            pass

    # 4. 비어있음 폴더에 안내 파일 생성
    for key in EMPTY_KEYS:
        marker = BASE / T[key] / "_안내.txt"
        if not marker.exists():
            content = f"이 카테고리는 현재 보유 자료가 없습니다.\n감사 전 자료를 확보하여 이 폴더에 채워주세요.\n\n해당 항목: {T[key].split('/', 1)[1]}\n"
            marker.write_text(content, encoding="utf-8")

    # 07. 접속기록 정기점검 안내
    pi07_marker = BASE / T["pi_07"] / "_안내.txt"
    if not pi07_marker.exists():
        pi07_marker.write_text(
            "개인정보처리시스템 접속기록 점검표는 매월 '사이버보안진단의 날' 결과의 첨부로 보고되었습니다.\n"
            "관련 자료는 '정보보안/02. 사이버보안진단의 날/' 폴더 내 월별 첨부(.xls/.xlsx) 파일을 참조하세요.\n",
            encoding="utf-8"
        )

    # 5. 리포트
    print(f"=== 이동 ({len(moved)}건) ===")
    for src, dst in moved:
        print(f"  {src}\n    → {dst}")
    print(f"\n=== 중복 제거 ({len(dup_removed)}건) ===")
    for src, kept in dup_removed:
        print(f"  삭제: {src}\n    (유지: {kept})")
    print(f"\n=== 미분류 ({len(unclassified)}건) ===")
    for f in unclassified:
        print(f"  {f}")


if __name__ == "__main__":
    main()
