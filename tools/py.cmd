@echo off
rem py.cmd - runs a kit script with the Python in tools\.venv (PowerShell and cmd on Windows; Git Bash uses tools/py).
rem   tools\py.cmd tools\render\sheet.py <dir> <out.jpg>
rem -X utf8: Persian text is read, written and printed as UTF-8 although the Windows default code page is not.
if exist "%~dp0.venv\Scripts\python.exe" (
  "%~dp0.venv\Scripts\python.exe" -X utf8 %*
  exit /b %ERRORLEVEL%
)
echo tools\.venv is missing: run  powershell -ExecutionPolicy Bypass -File tools\install.ps1 1>&2
exit /b 1
