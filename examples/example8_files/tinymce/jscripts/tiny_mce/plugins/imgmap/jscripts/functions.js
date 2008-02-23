var myimgmap;
var editor = null;
var img_obj = null;
var map_obj = null;

function init() {
	
	tinyMCEPopup.resizeToInnerSize();
	//tinyMCE.setWindowArg('mce_windowresize', true);//i guess we dont need this

	editor = tinyMCEPopup.editor;
	img_obj = editor.selection.getNode();

	//late init
	myimgmap = new imgmap({
		mode : "editor",
		button_container: document.getElementById('button_container'),
		imgroot: 'images/',
		buttons : ['add','delete','html'],
		custom_callbacks : {
			'onHtml' : function() {htmlShow();}
		},
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
	var mapname = img_obj.getAttribute('usemap', 2) || img_obj.usemap ;
	//console.log(mapname);
	if (mapname != null && mapname != '') {
		mapname = mapname.substr(1);
		var maps = editor.contentWindow.document.getElementsByTagName('MAP');
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
		tinyMCEPopup.execCommand("mceBeginUndoLevel");

		if (typeof map_obj == 'undefined' || map_obj == null) {
			map_obj = editor.contentWindow.document.createElement('MAP');
			img_obj.parentNode.appendChild(map_obj);
		}

		map_obj.innerHTML = myimgmap.getMapInnerHTML();
		map_obj.name = myimgmap.getMapName();
		map_obj.id   = myimgmap.getMapId();
		
		img_obj.setAttribute('usemap', "#" + myimgmap.getMapName(), 0);
		//img_obj.setAttribute('border', '0');
		
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
		img_obj.removeAttribute('usemap', 0);
	}
	if (typeof map_obj != 'undefined' && map_obj != null) {
		map_obj.parentNode.removeChild(map_obj);
	}
	tinyMCEPopup.execCommand("mceEndUndoLevel");
	tinyMCEPopup.close();
}
