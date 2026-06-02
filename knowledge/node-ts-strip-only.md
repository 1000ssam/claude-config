# Node 네이티브 TS strip-only 런타임 함정

`node --env-file=.env script.ts`처럼 **Node가 .ts를 네이티브로 직접 실행**할 때(타입 스트립 only 모드)는, **"타입만 지우면 곧 JS가 되는" erasable 문법만** 지원한다. 코드 생성이 필요한 TS 문법은 런타임에서 다음으로 터진다:

```
SyntaxError [ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX]: <문법> is not supported in strip-only mode
```

## 미지원(=코드 생성 필요) 문법
- **파라미터 프로퍼티**: `constructor(private readonly max: number) {}`  ← 가장 흔함
- **enum** (런타임 객체를 생성)
- **런타임 코드 있는 namespace**
- **런타임 데코레이터**

## 진짜 함정 — CI 다 통과하고 런타임만 죽음
`tsc --noEmit`(타입체크), `vitest`(esbuild/SWC 변환), `next build`(SWC)는 **이 문법을 전부 변환 지원**해서 통과한다. 정작 **Node 네이티브 strip-only 런타임만** crash한다. 즉 단위테스트·타입체크·빌드가 모두 초록불이어도 스크립트(`node script.ts`)는 죽을 수 있다.
→ **검증에 "실제 스크립트 런타임 1회 실행"(예: dry-run)을 반드시 포함**할 것. 테스트/빌드만으론 부족.

## 해결 — erasable하게 작성
- 파라미터 프로퍼티 → **명시적 필드 선언 + constructor 본문 할당**
  ```ts
  class Semaphore {
    private readonly max: number;
    constructor(max: number) { this.max = max; }
  }
  ```
- enum → `as const` 객체 + 리터럴 union 타입
- namespace → ES 모듈
- (또는 실행을 `node --experimental-transform-types`로 — 코드 생성 허용. 단 프로젝트가 strip-only(`allowImportingTsExtensions`)면 이 경로를 안 씀.)

## 출처
newsletter-self-host 콜드스타트 `fetchBlocks` 병렬화의 `Semaphore` 버그(2026-05-28). 에이전트가 파라미터 프로퍼티를 써서 tsc/vitest/next build 통과했으나 `scripts/send.ts`(Node `--env-file` 네이티브 TS)에서 레터 렌더 시 crash. 명시적 필드 선언으로 픽스.
