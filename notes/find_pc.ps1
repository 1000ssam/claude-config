[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$base = "G:\"
if (Test-Path $base) {
    Write-Host "G: drive accessible"
    $items = Get-ChildItem $base -ErrorAction SilentlyContinue
    foreach ($i in $items) { Write-Host $i.Name }
}
