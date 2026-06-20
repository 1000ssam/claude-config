# libsodium-wrappers ESM 빌드 형제 모듈 누락 (`ERR_MODULE_NOT_FOUND`)

## 증상
`libsodium-wrappers`(예: 0.7.15)를 **순수 ESM**으로 import하면 로드 실패:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module
.../libsodium-wrappers/dist/modules-esm/libsodium.mjs
imported from .../libsodium-wrappers/dist/modules-esm/libsodium-wrappers.mjs
```

해당 상황:
- `node --experimental-strip-types foo.mts` / `node foo.mjs`에서 `import sodium from 'libsodium-wrappers'`
- 브라우저 native ESM에서 bare/상대 specifier로 로드
- Vite/번들러가 `"import"` 조건(modules-esm)을 고를 때

## 원인
패키지 `exports`의 `"import"` 항목이 `dist/modules-esm/libsodium-wrappers.mjs`를 가리키는데,
그 파일은 `import e from "./libsodium.mjs"`로 **형제 파일**을 찾는다. 그러나 그 형제(`libsodium.mjs`)는
같은 디렉토리에 없고 **별도 패키지 `libsodium`** 의 `dist/modules-esm/libsodium.mjs`에 있다 → 해석 실패.
(`exports`의 `"require"` 항목인 CJS `dist/modules/libsodium-wrappers.js`는 `require('libsodium')`로 정상 해석된다.)

확인:
```bash
node -e "console.log(JSON.stringify(require('libsodium-wrappers/package.json').exports))"
# ".": { "import": "...modules-esm/libsodium-wrappers.mjs", "require": "...modules/libsodium-wrappers.js" }
grep -o 'from"./libsodium.mjs"' node_modules/libsodium-wrappers/dist/modules-esm/libsodium-wrappers.mjs
ls node_modules/libsodium-wrappers/dist/modules-esm/   # libsodium.mjs 없음 → 버그
```

## 해결 (상황별)
1. **앱 런타임은 CJS로 가면 무관** — electron-vite main(`formats:['cjs']` + `externalizeDepsPlugin`)은
   `require('libsodium-wrappers')`로 해석되어 정상 동작. 일반 Node도 CJS(`require`)면 OK. **CJS 경로를 선택하라.**
2. **테스트 하니스(순수 ESM)** — 형제 파일을 채워 넣으면 해결:
   ```bash
   cp node_modules/libsodium/dist/modules-esm/libsodium.mjs \
      node_modules/libsodium-wrappers/dist/modules-esm/libsodium.mjs
   ```
   단 `npm install` 때마다 덮어쓰이므로 postinstall/스크립트로 재적용하거나 버전 핀.
3. **브라우저 셀프 호스팅(권장: E2E 무결성)** — jsdelivr `+esm`은 `/npm/libsodium@x/+esm`를 nested import한다.
   `libsodium`(자기완결) + `libsodium-wrappers`(import 1개) 두 파일을 동일 출처에 두고
   wrapper의 import 경로를 `./libsodium.mjs`로 sed 치환 → CDN 신뢰 제거 + 동작.
   (브라우저 번들은 Node에서 `self`/`window`/`crypto.getRandomValues` 셰임 없이는 RNG 오류가 나지만 실제 브라우저에선 정상.)
4. **버전 핀** — ESM 빌드가 고쳐진 릴리스로 올리거나, sealed box만 쓰면 `tweetnacl`(`box`/`box.open`+`nacl.box.keyPair`)로 대체 가능.

## 교훈
- 라이브러리의 `exports` 조건(`import` vs `require`)에 따라 다른 파일이 로드된다. "왜 빌드는 되는데 테스트만 깨지나" → 조건 차이.
- E2E 암호 라이브러리는 CDN 동적 번들(`+esm`)에 SRI를 못 건다 → 동일 출처 셀프 호스팅이 무결성상 정답.
- 관련: WSL 네이티브 모듈([[wsl-native-module]])과 별개. libsodium-wrappers는 WASM이라 네이티브 빌드는 불필요하다.
