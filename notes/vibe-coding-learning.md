# 바이브 코딩 학습 기록

Claude Code와 협업하면서 배운 기술 용어와 개념을 정리합니다.

---

## 2026-03-24

### 프론트엔드 vs 백엔드

- **프론트엔드**: 브라우저에서 실행되는 코드. 화면 UI 담당.
  - **React**: UI를 만드는 JavaScript 라이브러리. 버튼, 드래그앤드롭, 미리보기 같은 화면 요소 생성
  - **Next.js**: React 위에 올라가는 프레임워크. 라우팅, 빌드, 배포를 쉽게 해줌
- **백엔드**: 서버에서 실행되는 코드. 무거운 연산, DB 접근, 파일 처리 담당.
  - **Python (FastAPI)**: 서버에서 PDF 열기, 문항 감지, 이미지 크롭 같은 실제 연산 처리

### 배포 플랫폼 비교 (Vercel vs Render vs Railway)

| | Vercel | Render | Railway |
|---|---|---|---|
| 최적 용도 | 프론트엔드 + 가벼운 API | 풀스택, Docker | 풀스택, DB 포함 |
| 무료 플랜 | 있음 | 있음 (콜드 스타트) | $5 크레딧 후 유료 |
| Python 백엔드 | 가벼운 것만 (10초 제한) | 자유로움 | 자유로움 |
| Docker | 미지원 | 지원 | 지원 |

**핵심**: Python에 무거운 라이브러리(PyMuPDF, numpy 등)가 들어가면 Vercel은 피하고 Render/Railway 사용.

### 콜드 스타트

- 무료 플랜 서버는 일정 시간(~15분) 요청이 없으면 잠듦
- 다음 요청 시 서버를 다시 깨우는 데 30초~1분 소요
- 깨어난 후에는 정상 속도
- 유료 플랜은 항상 켜져 있어 콜드 스타트 없음

### pdf.js vs PyMuPDF

- **pdf.js**: 브라우저에서 돌아가는 JavaScript PDF 라이브러리. 텍스트 추출이 부정확하고, 이미지 블록 감지 불가. 좌표계 변환도 복잡.
- **PyMuPDF**: Python PDF 라이브러리. `search_for()`, `get_text(clip=)`, `get_pixmap(clip=)` 등 정밀한 API 제공. 서버에서만 사용 가능.
- **교훈**: 같은 기능이라도 라이브러리 능력 차이가 크다. 브라우저에서 다 하려고 하지 말고, 무거운 건 서버로 보내는 게 맞다.

### Docker (도커)

- **한마디**: 앱을 실행 환경째 통째로 포장하는 상자
- **해결하는 문제**: "내 PC에서는 되는데 서버에서 안 돼" → Docker 컨테이너 안에 Python, 라이브러리, 코드를 모두 넣으면 어디서든 동일하게 실행
- **Dockerfile**: 상자를 만드는 레시피. "Python 3.12 설치 → 의존성 설치 → 코드 복사 → 실행" 같은 단계를 정의
- **바이브 코딩에서의 교훈**: 처음부터 Docker로 개발하면 배포 시 환경 문제가 0. 나중에 감싸려면 의존성 꼬여서 고생함. exam-cropper가 정확히 이 케이스 (Vercel→Render 이사)
- **지원 플랫폼**: Render, Railway, Google Cloud Run 등. Vercel은 Docker 미지원.

---

## 2026-03-25

### 데이터베이스 스택 계층 이해

| 계층 | 예시 | 역할 |
|------|------|------|
| **SQL** (언어) | SQL | DB에 명령하는 언어 (Structured Query Language) |
| **DB 소프트웨어** | PostgreSQL, MySQL, SQLite | SQL을 실행하는 프로그램 |
| **호스팅 서비스** | Supabase, AWS RDS, PlanetScale | DB를 클라우드에서 운영해주는 서비스 |
| **ORM** | Prisma, Drizzle | 코드에서 SQL을 대신 써주는 라이브러리 |
| **RLS** | PostgreSQL 기능 | 행(row) 단위로 접근을 제어하는 보안 기능 |

### Supabase 구조

- **핵심**: PostgreSQL DB + 부가 서비스 번들 (인증, 스토리지, 실시간 구독, Edge Functions)
- **PostgREST**: DB 테이블을 자동으로 REST API로 노출 → anon key만 알면 접근 가능 → RLS로 방어 필요
- **notion-flow 사례**: PostgREST를 안 쓰고 Prisma로 직접 연결하지만, PostgREST API가 기본으로 열려 있어서 RLS 적용 필요했음
