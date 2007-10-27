<cfsetting enablecfoutputonly="true">
<!---
 * FCKeditor - The text editor for Internet - http://www.fckeditor.net
 * Copyright (C) 2003-2007 Frederico Caldeira Knabben
 * 
 * == BEGIN LICENSE ==
 * 
 * Licensed under the terms of any of the following licenses at your
 * choice:
 * 
 *  - GNU General Public License Version 2 or later (the "GPL")
 *    http://www.gnu.org/licenses/gpl.html
 * 
 *  - GNU Lesser General Public License Version 2.1 or later (the "LGPL")
 *    http://www.gnu.org/licenses/lgpl.html
 * 
 *  - Mozilla Public License Version 1.1 or later (the "MPL")
 *    http://www.mozilla.org/MPL/MPL-1.1.html
 * 
 * == END LICENSE ==
 * 
 * File Name: sample02_mx.cfm
 * 	Sample page for ColdFusion MX.
 * 
 * File Authors:
 * 		Hendrik Kramer (hk@lwd.de)
 * 		Wim Lemmens (didgiman@gmail.com)
--->

<!--- ::
	  * You must set the url path to the base directory for your media files (images, flash, files)
	  * The best position for this variable is in your Application.cfm file
	  * 
	  * Possible variable scopes are:
	  * <cfset APPLICATION.userFilesPath = "/userfiles/">
	  * OR:
	  * <cfset SERVER.userFilesPath = "/userfiles/">
	  * OR:
	  * <cfset request.FCKeditor.userFilesPath = "/userfiles/">
	  * OR:
	  * <cfset application.FCKeditor.userFilesPath = "/userfiles/">
	  * OR:
	  * <cfset server.FCKeditor.userFilesPath = "/userfiles/">
	  *
	  * Note #1: Do _not_ set the physical directory on your server, only a path relative to your current webroot
	  * Note #2: Directories will be automatically created
	  :: --->

<cfoutput>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>
	<title>FCKeditor - Sample</title>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<meta name="robots" content="noindex, nofollow">
	<link href="../sample.css" rel="stylesheet" type="text/css" />
</head>
<body>
<h1>FCKeditor - ColdFusion Component (CFC) - Sample 2</h1>

This sample displays a normal HTML form with a FCKeditor with full features enabled; invoked by a ColdFusion Component.
<hr>

<form method="POST" action="#cgi.script_name#">
</cfoutput>

<cfif listFirst( server.coldFusion.productVersion ) LT 6>
	<cfoutput><br><em style="color: red;">This sample works only with a ColdFusion MX server and higher, because it uses some advantages of this version.</em></cfoutput>
	<cfabort>
</cfif>

<cfscript>
	// Calculate basepath for FCKeditor. It's in the folder right above _samples
	basePath = Left(cgi.script_name, FindNoCase('_samples', cgi.script_name)-1);

	fckEditor = createObject("component", "#basePath#fckeditor");
	fckEditor.instanceName	= "myEditor";
	fckEditor.value			= 'This is some sample text. You are using <a href="http://fckeditor.net/" target="_blank">FCKeditor</a>.';
	fckEditor.basePath		= basePath;
	fckEditor.width			= "100%";
	fckEditor.height		= 300;
	fckEditor.create(); // create the editor.
</cfscript>

<cfoutput>
<br />
<input type="submit" value="Submit">
<hr />
</cfoutput>

<cfdump 
	var="#FORM#" 
	label="Dump of FORM Variables"
>

<cfoutput></form></body></html></cfoutput>

<cfsetting enablecfoutputonly="false">