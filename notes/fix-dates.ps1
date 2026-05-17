
$filepath = "G:\내 드라이브\PC 백업\TASKS\정보부 인수인계\0.중요대장\(제일중요)2025PC(개인용장비)관리(202604).xlsx"

$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

$wb = $excel.Workbooks.Open($filepath)
$ws = $wb.Sheets.Item("PC")

$maxRow = $ws.UsedRange.Rows.Count + $ws.UsedRange.Row - 1
$count = 0

for ($row = 2; $row -le $maxRow; $row++) {
    $cell = $ws.Cells.Item($row, 12)
    $val = $cell.Value2
    if ($null -eq $val) { continue }
    $s = [string]$val
    $s = $s.Trim()
    if ($s.Length -eq 6 -and $s -match '^\d{6}$') {
        $newVal = [long]($s + "00")
        Write-Host "Row $($row): $s -> $newVal"
        $cell.Value2 = $newVal
        $count++
    }
}

Write-Host "Total: $count rows fixed"
$wb.Save()
$wb.Close()
$excel.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
Write-Host "Saved!"
