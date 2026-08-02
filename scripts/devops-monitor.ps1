<#
.SYNOPSIS
    DevOps Monitor - stack management for Windows.

.DESCRIPTION
    PowerShell equivalent of scripts/devops-monitor.sh. The repository previously
    shipped bash scripts only, which cannot be run on a stock Windows machine.

    In addition to the bash script's commands this adds:
      init-env  - generate a .env with strong secrets
      verify    - run lint, type-check, tests and build
      probe     - add an HTTP uptime probe target without editing YAML by hand

.PARAMETER Command
    The action to run. Use 'help' to list all commands.

.EXAMPLE
    .\scripts\devops-monitor.ps1 init-env
    .\scripts\devops-monitor.ps1 start
    .\scripts\devops-monitor.ps1 probe -Url https://example.com
#>

[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [ValidateSet(
        'start', 'stop', 'restart', 'status', 'logs', 'clean',
        'health', 'ui', 'build-ui', 'verify', 'init-env', 'probe',
        'validate', 'help'
    )]
    [string]$Command = 'help',

    # Service name for 'logs', e.g. prometheus.
    [string]$Service,

    # URL for 'probe'.
    [string]$Url,

    # Blackbox module for 'probe'.
    [string]$Module = 'https_2xx',

    # Skip the confirmation prompt for 'clean'.
    [switch]$Force
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$UiDir = Join-Path $ProjectRoot 'ui-next'
$ComposeFile = Join-Path $ProjectRoot 'docker-compose.yml'
$EnvFile = Join-Path $ProjectRoot '.env'
$AlertmanagerWebhookTokenFile = Join-Path $ProjectRoot 'alertmanager/webhook_token'

function Write-Ok      { param([string]$Message) Write-Host "[ OK ] $Message"   -ForegroundColor Green }
function Write-Warn    { param([string]$Message) Write-Host "[WARN] $Message"   -ForegroundColor Yellow }
function Write-Err     { param([string]$Message) Write-Host "[FAIL] $Message"   -ForegroundColor Red }
function Write-Info    { param([string]$Message) Write-Host "[INFO] $Message"   -ForegroundColor Cyan }
function Write-Section { param([string]$Message) Write-Host "`n=== $Message ===" -ForegroundColor Magenta }

function Test-Command {
    param([Parameter(Mandatory)][string]$Name)
    return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

function Assert-Docker {
    if (-not (Test-Command 'docker')) {
        throw 'Docker is not installed or not on PATH. Install Docker Desktop: https://docs.docker.com/desktop/install/windows-install/'
    }

    # `docker compose version` fails when the daemon is unreachable, which is a
    # far more common problem on Windows than a missing plugin.
    docker compose version *>$null
    if ($LASTEXITCODE -ne 0) {
        throw 'Cannot talk to Docker. Start Docker Desktop and wait for it to report "Engine running".'
    }
}

function Assert-Node {
    if (-not (Test-Command 'node')) { throw 'Node.js is not installed. Install from https://nodejs.org/' }
    if (-not (Test-Command 'npm'))  { throw 'npm is not installed.' }
}

function Assert-ComposeFile {
    if (-not (Test-Path $ComposeFile)) {
        throw "docker-compose.yml not found at $ComposeFile"
    }
}

function New-Secret {
    # 32 random bytes, base64 encoded - same shape as `openssl rand -base64 32`.
    $bytes = [byte[]]::new(32)
    [System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
    return [Convert]::ToBase64String($bytes)
}

function Get-EnvFileValue {
    param([Parameter(Mandatory)][string]$Name)

    if (-not (Test-Path $EnvFile)) { return $null }

    $line = Get-Content -Path $EnvFile | Where-Object {
        $_ -match "^\s*$([regex]::Escape($Name))\s*="
    } | Select-Object -Last 1

    if (-not $line) { return $null }

    $value = ($line -replace "^\s*$([regex]::Escape($Name))\s*=\s*", '').Trim()
    if ($value.Length -ge 2 -and (
        ($value.StartsWith('"') -and $value.EndsWith('"')) -or
        ($value.StartsWith("'") -and $value.EndsWith("'"))
    )) {
        $value = $value.Substring(1, $value.Length - 2)
    }

    return $value
}

function Sync-AlertmanagerWebhookToken {
    param([string]$Token = (Get-EnvFileValue -Name 'ALERT_WEBHOOK_TOKEN'))

    if ([string]::IsNullOrWhiteSpace($Token)) {
        throw 'ALERT_WEBHOOK_TOKEN is missing or empty. Delete .env and run init-env, or add a generated value before starting the stack.'
    }

    $directory = Split-Path -Parent $AlertmanagerWebhookTokenFile
    New-Item -ItemType Directory -Path $directory -Force | Out-Null
    [System.IO.File]::WriteAllText(
        $AlertmanagerWebhookTokenFile,
        "$Token`n",
        [System.Text.UTF8Encoding]::new($false)
    )
    Write-Ok "Wrote $AlertmanagerWebhookTokenFile"
}
function Invoke-Compose {
    param([Parameter(Mandatory)][string[]]$Arguments)

    Assert-Docker
    Assert-ComposeFile
    Push-Location $ProjectRoot
    try {
        & docker compose @Arguments
        if ($LASTEXITCODE -ne 0) {
            throw "docker compose $($Arguments -join ' ') failed with exit code $LASTEXITCODE"
        }
    } finally {
        Pop-Location
    }
}

function Initialize-Environment {
    Write-Section 'Generating .env'

    if (Test-Path $EnvFile) {
        Write-Warn ".env already exists at $EnvFile - leaving it untouched."
        Sync-AlertmanagerWebhookToken
        Write-Info 'The Alertmanager credential file has been synchronized from the existing .env token.'
        return
    }

    $nextAuthSecret = New-Secret
    $alertWebhookToken = New-Secret

    $content = @"
# Generated by scripts/devops-monitor.ps1 on $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
# Keep this file out of version control.

# Signing key for dashboard sessions. Required - the stack refuses to start
# without it rather than falling back to a publicly known default.
NEXTAUTH_SECRET=$nextAuthSecret
NEXTAUTH_URL=http://localhost:4000

# Shared secret Alertmanager must present to POST /api/notifications/webhook.
# Alertmanager reads the matching value from alertmanager/webhook_token.
ALERT_WEBHOOK_TOKEN=$alertWebhookToken

# Grafana admin credentials.
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=$(New-Secret)

# How long Prometheus keeps samples.
PROMETHEUS_RETENTION_TIME=200h
"@

    Set-Content -Path $EnvFile -Value $content -Encoding UTF8
    Sync-AlertmanagerWebhookToken -Token $alertWebhookToken
    Write-Ok "Wrote $EnvFile with freshly generated secrets."
    Write-Warn 'The generated Grafana password is in that file - change it if you prefer something memorable.'
}

function Assert-EnvReady {
    if ($env:NEXTAUTH_SECRET) { return }

    if (-not (Test-Path $EnvFile)) {
        throw "No .env found and NEXTAUTH_SECRET is not set. Run: .\scripts\devops-monitor.ps1 init-env"
    }

    if (-not (Select-String -Path $EnvFile -Pattern '^\s*NEXTAUTH_SECRET\s*=\s*\S' -Quiet)) {
        throw "NEXTAUTH_SECRET is missing from $EnvFile. Add it, or delete the file and run init-env."
    }
}

function Start-Stack {
    Write-Section 'Starting the monitoring stack'
    Assert-EnvReady
    Invoke-Compose @('up', '-d')

    Write-Ok 'Stack started.'
    Write-Host ''
    Write-Info 'Endpoints:'
    Write-Host '   Dashboard          http://localhost:4000'
    Write-Host '   Grafana            http://localhost:3000'
    Write-Host '   Prometheus         http://localhost:9090'
    Write-Host '   Loki               http://localhost:3100'
    Write-Host '   Alertmanager       http://localhost:9093'
    Write-Host '   cAdvisor           http://localhost:8080'
    Write-Host '   Node Exporter      http://localhost:9100'
    Write-Host '   Blackbox Exporter  http://localhost:9115'
    Write-Host ''
    Write-Info 'Containers need a moment to pass their healthchecks. Run "status" to watch.'
}

function Stop-Stack {
    Write-Section 'Stopping the monitoring stack'
    Invoke-Compose @('down')
    Write-Ok 'Stack stopped.'
}

function Show-Status {
    Write-Section 'Container status'
    Invoke-Compose @('ps')

    Write-Section 'Dashboard health'
    try {
        $response = Invoke-RestMethod -Uri 'http://localhost:4000/api/health' -TimeoutSec 10
        Write-Ok "Dashboard is up. Upstreams: $($response.upstreamStatus)"

        if ($response.PSObject.Properties.Name -contains 'services') {
            $response.services |
                Select-Object name, status, responseTime |
                Format-Table -AutoSize
        }
    } catch {
        Write-Warn "Could not reach http://localhost:4000/api/health - $($_.Exception.Message)"
    }
}

function Show-Logs {
    Write-Section 'Logs (Ctrl+C to exit)'
    if ($Service) {
        Invoke-Compose @('logs', '-f', '--tail', '100', $Service)
    } else {
        Invoke-Compose @('logs', '-f', '--tail', '100')
    }
}

function Remove-Stack {
    Write-Section 'Removing containers, networks and volumes'
    Write-Warn 'This deletes all collected metrics, logs, dashboards and alert state.'

    if (-not $Force) {
        $answer = Read-Host 'Type DELETE to confirm'
        if ($answer -ne 'DELETE') {
            Write-Info 'Cancelled - nothing was removed.'
            return
        }
    }

    Invoke-Compose @('down', '-v', '--remove-orphans')
    Write-Ok 'Cleanup complete.'
}

function Invoke-HealthCheck {
    Write-Section 'Health check'

    $targets = [ordered]@{
        'Dashboard'         = 'http://localhost:4000/api/health'
        'Prometheus'        = 'http://localhost:9090/-/healthy'
        'Grafana'           = 'http://localhost:3000/api/health'
        'Loki'              = 'http://localhost:3100/ready'
        'Alertmanager'      = 'http://localhost:9093/-/healthy'
        'Node Exporter'     = 'http://localhost:9100/metrics'
        'cAdvisor'          = 'http://localhost:8080/healthz'
        'Blackbox Exporter' = 'http://localhost:9115/-/healthy'
    }

    $failed = 0
    foreach ($entry in $targets.GetEnumerator()) {
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        try {
            $null = Invoke-WebRequest -Uri $entry.Value -TimeoutSec 5 -UseBasicParsing
            $stopwatch.Stop()
            Write-Ok ('{0,-18} {1}ms' -f $entry.Key, $stopwatch.ElapsedMilliseconds)
        } catch {
            $stopwatch.Stop()
            $failed++
            Write-Err ('{0,-18} unreachable ({1})' -f $entry.Key, $entry.Value)
        }
    }

    Write-Host ''
    if ($failed -eq 0) {
        Write-Ok 'Every endpoint responded.'
    } else {
        Write-Warn "$failed endpoint(s) did not respond. Run 'logs' to investigate."
    }
}

function Start-Ui {
    Write-Section 'Starting the dashboard dev server'
    Assert-Node

    Push-Location $UiDir
    try {
        if (-not (Test-Path (Join-Path $UiDir 'node_modules'))) {
            Write-Info 'Installing dependencies...'
            npm install
            if ($LASTEXITCODE -ne 0) { throw 'npm install failed' }
        }

        Write-Info 'Dashboard will be available at http://localhost:4000'
        npm run dev -- -p 4000
    } finally {
        Pop-Location
    }
}

function Build-Ui {
    Write-Section 'Building the dashboard'
    Assert-Node

    Push-Location $UiDir
    try {
        if (-not (Test-Path (Join-Path $UiDir 'node_modules'))) {
            npm install
            if ($LASTEXITCODE -ne 0) { throw 'npm install failed' }
        }
        npm run build
        if ($LASTEXITCODE -ne 0) { throw 'Build failed' }
        Write-Ok 'Build complete (.next/).'
    } finally {
        Pop-Location
    }
}

function Invoke-Verify {
    Write-Section 'Verifying the dashboard'
    Assert-Node

    Push-Location $UiDir
    try {
        if (-not (Test-Path (Join-Path $UiDir 'node_modules'))) {
            npm install
            if ($LASTEXITCODE -ne 0) { throw 'npm install failed' }
        }

        foreach ($step in @('lint', 'type-check', 'test', 'build')) {
            Write-Info "npm run $step"
            npm run $step
            if ($LASTEXITCODE -ne 0) { throw "npm run $step failed" }
            Write-Ok "$step passed"
        }
    } finally {
        Pop-Location
    }

    Write-Ok 'All checks passed.'
}

function Add-Probe {
    Write-Section 'Adding an uptime probe'

    if (-not $Url) {
        throw 'Provide the endpoint to probe, e.g. -Url https://example.com'
    }

    $parsed = $null
    if (-not [System.Uri]::TryCreate($Url, [System.UriKind]::Absolute, [ref]$parsed) -or
        $parsed.Scheme -notin @('http', 'https')) {
        throw "'$Url' is not an absolute http(s) URL."
    }

    $targetFile = Join-Path $ProjectRoot 'prometheus/targets/http-probes.yml'
    if (-not (Test-Path $targetFile)) {
        throw "Target file not found: $targetFile"
    }

    if (Select-String -Path $targetFile -Pattern ([regex]::Escape($Url)) -Quiet) {
        Write-Warn "$Url is already listed in http-probes.yml - nothing to do."
        return
    }

    # Single-quoted YAML scalar; doubling any quote is the correct escape.
    $escapedUrl = $Url.Replace("'", "''")
    $block = @"

- targets:
    - '$escapedUrl'
  labels:
    module: $Module
"@

    Add-Content -Path $targetFile -Value $block -Encoding UTF8
    Write-Ok "Added $Url (module: $Module) to prometheus/targets/http-probes.yml"
    Write-Info 'Prometheus reloads target files every 30s - no restart needed.'
    Write-Info 'Check it under Status > Targets, job "blackbox-http".'
}

function Invoke-Validate {
    Write-Section 'Validating configuration'
    Assert-Docker

    Push-Location $ProjectRoot
    try {
        Write-Info 'Prometheus config and rules'
        docker run --rm -v "${ProjectRoot}\prometheus:/etc/prometheus:ro" `
            --entrypoint promtool prom/prometheus:v2.45.0 `
            check config /etc/prometheus/prometheus.yml
        if ($LASTEXITCODE -ne 0) { throw 'promtool reported a problem' }
        Write-Ok 'Prometheus configuration is valid'

        Write-Info 'Alertmanager config'
        docker run --rm -v "${ProjectRoot}\alertmanager:/etc/alertmanager:ro" `
            --entrypoint amtool prom/alertmanager:v0.25.0 `
            check-config /etc/alertmanager/config.yml
        if ($LASTEXITCODE -ne 0) { throw 'amtool reported a problem' }
        Write-Ok 'Alertmanager configuration is valid'

        Write-Info 'Compose files'
        docker compose config *>$null
        if ($LASTEXITCODE -ne 0) { throw 'docker compose config failed' }
        Write-Ok 'Compose configuration is valid'
    } finally {
        Pop-Location
    }
}

function Show-Help {
    Write-Host ''
    Write-Host 'DevOps Monitor - stack management (Windows)' -ForegroundColor Magenta
    Write-Host ''
    Write-Host 'Usage: .\scripts\devops-monitor.ps1 <command> [options]'
    Write-Host ''
    Write-Host 'Commands:'
    Write-Host '  init-env    Create .env with freshly generated secrets'
    Write-Host '  start       Start the full stack'
    Write-Host '  stop        Stop the stack'
    Write-Host '  restart     Stop then start'
    Write-Host '  status      Container status plus dashboard health'
    Write-Host '  logs        Follow logs (-Service <name> for one service)'
    Write-Host '  health      Probe every published endpoint'
    Write-Host '  clean       Remove containers, networks and volumes (-Force to skip prompt)'
    Write-Host '  ui          Run the dashboard dev server'
    Write-Host '  build-ui    Production build of the dashboard'
    Write-Host '  verify      lint + type-check + tests + build'
    Write-Host '  probe       Add an uptime target (-Url <url> [-Module <module>])'
    Write-Host '  validate    Check Prometheus/Alertmanager/Compose config with promtool and amtool'
    Write-Host '  help        This message'
    Write-Host ''
    Write-Host 'Examples:'
    Write-Host '  .\scripts\devops-monitor.ps1 init-env'
    Write-Host '  .\scripts\devops-monitor.ps1 start'
    Write-Host '  .\scripts\devops-monitor.ps1 logs -Service prometheus'
    Write-Host '  .\scripts\devops-monitor.ps1 probe -Url https://my-app.example.com -Module https_2xx'
    Write-Host ''
}

try {
    switch ($Command) {
        'init-env'  { Initialize-Environment }
        'start'     { Start-Stack }
        'stop'      { Stop-Stack }
        'restart'   { Stop-Stack; Start-Stack }
        'status'    { Show-Status }
        'logs'      { Show-Logs }
        'clean'     { Remove-Stack }
        'health'    { Invoke-HealthCheck }
        'ui'        { Start-Ui }
        'build-ui'  { Build-Ui }
        'verify'    { Invoke-Verify }
        'probe'     { Add-Probe }
        'validate'  { Invoke-Validate }
        default     { Show-Help }
    }
} catch {
    Write-Err $_.Exception.Message
    exit 1
}
