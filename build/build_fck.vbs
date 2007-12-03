'
'	Building script for FCKEditor imgmap plugin
'	@author	adam
'	@date	03-12-2007 22:50:48
'

WScript.Echo("Creating FCK package...")

set FSO = WScript.CreateObject("Scripting.FileSystemObject")

FSO.DeleteFolder "..\\temp\\*", true
FSO.DeleteFile   "..\\temp\\*", true

FSO.CopyFolder "..\\examples\\example6_files\\imgmap\\css", "..\\temp\\css"
FSO.CopyFolder "..\\examples\\example6_files\\imgmap\\images", "..\\temp\\images"
FSO.CopyFolder "..\\examples\\example6_files\\imgmap\\jscripts", "..\\temp\\jscripts"
FSO.CopyFolder "..\\examples\\example6_files\\imgmap\\lang", "..\\temp\\lang"
FSO.CopyFolder "..\\examples\\example6_files\\imgmap\\docs", "..\\temp\\docs"
FSO.CreateFolder "..\\temp\\licenses"
FSO.CopyFile "..\\licenses\\excanvas.txt.", "..\\temp\\licenses\\"

'delete svn files if exist
FSO.DeleteFolder "..\\temp\\css\\.svn", true
FSO.DeleteFolder "..\\temp\\images\\.svn", true
FSO.DeleteFolder "..\\temp\\jscripts\\.svn", true
FSO.DeleteFolder "..\\temp\\lang\\.svn", true
FSO.DeleteFolder "..\\temp\\docs\\.svn", true
'FSO.DeleteFolder "..\\temp\\licenses\\.svn", true

FSO.CopyFile "..\\examples\\example6_files\\imgmap\\popup.html", "..\\temp\\"
FSO.CopyFile "..\\examples\\example6_files\\imgmap\\fckplugin.js", "..\\temp\\"
FSO.CopyFile "..\\examples\\example6_files\\imgmap\\readme.html", "..\\temp\\"

'copy imgmap in place
FSO.CopyFile "..\\imgmap.js", "..\\temp\\jscripts\\"
FSO.CopyFile "..\\imgmap_packed.js", "..\\temp\\jscripts\\"

'copy other files
FSO.CopyFile "..\\changelog", "..\\temp\\"
FSO.CopyFile "..\\license_GPL.txt", "..\\temp\\"


WScript.Echo("Folder structure created...")

'alter imgmap reference
set fp = FSO.OpenTextFile("..\\temp\\popup.html", 1)
data = fp.ReadAll()
fp.Close()

'WScript.Echo data
set r = new RegExp
r.Global     = true
r.IgnoreCase = true
r.Pattern    = "../../../imgmap.js"
replacement  = "jscripts/imgmap_packed.js"
data = r.Replace(data, replacement)

'WScript.Echo data
set fp = FSO.OpenTextFile("..\\temp\\popup.html", 2)
fp.Write(data)
fp.Close()

'get environment variable
Set WshShell = WScript.CreateObject("WScript.Shell")
Set WshSysEnv = WshShell.Environment("SYSTEM")

'make zip
zipname = "plugin_fck" & WshSysEnv("IMGMAP_BUILDNO") & ".zip"
WScript.Echo("Creating ZIP file...")
set oZip = CreateObject("XStandard.Zip")
oZip.Pack "..\\temp\\*", "..\\" & zipname
Set oZip = Nothing

'clean up temp folder
FSO.DeleteFolder "..\\temp\\*", true
FSO.DeleteFile   "..\\temp\\*", true
  
WScript.Echo("Done creating FCK package as " & zipname)
