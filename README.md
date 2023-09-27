# imgmap

Javascript based imagemap editor

See the online editor at: http://www.maschek.hu/imagemap/

With the imagemap editor you can easily draw ALL the standard image map shapes (rectangle, circle, polygon),
and you can have full control over the generated HTML code as well.

The editor natively uses the canvas HTML element to draw the shapes on a given image.
The ExplorerCanvas (http://excanvas.sourceforge.net/) library from Google is used to get the same result in browsers, that do not support the
canvas element but can use VML instead. ExplorerCanvas works quite well, however it is still beta quality,
and not as fast as the native canvas drawing, so expect some lags in IE.
The editor is currently tested to work in Chrome, Firefox, Safari, Opera 9+ and IE 6+.

![imgmap](https://github.com/maschek/imgmap/assets/819167/84d3d433-1b3c-42a7-8093-40fd5cc1b383)

# Questions?
Go to: http://groups.google.com/group/imgmap-discuss

# Features
Main features of the image map editor

**Supports all shapes (rect, circle, poly)**
While you might have came across other in-browser editors that support rectangles or polygons in some way, imgmap supports ALL of the standard map shapes such as rectangles, circles and polygons.
Note: Default shape is not currently supported, also not widely used.

**Canvas based graphical engine**
The drawing engine is based on the canvas element, which is native part of all modern web browsers.
Note: Internet Explorer doesn't support canvas natively, thus the functionality is emulated.

**Independent of javascript libraries**
Imgmap doesn't depend on any of the popular javascript libraries like jQuery, Prototype, etc. You can simply drop it into your project without any collision with other libraries.

**Unlimited number of areas to define**
Imgmap exposes no limitations regarding the number of areas you can define.
Note: Your browser might have such limitations however.

**Get or set map html code easily**
Easy to use API to set the imagemap from an existing HTML source, or to get the code of the one you are currently working with.

**Fully jslint compliant**
jslint is a javascript source code verifier, that detects a number of potential programming errors. Imgmap is free of such errors.

**Multilanguage user interface**
Imgmap supports by default a number of languages, but you can easy extend it with new ones.

**Wide browser compatibility**
Imgmap is compatible with Chrome, Firefox, Safari, Opeara and Internet Explorer 6+ as well as other browsers that are based on Gecko, Trident, Webkit or Presto layout engines.

**Plugins available for popular WYSIWYG editors**
Imgmap is shipped with plugins to the two most popular WYSIWYG editors: TinyMCE and FCKEditor.

# Files/Download
You can download the latest release on the project's github page:
https://github.com/maschek/imgmap/releases/latest

# License
The imagemap editor is available under dual licensing scheme.
You are free to use imgmap under the open source license. If you are using it for commercial purposes, we ask that you help support the project by purchasing a commercial license. 

## Open Source License
Imgmap is licensed under the terms of the Open Source GPL license. You might use this license if:
* You want to use it in an open source project that precludes using non-open source software
* You wish to use it in a personal, educational or non-profit manner
* You are using imgmap in a commercial application, the GPL works for you and you do not wish to support the project

[View license terms](https://raw.githubusercontent.com/maschek/imgmap/master/license_GPL.txt)

Should you have any questions on licensing options, please contact licenses@maschek.hu for further information.

## Commercial License
You might want a traditional commercial license if:
* You do not want any of the potential restrictions of an open source license
* You need to own a commercial license in order to satisfy your own internal software licensing requirements
* You want to support the project financially to ensure its continued success


[View detailed license terms](https://raw.githubusercontent.com/maschek/imgmap/master/license_commercial.txt)

### Purchase a commercial license
In order to get a commercial licensed copy please contact us via email at: sales@maschek.hu

*Note: all licenses include 1 year of free upgrades and email support.*

**Developer License**
Allows for a *single* developer to install and use imgmap on unlimited workstations for development and to deploy imgmap on unlimited domains and sub-domains on unlimited servers.
Price: 30 EUR

**Team License**
Allows for up to *5 developers* in your company to install and use imgmap on unlimited workstations for development and to deploy imgmap on unlimited domains and sub-domains on unlimited servers.
Price: 60 EUR

**Workgroup License**
Allows for up to *25 developers* in your company to install and use imgmap on unlimited workstations for development and to deploy imgmap on unlimited domains and sub-domains on unlimited servers.
Price: 100 EUR

**Enterprise License**
Allows for *unlimited developers* in your company to install and use imgmap on unlimited workstations for development and to deploy imgmap on unlimited domains and sub-domains on unlimited servers.
Price: 200 EUR

Should you have any questions on licensing options, please contact licenses@maschek.hu for further information.

# Changelog
See [CHANGELOG.md](CHANGELOG.md)

# Credits 
**Big thanks go to the following teams/people:**

Excanvas team

**Plugins:**
Alfonso Martínez de Lizarrondo, John Ericksen, Colin Bell

**Language files**
Alfonso Martínez de Lizarrondo, Iwan Fux, Paul Cazes, João Felipe Ferreira



# Donate
You can always [donate](https://www.paypal.com/donate/?hosted_button_id=9AWAGUKKADEMN) to this project to help the development process running. 
