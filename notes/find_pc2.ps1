[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$path = Join-Path "G:" "내 드라이브" "PC 백업" "TASKS" "정보부 인수인계" "0.중요대장"
Write-Host "Path: $path"
Write-Host "Exists: $(Test-Path $path)"
if (Test-Path $path) {
    Get-ChildItem $path | ForEach-Object { Write-Host $_.Name }
}
