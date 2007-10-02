/**
 *	Building script for TinyMCE imgmap plugin
 *	@author	adam
 *	@date	02-10-2007 12:35:39
 */

WScript.Echo("Creating TinyMCE package...");

var FSO = WScript.CreateObject("Scripting.FileSystemObject");
FSO.DeleteFolder("..\\temp\\*", true);
FSO.CopyFolder("..\\examples\\example3_files\\tinymce\\jscripts\\tiny_mce\\plugins\\imgmap\\css", "..\\temp\\css");
FSO.CopyFolder("..\\examples\\example3_files\\tinymce\\jscripts\\tiny_mce\\plugins\\imgmap\\images", "..\\temp\\images");
FSO.CopyFolder("..\\examples\\example3_files\\tinymce\\jscripts\\tiny_mce\\plugins\\imgmap\\jscripts", "..\\temp\\jscripts");
FSO.CopyFolder("..\\examples\\example3_files\\tinymce\\jscripts\\tiny_mce\\plugins\\imgmap\\langs", "..\\temp\\langs");
FSO.CreateFolder("..\\temp\\licenses");
FSO.CopyFolder("..\\licenses\\excanvas", "..\\temp\\licenses\\excanvas");
FSO.DeleteFolder("..\\temp\\css\\.svn", true);
FSO.DeleteFolder("..\\temp\\images\\.svn", true);
FSO.DeleteFolder("..\\temp\\jscripts\\.svn", true);
FSO.DeleteFolder("..\\temp\\langs\\.svn", true);
FSO.DeleteFolder("..\\temp\\licenses\\excanvas\\.svn", true);

FSO.CopyFile  ("..\\examples\\example3_files\\tinymce\\jscripts\\tiny_mce\\plugins\\imgmap\\popup.html", "..\\temp\\");
FSO.CopyFile  ("..\\examples\\example3_files\\tinymce\\jscripts\\tiny_mce\\plugins\\imgmap\\editor_plugin.js", "..\\temp\\");

//copy imgmap in place
FSO.CopyFile  ("..\\imgmap.js", "..\\temp\\jscripts\\");
FSO.CopyFile  ("..\\imgmap_packed.js", "..\\temp\\jscripts\\");

//copy other files
FSO.CopyFile  ("..\\changelog", "..\\temp\\");
FSO.CopyFile  ("..\\license_GPL.txt", "..\\temp\\");


WScript.Echo("Folder structure created...");

//alter imgmap reference
var fp = FSO.OpenTextFile("..\\temp\\popup.html", 1);
var data = fp.ReadAll();
var r = new RegExp("asd", "i");
//WScript.Echo(r.Pattern);
//WScript.Echo(data.Replace("all a’s are replaced", "X"));

//Replace("aaa", "imgmap.js", "jscripts_imgmap.js");
//WScript.Echo("File contents = '" + data + "'");
fp.Close();
//not working yet

//make zip
WScript.Echo("Creating ZIP file...");
//not working yet


  
WScript.Echo("Done creating TinyMCE package");
