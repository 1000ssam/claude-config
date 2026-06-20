[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = 'SilentlyContinue'

# Scan 10.51.90.0/24 for open RAW printing port 9100
$subnet = '10.51.90.'
$port   = 9100
$timeoutMs = 300

$jobs = @()
foreach ($i in 1..254) {
    $ip = "$subnet$i"
    $client = New-Object System.Net.Sockets.TcpClient
    $async  = $client.BeginConnect($ip, $port, $null, $null)
    $jobs += [PSCustomObject]@{ IP = $ip; Client = $client; Async = $async }
}

Start-Sleep -Milliseconds $timeoutMs

$open = @()
foreach ($j in $jobs) {
    if ($j.Async.IsCompleted -and $j.Client.Connected) {
        $open += $j.IP
    }
    $j.Client.Close()
}

if (-not $open) {
    Write-Output 'NO_PORT_9100_HOSTS_FOUND'
    return
}

# Identify each open host via HTTP title (web UI) — Kyocera Command Center reveals model
foreach ($ip in $open) {
    $model = ''
    try {
        $resp = Invoke-WebRequest -Uri "http://$ip/" -TimeoutSec 3 -UseBasicParsing
        if ($resp.Content -match '<title>([^<]+)</title>') { $model = $matches[1].Trim() }
    } catch {}
    # Also try TASKalfa-typical status path
    if (-not $model) {
        try {
            $resp2 = Invoke-WebRequest -Uri "https://$ip/" -TimeoutSec 3 -UseBasicParsing -SkipCertificateCheck
            if ($resp2.Content -match '<title>([^<]+)</title>') { $model = $matches[1].Trim() }
        } catch {}
    }
    Write-Output ("{0}`tport9100=OPEN`t{1}" -f $ip, $model)
}
