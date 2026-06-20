# ELEVATED: finalize - add KX driver by exact name, create printer on fixed-IP RAW port, test print.
$ErrorActionPreference = 'Continue'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$log = 'C:\dev\notes\printer-finish.log'
function L($m){ $ts=(Get-Date).ToString('HH:mm:ss'); Add-Content -Path $log -Value "[$ts] $m" -Encoding UTF8 }
Set-Content -Path $log -Value "=== finalize log ===" -Encoding UTF8

$ip       = '10.51.90.63'
$portName = "TCPIP_$ip"
$prnName  = 'Kyocera TASKalfa 3554ci (LAN)'
$driver   = 'Kyocera TASKalfa 3554ci KX'
$inf      = 'C:\dev\notes\kyocera\extracted\64bit\OEMSETUP.INF'

L "Elevated: $([Security.Principal.WindowsPrincipal]::new([Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator))"

# 1) driver
if (Get-PrinterDriver -Name $driver -ErrorAction SilentlyContinue) {
    L "Driver already present: $driver"
} else {
    try { Add-PrinterDriver -Name $driver -ErrorAction Stop; L "Added driver (from store): $driver" }
    catch {
        L "Add by name failed ($($_.Exception.Message)); trying InfPath..."
        try { Add-PrinterDriver -Name $driver -InfPath $inf -ErrorAction Stop; L "Added driver via InfPath: $driver" }
        catch { L "RESULT: DRIVER_FAIL: $($_.Exception.Message)"; return }
    }
}

# 2) port
if (-not (Get-PrinterPort -Name $portName -ErrorAction SilentlyContinue)) {
    try { Add-PrinterPort -Name $portName -PrinterHostAddress $ip -ErrorAction Stop; L "Created port $portName" }
    catch { L "PORT FAIL: $($_.Exception.Message)"; return }
} else { L "Port present: $portName" }

# 3) printer
try {
    if (Get-Printer -Name $prnName -ErrorAction SilentlyContinue) {
        Set-Printer -Name $prnName -DriverName $driver -PortName $portName -ErrorAction Stop
        L "Updated printer $prnName"
    } else {
        Add-Printer -Name $prnName -DriverName $driver -PortName $portName -ErrorAction Stop
        L "Added printer $prnName on $portName"
    }
} catch { L "PRINTER FAIL: $($_.Exception.Message)"; return }

# 4) test page
try {
    $p = Get-CimInstance Win32_Printer -Filter "Name='$($prnName.Replace("'","''"))'"
    $r = Invoke-CimMethod -InputObject $p -MethodName PrintTestPage
    L "Test page sent (return=$($r.ReturnValue)) -> check copier tray"
} catch { L "TESTPAGE FAIL: $($_.Exception.Message)" }

L "RESULT: DONE | printer='$prnName' driver='$driver' port=$portName ($ip)"
