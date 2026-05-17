[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$src = "G:/내 드라이브/PC 백업/TASKS/정보부 인수인계/0.중요대장/(제일중요)2025PC(개인용장비)관리(2025.12).xlsx"
$dst = "C:/dev/notes/pc_mgmt.xlsx"
Copy-Item -LiteralPath $src -Destination $dst -Force
Write-Host ('Done: ' + (Test-Path $dst))
