# ELEVATED: set new LAN printer as default, remove dead WSD '3554ci (5)' duplicate + its port.
$ErrorActionPreference = 'Continue'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$log = 'C:\dev\notes\printer-cleanup.log'
function L($m){ $ts=(Get-Date).ToString('HH:mm:ss'); Add-Content -Path $log -Value "[$ts] $m" -Encoding UTF8 }
Set-Content -Path $log -Value "=== cleanup log ===" -Encoding UTF8

$newPrn  = 'Kyocera TASKalfa 3554ci (LAN)'
$deadPrn = 'Kyocera TASKalfa 3554ci (5)'
$deadPort= 'WSD-331f70bf-cd11-4ec4-a809-d5ada6df48eb'

# 1) set default
try {
    $p = Get-CimInstance Win32_Printer -Filter "Name='$($newPrn.Replace("'","''"))'"
    $r = Invoke-CimMethod -InputObject $p -MethodName SetDefaultPrinter
    L "Set default -> '$newPrn' (return=$($r.ReturnValue))"
} catch { L "SET-DEFAULT FAIL: $($_.Exception.Message)" }

# 2) remove dead WSD duplicate printer
try {
    if (Get-Printer -Name $deadPrn -ErrorAction SilentlyContinue) {
        Remove-Printer -Name $deadPrn -ErrorAction Stop
        L "Removed dead printer '$deadPrn'"
    } else { L "Dead printer not found (already gone): '$deadPrn'" }
} catch { L "REMOVE-PRINTER FAIL: $($_.Exception.Message)" }

# 3) remove its now-unused WSD port (tolerate failure)
try {
    if (Get-PrinterPort -Name $deadPort -ErrorAction SilentlyContinue) {
        Remove-PrinterPort -Name $deadPort -ErrorAction Stop
        L "Removed unused WSD port $deadPort"
    }
} catch { L "Port remove skipped ($deadPort): $($_.Exception.Message)" }

# 4) final state
L "--- Final printers ---"
Get-Printer | ForEach-Object {
    $def = (Get-CimInstance Win32_Printer -Filter "Name='$($_.Name.Replace("'","''"))'").Default
    L ("  {0}{1}  [{2}]" -f $_.Name, $(if($def){' (DEFAULT)'}else{''}), $_.PortName)
}
L "RESULT: DONE"
