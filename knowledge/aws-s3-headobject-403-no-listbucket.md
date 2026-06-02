# AWS S3 HeadObject/GetObject: ListBucket 없으면 '없는 객체'가 404 아닌 403 (2026-05-29)

S3에서 객체 존재 확인(HeadObject)이나 읽기(GetObject)를 할 때, **호출자에게 `s3:ListBucket` 권한이 없으면 "없는 객체"가 404가 아니라 403으로** 돌아온다. 존재 확인 로직이 404만 "없음"으로 처리하면 멀쩡한 신규 업로드가 전부 실패한다.

## 증상
- 존재 확인용 HeadObject 호출 → 객체가 없을 때 **404(NotFound)가 아니라 403**.
- AWS SDK v3에서는 HEAD 응답에 본문이 없어 에러 코드를 못 읽고 종종 `name: "Unknown"`, `message: "UnknownError"`, `$metadata.httpStatusCode: 403`으로 표면화된다(= 모호해서 디버깅 헷갈림).

## 원인
S3는 `s3:ListBucket` 권한이 없는 호출자에게 **객체 존재 여부를 숨기려고** 없는 객체의 GetObject/HeadObject를 404가 아닌 **403(AccessDenied)** 으로 응답한다(존재 은닉). 정리하면:
- 객체 **있음** + `s3:GetObject` → **200**
- 객체 **없음** + `s3:ListBucket` 있음 → **404 NotFound**
- 객체 **없음** + `s3:ListBucket` 없음 → **403**

## 해결 (둘 중 택1)
- **(권장 · least-privilege)** 코드에서 **403도 '없음'으로 처리**한다. 존재하는 객체는 `s3:GetObject`로 200을 주므로, 403/404를 모두 '없음 → 업로드/생성'으로 봐도 "이미 있으면 스킵" 최적화는 유지된다(있으면 200 = 스킵). 진짜 권한 문제라면 뒤따르는 쓰기(PutObject)가 실패로 드러난다. → `s3:ListBucket` 권한 추가 불필요.
- **(대안)** IAM 정책에 **`s3:ListBucket`** 추가(리소스 = 버킷 ARN, `/*` 없음). 그러면 HeadObject가 없는 객체에 정상 404를 반환한다.

## 코드 예 (헤드 존재 확인 — 403/404 모두 '없음')
```js
async function headExists(s3, bucket, key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch (e) {
    const status = e?.$metadata?.httpStatusCode;
    if (status === 404 || status === 403 || e?.name === "NotFound" || e?.name === "NoSuchKey") {
      return false; // 없음 → 생성/업로드 진행
    }
    throw e; // 그 외만 진짜 오류
  }
}
```

## 진단 팁
- `name: "Unknown" / UnknownError + httpStatusCode: 403`이면 권한/존재은닉 의심. `aws s3api head-object` 대신 PutObject·공개 GET을 분리 테스트하면 "쓰기 OK / 헤드만 403" 패턴이 바로 드러난다.

## 출처
newsletter-self-host 이미지 S3 재호스팅 구현 중 실측(2026-05-29). IAM `newsletter-sender`에 `s3:PutObject`+`s3:GetObject`만 부여(ListBucket 없음) → 신규 객체 HeadObject가 403 `UnknownError` → 재호스팅 전건 실패. 403=없음 처리로 해결(ListBucket 없이 least-privilege 유지).
