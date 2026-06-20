[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = 'SilentlyContinue'
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }

$ip = '10.51.90.63'

# Build a minimal IPP Get-Printer-Attributes request (operation 0x000B)
function New-IppRequest {
    param([string]$printerUri)
    $ms = New-Object System.IO.MemoryStream
    $bw = New-Object System.IO.BinaryWriter($ms)
    $bw.Write([byte]0x02); $bw.Write([byte]0x00)      # version 2.0
    $bw.Write([byte]0x00); $bw.Write([byte]0x0B)      # operation: Get-Printer-Attributes
    $bw.Write([byte[]]@(0x00,0x00,0x00,0x01))         # request-id = 1
    $bw.Write([byte]0x01)                             # operation-attributes-tag

    function Write-Attr {
        param($bw,[byte]$valueTag,[string]$name,[string]$val)
        $nb = [System.Text.Encoding]::ASCII.GetBytes($name)
        $vb = [System.Text.Encoding]::ASCII.GetBytes($val)
        $bw.Write([byte]$valueTag)
        $bw.Write([byte]0x00); $bw.Write([byte]$nb.Length); $bw.Write($nb)
        $bw.Write([byte]0x00); $bw.Write([byte]$vb.Length); $bw.Write($vb)
    }
    Write-Attr $bw 0x47 'attributes-charset' 'utf-8'
    Write-Attr $bw 0x48 'attributes-natural-language' 'en'
    Write-Attr $bw 0x45 'printer-uri' $printerUri
    $bw.Write([byte]0x03)                             # end-of-attributes-tag
    $bw.Flush()
    return $ms.ToArray()
}

$paths = @('/ipp/print','/ipp','/')
$found = $false
foreach ($scheme in 'http','https') {
    $portPart = if ($scheme -eq 'http') { ':631' } else { ':443' }
    foreach ($p in $paths) {
        $uri  = "${scheme}://$ip$portPart$p"
        $purl = "ipp://$ip$p"
        try {
            $body = New-IppRequest $purl
            $req = [System.Net.HttpWebRequest]::Create($uri)
            $req.Method = 'POST'
            $req.ContentType = 'application/ipp'
            $req.Timeout = 4000
            $req.ContentLength = $body.Length
            $s = $req.GetRequestStream(); $s.Write($body,0,$body.Length); $s.Close()
            $resp = $req.GetResponse()
            $rs = $resp.GetResponseStream()
            $mem = New-Object System.IO.MemoryStream
            $rs.CopyTo($mem)
            $bytes = $mem.ToArray()
            $text = [System.Text.Encoding]::UTF8.GetString($bytes)
            foreach ($needle in 'TASKalfa','ECOSYS') {
                $m = [regex]::Match($text, "$needle[ ]?[0-9A-Za-z]+")
                if ($m.Success) {
                    Write-Output ("MODEL via {0}{1} : {2}" -f $scheme,$p,$m.Value)
                    $found = $true
                }
            }
            $m2 = [regex]::Match($text, 'printer-make-and-model.{0,4}([ -~]{5,60})')
            if ($m2.Success) { Write-Output ("make-and-model raw: " + $m2.Groups[1].Value) }
            if ($found) { return }
        } catch {}
    }
}
if (-not $found) { Write-Output 'IPP model not parsed (printer may restrict IPP query)' }
