# ELEVATED: stage Kyocera KX driver from extracted ZIP, register printer on fixed-IP RAW port, test print.
$ErrorActionPreference = 'Continue'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$log = 'C:\dev\notes\printer-install.log'
function L($m){ $ts=(Get-Date).ToString('HH:mm:ss'); Add-Content -Path $log -Value "[$ts] $m" -Encoding UTF8 }
Set-Content -Path $log -Value "=== KX driver install log ===" -Encoding UTF8

$zip     = 'C:\dev\notes\kyocera\kxdriver.zip'
$ext     = 'C:\dev\notes\kyocera\extracted'
$ip      = '10.51.90.63'
$portName= "TCPIP_$ip"
$prnName = 'Kyocera TASKalfa 3554ci (LAN)'

# 0) admin check
$adm = [Security.Principal.WindowsPrincipal]::new([Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator)
L "Elevated: $adm"
if (-not (Test-Path $zip)) { L "ZIP missing: $zip -- abort"; return }

# 1) extract
try {
    if (Test-Path $ext) { Remove-Item $ext -Recurse -Force -ErrorAction SilentlyContinue }
    Expand-Archive -Path $zip -DestinationPath $ext -Force -ErrorAction Stop
    L "Extracted to $ext"
} catch { L "EXTRACT ERROR: $($_.Exception.Message)"; return }

# 2) find INF(s) referencing 3554ci, prefer 64-bit KX
$infs = Get-ChildItem -Path $ext -Recurse -Filter *.inf -ErrorAction SilentlyContinue
L "Found $($infs.Count) INF files."
$target = $null; $modelName = $null
foreach ($inf in $infs) {
    $txt = Get-Content -Path $inf.FullName -Raw -ErrorAction SilentlyContinue
    if ($txt -match '3554ci') {
        # extract quoted model names containing 3554ci (prefer KX)
        $matches2 = [regex]::Matches($txt, '"([^"]*3554ci[^"]*)"')
        $names = $matches2 | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique
        $kx = $names | Where-Object { $_ -match 'KX' } | Select-Object -First 1
        $pick = if ($kx) { $kx } else { $names | Select-Object -First 1 }
        if ($pick) {
            L "INF candidate: $($inf.FullName)  ->  model '$pick'  (path matches: $($inf.FullName -match 'x64|amd64|64'))"
            # prefer a 64-bit path
            if (-not $target -or $inf.FullName -match 'x64|amd64|_64|\\64') { $target = $inf.FullName; $modelName = $pick }
        }
    }
}
if (-not $target) { L "RESULT: NO_INF_FOR_3554ci -- check extracted folder manually."; return }
L "Selected INF: $target"
L "Selected model: $modelName"

# 3) stage + add print driver
try {
    Add-PrinterDriver -Name $modelName -InfPath $target -ErrorAction Stop
    L "Added printer driver '$modelName'."
} catch {
    L "Add-PrinterDriver (InfPath) failed: $($_.Exception.Message). Trying pnputil stage..."
    $pn = & pnputil.exe /add-driver $target /install 2>&1 | Out-String
    L "pnputil: $pn"
    try { Add-PrinterDriver -Name $modelName -ErrorAction Stop; L "Added driver '$modelName' after pnputil." }
    catch { L "RESULT: DRIVER_ADD_FAILED: $($_.Exception.Message)"; return }
}

# 4) ensure port still exists
if (-not (Get-PrinterPort -Name $portName -ErrorAction SilentlyContinue)) {
    try { Add-PrinterPort -Name $portName -PrinterHostAddress $ip -ErrorAction Stop; L "Recreated port $portName." }
    catch { L "PORT ERROR: $($_.Exception.Message)"; return }
}

# 5) add printer
try {
    if (Get-Printer -Name $prnName -ErrorAction SilentlyContinue) {
        Set-Printer -Name $prnName -DriverName $modelName -PortName $portName -ErrorAction Stop
        L "Updated existing printer '$prnName'."
    } else {
        Add-Printer -Name $prnName -DriverName $modelName -PortName $portName -ErrorAction Stop
        L "Added printer '$prnName' on $portName with '$modelName'."
    }
} catch { L "ADD-PRINTER ERROR: $($_.Exception.Message)"; return }

# 6) test page
try {
    $p = Get-CimInstance Win32_Printer -Filter "Name='$($prnName.Replace("'","''"))'"
    $r = Invoke-CimMethod -InputObject $p -MethodName PrintTestPage
    L "Test page sent (return=$($r.ReturnValue)). Check copier output tray."
} catch { L "TEST-PAGE ERROR: $($_.Exception.Message)" }

L "RESULT: DONE -- '$prnName' ready on fixed IP $ip. (Old WSD '(5)' not removed yet.)"
