#!/usr/bin/env bash
# wee-linked 핸드오프 문서 감시 (5분 주기)
# 트리거: 아직 '처리 안 된' HANDOFF/인수인계 문서가 있으면 NEW_HANDOFF 출력.
# 처리 상태는 sha256 목록(STATE)으로 관리 → 동일 문서 재트리거 방지(내 편집 포함).
DIR="/mnt/c/dev/wee-linked"
STATE="/mnt/c/dev/notes/wee-linked-processed.txt"
touch "$STATE"

if [ ! -d "$DIR" ]; then
  echo "STATUS: NO_DIR"
  exit 0
fi

mapfile -t HFILES < <(find "$DIR" -maxdepth 3 -type f \
  \( -iname "HANDOFF*.md" -o -iname "HANDOVER*.md" -o -iname "*handoff*.md" \
     -o -iname "*handover*.md" -o -iname "*인수인계*" \) \
  -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null | sort)

if [ ${#HFILES[@]} -eq 0 ]; then
  echo "STATUS: DIR_EXISTS_NO_HANDOFF"
  exit 0
fi

NEW=0
echo "STATUS: HANDOFF_PRESENT"
for f in "${HFILES[@]}"; do
  sha=$(sha256sum "$f" | cut -d' ' -f1)
  if grep -q "$sha" "$STATE"; then
    echo "  [processed] $f"
  else
    echo "  [NEW]       $f  (sha:$sha)"
    NEW=1
  fi
done
[ "$NEW" = "1" ] && echo "TRIGGER: NEW_HANDOFF" || echo "TRIGGER: none"
