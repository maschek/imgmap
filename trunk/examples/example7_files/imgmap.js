/**
 *	Image Map Editor (imgmap) - in-browser imagemap editor
 *	Copyright (C) 2006 - 2008 Adam Maschek (adam.maschek @ gmail.com)
 *	
 *	This program is free software; you can redistribute it and/or
 *	modify it under the terms of the GNU General Public License
 *	as published by the Free Software Foundation; either version 2
 *	of the License, or (at your option) any later version.
 *	
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU General Public License for more details.
 *	
 *	You should have received a copy of the GNU General Public License
 *	along with this program; if not, write to the Free Software
 *	Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
/**
 *	Online Image Map Editor - main script file.
 *	This is the main script file of the Online Image Map Editor. 
 *	@date	26-02-2007 2:24:50
 *	@author	Adam Maschek (adam.maschek(at)gmail.com)
 *	@copyright
 *	@version 2.0beta6
 *	 
 *	TODO:
 *	-pic_container dynamic create(pos rel)?
 *	-scriptload race condition fix
 *	-destroy/cleanup function ?
 *	-testing highlighter
 *	-cursor area_mousemove in opera not refreshing quite well
 *	-get rid of memo array
 *	-merge props and areas arrays
 *	-highlight which control point is edited in html or form mode   
 *	-more comments, especially on config vars
 *	-make function names more logical
 *	- dumpconfig   
 *	-prepare for bad input /poly not properly closed?
 *	-prepare for % values in coords  
 *	-prepare for default shape http://www.w3.org/TR/html4/struct/objects.html#edef-AREA
 */

function imgmap(config) {
	this.version = "2.0beta6";
	this.buildDate = "2008/01/12 22:14";
	this.buildNumber = "39";
	this.config = {};
	this.is_drawing = 0;
	this.strings   = [];
	this.memory    = [];
	this.areas     = [];
	this.props     = [];
	this.logStore  = [];
	this.currentid = 0;
	this.draggedId  = null;
	this.selectedId = null;
	this.nextShape = 'rectangle';
	this.viewmode  = 0;
	//possible values: 0 - edit, 1 - preview
	
	this.loadedScripts = [];
	this.isLoaded   = false;
	this.cntReloads = 0;
	this.mapname    = '';
	this.mapid      = '';

	//is_drawing draw mode constants 
	this.DM_RECTANGLE_DRAW          = 1;
	this.DM_RECTANGLE_MOVE          = 11;
	this.DM_RECTANGLE_RESIZE_TOP    = 12;
	this.DM_RECTANGLE_RESIZE_RIGHT  = 13;
	this.DM_RECTANGLE_RESIZE_BOTTOM = 14;
	this.DM_RECTANGLE_RESIZE_LEFT   = 15;
	
	this.DM_SQUARE_DRAW             = 2;
	this.DM_SQUARE_MOVE             = 21;
	this.DM_SQUARE_RESIZE_TOP       = 22;
	this.DM_SQUARE_RESIZE_RIGHT     = 23;
	this.DM_SQUARE_RESIZE_BOTTOM    = 24;
	this.DM_SQUARE_RESIZE_LEFT      = 25;
	
	this.DM_POLYGON_DRAW            = 3;
	this.DM_POLYGON_LASTDRAW        = 30;
	this.DM_POLYGON_MOVE            = 31;

	//set some config defaults
	this.config.mode     = "editor";
	//possible values: editor - classical editor, editor2 - dreamweaver style editor, highlighter - map highlighter
	
	this.config.imgroot     = '';
	this.config.baseroot    = '';
	this.config.lang        = '';
	this.config.defaultLang = 'en';
	this.config.loglevel    = 0;
	this.config.buttons          = ['add','delete','preview','html'];
	this.config.custom_callbacks = {};
	//possible values: onPreview, onClipboard, onHtml, onAddArea, onRemoveArea, onDrawArea, onResizeArea, onRelaxArea, onFocusArea, onBlurArea, onMoveArea, onSelectRow, onLoadImage, onSetMap, onGetMap, onSelectArea

	this.config.CL_DRAW_BOX        = '#dd2400';
	this.config.CL_DRAW_SHAPE      = '#d00';
	this.config.CL_DRAW_BG         = '#fff';
	this.config.CL_NORM_BOX        = '#dd2400';
	this.config.CL_NORM_SHAPE      = '#d00';
	this.config.CL_NORM_BG         = '#fff';
	this.config.CL_HIGHLIGHT_BOX   = '#dd2400';
	this.config.CL_HIGHLIGHT_SHAPE = '#d00';
	this.config.CL_HIGHLIGHT_BG    = '#fff';
	this.config.CL_KNOB            = '#ffeeee';
	this.config.CL_HIGHLIGHT_PROPS = '#e7e7e7';

	this.config.bounding_box       = true;
	this.config.label              = '%n';
	//the format string of the area labels - possible values: %n - number, %c - coords, %h - href, %a - alt, %t - title
	
	this.config.label_class        = 'imgmap_label';
	//the css class to apply on labels
	this.config.label_style        = 'font: bold 10px Arial';
	//this.config.label_style        = 'font-weight: bold; font-size: 10px; font-family: Arial; color: #964';
	//the css style(s) to apply on labels
	
	this.config.hint               = '#%n %h';
	//the format string of the area mouseover hints - possible values: %n - number, %c - coords, %h - href, %a - alt, %t - title

	this.config.draw_opacity       = '35';
	//the opacity value of the area while drawing, moving or resizing - possible values 0 - 100 or range "(x)-y"	
	this.config.norm_opacity       = '50';
	//the opacity value of the area while relaxed - possible values 0 - 100	or range "(x)-y"
	this.config.highlight_opacity  = '70';
	//the opacity value of the area while highlighted - possible values 0 - 100 or range "(x)-y"
	this.config.cursor_default     = 'crosshair';		//auto/pointer
	//the css cursor while hovering over the image
	
	//browser sniff
	var ua = navigator.userAgent;
	this.isMSIE    = (navigator.appName == "Microsoft Internet Explorer");
	this.isMSIE5   = this.isMSIE && (ua.indexOf('MSIE 5')   != -1);
	this.isMSIE5_0 = this.isMSIE && (ua.indexOf('MSIE 5.0') != -1);
	this.isMSIE7   = this.isMSIE && (ua.indexOf('MSIE 7')   != -1);
	this.isGecko   = ua.indexOf('Gecko')  != -1;
	this.isSafari  = ua.indexOf('Safari') != -1;
	this.isOpera   = (typeof window.opera != 'undefined');

	this.addEvent(document, 'keydown',   this.doc_keydown.bind(this));
	this.addEvent(document, 'keyup',     this.doc_keyup.bind(this));
	this.addEvent(document, 'mousedown', this.doc_mousedown.bind(this));
	
	if (config) {
		this.setup(config);
	}
	
}


/**
 *	Return an object given by id or object itself.
 *	@date	22-02-2007 0:14:50
 *	@author	Adam Maschek (adam.maschek(at)gmail.com)
 */
imgmap.prototype.assignOID = function(objorid) {
	try {
		if (typeof objorid == 'undefined') {
			this.log("Undefined object passed to assignOID.");// Called from: " + arguments.callee.caller, 1);
			return null;
		}
		else if (typeof objorid == 'object') {
			return objorid;
		}
		else if (typeof objorid == 'string') {
			return document.getElementById(objorid);
		}
	}
	catch (err) {
		this.log("Error in assignOID", 1);
	}
	return null;
};


/**
 *	Main setup function.
 *	Can be called manually or constructor will call it.
 *	@date	22-02-2007 0:15:42
 *	@author	Adam Maschek (adam.maschek(at)gmail.com)
 */
imgmap.prototype.setup = function(config) {
	//this.config = config;
	for (var i in config) {
		this.config[i] = config[i];
	}
	//this.log('setup');
	//set container elements - supposedly they already exist in the DOM
	if (config) {
		this.pic_container = this.assignOID(config.pic_container);
		if (this.pic_container) {
			this.preview = document.createElement('DIV');
			this.preview.style.display = 'none';
			this.pic_container.appendChild(this.preview);
		}
		
		this.form_container = this.assignOID(config.form_container);
		
		this.html_container = this.assignOID(config.html_container);
		if (this.html_container) {
			this.addEvent(this.html_container, 'blur',  this.html_container_blur.bind(this));
			this.addEvent(this.html_container, 'focus', this.html_container_focus.bind(this));
		}
		
		this.status_container = this.assignOID(config.status_container);
		//alert('bc:'+config.button_container.id);
		//alert(document.getElementById(config.button_container).tagName);
		//alert(document.getElementById(config.button_container).parentNode.tagName);
		this.button_container = this.assignOID(config.button_container);
		//console.log(this.button_container);
		//console.log(document.getElementById('button_container'));
		//alert(this.button_container.parentNode.parentNode.parentNode.parentNode.parentNode.tagName);

	}
	
	if (!this.config.baseroot) {
		//search for a base - theoretically there can only be one, but lets search
		//for the first non-empty
		var bases = document.getElementsByTagName('base');
		var base  = '';
		for (i=0; i<bases.length; i++) {//i declared earlier
			if (bases[i].href) {
				base = bases[i].href;
				//append slash if missing
				if (base.charAt(base.length-1) != '/') {
					base+= '/';
				}
				break;
			}
		}
		//search for scripts
		var scripts = document.getElementsByTagName('script');
		for (i=0; i<scripts.length; i++) {//i declared earlier
			if (scripts[i].src && scripts[i].src.match(/imgmap\w*\.js(\?.*?)?$/)) {
				var src = scripts[i].src;
				//cut filename part, leave last slash
				src = src.substring(0, src.lastIndexOf('/') + 1);
				//set final baseroot path
				if (base && src.indexOf('://') == -1) {
					this.config.baseroot = base + src;
				}
				else {
					this.config.baseroot = src;
				}
				//exit loop
				break;
			}
		}
	}

	//load excanvas js - as soon as possible
	if (this.isMSIE &&
		typeof window.CanvasRenderingContext2D == 'undefined' && typeof G_vmlCanvasManager == 'undefined') { 
		this.loadScript(this.config.baseroot + 'excanvas.js');
		//alert('loadcanvas');
	}
	//alert(this.config.baseroot);

	//load language js - as soon as possible
	if (!this.config.lang) {
		this.config.lang = this.detectLanguage();
	}
	this.loadScript(this.config.baseroot + 'lang_' + this.config.lang + '.js');
	
	if (!this.config.imgroot) {
		//set same as baseroot
		this.config.imgroot = this.config.baseroot;
	}
	
	//hook onload event - as late as possible
	this.addEvent(window, 'load', this.onLoad.bind(this));
	return true;
};


//currently unused
imgmap.prototype.retryDelayed = function(fn, delay, tries) {
	if (typeof fn.tries == 'undefined') {fn.tries = 0;}
	//alert(fn.tries+1);
	if (fn.tries++ < tries) {
		//alert('ss');
		window.setTimeout(function() {
		fn.apply(this);
		}, delay);
	}
};


/**
 *	Things to do when the page with scripts is loaded.
 *	@date	22-02-2007 0:16:22
 *	@author	Adam Maschek (adam.maschek(at)gmail.com)
 */
imgmap.prototype.onLoad = function(e) {
	if (this.isLoaded) {return true;}
	var _this = this;
	//this.log('readystate: ' +  document.readyState);
	if (typeof imgmapStrings == 'undefined') {
		if (this.cntReloads++ < 5) {
			//this.retryDelayed(_this.onLoad(), 1000, 3);
			window.setTimeout(function () {_this.onLoad(e);} ,1200);
			this.log('Delaying onload (language ' + this.config.lang + ' not loaded, try: ' + this.cntReloads + ')');
			return false;
		}
		else if (this.config.lang != this.config.defaultLang && this.config.defaultLang != 'en') {
			this.log('Falling back to default language: ' + this.config.defaultLang);
			this.cntReloads = 0;
			this.config.lang = this.config.defaultLang;
			this.loadScript(this.config.baseroot + 'lang_' + this.config.lang + '.js');
			window.setTimeout(function () {_this.onLoad(e);} ,1200);
			return false;
		}
		else if (this.config.lang != 'en') {
			this.log('Falling back to english language');
			this.cntReloads = 0;
			this.config.lang = 'en';
			this.loadScript(this.config.baseroot + 'lang_' + this.config.lang + '.js');
			window.setTimeout(function () {_this.onLoad(e);} ,1200);
			return false;
		}
	}
	//else
	try {
		this.loadStrings(imgmapStrings);
	}
	catch (err) {
		this.log("Unable to load language strings", 1);
	}
	
	//check if ExplorerCanvas correctly loaded - detect if browser supports canvas
	//alert(typeof G_vmlCanvasManager + this.isMSIE + typeof window.CanvasRenderingContext2D);
	if (this.isMSIE) {
		//alert('cccc');
		//alert(typeof G_vmlCanvasManager);
		if (typeof window.CanvasRenderingContext2D == 'undefined' && typeof G_vmlCanvasManager == 'undefined') {
			//alert('bbb');
			/*
			if (this.cntReloads++ < 5) {
				var _this = this;
				//this.retryDelayed(_this.onLoad(), 1000, 3);
				window.setTimeout(function () {
					_this.onLoad(e);
					}
					,1000
					);
				//alert('aaa');
				this.log('Delaying onload (excanvas not loaded, try: ' + this.cntReloads + ')');
				return false;
			}
			*/
			this.log(this.strings.ERR_EXCANVAS_LOAD, 2);//critical error
		}
	}
	
	if (this.config.mode == 'highlighter') {
		//call global scope function
		imgmap_spawnObjects(this.config);	
	}
	
	else {
		if (this.button_container) {
			var img;//button image
			for (var i=0; i<this.config.buttons.length; i++) {
				if (this.config.buttons[i] == 'add') {
					try {
						img = document.createElement('IMG');
						img.src     = this.config.imgroot + 'add.gif';
						this.addEvent(img, 'click', this.addNewArea.bind(this));
						img.alt     = this.strings.HINT_ADD;
						img.title   = this.strings.HINT_ADD;
						img.style.cursor = 'pointer';
						img.style.margin = '0 2px';
						this.button_container.appendChild(img);
					}
					catch (err) {
						this.log("Unable to add button (" + this.config.buttons[i] + ")", 1);
					}
				}
				else if (this.config.buttons[i] == 'delete') {
					try {
						img = document.createElement('IMG');
						img.src     = this.config.imgroot + 'delete.gif';
						this.addEvent(img, 'click', this.removeArea.bind(this));
						img.alt     = this.strings.HINT_DELETE;
						img.title   = this.strings.HINT_DELETE;
						img.style.cursor = 'pointer';
						img.style.margin = '0 2px';
						this.button_container.appendChild(img);
					}
					catch (err) {
						this.log("Unable to add button (" + this.config.buttons[i] + ")", 1);
					}
				}
				else if (this.config.buttons[i] == 'preview') {
					try {
						img = document.createElement('IMG');
						img.src     = this.config.imgroot + 'zoom.gif';
						this.addEvent(img, 'click', this.togglePreview.bind(this));
						img.alt     = this.strings.HINT_PREVIEW;
						img.title   = this.strings.HINT_PREVIEW;
						img.style.cursor = 'pointer';
						img.style.margin = '0 2px';
						this.i_preview = img;
						this.button_container.appendChild(img);
					}
					catch (err) {
						this.log("Unable to add button (" + this.config.buttons[i] + ")", 1);
					}
				}
				else if (this.config.buttons[i] == 'html') {
					try {
						img = document.createElement('IMG');
						img.src     = this.config.imgroot + 'html.gif';
						this.addEvent(img, 'click', this.clickHtml.bind(this));
						img.alt     = this.strings.HINT_HTML;
						img.title   = this.strings.HINT_HTML;
						img.style.cursor = 'pointer';
						img.style.margin = '0 2px';
						this.button_container.appendChild(img);
					}
					catch (err) {
						this.log("Unable to add button (" + this.config.buttons[i] + ")", 1);
					}
				}
				else if (this.config.buttons[i] == 'clipboard') {
					try {
						img = document.createElement('IMG');
						img.src     = this.config.imgroot + 'clipboard.gif';
						this.addEvent(img, 'click', this.toClipBoard.bind(this));
						img.alt     = this.strings.HINT_CLIPBOARD;
						img.title   = this.strings.HINT_CLIPBOARD;
						img.style.cursor = 'pointer';
						img.style.margin = '0 2px';
						this.button_container.appendChild(img);
					}
					catch (err) {
						this.log("Unable to add button (" + this.config.buttons[i] + ")", 1);
					}
				}
			}//end foreach buttons
		}//end if button container
	}
	this.isLoaded = true;
	return true;
};


/**
 *	Attach new 'evt' event handler 'callback' to 'obj'
 *	@date	24-02-2007 21:16:20
 *	@author	Adam Maschek (adam.maschek(at)gmail.com)
 */
imgmap.prototype.addEvent = function(obj, evt, callback) {
	if (obj.attachEvent) {
		//Microsoft style registration model
		return obj.attachEvent("on" + evt, callback);
	}
	else if (obj.addEventListener) {
		//W3C style model
		obj.addEventListener(evt, callback, false);
		return true;
	}
	else {
		obj['on' + evt] = callback;
	}
};


/**
 *	Detach event from object
 *	@date	24-11-2007 15:22:17
 *	@author	Adam Maschek (adam.maschek(at)gmail.com)
 */
imgmap.prototype.removeEvent = function(obj, evt, callback) {
	if (obj.detachEvent) {
		//Microsoft style detach model
		return obj.detachEvent("on" + evt, callback);
	}
	else if (obj.removeEventListener) {
		//W3C style model
		obj.removeEventListener(evt, callback, false);
		return true;
	}
	else {
		obj['on' + evt] = null;
	}
};


/**
 *	We need this because load events for scripts function slightly differently.
 *	@link	http://dean.edwards.name/weblog/2006/06/again/
 *	@author	Adam Maschek (adam.maschek(at)gmail.com)
 *	@date	24-03-2007 11:02:21
 */
imgmap.prototype.addLoadEvent = function(obj, callback) {
	if (obj.attachEvent) {
		//Microsoft style registration model
		return obj.attachEvent("onreadystatechange", callback);
	}
	else if (obj.addEventListener) {
		//W3C style registration model
		obj.addEventListener('load', callback, false);
		return true;
	}
	else {
		obj.onload = callback;
	}
};


/**
 *	Include another js script into the current document.
 *	@date	22-02-2007 0:17:04
 *	@author	Adam Maschek (adam.maschek(at)gmail.com)
 */
imgmap.prototype.loadScript = function(url) {
	if (url === '') {return false;}
	if (this.loadedScripts[url] == 1) {return true;}//script already loaded
	this.log('Loading script: ' + url);
	//we might need this someday for safari?
	//var temp = '<script language="javascript" type="text/javascript" src="' + url + '"></script>';
	//document.write(temp);
	try {
		var head = document.getElementsByTagName('head')[0];
		var temp = document.createElement('SCRIPT');
		temp.setAttribute('language', 'javascript');
		temp.setAttribute('type', 'text/javascript');
		temp.setAttribute('src', url);
		//temp.setAttribute('defer', true);
		head.appendChild(temp);
		//this.loadedScripts[url] = 1;
		this.addLoadEvent(temp, this.script_load.bind(this));
	}
	catch (err) {
		this.log('Error loading script: ' + url);
	}
	return true;
};


/**
 *	Event handler of external script loaded.
 */
imgmap.prototype.script_load = function(e) {
	var obj = (this.isMSIE) ? window.event.srcElement : e.currentTarget;
	var url = obj.src;
	var complete = false;
	//alert(url);
	if (typeof obj.readyState != 'undefined') {
		//explorer
		if (obj.readyState == 'complete') {
			complete = true;
		}
	}
	else {
		//other browsers?
		complete = true;
	}
	if (complete) {
		this.loadedScripts[url] = 1;
		this.log('Loaded script: ' + url);
		return true;
	}
};


imgmap.prototype.loadStrings = function(obj) {
	for (var key in obj) {
		this.strings[key] = obj[key];
	}
};


imgmap.prototype.loadImage = function(img, imgw, imgh) {
	//wipe all
	this.removeAllAreas();
	if (this.html_container) {
		this.html_container.value = '';
	}
	if (!this._getLastArea()) {
		//init with one new area if there was none editable
		if (this.config.mode != "editor2") {this.addNewArea();}
	}
	if (typeof img == 'string') {
		//there is an image given with url to load
		if (typeof this.pic == 'undefined') {
			this.pic = document.createElement('IMG');
			this.pic_container.appendChild(this.pic);
			//event handler hooking
			this.addEvent(this.pic, 'mousedown', this.img_mousedown.bind(this));
			this.addEvent(this.pic, 'mouseup',   this.img_mouseup.bind(this));
			this.addEvent(this.pic, 'mousemove', this.img_mousemove.bind(this));
			this.pic.style.cursor = this.config.cursor_default;
		}
		//img ='../../'+img;
		this.log('Loading image: ' + img, 0);
		//calculate timestamp to bypass browser cache mechanism
		this.pic.src = img + '? '+ (new Date().getTime());
		if (imgw && imgw > 0) {this.pic.setAttribute('width',  imgw);}
		if (imgh && imgh > 0) {this.pic.setAttribute('height', imgh);}
		this.fireEvent('onLoadImage', this.pic);
	}
	else if (typeof img == 'object') {
		//we have to use the src of the image object
		var src = img.src; //img.getAttribute('src');
		if (src === '' && img.getAttribute('mce_src') !== '') {
			//if it is a tinymce object, it has no src but mce_src attribute!
			src = img.getAttribute('mce_src');
		}
		else if (src === '' && img.getAttribute('_fcksavedurl') !== '') {
			//if it is an fck object, it might have only _fcksavedurl attribute!
			src = img.getAttribute('_fcksavedurl');
		}
		// Get the displayed dimensions of the image
		if (!imgw) {
			imgw = img.clientWidth;
		}
		if (!imgh) {
			imgh = img.clientHeight;
		}
		this.loadImage(src, imgw, imgh);
	}
};


//there is an existing image object we want to handle with imgmap
imgmap.prototype.useImage = function(img) {
	//wipe all
	this.removeAllAreas();
	if (!this._getLastArea()) {
		//init with one new area if there was none editable
		if (this.config.mode != "editor2") {this.addNewArea();}
	}
	img = this.assignOID(img);
	if (typeof img == 'object') {
		this.pic = img;
		//event handler hooking
		this.addEvent(this.pic, 'mousedown', this.img_mousedown.bind(this));
		this.addEvent(this.pic, 'mouseup',   this.img_mouseup.bind(this));
		this.addEvent(this.pic, 'mousemove', this.img_mousemove.bind(this));
		this.pic.style.cursor = this.config.cursor_default;
		this.pic_container = this.pic.parentNode;
		this.fireEvent('onLoadImage', this.pic);
	}
};


/**
 *	Prints out this.statusMessage to the status container, and window footer also if possible.
 *	@author	Adam Maschek (adam.maschek(at)gmail.com)
 *	@date	2006.10.29. 14:59:17
 */   
imgmap.prototype.statusMessage = function(str) {
	if (this.status_container) {this.status_container.innerHTML = str;}
	window.defaultStatus = str;
};


/**
 *	Adds basic logging functionality using firebug console object if available.
 *	@date	20-02-2007 17:55:18
 *	@author	Adam Maschek (adam.maschek(at)gmail.com)
 */   
imgmap.prototype.log = function(obj, level) {
	if (level === '' || typeof level == 'undefined') {level = 0;}
	if (this.config.loglevel != -1 && level >= this.config.loglevel) {
		this.logStore.push({level: level, obj: obj});
	}
	if (typeof console == 'object') {
		console.log(obj);
	}
	else if (this.isOpera) {
		opera.postError(level + ': ' + obj);
	}
	else if (typeof air == 'object') {
		//we are inside AIR
		if (typeof air.Introspector == 'object') {
			air.Introspector.Console.log(obj);
		}
		else {
			air.trace(obj);
		}
	}
	else {
		if (level > 1) {
			//alert(level + ': ' + obj);
			//dump with all pevious errors:
			var msg = '';
			for (var i=0; i<this.logStore.length; i++) {
				msg+= this.logStore[i].level + ': ' + this.logStore[i].obj + "\n";
			}
			alert(msg);
		}
		else {
			window.defaultStatus = (level + ': ' + obj);
		}
	}
};


/**
 *	Produces the image map HTML output with the defined areas.
 *	@author	Adam Maschek (adam.maschek(at)gmail.com)
 *	@date	2006-06-06 15:10:27
 */
imgmap.prototype.getMapHTML = function() {
	var html = '<map id="'+this.getMapId()+'" name="'+this.getMapName()+'">' + this.getMapInnerHTML() + '</map>';
	this.fireEvent('onGetMap', html);
	//alert(html);
	return html;
};


/**
 *	Get the map areas part only of the current imagemap.
 */
imgmap.prototype.getMapInnerHTML = function() {
	var html = '';
	//foreach area properties
	for (var i=0; i<this.areas.length; i++) {
		if (this.areas[i]) {
			if (this.areas[i].shape && this.areas[i].shape != 'undefined') {
					html+= '<area shape="' + this.areas[i].shape + '"' +
						' alt="' + this.areas[i].aalt + '"' +
						' title="' + this.areas[i].atitle + '"' +
						' coords="' + this.areas[i].lastInput + '"' +
						' href="' +	this.areas[i].ahref + '"' +
						' target="' + this.areas[i].atarget + '" />';
			}
		}
	}
	//alert(html);
	return html;
};


/**
 *	Get the map name of the current imagemap.
 */
imgmap.prototype.getMapName = function() {
	if (this.mapname === '') {
		if (this.mapid !== '') {return this.mapid;}
		var now = new Date();
		this.mapname = 'imgmap' + now.getFullYear() + (now.getMonth()+1) + now.getDate() + now.getHours() + now.getMinutes() + now.getSeconds();
	}
	return this.mapname;
};


/**
 *	Get the map id of the current imagemap.
 */
imgmap.prototype.getMapId = function() {
	if (this.mapid === '') {
		this.mapid = this.getMapName();
	}
	return this.mapid;
};

//bad inputs: 035,035 075,062
//150,217, 190,257, 150,297,110,257
/**
 *	Try to normalize coordinates that came from:
 *	1. html textarea
 *	2. user input in the active area's input field
 *	3. from the html source in case of plugins or highlighter
 */
imgmap.prototype._normCoords = function(coords, shape, flag) {
	//function level var declarations
	var i;//generic cycle counter
	var sx;//smallest x
	var sy;//smallest y
	var gx;//greatest x
	var gy;//greatest y
	var temp;
	
	//console.log(coords + ' - ' + shape + ' - ' + flag);
	coords = coords.trim();
	if (coords === '') {return '';}
	var oldcoords = coords;
	//replace some general junk
	coords = coords.replace(/(\d)(\D)+(\d)/g, "$1,$3");
	coords = coords.replace(/,(\D|0)+(\d)/g, ",$2");
	coords = coords.replace(/(\d)(\D)+,/g, "$1,");
	coords = coords.replace(/^(\D|0)+(\d)/g, "$2");
	//now fix other issues
	var parts = coords.split(',');
	if (shape == 'rectangle') {
		if (flag == 'fromcircle') {
			var r = parts[2];
			parts[0] = parts[0] - r;
			parts[1] = parts[1] - r;
			parts[2] = parseInt(parts[0], 10) + 2 * r;
			parts[3] = parseInt(parts[1], 10) + 2 * r;
		}
		else if (flag == 'frompolygon') {
			sx = parseInt(parts[0], 10); gx = parseInt(parts[0], 10);
			sy = parseInt(parts[1], 10); gy = parseInt(parts[1], 10);
			for (i=0; i<parts.length; i++) {
				if (i % 2 === 0 && parseInt(parts[i], 10) < sx) {
					sx = parseInt(parts[i], 10);}
				if (i % 2 === 1 && parseInt(parts[i], 10) < sy) {
					sy = parseInt(parts[i], 10);}
				if (i % 2 === 0 && parseInt(parts[i], 10) > gx) {
					gx = parseInt(parts[i], 10);}
				if (i % 2 === 1 && parseInt(parts[i], 10) > gy) {
					gy = parseInt(parts[i], 10);}
				//console.log(sx+","+sy+","+gx+","+gy);
			}
			parts[0] = sx; parts[1] = sy;
			parts[2] = gx; parts[3] = gy;
		}
		if (!(parseInt(parts[1], 10) > 0)) {parts[1] = parts[0];}
		if (!(parseInt(parts[2], 10) > 0)) {parts[2] = parseInt(parts[0], 10) + 10;}
		if (!(parseInt(parts[3], 10) > 0)) {parts[3] = parseInt(parts[1], 10) + 10;}
		if (parseInt(parts[0], 10) > parseInt(parts[2], 10)) {
			temp = parts[0];
			parts[0] = parts[2];
			parts[2] = temp;
		}
		if (parseInt(parts[1], 10) > parseInt(parts[3], 10)) {
			temp = parts[1];
			parts[1] = parts[3];
			parts[3] = temp;
		}
		coords = parts[0]+","+parts[1]+","+parts[2]+","+parts[3];
		//console.log(coords);
	}
	else if (shape == 'circle') {
		if (flag == 'fromrectangle') {
			sx = parseInt(parts[0], 10); gx = parseInt(parts[2], 10);
			sy = parseInt(parts[1], 10); gy = parseInt(parts[3], 10);
			//use smaller side
			parts[2] = (gx - sx < gy - sy) ? gx - sx : gy - sy;
			parts[2] = Math.floor(parts[2] / 2);//radius
			parts[0] = sx + parts[2];
			parts[1] = sy + parts[2];
		}
		else if (flag == 'frompolygon') {
			sx = parseInt(parts[0], 10); gx = parseInt(parts[0], 10);
			sy = parseInt(parts[1], 10); gy = parseInt(parts[1], 10);
			for (i=0; i<parts.length; i++) {
				if (i % 2 === 0 && parseInt(parts[i], 10) < sx) {
					sx = parseInt(parts[i], 10);}
				if (i % 2 === 1 && parseInt(parts[i], 10) < sy) {
					sy = parseInt(parts[i], 10);}
				if (i % 2 === 0 && parseInt(parts[i], 10) > gx) {
					gx = parseInt(parts[i], 10);}
				if (i % 2 === 1 && parseInt(parts[i], 10) > gy) {
					gy = parseInt(parts[i], 10);}
				//console.log(sx+","+sy+","+gx+","+gy);
			}
			//use smaller side
			parts[2] = (gx - sx < gy - sy) ? gx - sx : gy - sy;
			parts[2] = Math.floor(parts[2] / 2);//radius
			parts[0] = sx + parts[2];
			parts[1] = sy + parts[2];
		}
		if (!(parseInt(parts[1], 10) > 0)) {parts[1] = parts[0];}
		if (!(parseInt(parts[2], 10) > 0)) {parts[2] = 10;}
		coords = parts[0]+","+parts[1]+","+parts[2];
	}
	else if (shape == 'polygon') {
		if (flag == 'fromrectangle') {
			parts[4] = parts[2];
			parts[5] = parts[3];
			parts[2] = parts[0];
			parts[6] = parts[4];
			parts[7] = parts[1];
		}
		else if (flag == 'fromcircle') {
			//@url http://www.pixelwit.com/blog/2007/06/29/basic-circle-drawing-actionscript/
			var centerX = parseInt(parts[0], 10);
			var centerY = parseInt(parts[1], 10);
			var radius  = parseInt(parts[2], 10);
			var j = 0;
			parts[j++] = centerX + radius;
			parts[j++] = centerY;
			var sides = 60;
			for (i=0; i<=sides; i++) {
				var pointRatio = i/sides;
				var xSteps = Math.cos(pointRatio*2*Math.PI);
				var ySteps = Math.sin(pointRatio*2*Math.PI);
				var pointX = centerX + xSteps * radius;
				var pointY = centerY + ySteps * radius;
				parts[j++] = Math.round(pointX);
				parts[j++] = Math.round(pointY);
			}
			//console.log(parts);
		}
		coords = '';
		for (i=0; i<parts.length; i++) {
			coords+= parts[i]+",";
		}
		coords = coords.substring(0, coords.length - 1);
	}
	if (flag == 'preserve' && oldcoords != coords) {
		//return original and throw error
		//throw "invalid coords";
		return oldcoords;
	}
	return coords;
};


/**
 *	Sets the coordinates according to the given HTML map code or object.
 *	@author	Adam Maschek (adam.maschek(at)gmail.com)
 *	@date	2006-06-07 11:47:16
 */   
imgmap.prototype.setMapHTML = function(map) {
	this.fireEvent('onSetMap', map);
	//remove all areas
	this.removeAllAreas();
	//this.log(map);
	var oMap;
	if (typeof map == 'string') {
		var oHolder = document.createElement('DIV');
		oHolder.innerHTML = map;
		oMap = oHolder.firstChild;
	}
	else if (typeof map == 'object') {
		oMap = map;
	}
	if (!oMap || oMap.nodeName.toLowerCase() !== 'map') {return false;}
	this.mapname = oMap.name;
	this.mapid   = oMap.id;
	var newareas = oMap.getElementsByTagName('area');	
	for (var i=0; i<newareas.length; i++) {
		//alert(newareas[i].getAttribute('coords', 2));
		id = this.addNewArea();//btw id == this.currentid, just this form is a bit clearer

		if (newareas[i].getAttribute('shape', 2)) {
			shape = newareas[i].getAttribute('shape', 2).toLowerCase();
			if (shape == 'rect')      {shape = 'rectangle';}
			else if (shape == 'circ') {shape = 'circle';}
			else if (shape == 'poly') {shape = 'polygon';}
		}
		else {
			shape = 'rectangle';
		} 
		if (this.props[id]) {
			this.props[id].getElementsByTagName('select')[0].value = shape;
		}

		this.initArea(id, shape);
		
		if (newareas[i].getAttribute('coords', 2)) {
			//normalize coords
			var coords = this._normCoords(newareas[i].getAttribute('coords', 2), shape);
			if (this.props[id]) {
				this.props[id].getElementsByTagName('input')[2].value  = coords;
			}
			this.areas[id].lastInput = coords;
			//for area this one will be set in recalculate
		}

		var href = newareas[i].getAttribute('href', 2);
		// FCKeditor stored url to prevent mangling from the browser.
		var sSavedUrl = newareas[i].getAttribute( '_fcksavedurl' ) ;
		if (sSavedUrl) {
			href = sSavedUrl ;
		}

		if (href) {
			if (this.props[id]) {
				this.props[id].getElementsByTagName('input')[3].value  = href;
			}
			this.areas[id].ahref = href;
		}
		
		var alt = newareas[i].getAttribute('alt');
		if (alt) {
			if (this.props[id]) {
				this.props[id].getElementsByTagName('input')[4].value  = alt;
			}
			this.areas[id].aalt = alt;
		}
		
		var title = newareas[i].getAttribute('title');
		if (!title) {title = alt;}
		if (title) {
			this.areas[id].atitle = title;
		}

		var target = newareas[i].getAttribute('target');
		if (target) {target = target.toLowerCase();}
//		if (target == '') target = '_self';
		if (this.props[id]) {
			this.props[id].getElementsByTagName('select')[1].value = target;
		}
		this.areas[id].atarget = target;
		
		this._recalculate(id);//contains repaint
		this.relaxArea(id);
	}//end for areas
	if (this.html_container) {
		this.html_container.value = this.getMapHTML();
	}
};


/**
 *	Dummy
 */
imgmap.prototype.clickHtml = function() {
	this.fireEvent('onHtml');
	return true;
};


/**
 *	Preview image with imagemap applied.
 *	@author	Adam Maschek (adam.maschek(at)gmail.com)
 *	@date	2006-06-06 14:51:01
 *	@url	http://www.quirksmode.org/bugreports/archives/2005/03/Usemap_attribute_wrongly_case_sensitive.html 
 */
imgmap.prototype.togglePreview = function() {
	//function level var declarations
	var i;//generic cycle counter
	var nodes;//html nodes array
	
	if (!this.pic) {return false;}//exit if pic is undefined
	if (this.viewmode === 0) {
		this.fireEvent('onPreview');
		//hide canvas elements and labels
		for (i=0; i<this.areas.length; i++) {
			if (this.areas[i]) {
				this.areas[i].style.display = 'none';
				if (this.areas[i].label) {this.areas[i].label.style.display = 'none';}
			}
		}
		//disable form elements (inputs and selects)
		nodes = this.form_container.getElementsByTagName("input");
		//nodes = nodes.join(this.form_container.getElementsByTagName("select"));
		for (i=0; i<nodes.length; i++) {
			nodes[i].disabled = true;
		}
		nodes = this.form_container.getElementsByTagName("select");
		for (i=0; i<nodes.length; i++) {
			nodes[i].disabled = true;
		}
		//activate image map
		this.preview.innerHTML = this.getMapHTML();
		this.pic.setAttribute('border', '0', 0);
		this.pic.setAttribute('usemap', '#' + this.mapname, 0);
		//detach event handlers
		//this.removeEvent(this.pic, 'mousedown', this.img_mousedown.bind(this));
		//this.removeEvent(this.pic, 'mouseup',   this.img_mouseup.bind(this));
		//this.removeEvent(this.pic, 'mousemove', this.img_mousemove.bind(this));
		this.pic.style.cursor  = 'auto';
		//change preview button
		this.viewmode = 1;
		this.i_preview.src = this.config.imgroot + 'edit.gif';
		this.statusMessage(this.strings.PREVIEW_MODE);
	}
	else {
		//show canvas elements
		for (i=0; i<this.areas.length; i++) {
			if (this.areas[i]) {
				this.areas[i].style.display = '';
				if (this.areas[i].label && this.config.label) {this.areas[i].label.style.display = '';}
			}
		}
		//enable form elements
		nodes = this.form_container.getElementsByTagName("input");
		for (i=0; i<nodes.length; i++) {
			nodes[i].disabled = false;
		}
		nodes = this.form_container.getElementsByTagName("select");
		for (i=0; i<nodes.length; i++) {
			nodes[i].disabled = false;
		}
		//clear image map
		this.preview.innerHTML = '';
		//hook back event handlers
		//this.addEvent(this.pic, 'mousedown', this.img_mousedown.bind(this));
		//this.addEvent(this.pic, 'mouseup',   this.img_mouseup.bind(this));
		//this.addEvent(this.pic, 'mousemove', this.img_mousemove.bind(this));
		this.pic.style.cursor  = this.config.cursor_default;
		this.pic.removeAttribute('usemap', 0);
		//change preview button
		this.viewmode = 0;
		this.i_preview.src = this.config.imgroot + 'zoom.gif';
		this.statusMessage(this.strings.DESIGN_MODE);
		this.is_drawing = 0;
	}
};


/**
 *	Puts a new properties row, and adds a new CANVAS
 *	@author	Adam Maschek (adam.maschek(at)gmail.com)
 *	@date	2006-06-06 16:49:25  
 */ 
imgmap.prototype.addNewArea = function() {
		if (this.viewmode === 1) {return;}//exit if preview mode
		var lastarea = this._getLastArea();
		var id = (lastarea) ? lastarea.aid + 1 : 0;
		this.fireEvent('onAddArea', id);
		//alert(id);
		
		//insert new possibly? unknown area (will be initialized at mousedown)
		this.areas[id] = document.createElement('DIV');
		this.areas[id].id        = this.mapname + 'area' + id;
		this.areas[id].aid       = id;
		this.areas[id].shape     = "undefined";
		
		//insert props row
		if (this.form_container)
		{
			this.props[id] = document.createElement('DIV');
			this.form_container.appendChild(this.props[id]);

			this.props[id].id        = 'img_area_' + id;
			this.props[id].aid       = id;
			this.props[id].className = 'img_area';
			//hook event handlers
			this.addEvent(this.props[id], 'mouseover', this.img_area_mouseover.bind(this));
			this.addEvent(this.props[id], 'mouseout',  this.img_area_mouseout.bind(this));
			this.addEvent(this.props[id], 'click',     this.img_area_click.bind(this));
			var temp = '<input type="text"  name="img_id" class="img_id" value="' + id + '" readonly="1"/>';
			temp+= '<input type="radio" name="img_active" class="img_active" id="img_active_'+id+'" value="'+id+'">';
			temp+= 'Shape: <select name="img_shape" class="img_shape">';
			temp+= '<option value="rectangle" >rectangle</option>';
			temp+= '<option value="circle"    >circle</option>';
			temp+= '<option value="polygon"   >polygon</option>';
			temp+= '</select>';
			temp+= 'Coords: <input type="text" name="img_coords" class="img_coords" value="">';
			temp+= 'Href: <input type="text" name="img_href" class="img_href" value="">';
			temp+= 'Alt: <input type="text" name="img_alt" class="img_alt" value="">';
			temp+= 'Target: <select name="img_target" class="img_target">';
			temp+= '<option value=""  >&lt;not set&gt;</option>';
			temp+= '<option value="_self"  >this window</option>';
			temp+= '<option value="_blank" >new window</option>';
			temp+= '<option value="_top"   >top window</option>';
			temp+= '</select>';
			this.props[id].innerHTML = temp;
			//hook more event handlers
			this.addEvent(this.props[id].getElementsByTagName('input')[1],  'keydown', this.img_area_keydown.bind(this));
			this.addEvent(this.props[id].getElementsByTagName('input')[2],  'keydown', this.img_coords_keydown.bind(this));
			this.addEvent(this.props[id].getElementsByTagName('input')[2],  'blur', this.img_area_blur.bind(this));
			this.addEvent(this.props[id].getElementsByTagName('input')[3],  'blur', this.img_area_blur.bind(this));
			this.addEvent(this.props[id].getElementsByTagName('input')[4],  'blur', this.img_area_blur.bind(this));
			this.addEvent(this.props[id].getElementsByTagName('select')[0], 'blur',   this.img_area_blur.bind(this));
			this.addEvent(this.props[id].getElementsByTagName('select')[0], 'change', this.img_area_blur.bind(this));
			this.addEvent(this.props[id].getElementsByTagName('select')[1], 'blur', this.img_area_blur.bind(this));
			if (this.isSafari) {
				//need these for safari
				this.addEvent(this.props[id].getElementsByTagName('select')[0], 'change', this.img_area_click.bind(this));
				this.addEvent(this.props[id].getElementsByTagName('select')[1], 'change', this.img_area_click.bind(this));
			}
			if (lastarea && this.config.mode == "editor") {
				//set shape same as lastarea - just for convenience
				this.props[id].getElementsByTagName('select')[0].value = lastarea.shape;
			}
			else {
				//set shape as nextshape if set
				if (this.nextShape) {this.props[id].getElementsByTagName('select')[0].value = this.nextShape;}
			}
			//alert(this.props[id].parentNode.innerHTML);
			this.form_selectRow(id, true);
		}
		this.currentid = id;
		return id;
};


imgmap.prototype.initArea = function(id, shape) {
	if (!this.areas[id]) {return false;}//if all was erased, return
	//remove preinited dummy div or already placed canvas
	if (this.areas[id].parentNode) {this.areas[id].parentNode.removeChild(this.areas[id]);}
	if (this.areas[id].label) {this.areas[id].label.parentNode.removeChild(this.areas[id].label);}
	this.areas[id] = null;
	//create CANVAS node
	this.areas[id] = document.createElement('CANVAS');
	this.pic.parentNode.appendChild(this.areas[id]);
	this.pic.parentNode.style.position = 'relative';
	//alert('init' + typeof G_vmlCanvasManager);
	if (typeof G_vmlCanvasManager != "undefined") {
		//override CANVAS with VML object
		this.areas[id] = G_vmlCanvasManager.initElement(this.areas[id]);
		//this.areas[id] = this.pic.parentNode.lastChild;
	}
	this.areas[id].id        = this.mapname + 'area' + id;
	this.areas[id].aid       = id;
	this.areas[id].shape     = shape;
	this.areas[id].ahref     = '';
	this.areas[id].atitle    = '';
	this.areas[id].aalt      = '';
	this.areas[id].atarget   = ''; // '_self';
	this.areas[id].style.position = 'absolute';
	this.areas[id].style.top      = this.pic.offsetTop  + 'px';
	this.areas[id].style.left     = this.pic.offsetLeft + 'px';
	this._setopacity(this.areas[id], this.config.CL_DRAW_BG, this.config.draw_opacity);
	//hook event handlers
	this.areas[id].onmousedown = this.area_mousedown.bind(this);
	this.areas[id].onmouseup   = this.area_mouseup.bind(this);
	this.areas[id].onmousemove = this.area_mousemove.bind(this);
	this.areas[id].onmouseover = this.area_mouseover.bind(this);
	this.areas[id].onmouseout  = this.area_mouseout.bind(this);
	//initialize memory object
	this.memory[id] = {};
	this.memory[id].downx   = 0;
	this.memory[id].downy   = 0;
	this.memory[id].left    = 0;
	this.memory[id].top     = 0;
	this.memory[id].width   = 0;
	this.memory[id].height  = 0;
	this.memory[id].xpoints = [];
	this.memory[id].ypoints = [];
	//create label node
	this.areas[id].label = document.createElement('DIV');
	this.pic.parentNode.appendChild(this.areas[id].label);
	this.areas[id].label.className      = this.config.label_class;
	this.assignCSS(this.areas[id].label,  this.config.label_style);
	this.areas[id].label.style.position = 'absolute';
};


/**
 *	Resets area border to a normal state after drawing .
 *	@author	Adam Maschek (adam.maschek(at)gmail.com)
 *	@date	15-02-2007 22:07:28
 */
imgmap.prototype.relaxArea = function(id) {
	if (!this.areas[id]) {return;}
	this.fireEvent('onRelaxArea', id);
	if (this.areas[id].shape == 'rectangle') {
		this.areas[id].style.borderWidth = '1px';
		this.areas[id].style.borderStyle = 'solid';
		this.areas[id].style.borderColor = this.config.CL_NORM_SHAPE;
	}
	else if (this.areas[id].shape == 'circle' || this.areas[id].shape == 'polygon') {
		if (this.config.bounding_box) {
			this.areas[id].style.borderWidth = '1px';
			this.areas[id].style.borderStyle = 'solid';
			this.areas[id].style.borderColor = this.config.CL_NORM_BOX;
		}
		else {
			//clear border
			this.areas[id].style.border = '';
		}
	}
	this._setopacity(this.areas[id], this.config.CL_NORM_BG, this.config.norm_opacity);
};


/**
 *	Resets area border and opacity of all areas.
 *	@author	Adam Maschek (adam.maschek(at)gmail.com)
 *	@date	23-04-2007 23:31:09
 */
imgmap.prototype.relaxAllAreas = function() {
	for (var i=0; i<this.areas.length; i++) {
		if (this.areas[i]) {
			this.relaxArea(i);
		}
	}
};


/**
 *	Set opacity of area to the given percentage, as well as set the background color.
 */
imgmap.prototype._setopacity = function(area, bgcolor, pct) {
	if (bgcolor) {area.style.backgroundColor = bgcolor;}
	if (pct && typeof pct == 'string' && pct.match(/^\d*\-\d+$/)) {
		//gradual fade
		var parts = pct.split('-');
		if (typeof parts[0] != 'undefined') {
			//set initial opacity
			parts[0] = parseInt(parts[0], 10);
			this._setopacity(area, bgcolor, parts[0]);
		}
		if (typeof parts[1] != 'undefined') {
			parts[1] = parseInt(parts[1], 10);
			var curr = this._getopacity(area);
			//this.log('curr: '+curr);
			var _this = this;
			var diff = Math.round(parts[1] - curr);
			if (diff > 5) {
				window.setTimeout(function () {_this._setopacity(area, null, '-'+parts[1]);}, 20);
				pct = 1*curr + 5;
			}
			else if (diff < -3) {
				window.setTimeout(function () {_this._setopacity(area, null, '-'+parts[1]);}, 20);
				pct = 1*curr - 3;
			}
			else {
				//final set
				pct = parts[1];
			}
		}
	}
	if (!isNaN(pct)) {
		pct = Math.round(parseInt(pct, 10));
		//this.log('set ('+area.aid+'): ' + pct, 1);
		area.style.opacity = pct / 101;
		area.style.filter  = 'alpha(opacity='+pct+')';
	}
};


/**
 *	Get the currently set opacity of a given area.
 */
imgmap.prototype._getopacity = function(area) {
	if (area.style.opacity <= 1) {
		return area.style.opacity * 100;
	}
	if (area.style.filter) {
		//alpha(opacity=NaN)
		return parseInt(area.style.filter.replace(/alpha\(opacity\=([^\)]*)\)/ig, "$1"), 10);	
	}
	return 100;//default opacity
};


/**
 *	Removes the actively selected area.
 *	@author	Adam Maschek (adam.maschek(at)gmail.com)
 *	@date	11-02-2007 20:40:58
 */
imgmap.prototype.removeArea = function() {
	if (this.viewmode === 1) {return;}//exit if preview mode
	var id = this.currentid;
	this.fireEvent('onRemoveArea', id);
	if (this.props[id]) {
		//shall we leave the last one?
		var pprops = this.props[id].parentNode;
		pprops.removeChild(this.props[id]);
		var lastid = pprops.lastChild.aid;
		this.props[id] = null;
		try {
			this.form_selectRow(lastid, true);
			this.currentid = lastid;
		}
		catch (err) {
			//alert('noparent');
		}
	}

	try {
		//remove area and label
		this.areas[id].parentNode.removeChild(this.areas[id]);
		this.areas[id].label.parentNode.removeChild(this.areas[id].label);
	}
	catch (err) {
		//alert('noparent');
	}
	this.areas[id] = null;
	//update grand html
	if (this.html_container) {this.html_container.value = this.getMapHTML();}
};


/**
 *	Removes all areas.
 *	@author	Adam Maschek (adam.maschek(at)gmail.com)
 *	@date	2006-06-07 11:55:34
 */
imgmap.prototype.removeAllAreas = function() {
	for (var i = 0; i < this.props.length; i++) {
		if (this.props[i]) {
			if (this.props[i].parentNode) {this.props[i].parentNode.removeChild(this.props[i]);}
			if (this.areas[i].parentNode) {this.areas[i].parentNode.removeChild(this.areas[i]);}
			if (this.areas[i].label) {this.areas[i].label.parentNode.removeChild(this.areas[i].label);}
			this.props[i] = null;
			this.areas[i] = null;
			if (this.props.length > 0 && this.props[i]) {this.form_selectRow((this.props.length - 1), true);}
		}
	}
};


imgmap.prototype._putlabel = function(id) {
	if (this.viewmode === 1) {return;}//exit if preview mode
	if (!this.areas[id].label) {return;}//not yet inited
	try {
		if (!this.config.label) {
			this.areas[id].label.innerHTML     = '';
			this.areas[id].label.style.display = 'none';
		}
		else {
			this.areas[id].label.style.display = '';
			var label = this.config.label;
			label = label.replace(/%n/g, String(id));
			label = label.replace(/%c/g, String(this.areas[id].lastInput));
			label = label.replace(/%h/g, String(this.areas[id].ahref));
			label = label.replace(/%a/g, String(this.areas[id].aalt));
			label = label.replace(/%t/g, String(this.areas[id].atitle));
			this.areas[id].label.innerHTML = label;
		}
		//align to the top left corner
		this.areas[id].label.style.top  = this.areas[id].style.top;
		this.areas[id].label.style.left = this.areas[id].style.left;
	}
	catch (err) {
		this.log("Error putting label", 1);
	}
};


imgmap.prototype._puthint = function(id) {
	try {
		if (!this.config.hint) {
			this.areas[id].title = '';
			this.areas[id].alt   = '';
		}
		else {
			var hint = this.config.hint;
			hint = hint.replace(/%n/g, String(id));
			hint = hint.replace(/%c/g, String(this.areas[id].lastInput));
			hint = hint.replace(/%h/g, String(this.areas[id].ahref));
			hint = hint.replace(/%a/g, String(this.areas[id].aalt));
			hint = hint.replace(/%t/g, String(this.areas[id].atitle));
			this.areas[id].title = hint;
			this.areas[id].alt   = hint;
		}
	}
	catch (err) {
		this.log("Error putting hint", 1);
	}
};


imgmap.prototype._repaintAll = function() {
	for (var i=0; i<this.areas.length; i++) {
		if (this.areas[i]) {
			this._repaint(this.areas[i], this.config.CL_NORM_SHAPE);
		}
	}
};


imgmap.prototype._repaint = function(area, color, x, y) {
	var ctx;//canvas context
	var width;//canvas width
	var height;//canvas height
	if (area.shape == 'circle') {
		width  = parseInt(area.style.width, 10);
		var radius = Math.floor(width/2) - 1;
		//get canvas context
		//alert(area.tagName);
		ctx = area.getContext("2d");
		//clear canvas
		ctx.clearRect(0, 0, width, width);
		//draw circle
		ctx.beginPath();
		ctx.strokeStyle = color;
		ctx.arc(radius, radius, radius, 0, Math.PI*2, 0);
		ctx.stroke();
		ctx.closePath();
		//draw center
		ctx.strokeStyle = this.config.CL_KNOB;
		ctx.strokeRect(radius, radius, 1, 1);
		//put label
		this._putlabel(area.aid);
		this._puthint(area.aid);
	}
	else if (area.shape == 'rectangle') {
		//put label
		this._putlabel(area.aid);
		this._puthint(area.aid);
	}
	else if (area.shape == 'polygon') {
		width  =  parseInt(area.style.width, 10);
		height =  parseInt(area.style.height, 10);
		var left   =  parseInt(area.style.left, 10);
		var top    =  parseInt(area.style.top, 10);
		if (area.xpoints) {
			//get canvas context
			ctx = area.getContext("2d");
			//clear canvas
			ctx.clearRect(0, 0, width, height);
			//draw polygon
			ctx.beginPath();
			ctx.strokeStyle = color;
			ctx.moveTo(area.xpoints[0] - left, area.ypoints[0] - top);
			for (var i=1; i<area.xpoints.length; i++) {
				ctx.lineTo(area.xpoints[i] - left , area.ypoints[i] - top);
			}
			if (this.is_drawing == this.DM_POLYGON_DRAW || this.is_drawing == this.DM_POLYGON_LASTDRAW) {
				//only draw to current position if not moving
				ctx.lineTo(x - left - 5 , y - top - 5);
			}
			ctx.lineTo(area.xpoints[0] - left , area.ypoints[0] - top);
			ctx.stroke();
			ctx.closePath();
		}
		//put label
		this._putlabel(area.aid);
		this._puthint(area.aid);
	}
};


/**
 *	Updates Area coordinates on the properties fieldset.
 *	Called when needed, eg. on mousemove, mousedown.
 *	Also updates html container value.
 *	@date	2006.10.24. 22:39:27
 *	@author	Adam Maschek (adam.maschek(at)gmail.com)
 */
imgmap.prototype._updatecoords = function() {
	var left   = parseInt(this.areas[this.currentid].style.left, 10);
	var top    = parseInt(this.areas[this.currentid].style.top, 10);
	var height = parseInt(this.areas[this.currentid].style.height, 10);
	var width  = parseInt(this.areas[this.currentid].style.width, 10);
	
	var value = '' ;
	if (this.areas[this.currentid].shape == 'rectangle') {
		value = left + ',' + top + ',' + (left + width) + ',' + (top + height);
		this.areas[this.currentid].lastInput = value;
	}
	else if (this.areas[this.currentid].shape == 'circle') {
		var radius = Math.floor(width/2) - 1;
		value = (left + radius) + ',' +	(top + radius) + ',' + radius;
		this.areas[this.currentid].lastInput = value;
	}
	else if (this.areas[this.currentid].shape == 'polygon') {
		value = '';
		if (this.areas[this.currentid].xpoints) {
			for (var i=0; i<this.areas[this.currentid].xpoints.length; i++) {
				value+= this.areas[this.currentid].xpoints[i] + ',' + this.areas[this.currentid].ypoints[i] + ',';
			}
			value = value.substring(0, value.length - 1);
		}
		this.areas[this.currentid].lastInput = value;
	}

	if (this.props[this.currentid]) {
		this.props[this.currentid].getElementsByTagName('input')[2].value = value;
	}
	
	if (this.html_container) {
		this.html_container.value = this.getMapHTML();
	}
};


/**
 *	Updates the visual representation of the area with the given id according
 *	to the input element that contains the coordinates.
 *	@date	2006.10.24. 22:46:55
 *	@author	Adam Maschek (adam.maschek(at)gmail.com)
 */
imgmap.prototype._recalculate = function(id) {
	var coords = '';
	var input = null;
	try {
		if (this.props[id]) {
			input   = this.props[id].getElementsByTagName('input')[2];
			input.value = this._normCoords(input.value, this.areas[id].shape, 'preserve');
			coords  = input.value;
		}
		else {
			coords = this.areas[id].lastInput || '' ;
		}
	
		var parts   = coords.split(',');
		if (this.areas[id].shape == 'rectangle') {
			if (parts.length != 4 ||
				parseInt(parts[0], 10) > parseInt(parts[2], 10) ||
				parseInt(parts[1], 10) > parseInt(parts[3], 10)) {throw "invalid coords";}
			this.areas[id].style.left   = this.pic.offsetLeft + parseInt(parts[0], 10) + 'px';
			this.areas[id].style.top    = this.pic.offsetTop  + parseInt(parts[1], 10) + 'px';
			this.setAreaSize(id, (parts[2] - parts[0]), (parts[3] - parts[1]));
			this._repaint(this.areas[id], this.config.CL_NORM_SHAPE);
		}
		else if (this.areas[id].shape == 'circle') {
			if (parts.length != 3 ||
				parseInt(parts[2], 10) < 0) {throw "invalid coords";}
			var width = 2 * (1 * parts[2] + 1);
			//alert(parts[2]);
			//alert(width);
			this.setAreaSize(id, width, width);
			this.areas[id].style.left   = this.pic.offsetLeft + parseInt(parts[0], 10) - width/2 + 'px';
			this.areas[id].style.top    = this.pic.offsetTop  + parseInt(parts[1], 10) - width/2 + 'px';
			this._repaint(this.areas[id], this.config.CL_NORM_SHAPE);
		}
		else if (this.areas[id].shape == 'polygon') {
			if (parts.length < 2) {throw "invalid coords";}
			this.areas[id].xpoints = [];
			this.areas[id].ypoints = [];
			for (var i=0; i<parts.length; i+=2) {
				this.areas[id].xpoints[this.areas[id].xpoints.length]  = this.pic.offsetLeft + parseInt(parts[i], 10);
				this.areas[id].ypoints[this.areas[id].ypoints.length]  = this.pic.offsetTop  + parseInt(parts[i+1], 10); 
				this._polygongrow(this.areas[id], parts[i], parts[i+1]);
			}
			this._polygonshrink(this.areas[id]);//includes repaint
		}
	}
	catch (err) {
		var msg = (err.message) ? err.message : 'error calculating coordinates';
		this.log(msg, 1);
		this.statusMessage(this.strings.ERR_INVALID_COORDS);
		if (this.areas[id].lastInput && input) {input.value = this.areas[id].lastInput;}
		this._repaint(this.areas[id], this.config.CL_NORM_SHAPE);
		return;
	}
	//on success update lastInput
	this.areas[id].lastInput = coords;
};


/**
 *	Grow polygon area to be able to contain the given new coordinates.
 *	@author	adam
 */
imgmap.prototype._polygongrow = function(area, newx, newy) {
	//this.log('pgrow');
	var xdiff = newx - parseInt(area.style.left, 10);
	var ydiff = newy - parseInt(area.style.top , 10);
	var pad   = 0;//padding on the edges
	var pad2  = 0;//twice the padding
	
	if (newx < parseInt(area.style.left, 10)) {
		area.style.left   = (newx - pad) + 'px';
		this.setAreaSize(area.aid, parseInt(area.style.width, 10) + Math.abs(xdiff) + pad2, null);
	}
	else if (newx > parseInt(area.style.left, 10) + parseInt(area.style.width, 10)) {
		this.setAreaSize(area.aid, newx - parseInt(area.style.left, 10) + pad2, null);
	}
	if (newy < parseInt(area.style.top, 10)) {
		area.style.top    = (newy - pad) + 'px';
		this.setAreaSize(area.aid, null, parseInt(area.style.height, 10) + Math.abs(ydiff) + pad2);
	}
	else if (newy > parseInt(area.style.top, 10) + parseInt(area.style.height, 10)) {
		this.setAreaSize(area.aid, null, newy - parseInt(area.style.top, 10) + pad2);
	}
};


/**
 *	Shrink the polygon bounding area to the necessary size, by first reducing it
 *	to the minimum, and then gradually growing it.
 *	@author	adam
 */
imgmap.prototype._polygonshrink = function(area) {
	//this.log('pshrink');
	area.style.left = (area.xpoints[0]) + 'px';
	area.style.top  = (area.ypoints[0]) + 'px';
	this.setAreaSize(area.aid, 0, 0);
	for (var i=0; i<area.xpoints.length; i++) {
		this._polygongrow(area, area.xpoints[i], area.ypoints[i]);
	}
	this._repaint(area, this.config.CL_NORM_SHAPE);
};


imgmap.prototype.img_mousemove = function(e) {
	//function level var declarations
	var x;
	var y;
	var xdiff;
	var ydiff;
	var diff;

	if (this.viewmode === 1) {return;}//exit if preview mode
	//event.x is relative to parent element, but page.x is NOT
	//pos coordinates are the same absolute coords, offset coords are relative to parent
	var pos = this._getPos(this.pic);
	x = (this.isMSIE) ? (window.event.x - this.pic.offsetLeft) : (e.pageX - pos.x);
	y = (this.isMSIE) ? (window.event.y - this.pic.offsetTop)  : (e.pageY - pos.y);
	x = x + this.pic_container.scrollLeft;
	y = y + this.pic_container.scrollTop;
	
	
	//this.log(x + ' - ' + y + ': ' + this.memory[this.currentid].downx + ' - ' +this.memory[this.currentid].downy);
	
	//exit if outside image
	if (x<0 || y<0 || x>this.pic.width || y>this.pic.height) {return;}
	
	//old dimensions that need to be updated in this function
	if (this.memory[this.currentid]) {
		var top    = this.memory[this.currentid].top;
		var left   = this.memory[this.currentid].left;
		var height = this.memory[this.currentid].height;
		var width  = this.memory[this.currentid].width;
	}
	
	// Handle shift state for Safari
	// Safari doesn't generate keyboard events for modifiers: http://bugs.webkit.org/show_bug.cgi?id=11696
	if (this.isSafari) {
		if (e.shiftKey) {
			if (this.is_drawing == this.DM_RECTANGLE_DRAW) {
				this.is_drawing = this.DM_SQUARE_DRAW;
				this.statusMessage(this.strings.SQUARE2_DRAW);
			}
		}
		else {
			if (this.is_drawing == this.DM_SQUARE_DRAW && this.areas[this.currentid].shape == 'rectangle') {
				//not for circle!
				this.is_drawing = this.DM_RECTANGLE_DRAW;
				this.statusMessage(this.strings.RECTANGLE_DRAW);
			}
		}
	}

	
	if (this.is_drawing == this.DM_RECTANGLE_DRAW) {
		//rectangle mode
		this.fireEvent('onDrawArea', this.currentid);
		xdiff = x - this.memory[this.currentid].downx;
		ydiff = y - this.memory[this.currentid].downy;
		//alert(xdiff);
		this.setAreaSize(this.currentid, Math.abs(xdiff), Math.abs(ydiff));
		if (xdiff < 0) {
			this.areas[this.currentid].style.left = (x + 1) + 'px';
		}
		if (ydiff < 0) {
			this.areas[this.currentid].style.top  = (y + 1) + 'px';
		}
	}
	else if (this.is_drawing == this.DM_SQUARE_DRAW) {
		//square mode - align to shorter side
		this.fireEvent('onDrawArea', this.currentid);
		xdiff = x - this.memory[this.currentid].downx;
		ydiff = y - this.memory[this.currentid].downy;
		if (Math.abs(xdiff) < Math.abs(ydiff)) {
			diff = Math.abs(parseInt(xdiff, 10));
		}
		else {
			diff = Math.abs(parseInt(ydiff, 10));
		}
		//alert(xdiff);
		this.setAreaSize(this.currentid, diff, diff);
		if (xdiff < 0) {
			this.areas[this.currentid].style.left = (this.memory[this.currentid].downx + diff*-1) + 'px';
		}
		if (ydiff < 0) {
			this.areas[this.currentid].style.top = (this.memory[this.currentid].downy + diff*-1 + 1) + 'px';
		}
	}
	else if (this.is_drawing == this.DM_POLYGON_DRAW) {
		//polygon mode
		this.fireEvent('onDrawArea', this.currentid);
		this._polygongrow(this.areas[this.currentid], x, y);
	}
	else if (this.is_drawing == this.DM_RECTANGLE_MOVE || this.is_drawing == this.DM_SQUARE_MOVE) {
		this.fireEvent('onMoveArea', this.currentid);
		x = x - this.memory[this.currentid].rdownx;
		y = y - this.memory[this.currentid].rdowny;
		if (x + width > this.pic.width || y + height > this.pic.height) {return;}
		if (x < 0 || y < 0) {return;}
		//this.log(x + ' - '+width+ '+'+this.memory[this.currentid].rdownx +'='+xdiff );
		this.areas[this.currentid].style.left = x + 1 + 'px';
		this.areas[this.currentid].style.top  = y + 1 + 'px';
	}
	else if (this.is_drawing == this.DM_POLYGON_MOVE) {
		this.fireEvent('onMoveArea', this.currentid);
		x = x - this.memory[this.currentid].rdownx;
		y = y - this.memory[this.currentid].rdowny;
		if (x + width > this.pic.width || y + height > this.pic.height) {return;}
		if (x < 0 || y < 0) {return;}
		xdiff = x - left;
		ydiff = y - top;
		if (this.areas[this.currentid].xpoints) {
			for (var i=0; i<this.areas[this.currentid].xpoints.length; i++) {
				this.areas[this.currentid].xpoints[i] = this.memory[this.currentid].xpoints[i] + xdiff;
				this.areas[this.currentid].ypoints[i] = this.memory[this.currentid].ypoints[i] + ydiff;
			}
		}
		this.areas[this.currentid].style.left = x + 'px';
		this.areas[this.currentid].style.top  = y + 'px';
	}
	else if (this.is_drawing == this.DM_SQUARE_RESIZE_LEFT) {
		this.fireEvent('onResizeArea', this.currentid);
		diff = x - left;
		//alert(diff);
		if ((width  + (-1 * diff)) > 0) {
			//real resize left
			this.areas[this.currentid].style.left   = x + 1 + 'px';
			this.areas[this.currentid].style.top    = (top    + (diff/2)) + 'px';
			this.setAreaSize(this.currentid, parseInt(width  + (-1 * diff), 10), parseInt(height + (-1 * diff), 10));
		}
		else {
			//jump to another state
			this.memory[this.currentid].width  = 0;
			this.memory[this.currentid].height = 0;
			this.memory[this.currentid].left   = x;
			this.memory[this.currentid].top    = y;
			this.is_drawing = this.DM_SQUARE_RESIZE_RIGHT;
		}
	}
	else if (this.is_drawing == this.DM_SQUARE_RESIZE_RIGHT) {
		this.fireEvent('onResizeArea', this.currentid);
		diff = x - left - width;
		if ((width  + (diff)) - 1 > 0) {
			//real resize right
			this.areas[this.currentid].style.top    = (top    + (-1* diff/2)) + 'px';
			this.setAreaSize(this.currentid, (width  + (diff)) - 1, (height + (diff)));
		}
		else {
			//jump to another state
			this.memory[this.currentid].width  = 0;
			this.memory[this.currentid].height = 0;
			this.memory[this.currentid].left   = x;
			this.memory[this.currentid].top    = y;
			this.is_drawing = this.DM_SQUARE_RESIZE_LEFT;
		}
	}
	else if (this.is_drawing == this.DM_SQUARE_RESIZE_TOP) {
		this.fireEvent('onResizeArea', this.currentid);
		diff = y - top;
		if ((width  + (-1 * diff)) > 0) {
			//real resize top
			this.areas[this.currentid].style.top    = y + 1 + 'px';
			this.areas[this.currentid].style.left   = (left   + (diff/2)) + 'px';
			this.setAreaSize(this.currentid, (width  + (-1 * diff)), (height + (-1 * diff)));
		}
		else {
			//jump to another state
			this.memory[this.currentid].width  = 0;
			this.memory[this.currentid].height = 0;
			this.memory[this.currentid].left   = x;
			this.memory[this.currentid].top    = y;
			this.is_drawing = this.DM_SQUARE_RESIZE_BOTTOM;
		}
	}
	else if (this.is_drawing == this.DM_SQUARE_RESIZE_BOTTOM) {
		this.fireEvent('onResizeArea', this.currentid);
		diff = y - top - height;
		if ((width  + (diff)) - 1 > 0) {
			//real resize bottom
			this.areas[this.currentid].style.left   = (left   + (-1* diff/2)) + 'px';
			this.setAreaSize(this.currentid, (width  + (diff)) - 1 , (height + (diff)) - 1);
		}
		else {
			//jump to another state
			this.memory[this.currentid].width  = 0;
			this.memory[this.currentid].height = 0;
			this.memory[this.currentid].left   = x;
			this.memory[this.currentid].top    = y;
			this.is_drawing = this.DM_SQUARE_RESIZE_TOP;
		}
	}
	else if (this.is_drawing == this.DM_RECTANGLE_RESIZE_LEFT) {
		this.fireEvent('onResizeArea', this.currentid);
		xdiff = x - left;
		if (width + (-1 * xdiff) > 0) {
			//real resize left
			this.areas[this.currentid].style.left = x + 1 + 'px';
			this.setAreaSize(this.currentid, width + (-1 * xdiff), null);
		}
		else {
			//jump to another state
			this.memory[this.currentid].width = 0;
			this.memory[this.currentid].left  = x;
			this.is_drawing = this.DM_RECTANGLE_RESIZE_RIGHT;
		}
	}
	else if (this.is_drawing == this.DM_RECTANGLE_RESIZE_RIGHT) {
		this.fireEvent('onResizeArea', this.currentid);
		xdiff = x - left - width;
		if ((width  + (xdiff)) - 1 > 0) {
			//real resize right
			this.setAreaSize(this.currentid, (width  + (xdiff)) - 1, null);
		}
		else {
			//jump to another state
			this.memory[this.currentid].width = 0;
			this.memory[this.currentid].left  = x;
			this.is_drawing = this.DM_RECTANGLE_RESIZE_LEFT;
		}
	}
	else if (this.is_drawing == this.DM_RECTANGLE_RESIZE_TOP) {
		this.fireEvent('onResizeArea', this.currentid);
		ydiff = y - top;
		if ((height + (-1 * ydiff)) > 0) {
			//real resize top
			this.areas[this.currentid].style.top   = y + 1 + 'px';
			this.setAreaSize(this.currentid, null, (height + (-1 * ydiff)));
		}
		else {
			//jump to another state
			this.memory[this.currentid].height = 0;
			this.memory[this.currentid].top    = y;
			this.is_drawing = this.DM_RECTANGLE_RESIZE_BOTTOM;
		}
	}
	else if (this.is_drawing == this.DM_RECTANGLE_RESIZE_BOTTOM) {
		this.fireEvent('onResizeArea', this.currentid);
		ydiff = y - top - height;
		if ((height + (ydiff)) - 1 > 0) {
			//real resize bottom
			this.setAreaSize(this.currentid, null, (height + (ydiff)) - 1);
		}
		else {
			//jump to another state
			this.memory[this.currentid].height = 0;
			this.memory[this.currentid].top    = y;
			this.is_drawing = this.DM_RECTANGLE_RESIZE_TOP;
		}
	}
	
	//repaint canvas elements
	if (this.is_drawing) {
		this._repaint(this.areas[this.currentid], this.config.CL_DRAW_SHAPE, x, y);
		this._updatecoords();
	}

};


imgmap.prototype.img_mouseup = function(e) {
	if (this.viewmode === 1) {return;}//exit if preview mode
	//console.log('img_mouseup');
	//if (!this.props[this.currentid]) return;
	var pos = this._getPos(this.pic);
	var x = (this.isMSIE) ? (window.event.x - this.pic.offsetLeft) : (e.pageX - pos.x);
	var y = (this.isMSIE) ? (window.event.y - this.pic.offsetTop)  : (e.pageY - pos.y);
	x = x + this.pic_container.scrollLeft;
	y = y + this.pic_container.scrollTop;
	//for everything that is move or resize
	if (this.is_drawing != this.DM_RECTANGLE_DRAW &&
		this.is_drawing != this.DM_SQUARE_DRAW &&
		this.is_drawing != this.DM_POLYGON_DRAW &&
		this.is_drawing != this.DM_POLYGON_LASTDRAW) {
		//end dragging
		this.draggedId = null;
		//finish state
		this.is_drawing = 0;
		this.statusMessage(this.strings.READY);
		this.relaxArea(this.currentid);
		if (this.areas[this.currentid] == this._getLastArea()) {
			//if (this.config.mode != "editor2") this.addNewArea();
			return;
		}
		this.memory[this.currentid].downx  = x;
		this.memory[this.currentid].downy  = y;
	}
};


imgmap.prototype.img_mousedown = function(e) {
	if (this.viewmode === 1) {return;}//exit if preview mode
	if (!this.areas[this.currentid] && this.config.mode != "editor2") {return;}
	//console.log('img_mousedown');
	var pos = this._getPos(this.pic);

	var x = (this.isMSIE) ? (window.event.x - this.pic.offsetLeft) : (e.pageX - pos.x);
	var y = (this.isMSIE) ? (window.event.y - this.pic.offsetTop)  : (e.pageY - pos.y);
	x = x + this.pic_container.scrollLeft;
	y = y + this.pic_container.scrollTop;
	
	// Handle the Shift state
	if (!e) {
		e = window.event;
	}

	if (e.shiftKey)	{
		if (this.is_drawing == this.DM_POLYGON_DRAW) {
			this.is_drawing = this.DM_POLYGON_LASTDRAW;
		}
	}
	//console.log(this.is_drawing);
	//this.statusMessage(x + ' - ' + y + ': ' + this.props[this.currentid].getElementsByTagName('select')[0].value);
	if (this.is_drawing == this.DM_POLYGON_DRAW) {
		//its not finish state yet
		this.areas[this.currentid].xpoints[this.areas[this.currentid].xpoints.length] = x - 5;
		this.areas[this.currentid].ypoints[this.areas[this.currentid].ypoints.length] = y - 5;
		this.memory[this.currentid].downx  = x;
		this.memory[this.currentid].downy  = y;
		return;
	}
	else if (this.is_drawing && this.is_drawing != this.DM_POLYGON_DRAW) {
		//finish any other state
		if (this.is_drawing == this.DM_POLYGON_LASTDRAW) {
			//add last controlpoint and update coords
			this.areas[this.currentid].xpoints[this.areas[this.currentid].xpoints.length] = x - 5;
			this.areas[this.currentid].ypoints[this.areas[this.currentid].ypoints.length] = y - 5;
			this._updatecoords();
			this.is_drawing = 0;
			this._polygonshrink(this.areas[this.currentid]);
		}
		this.is_drawing = 0;
		this.statusMessage(this.strings.READY);
		this.relaxArea(this.currentid);
		if (this.areas[this.currentid] == this._getLastArea()) {
			//editor mode adds next area automatically
			if (this.config.mode != "editor2") {this.addNewArea();}
			return;
		}
		return;
	}
	
	if (this.config.mode == "editor2") {
		if (!this.nextShape) {return;}
		this.addNewArea();
		//console.log("init: " + this.nextShape);
		this.initArea(this.currentid, this.nextShape);
	}
	else if (this.areas[this.currentid].shape == 'undefined' || this.areas[this.currentid].shape == 'polygon') {
		var shape = (this.props[this.currentid]) ? this.props[this.currentid].getElementsByTagName('select')[0].value : this.nextShape;
		if (!shape) {shape = 'rectangle';}
		//console.log("init: " + shape);
		this.initArea(this.currentid, shape);
	}
	if (this.areas[this.currentid].shape == 'polygon') {
		this.is_drawing = this.DM_POLYGON_DRAW;
		this.statusMessage(this.strings.POLYGON_DRAW);
		
		this.areas[this.currentid].style.left = x + 'px';
		this.areas[this.currentid].style.top  = y + 'px';
		if (this.config.bounding_box) {
			this.areas[this.currentid].style.borderWidth = '1px';
			this.areas[this.currentid].style.borderStyle = 'dotted';
			this.areas[this.currentid].style.borderColor = this.config.CL_DRAW_BOX;
		}
		this.areas[this.currentid].style.width  = 0;
		this.areas[this.currentid].style.height = 0;
		this.areas[this.currentid].xpoints = [];
		this.areas[this.currentid].ypoints = [];
		this.areas[this.currentid].xpoints[0] = x;
		this.areas[this.currentid].ypoints[0] = y;
	}
	else if (this.areas[this.currentid].shape == 'rectangle') {
		this.is_drawing = this.DM_RECTANGLE_DRAW;
		this.statusMessage(this.strings.RECTANGLE_DRAW);
		
		this.areas[this.currentid].style.left = x + 'px';
		this.areas[this.currentid].style.top  = y + 'px';
		this.areas[this.currentid].style.borderWidth = '1px';
		this.areas[this.currentid].style.borderStyle = 'dotted';
		this.areas[this.currentid].style.borderColor = this.config.CL_DRAW_SHAPE;
		this.areas[this.currentid].style.width  = 0;
		this.areas[this.currentid].style.height = 0;
	}
	else if (this.areas[this.currentid].shape == 'circle') {
		this.is_drawing = this.DM_SQUARE_DRAW;
		this.statusMessage(this.strings.SQUARE_DRAW);
				
		this.areas[this.currentid].style.left = x + 'px';
		this.areas[this.currentid].style.top  = y + 'px';
		if (this.config.bounding_box) {
			this.areas[this.currentid].style.borderWidth = '1px';
			this.areas[this.currentid].style.borderStyle = 'dotted';
			this.areas[this.currentid].style.borderColor = this.config.CL_DRAW_BOX;
		}
		this.areas[this.currentid].style.width  = 0;
		this.areas[this.currentid].style.height = 0;
	}

	this.memory[this.currentid].downx  = x;
	this.memory[this.currentid].downy  = y;
};


/**
 *	Highlights a given area.
 *	@date	2007.12.28. 18:23:00
 */
imgmap.prototype.highlightArea = function(id, flag) {
	if (this.is_drawing) {return;}//exit if in drawing state
	if (this.areas[id] && this.areas[id].shape != 'undefined') {
		//area exists - highlight it
		this.fireEvent('onFocusArea', this.areas[id]);
		if (this.areas[id].shape == 'rectangle') {
			this.areas[id].style.borderWidth = '1px';
			this.areas[id].style.borderStyle = 'solid';
			this.areas[id].style.borderColor = this.config.CL_HIGHLIGHT_SHAPE;
		}
		else if (this.areas[id].shape == 'circle' || this.areas[id].shape == 'polygon') {
			if (this.config.bounding_box) {
				this.areas[id].style.borderWidth = '1px';
				this.areas[id].style.borderStyle = 'solid';
				this.areas[id].style.borderColor = this.config.CL_HIGHLIGHT_BOX;
			}
		}
		var opacity = this.config.highlight_opacity;
		if (flag == 'grad') {
			//apply gradient opacity
			opacity = '-' + opacity;
		}
		this._setopacity(this.areas[id], this.config.CL_HIGHLIGHT_BG, opacity);
		this._repaint(this.areas[id], this.config.CL_HIGHLIGHT_SHAPE);
	}
};


/**
 *	Blurs a given area.
 *	@date	2007.12.28. 18:23:26
 */
imgmap.prototype.blurArea = function(id, flag) {
	if (this.is_drawing) {return;}//exit if in drawing state
	if (this.areas[id] && this.areas[id].shape != 'undefined') {
		//area exists - fade it back
		this.fireEvent('onBlurArea', this.areas[id]);
		if (this.areas[id].shape == 'rectangle') {
			this.areas[id].style.borderWidth = '1px';
			this.areas[id].style.borderStyle = 'solid';
			this.areas[id].style.borderColor = this.config.CL_NORM_SHAPE;
		}
		else if (this.areas[id].shape == 'circle' || this.areas[id].shape == 'polygon') {
			if (this.config.bounding_box) {
				this.areas[id].style.borderWidth = '1px';
				this.areas[id].style.borderStyle = 'solid';
				this.areas[id].style.borderColor = this.config.CL_NORM_BOX;
			}
		}
		var opacity = this.config.norm_opacity;
		if (flag == 'grad') {
			//apply gradient opacity
			opacity = '-' + opacity;
		}
		this._setopacity(this.areas[id], this.config.CL_NORM_BG, opacity);
		this._repaint(this.areas[id], this.config.CL_NORM_SHAPE);
	}
};


/**
 *	Handles mouseover on props row.
 */
imgmap.prototype.img_area_mouseover = function(e) {
	if (this.is_drawing) {return;}//exit if in drawing state
	if (this.viewmode === 1) {return;}//exit if preview mode
	var obj = (this.isMSIE) ? window.event.srcElement : e.currentTarget;
	if (typeof obj.aid == 'undefined') {obj = obj.parentNode;}
	this.highlightArea(obj.aid);
};


/**
 *	Handles mouseout on props row.
 */
imgmap.prototype.img_area_mouseout = function(e) {
	if (this.is_drawing) {return;}//exit if in drawing state
	if (this.viewmode === 1) {return;}//exit if preview mode
	var obj = (this.isMSIE) ? window.event.srcElement : e.currentTarget;
	if (typeof obj.aid == 'undefined') {obj = obj.parentNode;}
	this.blurArea(obj.aid);
};


imgmap.prototype.img_area_click = function(e) {
	if (this.viewmode === 1) {return;}//exit if preview mode
	var obj = (this.isMSIE) ? window.event.srcElement : e.currentTarget;
	if (typeof obj.aid == 'undefined') {obj = obj.parentNode;}
	this.form_selectRow(obj.aid, false);
	this.currentid = obj.aid;
};


/**
 *	Handles click on a property row.
 *	id can be the this.props[i] object or i itself.
 *	@author	Adam Maschek (adam.maschek(at)gmail.com)
 *	@date	2006-06-06 16:55:29
 */
imgmap.prototype.form_selectRow = function(id, setfocus) {
	if (this.is_drawing) {return;}//exit if in drawing state
	if (this.viewmode === 1) {return;}//exit if preview mode
	if (!this.form_container) {return;}//exit if no form container
	if (!document.getElementById('img_active_'+id)) {return;}
	document.getElementById('img_active_'+id).checked = 1;
	if (setfocus) {document.getElementById('img_active_'+id).focus();}
	//remove all background styles
	for (var i = 0; i < this.props.length; i++) {
		if (this.props[i]) {
			this.props[i].style.background = '';
		}
	}
	//put highlight on actual props row
	this.props[id].style.background = this.config.CL_HIGHLIGHT_PROPS;
	//fire custom event
	this.fireEvent('onSelectRow', this.props[id]);
};


/**
 *	Handles delete keypress on any form row.
 *	@author	adam 
 */
imgmap.prototype.img_area_keydown = function(e) {
	if (this.viewmode === 1) {return;}//exit if preview mode
	var key = (this.isMSIE) ? event.keyCode : e.keyCode;
	//alert(key);
	if (key == 46) {
		//delete pressed
		this.removeArea();
	}
};


/**
 *	Called when the properties line loses focus, and the recalculate function
 *	must be called.
 *	@date	2006.10.24. 22:42:02
 *	@author	Adam Maschek (adam.maschek(at)gmail.com)
 */
imgmap.prototype.img_area_blur = function(e) {
	if (this.viewmode === 1) {return;}//exit if preview mode
	if (this.is_drawing) {return;}//exit if drawing
	//console.log('blur');
	var obj = (this.isMSIE) ? window.event.srcElement : e.currentTarget;
	//console.log(obj);
	var id = obj.parentNode.aid;
	//console.log(this.areas[id]);
	if (obj.name == 'img_href')        {this.areas[id].ahref   = obj.value;}
	else if (obj.name == 'img_alt')    {this.areas[id].aalt    = obj.value;}
	else if (obj.name == 'img_title')  {this.areas[id].atitle  = obj.value;}
	else if (obj.name == 'img_target') {this.areas[id].atarget = obj.value;}
	else if (obj.name == 'img_shape' && this.areas[id].shape != obj.value && this.areas[id].shape != 'undefined') {
		//shape changed, adjust coords intelligently inside _normCoords
		var coords = '';
		if (this.props[id]) {
			coords  =  this.props[id].getElementsByTagName('input')[2].value;
		}
		else {
			coords = this.areas[id].lastInput || '' ;
		}
		coords = this._normCoords(coords, obj.value, 'from'+this.areas[id].shape);
		if (this.props[id]) {
			this.props[id].getElementsByTagName('input')[2].value  = coords;
		}
		this.areas[id].lastInput = coords;
		this.areas[id].shape = obj.value;
	}
	if (this.areas[id]  && this.areas[id].shape != 'undefined') {
		this._recalculate(id);
		if (this.html_container) {this.html_container.value = this.getMapHTML();}
	}
};


/**
 *	Called when the grand HTML code loses focus, and the changes must be reflected.
 *	@date	2006.10.24. 22:51:20
 *	@author	Adam Maschek (adam.maschek(at)gmail.com)
 */
imgmap.prototype.html_container_blur = function(e) {
	var oldvalue = this.html_container.getAttribute('oldvalue');
	if (oldvalue != this.html_container.value) {
		if (this.viewmode === 1) {return;}//exit if preview mode
		this.setMapHTML(this.html_container.value);
	}
};


/**
 *	Called when the optional html container gets focus.
 *	We need to memorize its old value in order to be able to
 *	detect changes in the code that needs to be reflected.
 *	@date	20-02-2007 17:51:16
 *	@author Adam Maschek (adam.maschek(at)gmail.com)
 */
imgmap.prototype.html_container_focus = function(e) {
	this.html_container.setAttribute('oldvalue', this.html_container.value);
	this.html_container.select();
};


/**
 *	Handles event of mousemove on imgmap areas.
 *	@url	http://evolt.org/article/Mission_Impossible_mouse_position/17/23335/index.html
 */
imgmap.prototype.area_mousemove = function(e) {
	if (this.viewmode === 1) {return;}//exit if preview mode
	if (!this.is_drawing) {
		var obj = (this.isMSIE) ? window.event.srcElement : e.currentTarget;
		if (obj.tagName == 'DIV') {
			//do this because of label
			obj = obj.parentNode;
		}
		if (obj.tagName == 'image' || obj.tagName == 'group' ||
			obj.tagName == 'shape' || obj.tagName == 'stroke') {
			//do this because of excanvas
			obj = obj.parentNode.parentNode;
		}
		//opera fix - adam - 04-12-2007 23:14:05
		if (this.isOpera) {
			e.layerX = e.offsetX;
			e.layerY = e.offsetY;
		}
		var xdiff = (this.isMSIE) ? (window.event.offsetX) : (e.layerX);
		var ydiff = (this.isMSIE) ? (window.event.offsetY) : (e.layerY);
		//this.log(obj.aid + ' : ' + xdiff + ',' + ydiff);
		if (xdiff < 6 && ydiff > 6) {
			//move left
			if (obj.shape != 'polygon') {
				obj.style.cursor = 'w-resize';
			}
		}
		else if (xdiff > parseInt(obj.style.width, 10) - 6  && ydiff > 6) {
			//move right
			if (obj.shape != 'polygon') {
				obj.style.cursor = 'e-resize';
			}
		}
		else if (xdiff > 6 && ydiff < 6) {
			//move top
			if (obj.shape != 'polygon') {
				obj.style.cursor = 'n-resize';
			}
		}
		else if (ydiff > parseInt(obj.style.height, 10) - 6  && xdiff > 6) {
			//move bottom
			if (obj.shape != 'polygon') {
				obj.style.cursor = 's-resize';
			}
		}
		else {
			//move all
			obj.style.cursor = 'move';
		}
		if (obj.aid != this.draggedId) {
			//not dragged or different
			if (obj.style.cursor == 'move') {obj.style.cursor = 'default';}
			return;
		}
		//moved here from mousedown
		if (xdiff < 6 && ydiff > 6) {
			//move left
			if (this.areas[this.currentid].shape == 'circle') {
				this.is_drawing = this.DM_SQUARE_RESIZE_LEFT;
				this.statusMessage(this.strings.SQUARE_RESIZE_LEFT);
				if (this.config.bounding_box) {
					this.areas[this.currentid].style.borderColor = this.config.CL_DRAW_BOX;
				}
			}
			else if (this.areas[this.currentid].shape == 'rectangle') {
				this.is_drawing = this.DM_RECTANGLE_RESIZE_LEFT;
				this.statusMessage(this.strings.RECTANGLE_RESIZE_LEFT);
				this.areas[this.currentid].style.borderColor = this.config.CL_DRAW_SHAPE;
			}
		}
		else if (xdiff > parseInt(this.areas[this.currentid].style.width, 10) - 6  && ydiff > 6) {
			//move right
			if (this.areas[this.currentid].shape == 'circle') {
				this.is_drawing = this.DM_SQUARE_RESIZE_RIGHT;
				this.statusMessage(this.strings.SQUARE_RESIZE_RIGHT);
				if (this.config.bounding_box) {
					this.areas[this.currentid].style.borderColor = this.config.CL_DRAW_BOX;
				}
			}
			else if (this.areas[this.currentid].shape == 'rectangle') {
				this.is_drawing = this.DM_RECTANGLE_RESIZE_RIGHT;
				this.statusMessage(this.strings.RECTANGLE_RESIZE_RIGHT);
				this.areas[this.currentid].style.borderColor = this.config.CL_DRAW_SHAPE;
			}
		}
		else if (xdiff > 6 && ydiff < 6) {
			//move top
			if (this.areas[this.currentid].shape == 'circle') {
				this.is_drawing = this.DM_SQUARE_RESIZE_TOP;
				this.statusMessage(this.strings.SQUARE_RESIZE_TOP);
				if (this.config.bounding_box) {
					this.areas[this.currentid].style.borderColor = this.config.CL_DRAW_BOX;
				}
			}
			else if (this.areas[this.currentid].shape == 'rectangle') {
				this.is_drawing = this.DM_RECTANGLE_RESIZE_TOP;
				this.statusMessage(this.strings.RECTANGLE_RESIZE_TOP);
				this.areas[this.currentid].style.borderColor = this.config.CL_DRAW_SHAPE;
			}
		}
		else if (ydiff > parseInt(this.areas[this.currentid].style.height, 10) - 6  && xdiff > 6) {
			//move bottom
			if (this.areas[this.currentid].shape == 'circle') {
				this.is_drawing = this.DM_SQUARE_RESIZE_BOTTOM;
				this.statusMessage(this.strings.SQUARE_RESIZE_BOTTOM);
				if (this.config.bounding_box) {
					this.areas[this.currentid].style.borderColor = this.config.CL_DRAW_BOX;
				}
			}
			else if (this.areas[this.currentid].shape == 'rectangle') {
				this.is_drawing = this.DM_RECTANGLE_RESIZE_BOTTOM;
				this.statusMessage(this.strings.RECTANGLE_RESIZE_BOTTOM);
				this.areas[this.currentid].style.borderColor = this.config.CL_DRAW_SHAPE;
			}
		}
		else/*if (xdiff < 10 && ydiff < 10 ) */{
			//move all
			if (this.areas[this.currentid].shape == 'circle') {
				this.is_drawing = this.DM_SQUARE_MOVE;
				this.statusMessage(this.strings.SQUARE_MOVE);
				if (this.config.bounding_box) {
					this.areas[this.currentid].style.borderColor = this.config.CL_DRAW_BOX;
				}
				this.memory[this.currentid].rdownx = xdiff;
				this.memory[this.currentid].rdowny = ydiff;
			}
			else if (this.areas[this.currentid].shape == 'rectangle') {
				this.is_drawing = this.DM_RECTANGLE_MOVE;
				this.statusMessage(this.strings.RECTANGLE_MOVE);
				this.areas[this.currentid].style.borderColor = this.config.CL_DRAW_SHAPE;
				this.memory[this.currentid].rdownx = xdiff;
				this.memory[this.currentid].rdowny = ydiff;
			}
			else if (this.areas[this.currentid].shape == 'polygon') {
				if (this.areas[this.currentid].xpoints) {
					for (var i=0; i<this.areas[this.currentid].xpoints.length; i++) {
						this.memory[this.currentid].xpoints[i] = this.areas[this.currentid].xpoints[i];
						this.memory[this.currentid].ypoints[i] = this.areas[this.currentid].ypoints[i];
					}
				}
				this.is_drawing = this.DM_POLYGON_MOVE;
				this.statusMessage(this.strings.POLYGON_MOVE);
				if (this.config.bounding_box) {
					this.areas[this.currentid].style.borderColor = this.config.CL_DRAW_BOX;
				}
				this.memory[this.currentid].rdownx = xdiff;
				this.memory[this.currentid].rdowny = ydiff;
			}
		}
		
		//common memory settings (preparing to move or resize)
		this.memory[this.currentid].width  = parseInt(this.areas[this.currentid].style.width, 10);
		this.memory[this.currentid].height = parseInt(this.areas[this.currentid].style.height, 10);
		this.memory[this.currentid].top    = parseInt(this.areas[this.currentid].style.top, 10);
		this.memory[this.currentid].left   = parseInt(this.areas[this.currentid].style.left, 10);
		if (this.areas[this.currentid].shape == 'rectangle') {
			this.areas[this.currentid].style.borderWidth = '1px';
			this.areas[this.currentid].style.borderStyle = 'dotted';
		}
		else if (this.areas[this.currentid].shape == 'circle' || this.areas[this.currentid].shape == 'polygon') {
			if (this.config.bounding_box) {
				this.areas[this.currentid].style.borderWidth = '1px';
				this.areas[this.currentid].style.borderStyle = 'dotted';
			}
		}
		this._setopacity(this.areas[this.currentid], this.config.CL_DRAW_BG, this.config.draw_opacity);
	}
	else {
		//if drawing and not ie, have to propagate to image event
		this.img_mousemove(e);
	}
};


/**
 *	Handles event of mouseup on imgmap areas.
 */
imgmap.prototype.area_mouseup = function(e) {
	if (this.viewmode === 1) {return;}//exit if preview mode
	//console.log('area_mouseup');
	if (!this.is_drawing) {
		var obj = (this.isMSIE) ? window.event.srcElement : e.currentTarget;
		if (obj.tagName == 'DIV') {
			//do this because of label
			obj = obj.parentNode;
		}
		if (obj.tagName == 'image' || obj.tagName == 'group' ||
			obj.tagName == 'shape' || obj.tagName == 'stroke') {
			//do this because of excanvas
			obj = obj.parentNode.parentNode;
		}
		if (this.areas[this.currentid] != obj) {
			//trying to draw on a different canvas,switch to this one
			if (typeof obj.aid == 'undefined') {
				this.log('Cannot identify target area', 1);
				return;
			}
			//this.form_selectRow(obj.aid, true);
			//this.currentid = obj.aid;
		}
		this.draggedId = null;
	}
	else {
		//if drawing and not ie, have to propagate to image event
		//console.log('propup');
		this.img_mouseup(e);
	}
};


/**
 *	Handles event of mouseover on imgmap areas.
 */
imgmap.prototype.area_mouseover = function(e) {
	if (this.viewmode === 1 && this.config.mode !== '') {return;}//exit if preview mode
	if (!this.is_drawing) {
		//this.log('area_mouseover');
		//identify source object
		var obj = (this.isMSIE) ? window.event.srcElement : e.currentTarget;
		if (obj.tagName == 'DIV') {
			//do this because of label
			obj = obj.parentNode;
		}
		if (obj.tagName == 'image' || obj.tagName == 'group' ||
			obj.tagName == 'shape' || obj.tagName == 'stroke') {
			//do this because of excanvas
			obj = obj.parentNode.parentNode;
		}
		/*
		//switch to hovered area
		if (this.areas[this.currentid] != obj) {
			//trying to draw on a different canvas, switch to this one
			if (typeof obj.aid == 'undefined') {
				this.log('Cannot identify target area', 1);
				return;
			}
			this.form_selectRow(obj.aid, true);
			this.currentid = obj.aid;
		}
		*/
		this.highlightArea(obj.aid, 'grad');
	}
};


/**
 *	Handles event of mouseout on imgmap areas.
 */
imgmap.prototype.area_mouseout = function(e) {
	if (this.viewmode === 1 && this.config.mode !== '') {return;}//exit if preview mode
	if (!this.is_drawing) {
		//this.log('area_mouseout');
		//identify source object
		var obj = (this.isMSIE) ? window.event.srcElement : e.currentTarget;
		if (obj.tagName == 'DIV') {
			//do this because of label
			obj = obj.parentNode;
		}
		if (obj.tagName == 'image' || obj.tagName == 'group' ||
			obj.tagName == 'shape' || obj.tagName == 'stroke') {
			//do this because of excanvas
			obj = obj.parentNode.parentNode;
		}
		this.blurArea(obj.aid, 'grad');
	}
};


/**
 *	Handles event of mousedown on imgmap areas.
 */
imgmap.prototype.area_mousedown = function(e) {
	if (this.viewmode === 1) {return;}//exit if preview mode
	//console.log('area_mousedown');
	if (!this.is_drawing) {
		var obj = (this.isMSIE) ? window.event.srcElement : e.currentTarget;
		if (obj.tagName == 'DIV') {
			//do this because of label
			obj = obj.parentNode;
		}
		if (obj.tagName == 'image' || obj.tagName == 'group' ||
			obj.tagName == 'shape' || obj.tagName == 'stroke') {
			//do this because of excanvas
			obj = obj.parentNode.parentNode;
		}
		if (this.areas[this.currentid] != obj) {
			//trying to draw on a different canvas, switch to this one
			if (typeof obj.aid == 'undefined') {
				this.log('Cannot identify target area', 1);
				return;
			}
			this.form_selectRow(obj.aid, true);
			this.currentid = obj.aid;
		}
		//this.log('selected = '+this.currentid);
		this.draggedId  = this.currentid;
		this.selectedId = this.currentid;
		this.fireEvent('onSelectArea', this.areas[this.currentid]);
		//stop event propagation to document level
		if (this.isMSIE) {
			window.event.cancelBubble = true;
		}
		else {
			e.stopPropagation();
		}
	}
	else {
		//if drawing and not ie, have to propagate to image event
		//console.log('propdown');
		this.img_mousedown(e);
	}
};


/**
 *	Gets the position of the cursor in the input box.
 *	@author	Diego Perlini
 *	@url	http://javascript.nwbox.com/cursor_position/
 */
imgmap.prototype.getSelectionStart = function(obj) {
	if (obj.createTextRange) {
		var r = document.selection.createRange().duplicate();
		r.moveEnd('character', obj.value.length);
		if (r.text === '') {return obj.value.length;}
		return obj.value.lastIndexOf(r.text);
	}
	else {
		return obj.selectionStart;
	}
};


imgmap.prototype.setSelectionRange = function(obj, start, end) {
	if (typeof end == "undefined") {end = start;}
	if (obj.selectionStart) {
		obj.setSelectionRange(start, end);
		obj.focus(); // to make behaviour consistent with IE
	}
	else if (document.selection) {
		var range = obj.createTextRange();
		range.collapse(true);
		range.moveStart("character", start);
		range.moveEnd("character", end - start);
		range.select();
	}
};


/**
 *	Handles arrow keys on img_coords input field.
 *	Changes the coordinate values by +/- 1 and updates the corresponding canvas area.
 *	@author	adam
 *	@date	25-09-2007 17:12:43
 */
imgmap.prototype.img_coords_keydown = function(e) {
	if (this.viewmode === 1) {return;}//exit if preview mode
	var key = (this.isMSIE || this.isOpera) ? event.keyCode : e.keyCode;
	var obj = (this.isMSIE || this.isOpera) ? window.event.srcElement : e.originalTarget;
	//this.log(key);
	//this.log(obj);
	if (key == 40 || key == 38) {
		//down or up pressed
		this.fireEvent('onResizeArea', this.areas[this.currentid]);
		//get the coords
		var coords = obj.value.split(',');
		var s = this.getSelectionStart(obj);
		var j = 0;
		for (var i=0; i<coords.length; i++) {
			j+=coords[i].length;
			if (j > s) {
				//this is the coord we want
				if (key == 40 && coords[i] > 0) {coords[i]--;}
				if (key == 38) {coords[i]++;}
				break;
			}
			//jump one more because of comma
			j++;
		}
		obj.value = coords.join(',');
		if (obj.value != this.areas[this.currentid].lastInput) {
			this._recalculate(this.currentid);//contains repaint
		}
		//set cursor back to its original position
		this.setSelectionRange(obj, s);
		return true;
	}
};


/**
 *	Handles SHIFT hold while drawing.
 *	Note: Safari doesn't generate keyboard events for modifiers: http://bugs.webkit.org/show_bug.cgi?id=11696 
 *	@author	adam
 */
imgmap.prototype.doc_keydown = function(e) {
	if (this.viewmode === 1) {return;}//exit if preview mode
	var key = (this.isMSIE) ? event.keyCode : e.keyCode;
	//console.log(key);
	if (key == 46) {
		//delete key pressed
		if (this.selectedId !== null && !this.is_drawing) {this.removeArea();}
	}
	else if (key == 16) {
		//shift key pressed
		if (this.is_drawing == this.DM_RECTANGLE_DRAW) {
			this.is_drawing = this.DM_SQUARE_DRAW;
			this.statusMessage(this.strings.SQUARE2_DRAW);
		}
	}
};


/**
 *	Handles SHIFT release while drawing.
 *	@author	adam
 */
imgmap.prototype.doc_keyup = function(e) {
	var key = (this.isMSIE) ? event.keyCode : e.keyCode;
	//alert(key);
	if (key == 16) {
		//shift key released
		if (this.is_drawing == this.DM_SQUARE_DRAW && this.areas[this.currentid].shape == 'rectangle') {
			//not for circle!
			this.is_drawing = this.DM_RECTANGLE_DRAW;
			this.statusMessage(this.strings.RECTANGLE_DRAW);
		}
	}
};


/**
 *	Handles event mousedown on document.
 *	@author	adam
 */
imgmap.prototype.doc_mousedown = function(e) {
	if (this.viewmode === 1) {return;}//exit if preview mode
	if (!this.is_drawing) {
		this.selectedId = null;
	}
};


/**
 *	Get the real position of the element.
 */
imgmap.prototype._getPos = function(element) {
	var xpos = 0;
	var ypos = 0;
	if (element) {
		var elementOffsetParent = element.offsetParent;
		// If the element has an offset parent
		if (elementOffsetParent) {
			// While there is an offset parent
			while ((elementOffsetParent = element.offsetParent)) {
				xpos += element.offsetLeft;
				ypos += element.offsetTop;
				element = elementOffsetParent;
			}
		}
		else {
			xpos = element.offsetLeft;
			ypos = element.offsetTop;
		}
	}
	return {x: xpos, y: ypos};
};


/**
 *	Determines if given area is the last (visible and editable) area.
 *	@author	Adam Maschek (adam.maschek(at)gmail.com)
 *	@date	2006-06-15 16:34:51
 */
imgmap.prototype._getLastArea = function() {
	for (var i = this.areas.length-1; i>=0; i--) {
		if (this.areas[i]) {
			return this.areas[i];
		}
	}
	return null;
};


/**
 *	Tries to copy imagemap html or text parameter to the clipboard.
 *	@date	2006.10.24. 22:14:12
 */
imgmap.prototype.toClipBoard = function(text) {
	this.fireEvent('onClipboard', text);
	if (typeof text == 'undefined') {text = this.getMapHTML();}
	//alert(typeof window.clipboardData);
	try {
		if (window.clipboardData) {
			// IE send-to-clipboard method.
			window.clipboardData.setData('Text', text);
		}
		else if (window.netscape) {
			// You have to sign the code to enable this or allow the action in
			// about:config by changing user_pref("signed.applets.codebase_principal_support", true);
			netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
			
			// Store support string in an object.
			var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
			if (!str) {return false;}
			str.data = text;
			
			// Make transferable.
			var trans = Components.classes["@mozilla.org/widget/transferable;1"].createInstance(Components.interfaces.nsITransferable);
			if (!trans) {return false;}
			
			// Specify what datatypes we want to obtain, which is text in this case.
			trans.addDataFlavor("text/unicode");
			trans.setTransferData("text/unicode", str, text.length*2);
			
			var clipid = Components.interfaces.nsIClipboard;
			var clip   = Components.classes["@mozilla.org/widget/clipboard;1"].getService(clipid);
			if (!clip) {return false;}
	
			clip.setData(trans, null, clipid.kGlobalClipboard);
		}
		else if (typeof air == 'object') {
			air.Clipboard.generalClipboard.clear();
			air.Clipboard.generalClipboard.setData("air:text", text, false);
		}
	}
	catch (err) {
		this.log("Unable to set clipboard data", 1);
	}
};


/**
 *	Parses cssText to single style declarations.
 *	@author	adam
 *	@date	25-09-2007 18:19:51
 */
imgmap.prototype.assignCSS = function(obj, cssText) {
	var parts = cssText.split(';');
	for (var i=0; i<parts.length; i++) {
		var p = parts[i].split(':');
		//we need to camelcase by - signs
		var pp = p[0].trim().split('-');
		var prop = pp[0];
		for (var j=1; j<pp.length; j++) {
			//replace first letters to uppercase
			prop+= pp[j].replace(/^./, pp[j].substring(0,1).toUpperCase());
		}
		obj.style[prop.trim()] = p[1].trim();
	}
};


/**
 *	To fire callback hooks on custom events
 *	@author	adam
 *	@date	13-10-2007 15:24:49
 */   
imgmap.prototype.fireEvent = function(evt, obj) {
	//this.log("Firing event: " + evt);
	if (typeof this.config.custom_callbacks[evt] == 'function') {
		return this.config.custom_callbacks[evt](obj);
	}
};


/**
 *	To set area dimensions.
 *	@author	adam
 *	@date	10-12-2007 22:29:41
 */
imgmap.prototype.setAreaSize = function(id, w, h) {
	if (!id) {id = this.currentid;}
	if (w != null) {
		this.areas[id].width  = w;
		this.areas[id].style.width  = (w) + 'px';
		this.areas[id].setAttribute('width',  w);
	}
	if (h != null) {
		this.areas[id].height = h;
		this.areas[id].style.height = (h) + 'px';
		this.areas[id].setAttribute('height', h);
	}
};


/**
 *	Tries to detect preferred language of user.
 *	@date	2007.12.28. 15:43:46
 */
imgmap.prototype.detectLanguage = function() {
	var lang;
	if (navigator.userLanguage) {
		lang = navigator.userLanguage.toLowerCase();
	}
	else if (navigator.language) {
		lang = navigator.language.toLowerCase();
	}
	else {
		return this.config.defaultLang;
	}
	//this.log(lang, 2);
	if (lang.length >= 2) {
		lang = lang.substring(0,2);
		return lang;
	}
	return this.config.defaultLang;
};


/**
 *	@date	11-02-2007 19:57:05
 *	@url	http://www.deepwood.net/writing/method-references.html.utf8
 *	@author	Daniel Brockman
 */
Function.prototype.bind = function(object) {
	var method = this;
	return function () {
		return method.apply(object, arguments);
	};
};


/**
 *	Trim functions.
 *	@url	http://www.somacon.com/p355.php 
 */
String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g,"");
};
String.prototype.ltrim = function() {
	return this.replace(/^\s+/,"");
};
String.prototype.rtrim = function() {
	return this.replace(/\s+$/,"");
};


/**
 *	Spawn an imgmap object for each imagemap found in the document.
 */
function imgmap_spawnObjects(config) {
	//console.log('spawnobjects');
	var maps = document.getElementsByTagName('map');
	var imgs = document.getElementsByTagName('img');
	var imaps = [];
	//console.log(maps.length);
	for (var i=0; i<maps.length; i++) {
		for (var j=0; j<imgs.length; j++) {
		//console.log(i);
		//	console.log(maps[i].name);
		//	console.log(imgs[j].getAttribute('usemap'));
			if ('#' + maps[i].name == imgs[j].getAttribute('usemap')) {
				//we found one matching pair
			//	console.log(maps[i]);
				config.mode = '';
				imapn = new imgmap(config);
				//imapn.setup(config);
				imapn.useImage(imgs[j]);
				imapn.setMapHTML(maps[i]);
				imapn.viewmode = 1;
				
				imaps.push(imapn);
				
			}
		}
	}
}

//global instance?
//imgmap_spawnObjects();?
