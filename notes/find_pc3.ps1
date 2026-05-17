[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$parts = @("G:", "\xEB\x82\xB4 \xEB\x93\x9C\xEB\x9D\xBC\xEC\x9D\xB4\xEB\xB8\x8C", "PC \xEB\xB0\xB1\xEC\x97\x85", "TASKS")
$path = "G:\내 드라이브\PC 백업\TASKS\정보부 인수인계\0.중요대장"
$exists = Test-Path -LiteralPath $path
Write-Host "Exists: $exists"
if ($exists) {
    Get-ChildItem -LiteralPath $path | ForEach-Object { Write-Host $_.Name }
}
