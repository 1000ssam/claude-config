$src = 'G:\내 드라이브\PC 백업\TASKS\정보부 인수인계\0.중요대장\(제일중요)2025PC(개인용장비)관리(202604).xlsx'
$dst = 'C:\dev\notes\pc-mgmt-temp.xlsx'
Copy-Item -Path $src -Destination $dst -Force
Write-Host "DONE"
