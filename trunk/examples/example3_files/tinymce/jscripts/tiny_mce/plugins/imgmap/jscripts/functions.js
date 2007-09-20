var myimgmap;
var editor = null;
var img_obj = null;
var map_obj = null;

function init() {

	tinyMCE.setWindowArg('mce_windowresize', true);

	editor = tinyMCE.getInstanceById(tinyMCE.getWindowArg('editor_id'));
	img_obj = editor.selection.getFocusElement();

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
}

function updateAction() {
	if (img_obj != null && img_obj.nodeName == "IMG") {
		tinyMCEPopup.execCommand("mceBeginUndoLevel");
		
		img_obj.setAttribute('usemap', "#" + myimgmap.getMapName());
		img_obj.setAttribute('border', '0');
		
		if (typeof map_obj != 'undefined' && map_obj != null) {
			map_obj.innerHTML = myimgmap.getMapInnerHTML();
			map_obj.name = myimgmap.getMapName();
			map_obj.id   = myimgmap.getMapId();
		}
		else {
			editor.selection.collapse(true);
			tinyMCEPopup.execCommand("mceInsertContent", false, myimgmap.getMapHTML());
		}
		tinyMCEPopup.execCommand("mceEndUndoLevel");
	}
	tinyMCEPopup.close();
}

function cancelAction() {
	tinyMCEPopup.close();
}

//remove the map object and unset the usemap attribute
function removeAction() {
	tinyMCEPopup.execCommand("mceBeginUndoLevel");
	if (img_obj != null && img_obj.nodeName == "IMG") {
		img_obj.removeAttribute('usemap');
	}
	if (typeof map_obj != 'undefined' && map_obj != null) {
		map_obj.parentNode.removeChild(map_obj);
	}
	tinyMCEPopup.execCommand("mceEndUndoLevel");
	tinyMCEPopup.close();
}
