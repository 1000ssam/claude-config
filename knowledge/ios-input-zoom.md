# iOS Safari input 자동 줌 방지

## 문제
iOS Safari에서 `<input>` 또는 `<textarea>`에 포커스할 때, font-size가 **16px 미만**이면 화면이 자동으로 확대(zoom)된다.

## 원인
iOS Safari의 접근성 기능. 작은 텍스트 입력 시 가독성을 위해 뷰포트를 줌하는 기본 동작.

## 해결
입력 필드의 font-size를 **16px 이상**으로 설정한다.

```
/* Tailwind */
text-base  (16px) ✅
text-sm    (14px) ❌ → iOS 자동 줌 발생
text-xs    (12px) ❌ → iOS 자동 줌 발생
```

## 주의
- `<meta name="viewport" content="maximum-scale=1">` 같은 줌 차단은 접근성 위반이므로 사용하지 않는다.
- 디자인상 작은 폰트가 필요하면 입력 필드만 16px 이상으로 유지하고 placeholder/label을 작게 한다.
