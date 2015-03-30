# Introduction #

This page will give you a brief overview how to set up imgmap to get your job done.
The library has 3 main operation modes, you will find an example for each of them in the download package. The operation modes are the following:

  1. editor - this is the mode when the library will create all the necessary form elements that are needed to reproduce the interface that can be seen on the online editor. You assign certain containers in your document, and the script will fill these in with form elements, buttons, text area. For more details read further on.
  1. highlighter - in this mode the library will simply work as an image map highlighter. It takes all image maps found on the page and applies visibility to the map areas without you being able to edit them.
  1. editor2 - this is to reproduce certain Dreamweaver-like functionality, very similar to _editor_ mode though.

# Preliminary steps #

  * Download the latest package from the Downloads section
  * Unzip the package to the directory of your preference, eg. yourproject/imgmap

# Script inclusion #

To be able to use the script, you will have to include it in your HTML page. Something like this will do the job:
```
<script type="text/javascript" src="yourproject/imgmap/imgmap.js"></script>
```
Either you can place it in the head section of your page, or just inline, when you need it. In order to be able to use the canvas element in Internet Explorer, imgmap will try to load excanvas.js from the same directory (yourproject/imgmap) automatically, if its not loaded before. To shortcut this process you can always load this script in a conditional comment _in your page header_:
```
<!--[if gte IE 6]>
<script language="javascript" type="text/javascript" src="yourproject/imgmap/excanvas.js"></script>
<![endif]-->
```
Thats all folks, you are ready to use the library! In fact imgmap will load one more script automatically and that is the language file. First it will check the language parameter you give (more about this later), second it will consider your browser preferences, third it will fall back to English.

# Instance setup #

Once imgmap.js is loaded, you have an object called "imgmap". In order to do anything useful, you will have to instantiate this object with certain parameters. There are a number of parameters you can configure, if you skip any of them, the default kicks into action. Lets take a look at the most important ones:

```
	mode     : "editor",
	//possible values: editor - classical editor, editor2 - dreamweaver style editor, highlighter - map highlighter
	
	imgroot  : "",
//the directory root relative to imgmap.js from where to read button images
	baseroot : "",
//the directory root of imgmap, if not set, detected automatically
	lang     : "en",
//the language of the status messages
	loglevel : 0,
//the default loglevel of internal logging, can be 0-3
	buttons          : ['add','delete','preview','html'],
//the buttons you wish to show in editor mode
	custom_callbacks : {
	'onHtml' : function() {htmlShow();}
},
//an object of callback functions with the following possible names. Whenever an internal
//event occurs, imgmap will fire the correspondent event
	//possible values: onPreview, onClipboard, onHtml, onAddArea, onRemoveArea, onDrawArea, onResizeArea, onRelaxArea, onFocusArea, onBlurArea, onMoveArea, onSelectRow, onLoadImage, onSetMap, onGetMap, onSelectArea

	CL_DRAW_BOX        : '#dd2400',//color of bounding box while drawing/resizing
	CL_DRAW_SHAPE      : '#d00',//color of shape when drawing/resizing
	CL_DRAW_BG         : '#fff',//color of background when drawing/resizing
	CL_NORM_BOX        : '#dd2400',//color of bounding box while area is relaxed
	CL_NORM_SHAPE      : '#d00',//color of shape while area is relaxed
	CL_NORM_BG         : '#fff',//color of background while area is relaxed
	CL_HIGHLIGHT_BOX   : '#dd2400',//color of bounding box while area is highlighted
	CL_HIGHLIGHT_SHAPE : '#d00',//color of shape while area is highlighted
	CL_HIGHLIGHT_BG    : '#fff',//color of background while area is highlighted
	CL_KNOB            : '#ffeeee',//currently unused
	CL_HIGHLIGHT_PROPS : '#e7e7e7',//color of properties form field background when area is highlighted (editor mode only)

	bounding_box       : true,//whether or not to draw bounding box for circles, polygons
	label              : '%n',
//the area label that is shown in the upper left corner of each label
	//possible values: %n - number, %c - coords, %h - href, %a - alt, %t - title, and any other characters that will not be replaced
	
	label_class        : 'imgmap_label',//the css class of the area label
	label_style        : 'font: bold 10px Arial',//the css style of the area label
	hint               : '#%n %h',
//the text to show on mouseover of any area
	//possible values: %n - number, %c - coords, %h - href, %a - alt, %t - title, and any other characters that will not be replaced

	draw_opacity       : '35',	
//opacity of area while drawing/resizing
	norm_opacity       : '50',	
//opacity of area while relaxed
	highlight_opacity  : '65',
//opacity of area while highlighted
	cursor_default     : 'crosshair',
//css cursor style when mouse is over the image 

pic_container: document.getElementById('pic_container'),
//the container div to hold the image (editor/editor2 modes)
html_container: document.getElementById('html_container'),
//thecontainer div to hold the html textarea (editor/editor2 modes)
status_container: document.getElementById('status_container'),
//the container div to hold status messages (editor/editor2 modes)
form_container: document.getElementById('form_container'),
//the container div to hold the form input elements (editor/editor2 modes)
//all the above containers can be undefined or null if you dont want to use them

```

After all lets see then how to set up an instance, with some of the parameters defined above:

```
var myimgmap = new imgmap({
mode : "editor",
button_container: document.getElementById('button_container'),
imgroot: 'example1_files/',
buttons : ['add','delete','preview','html'],
custom_callbacks : {
	'onHtml' : function() {htmlShow();}//your own function to call here
},
pic_container: document.getElementById('pic_container'),//elements on your page
html_container: document.getElementById('html_container'),
status_container: document.getElementById('status_container'),
form_container: document.getElementById('form_container'),
bounding_box : true
});
```

Tada. We are done.

# Interacting with the editor #

There are a number of functions inside imgmap object, most likely you would want to use the followings:

loadImage
useImage
getMapHTML
setMapHTML
