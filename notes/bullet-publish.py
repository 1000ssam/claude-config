#!/usr/bin/env python3
"""
bullet.so 즉시 배포(replay) 스크립트.
캡처한 cURL 파일에서 URL/Authorization/Content-Type/바디를 추출해 publish 함수에 그대로 POST한다.

사용법:
  python3 bullet-publish.py --dry      # 전송 안 함, 조립 결과만 출력 (검증용)
  python3 bullet-publish.py            # 실제 배포
  BULLET_TOKEN=<새토큰> python3 bullet-publish.py   # 토큰만 교체해서 배포 (영속 자동화 단계용)

캡처 파일 경로는 BULLET_CURL 환경변수로 덮어쓸 수 있다 (기본: ~/.claude/secrets/bullet-deploy.curl).
"""
import os, re, sys, json, time, base64
import urllib.request, urllib.error

CURL_FILE = os.environ.get(
    "BULLET_CURL",
    os.path.expanduser("~/.claude/secrets/bullet-deploy.curl"),
)
DRY = "--dry" in sys.argv

raw = open(CURL_FILE, encoding="utf-8", errors="replace").read()

# --- URL ---
m = re.search(r"^curl\s+'([^']+)'", raw, re.M)
url = m.group(1)

# --- 헤더 ---
auth = None
ctype = "application/json"
for hm in re.finditer(r"-H '([^:]+):\s*([^']*)'", raw):
    name, val = hm.group(1).strip(), hm.group(2).strip()
    if name.lower() == "authorization":
        auth = val
    elif name.lower() == "content-type":
        ctype = val

# 토큰 교체 (영속 자동화 단계: 새로 발급한 ID 토큰을 주입)
if os.environ.get("BULLET_TOKEN"):
    auth = "Bearer " + os.environ["BULLET_TOKEN"]

# --- 바디 (bash 단일따옴표 escape '\'' → ' 복원이 유일한 변환) ---
bm = re.search(r"--data(?:-raw|-binary)?\s+\$?'(.*)'", raw, re.S)
body = bm.group(1).replace("'\\''", "'").encode("utf-8")

# --- 토큰 만료 점검 ---
def token_left_min(bearer):
    try:
        tok = bearer.split()[-1]
        p = tok.split(".")[1]; p += "=" * (-len(p) % 4)
        exp = json.loads(base64.urlsafe_b64decode(p))["exp"]
        return (exp - time.time()) / 60
    except Exception:
        return None

left = token_left_min(auth)

print(f"URL        : {url}")
print(f"Auth       : {'Bearer …(' + ('%.1f' % left) + '분 남음)' if left is not None else auth[:18] + '…'}")
print(f"Content-Type: {ctype}")
print(f"Body size  : {len(body)} bytes")
if left is not None and left < 0:
    print("⚠️  토큰이 이미 만료됨 — 401 예상. 새 토큰 필요.")

if DRY:
    print("\n[--dry] 전송하지 않고 종료.")
    sys.exit(0)

req = urllib.request.Request(url, data=body, method="POST")
req.add_header("Authorization", auth)
req.add_header("Content-Type", ctype)

t0 = time.time()
try:
    with urllib.request.urlopen(req, timeout=120) as resp:
        out = resp.read().decode("utf-8", "replace")
        print(f"\n✅ HTTP {resp.status}  ({time.time()-t0:.1f}s)")
        print("응답:", out[:1000])
except urllib.error.HTTPError as e:
    print(f"\n❌ HTTP {e.code}  ({time.time()-t0:.1f}s)")
    print("응답:", e.read().decode('utf-8', 'replace')[:1000])
except Exception as e:
    print("\n❌ 요청 실패:", repr(e))
