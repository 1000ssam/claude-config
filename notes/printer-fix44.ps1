# ELEVATED: repoint printer to the CORRECT copier at 10.51.90.44, remove wrong .63 port, test print.
$ErrorActionPreference = 'Continue'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$log = 'C:\dev\notes\printer-fix44.log'
function L($m){ $ts=(Get-Date).ToString('HH:mm:ss'); Add-Content -Path $log -Value "[$ts] $m" -Encoding UTF8 }
Set-Content -Path $log -Value "=== repoint to .44 log ===" -Encoding UTF8

$ip       = '10.51.90.44'
$portName = "TCPIP_$ip"
$badPort  = 'TCPIP_10.51.90.63'
$prnName  = 'Kyocera TASKalfa 3554ci (LAN)'
$driver   = 'Kyocera TASKalfa 3554ci KX'

L "Elevated: $([Security.Principal.WindowsPrincipal]::new([Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator))"

# 1) correct port
if (-not (Get-PrinterPort -Name $portName -ErrorAction SilentlyContinue)) {
    try { Add-PrinterPort -Name $portName -PrinterHostAddress $ip -ErrorAction Stop; L "Created port $portName (RAW 9100)" }
    catch { L "PORT FAIL: $($_.Exception.Message)"; return }
} else { L "Port present: $portName" }

# 2) repoint (or create) printer
try {
    if (Get-Printer -Name $prnName -ErrorAction SilentlyContinue) {
        Set-Printer -Name $prnName -PortName $portName -DriverName $driver -ErrorAction Stop
        L "Repointed '$prnName' -> $portName"
    } else {
        Add-Printer -Name $prnName -DriverName $driver -PortName $portName -ErrorAction Stop
        L "Added '$prnName' on $portName"
    }
} catch { L "PRINTER FAIL: $($_.Exception.Message)"; return }

# 3) remove the wrong .63 port (now unused)
try {
    if (Get-PrinterPort -Name $badPort -ErrorAction SilentlyContinue) {
        Remove-PrinterPort -Name $badPort -ErrorAction Stop
        L "Removed wrong port $badPort"
    }
} catch { L "Could not remove $badPort (may still be referenced): $($_.Exception.Message)" }

# 4) test page -> should now come out at the TEACHER'S copier
try {
    $p = Get-CimInstance Win32_Printer -Filter "Name='$($prnName.Replace("'","''"))'"
    $r = Invoke-CimMethod -InputObject $p -MethodName PrintTestPage
    L "Test page sent (return=$($r.ReturnValue)) -> check YOUR copier tray"
} catch { L "TESTPAGE FAIL: $($_.Exception.Message)" }

L "RESULT: DONE | '$prnName' now on $portName ($ip)"
