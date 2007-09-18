var myimgmap;
var mapname;

function init(){
	tinyMCEPopup.resizeToInnerSize();
	
	var list = tinyMCE.getParam("external_rollover_list");
	
	
	
	if(list != null)
	{
		alert(list[0][0]);
	}
	
	myimgmap = new imgmap({
		mode : "editor",
		buttons : ['add','delete','preview'],
		button_callbacks : ['','', ''],
		imgroot : 'images/',
		pic_container : document.getElementById('pic_container'),
		button_container : document.getElementById('button_container'),
		form_container: document.getElementById('form_container'),
		bounding_box : false,
		rollover_list : list
	});
	
	myimgmap.onLoad();
	

	var inst = tinyMCE.getInstanceById(tinyMCE.getWindowArg('editor_id'));
	var elm = inst.selection.getFocusElement();
	var src = tinyMCE.getAttrib(elm, 'src');
	
	
	
	src = convertURL(src, elm, true);
	
	var src = src == "" ? src : tinyMCE.convertRelativeToAbsoluteURL(tinyMCE.settings['base_href'], src);
	
	//alert(src);
	
	myimgmap.loadImage(src);
	
	var mapId = tinyMCE.getAttrib(elm, 'usemap');
	
	if(mapId != null && mapId != '')
	{
		//alert(mapId);
		//myimgmap.setMapHTML(inst.getElement(mapId));
		var map = inst.contentWindow.document.getElementById(mapId.substring(1));
		
		if(map != null)
		{
			//alert(map.innerHTML);
			mapname = map.id;
			
			myimgmap.setMapHTML(map.cloneNode(true));
			
			
			//alert(map.innerHTML);
		}
		
		
		
		//tinyMCEPopup.execCommand('getImageMap', false, null, false);
	}

}




function getHTML(mapname)
{
	
	return myimgmap.getMapHTML( mapname );
}



function convertURL(url, node, on_save) {
	return eval("tinyMCEPopup.windowOpener." + tinyMCE.settings['urlconverter_callback'] + "(url, node, on_save);");
}

function save()
{
	var inst = tinyMCE.getInstanceById(tinyMCE.getWindowArg('editor_id'));
	var elm = inst.selection.getFocusElement();
	
	if (elm != null && elm.nodeName == "IMG") {
		
		var now = new Date();
		if(mapname == null)
		{
			mapname = "#imgmap" + now.getFullYear() + (now.getMonth() + 1) + now.getDate() + now.getHours() + now.getMinutes() + now.getSeconds()
		}
		setAttrib(elm, 'usemap', "#" + mapname);
		setAttrib(elm, 'border', '0');
		
		var map = inst.contentWindow.document.getElementById(mapname);
		
		if(map != null)
		{
			//map.nodeValue = getHTML(mapname);
			//map.replace(getHTML(mapname));
			map.innerHTML = myimgmap.getMapInnerHTML();
		}
		else
		{
			inst.selection.collapse(true);
			
			tinyMCEPopup.execCommand("mceInsertContent", false, getHTML(mapname));
		}
	}
	
	closeWindow();
}

function closeWindow()
{
	tinyMCEPopup.close();
}

function removeMap()
{
	tinyMCEPopup.close();
}

function setAttrib(elm, attrib, value) {
	var formObj = document.forms[0];
	var valueElm = formObj.elements[attrib];

	if (typeof(value) == "undefined" || value == null) {
		value = "";

		if (valueElm)
			value = valueElm.value;
	}

	if (value != "") {
		elm.setAttribute(attrib, value);

		if (attrib == "style")
			attrib = "style.cssText";

		if (attrib == "longdesc")
			attrib = "longDesc";

		if (attrib == "width") {
			attrib = "style.width";
			value = value + "px";
			value = value.replace(/%px/g, 'px');
		}

		if (attrib == "height") {
			attrib = "style.height";
			value = value + "px";
			value = value.replace(/%px/g, 'px');
		}

		if (attrib == "class")
			attrib = "className";

		eval('elm.' + attrib + "=value;");
	} else
		elm.removeAttribute(attrib);
}

function makeAttrib(attrib, value) {
	var formObj = document.forms[0];
	var valueElm = formObj.elements[attrib];

	if (typeof(value) == "undefined" || value == null) {
		value = "";

		if (valueElm)
			value = valueElm.value;
	}

	if (value == "")
		return "";

	// XML encode it
	value = value.replace(/&/g, '&amp;');
	value = value.replace(/\"/g, '&quot;');
	value = value.replace(/</g, '&lt;');
	value = value.replace(/>/g, '&gt;');

	return ' ' + attrib + '="' + value + '"';
}