# WSD 프린터 "갑자기 인쇄 안 됨" → 고정 IP RAW 재등록

## 증상
- 어느 날 갑자기 인쇄가 안 됨. 흔히 **"인쇄 눌러도 아무 반응 없음"**(작업이 큐에 잡히지도 않고 사라짐).
- Windows 상에서는 프린터가 **"준비됨/Normal"** 으로 멀쩡하게 표시됨 → 더 헷갈림.
- 프린터 이름 끝에 **`(2)`, `(5)`** 같은 숫자가 붙어 있음 = 같은 프린터가 여러 번 재생성된 흔적.

## 원인 (핵심)
프린터가 **WSD(Web Services for Devices) 자동검색** 방식으로 연결돼 있을 때 발생.
- WSD는 프린터를 **IP가 아니라 동적 검색**으로 찾음.
- 복합기가 **DHCP로 IP가 바뀌거나** 절전/네트워크 변동이 생기면 검색 연결이 끊김.
- 그런데 **스풀러는 캐시된 "Normal" 상태를 계속 표시** → OS 진단상 전부 정상으로 보이는데 실제 인쇄만 안 됨.
- 드라이버가 **"Microsoft IPP Class Driver" + `WSD-xxxx` 포트**면 이 케이스 확정.
- IPP(631)까지 닫혀 있으면 "기존 IPP 드라이버를 고정 IP로 재활용"하는 간편책도 불가 → RAW 재등록이 유일.

## 진단 절차 (PowerShell, WSL에서 `powershell.exe`로)
```powershell
# 1) OS 레벨 — 거의 항상 전부 "정상"으로 나옴(함정)
Get-Service Spooler                              # Running
Get-Printer | ft Name,PrinterStatus,PortName     # WSD-xxxx 포트 + (n) 접미사 확인
Get-Printer | % { Get-PrintJob -PrinterName $_.Name }   # 멈춘 작업 없음

# 2) 드라이버/포트 매핑 — Microsoft IPP Class Driver + WSD 포트면 이 패턴
Get-Printer | ft Name,DriverName,PortName

# 3) 실제 복합기 IP 찾기 (WSD엔 IP가 안 들어있음) — 서브넷에서 9100 스캔
#    scan-printers.ps1: 10.51.90.0/24에 TCP 9100(RAW) 열린 호스트 찾기
# 4) 모델 식별
#    - MAC OUI: 00:C0:EE / 00:17:C8 / D4:F0:C9 = Kyocera  (Get-NetNeighbor -IPAddress <ip>)
#    - IPP(631) 열려 있으면 Get-Printer-Attributes로 printer-make-and-model 직접 조회 (가장 확실)
#    - HTTP Server 헤더 'KM-MFP' = Kyocera
#    - SNMP(161)는 복합기에서 꺼둔 경우 많음(타임아웃) → IPP/OUI로 판별
```
⚠️ **함정: "살아있는 같은 브랜드 기기"를 덥석 잡지 말 것.** 한 건물에 동일 모델이 여러 대면 엉뚱한 기기(예: 교무부 복합기)를 잡는다. **반드시 IPP 모델 조회로 정확한 모델을 확정**하고, **테스트 페이지가 사용자 자리 기기에서 실제로 나오는지 물리 확인** 후 기존 것 정리.

## 해결 — 고정 IP 표준 TCP/IP(RAW 9100) + 정품 드라이버 (관리자 권한 필요)
```powershell
# (드라이버 없으면) 정품 KX Universal 드라이버 ZIP 받아서 staging
#   Kyocera 공식: KX_Print_Driver_zip.download.zip (약 236MB)
#   Expand-Archive → 64bit/OEMSETUP.INF 에서 모델명 추출:
#   grep '"[^"]*<모델>[^"]*"[[:space:]]*=' OEMSETUP.INF  → 예: "Kyocera TASKalfa 3554ci KX"
pnputil.exe /add-driver "...\64bit\OEMSETUP.INF" /install   # 드라이버 저장소에 등록
Add-PrinterDriver -Name 'Kyocera TASKalfa 3554ci KX'

Add-PrinterPort  -Name "TCPIP_10.51.90.44" -PrinterHostAddress "10.51.90.44"   # RAW 9100 기본
Add-Printer      -Name "Kyocera TASKalfa 3554ci (LAN)" -DriverName 'Kyocera TASKalfa 3554ci KX' -PortName "TCPIP_10.51.90.44"

# 테스트 인쇄 → 물리 확인 후
(Get-CimInstance Win32_Printer -Filter "Name='Kyocera TASKalfa 3554ci (LAN)'").SetDefaultPrinter  # 기본 지정 (PrintTestPage로 테스트)
Remove-Printer -Name "Kyocera TASKalfa 3554ci (5)"   # 죽은 WSD 복사본 제거
```
- 비관리자 PowerShell이면 `Start-Process powershell -Verb RunAs -ArgumentList ...`로 UAC 띄워 실행. 결과는 로그 파일로 떨궈서 호출 측에서 읽기.
- INF 모델명 추출 시 정규식이 하드웨어ID 줄을 잘못 잡을 수 있음 → `"..."=Section,HWID` 형식의 **따옴표 모델명**만 정확히 매칭.

## 🔑 재발 방지 (진짜 근본)
RAW 포트도 **IP가 고정이어야** 안 깨짐. 전산 담당에게 복합기 **MAC에 DHCP 고정 예약(reservation)** 또는 복합기 정적 IP 설정을 요청. 안 그러면 다음 DHCP 갱신 때 또 끊긴다.

## 관련
- [[tailwind-merge-bg-conflict]] 와 무관 — 별개 프린터 이슈.
- 동일 패턴: 4012i 등 다른 WSD 프린터도 잠재적으로 같은 증상 가능.
