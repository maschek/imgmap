@echo off
echo Building imgmap...
echo 1. Preparing new release
cscript.exe build_release.vbs

echo 2. Compressing source
call compress.bat

echo 3. Creating TinyMCE package
cscript.exe build_tiny.vbs

echo 4. Creating FCKEditor package
rem cscript.exe build_fck.js

echo Build done.
