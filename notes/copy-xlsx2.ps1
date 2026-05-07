$src = 'G:\내 드라이브\PC 백업\TASKS\정보부 인수인계\0.중요대장\(제일중요)2025PC(개인용장비)관리(202604).xlsx'
$dst = 'C:\dev\notes\pc-mgmt-temp.xlsx'
if (Test-Path $src) {
    Copy-Item -Path $src -Destination $dst -Force
    Write-Host "Copied: $((Get-Item $dst).Length) bytes"
} else {
    Write-Host "SOURCE NOT FOUND"
    # List what's in the directory
    $dir = 'G:\내 드라이브\PC 백업\TASKS\정보부 인수인계\0.중요대장\'
    if (Test-Path $dir) {
        Get-ChildItem $dir | ForEach-Object { Write-Host $_.Name }
    } else {
        Write-Host "DIR NOT FOUND: $dir"
    }
}
