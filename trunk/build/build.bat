@echo off
echo Building imgmap...
echo 1. Compressing source
rem call compress.bat
echo 2. Creating TinyMCE package
cscript.exe build_tiny.vbs
echo 2. Creating FCKEditor package
rem cscript.exe build_fck.js
echo Build done.
