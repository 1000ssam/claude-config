# UI 컴포넌트 작업 실패 기록

이 문서는 semester-schedule-generator 개발 과정에서 실패했던 UI 구현 시도를 정리한 것이다. 같은 실수를 반복하지 않기 위해 기록한다.

---

## 1. 날짜 입력 (type="date" → type="text" 변경 시도)

### 시도 1: `useDateInput` 훅 + `type="date"` + `onKeyDown` 버퍼
- **의도**: `type="date"` 위에서 키보드 입력을 가로채서 자동 포맷팅
- **결과**: 실패
- **원인**: 브라우저 `type="date"` 입력은 내부적으로 연/월/일 서브필드를 가지고 있어서 `onKeyDown` 이벤트가 전체 필드가 아닌 서브필드에서 발생한다. 버퍼 방식으로 제어가 불가능하다.

### 시도 2: `type="text"` + `inputMode="numeric"` + 자동 포맷팅
- **의도**: 텍스트 필드에서 숫자만 입력받아 `YYYY-MM-DD`로 자동 변환
- **결과**: 실패
- **원인**: 캘린더 피커가 완전히 사라진다. 사용자가 달력으로 날짜를 선택하는 것이 불가능해지고, 텍스트 입력만으로 날짜를 넣어야 하는데 형식 검증/제어 장치도 부족했다.
- **사용자 피드백**: "캘린더 입력기가 사라짐", "형식을 제어할 장치가 전혀 없음"

### 시도 3: DateInput 컴포넌트 (`type="date"` + `type="text"` 나란히 배치)
- **의도**: 캘린더 피커와 텍스트 직접 입력을 둘 다 제공
- **결과**: 기능은 작동했으나, 전체 코드 복잡도가 급상승하여 다른 기능(컬럼 추가 등)이 깨지는 부작용 발생. 사용자 요청으로 롤백됨.

### 교훈
- **`type="date"`를 건드리지 마라.** 브라우저 네이티브 date picker는 내부 구조가 복잡해서 커스텀 키보드 핸들링이 사실상 불가능하다.
- 날짜 입력 UX를 개선하려면 `react-datepicker` 같은 전용 라이브러리를 사용하거나, 네이티브 `type="date"`를 그대로 두는 게 안전하다.
- 두 개의 입력 필드를 나란히 놓는 것은 복잡도 대비 이점이 적다.

---

## 2. 드래그 앤 드롭 컬럼 순서 변경

### 시도 1: `draggable` + `onDragStart`/`onDragOver`/`onDragEnd` (onDrop 누락)
- **의도**: 출력 컬럼 리스트와 데이터 테이블 헤더에 네이티브 드래그 앤 드롭 적용
- **결과**: 실패
- **원인**:
  - `onDrop` 핸들러를 빠뜨렸다. 드래그는 시작되지만 드롭 시 아무 일도 일어나지 않음.
  - 드래그 핸들을 `<button>`으로 만들고 `onMouseDown={(e) => e.stopPropagation()}`을 넣었는데, 이것이 오히려 드래그 시작 이벤트 자체를 차단했다.
- **사용자 피드백**: "모양만 있을 뿐 실제로 드래그해서 위치를 바꿀 수 없음"

### 시도 2: `onDrop` 추가 + `<span>` 핸들 + `useRef` 인덱스 추적
- **의도**: 누락된 핸들러를 보완하고 핸들 요소를 교체
- **결과**: 테스트 전에 사용자가 롤백을 요청하여 미검증.

### 교훈
- **네이티브 HTML 드래그 앤 드롭의 필수 4요소**: `onDragStart`, `onDragOver` (`e.preventDefault()` 필수), `onDrop`, `draggable={true}`. 하나라도 빠지면 작동하지 않는다.
- `<button>` 등의 인터랙티브 요소를 드래그 핸들로 쓰면 이벤트 충돌이 발생한다. `<span>` 또는 `<div>`를 사용하라.
- 드래그 앤 드롭이 필요하면 `@dnd-kit/core` 같은 라이브러리 사용을 먼저 고려하라. 네이티브 DnD는 엣지케이스가 많다.

---

## 3. CSV 숫자-하이픈 엑셀 변환 방지

### 시도 1: `="1-7"` 수식 래핑
- **의도**: CSV에서 `="값"` 형태로 감싸면 엑셀이 텍스트로 인식할 것으로 기대
- **결과**: 실패
- **원인**: 엑셀 버전에 따라 `="1-7"` 수식이 제대로 작동하지 않는 경우가 있다. 사용자의 엑셀에서는 여전히 `01-07` (날짜)로 표시됨.
- **사용자 피드백**: "학급에 숫자 보호 체크했음에도 불구하고 엑셀 다운받았더니 01-07 이따구로 나온다"

### 시도 2: 탭 접두사 (`\t`)
- **의도**: 값 앞에 탭 문자를 넣으면 엑셀이 텍스트로 인식
- **결과**: 사용자 요청으로 롤백되어 미검증.

### 최종 해결: 작은따옴표(`'`) 접두사
- `'1-7` 형태로 저장. 엑셀에서 CSV를 열 때 `'`가 텍스트 강제 접두사로 인식되어 날짜 변환이 방지됨.
- 정규식 `^\d+(-\d+)+$`로 숫자-하이픈 패턴 자동 감지.

### 교훈
- 엑셀의 CSV 파싱은 버전마다 다르게 동작한다. `="값"` 수식 방식은 신뢰할 수 없다.
- 작은따옴표 접두사가 가장 범용적인 해결책이다.
- 이런 종류의 변경은 반드시 실제 엑셀에서 테스트한 후 적용해야 한다.

---

## 4. 복합 변경의 부작용

### 문제
날짜 입력, 드래그 앤 드롭, CSV 보호, 컬럼 추가 로직을 한 번에 리팩터링하면서 **기존에 작동하던 컬럼 추가 버튼이 깨졌다.**

### 원인
- `DraggableColumnList`, `DateInput` 등 새 컴포넌트를 추가하면서 상태 관리 로직이 복잡해짐
- 클로저가 stale state를 참조하게 되어 `setColumns`/`setEntries` 호출이 의도대로 작동하지 않음

### 교훈
- **한 번에 하나만 바꿔라.** 여러 기능을 동시에 수정하면 어디서 문제가 생겼는지 추적이 어렵다.
- 상태 setter에서는 항상 `prev =>` 콜백 패턴을 사용하라. 직접 state 참조는 stale closure에 취약하다.
- 새 컴포넌트를 추가할 때 기존 핸들러가 정상 작동하는지 반드시 확인하라.

---

## 5. .next 캐시 충돌

### 문제
dev 서버(`npm run dev`)가 실행 중인 상태에서 `npm run build`를 실행하면 `.next` 폴더가 충돌하여 "Internal Server Error"가 발생한다.

### 발생 빈도
이 프로젝트에서만 3회 발생.

### 해결
```powershell
# restart.ps1
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Remove-Item -Recurse -Force '.next' -ErrorAction SilentlyContinue
npm run dev
```

### 교훈
- **dev 서버 실행 중에 `npm run build`를 절대 하지 마라.**
- 타입 체크는 `npx tsc --noEmit`으로 하면 `.next`에 영향 없이 검증 가능하다.
- "Internal Server Error"가 나면 `.next` 삭제부터 시도하라.

---

## 6. PowerShell + Bash 도구 조합 문제

### 문제
Bash 도구에서 `powershell -Command "..."` 실행 시 `$` 문자가 Bash에 의해 변수로 해석된다.

### 예시
```bash
# 의도: PowerShell의 $_.StartTime
powershell -Command "Get-Process | Select $_.StartTime"
# 실제: Bash가 $_ 를 빈 문자열로 치환 → 에러
```

### 해결
복잡한 PowerShell 로직은 `.ps1` 파일로 작성 후 `-File` 옵션으로 실행한다.
```bash
powershell -ExecutionPolicy Bypass -File script.ps1
```

### 교훈
- PowerShell 명령에 `$` 변수가 포함되면 반드시 스크립트 파일로 분리하라.
- 또는 Node.js 스크립트(`.mjs`)로 대체하라.

---

## 7. 모바일 화면 가로 흔들림 (horizontal scroll jitter)

### 문제
모바일에서 페이지를 스크롤하거나 탭할 때 화면이 좌우로 살짝 흔들린다. 가로 스크롤바가 생기거나 뷰포트 너비를 살짝 초과하는 요소가 있는 느낌.

### 원인
`body`에만 `overflow-x: hidden`을 걸면 부족하다. `html` 요소 자체가 내부 콘텐츠에 의해 늘어나면 body의 overflow 설정이 무력화된다. `width: 100%`가 없으면 기본 `auto` 값이 콘텐츠 너비를 따라 늘어날 수 있다.

### 해결
`globals.css`에서 `html`과 `body` 양쪽에 모두 적용한다:

```css
html {
  overflow-x: hidden;
  width: 100%;
}

body {
  overflow-x: hidden;
  width: 100%;
}
```

### 교훈
- **`body`에만 걸고 `html`을 빠뜨리는 실수가 잦다.** 항상 둘 다.
- Next.js에서 Tailwind로 `<html>` 태그를 제어하려 하면 누락되기 쉬우므로 `globals.css`에서 명시적으로 관리하라.
- 그래도 흔들리면 `max-width: 100vw`를 추가로 시도하라.
- 이 패턴은 신규 모바일 프로젝트 시작 시 **보일러플레이트로 기본 포함**시키는 게 낫다.

---

## 8. OAuth 리다이렉트 응답에서 Set-Cookie 유실

### 문제
노션 OAuth 첫 시도 시 로그인 후 메인 화면으로 돌아가고, 두 번째 시도에서야 데이터베이스 관리 페이지로 정상 이동됨. PC에서는 간헐적, 모바일(iOS Safari 등)에서는 거의 항상 재현.

### 원인
Next.js App Router의 Route Handler에서 `NextResponse.redirect()` 응답에 Set-Cookie 헤더를 실으면, 일부 브라우저(특히 모바일)에서 **리다이렉트를 따라가면서 쿠키를 저장하지 않는** 경우가 있다. 이 때문에:
1. Login route에서 `oauthState`를 세션 쿠키에 저장 → Notion으로 리다이렉트
2. 브라우저가 Set-Cookie를 처리하지 않음 → 쿠키에 oauthState 없음
3. Notion → Callback으로 돌아오면 state 검증 실패 → `/?error=invalid_state`로 리다이렉트

### 시도한 방법 (실패)
1. `cookies()` (implicit response) → `NextResponse.redirect()` (explicit response): 쿠키가 explicit response에 합쳐지지 않음
2. `getIronSession(request, response, options)` 로 explicit response에 직접 설정: PC에서는 해결되었으나 모바일에서 여전히 실패
3. `getSession()`과 `getIronSession(req, res)` 혼용: Set-Cookie 중복으로 오히려 악화

### 해결
**세션 기반 state 검증을 완전히 제거**하고, HMAC 서명된 self-contained state를 사용:
```ts
// login: 쿠키 설정 불필요
const timestamp = Date.now().toString();
const hmac = crypto.createHmac("sha256", secret).update(timestamp).digest("hex");
const state = `${timestamp}.${hmac}`;

// callback: 세션에서 읽을 필요 없이 서명 검증
const [timestamp, signature] = state.split(".");
const expected = crypto.createHmac("sha256", secret).update(timestamp).digest("hex");
crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
```
Login 단계에서 쿠키를 아예 설정하지 않으므로 리다이렉트 + Set-Cookie 문제가 완전히 제거됨.

### 교훈
- **리다이렉트 응답(302/307)에 Set-Cookie를 싣지 마라.** HTTP 스펙상 브라우저가 처리해야 하지만 실제로는 불안정하다. 특히 모바일, 크로스사이트 리다이렉트에서 신뢰할 수 없다.
- OAuth state 검증에 세션 쿠키를 쓰면 login→외부→callback 흐름에서 반드시 이 문제에 부딪힌다.
- **HMAC 서명 state가 더 안전한 대안**: 서버 비밀키로 서명하고 타임스탬프로 만료를 제어. 쿠키 의존 없음.

---

## 5. exam-cropper: 브라우저에서 PyMuPDF를 대체하려다 하루 날린 건

### 문제
기출 문항 크롭 스킬(crop_questions.py, PyMuPDF 기반)을 웹앱으로 만들면서, 서버 없이 브라우저에서 pdf.js로 동일한 기능을 구현하려 했다.

### 원인
pdf.js와 PyMuPDF는 근본적으로 다른 라이브러리다:
- `search_for("1.")` → pdf.js에 없음. `getTextContent()`는 "1."을 별도 아이템(len=2)으로 분리
- `get_text("text", clip=rect)` → pdf.js에 없음. 특정 영역 텍스트 검증 불가
- `get_pixmap(clip=rect)` → pdf.js는 viewport offset 기반 간접 크롭. 좌표 변환 오류 발생
- 이미지 블록(type=1) 감지 → pdf.js `getTextContent()`에 포함 안 됨

결과: 문항 번호 인식 실패, 크롭 좌표 틀림, 엣지케이스 로직 이식 불가.

### 해결
프론트엔드(Vercel) + Python 백엔드(Render) 분리 구조로 전환.
- 프론트: PDF 업로드 UI + ZIP 수신 + 미리보기
- 백엔드: crop_questions.py 로직을 FastAPI로 감싸서 그대로 실행
- 추가 삽질: Vercel Python 서버리스(10초 타임아웃), Render 포트 불일치(8000→10000), Python 3.14 cgi 모듈 삭제, Dockerfile에 crop.py 복사 누락, 한글 파일명 latin-1 인코딩 에러

### 교훈
- **검증된 Python 스크립트를 브라우저 JS로 포팅하려고 하지 마라.** 라이브러리 능력 차이가 크다. 무거운 건 서버로 보내는 게 맞다.
- **배포 플랫폼 제약을 사전에 확인하라.** Vercel Hobby 10초 타임아웃, 4.5MB 바디 제한, Python 런타임 제약. 무거운 Python 의존성(PyMuPDF, numpy)은 처음부터 Docker 기반 플랫폼(Render, Railway)으로.
- **처음부터 프론트/백엔드 분리 구조를 설계하라.** "클라이언트에서 다 하면 서버 비용 0"이라는 유혹에 넘어가면 하루를 날린다.
- 노션 OAuth 기반 앱을 만들 때 이 패턴을 기본으로 사용할 것.

---

## 9. Notion Workers 첫 배포 삽질 기록

### 문제
Notion Workers(ntn CLI)로 생기부 초안 생성 워커를 만들면서 연쇄적으로 삽질 발생.

### 원인
1. **ntn CLI가 Windows 미지원** — 코드 전부 작성 + 타입 체크 통과 후에야 `npm i -g ntn`에서 `EBADPLATFORM` 발견. WSL 설치 + Ubuntu 세팅 + 프로젝트 복사까지 1시간+ 소요.
2. **DB ID 오류** — 사용자가 제공한 collection URL이 DB ID가 아니라 view ID였음. 워커가 Notion API 호출 시 "API token is invalid" 에러 발생. 실제 DB ID를 URL에서 다시 확인해서 수정.
3. **`ntn workers init`이 소스 덮어씀** — 수동 생성한 프로젝트에 `ntn workers init`을 실행하니 `src/index.ts`, `package.json` 등이 템플릿 기본값으로 덮어씌워짐. 배포 시 `sayHello`만 등록되고 실제 tool이 누락. Windows 원본에서 재복사 필요.
4. **Claude API 모델 ID 오류** — `claude-sonnet-4-6-20250514` (날짜 접미사 포함)로 호출했으나 404. 실제 모델 ID는 `claude-sonnet-4-6` (접미사 없음). `/v1/models` 엔드포인트로 확인.
5. **워커 삭제 후 환경변수 소실** — 이름 변경을 위해 `ntn workers delete` → 새 이름으로 `deploy`했더니 `ANTHROPIC_API_KEY` 환경변수가 날아감. `ntn workers env set`으로 재등록 필요.
6. **Rate limit 미처리** — 31건 동시 처리 시 Anthropic API rate limit 발생. 재시도 로직(지수 백오프) 없이 즉시 실패.

### 해결
- WSL Ubuntu 설치 → 프로젝트 복사 → ntn CLI 설치/인증
- DB ID 수정 (`2eedd1dc-d644-81f5-960c-cf72311a10ac`)
- Windows 원본에서 소스 재복사 후 재배포
- 모델 ID를 `claude-sonnet-4-6`으로 수정
- 환경변수 재등록
- `generateDraft.ts`에 rate limit/5xx 재시도 로직 추가 (지수 백오프, 최대 3회)

### 교훈
- **개발 시작 전 CLI/패키지의 플랫폼 호환성을 반드시 확인하라.** `package.json`의 `os` 필드나 공식 문서의 지원 플랫폼을 체크.
- **Notion의 collection URL과 database ID는 다르다.** URL에서 보이는 ID가 view ID일 수 있으므로 Notion API로 확인하거나 DB 페이지 URL을 직접 확인.
- **`ntn workers init`은 기존 파일을 덮어쓴다.** 수동 생성 프로젝트에서는 주의. 원본 백업 필수.
- **Claude API 모델 ID는 `/v1/models` 엔드포인트로 확인하라.** 날짜 접미사 유무가 모델마다 다르다.
- **워커 삭제 시 환경변수도 함께 삭제된다.** 재배포 후 `ntn workers env set` 필수.
- **외부 API를 호출하는 코드에는 반드시 재시도 로직을 넣어라.** 특히 rate limit(429)과 서버 에러(5xx).

## 10. WSL/Windows가 공유하는 node_modules에서 rollup native 바이너리 핑퐁

### 문제
`/mnt/c/dev/wee-log-ai`(WSL/Windows 공유 경로)에서 작업 중, WSL에서 `npm run build` 시도 → `Cannot find module @rollup/rollup-linux-x64-gnu`. 해결하려고 WSL에서 `npm i --no-save @rollup/rollup-linux-x64-gnu` 실행 → WSL 빌드 OK. 그런데 다음 순간 Windows에서 `npm run dev` 실행 시 `Cannot find module @rollup/rollup-win32-x64-msvc` 발생. Phase 3 코드 구현 후 사용자 실행 검증이 즉시 막힘.

### 원인
- 알려진 npm 버그(#4828): 플랫폼별 optional dependencies가 lockfile 생성 OS와 다를 때 누락된다.
- rollup 4.x는 OS별 native 바이너리를 별도 패키지(`@rollup/rollup-<os>-<arch>-<abi>`)로 배포.
- WSL/Windows가 같은 node_modules를 공유하면 한쪽에서 `npm i`가 자기 OS 바이너리만 정착시키면서 다른 OS 바이너리는 사라지거나 미설치 상태가 됨.

### 해결
양쪽에서 **누락된 OS 바이너리만 `--no-save`로 추가** — lockfile 안 건드림.
```bash
# WSL
npm i --no-save @rollup/rollup-linux-x64-gnu

# PowerShell
npm i --no-save @rollup/rollup-win32-x64-msvc
```
1회씩 추가하면 두 바이너리가 공존해 이후 양쪽 명령이 정상 동작. `rm -rf node_modules && npm i`로 깨끗이 재설치도 가능하지만, 한쪽에서 재설치하면 다시 한쪽 바이너리만 남는 핑퐁이 재발하므로 차선.

### 교훈
- **공유 node_modules에 `npm i`는 가급적 한쪽에서만** — 검증 자동화 욕심에 WSL에서 `npm run build` 돌리려고 native bin 설치하면 Windows 측이 깨질 수 있다.
- **WSL에서는 type-check까지만**, 빌드·dev·런타임은 Windows로 한정하는 게 가장 안전. 자동화가 꼭 필요하면 양 OS 바이너리를 모두 한 번씩 `--no-save`로 깔아둔 상태를 유지.
- **임시 해결(npm i --no-save) 후엔 반대 OS 검증도 같이 돌려라** — 한쪽 OK만 보고 보고하면 사용자가 반대 OS에서 다시 막힌다 (이번 케이스).
- **knowledge 라우터에 `rollup`/`MODULE_NOT_FOUND rollup`/`npm 4828` 등 키워드 등록**해서 다음에 비슷한 에러가 뜨면 바로 검색되게.

## 11. 동의서 링크 무효화 — DB CHECK 제약 위반 + 종단 검증 없이 "고쳤다" 반복

### 문제
재발송으로 무효화된 동의서 링크가 보호자에게 "이미 제출되었습니다"로 뜨는 버그(UX 실패). 1차 수정 후 "고쳤다"고 보고했으나 실제로는 **만료 링크로 폼 작성·제출이 그대로** 됨. 사용자가 직접 "그대로 된다"고 잡아냄. 두 번 헛고침.

### 원인
1. revoke 엔드포인트가 `status='revoked'`로 UPDATE → D1 스키마의 `CHECK(status IN ('pending','responded','acked'))` 제약이 거부 → **UPDATE 통째 롤백 → 500**. 행이 안 바뀌어 링크는 `pending`+미래만료로 살아있음.
2. 앱이 revoke 에러를 `catch {}`로 삼켜 **조용히 실패**(네트워크 끊김 대비 로직이 로직 에러까지 가림).
3. 1차 "수정" 후 검증을 **라우트 응답(401 무인증 / 404 없는 토큰)만 보고** 통과 처리 → 정작 정상 토큰에 대한 UPDATE 성공 여부(핵심 로직)는 안 봄.

### 해결
- 불법 status 값 제거, `expires_at = now`로만 당김(`isExpired`가 status보다 먼저 검사돼 410). 스키마 안 건드림.
- **live 워커에 실제 요청 생성 → 폼 200 → revoke 200 → 폼 410 → 제출 410** 종단 스크립트로 증명한 뒤 커밋. (이후 실브라우저 E2E로 다중선택 등 후속 기능도 동일하게 종단 검증.)

### 교훈
- **새 status/enum 값을 넣을 땐 DB CHECK 제약(또는 enum 정의)을 먼저 확인.** 제약 위반은 row 단위가 아니라 **트랜잭션 통째 롤백** → "조용한 무변경"으로 나타나 디버깅이 어렵다.
- **서버 수정은 라우트 응답(401/404)이 아니라 "의도한 상태 변화"를 종단으로 검증.** 인증·라우팅이 통과해도 핵심 UPDATE가 실패할 수 있다. 실제 객체를 만들어 before/after를 찍어라(POST→상태 200→대상 동작→상태 410 식).
- **에러를 삼키는 `catch {}`는 로직 버그를 숨긴다.** 네트워크 resilience용 swallow라도 최소 로깅을 남겨 다음 디버깅에서 묻히지 않게.
- **"고쳤다"는 검증 후에만 말한다.** 미검증 단정은 신뢰를 깎고, 결국 사용자가 대신 디버깅하게 만든다.

## 12. 시험 문항 출제 — "수정이 새 결함을 낳는다" + 작성자·검수자 분리

### 문제
한국사 지필평가 12문항 제작에서 결함이 한 번에 안 잡히고 다섯 차례에 걸쳐 발견됨: ① '이후' 발문 문항의 오답 3개가 전부 실제로 '이후'의 사실(복수정답, 이의제기 방어 불가) ② 직전 세션의 범위 밖 오답 교체 4건 중 3건이 새로운 문항 간 누설·중복을 유발 ③ '다음' 일괄 삭제 시 발문 지시어가 동반 소실되어 "도구가 처음 제작·사용된 시대"=구석기 독해 가능(새 복수정답 경로) ④ 자료가 정답을 그대로 진술하는 '국어 문제'형 결함 2건 ⑤ 이전 시대 유물+지속 행위 오답("주먹도끼로 사냥")의 잔존 사용 추론 시비.

### 원인
- 부분 수정 후 부분 검증: 고친 곳만 확인하고 고침이 다른 문항과 만드는 새 상호작용(누설·중복)은 안 봄.
- 작성자가 검수를 겸함: 자기 수정은 자기가 합리화해서 결함을 통과시킴(③은 본인 감사 통과 후 독립 에이전트가 적발).
- 오답 선지 설계의 시간 비대칭 미인지: 해당 시대보다 늦게 등장한 유물은 안전하지만, 이전 시대 유물+지속 가능한 행위 조합은 "그때도 썼을 것" 추론이 교과서와 충돌하지 않아 시비 성립.

### 해결
- 모든 수정 후 6축 전체 재감사(상호 힌트·연도 누설·동일 사실 재활용·복수정답·사실/범위·재배열/분포)를 재실행.
- 출고 전 3중 재검수: 결정론 스캔(동일 문장·10자 n-gram·고유명사 매트릭스) + 이의제기 공격 에이전트 + 사실·범위 검증 에이전트(병렬·독립).
- 잔존 사용 추론은 발문 시간 필터("~시대에 처음 나타난 생활 모습")로 문항 전체를 면역 — 선지 하나 고치는 것보다 우선(사용자 제안 기법).
- 전 과정을 exam-writer 스킬(~/.claude/skills/exam-writer/)로 영구화.

### 교훈
- 검증 대상은 "고친 곳"이 아니라 "고침이 만든 새로운 전체 상태"다. 문항·코드·설정 모두 동일.
- 생성자와 검수자는 컨텍스트를 분리해야 한다. 같은 컨텍스트의 자기 검수는 자기 결함에 눈멀다.
- 규칙 기계 적용(예: '다음' 일괄 삭제)은 부수 효과(지시어 소실)를 동반한다 — 치환 후 의미 재검토 필수.
