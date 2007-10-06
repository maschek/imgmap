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
		buttons : ['add','delete','preview','html'],
		button_callbacks : ['','','',htmlShow],
		pic_container: document.getElementById('pic_container'),
		html_container: document.getElementById('html_container'),
		status_container: document.getElementById('status_container'),
		form_container: document.getElementById('form_container'),
		bounding_box : false
	});

	
	//we need this to load languages
	myimgmap.onLoad();

	myimgmap.loadImage(img_obj);
	//console.log(myimgmap);
	/*
	//check if the image has a valid map already assigned
	var mapname = tinyMCE.getAttrib(img_obj, 'usemap').substring(1);
	//console.log(mapname);
	if (mapname != null && mapname != '') {
		var maps = editor.contentWindow.document.getElementsByTagName('MAP');
		//console.log(maps);
		for (var i=0; i < maps.length; i++) {
			if (maps[i].name == mapname) {
				map_obj = maps[i];
				myimgmap.setMapHTML(map_obj.cloneNode(true));
				break;
			}
		}
	}
	*/
}

function updateAction() {
	if (img_obj != null && img_obj.nodeName == "IMG") {
		editor.FCKUndo.SaveUndoStep();

		if (typeof map_obj == 'undefined' || map_obj == null) {
			map_obj = editor.contentWindow.document.createElement('MAP');
			img_obj.parentNode.appendChild(map_obj);
		}

		map_obj.innerHTML = myimgmap.getMapInnerHTML();
		map_obj.name = myimgmap.getMapName();
		map_obj.id   = myimgmap.getMapId();
		
		img_obj.setAttribute('usemap', "#" + myimgmap.getMapName());
		img_obj.setAttribute('border', '0');
		
		//tinyMCEPopup.execCommand("mceEndUndoLevel");
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
		img_obj.removeAttribute('usemap');
	}
	if (typeof map_obj != 'undefined' && map_obj != null) {
		map_obj.parentNode.removeChild(map_obj);
	}
	//tinyMCEPopup.execCommand("mceEndUndoLevel");
	window.close();
}
