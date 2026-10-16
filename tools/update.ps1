# update.ps1 - pull the latest kit from PowerShell (Windows). The work is in tools/update.sh, run with the bash that comes
# with Git for Windows; inside Claude Code just type /update.
#   powershell -ExecutionPolicy Bypass -File tools\update.ps1
$bash = @("$env:ProgramFiles\Git\bin\bash.exe", "${env:ProgramFiles(x86)}\Git\bin\bash.exe", "$env:LOCALAPPDATA\Programs\Git\bin\bash.exe") |
  Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
if (-not $bash) { $g = Get-Command git -ErrorAction SilentlyContinue; if ($g) { $c = Join-Path (Split-Path (Split-Path $g.Source)) "bin\bash.exe"; if (Test-Path $c) { $bash = $c } } }
if (-not $bash) { Write-Host "Git for Windows not found: winget install --id Git.Git -e  (then open a new PowerShell window)"; exit 1 }
& $bash (Join-Path $PSScriptRoot "update.sh") @args
exit $LASTEXITCODE
