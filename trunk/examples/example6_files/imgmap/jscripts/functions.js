var myimgmap;
var img_obj = null;
var map_obj = null;

var editor = window.parent.InnerDialogLoaded();

window.onload = function()
{
	window.parent.SetOkButton(true);
	window.parent.SetAutoSize(true);

	//translate page elements
	editor.FCKLanguageManager.TranslatePage(document);
	editor.FCKLanguageManager.TranslateElements(document, 'A', 'innerHTML');

	//console.log(editor);
	img_obj = editor.FCK.Selection.GetSelectedElement();
	
	//console.log(imgmap);

	//late init
	myimgmap = new imgmap({
		mode : "editor",
		button_container: document.getElementById('button_container'),
		imgroot: 'images/',
		buttons : ['add','delete','html'],
		custom_callbacks : {
			'onHtml' : function() {htmlShow();},
			'onSelectArea' : function(obj) {
				//console.log(obj);
				myimgmap.areas[obj.aid].ahref = 'foo.bar';
				myimgmap.areas[obj.aid].aalt = 'alt changed';
				myimgmap._recalculate(obj.aid);
				if (myimgmap.html_container) myimgmap.html_container.value = myimgmap.getMapHTML();
				//console.log(obj);
				
				
			}
		},
		html_container: document.getElementById('html_container'), 
		pic_container: document.getElementById('pic_container'),
		status_container: document.getElementById('status_container'),
		form_container: document.getElementById('form_container'),
		bounding_box : false
	});

	
	//we need this to load languages
	myimgmap.onLoad();

	myimgmap.loadImage(img_obj);
	//console.log(myimgmap);

	//check if the image has a valid map already assigned
	var mapname = img_obj.getAttribute('usemap', 2) || img_obj.usemap ;
	//console.log(mapname);
	if (mapname != null && mapname != '') {
		mapname = mapname.substr(1);
		var maps = editor.FCK.EditorDocument.getElementsByTagName('MAP');
		//console.log(maps);
		for (var i=0; i < maps.length; i++) {
			if (maps[i].name == mapname) {
				map_obj = maps[i];
				myimgmap.setMapHTML(map_obj);

				document.getElementById('MapName').value = mapname ;
				break;
			}
		}
	}

	hightlightMode( 'rectangle' );
}

function Ok() {
	if (img_obj != null && img_obj.nodeName == "IMG") {
		editor.FCKUndo.SaveUndoStep();

		if (typeof map_obj == 'undefined' || map_obj == null) {
			map_obj = editor.FCK.EditorDocument.createElement('MAP');
			img_obj.parentNode.appendChild(map_obj);
		}

		myimgmap.mapid = myimgmap.mapname = document.getElementById('MapName').value ;

		map_obj.innerHTML = myimgmap.getMapInnerHTML();

		// IE bug: it's not possible to directly assing the name and make it work easily
		// We remove the previous name
		if ( map_obj.name )
			map_obj.removeAttribute( 'name' ) ;

		map_obj.name = myimgmap.getMapName();
		map_obj.id   = myimgmap.getMapId();
		
		img_obj.setAttribute('usemap', "#" + myimgmap.getMapName(), 0);
	}

	return true;
}

//remove the map object and unset the usemap attribute
function removeMap() {
	editor.FCKUndo.SaveUndoStep();
	if (img_obj != null && img_obj.nodeName == "IMG") {
		img_obj.removeAttribute('usemap', 0);
	}
	if (typeof map_obj != 'undefined' && map_obj != null) {
		map_obj.parentNode.removeChild(map_obj);
	}

	window.parent.close();
}


function changelabeling(obj) {
	myimgmap.config.label = obj.value;
	myimgmap._repaintAll();
}

function toggleBoundingBox(obj) {
	//console.log(obj.checked);
	myimgmap.config.bounding_box = obj.checked;
	myimgmap.relaxAllAreas();
}

function toggleFieldset(fieldset, on) {
	if (fieldset) {
		if (fieldset.className == 'fieldset_off' || on == 1) {
			fieldset.className = '';
			resizeToContent();
		}
		else {
			fieldset.className = 'fieldset_off';
		}
	}
}

function htmlShow() {
	toggleFieldset(document.getElementById('fieldset_html'), 1);
	document.getElementById('html_container').focus();
}

function resizeToContent() {
//alert('b');
	if (document.all) {
			try { window.resizeTo(10, 10); } catch (e) {}

			elm = document.body;
			width = elm.offsetWidth;
			height = elm.offsetHeight;
			dx = (elm.scrollWidth - width) + 4;
			dy = elm.scrollHeight - height;
			try { window.resizeBy(dx, dy); } catch (e) {}
		} else {
			window.scrollBy(1000, 1000);
			if (window.scrollX > 0 || window.scrollY > 0) {
				window.resizeBy(window.innerWidth * 2, window.innerHeight * 2);
				window.sizeToContent();
				window.scrollTo(0, 0);
				x = parseInt(screen.width / 2.0) - (window.outerWidth / 2.0);
				y = parseInt(screen.height / 2.0) - (window.outerHeight / 2.0);
				window.moveTo(x, y);
			}
		}
}

function setMode(mode) {
	if (mode == 'pointer') {
		myimgmap.is_drawing = 0;
		myimgmap.nextShape = '';
	}
	else {
		myimgmap.nextShape = mode;
	}

	hightlightMode(mode); 
}

var previousModeImg = null ;
function hightlightMode(mode) {
	// Reset previous button
	if ( previousModeImg )
		previousModeImg.className = '';

	// Highlight new mode
	previousModeImg = document.getElementById( 'img' + mode );
	previousModeImg.className = 'ActiveMode' ;
}
