'
'	Building a new release for imgmap
'	@author	adam
'	@date	27-10-2007 15:17:54
'

WScript.Echo("Building new release...")

set FSO = WScript.CreateObject("Scripting.FileSystemObject")

'get build and version number
set fp = FSO.OpenTextFile("build.data", 1)
data = fp.ReadAll()
fp.Close()

'WScript.Echo data
set r = new RegExp
r.Global     = true
r.IgnoreCase = true
r.Pattern    = "buildNumber=(\d*)"
Set myMatches = r.Execute(data)
For Each myMatch in myMatches
	buildno = myMatch.SubMatches(0)
Next
'inc buildnumber
data = r.Replace(data, "buildNumber=" & (buildno + 1))

r.Pattern    = "version=([\w\.]*)"
Set myMatches = r.Execute(data)
For Each myMatch in myMatches
	version = myMatch.SubMatches(0)
Next

'WScript.Echo data
set fp = FSO.OpenTextFile("build.data", 2)
fp.Write(data)
fp.Close()

'now we have buld and version number
WScript.Echo "Version: " & version & " (build " & buildno & ")" 


'	this.version = "2.0beta2";
'	this.buildDate = "2007-02-11";
'	this.buildNumber = "1";

'alter build number and version in final build
set fp = FSO.OpenTextFile("..\\imgmap.js", 1)
data = fp.ReadAll()
fp.Close()

'WScript.Echo data
set r = new RegExp
r.Global     = true
r.IgnoreCase = true
r.Pattern    = "this.buildNumber = ""(\d*)"""
replacement  = "this.buildNumber = """ & buildno & """"
data = r.Replace(data, replacement)
r.Pattern    = "this.buildDate = ""(.*?)"""
replacement  = "this.buildDate = """ & Date & """"
data = r.Replace(data, replacement)
r.Pattern    = "this.version = ""(.*?)"""
replacement  = "this.version = """ & version & """"
data = r.Replace(data, replacement)

'WScript.Echo data
set fp = FSO.OpenTextFile("..\\imgmap.js", 2)
fp.Write(data)
fp.Close()

'set environment variable
Set WshShell = WScript.CreateObject("WScript.Shell")
Set WshSysEnv = WshShell.Environment("SYSTEM")
WshSysEnv("IMGMAP_BUILDNO") = buildno

WScript.Echo("Done creating creating new release")

