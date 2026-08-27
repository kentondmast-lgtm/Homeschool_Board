# Run this once from an elevated PowerShell (right-click PowerShell -> "Run as administrator").
# Registers the Homeschool Board backend as an always-on Windows service and opens
# the firewall so other devices on the WiFi (the iPads) can reach it.

$ErrorActionPreference = 'Stop'

$projectDir = "C:\Users\user1\New folder"
$serverDir  = Join-Path $projectDir "server"
$node       = "C:\Program Files\nodejs\node.exe"
$nssm       = "C:\Users\user1\AppData\Local\Microsoft\WinGet\Packages\NSSM.NSSM_Microsoft.Winget.Source_8wekyb3d8bbwe\nssm-2.24-101-g897c7ad\win64\nssm.exe"
$serviceName = "HomeschoolBoard"
$port = 4000

if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Error "Please re-run this script from an elevated (Run as administrator) PowerShell window."
    exit 1
}

if (-not (Test-Path $node))  { Write-Error "Node.js not found at $node"; exit 1 }
if (-not (Test-Path $nssm))  { Write-Error "NSSM not found at $nssm"; exit 1 }

& $nssm install $serviceName $node "index.js"
& $nssm set $serviceName AppDirectory $serverDir
& $nssm set $serviceName DisplayName "Homeschool Board"
& $nssm set $serviceName Description "Homeschool Board backend - wall display + admin sync server"
& $nssm set $serviceName Start SERVICE_AUTO_START
& $nssm set $serviceName AppStdout (Join-Path $projectDir "service.log")
& $nssm set $serviceName AppStderr (Join-Path $projectDir "service.log")
& $nssm set $serviceName AppRotateFiles 1
& $nssm set $serviceName AppExit Default Restart

New-NetFirewallRule -DisplayName "Homeschool Board" -Direction Inbound -Action Allow -Protocol TCP -LocalPort $port -Profile Private -ErrorAction SilentlyContinue | Out-Null

Start-Service $serviceName

Start-Sleep -Seconds 2
Get-Service $serviceName | Format-List Name, Status, StartType

$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notmatch 'Loopback' -and $_.IPAddress -notlike '169.254.*' } | Select-Object -First 1 -ExpandProperty IPAddress)
Write-Host ""
Write-Host "Service installed and started." -ForegroundColor Green
Write-Host "Wall display URL:  http://$ip`:$port/"
Write-Host "Admin URL:         http://$ip`:$port/admin"
