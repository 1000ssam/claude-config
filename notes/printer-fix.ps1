# Robust printer fix: re-register Kyocera 3554ci via Standard TCP/IP (RAW 9100) at fixed IP
# Runs ELEVATED. Logs everything to C:\dev\notes\printer-fix.log so the calling session can read results.
$ErrorActionPreference = 'Continue'
$log = 'C:\dev\notes\printer-fix.log'
function L($m){ $ts=(Get-Date).ToString('HH:mm:ss'); Add-Content -Path $log -Value "[$ts] $m" -Encoding UTF8 }
Set-Content -Path $log -Value "=== Printer fix log ===" -Encoding UTF8

$ip       = '10.51.90.63'
$portName = "TCPIP_$ip"
$prnName  = 'Kyocera TASKalfa 3554ci (LAN)'

L "Elevated: $([Security.Principal.WindowsPrincipal]::new([Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator))"

# 1) Standard TCP/IP RAW 9100 port
try {
    if (Get-PrinterPort -Name $portName -ErrorAction SilentlyContinue) {
        L "Port $portName already exists."
    } else {
        Add-PrinterPort -Name $portName -PrinterHostAddress $ip -ErrorAction Stop
        L "Created Standard TCP/IP port $portName -> $ip (RAW 9100 default)."
    }
} catch { L "PORT ERROR: $($_.Exception.Message)" }

# 2) Ensure a Kyocera driver is available. Try existing, else attempt to stage from Windows Update / driver store.
$kyoDriver = (Get-PrinterDriver -ErrorAction SilentlyContinue | Where-Object { $_.Name -match 'Kyocera|TASKalfa' } | Select-Object -First 1).Name
if (-not $kyoDriver) {
    L "No Kyocera driver installed. Attempting to add from staged INF / Windows Update..."
    foreach ($cand in @(
        'Kyocera TASKalfa 3554ci KX',
        'Kyocera TASKalfa 3554ci (KPDL)',
        'Kyocera TASKalfa 3554ci',
        'Kyocera Classic Universal Driver',
        'Kyocera KX')) {
        try { Add-PrinterDriver -Name $cand -ErrorAction Stop; L "Staged driver: $cand"; $kyoDriver=$cand; break }
        catch { L "  driver not available: $cand" }
    }
}
if (-not $kyoDriver) {
    L "RESULT: NO_KYOCERA_DRIVER -- need to install Kyocera driver (e.g. via Add Printer wizard > Windows Update > Kyocera > TASKalfa 3554ci, or download KX driver)."
    L "Port is created and ready; printer add deferred until driver is available."
    return
}
L "Using driver: $kyoDriver"

# 3) Add the printer on the fixed-IP RAW port
try {
    if (Get-Printer -Name $prnName -ErrorAction SilentlyContinue) {
        L "Printer '$prnName' already exists; setting port."
        Set-Printer -Name $prnName -PortName $portName -ErrorAction Stop
    } else {
        Add-Printer -Name $prnName -DriverName $kyoDriver -PortName $portName -ErrorAction Stop
        L "Added printer '$prnName' on $portName."
    }
} catch { L "ADD-PRINTER ERROR: $($_.Exception.Message)"; return }

# 4) Print a Windows test page so the user can physically confirm the right copier
try {
    $p = Get-CimInstance Win32_Printer -Filter "Name='$($prnName.Replace("'","''"))'"
    $r = Invoke-CimMethod -InputObject $p -MethodName PrintTestPage
    L "Sent Windows test page (return=$($r.ReturnValue)). Check the copier output tray."
} catch { L "TEST-PAGE ERROR: $($_.Exception.Message)" }

L "RESULT: DONE -- new printer '$prnName' created on fixed IP $ip. Old WSD '(5)' NOT removed yet (await test confirmation)."
