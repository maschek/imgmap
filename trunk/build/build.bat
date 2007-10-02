@echo off
echo Building imgmap...
echo 1. Compressing source
call compress.bat
echo 2. Creating TinyMCE package
cscript.exe build_tiny.js
echo Build done.
