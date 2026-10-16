# install.ps1 - every tool the studio uses, on Windows without WSL. Safe to run again (it skips what is there).
# The same levels and pieces as tools/install.sh (macOS, Linux, WSL); run it from PowerShell:
#
#   powershell -ExecutionPolicy Bypass -File tools\install.ps1            # core: render/captions/brand tools, Python tools, bot packages
#   powershell -ExecutionPolicy Bypass -File tools\install.ps1 video      # + HyperFrames engine check, WhisperX, persian-motion-director
#   powershell -ExecutionPolicy Bypass -File tools\install.ps1 all        # + HyperFrames skills and the NextWork editor plugin
#   powershell -ExecutionPolicy Bypass -File tools\install.ps1 check      # only report (check video / check all to require more)
#   ... -Install    also installs missing system programs with winget (Git, Node LTS, Python 3.12, ffmpeg, uv, Chrome);
#                   without it, the script prints the winget command for each one and stops.
#
# Claude Code on Windows runs its commands in Git Bash (it comes with Git): the kit's bash scripts work there, and Python
# scripts run with tools/py (Git Bash) or tools\py.cmd (PowerShell, cmd). What each piece is and its licence: tools/STACK.md.
# Nothing here needs an account or a key. This file is ASCII on purpose: Windows PowerShell 5.1 misreads UTF-8 without a BOM.
param([string]$Level = "core", [string]$Want = "", [switch]$Install)
$ErrorActionPreference = "Continue"
Set-Location (Split-Path -Parent $PSScriptRoot)
if ($Level -notin "core", "video", "all", "check") { Write-Host "usage: tools\install.ps1 [core|video|all|check [core|video|all]] [-Install]"; exit 2 }
if ($Level -eq "check") { if (-not $Want) { $Want = "core" } } else { $Want = $Level }
if ($Want -notin "core", "video", "all") { Write-Host "usage: tools\install.ps1 check [core|video|all]"; exit 2 }
$Rank = @{ core = 1; video = 2; all = 3 }
$script:Tier = "core"; $script:Missing = $false
function Ok($m) { Write-Host "  [ok] $m" -ForegroundColor Green }
function No($m) { # a missing piece counts only up to the level asked for; above it, it is listed as the next step
  if ($Rank[$script:Tier] -le $Rank[$Want]) { Write-Host "  [missing] $m" -ForegroundColor Red; $script:Missing = $true }
  else { Write-Host "  - $m (not part of ${Want}: tools\install.ps1 $($script:Tier))" -ForegroundColor DarkGray }
}
function Info($m) { Write-Host ""; Write-Host $m -ForegroundColor White }
function Has($c) { [bool](Get-Command $c -ErrorAction SilentlyContinue) }
function Refresh-Path { # programs winget just installed are on the machine PATH, not yet in this session's
  $env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User") + ";" + $env:Path
}
# a real Python 3.11+ (not the Microsoft Store shortcut "python.exe" in WindowsApps, which only opens the Store)
function Find-Python {
  foreach ($c in @(@("py", "-3"), @("python"), @("python3"))) {
    if (-not (Has $c[0])) { continue }
    $args_ = @(); if ($c.Length -gt 1) { $args_ = $c[1..($c.Length - 1)] }
    $v = & $c[0] @args_ -c "import sys; print('%d.%d' % sys.version_info[:2])" 2>$null
    if ($LASTEXITCODE -eq 0 -and $v -match '^(\d+)\.(\d+)$' -and ([int]$Matches[1] -gt 3 -or ([int]$Matches[1] -eq 3 -and [int]$Matches[2] -ge 11))) {
      return , @($c + @($v))
    }
  }
  return $null
}
function Venv-Py { $p = "tools\.venv\Scripts\python.exe"; if (Test-Path $p) { return (Resolve-Path $p).Path } return $null }

Info "1 - system"
$apps = @(
  @{ name = "git"; id = "Git.Git"; test = { Has git }; ver = { git --version } },
  @{ name = "node 20+"; id = "OpenJS.NodeJS.LTS"; test = { (Has node) -and [int](node -p "process.versions.node.split('.')[0]" 2>$null) -ge 20 }; ver = { "node " + (node -v) } },
  @{ name = "python 3.11+"; id = "Python.Python.3.12"; test = { $null -ne (Find-Python) }; ver = { "python " + (Find-Python)[-1] } },
  @{ name = "ffmpeg"; id = "Gyan.FFmpeg"; test = { Has ffmpeg }; ver = { ((ffmpeg -version) | Select-Object -First 1) } },
  @{ name = "uv"; id = "astral-sh.uv"; test = { Has uv }; ver = { uv --version } }
)
foreach ($a in $apps) {
  if (& $a.test) { Ok (& $a.ver); continue }
  if ($Install -and $Level -ne "check" -and (Has winget)) {
    Write-Host "  installing $($a.name) with winget ($($a.id))..."
    winget install --id $a.id -e --source winget | Out-Null
    Refresh-Path
    if (& $a.test) { Ok (& $a.ver) } else { No "$($a.name): winget install --id $($a.id) -e  (then open a new PowerShell window)" }
  } else { No "$($a.name) missing -> winget install --id $($a.id) -e   (or run this script with -Install)" }
}
$chrome = @("$env:ProgramFiles\Google\Chrome\Application\chrome.exe", "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
  "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe") | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
if ($chrome) { Ok "Google Chrome" }
elseif ($Install -and $Level -ne "check" -and (Has winget)) { winget install --id Google.Chrome -e --source winget | Out-Null; Ok "Google Chrome (installed)" }
else { No "Google Chrome missing -> winget install --id Google.Chrome -e  (Playwright drives the installed Chrome)" }
if ($Level -ne "check" -and $script:Missing) { Write-Host ""; Write-Host "Install the missing pieces above (or add -Install), open a new PowerShell window, then run this again."; exit 1 }

Info "2 - render, captions, brand tools (Playwright + icons)"
if ($Level -eq "check") { if (Test-Path tools\node_modules\playwright) { Ok "tools\node_modules" } else { No "tools\node_modules (tools\install.ps1)" } }
else {
  Push-Location tools; npm.cmd ci --no-audit --no-fund 2>&1 | Out-Null; if ($LASTEXITCODE -ne 0) { npm.cmd install --no-audit --no-fund 2>&1 | Out-Null }; $rc = $LASTEXITCODE; Pop-Location
  if ($rc -eq 0) { Ok "tools\node_modules" } else { No "tools\node_modules: npm install failed (cd tools; npm install)" }
}

Info "2b - Noto Color Emoji (Google, OFL; COLRv1 so Chrome draws it) -> tools\vendor\noto-emoji\"
$emo = "tools\vendor\noto-emoji"; $emoTag = "v2.051"
if (Test-Path "$emo\Noto-COLRv1.ttf") { Ok $emo }
elseif ($Level -eq "check") { No "$emo (tools\install.ps1)" }
else {
  try {
    New-Item -ItemType Directory -Force $emo | Out-Null
    $raw = "https://raw.githubusercontent.com/googlefonts/noto-emoji/$emoTag/fonts"
    Invoke-WebRequest -UseBasicParsing "$raw/Noto-COLRv1.ttf" -OutFile "$emo\Noto-COLRv1.ttf"
    Invoke-WebRequest -UseBasicParsing "$raw/LICENSE" -OutFile "$emo\OFL.txt"
    [IO.File]::WriteAllText("$PWD\$emo\font.css", "@font-face{font-family:`"Noto Color Emoji`";src:url(`"Noto-COLRv1.ttf`") format(`"truetype`");font-display:block}`n")
    Ok "$emo @ $emoTag"
  } catch { No "Noto emoji download failed (renders still work, emoji fall back to the system font)" }
}

Info "3 - Telegram bot packages (wrangler 4)"
if ($Level -eq "check") { if (Test-Path telegram-bot\node_modules) { Ok "telegram-bot\node_modules" } else { No "telegram-bot\node_modules" } }
else {
  Push-Location telegram-bot; npm.cmd ci --no-audit --no-fund 2>&1 | Out-Null; $rc = $LASTEXITCODE; Pop-Location
  if ($rc -eq 0) { Ok "telegram-bot\node_modules" } else { No "telegram-bot\node_modules: npm ci failed (cd telegram-bot; npm ci)" }
}

Info "4 - Python tools in tools\.venv (Pillow, numpy, OpenCV); run them with tools\py.cmd (PowerShell) or tools/py (Git Bash)"
$py = Venv-Py
if ($Level -eq "check") {
  if ($py) { & $py -c "import PIL, numpy, cv2" 2>$null }
  if ($py -and $LASTEXITCODE -eq 0) { Ok "tools\.venv ($(& $py --version))" } else { No "tools\.venv with Pillow, numpy, OpenCV (tools\install.ps1)" }
} else {
  if ($py) { & $py -m pip --version 2>&1 | Out-Null }
  if (-not $py -or $LASTEXITCODE -ne 0) { # none yet, or a venv made without pip
    if (Test-Path tools\.venv) { Remove-Item -Recurse -Force tools\.venv }
    if (Has uv) { uv venv -q --seed --python ">=3.11" tools\.venv 2>&1 | Out-Null }
    if (-not (Venv-Py)) { $p = Find-Python; if ($p) { $pa = @(); if ($p.Length -gt 2) { $pa = $p[1..($p.Length - 2)] }; & $p[0] @pa -m venv tools\.venv } }
    $py = Venv-Py
  }
  if ($py) { & $py -m pip install -q -r tools\requirements.txt; & $py -c "import PIL, numpy, cv2" }
  if ($py -and $LASTEXITCODE -eq 0) { Ok "tools\.venv ($(& $py --version))" } else { No "tools\.venv: could not install tools\requirements.txt (see the error above)" }
}

if ($Level -eq "core") {
  Write-Host ""
  if (-not $script:Missing) { Write-Host "Core tools ready. Video tools: powershell -ExecutionPolicy Bypass -File tools\install.ps1 video"; exit 0 }
  Write-Host "Some core pieces failed ([missing] above); fix them and run this again."; exit 1
}

$script:Tier = "video"
Info "5 - HyperFrames 0.8.46 (HTML -> MP4 engine of the video styles; Apache-2.0)"
Push-Location tools\style-reel
if ($Level -eq "check") {
  $hfv = (npx.cmd --no -- hyperframes@0.8.46 --version 2>$null | Select-Object -Last 1)
  Pop-Location
  if ($hfv -eq "0.8.46") { Ok "hyperframes $hfv" } else { No "hyperframes 0.8.46 (tools\install.ps1 video)" }
} else {
  Pop-Location
  $py = Venv-Py
  if (-not (Test-Path tools\style-reel\assets\words.js)) { & $py -X utf8 tools\style-reel\make_assets.py | Out-Null }
  if (-not (Test-Path tools\style-reel\assets\face.mp4)) { & $py -X utf8 tools\style-reel\make_demo.py | Out-Null }
  Push-Location tools\style-reel
  $hfv = (npx.cmd --yes -- hyperframes@0.8.46 --version 2>$null | Select-Object -Last 1)
  if ($hfv -ne "0.8.46") { Pop-Location; No "hyperframes 0.8.46 did not start (got `"$hfv`"): cd tools\style-reel; npx --yes hyperframes@0.8.46 --version" }
  else {
    npx.cmd --yes hyperframes@0.8.46 check 2>&1 | Out-Null; $rc = $LASTEXITCODE; Pop-Location
    if ($rc -eq 0) { Ok "hyperframes $hfv, check passed" } else { No "hyperframes check failed: cd tools\style-reel; npx --yes hyperframes@0.8.46 check" }
  }
}

Info "6 - WhisperX (word timings, forced alignment of your own SRT; BSD-2-Clause) - about 2 GB once"
$uvTools = if ($env:UV_TOOL_DIR) { $env:UV_TOOL_DIR } else { "$env:APPDATA\uv\tools" }
if ((Has whisperx) -or (Test-Path "$uvTools\whisperx\Scripts\python.exe")) { Ok "whisperx" }
elseif ($Level -eq "check") { No "whisperx (uv tool install whisperx)" }
else { uv tool install whisperx 2>&1 | Out-Null; if ($LASTEXITCODE -eq 0) { Ok "whisperx (uv tool)" } else { No "whisperx install failed: uv tool install whisperx" } }

Info "7 - persian-motion-director (Persian typography linter + motion skill; MIT) -> tools\vendor\"
$pmd = "tools\vendor\persian-motion-director"; $pmdRev = "5499640d2dfe5bedd73a8d3f1529847707be7e20"
if (Test-Path "$pmd\scripts\lint_persian.py") { Ok $pmd }
elseif ($Level -eq "check") { No $pmd }
else {
  New-Item -ItemType Directory -Force tools\vendor | Out-Null
  git clone -q https://github.com/atmirrr/persian-motion-director $pmd 2>&1 | Out-Null; git -C $pmd checkout -q $pmdRev 2>&1 | Out-Null
  if (Test-Path "$pmd\scripts\lint_persian.py") { Ok "$pmd @ $($pmdRev.Substring(0, 7))" } else { No "$pmd clone failed" }
}

if ($Level -eq "video") {
  Write-Host ""
  if (-not $script:Missing) { Write-Host "Video tools ready. Claude Code add-ons: powershell -ExecutionPolicy Bypass -File tools\install.ps1 all"; exit 0 }
  Write-Host "Some video pieces failed ([missing] above); fix them and run this again."; exit 1
}

$script:Tier = "all"
Info "8 - HyperFrames skills for Claude Code (the /hyperframes router and its core skills)"
if ($Level -eq "check") { if (Test-Path "$env:USERPROFILE\.claude\skills\hyperframes\SKILL.md") { Ok "hyperframes skills" } else { No "hyperframes skills (npx --yes hyperframes@0.8.46 skills update)" } }
else { npx.cmd --yes hyperframes@0.8.46 skills update 2>&1 | Out-Null; if ($LASTEXITCODE -eq 0) { Ok "hyperframes core skills" } else { No "npx --yes hyperframes@0.8.46 skills update" } }

Info "9 - NextWork AI video editor plugin (cut retakes and dead air, style edit; MIT)"
if (Has claude) {
  if ((claude plugin list 2>$null) -match "ai-editor") { Ok "ai-editor plugin" }
  elseif ($Level -eq "check") { No "ai-editor plugin" }
  else {
    claude plugin marketplace add nextwork-projects/ai-video-editor 2>&1 | Out-Null; claude plugin install ai-editor@nextwork 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) { Ok "ai-editor plugin (say `"set up the editor`" in Claude Code once)" } else { No "claude plugin install ai-editor@nextwork" }
  }
} else { No "Claude Code CLI not found (the plugin installs from inside Claude Code: /plugin marketplace add nextwork-projects/ai-video-editor)" }

Write-Host ""
Write-Host "Optional, not installed by this script (see tools/STACK.md): OmniVoice (voice cloning of YOUR OWN voice; Apache-2.0),"
Write-Host "OpenMontage and Recordly (AGPL-3.0: used as separate apps, never copied into this repo)."
if (-not $script:Missing) { if ($Level -eq "check") { Write-Host "Everything for the $Want level is installed." } else { Write-Host "All set." }; exit 0 }
Write-Host "Some pieces are missing ([missing] above)."; exit 1
