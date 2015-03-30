# imgmap
Javascript based imagemap editor

Code was
Automatically exported from code.google.com/p/imgmap
on March 30, 2015

With the imagemap editor you can easily draw ALL the standard image map shapes (rectangle, circle, polygon),
and you can have full control over the generated HTML code as well.

The editor natively uses the canvas HTML element to draw the shapes on a given image.
The ExplorerCanvas (http://excanvas.sourceforge.net/) library from Google is used to get the same result in browsers, that do not support the
canvas element but can use VML instead. ExplorerCanvas works quite well, however it is still beta quality,
and not as fast as the native canvas drawing, so expect some lags in IE.
The editor is currently tested to work in Firefox 1.5+, Safari 3+, Opera 9+, IE 6+ and Chrome.

![screenshot of the online editor](http://www.maschek.hu/ext/imgmap.png)
