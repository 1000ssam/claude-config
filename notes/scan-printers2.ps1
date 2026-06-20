[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = 'SilentlyContinue'
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }

# Candidate hosts that had port 9100 open but no HTTP title
$candidates = @('10.51.90.23','10.51.90.27','10.51.90.29','10.51.90.36','10.51.90.37',
                '10.51.90.41','10.51.90.43','10.51.90.44','10.51.90.45','10.51.90.48',
                '10.51.90.55','10.51.90.59','10.51.90.60','10.51.90.62','10.51.90.63',
                '10.51.90.64','10.51.90.66','10.51.90.166','10.51.90.167')

foreach ($ip in $candidates) {
    $server = ''
    $model  = ''
    foreach ($scheme in 'http','https') {
        try {
            $r = Invoke-WebRequest -Uri "${scheme}://$ip/" -TimeoutSec 4 -UseBasicParsing
            if ($r.Headers['Server']) { $server = $r.Headers['Server'] }
            # Kyocera model often embedded in body/scripts
            if ($r.Content -match 'TASKalfa[ ]?[0-9A-Za-z]+') { $model = $matches[0] }
            elseif ($r.Content -match 'ECOSYS[ ]?[0-9A-Za-z]+') { $model = $matches[0] }
            if ($server -or $model) { break }
        } catch {}
    }
    # Kyocera Command Center model endpoint
    if ($server -match 'KM-MFP' -and -not $model) {
        try {
            $r2 = Invoke-WebRequest -Uri "http://$ip/js/devmodel.js" -TimeoutSec 4 -UseBasicParsing
            if ($r2.Content -match 'TASKalfa[ ]?[0-9A-Za-z]+') { $model = $matches[0] }
        } catch {}
    }
    Write-Output ("{0}`tServer={1}`tModel={2}" -f $ip, $server, $model)
}
