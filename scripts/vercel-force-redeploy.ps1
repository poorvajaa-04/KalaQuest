param(
    # Use "git" to trigger a Vercel Deploy Hook so Vercel rebuilds from GitHub.
    # Use "manual" to deploy the current local checkout to production with Vercel CLI.
    [ValidateSet("git", "manual")]
    [string]$Mode = "git",

    # Production branch that should be live on Vercel.
    [string]$Branch = "main",

    # Vercel Deploy Hook URL for the Git-based path.
    [string]$DeployHookUrl = $env:VERCEL_DEPLOY_HOOK_URL,

    # Vercel token used for CLI commands and API verification.
    [string]$VercelToken = $env:VERCEL_TOKEN,

    # Optional Vercel project name for nicer "vercel list" output.
    [string]$ProjectName = $env:VERCEL_PROJECT_NAME,

    # Production site URL to verify after deploy.
    [string]$LiveUrl = $env:VERCEL_LIVE_SITE_URL,

    # Skip `git fetch origin <branch>` when you already know refs are current.
    [switch]$SkipFetch
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Require-Command {
    param([string]$Name)
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Required command '$Name' was not found in PATH."
    }
}

function Invoke-Tool {
    param(
        [string]$FilePath,
        [string[]]$Arguments,
        [switch]$ReturnStdOut
    )

    $output = & $FilePath @Arguments 2>&1
    $exitCode = $LASTEXITCODE

    if ($exitCode -ne 0) {
        $joinedArgs = $Arguments -join " "
        $message = ($output | Out-String).Trim()
        throw "$FilePath $joinedArgs failed with exit code $exitCode.`n$message"
    }

    $text = ($output | Out-String).Trim()

    if ($ReturnStdOut) {
        return $text
    }

    if ($text) {
        Write-Host $text
    }
}

function Normalize-DeploymentTarget {
    param([string]$Value)

    if ([string]::IsNullOrWhiteSpace($Value)) {
        return $null
    }

    $normalized = $Value.Trim()
    $normalized = $normalized -replace "^https?://", ""
    $normalized = $normalized.TrimEnd("/")
    return $normalized
}

function Get-ProductionCheckUrl {
    param([string]$Value)

    if ([string]::IsNullOrWhiteSpace($Value)) {
        return $null
    }

    if ($Value -match "^https?://") {
        return $Value.TrimEnd("/")
    }

    return "https://$($Value.TrimEnd('/'))"
}

function Get-VercelDeploymentInfo {
    param(
        [string]$DeploymentTarget,
        [string]$Token
    )

    if (-not $DeploymentTarget) {
        throw "A deployment target is required for Vercel API inspection."
    }

    if (-not $Token) {
        throw "A Vercel token is required for API inspection."
    }

    $encodedTarget = [System.Uri]::EscapeDataString($DeploymentTarget)
    $headers = @{ Authorization = "Bearer $Token" }
    $uri = "https://api.vercel.com/v13/deployments/$encodedTarget?withGitRepoInfo=true"
    return Invoke-RestMethod -Method Get -Uri $uri -Headers $headers
}

function Wait-ForLiveCommit {
    param(
        [string]$DeploymentTarget,
        [string]$ExpectedSha,
        [string]$Token,
        [int]$Attempts = 30,
        [int]$DelaySeconds = 10
    )

    Write-Step "Polling Vercel until $DeploymentTarget reflects commit $($ExpectedSha.Substring(0, 7))"

    $lastInfo = $null

    for ($attempt = 1; $attempt -le $Attempts; $attempt++) {
        $lastInfo = Get-VercelDeploymentInfo -DeploymentTarget $DeploymentTarget -Token $Token
        $readyState = $lastInfo.readyState
        $currentSha = if ($lastInfo.meta) { $lastInfo.meta.githubCommitSha } else { $null }
        $deploymentUrl = if ($lastInfo.url) { "https://$($lastInfo.url)" } else { "(unknown deployment url)" }

        Write-Host "Attempt $attempt/${Attempts}: readyState=$readyState deployment=$deploymentUrl commit=$currentSha"

        if ($readyState -eq "READY" -and ($currentSha -eq $ExpectedSha -or [string]::IsNullOrWhiteSpace($currentSha))) {
            return $lastInfo
        }

        Start-Sleep -Seconds $DelaySeconds
    }

    return $lastInfo
}

function Test-LiveUrl {
    param([string]$Url)

    if (-not $Url) {
        return
    }

    Write-Step "Requesting $Url"
    $response = Invoke-WebRequest -Uri $Url -MaximumRedirection 5
    Write-Host "HTTP $($response.StatusCode) from $Url"
}

Require-Command -Name "git"
Require-Command -Name "npx"

$repoRoot = Invoke-Tool -FilePath "git" -Arguments @("rev-parse", "--show-toplevel") -ReturnStdOut
Set-Location $repoRoot

$liveTarget = Normalize-DeploymentTarget -Value $LiveUrl
$liveCheckUrl = Get-ProductionCheckUrl -Value $LiveUrl

Write-Step "Checking Git state"

if (-not $SkipFetch) {
    Invoke-Tool -FilePath "git" -Arguments @("fetch", "origin", $Branch, "--prune")
}

$localBranch = Invoke-Tool -FilePath "git" -Arguments @("rev-parse", "--abbrev-ref", "HEAD") -ReturnStdOut
$localSha = Invoke-Tool -FilePath "git" -Arguments @("rev-parse", "HEAD") -ReturnStdOut
$remoteRef = "origin/$Branch"
$remoteSha = Invoke-Tool -FilePath "git" -Arguments @("rev-parse", $remoteRef) -ReturnStdOut
$workingTree = Invoke-Tool -FilePath "git" -Arguments @("status", "--porcelain") -ReturnStdOut

Write-Host "Current branch : $localBranch"
Write-Host "Local HEAD     : $($localSha.Substring(0, 7))"
Write-Host "Remote $remoteRef : $($remoteSha.Substring(0, 7))"

switch ($Mode) {
    "git" {
        if (-not $DeployHookUrl) {
            throw "Git mode needs -DeployHookUrl or the VERCEL_DEPLOY_HOOK_URL environment variable."
        }

        Write-Step "Triggering the Vercel Deploy Hook for $remoteRef"

        try {
            $hookResponse = Invoke-RestMethod -Method Post -Uri $DeployHookUrl -ContentType "application/json"
        }
        catch {
            Write-Host "POST failed, retrying the hook with GET because Vercel hooks accept either method." -ForegroundColor Yellow
            $hookResponse = Invoke-RestMethod -Method Get -Uri $DeployHookUrl
        }

        if ($hookResponse) {
            Write-Host ($hookResponse | ConvertTo-Json -Depth 10)
        }

        if ($VercelToken -and $liveTarget) {
            $liveInfo = Wait-ForLiveCommit -DeploymentTarget $liveTarget -ExpectedSha $remoteSha -Token $VercelToken
            $liveSha = if ($liveInfo.meta) { $liveInfo.meta.githubCommitSha } else { $null }
            $readyState = $liveInfo.readyState

            if ($readyState -ne "READY") {
                throw "Vercel never reached READY for $liveTarget."
            }

            if ($liveSha -and $liveSha -ne $remoteSha) {
                throw "Vercel is still serving commit $($liveSha.Substring(0, 7)) instead of $($remoteSha.Substring(0, 7))."
            }

            Write-Host "Live deployment URL: https://$($liveInfo.url)"
        }
        else {
            Write-Host "Skipping commit-level verification because VERCEL_TOKEN or LiveUrl is missing." -ForegroundColor Yellow
        }

        if ($VercelToken) {
            Write-Step "Recent production deployments"
            if ($ProjectName) {
                Invoke-Tool -FilePath "npx" -Arguments @("--yes", "vercel@latest", "list", $ProjectName, "--prod", "--token", $VercelToken)
            }
            else {
                Invoke-Tool -FilePath "npx" -Arguments @("--yes", "vercel@latest", "list", "--prod", "--token", $VercelToken)
            }
        }

        if ($liveCheckUrl) {
            Test-LiveUrl -Url $liveCheckUrl
        }
    }

    "manual" {
        if ($localBranch -ne $Branch) {
            throw "Manual mode must be run from branch '$Branch'. Current branch: '$localBranch'."
        }

        if ($workingTree) {
            throw "Working tree is not clean. Commit or stash local changes before manual deploy so production matches GitHub."
        }

        if ($localSha -ne $remoteSha) {
            throw "Local HEAD does not match $remoteRef. Pull the latest commit before manual deployment."
        }

        if (-not $VercelToken) {
            throw "Manual mode needs -VercelToken or the VERCEL_TOKEN environment variable."
        }

        if (-not (Test-Path ".vercel/project.json")) {
            throw "This repo is not linked to Vercel yet. Run 'npx vercel link' once, then re-run this script."
        }

        Write-Step "Pulling Vercel production settings"
        Invoke-Tool -FilePath "npx" -Arguments @("--yes", "vercel@latest", "pull", "--yes", "--environment=production", "--token", $VercelToken)

        Write-Step "Building with the Vercel builder"
        Invoke-Tool -FilePath "npx" -Arguments @("--yes", "vercel@latest", "build", "--prod", "--token", $VercelToken)

        Write-Step "Deploying the prebuilt output to production"
        $deployOutput = Invoke-Tool -FilePath "npx" -Arguments @(
            "--yes", "vercel@latest", "deploy",
            "--prebuilt",
            "--prod",
            "--logs",
            "--token", $VercelToken,
            "--meta", "githubCommitSha=$remoteSha",
            "--meta", "githubCommitRef=$Branch"
        ) -ReturnStdOut

        $deploymentUrl = (($deployOutput -split "`r?`n") | Where-Object { $_.Trim() } | Select-Object -Last 1).Trim()

        if (-not $deploymentUrl) {
            throw "Vercel deploy did not return a deployment URL."
        }

        Write-Host "Deployment URL: $deploymentUrl"

        Write-Step "Waiting for deployment completion"
        Invoke-Tool -FilePath "npx" -Arguments @("--yes", "vercel@latest", "inspect", $deploymentUrl, "--wait", "--timeout=10m", "--token", $VercelToken)

        Write-Step "Recent production deployments"
        if ($ProjectName) {
            Invoke-Tool -FilePath "npx" -Arguments @("--yes", "vercel@latest", "list", $ProjectName, "--prod", "--token", $VercelToken)
        }
        else {
            Invoke-Tool -FilePath "npx" -Arguments @("--yes", "vercel@latest", "list", "--prod", "--token", $VercelToken)
        }

        if ($liveCheckUrl) {
            Test-LiveUrl -Url $liveCheckUrl
        }
    }
}

Write-Step "Done"
Write-Host "Mode         : $Mode"
Write-Host "Branch       : $Branch"
Write-Host "Expected SHA : $($remoteSha.Substring(0, 7))"
if ($liveCheckUrl) {
    Write-Host "Live site    : $liveCheckUrl"
}
