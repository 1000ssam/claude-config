---
description: "골든래빗 노션 책 원고를 Google Docs에 작성합니다. 마크다운으로 초안을 쓰면 골든래빗 스타일(Arimo, 제목/본문/팁/코드/비법노트)로 자동 변환하여 삽입합니다. Use when: (1) 원고 작성, (2) 챕터 써줘, (3) 집필, (4) 책 쓰기, (5) PART 작성. 트리거: '집필', '원고', '챕터 써줘', 'PART 써줘'."
---

# 골든래빗 노션 책 집필 스킬

## 프로젝트 정보
- 프로젝트 디렉토리: `C:\dev\book-writer`
- 핸드오버 문서: `C:\dev\book-writer\HANDOVER.md`
- Google Drive 폴더: https://drive.google.com/drive/folders/11LYRB-geq9wR_pzAyUCoki-yr49vZ_1I

## 워크플로

### 1단계: 레퍼런스 수집
집필할 챕터에 필요한 레퍼런스를 수집합니다.

**사용 가능한 레퍼런스:**
- `C:\dev\book-writer\references\template-schema.md` — 교무수첩 LITE 템플릿 DB 스키마
- `C:\dev\book-writer\references\youtube-refs.md` — 유튜브 강의 자막 추출본
- 집필계획서 (Google Docs ID: `1U2hWxJqhyZ6deA4aquUXziaPMjgaqPpkjdEafP_l3co`)
- 샘플원고 (Google Docs ID: `1J-4kmtbNnfzFu0YMI2B77KfZOl0aZNh2i0sdXhZt1YQ`)
- 집필가이드 (Google Docs ID: `1bfARTkoH4H6qJgG2JxSB-pqaYyeKyptnAqaNS0z3VY4`)

**노션 API 활용 (교무수첩 템플릿 실데이터 참조 시):**
```javascript
import { notion } from 'file:///C:/Users/user/.claude/skills/scripts/notion-api.mjs';
const schema = await notion.call('GET', '/databases/DB_ID');
const content = await notion.getPageMarkdown('PAGE_ID');
```

### 2단계: 마크다운 초안 작성
`C:\dev\book-writer\drafts\` 디렉토리에 마크다운 파일을 작성합니다.

**마크다운 서식 규칙:**
| 마크다운 | 변환 결과 |
|----------|-----------|
| `# 제목` | 장 제목 (HEADING_1, Arimo Bold 25pt) |
| `## 제목` | 절 제목 (HEADING_2, Arimo Bold 16pt) |
| `### 제목` | 중제목 (HEADING_3, Arimo Bold 14pt, 파랑) |
| `#### 제목` | 소제목 (HEADING_4, Arimo Bold+밑줄 12pt, 진파랑) |
| 일반 텍스트 | 본문 (NORMAL_TEXT, Arimo 10pt, 줄간격 150%) |
| `▶ ...` | 팁 (9pt) |
| ` ``` ` 코드블록 | 코드 (Roboto Mono 8pt, 노란 배경) |
| `<선생님의 비법 노트> 제목` | 비법노트 시작 (소제목 스타일) |
| `</선생님의 비법노트>` | 비법노트 끝 |
| `<한 걸음 더!> 제목` | 코너 제목 (소제목 스타일) |

**문체 규칙 (기존 원고 참조):**
- 친근한 존댓말 (`~해요`, `~합니다`, `~해볼까요?`)
- 번호 단계: `01`, `02`, `03` (두 자리)
- 실습 구조: `[바로 실습 N] 제목` → 설명 → 단계 → `<선생님의 비법 노트>`
- 다른 PART 참조 시: "PART 04에서 배울 수식 기능을 활용하면~"
- `[NOTE]` 블록: 보충 설명용

### 3단계: Google Docs에 삽입

**문서 ID 목록:**
| PART | Google Docs ID |
|------|----------------|
| PART1 | `1Ce1TvnG8cNcmzsHaAOOEzfCAWQormmRcAd4yQvpwyWM` |
| PART2 | `1uEcfpkMpu_YIW4vAgZ9Z76Tt4LTAo457gD5WcWw_V5Y` |
| PART3 | `1gt2-DUylPDcW_WeoK9QLQy5hGtafCdZtOV7FRUVIH9s` |
| PART4 | `1687YXYqQKBBtCUXpEs6CXMHiUN6Ic0GLI5Rbe968O8s` |
| PART5 | `1rFzCuss3gYtpJSnlFwZCsuW_OTLu29Ts7o8FdLseKdo` |

**삽입 명령어:**
```bash
# 문서 끝에 이어쓰기
cd C:/dev/book-writer && node docs-writer.js --append <docId> <md-file>

# 특정 위치에 삽입 (먼저 인덱스 조회 필요)
cd C:/dev/book-writer && node docs-writer.js --at <index> <docId> <md-file>

# 특정 범위 삭제
node C:/dev/book-writer/scripts/delete-range.js <docId> <startIndex> <endIndex>
```

**인덱스 조회 방법:**
```bash
gws docs documents get --params '{"documentId": "<DOC_ID>", "fields": "body.content"}' | node -e "
const chunks = [];
process.stdin.on('data', d => chunks.push(d));
process.stdin.on('end', () => {
  const raw = chunks.join('').replace(/^Using keyring backend: keyring\n/, '');
  const doc = JSON.parse(raw);
  for (const el of doc.body.content) {
    if (!el.paragraph) continue;
    const text = el.paragraph.elements.map(e => e.textRun?.content || '').join('').trim();
    if (text.length > 0) console.log(el.startIndex + '-' + el.endIndex + ' | ' + text.slice(0, 70));
  }
});
"
```

### 4단계: 검증
삽입 후 Google Docs에서 스타일이 정상 적용되었는지 확인합니다.
gws CLI 인증이 만료되었으면 `gws auth login`으로 재인증합니다.

## 주의사항
- gws CLI는 bash 셸에서만 동작 (`$(cat file)` 패턴 사용)
- 대량 삽입 시 자동으로 80개 단위 청크 분할됨
- `\r\n` → `\n` 자동 변환됨
- PART6 문서는 아직 없음 → 새 Google Docs 생성 후 ID 등록 필요
