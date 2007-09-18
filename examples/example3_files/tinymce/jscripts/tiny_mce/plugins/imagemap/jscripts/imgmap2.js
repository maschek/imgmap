
/**
 *	Image Map Editor (imgmap) - in-browser imagemap editor
 *	Copyright (C) 2006 - 2007 Adam Maschek (adam.maschek @ gmail.com)
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
function imgmap(_1) {
	this.version = "2.0beta1";
	this.releaseDate = "2007-04-04";
	this.config = new Object();
	this.is_drawing = 0;
	this.strings = new Array();
	this.memory = new Array();
	this.areas = new Array();
	this.props = new Array();
	this.logStore = new Array();
	this.digits = new Array(10);
	this.currentid = 0;
	this.viewmode = 0;
	this.loadedScripts = new Array();
	this.isLoaded = false;
	this.cntReloads = 0;
	this.mapname = "";
	this.DM_RECTANGLE_DRAW = 1;
	this.DM_RECTANGLE_MOVE = 11;
	this.DM_RECTANGLE_RESIZE_TOP = 12;
	this.DM_RECTANGLE_RESIZE_RIGHT = 13;
	this.DM_RECTANGLE_RESIZE_BOTTOM = 14;
	this.DM_RECTANGLE_RESIZE_LEFT = 15;
	this.DM_SQUARE_DRAW = 2;
	this.DM_SQUARE_MOVE = 21;
	this.DM_SQUARE_RESIZE_TOP = 22;
	this.DM_SQUARE_RESIZE_RIGHT = 23;
	this.DM_SQUARE_RESIZE_BOTTOM = 24;
	this.DM_SQUARE_RESIZE_LEFT = 25;
	this.DM_POLYGON_DRAW = 3;
	this.DM_POLYGON_LASTDRAW = 30;
	this.DM_POLYGON_MOVE = 31;
	this.config.mode = "editor";
	this.config.imgroot = "";
	this.config.baseroot = "";
	this.config.lang = "en";
	this.config.loglevel = 0;
	this.config.buttons = ["add", "delete", "preview", "html"];
	this.config.button_callbacks = new Array();
	this.config.CL_DRAW_BOX = "#dd2400";
	this.config.CL_DRAW_SHAPE = "#d00";
	this.config.CL_DRAW_BG = "#fff";
	this.config.CL_NORM_BOX = "#dd2400";
	this.config.CL_NORM_SHAPE = "#d00";
	this.config.CL_NORM_BG = "#fff";
	this.config.CL_HIGHLIGHT_BOX = "#dd2400";
	this.config.CL_HIGHLIGHT_SHAPE = "#d00";
	this.config.CL_HIGHLIGHT_BG = "#fff";
	this.config.CL_KNOB = "#ffeeee";
	this.config.CL_HIGHLIGHT_PROPS = "#e7e7e7";
	this.config.bounding_box = true;
	this.config.numbering = true;
	this.config.draw_opacity = "35";
	this.config.norm_opacity = "50";
	this.config.highlight_opacity = "65";
	this.config.cursor_default = "crosshair";
	this.config.rollover_list = null;
	ua = navigator.userAgent;
	this.isMSIE = (navigator.appName == "Microsoft Internet Explorer");
	this.isMSIE5 = this.isMSIE && (ua.indexOf("MSIE 5") != -1);
	this.isMSIE5_0 = this.isMSIE && (ua.indexOf("MSIE 5.0") != -1);
	this.isMSIE7 = this.isMSIE && (ua.indexOf("MSIE 7") != -1);
	this.isGecko = ua.indexOf("Gecko") != -1;
	this.isSafari = ua.indexOf("Safari") != -1;
	this.isOpera = (typeof window.opera != "undefined");
	this.addEvent(document, "keydown", this.doc_keydown.bind(this));
	this.addEvent(document, "keyup", this.doc_keyup.bind(this));
	if (_1) {
		this.setup(_1);
	}
}
imgmap.prototype.assignOID = function (_2) {
	if (typeof _2 == "object") {
		return _2;
	} else {
		if (typeof _2 == "string") {
			return document.getElementById(_2);
		}
	}
	return null;
};
imgmap.prototype.setup = function (_3) {
	for (var i in _3) {
		this.config[i] = _3[i];
	}
	if (_3) {
		this.pic_container = this.assignOID(_3.pic_container);
		if (this.pic_container) {
			this.preview = document.createElement("div");
			this.pic_container.appendChild(this.preview);
		}
		this.form_container = this.assignOID(_3.form_container);
		this.html_container = this.assignOID(_3.html_container);
		if (this.html_container) {
			this.addEvent(this.html_container, "blur", this.html_container_blur.bind(this));
			this.addEvent(this.html_container, "focus", this.html_container_focus.bind(this));
		}
		this.status_container = this.assignOID(_3.status_container);
		this.button_container = this.assignOID(_3.button_container);
	}
	if (!this.config.baseroot) {
		var _5 = document.getElementsByTagName("base");
		var _6 = "";
		for (var i = 0; i < _5.length; i++) {
			if (_5[i].href != "") {
				_6 = _5[i].href;
				if (_6.charAt(_6.length - 1) != "/") {
					_6 += "/";
				}
				break;
			}
		}
		var _7 = document.getElementsByTagName("script");
		for (var i = 0; i < _7.length; i++) {
			if (_7[i].src && _7[i].src.match(/imgmap\w*\.js(\?.*?)?$/)) {
				var _8 = _7[i].src;
				_8 = _8.substring(0, _8.lastIndexOf("/") + 1);
				if (_6 != "" && _8.indexOf("://") == -1) {
					this.config.baseroot = _6 + _8;
				} else {
					this.config.baseroot = _8;
				}
				break;
			}
		}
	}
	if (this.isMSIE) {
		this.loadScript(this.config.baseroot + "excanvas.js");
	}
	if (this.config.lang == "") {
		this.config.lang = "en";
	}
	this.loadScript(this.config.baseroot + "lang_" + this.config.lang + ".js");
	if (!this.config.imgroot) {
		this.config.imgroot = this.config.baseroot;
	}
	if (this.config.numbering) {
		try {
			this.digits[0] = new Image();
			this.digits[0].src = this.config.imgroot + "0.gif";
			this.digits[1] = new Image();
			this.digits[1].src = this.config.imgroot + "1.gif";
			this.digits[2] = new Image();
			this.digits[2].src = this.config.imgroot + "2.gif";
			this.digits[3] = new Image();
			this.digits[3].src = this.config.imgroot + "3.gif";
			this.digits[4] = new Image();
			this.digits[4].src = this.config.imgroot + "4.gif";
			this.digits[5] = new Image();
			this.digits[5].src = this.config.imgroot + "5.gif";
			this.digits[6] = new Image();
			this.digits[6].src = this.config.imgroot + "6.gif";
			this.digits[7] = new Image();
			this.digits[7].src = this.config.imgroot + "7.gif";
			this.digits[8] = new Image();
			this.digits[8].src = this.config.imgroot + "8.gif";
			this.digits[9] = new Image();
			this.digits[9].src = this.config.imgroot + "9.gif";
		}
		catch (err) {
			this.log("Error loading digit images", 1);
			this.config.numbering = false;
		}
	}
	this.addEvent(window, "load", this.onLoad.bind(this));
	return true;
};
imgmap.prototype.retryDelayed = function (fn, _a, _b) {
	if (typeof fn.tries == "undefined") {
		fn.tries = 0;
	}
	alert(fn.tries + 1);
	if (fn.tries++ < _b) {
		alert("ss");
		window.setTimeout(function () {
			fn.apply(this);
		}, _a);
	}
};
imgmap.prototype.onLoad = function (e) {
	if (this.isLoaded) {
		return true;
	}
	if (typeof imgmapStrings == "undefined") {
		if (this.cntReloads++ < 5) {
			var _d = this;
			window.setTimeout(function () {
				_d.onLoad(e);
			}, 1000);
			this.log("Delaying onload (language not loaded, try: " + this.cntReloads + ")");
			return false;
		}
	}
	try {
		this.loadStrings(imgmapStrings);
	}
	catch (err) {
		this.log("Unable to load language strings", 1);
	}
	if (this.isMSIE) {
		if (typeof window.CanvasRenderingContext2D == "undefined" && typeof G_vmlCanvasManager == "undefined") {
			this.log(this.strings["ERR_EXCANVAS_LOAD"], 2);
		}
	}
	if (this.config.mode == "highlighter") {
		imgmap_spawnObjects(this.config);
	} else { 
		if (this.button_container) {
			for (var i = 0; i < this.config.buttons.length; i++) {
				if (this.config.buttons[i] == "add") {
					try {
						var _f = document.createElement("IMG");
						_f.src = this.config.imgroot + "add.gif";
						_f.onclick = this.addNewArea.bind(this);
						if (this.config.button_callbacks[i]) {
							this.addEvent(_f, "click", this.config.button_callbacks[i]);
						}
						_f.alt = this.strings["HINT_ADD"];
						_f.title = this.strings["HINT_ADD"];
						_f.style.cursor = "pointer";
						_f.style.margin = "0 2px";
						this.button_container.appendChild(_f);
					}
					catch (err) {
						this.log("Unable to add button (" + this.config.buttons[i] + ")", 1);
					}
				} else {
					if (this.config.buttons[i] == "delete") {
						try {
							var _f = document.createElement("IMG");
							_f.src = this.config.imgroot + "delete.gif";
							_f.onclick = this.removeArea.bind(this);
							if (this.config.button_callbacks[i]) {
								this.addEvent(_f, "click", this.config.button_callbacks[i]);
							}
							_f.alt = this.strings["HINT_DELETE"];
							_f.title = this.strings["HINT_DELETE"];
							_f.style.cursor = "pointer";
							_f.style.margin = "0 2px";
							this.button_container.appendChild(_f);
						}
						catch (err) {
							this.log("Unable to add button (" + this.config.buttons[i] + ")", 1);
						}
					} else {
						if (this.config.buttons[i] == "preview") {
							try {
								var _f = document.createElement("IMG");
								_f.src = this.config.imgroot + "zoom.gif";
								_f.onclick = this.togglePreview.bind(this);
								if (this.config.button_callbacks[i]) {
									this.addEvent(_f, "click", this.config.button_callbacks[i]);
								}
								_f.alt = this.strings["HINT_PREVIEW"];
								_f.title = this.strings["HINT_PREVIEW"];
								_f.style.cursor = "pointer";
								_f.style.margin = "0 2px";
								this.i_preview = _f;
								this.button_container.appendChild(_f);
							}
							catch (err) {
								this.log("Unable to add button (" + this.config.buttons[i] + ")", 1);
							}
						} else {
							if (this.config.buttons[i] == "html") {
								try {
									var _f = document.createElement("IMG");
									_f.src = this.config.imgroot + "html.gif";
									if (this.config.button_callbacks[i]) {
										this.addEvent(_f, "click", this.config.button_callbacks[i]);
									}
									_f.alt = this.strings["HINT_HTML"];
									_f.title = this.strings["HINT_HTML"];
									_f.style.cursor = "pointer";
									_f.style.margin = "0 2px";
									this.button_container.appendChild(_f);
								}
								catch (err) {
									this.log("Unable to add button (" + this.config.buttons[i] + ")", 1);
								}
							} else {
								if (this.config.buttons[i] == "clipboard") {
									try {
										var _f = document.createElement("IMG");
										_f.src = this.config.imgroot + "clipboard.gif";
										_f.onclick = this.toClipBoard.bind(this);
										if (this.config.button_callbacks[i]) {
											this.addEvent(_f, "click", this.config.button_callbacks[i]);
										}
										_f.alt = this.strings["HINT_CLIPBOARD"];
										_f.title = this.strings["HINT_CLIPBOARD"];
										_f.style.cursor = "pointer";
										_f.style.margin = "0 2px";
										this.button_container.appendChild(_f);
									}
									catch (err) {
										this.log("Unable to add button (" + this.config.buttons[i] + ")", 1);
									}
								}
							}
						}
					}
				}
			}
		}
	}
	this.isLoaded = true;
	return true;
};
imgmap.prototype.addEvent = function (obj, evt, _12) {
	if (obj.attachEvent) {
		return obj.attachEvent("on" + evt, _12);
	} else {
		if (obj.addEventListener) {
			obj.addEventListener(evt, _12, false);
			return true;
		} else {
			obj["on" + evt] = _12;
		}
	}
};
imgmap.prototype.addLoadEvent = function (obj, _14) {
	if (obj.attachEvent) {
		return obj.attachEvent("onreadystatechange", _14);
	} else {
		if (obj.addEventListener) {
			obj.addEventListener("load", _14, false);
			return true;
		} else {
			obj["onload"] = _14;
		}
	}
};
imgmap.prototype.loadScript = function (url) {
	if (url == "") {
		return false;
	}
	if (this.loadedScripts[url] == 1) {
		return true;
	}
	this.log("Loading script: " + url);
	var _16 = document.getElementsByTagName("head")[0];
	var _17 = document.createElement("script");
	_17.setAttribute("language", "javascript");
	_17.setAttribute("type", "text/javascript");
	_17.setAttribute("src", url);
	_16.appendChild(_17);
	this.addLoadEvent(_17, this.script_load.bind(this));
	return true;
};
imgmap.prototype.script_load = function (e) {
	var obj = (document.all) ? window.event.srcElement : e.currentTarget;
	var url = obj.src;
	var _1b = false;
	if (typeof obj.readyState != "undefined") {
		if (obj.readyState == "complete") {
			_1b = true;
		}
	} else {
		_1b = true;
	}
	if (_1b) {
		this.loadedScripts[url] = 1;
		this.log("Loaded script: " + url);
		return true;
	}
};
imgmap.prototype.loadStrings = function (obj) {
	for (var key in obj) {
		this.strings[key] = obj[key];
	}
};
imgmap.prototype.loadImage = function (img, _1f, _20) {
	if (!this._getLastArea()) {
		this.addNewArea();
	}
	if (typeof img == "string") {
		if (typeof this.pic == "undefined") {
			this.pic = document.createElement("img");
			this.pic_container.appendChild(this.pic);
			this.pic.onmousedown = this.img_mousedown.bind(this);
			this.pic.onmousemove = this.img_mousemove.bind(this);
			this.pic.style.cursor = this.config.cursor_default;
		}
		var ts = new Date().getTime();
		this.pic.src = img + "?" + ts;
	} else {
		if (typeof img == "object") {
			this.pic = img;
			this.pic.onmousedown = this.img_mousedown.bind(this);
			this.pic.onmousemove = this.img_mousemove.bind(this);
			this.pic.style.cursor = this.config.cursor_default;
			this.pic_container = this.pic.parentNode;
		}
	}
};
imgmap.prototype.statusMessage = function (str) {
	if (this.status_container) {
		this.status_container.innerHTML = str;
	}
	window.defaultStatus = str;
};
imgmap.prototype.log = function (obj, _24) {
	if (_24 == "" || typeof _24 == "undefined") {
		_24 = 0;
	}
	if (this.config.loglevel != -1 && _24 >= this.config.loglevel) {
		this.logStore.push({level:_24, obj:obj});
	}
	if (typeof console == "object") {
		console.log(obj);
	} else {
		if (this.isOpera) {
			opera.postError(_24 + ": " + obj);
		} else {
			if (_24 > 1) {
				var msg = "";
				for (var i = 0; i < this.logStore.length; i++) {
					msg += this.logStore[i].level + ": " + this.logStore[i].obj + "\n";
				}
				alert(msg);
			} else {
				window.defaultStatus = (_24 + ": " + obj);
			}
		}
	}
};

imgmap.prototype.getMapInnerHTML = function () {
	var _27 = "";
	for (var i = 0; i < this.props.length; i++) {
		if (this.props[i]) {
			if (this.props[i].getElementsByTagName("input")[2].value != "") {
				_27 += "<area shape=\"" + this.props[i].getElementsByTagName("select")[0].value + "\" alt=\"" + 
				this.props[i].getElementsByTagName("input")[4].value + "\"" + 
				" coords=\"" + this.props[i].getElementsByTagName("input")[2].value + "\"" + 
				" href=\"" + this.props[i].getElementsByTagName("input")[3].value + "\"" + 
				(this.config.rollover_list != null ? " onmouseover=\"" + this.props[i].getElementsByTagName("select")[2].value + "\" onmouseout=\"stopTooltip()\"" : "") +
				" target=\"" + this.props[i].getElementsByTagName("select")[1].value + "\" />";
			}
		}
	}
	var now = new Date();
	
	this.mapname = mapname;
	
	if (this.mapname == "") {
		this.mapname = "imgmap" + now.getFullYear() + (now.getMonth() + 1) + now.getDate() + now.getHours() + now.getMinutes() + now.getSeconds();
	}
	//_27 = "<map id=\"" + this.mapname + "\" name=\"" + this.mapname + "\">" + _27 + "</map>";
	return (_27);
};

imgmap.prototype.getMapHTML = function ( mapname ) {
	var _27 = this.getMapInnerHTML();
	
	if (this.mapname == "") {
		this.mapname = "imgmap" + now.getFullYear() + (now.getMonth() + 1) + now.getDate() + now.getHours() + now.getMinutes() + now.getSeconds();
	}
	_27 = "<map id=\"" + this.mapname + "\" name=\"" + this.mapname + "\">" + _27 + "</map>";
	return (_27);
};
imgmap.prototype._normCoords = function (_2a) {
	_2a = _2a.replace(/(\d)(\D)+(\d)/g, "$1,$3");
	_2a = _2a.replace(/,(\D|0)+(\d)/g, ",$2");
	_2a = _2a.replace(/(\d)(\D)+,/g, "$1,");
	_2a = _2a.replace(/^(\D|0)+(\d)/g, "$2");
	return _2a;
};
imgmap.prototype.setMapHTML = function (_2b) {
	this.removeAllAreas();
	this.log("setmap");
	var div = document.createElement("div");
	if (typeof _2b == "string") {
		div.innerHTML = _2b;
	} else {
		if (typeof _2b == "object") {
			div.appendChild(_2b);
		}
	}
	if (!div.getElementsByTagName("map")[0]) {
		return false;
	}
	this.mapname = div.getElementsByTagName("map")[0].name;
	var _2d = div.getElementsByTagName("area");
	for (var i = 0; i < _2d.length; i++) {
		id = this.addNewArea();
		if (_2d[i].getAttribute("shape")) {
			shape = _2d[i].getAttribute("shape").toLowerCase();
			if (shape == "rect") {
				shape = "rectangle";
			} else {
				if (shape == "circ") {
					shape = "circle";
				} else {
					if (shape == "poly") {
						shape = "polygon";
					}
				}
			}
		} else {
			shape = "rectangle";
		}
		this.props[id].getElementsByTagName("select")[0].value = shape;
		if (_2d[i].getAttribute("coords")) {
			var _2f = this._normCoords(_2d[i].getAttribute("coords"));
			this.props[id].getElementsByTagName("input")[2].value = _2f;
		}
		if (_2d[i].getAttribute("href")) {
			this.props[id].getElementsByTagName("input")[3].value = _2d[i].getAttribute("href");
		}
		if (_2d[i].getAttribute("alt")) {
			this.props[id].getElementsByTagName("input")[4].value = _2d[i].getAttribute("alt");
		}
		if (_2d[i].getAttribute("target")) {
			target = _2d[i].getAttribute("target").toLowerCase();
			if (target == "") {
				target = "_self";
			}
		} else {
			target = "_self";
		}
		
		this.props[id].getElementsByTagName("select")[1].value = target;
		
		if (_2d[i].getAttribute("onmouseover")  && this.config.rollover_list != null)
		{
			this.props[id].getElementsByTagName("select")[2].value = _2d[i].getAttribute("onmouseover");
		}
		
		this.initArea(id, shape);
		this._recalculate(id);
		this.relaxArea(id);
	}
};
imgmap.prototype.togglePreview = function () {
	if (!this.pic) {
		return false;
	}
	if (this.viewmode == 0) {
		for (var i = 0; i < this.areas.length; i++) {
			if (this.areas[i]) {
				this.areas[i].style.display = "none";
			}
		}
		var _31 = this.form_container.getElementsByTagName("input");
		for (var i = 0; i < _31.length; i++) {
			_31[i].disabled = true;
		}
		var _31 = this.form_container.getElementsByTagName("select");
		for (var i = 0; i < _31.length; i++) {
			_31[i].disabled = true;
		}
		this.preview.innerHTML = this.getMapHTML();
		this.pic.setAttribute("usemap", "#" + this.mapname, 0);
		this.pic.onmousedown = null;
		this.pic.onmousemove = null;
		this.pic.style.cursor = "auto";
		this.viewmode = 1;
		this.i_preview.src = this.config.imgroot + "edit.gif";
		this.statusMessage(this.strings["PREVIEW_MODE"]);
	} else {
		for (var i = 0; i < this.areas.length; i++) {
			if (this.areas[i]) {
				this.areas[i].style.display = "";
			}
		}
		var _31 = this.form_container.getElementsByTagName("input");
		for (var i = 0; i < _31.length; i++) {
			_31[i].disabled = false;
		}
		var _31 = this.form_container.getElementsByTagName("select");
		for (var i = 0; i < _31.length; i++) {
			_31[i].disabled = false;
		}
		this.preview.innerHTML = "";
		this.pic.onmousedown = this.img_mousedown.bind(this);
		this.pic.onmousemove = this.img_mousemove.bind(this);
		this.pic.style.cursor = this.config.cursor_default;
		this.viewmode = 0;
		this.i_preview.src = this.config.imgroot + "zoom.gif";
		this.statusMessage(this.strings["DESIGN_MODE"]);
	}
};
imgmap.prototype.addNewArea = function () {
	if (this.viewmode == 1) {
		return;
	}
	var _32 = this._getLastArea();
	var id = this.areas.length;
	this.areas[id] = document.createElement("div");
	this.areas[id].id = this.mapname + "area" + id;
	this.areas[id].aid = id;
	this.areas[id].shape = "unknown";
	this.props[id] = document.createElement("div");
	if (this.form_container) {
		this.form_container.appendChild(this.props[id]);
	}
	this.props[id].id = "img_area_" + id;
	this.props[id].aid = id;
	this.props[id].className = "img_area";
	this.props[id].onmouseover = this.img_area_mouseover.bind(this);
	this.props[id].onmouseout = this.img_area_mouseout.bind(this);
	this.props[id].onclick = this.img_area_click.bind(this);
	this.props[id].innerHTML = id + "." + 
	"<input type=\"hidden\"  name=\"img_id\" class=\"img_id\" value=\"" + id + "\"/>" + 
	"<input type=\"radio\" name=\"img_active\" class=\"img_active\" id=\"img_active_" + id + "\" value=\"" + id + "\">" + 
	"Shape:<select name=\"img_shape\" class=\"img_shape\"><option value=\"rectangle\" >rectangle</option><option value=\"circle\"    >circle</option><option value=\"polygon\"   >polygon</option></select>" + 
	" Coords: <input type=\"text\" name=\"img_coords\" class=\"img_coords\" value=\"\">" +
	" Href: <input type=\"text\" name=\"img_href\" class=\"img_href\" value=\"\">" + 
	" Alt: <input type=\"text\" name=\"img_alt\" class=\"img_alt\" value=\"\">" + 
	" Target:<select name=\"img_target\" class=\"img_target\"><option value=\"_self\"  >this window</option>" + 
	"<option value=\"_blank\" >new window</option><option value=\"_top\"   >top window</option></select>" + 
	this.buildRolloverSelect();
	//id
	this.props[id].getElementsByTagName("input")[1].onkeydown = this.img_area_keydown.bind(this);
	//shape
	if (_32) {
		this.props[id].getElementsByTagName("select")[0].value = _32.shape;
	}
	this.props[id].getElementsByTagName("select")[1].onblur = this.img_area_blur.bind(this);
	//coords
	this.props[id].getElementsByTagName("input")[2].onblur = this.img_area_blur.bind(this);
	//href
	this.props[id].getElementsByTagName("input")[3].onblur = this.img_area_blur.bind(this);
	//alt
	this.props[id].getElementsByTagName("input")[4].onblur = this.img_area_blur.bind(this);
	
	
	this.form_selectRow(id, true);
	this.currentid = id;
	return (id);
};

imgmap.prototype.buildRolloverSelect = function()
{
	if(this.config.rollover_list != null)
	{
		var rolloverSelect = " Rollover:<select name=\"rollover_select\" value=\"\">";
		
		for(var i = 0; i < this.config.rollover_list.length; i++)
		{
			//alert(rolloverTuple[1]);
			
			rolloverSelect += "<option value=\"" + this.config.rollover_list[i][0] + "\">" + this.config.rollover_list[i][1] + "</option>";
		}
		rolloverSelect += "</select>";
		
		return rolloverSelect;
	}
	return "";
};

imgmap.prototype.initArea = function (id, _35) {
	if (this.areas[id].parentNode) {
		this.areas[id].parentNode.removeChild(this.areas[id]);
	}
	this.areas[id] = null;
	this.areas[id] = document.createElement("canvas");
	this.pic.parentNode.appendChild(this.areas[id]);
	this.pic.parentNode.style.position = "relative";
	if (typeof G_vmlCanvasManager != "undefined") {
		G_vmlCanvasManager.initElement(this.areas[id]);
		this.areas[id] = this.pic.parentNode.lastChild;
	}
	this.areas[id].id = this.mapname + "area" + id;
	this.areas[id].aid = id;
	this.areas[id].shape = _35;
	this.areas[id].style.position = "absolute";
	this.areas[id].style.top = this.pic.offsetTop + "px";
	this.areas[id].style.left = this.pic.offsetLeft + "px";
	this._setopacity(this.areas[id], this.config.CL_DRAW_BG, this.config.draw_opacity);
	this.areas[id].onmousedown = this.area_mousedown.bind(this);
	this.areas[id].onmousemove = this.area_mousemove.bind(this);
	this.memory[id] = new Object();
	this.memory[id].downx = 0;
	this.memory[id].downy = 0;
	this.memory[id].left = 0;
	this.memory[id].top = 0;
	this.memory[id].width = 0;
	this.memory[id].height = 0;
	this.memory[id].xpoints = new Array();
	this.memory[id].ypoints = new Array();
};
imgmap.prototype.relaxArea = function (id) {
	if (this.areas[id].shape == "rectangle") {
		this.areas[id].style.borderWidth = "1px";
		this.areas[id].style.borderStyle = "solid";
		this.areas[id].style.borderColor = this.config.CL_NORM_SHAPE;
	} else {
		if (this.areas[id].shape == "circle" || this.areas[id].shape == "polygon") {
			if (this.config.bounding_box == true) {
				this.areas[id].style.borderWidth = "1px";
				this.areas[id].style.borderStyle = "solid";
				this.areas[id].style.borderColor = this.config.CL_NORM_BOX;
			}
		}
	}
	this._setopacity(this.areas[id], this.config.CL_NORM_BG, this.config.norm_opacity);
};
imgmap.prototype._setopacity = function (_37, _38, pct) {
	_37.style.backgroundColor = _38;
	_37.style.opacity = "." + pct;
	_37.style.filter = "alpha(opacity=" + pct + ")";
};
imgmap.prototype.removeArea = function () {
	if (this.viewmode == 1) {
		return;
	}
	var id = this.currentid;
	if (this.props[id]) {
		var _3b = this.props[id].parentNode;
		_3b.removeChild(this.props[id]);
		var _3c = _3b.lastChild.aid;
		this.props[id] = null;
		try {
			this.form_selectRow(_3c, true);
			this.currentid = _3c;
		}
		catch (err) {
		}
		try {
			var _3d = this.areas[id].parentNode;
			_3d.removeChild(this.areas[id]);
		}
		catch (err) {
		}
		this.areas[id] = null;
		if (this.html_container) {
			this.html_container.value = this.getMapHTML();
		}
	}
};
imgmap.prototype.removeAllAreas = function () {
	for (var i = 0; i < this.props.length; i++) {
		if (this.props[i]) {
			if (this.props[i].parentNode) {
				this.props[i].parentNode.removeChild(this.props[i]);
			}
			if (this.areas[i].parentNode) {
				this.areas[i].parentNode.removeChild(this.areas[i]);
			}
			this.props[i] = null;
			this.areas[i] = null;
			if (this.props.length > 0 && this.props[i]) {
				this.form_selectRow((this.props.length - 1), true);
			}
		}
	}
};
imgmap.prototype._putlabel = function (id) {
	if (this.isOpera) {
		return false;
	}
	if (this.config.numbering == false) {
		return false;
	}
	var _40 = String(id);
	var ctx = this.areas[id].getContext("2d");
	var _42 = "";
	try {
		for (var i = 0; i < _40.length; i++) {
			_42 = _40.substring(i, i + 1);
			ctx.drawImage(this.digits[_42], i * this.digits[_42].width, 0);
		}
	}
	catch (err) {
		this.log("Error putting label", 1);
	}
};
imgmap.prototype._repaint = function (_44, _45, x, y) {
	if (_44.shape == "circle") {
		var _48 = parseInt(_44.style.width);
		var _49 = Math.floor(_48 / 2) - 1;
		var ctx = _44.getContext("2d");
		ctx.clearRect(0, 0, _48, _48);
		ctx.beginPath();
		ctx.strokeStyle = _45;
		ctx.arc(_49, _49, _49, 0, Math.PI * 2, 0);
		ctx.stroke();
		ctx.closePath();
		ctx.strokeStyle = this.config.CL_KNOB;
		ctx.strokeRect(_49, _49, 1, 1);
		this._putlabel(_44.aid);
	} else {
		if (_44.shape == "rectangle") {
			this._putlabel(_44.aid);
		} else {
			if (_44.shape == "polygon") {
				var _48 = parseInt(_44.style.width);
				var _4b = parseInt(_44.style.height);
				var _4c = parseInt(_44.style.left);
				var top = parseInt(_44.style.top);
				var ctx = _44.getContext("2d");
				ctx.clearRect(0, 0, _48, _4b);
				ctx.beginPath();
				ctx.strokeStyle = _45;
				ctx.moveTo(_44.xpoints[0] - _4c, _44.ypoints[0] - top);
				for (var i = 1; i < _44.xpoints.length; i++) {
					ctx.lineTo(_44.xpoints[i] - _4c, _44.ypoints[i] - top);
				}
				if (this.is_drawing == this.DM_POLYGON_DRAW || this.is_drawing == this.DM_POLYGON_LASTDRAW) {
					ctx.lineTo(x - _4c - 5, y - top - 5);
				}
				ctx.lineTo(_44.xpoints[0] - _4c, _44.ypoints[0] - top);
				ctx.stroke();
				ctx.closePath();
				this._putlabel(_44.aid);
			}
		}
	}
	_44.title = "#" + _44.aid;
	if (this.props[_44.aid].getElementsByTagName("input")[3].value != "") {
		_44.title += " " + this.props[_44.aid].getElementsByTagName("input")[3].value;
	}
	if (this.props[_44.aid].getElementsByTagName("input")[4].value != "") {
		_44.title += " (" + this.props[_44.aid].getElementsByTagName("input")[4].value + ")";
	}
	_44.alt = _44.title;
};
imgmap.prototype._updatecoords = function () {
	var _4f = this.props[this.currentid].getElementsByTagName("input")[2];
	var _50 = parseInt(this.areas[this.currentid].style.left);
	var top = parseInt(this.areas[this.currentid].style.top);
	var _52 = parseInt(this.areas[this.currentid].style.height);
	var _53 = parseInt(this.areas[this.currentid].style.width);
	if (this.areas[this.currentid].shape == "rectangle") {
		_4f.value = _50 + "," + top + "," + (_50 + _53) + "," + (top + _52);
		this.areas[this.currentid].lastInput = _4f.value;
	} else {
		if (this.areas[this.currentid].shape == "circle") {
			var _54 = Math.floor(_53 / 2) - 1;
			_4f.value = (_50 + _54) + "," + (top + _54) + "," + _54;
			this.areas[this.currentid].lastInput = _4f.value;
		} else {
			if (this.areas[this.currentid].shape == "polygon") {
				_4f.value = "";
				for (var i = 0; i < this.areas[this.currentid].xpoints.length; i++) {
					_4f.value += this.areas[this.currentid].xpoints[i] + "," + this.areas[this.currentid].ypoints[i] + ",";
				}
				_4f.value = _4f.value.substring(0, _4f.value.length - 1);
				this.areas[this.currentid].lastInput = _4f.value;
			}
		}
	}
	if (this.html_container) {
		this.html_container.value = this.getMapHTML();
	}
};
imgmap.prototype._recalculate = function (id) {
	var _57 = this.props[id].getElementsByTagName("input")[2];
	_57.value = this._normCoords(_57.value);
	var _58 = _57.value;
	var _59 = _58.split(",");
	try {
		if (this.areas[id].shape == "rectangle") {
			if (_59.length != 4) {
				throw "invalid coords";
			}
			if (parseInt(_59[0]) > parseInt(_59[2])) {
				throw "invalid coords";
			}
			if (parseInt(_59[1]) > parseInt(_59[3])) {
				throw "invalid coords";
			}
			this.areas[id].style.left = this.pic.offsetLeft + parseInt(_59[0]) + "px";
			this.areas[id].style.top = this.pic.offsetTop + parseInt(_59[1]) + "px";
			this.areas[id].style.width = (_59[2] - _59[0]) + "px";
			this.areas[id].style.height = (_59[3] - _59[1]) + "px";
			this.areas[id].setAttribute("width", (_59[2] - _59[0]));
			this.areas[id].setAttribute("height", (_59[3] - _59[1]));
			this._repaint(this.areas[id], this.config.CL_NORM_SHAPE);
		} else {
			if (this.areas[id].shape == "circle") {
				if (_59.length != 3) {
					throw "invalid coords";
				}
				if (parseInt(_59[2]) < 0) {
					throw "invalid coords";
				}
				var _5a = 2 * (1 * _59[2] + 1);
				this.areas[id].style.width = _5a + "px";
				this.areas[id].style.height = _5a + "px";
				this.areas[id].setAttribute("width", _5a);
				this.areas[id].setAttribute("height", _5a);
				this.areas[id].style.left = this.pic.offsetLeft + parseInt(_59[0]) - _5a / 2 + "px";
				this.areas[id].style.top = this.pic.offsetTop + parseInt(_59[1]) - _5a / 2 + "px";
				this._repaint(this.areas[id], this.config.CL_NORM_SHAPE);
			} else {
				if (this.areas[id].shape == "polygon") {
					if (_59.length < 2) {
						throw "invalid coords";
					}
					this.areas[id].xpoints = new Array();
					this.areas[id].ypoints = new Array();
					for (var i = 0; i < _59.length; i += 2) {
						this.areas[id].xpoints[this.areas[id].xpoints.length] = this.pic.offsetLeft + parseInt(_59[i]);
						this.areas[id].ypoints[this.areas[id].ypoints.length] = this.pic.offsetTop + parseInt(_59[i + 1]);
						this._polygongrow(this.areas[id], _59[i], _59[i + 1]);
					}
					this._polygonshrink(this.areas[id]);
				}
			}
		}
	}
	catch (err) {
		this.log(err.message, 1);
		this.statusMessage(this.strings["ERR_INVALID_COORDS"]);
		if (this.areas[id].lastInput) {
			_57.value = this.areas[id].lastInput;
		}
		this._repaint(this.areas[id], this.config.CL_NORM_SHAPE);
		return;
	}
	this.areas[id].lastInput = _57.value;
};
imgmap.prototype._polygongrow = function (_5c, _5d, _5e) {
	var _5f = _5d - parseInt(_5c.style.left);
	var _60 = _5e - parseInt(_5c.style.top);
	var pad = 2;
	var _62 = pad * 2;
	if (_5d < parseInt(_5c.style.left)) {
		_5c.style.left = _5d - pad + "px";
		_5c.style.width = parseInt(_5c.style.width) + Math.abs(_5f) + _62 + "px";
		_5c.setAttribute("width", parseInt(_5c.style.width));
	}
	if (_5e < parseInt(_5c.style.top)) {
		_5c.style.top = _5e - pad + "px";
		_5c.style.height = parseInt(_5c.style.height) + Math.abs(_60) + _62 + "px";
		_5c.setAttribute("height", parseInt(_5c.style.height));
	}
	if (_5d > parseInt(_5c.style.left) + parseInt(_5c.style.width)) {
		_5c.style.width = _5d - parseInt(_5c.style.left) + _62 + "px";
		_5c.setAttribute("width", parseInt(_5c.style.width));
	}
	if (_5e > parseInt(_5c.style.top) + parseInt(_5c.style.height)) {
		_5c.style.height = _5e - parseInt(_5c.style.top) + _62 + "px";
		_5c.setAttribute("height", parseInt(_5c.style.height));
	}
};
imgmap.prototype._polygonshrink = function (_63) {
	_63.style.left = (_63.xpoints[0] + 1) + "px";
	_63.style.top = (_63.ypoints[0] + 1) + "px";
	_63.style.height = "0px";
	_63.style.width = "0px";
	_63.setAttribute("height", "0");
	_63.setAttribute("width", "0");
	for (var i = 0; i < _63.xpoints.length; i++) {
		this._polygongrow(_63, _63.xpoints[i], _63.ypoints[i]);
	}
	this._repaint(_63, this.config.CL_NORM_SHAPE);
};
imgmap.prototype.img_mousemove = function (e) {
	if (this.viewmode == 1) {
		return;
	}
	var pos = this._getPos(this.pic);
	var x = (window.event) ? (window.event.x - this.pic.offsetLeft) : (e.pageX - pos.x);
	var y = (window.event) ? (window.event.y - this.pic.offsetTop) : (e.pageY - pos.y);
	x = x + this.pic_container.scrollLeft;
	y = y + this.pic_container.scrollTop;
	if (x < 0 || y < 0 || x > this.pic.width || y > this.pic.height) {
		return;
	}
	if (this.memory[this.currentid]) {
		var top = this.memory[this.currentid].top;
		var _6a = this.memory[this.currentid].left;
		var _6b = this.memory[this.currentid].height;
		var _6c = this.memory[this.currentid].width;
	}
	if (this.is_drawing == this.DM_RECTANGLE_DRAW) {
		var _6d = x - this.memory[this.currentid].downx;
		var _6e = y - this.memory[this.currentid].downy;
		this.areas[this.currentid].style.width = Math.abs(_6d) + "px";
		this.areas[this.currentid].style.height = Math.abs(_6e) + "px";
		this.areas[this.currentid].setAttribute("width", Math.abs(_6d));
		this.areas[this.currentid].setAttribute("height", Math.abs(_6e));
		if (_6d < 0) {
			this.areas[this.currentid].style.left = (x + 1) + "px";
		}
		if (_6e < 0) {
			this.areas[this.currentid].style.top = (y + 1) + "px";
		}
	} else {
		if (this.is_drawing == this.DM_SQUARE_DRAW) {
			var _6d = x - this.memory[this.currentid].downx;
			var _6e = y - this.memory[this.currentid].downy;
			var _6f;
			if (Math.abs(_6d) < Math.abs(_6e)) {
				_6f = Math.abs(_6d);
			} else {
				_6f = Math.abs(_6e);
			}
			this.areas[this.currentid].style.width = _6f + "px";
			this.areas[this.currentid].style.height = _6f + "px";
			this.areas[this.currentid].setAttribute("width", _6f);
			this.areas[this.currentid].setAttribute("height", _6f);
			if (_6d < 0) {
				this.areas[this.currentid].style.left = (this.memory[this.currentid].downx + _6f * -1) + "px";
			}
			if (_6e < 0) {
				this.areas[this.currentid].style.top = (this.memory[this.currentid].downy + _6f * -1 + 1) + "px";
			}
		} else {
			if (this.is_drawing == this.DM_POLYGON_DRAW) {
				this._polygongrow(this.areas[this.currentid], x, y);
			} else {
				if (this.is_drawing == this.DM_RECTANGLE_MOVE || this.is_drawing == this.DM_SQUARE_MOVE) {
					var x = x - this.memory[this.currentid].rdownx;
					var y = y - this.memory[this.currentid].rdowny;
					if (x + _6c > this.pic.width || y + _6b > this.pic.height) {
						return;
					}
					if (x < 0 || y < 0) {
						return;
					}
					this.areas[this.currentid].style.left = x + 1 + "px";
					this.areas[this.currentid].style.top = y + 1 + "px";
				} else {
					if (this.is_drawing == this.DM_POLYGON_MOVE) {
						var x = x - this.memory[this.currentid].rdownx;
						var y = y - this.memory[this.currentid].rdowny;
						if (x + _6c > this.pic.width || y + _6b > this.pic.height) {
							return;
						}
						if (x < 0 || y < 0) {
							return;
						}
						var _6d = x - _6a;
						var _6e = y - top;
						for (var i = 0; i < this.areas[this.currentid].xpoints.length; i++) {
							this.areas[this.currentid].xpoints[i] = this.memory[this.currentid].xpoints[i] + _6d;
							this.areas[this.currentid].ypoints[i] = this.memory[this.currentid].ypoints[i] + _6e;
						}
						this.areas[this.currentid].style.left = x + 1 + "px";
						this.areas[this.currentid].style.top = y + 1 + "px";
					} else {
						if (this.is_drawing == this.DM_SQUARE_RESIZE_LEFT) {
							var _6f = x - _6a;
							if ((_6c + (-1 * _6f)) > 0) {
								this.areas[this.currentid].style.left = x + 1 + "px";
								this.areas[this.currentid].style.top = (top + (_6f / 2)) + "px";
								this.areas[this.currentid].style.width = (_6c + (-1 * _6f)) + "px";
								this.areas[this.currentid].style.height = (_6b + (-1 * _6f)) + "px";
								this.areas[this.currentid].setAttribute("width", parseInt(this.areas[this.currentid].style.width));
								this.areas[this.currentid].setAttribute("height", parseInt(this.areas[this.currentid].style.height));
							} else {
								this.memory[this.currentid].width = 0;
								this.memory[this.currentid].height = 0;
								this.memory[this.currentid].left = x;
								this.memory[this.currentid].top = y;
								this.is_drawing = this.DM_SQUARE_RESIZE_RIGHT;
							}
						} else {
							if (this.is_drawing == this.DM_SQUARE_RESIZE_RIGHT) {
								var _6f = x - _6a - _6c;
								if ((_6c + (_6f)) - 1 > 0) {
									this.areas[this.currentid].style.top = (top + (-1 * _6f / 2)) + "px";
									this.areas[this.currentid].style.width = (_6c + (_6f)) - 1 + "px";
									this.areas[this.currentid].style.height = (_6b + (_6f)) + "px";
									this.areas[this.currentid].setAttribute("width", parseInt(this.areas[this.currentid].style.width));
									this.areas[this.currentid].setAttribute("height", parseInt(this.areas[this.currentid].style.height));
								} else {
									this.memory[this.currentid].width = 0;
									this.memory[this.currentid].height = 0;
									this.memory[this.currentid].left = x;
									this.memory[this.currentid].top = y;
									this.is_drawing = this.DM_SQUARE_RESIZE_LEFT;
								}
							} else {
								if (this.is_drawing == this.DM_SQUARE_RESIZE_TOP) {
									var _6f = y - top;
									if ((_6c + (-1 * _6f)) > 0) {
										this.areas[this.currentid].style.top = y + 1 + "px";
										this.areas[this.currentid].style.left = (_6a + (_6f / 2)) + "px";
										this.areas[this.currentid].style.width = (_6c + (-1 * _6f)) + "px";
										this.areas[this.currentid].style.height = (_6b + (-1 * _6f)) + "px";
										this.areas[this.currentid].setAttribute("width", parseInt(this.areas[this.currentid].style.width));
										this.areas[this.currentid].setAttribute("height", parseInt(this.areas[this.currentid].style.height));
									} else {
										this.memory[this.currentid].width = 0;
										this.memory[this.currentid].height = 0;
										this.memory[this.currentid].left = x;
										this.memory[this.currentid].top = y;
										this.is_drawing = this.DM_SQUARE_RESIZE_BOTTOM;
									}
								} else {
									if (this.is_drawing == this.DM_SQUARE_RESIZE_BOTTOM) {
										var _6f = y - top - _6b;
										if ((_6c + (_6f)) - 1 > 0) {
											this.areas[this.currentid].style.left = (_6a + (-1 * _6f / 2)) + "px";
											this.areas[this.currentid].style.width = (_6c + (_6f)) - 1 + "px";
											this.areas[this.currentid].style.height = (_6b + (_6f)) - 1 + "px";
											this.areas[this.currentid].setAttribute("width", parseInt(this.areas[this.currentid].style.width));
											this.areas[this.currentid].setAttribute("height", parseInt(this.areas[this.currentid].style.height));
										} else {
											this.memory[this.currentid].width = 0;
											this.memory[this.currentid].height = 0;
											this.memory[this.currentid].left = x;
											this.memory[this.currentid].top = y;
											this.is_drawing = this.DM_SQUARE_RESIZE_TOP;
										}
									} else {
										if (this.is_drawing == this.DM_RECTANGLE_RESIZE_LEFT) {
											var _6d = x - _6a;
											if (_6c + (-1 * _6d) > 0) {
												this.areas[this.currentid].style.left = x + 1 + "px";
												this.areas[this.currentid].style.width = _6c + (-1 * _6d) + "px";
												this.areas[this.currentid].setAttribute("width", parseInt(this.areas[this.currentid].style.width));
											} else {
												this.memory[this.currentid].width = 0;
												this.memory[this.currentid].left = x;
												this.is_drawing = this.DM_RECTANGLE_RESIZE_RIGHT;
											}
										} else {
											if (this.is_drawing == this.DM_RECTANGLE_RESIZE_RIGHT) {
												var _6d = x - _6a - _6c;
												if ((_6c + (_6d)) - 1 > 0) {
													this.areas[this.currentid].style.width = (_6c + (_6d)) - 1 + "px";
													this.areas[this.currentid].setAttribute("width", parseInt(this.areas[this.currentid].style.width));
												} else {
													this.memory[this.currentid].width = 0;
													this.memory[this.currentid].left = x;
													this.is_drawing = this.DM_RECTANGLE_RESIZE_LEFT;
												}
											} else {
												if (this.is_drawing == this.DM_RECTANGLE_RESIZE_TOP) {
													var _6e = y - top;
													if ((_6b + (-1 * _6e)) > 0) {
														this.areas[this.currentid].style.top = y + 1 + "px";
														this.areas[this.currentid].style.height = (_6b + (-1 * _6e)) + "px";
														this.areas[this.currentid].setAttribute("height", parseInt(this.areas[this.currentid].style.height));
													} else {
														this.memory[this.currentid].height = 0;
														this.memory[this.currentid].top = y;
														this.is_drawing = this.DM_RECTANGLE_RESIZE_BOTTOM;
													}
												} else {
													if (this.is_drawing == this.DM_RECTANGLE_RESIZE_BOTTOM) {
														var _6e = y - top - _6b;
														if ((_6b + (_6e)) - 1 > 0) {
															this.areas[this.currentid].style.height = (_6b + (_6e)) - 1 + "px";
															this.areas[this.currentid].setAttribute("height", parseInt(this.areas[this.currentid].style.height));
														} else {
															this.memory[this.currentid].height = 0;
															this.memory[this.currentid].top = y;
															this.is_drawing = this.DM_RECTANGLE_RESIZE_TOP;
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
	if (this.is_drawing) {
		this._repaint(this.areas[this.currentid], this.config.CL_DRAW_SHAPE, x, y);
		this._updatecoords();
	}
};
imgmap.prototype.img_mousedown = function (e) {
	if (this.viewmode == 1) {
		return;
	}
	if (!this.props[this.currentid]) {
		return;
	}
	var pos = this._getPos(this.pic);
	var x = (window.event) ? (window.event.x - this.pic.offsetLeft) : (e.pageX - pos.x);
	var y = (window.event) ? (window.event.y - this.pic.offsetTop) : (e.pageY - pos.y);
	x = x + this.pic_container.scrollLeft;
	y = y + this.pic_container.scrollTop;
	if (this.is_drawing == this.DM_POLYGON_DRAW) {
		this.areas[this.currentid].xpoints[this.areas[this.currentid].xpoints.length] = x - 5;
		this.areas[this.currentid].ypoints[this.areas[this.currentid].ypoints.length] = y - 5;
	} else {
		if (this.is_drawing && this.is_drawing != this.DM_POLYGON_DRAW) {
			if (this.is_drawing == this.DM_POLYGON_LASTDRAW) {
				this.areas[this.currentid].xpoints[this.areas[this.currentid].xpoints.length] = x - 5;
				this.areas[this.currentid].ypoints[this.areas[this.currentid].ypoints.length] = y - 5;
				this._updatecoords();
				this.is_drawing = 0;
				this._polygonshrink(this.areas[this.currentid]);
			}
			this.is_drawing = 0;
			this.statusMessage(this.strings["READY"]);
			this.relaxArea(this.currentid);
			if (this.areas[this.currentid] == this._getLastArea()) {
				this.addNewArea();
				return;
			}
		} else {
			if (this.props[this.currentid].getElementsByTagName("select")[0].value == "polygon") {
				if (this.areas[this.currentid].shape != this.props[this.currentid].getElementsByTagName("select")[0].value) {
					this.initArea(this.currentid, "polygon");
				}
				this.is_drawing = this.DM_POLYGON_DRAW;
				this.statusMessage(this.strings["POLYGON_DRAW"]);
				this.areas[this.currentid].style.left = x + "px";
				this.areas[this.currentid].style.top = y + "px";
				if (this.config.bounding_box == true) {
					this.areas[this.currentid].style.borderWidth = "1px";
					this.areas[this.currentid].style.borderStyle = "dotted";
					this.areas[this.currentid].style.borderColor = this.config.CL_DRAW_BOX;
				}
				this.areas[this.currentid].style.width = 0;
				this.areas[this.currentid].style.height = 0;
				this.areas[this.currentid].xpoints = new Array();
				this.areas[this.currentid].ypoints = new Array();
				this.areas[this.currentid].xpoints[0] = x;
				this.areas[this.currentid].ypoints[0] = y;
			} else {
				if (this.props[this.currentid].getElementsByTagName("select")[0].value == "rectangle") {
					if (this.areas[this.currentid].shape != this.props[this.currentid].getElementsByTagName("select")[0].value) {
						this.initArea(this.currentid, "rectangle");
					}
					this.is_drawing = this.DM_RECTANGLE_DRAW;
					this.statusMessage(this.strings["RECTANGLE_DRAW"]);
					this.areas[this.currentid].style.left = x + "px";
					this.areas[this.currentid].style.top = y + "px";
					this.areas[this.currentid].style.borderWidth = "1px";
					this.areas[this.currentid].style.borderStyle = "dotted";
					this.areas[this.currentid].style.borderColor = this.config.CL_DRAW_SHAPE;
					this.areas[this.currentid].style.width = 0;
					this.areas[this.currentid].style.height = 0;
				} else {
					if (this.props[this.currentid].getElementsByTagName("select")[0].value == "circle") {
						if (this.areas[this.currentid].shape != this.props[this.currentid].getElementsByTagName("select")[0].value) {
							this.initArea(this.currentid, "circle");
						}
						this.is_drawing = this.DM_SQUARE_DRAW;
						this.statusMessage(this.strings["SQUARE_DRAW"]);
						this.areas[this.currentid].style.left = x + "px";
						this.areas[this.currentid].style.top = y + "px";
						if (this.config.bounding_box == true) {
							this.areas[this.currentid].style.borderWidth = "1px";
							this.areas[this.currentid].style.borderStyle = "dotted";
							this.areas[this.currentid].style.borderColor = this.config.CL_DRAW_BOX;
						}
						this.areas[this.currentid].style.width = 0;
						this.areas[this.currentid].style.height = 0;
					}
				}
			}
		}
	}
	this.memory[this.currentid].downx = x;
	this.memory[this.currentid].downy = y;
};
imgmap.prototype.img_area_mouseover = function (e) {
	if (this.is_drawing) {
		return;
	}
	var obj = (document.all) ? window.event.srcElement : e.currentTarget;
	if (typeof obj.aid == "undefined") {
		obj = obj.parentNode;
	}
	var id = obj.aid;
	if (this.areas[id]) {
		if (this.areas[id].shape == "rectangle") {
			this.areas[id].style.borderWidth = "1px";
			this.areas[id].style.borderStyle = "solid";
			this.areas[id].style.borderColor = this.config.CL_HIGHLIGHT_SHAPE;
		} else {
			if (this.areas[id].shape == "circle" || this.areas[id].shape == "polygon") {
				if (this.config.bounding_box == true) {
					this.areas[id].style.borderWidth = "1px";
					this.areas[id].style.borderStyle = "solid";
					this.areas[id].style.borderColor = this.config.CL_HIGHLIGHT_BOX;
				}
			}
		}
		this._setopacity(this.areas[id], this.config.CL_HIGHLIGHT_BG, this.config.highlight_opacity);
		this._repaint(this.areas[id], this.config.CL_HIGHLIGHT_SHAPE);
	}
};
imgmap.prototype.img_area_mouseout = function (e) {
	if (this.is_drawing) {
		return;
	}
	var obj = (document.all) ? window.event.srcElement : e.currentTarget;
	if (typeof obj.aid == "undefined") {
		obj = obj.parentNode;
	}
	var id = obj.aid;
	if (this.areas[id]) {
		if (this.areas[id].shape == "rectangle") {
			this.areas[id].style.borderWidth = "1px";
			this.areas[id].style.borderStyle = "solid";
			this.areas[id].style.borderColor = this.config.CL_NORM_SHAPE;
		} else {
			if (this.areas[id].shape == "circle" || this.areas[id].shape == "polygon") {
				if (this.config.bounding_box == true) {
					this.areas[id].style.borderWidth = "1px";
					this.areas[id].style.borderStyle = "solid";
					this.areas[id].style.borderColor = this.config.CL_NORM_BOX;
				}
			}
		}
		this._setopacity(this.areas[id], this.config.CL_NORM_BG, this.config.norm_opacity);
		this._repaint(this.areas[id], this.config.CL_NORM_SHAPE);
	}
};
imgmap.prototype.img_area_click = function (e) {
	var obj = (document.all) ? window.event.srcElement : e.currentTarget;
	if (typeof obj.aid == "undefined") {
		obj = obj.parentNode;
	}
	this.form_selectRow(obj.aid, false);
	this.currentid = obj.aid;
};
imgmap.prototype.form_selectRow = function (id, _7e) {
	if (this.is_drawing) {
		return;
	}
	if (this.viewmode == 1) {
		return;
	}
	if (!this.form_container) {
		return;
	}
	if (!document.getElementById("img_active_" + id)) {
		return;
	}
	document.getElementById("img_active_" + id).checked = 1;
	if (_7e) {
		document.getElementById("img_active_" + id).focus();
	}
	for (var i = 0; i < this.props.length; i++) {
		if (this.props[i]) {
			this.props[i].style.background = "";
		}
	}
	this.props[id].style.background = this.config.CL_HIGHLIGHT_PROPS;
};
imgmap.prototype.img_area_keydown = function (e) {
	if (this.viewmode == 1) {
		return;
	}
	var key = (window.event) ? event.keyCode : e.keyCode;
	if (key == 46) {
		this.removeArea();
	}
};
imgmap.prototype.img_area_blur = function (e) {
	var obj = (document.all) ? window.event.srcElement : e.currentTarget;
	this._recalculate(obj.parentNode.aid);
	if (this.html_container) {
		this.html_container.value = this.getMapHTML();
	}
};
imgmap.prototype.html_container_blur = function (e) {
	var _85 = this.html_container.getAttribute("oldvalue");
	if (_85 != this.html_container.value) {
		this.setMapHTML(this.html_container.value);
	}
};
imgmap.prototype.html_container_focus = function (e) {
	this.html_container.setAttribute("oldvalue", this.html_container.value);
	this.html_container.select();
};
imgmap.prototype.area_mousemove = function (e) {
	if (this.is_drawing == 0) {
		var obj = (document.all) ? window.event.srcElement : e.currentTarget;
		if (obj.tagName == "image" || obj.tagName == "group" || obj.tagName == "shape" || obj.tagName == "stroke") {
			obj = obj.parentNode.parentNode;
		}
		var _89 = (window.event) ? (window.event.offsetX) : (e.layerX);
		var _8a = (window.event) ? (window.event.offsetY) : (e.layerY);
		if (_89 < 10 && _8a < 10) {
			obj.style.cursor = "move";
		} else {
			if (_89 < 6 && _8a > 6) {
				if (obj.shape != "polygon") {
					obj.style.cursor = "w-resize";
				}
			} else {
				if (_89 > parseInt(obj.style.width) - 6 && _8a > 6) {
					if (obj.shape != "polygon") {
						obj.style.cursor = "e-resize";
					}
				} else {
					if (_89 > 6 && _8a < 6) {
						if (obj.shape != "polygon") {
							obj.style.cursor = "n-resize";
						}
					} else {
						if (_8a > parseInt(obj.style.height) - 6 && _89 > 6) {
							if (obj.shape != "polygon") {
								obj.style.cursor = "s-resize";
							}
						} else {
							obj.style.cursor = "move";
						}
					}
				}
			}
		}
	} else {
		this.img_mousemove(e);
	}
};
imgmap.prototype.area_mousedown = function (e) {
	if (this.is_drawing == 0) {
		var obj = (document.all) ? window.event.srcElement : e.currentTarget;
		if (obj.tagName == "image" || obj.tagName == "group" || obj.tagName == "shape" || obj.tagName == "stroke") {
			obj = obj.parentNode.parentNode;
		}
		if (this.areas[this.currentid] != obj) {
			if (typeof obj.aid == "undefined") {
				this.log("Cannot identify target area", 1);
				return;
			}
			this.form_selectRow(obj.aid, true);
			this.currentid = obj.aid;
		}
		var _8d = (window.event) ? (window.event.offsetX) : (e.layerX);
		var _8e = (window.event) ? (window.event.offsetY) : (e.layerY);
		if (_8d < 6 && _8e > 6) {
			if (this.areas[this.currentid].shape == "circle") {
				this.is_drawing = this.DM_SQUARE_RESIZE_LEFT;
				this.statusMessage(this.strings["SQUARE_RESIZE_LEFT"]);
				if (this.config.bounding_box == true) {
					this.areas[this.currentid].style.borderColor = this.config.CL_DRAW_BOX;
				}
			} else {
				if (this.areas[this.currentid].shape == "rectangle") {
					this.is_drawing = this.DM_RECTANGLE_RESIZE_LEFT;
					this.statusMessage(this.strings["RECTANGLE_RESIZE_LEFT"]);
					this.areas[this.currentid].style.borderColor = this.config.CL_DRAW_SHAPE;
				}
			}
		} else {
			if (_8d > parseInt(this.areas[this.currentid].style.width) - 6 && _8e > 6) {
				if (this.areas[this.currentid].shape == "circle") {
					this.is_drawing = this.DM_SQUARE_RESIZE_RIGHT;
					this.statusMessage(this.strings["SQUARE_RESIZE_RIGHT"]);
					if (this.config.bounding_box == true) {
						this.areas[this.currentid].style.borderColor = this.config.CL_DRAW_BOX;
					}
				} else {
					if (this.areas[this.currentid].shape == "rectangle") {
						this.is_drawing = this.DM_RECTANGLE_RESIZE_RIGHT;
						this.statusMessage(this.strings["RECTANGLE_RESIZE_RIGHT"]);
						this.areas[this.currentid].style.borderColor = this.config.CL_DRAW_SHAPE;
					}
				}
			} else {
				if (_8d > 6 && _8e < 6) {
					if (this.areas[this.currentid].shape == "circle") {
						this.is_drawing = this.DM_SQUARE_RESIZE_TOP;
						this.statusMessage(this.strings["SQUARE_RESIZE_TOP"]);
						if (this.config.bounding_box == true) {
							this.areas[this.currentid].style.borderColor = this.config.CL_DRAW_BOX;
						}
					} else {
						if (this.areas[this.currentid].shape == "rectangle") {
							this.is_drawing = this.DM_RECTANGLE_RESIZE_TOP;
							this.statusMessage(this.strings["RECTANGLE_RESIZE_TOP"]);
							this.areas[this.currentid].style.borderColor = this.config.CL_DRAW_SHAPE;
						}
					}
				} else {
					if (_8e > parseInt(this.areas[this.currentid].style.height) - 6 && _8d > 6) {
						if (this.areas[this.currentid].shape == "circle") {
							this.is_drawing = this.DM_SQUARE_RESIZE_BOTTOM;
							this.statusMessage(this.strings["SQUARE_RESIZE_BOTTOM"]);
							if (this.config.bounding_box == true) {
								this.areas[this.currentid].style.borderColor = this.config.CL_DRAW_BOX;
							}
						} else {
							if (this.areas[this.currentid].shape == "rectangle") {
								this.is_drawing = this.DM_RECTANGLE_RESIZE_BOTTOM;
								this.statusMessage(this.strings["RECTANGLE_RESIZE_BOTTOM"]);
								this.areas[this.currentid].style.borderColor = this.config.CL_DRAW_SHAPE;
							}
						}
					} else {
						if (this.areas[this.currentid].shape == "circle") {
							this.is_drawing = this.DM_SQUARE_MOVE;
							this.statusMessage(this.strings["SQUARE_MOVE"]);
							if (this.config.bounding_box == true) {
								this.areas[this.currentid].style.borderColor = this.config.CL_DRAW_BOX;
							}
							this.memory[this.currentid].rdownx = _8d;
							this.memory[this.currentid].rdowny = _8e;
						} else {
							if (this.areas[this.currentid].shape == "rectangle") {
								this.is_drawing = this.DM_RECTANGLE_MOVE;
								this.statusMessage(this.strings["RECTANGLE_MOVE"]);
								this.areas[this.currentid].style.borderColor = this.config.CL_DRAW_SHAPE;
								this.memory[this.currentid].rdownx = _8d;
								this.memory[this.currentid].rdowny = _8e;
							} else {
								if (this.areas[this.currentid].shape == "polygon") {
									for (var i = 0; i < this.areas[this.currentid].xpoints.length; i++) {
										this.memory[this.currentid].xpoints[i] = this.areas[this.currentid].xpoints[i];
										this.memory[this.currentid].ypoints[i] = this.areas[this.currentid].ypoints[i];
									}
									this.is_drawing = this.DM_POLYGON_MOVE;
									this.statusMessage(this.strings["POLYGON_MOVE"]);
									if (this.config.bounding_box == true) {
										this.areas[this.currentid].style.borderColor = this.config.CL_DRAW_BOX;
									}
									this.memory[this.currentid].rdownx = _8d;
									this.memory[this.currentid].rdowny = _8e;
								}
							}
						}
					}
				}
			}
		}
		this.memory[this.currentid].width = parseInt(this.areas[this.currentid].style.width);
		this.memory[this.currentid].height = parseInt(this.areas[this.currentid].style.height);
		this.memory[this.currentid].top = parseInt(this.areas[this.currentid].style.top);
		this.memory[this.currentid].left = parseInt(this.areas[this.currentid].style.left);
		if (this.areas[this.currentid].shape == "rectangle") {
			this.areas[this.currentid].style.borderWidth = "1px";
			this.areas[this.currentid].style.borderStyle = "dotted";
		} else {
			if (this.areas[this.currentid].shape == "circle" || this.areas[this.currentid].shape == "polygon") {
				if (this.config.bounding_box == true) {
					this.areas[this.currentid].style.borderWidth = "1px";
					this.areas[this.currentid].style.borderStyle = "dotted";
				}
			}
		}
		this._setopacity(this.areas[this.currentid], this.config.CL_DRAW_BG, this.config.draw_opacity);
	} else {
		this.img_mousedown(e);
	}
};
imgmap.prototype.doc_keydown = function (e) {
	var key = (window.event) ? event.keyCode : e.keyCode;
	if (key == 16) {
		if (this.is_drawing == this.DM_POLYGON_DRAW) {
			this.is_drawing = this.DM_POLYGON_LASTDRAW;
		} else {
			if (this.is_drawing == this.DM_RECTANGLE_DRAW) {
				this.is_drawing = this.DM_SQUARE_DRAW;
				this.statusMessage(this.strings["SQUARE2_DRAW"]);
			}
		}
	}
};
imgmap.prototype.doc_keyup = function (e) {
	var key = (window.event) ? event.keyCode : e.keyCode;
	if (key == 16) {
		if (this.is_drawing == this.DM_POLYGON_LASTDRAW) {
			this.is_drawing = this.DM_POLYGON_DRAW;
		} else {
			if (this.is_drawing == this.DM_SQUARE_DRAW && this.areas[this.currentid].shape == "rectangle") {
				this.is_drawing = this.DM_RECTANGLE_DRAW;
				this.statusMessage(this.strings["RECTANGLE_DRAW"]);
			}
		}
	}
};
imgmap.prototype._getPos = function (_94) {
	var _95 = 0;
	var _96 = 0;
	if (_94) {
		var _97 = _94.offsetParent;
		if (_97) {
			while ((_97 = _94.offsetParent) != null) {
				_95 += _94.offsetLeft;
				_96 += _94.offsetTop;
				_94 = _97;
			}
		} else {
			_95 = _94.offsetLeft;
			_96 = _94.offsetTop;
		}
	}
	return new Object({x:_95, y:_96});
};
imgmap.prototype._getLastArea = function () {
	for (var i = this.areas.length - 1; i >= 0; i--) {
		if (this.areas[i]) {
			return this.areas[i];
		}
	}
	return null;
};
imgmap.prototype.toClipBoard = function (_99) {
	if (typeof _99 == "undefined") {
		_99 = this.getMapHTML();
	}
	try {
		if (window.clipboardData) {
			window.clipboardData.setData("Text", _99);
		} else {
			if (window.netscape) {
				netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
				var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
				if (!str) {
					return false;
				}
				str.data = _99;
				var _9b = Components.classes["@mozilla.org/widget/transferable;1"].createInstance(Components.interfaces.nsITransferable);
				if (!_9b) {
					return false;
				}
				_9b.addDataFlavor("text/unicode");
				_9b.setTransferData("text/unicode", str, _99.length * 2);
				var _9c = Components.interfaces.nsIClipboard;
				var _9d = Components.classes["@mozilla.org/widget/clipboard;1"].getService(_9c);
				if (!_9d) {
					return false;
				}
				_9d.setData(_9b, null, _9c.kGlobalClipboard);
			}
		}
	}
	catch (err) {
		this.log("Unable to set clipboard data", 1);
	}
};
Function.prototype.bind = function (_9e) {
	var _9f = this;
	return function () {
		return _9f.apply(_9e, arguments);
	};
};
function imgmap_spawnObjects(_a0) {
	var _a1 = document.getElementsByTagName("map");
	var _a2 = document.getElementsByTagName("img");
	var _a3 = new Array();
	for (var i = 0; i < _a1.length; i++) {
		for (var j = 0; j < _a2.length; j++) {
			if ("#" + _a1[i].name == _a2[j].getAttribute("usemap")) {
				_a0.mode = "";
				imapn = new imgmap(_a0);
				imapn.loadImage(_a2[j]);
				imapn.setMapHTML(_a1[i]);
				imapn.viewmode = 1;
				_a3.push(imapn);
			}
		}
	}
}

