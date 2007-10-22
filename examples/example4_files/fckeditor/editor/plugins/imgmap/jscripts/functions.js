var myimgmap;
var editor = null;
var img_obj = null;
var map_obj = null;

function plugin_init() {

	if (window.parent.SetOkButton) {
		window.parent.SetOkButton(true);
		window.parent.SetAutoSize(true);
		editor		= window.parent.InnerDialogLoaded();
	}
	else {
		editor		= window.opener;
	}

	//translate page elements
	editor.FCKLanguageManager.TranslatePage(document);
	editor.FCKLanguageManager.TranslateElements(document, 'A', 'innerHTML');
	editor.FCKLanguageManager.TranslateElements(document, 'TITLE', 'innerHTML');
	//alert(FCKLang.imgmapDlgTitle);

	//console.log(editor);
	img_obj = editor.FCK.Selection.GetSelectedElement();

	//late init
	myimgmap = new imgmap({
		mode : "editor",
		button_container: document.getElementById('button_container'),
		imgroot: 'images/',
		buttons : ['add','delete','html'],
		custom_callbacks : {
			'onHtml' : function() {htmlShow();}
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
			// IE doesn't return name?
			if (maps[i].name == mapname || maps[i].id == mapname) {
				map_obj = maps[i];
				myimgmap.setMapHTML(map_obj);
				break;
			}
		}
	}
}

function updateAction() {
	if (img_obj != null && img_obj.nodeName == "IMG") {
		editor.FCKUndo.SaveUndoStep();

		if (typeof map_obj == 'undefined' || map_obj == null) {
			map_obj = editor.FCK.EditorDocument.createElement('MAP');
			img_obj.parentNode.appendChild(map_obj);
		}

		map_obj.innerHTML = myimgmap.getMapInnerHTML();
		map_obj.name = myimgmap.getMapName();
		map_obj.id   = myimgmap.getMapId();
		
		img_obj.setAttribute('usemap', "#" + myimgmap.getMapName(), 0);
//		img_obj.setAttribute('border', '0');
	}
	window.close();
}

function cancelAction() {
	window.close();
}

//remove the map object and unset the usemap attribute
function removeAction() {
	editor.FCKUndo.SaveUndoStep();
	if (img_obj != null && img_obj.nodeName == "IMG") {
		img_obj.removeAttribute('usemap', 0);
	}
	if (typeof map_obj != 'undefined' && map_obj != null) {
		map_obj.parentNode.removeChild(map_obj);
	}

	window.close();
}



function delayedLoad() {
	window.setTimeout('plugin_init()', 1000);
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
