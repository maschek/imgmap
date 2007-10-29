var myimgmap;
var img_obj = null;
var map_obj = null;

// Less boring code
window.$ = function( id )
{
	return this.document.getElementById( id ) ;
} ;

var oEditor = window.parent.InnerDialogLoaded();
var FCKConfig	= oEditor.FCKConfig ;

document.write('<scr'+'ipt type="text/javascript" src="' + FCKConfig.FullBasePath + 'dialog/common/fck_dialog_common.js"></sc' + 'ript>');


window.onload = function()
{
	window.parent.SetOkButton(true);
//	window.parent.SetAutoSize(true);

	//translate page elements
	oEditor.FCKLanguageManager.TranslatePage(document);
	oEditor.FCKLanguageManager.TranslateElements(document, 'A', 'innerHTML');

	img_obj = oEditor.FCK.Selection.GetSelectedElement();

	//late init
	myimgmap = new imgmap({
		mode : "editor",
		button_container: $('button_container'),
		imgroot: 'images/',
		buttons : ['delete'],
		custom_callbacks : {
//			'onHtml' : function() {htmlShow();},
			'onSelectArea' : onSelectArea,
			'onRemoveArea'	: onRemoveArea ,
			'onGetAreaHtml'	: onGetAreaHtml
		},
		html_container: null, // $('html_container'), 
		pic_container: $('pic_container'),
		status_container: $('status_container'),
		form_container: null, // $('form_container'),
		bounding_box : false
	});

	
	//we need this to load languages
	myimgmap.onLoad();

	myimgmap.loadImage(img_obj);

	//check if the image has a valid map already assigned
	var mapname = img_obj.getAttribute('usemap', 2) || img_obj.usemap ;
	//console.log(mapname);
	if ( typeof mapname == 'string' && mapname !== '') {
		mapname = mapname.substr(1);
		var maps = oEditor.FCK.EditorDocument.getElementsByTagName('MAP');
		//console.log(maps);
		for (var i=0; i < maps.length; i++) {
			if (maps[i].name == mapname) {
				map_obj = maps[i];
				myimgmap.setMapHTML(map_obj);

				$('MapName').value = mapname ;
				break;
			}
		}
	}

	// We must set up this listener only after the current data has been read
	myimgmap.config.custom_callbacks.onAddArea = onAddArea ;

	$('btnBrowse').style.display	= FCKConfig.LinkBrowser		? '' : 'none' ;

	if ( map_obj !== null )
		setMode( 'pointer' ) ;
	else
		hightlightMode( 'rectangle' ) ;

	RefreshSize() ;
} ;

function Ok() {
	if (img_obj !== null && img_obj.nodeName == "IMG") {
		oEditor.FCKUndo.SaveUndoStep();

		if (typeof map_obj == 'undefined' || map_obj === null) {
			map_obj = oEditor.FCK.EditorDocument.createElement('MAP');
			img_obj.parentNode.appendChild(map_obj);
		}

		myimgmap.mapid = myimgmap.mapname = $('MapName').value ;

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
	oEditor.FCKUndo.SaveUndoStep();
	if (img_obj !== null && img_obj.nodeName == "IMG") {
		img_obj.removeAttribute('usemap', 0);
	}
	if (typeof map_obj != 'undefined' && map_obj !== null) {
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
			RefreshSize();
		}
		else {
			fieldset.className = 'fieldset_off';
		}
	}
}

// We need to store here the area id because if the user clicks on an area, 
// then the onSelectArea event will fire before the onchange or onblur of the editing inputs
var currentAreaId = null ;

// An area has been selected in the image
function onSelectArea(obj) {
	$( 'properties' ).style.visibility = '';

	updateAreaValues() ;

	currentAreaId = obj.aid ;
	$( 'txtUrl' ).value = obj.ahref ;
	$( 'cmbTarget' ).value = obj.atarget ;
	$( 'txtAlt' ).value = obj.aalt ;
	$( 'txtAttTitle' ).value = obj.atitle ;
}

// A new area has been added
function onAddArea(id) {
	$( 'properties' ).style.visibility = '';

	updateAreaValues() ;

	currentAreaId = id ;
	$( 'txtUrl' ).value = '' ;
	$( 'cmbTarget' ).value = '' ;
	$( 'txtAlt' ).value = '' ;
	$( 'txtAttTitle' ).value = '' ;
}

function onRemoveArea()
{
	currentAreaId = null ;
	$( 'properties' ).style.visibility = 'hidden' ;
}

function updateAreaValues()
{
	if (currentAreaId !== null)
	{
		myimgmap.areas[currentAreaId].ahref = $( 'txtUrl' ).value ;
		myimgmap.areas[currentAreaId].aalt = $( 'txtAlt' ).value ;
		myimgmap.areas[currentAreaId].atitle = $( 'txtAttTitle' ).value ;
		myimgmap._recalculate(currentAreaId);
	}
}

// We use our own resizing because the default doesn't take into account Standards rendering mode.
function RefreshSize()
{
		var oInnerDoc = document ;

		var iFrameHeight ;
		if ( document.all )
			iFrameHeight = oInnerDoc.documentElement.offsetHeight ;
		else
			iFrameHeight = window.innerHeight ;

		var iInnerHeight = oInnerDoc.body.scrollHeight ;

		var iDiff = iInnerHeight - iFrameHeight ;

		if ( iDiff !== 0 )
		{
			if ( document.all )
				window.parent.dialogHeight = ( parseInt( window.parent.dialogHeight, 10 ) + iDiff ) + 'px' ;
			else
				window.parent.resizeBy( 0, iDiff ) ;
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
	previousModeImg = $( 'img' + mode );
	previousModeImg.className = 'ActiveMode' ;
}

function onGetAreaHtml(area)
{
	var html = '<area shape="' + area.shape + '"' +
							' coords="' + area.lastInput + '"' ;

	if (area.aalt && area.aalt!='') html+= ' alt="' + area.aalt + '"' ;
	if (area.atitle && area.atitle!='') html+= ' title="' + area.atitle + '"' ;
	if (area.ahref && area.ahref!='') html+= ' href="' +	area.ahref + '" _fcksavedurl="' +	area.ahref + '"' ;
	if (area.atarget && area.atarget!='') html+= ' target="' + area.atarget + '"' ;
						
	html+='/>';
	return html;
}

/* edit the properties of an area */

function SetUrl(value)
{
	var id = currentAreaId ;
	if ( id !== null)
	{
		myimgmap.areas[id].ahref = value ;
		myimgmap._recalculate(id);
	}
}


function SetTarget(value)
{
	var id = currentAreaId ;
	if ( id !== null)
	{
		myimgmap.areas[id].atarget = value ;
		myimgmap._recalculate(id);
	}
}


function SetAlt(value)
{
	var id = currentAreaId ;
	if ( id !== null)
	{
		myimgmap.areas[id].aalt = value ;
		myimgmap._recalculate(id);
	}
}


function SetTitle(value)
{
	var id = currentAreaId ;
	if ( id !== null)
	{
		myimgmap.areas[id].atitle = value ;
		myimgmap._recalculate(id);
	}
}


/* Browse server */

function BrowseServer()
{
	OpenFileBrowser(
		FCKConfig.LinkBrowserURL,
		FCKConfig.LinkBrowserWindowWidth,
		FCKConfig.LinkBrowserWindowHeight ) ;
}

function SetUrl( url, width, height, alt )
{
	GetE('txtUrl').value = url ;

	if ( alt )
		GetE('txtAlt').value = alt;
}
