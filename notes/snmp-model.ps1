[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = 'SilentlyContinue'

function Get-SnmpString {
    param([string]$ip, [string]$oid, [string]$community = 'public')

    # Build minimal SNMP v1 GET request
    $oidParts = $oid.Split('.') | ForEach-Object { [int]$_ }
    $oidBytes = New-Object System.Collections.Generic.List[byte]
    # first two subids encode as 40*x+y
    $oidBytes.Add([byte](40 * $oidParts[0] + $oidParts[1]))
    for ($k = 2; $k -lt $oidParts.Count; $k++) {
        $v = $oidParts[$k]
        if ($v -lt 128) { $oidBytes.Add([byte]$v) }
        else {
            $stack = @()
            $stack += [byte]($v -band 0x7f)
            $v = $v -shr 7
            while ($v -gt 0) { $stack += [byte](($v -band 0x7f) -bor 0x80); $v = $v -shr 7 }
            [array]::Reverse($stack)
            $oidBytes.AddRange($stack)
        }
    }
    $commBytes = [System.Text.Encoding]::ASCII.GetBytes($community)

    $varbind = @(0x06, $oidBytes.Count) + $oidBytes + @(0x05, 0x00)
    $varbindList = @(0x30, $varbind.Count) + $varbind
    $reqId = @(0x02, 0x01, 0x01)      # request-id = 1
    $err   = @(0x02, 0x01, 0x00)      # error-status
    $errIdx= @(0x02, 0x01, 0x00)      # error-index
    $pduBody = $reqId + $err + $errIdx + $varbindList
    $pdu = @(0xA0, $pduBody.Count) + $pduBody   # GetRequest PDU
    $version = @(0x02, 0x01, 0x00)               # v1
    $comm = @(0x04, $commBytes.Count) + $commBytes
    $msgBody = $version + $comm + $pdu
    $msg = @(0x30, $msgBody.Count) + $msgBody
    $bytes = [byte[]]$msg

    $udp = New-Object System.Net.Sockets.UdpClient
    $udp.Client.ReceiveTimeout = 3000
    try {
        $udp.Connect($ip, 161)
        [void]$udp.Send($bytes, $bytes.Length)
        $remote = New-Object System.Net.IPEndPoint([System.Net.IPAddress]::Any, 0)
        $resp = $udp.Receive([ref]$remote)
        # find the response OCTET STRING value (last 0x04 in payload after the OID)
        # crude: locate the varbind value type byte
        $idx = -1
        for ($i = $resp.Length - 1; $i -ge 2; $i--) {
            if ($resp[$i] -eq 0x04) { $idx = $i; break }
        }
        if ($idx -ge 0) {
            $len = $resp[$idx + 1]
            $val = [System.Text.Encoding]::UTF8.GetString($resp, $idx + 2, $len)
            return $val
        }
        return '(no string in response)'
    } catch {
        return "(SNMP fail: $($_.Exception.Message))"
    } finally { $udp.Close() }
}

$ip = '10.51.90.63'
Write-Output ("sysDescr      : " + (Get-SnmpString $ip '1.3.6.1.2.1.1.1.0'))
Write-Output ("hrDeviceDescr : " + (Get-SnmpString $ip '1.3.6.1.2.1.25.3.2.1.3.1'))
Write-Output ("sysName       : " + (Get-SnmpString $ip '1.3.6.1.2.1.1.5.0'))
