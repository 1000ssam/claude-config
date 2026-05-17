[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$path = "G:/내 드라이브/PC 백업/TASKS/정보부 인수인계/0.중요대장"
$exists = Test-Path -LiteralPath $path
Write-Host ('Exists: ' + $exists)
if ($exists) {
    Get-ChildItem -LiteralPath $path | ForEach-Object { Write-Host $_.Name }
}
