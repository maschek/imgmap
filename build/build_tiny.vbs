'
'	Building script for TinyMCE imgmap plugin
'	@author	adam
'	@date	02-10-2007 12:35:39
'

WScript.Echo("Creating TinyMCE package...")

set FSO = WScript.CreateObject("Scripting.FileSystemObject")

FSO.DeleteFolder "..\\temp\\*", true
FSO.CopyFolder "..\\examples\\example3_files\\tinymce\\jscripts\\tiny_mce\\plugins\\imgmap\\css", "..\\temp\\css"
FSO.CopyFolder "..\\examples\\example3_files\\tinymce\\jscripts\\tiny_mce\\plugins\\imgmap\\images", "..\\temp\\images"
FSO.CopyFolder "..\\examples\\example3_files\\tinymce\\jscripts\\tiny_mce\\plugins\\imgmap\\jscripts", "..\\temp\\jscripts"
FSO.CopyFolder "..\\examples\\example3_files\\tinymce\\jscripts\\tiny_mce\\plugins\\imgmap\\langs", "..\\temp\\langs"
FSO.CreateFolder "..\\temp\\licenses"
FSO.CopyFile "..\\licenses\\excanvas.txt.", "..\\temp\\licenses\\"

'delete svn files if exist
FSO.DeleteFolder "..\\temp\\css\\.svn", true
FSO.DeleteFolder "..\\temp\\images\\.svn", true
FSO.DeleteFolder "..\\temp\\jscripts\\.svn", true
FSO.DeleteFolder "..\\temp\\langs\\.svn", true
'FSO.DeleteFolder "..\\temp\\licenses\\.svn", true

FSO.CopyFile "..\\examples\\example3_files\\tinymce\\jscripts\\tiny_mce\\plugins\\imgmap\\popup.html", "..\\temp\\"
FSO.CopyFile "..\\examples\\example3_files\\tinymce\\jscripts\\tiny_mce\\plugins\\imgmap\\editor_plugin.js", "..\\temp\\"
FSO.CopyFile "..\\examples\\example3_files\\tinymce\\jscripts\\tiny_mce\\plugins\\imgmap\\install.txt", "..\\temp\\"

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
r.Pattern    = "../../../../../../../imgmap.js"
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
zipname = "plugin_tinymce" & WshSysEnv("IMGMAP_BUILDNO") & ".zip"
WScript.Echo("Creating ZIP file...")
set oZip = CreateObject("XStandard.Zip")
oZip.Pack "..\\temp\\*", "..\\" & zipname
Set oZip = Nothing

'clean up temp folder
FSO.DeleteFolder "..\\temp\\*", true

  
WScript.Echo("Done creating TinyMCE package as " & zipname)
