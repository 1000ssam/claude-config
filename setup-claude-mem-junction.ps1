# claude-mem Google Drive 정션 설정 스크립트
# Claude Code 완전 종료 후 실행할 것!
# 사용법: powershell -ExecutionPolicy Bypass -File setup-claude-mem-junction.ps1

$source = "$env:USERPROFILE\.claude-mem"
$target = "G:\내 드라이브\claude-mem"

# 1. Google Drive에 대상 폴더 생성
if (!(Test-Path $target)) {
    New-Item -ItemType Directory -Path $target | Out-Null
    Write-Host "[1/4] Google Drive 폴더 생성: $target"
} else {
    Write-Host "[1/4] Google Drive 폴더 이미 존재"
}

# 2. 기존 파일을 Google Drive로 이동
if (Test-Path $source) {
    if ((Get-Item $source).Attributes -band [IO.FileAttributes]::ReparsePoint) {
        Write-Host "[2/4] 이미 정션/심볼릭 링크 상태 — 스킵"
        exit 0
    }
    Write-Host "[2/4] 파일 이동 중..."
    Get-ChildItem $source -Force | Move-Item -Destination $target -Force
    Remove-Item $source -Force -Recurse
    Write-Host "      이동 완료"
} else {
    Write-Host "[2/4] 소스 폴더 없음 — 스킵"
}

# 3. 정션 생성
cmd /c mklink /J "$source" "$target"
Write-Host "[3/4] 정션 생성 완료: $source -> $target"

# 4. 확인
if ((Get-Item $source).Attributes -band [IO.FileAttributes]::ReparsePoint) {
    Write-Host "[4/4] 성공! claude-mem 데이터가 Google Drive로 동기화됩니다."
    Write-Host ""
    Write-Host "주의: 두 PC에서 동시에 Claude Code를 사용하면 DB가 깨질 수 있습니다."
    Write-Host "      한쪽을 완전히 종료한 후 다른 쪽에서 사용하세요."
} else {
    Write-Host "[4/4] 실패 — 수동으로 확인 필요"
}
