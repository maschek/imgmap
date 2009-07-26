/**
 *	Functions to use with imgmap FCKeditor plugin.
 *	@author amla
 *	@author adam
 *	@author sroebj 
 */

var myimgmap;
var img_obj = null;
var map_obj = null;

// Less boring code - will this clash with other libs??
window.$ = function( id )
{
	return this.document.getElementById( id );
};

var oEditor = window.parent.InnerDialogLoaded();
var FCKConfig	= oEditor.FCKConfig;
var FCKLang = oEditor.FCKLang;

document.write('<scr'+'ipt type="text/javascript" src="' + FCKConfig.FullBasePath + 'dialog/common/fck_dialog_common.js"></sc' + 'ript>');


window.onload = function()
{
	window.parent.SetOkButton(true);
//	window.parent.SetAutoSize(true);

	//translate page elements
	oEditor.FCKLanguageManager.TranslatePage(document);
	oEditor.FCKLanguageManager.TranslateElements(document, 'A', 'innerHTML');

	var btn;
	btn = $('imgpointer');
	btn.alt = btn.title = FCKLang.imgmapPointer;
	btn = $('imgrect');
	btn.alt = btn.title = FCKLang.imgmapRectangle;
	btn = $('imgcircle');
	btn.alt = btn.title = FCKLang.imgmapCircle;
	btn = $('imgpoly');
	btn.alt = btn.title = FCKLang.imgmapPolygon;
	btn = $('imgmapDeleteArea');
	btn.alt = btn.title = FCKLang.imgmapDeleteArea;


	img_obj = oEditor.FCK.Selection.GetSelectedElement();

	// On rare situations it's possible to launch the dialog without an image selected
	// -> in IE select an image, click outside the editor and the button will remain enabled, 
	//		but img_obj will be null
	if ( !img_obj )
	{
		alert( FCKLang.msgImageNotSelected );
		closeWindow();
		return;
	}

	// Autoselect the language based on the current FCKeditor language
	// Check if the plugin has the language file for the active language.
	var sLang;
	if ( oEditor.FCKPlugins.Items['imgmap'].AvailableLangs.IndexOf( oEditor.FCKLanguageManager.ActiveLanguage.Code ) >= 0 )
	{
		sLang = oEditor.FCKLanguageManager.ActiveLanguage.Code;
	}
	else
	{
		// Load the english language file if the prefered by the user is not available.
		sLang = "en";
	}

	//late init
	myimgmap = new imgmap({
		mode : "editor2",
		custom_callbacks : {
			'onSelectArea' : onSelectArea,
			'onRemoveArea'	: onRemoveArea,
			'onStatusMessage' : function(str) {
				gui_statusMessage(str);
			}//to display status messages on gui

		},
		pic_container: $('pic_container'),
		bounding_box : false,
		lang : sLang
	});

	//we need this to load languages
	myimgmap.onLoad();

	myimgmap.loadImage(img_obj);

	//check if the image has a valid map already assigned
	var mapname;
	
	//check if _sik_img_map attribute is set (used in mediawiki)
	mapname = img_obj.getAttribute('_sik_img_map');
	if (typeof mapname == 'string' && mapname !== '') {
		// wikimap already assigned and filled => unpack
		var htmlMap = unpackWikiMaps(mapname);
		myimgmap.setMapHTML(htmlMap);
	}
	else {
		mapname = img_obj.getAttribute('usemap', 2) || img_obj.usemap;
		//console.log(mapname);
		if ( typeof mapname == 'string' && mapname !== '') {
			mapname = mapname.substr(1);
			var maps = oEditor.FCK.EditorDocument.getElementsByTagName('MAP');
			//console.log(maps);
			for (var i=0; i < maps.length; i++) {
				if (maps[i].name == mapname) {
					map_obj = maps[i];
					myimgmap.setMapHTML(map_obj);
	
					$('MapName').value = mapname;
					break;
				}
			}
		}
	}

	// We must set up this listener only after the current data has been read
	myimgmap.config.custom_callbacks.onAddArea = onAddArea;

	$('btnBrowse').style.display	= FCKConfig.LinkBrowser		? '' : 'none';

	if ( map_obj !== null )
	{
		// Select the first area: 
		myimgmap.selectedId = 0;
		onSelectArea( myimgmap.areas[0] );

		setMode( 'pointer' );
	}
	else
		hightlightMode( 'rect' );

	RefreshSize();
}

function Ok() {
	updateAreaValues();

	if (img_obj !== null && img_obj.nodeName == "IMG") {
		var MapInnerHTML = getMapInnerHTML(myimgmap);

		// If there are no areas, then exit (and remove if neccesary the map).
		if (MapInnerHTML == '')
		{
			removeMap();
			return true;
		}

		oEditor.FCKUndo.SaveUndoStep();

		myimgmap.mapid = myimgmap.mapname = $('MapName').value;
		var wiki = false;
		for ( var i = 0; i < FCKConfig.Plugins.Items.length; i++ ) {
			if (FCKConfig.Plugins.Items[i][0] == 'mediawiki') {
				//mediawiki plugin is present, we are most likely in a wiki env
				wiki = true;
				break;
			}
		}
		if (wiki) {
			// pack ImageMaps and write into "_sik_img_map" DOM attribute
			var mapwikicode = packWikiMaps();
			img_obj.setAttribute('_sik_img_map', mapwikicode);
			return true;
		}
		
		//else normal map output
		if (typeof map_obj == 'undefined' || map_obj === null) {
			map_obj = oEditor.FCK.EditorDocument.createElement('map');
			img_obj.parentNode.appendChild(map_obj);
		}
		
		map_obj.innerHTML = MapInnerHTML;

		// IE bug: it's not possible to directly assing the name and make it work easily
		// We remove the previous name
		if ( map_obj.name )
			map_obj.removeAttribute( 'name' );

		map_obj.name = myimgmap.getMapName();
		map_obj.id   = myimgmap.getMapId();
		
		img_obj.setAttribute('usemap', "#" + myimgmap.getMapName(), 0);
	}

	return true;
}

/**
 *	packing WikiImageMap Code into string variable => write into DOM Attribute
 *	@author	sroebj
 */
function packWikiMaps() {
	var ret = "";
	var coords;
	//foreach areas
	for (var i=0; i<myimgmap.areas.length; i++) {
		if (myimgmap.areas[i]) {
			if (myimgmap.areas[i].shape && myimgmap.areas[i].shape != "undefined") {
				// transformation: c,o,o,r,d,s => c o o r d s
				coords = myimgmap.areas[i].lastInput.split(",").join(" ");
				// putting it together e.g.: "circ 1,1,3 [[testlink]]"
				var link = myimgmap.areas[i].ahref;
				var alt  = myimgmap.areas[i].aalt;
				if (link != "") {
					ret += myimgmap.areas[i].shape + " " + coords + " [[" + link;
					(alt != "") ? ret += "|" + alt + "]]" : ret += "]]";
				}
			}
		}
	}
	return ret;
}

/**
 *	unpacking WikiImageMap Code from string variable src
 *	@author	sroebj
 */
function unpackWikiMaps(src){
	//Bsp.: HTML-ImageMap
	// <map name="map1">
	// <area href="name.htm" alt="Text" coords="3,15,7" shape="circle">
	// <area href="name2.htm" alt="Text" coords="15,46,69,50,13,14" shape="poly">
	//</map>
	// e.g.: Wiki-ImageMap read from image attribute
	// src = "rect 81 72 244 215 [[testlink1|altText1]] rect 11 22 24 25 [[testlink2|altText2]]"
	var current_from = 0;
	var current_to = 0;
	var current_area = "";

	var sub_from = 0;
	var sub_to = 0;

	var shape = "";
	var coords = "";
	var link = "";
	var altText = "";

	// Wiki-ImageMap html-representation
	var html_rep = "<map name=\"map1\">";// <map name="map1"> name is not contained in wiki-code, so it doesn't matter

	while (current_from < src.length){
		current_to = src.indexOf("]]",current_from) + 2; //+2 to cover the ]]
		current_area = src.substring(current_from,current_to);
		//continue with current_area
		//search shape (rect circle poly)
		shape = "";
		if (current_area.indexOf("rect") >= 0) {
			shape = "rect";
			sub_from = current_area.indexOf("rect") + 5;
		}
		else if (current_area.indexOf("circle") >= 0) {
			shape = "circle";
			sub_from = current_area.indexOf("circle") + 7;
		}
		else if (current_area.indexOf("poly") >= 0) {
			shape = "poly";
			sub_from = current_area.indexOf("poly") + 5;
		}
		else {
			alert(src);
			alert(current_area);
		}

		sub_to = current_area.indexOf("[[");
		coords = current_area.substring(sub_from, sub_to - 1); //sub_to-1 to ignore the blank before [[
		// e.g.: coords = "81 72 244 215"
		// for html-Code use comma instead of blanks
		coords = coords.replace(/ /g,","); // replace / /(blank) g=global(all) by ","
		//the rest is the wiki-link + alternative text (if applicable)
		link = current_area.substring(sub_to + 2,current_area.length - 2);
		altText = link.substring(link.indexOf("|") + 1);
		link = current_area.substring(sub_to + 2,current_area.indexOf("|"));
		//html code and add read area data
		// <area href="name.htm" alt="Text" coords="3,15,7" shape="circle">
		html_rep += ("<area href=\""+link+"\" alt="+altText+" coords=\""+coords+"\" shape=\""+shape+"\">");
		//examine next area
		current_from = current_to;
	}
	html_rep += "</map>"; //</map>
	return html_rep;
}

//remove the map object and unset the usemap attribute
function removeMap() {
	oEditor.FCKUndo.SaveUndoStep();
	if (img_obj !== null && img_obj.nodeName == "IMG") {
		img_obj.removeAttribute('usemap', 0);
		img_obj.removeAttribute('_sik_img_map', 0);
	}
	//myimgmap.log(typeof map_obj);
	if (typeof map_obj != 'undefined' && map_obj !== null) {
		map_obj.parentNode.removeChild(map_obj);
	}

	closeWindow();
}

function closeWindow() {
	if (typeof window.parent.CloseDialog == 'function') {
		window.parent.CloseDialog();
	}
	else {
		//older fck
		window.parent.close();
	}
}


function changelabeling(obj) {
	myimgmap.config.label = obj.value;
	myimgmap._repaintAll();
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
var currentAreaId = null;

// An area has been selected in the image
function onSelectArea(obj) {
	$( 'properties' ).style.visibility = '';

	updateAreaValues();

	currentAreaId = obj.aid;
	$( 'txtUrl' ).value = obj.ahref;
	$( 'cmbTarget' ).value = obj.atarget;
	$( 'txtAlt' ).value = obj.aalt;
	$( 'txtAttTitle' ).value = obj.atitle;
}

// A new area has been added
function onAddArea(id) {
	$( 'properties' ).style.visibility = '';

	updateAreaValues();

	currentAreaId = id;
	$( 'txtUrl' ).value = '';
	$( 'cmbTarget' ).value = '';
	$( 'txtAlt' ).value = '';
	$( 'txtAttTitle' ).value = '';
}

function onRemoveArea()
{
	currentAreaId = null;
	$( 'properties' ).style.visibility = 'hidden';
}

function updateAreaValues()
{
	if (currentAreaId !== null)
	{
		myimgmap.areas[currentAreaId].ahref = $( 'txtUrl' ).value;
		myimgmap.areas[currentAreaId].aalt = $( 'txtAlt' ).value;
		myimgmap.areas[currentAreaId].atitle = $( 'txtAttTitle' ).value;
		//do we need this? adam - 13-01-2008 17:23:45
		//myimgmap._recalculate(currentAreaId);
	}
}

// We use our own resizing because the default doesn't take into account Standards rendering mode.
function RefreshSize()
{
		var oInnerDoc = document;

		var iFrameHeight;
		if ( document.all )
			iFrameHeight = oInnerDoc.documentElement.offsetHeight;
		else
			iFrameHeight = window.innerHeight;

		var iInnerHeight = oInnerDoc.body.scrollHeight;

		var iDiff = iInnerHeight - iFrameHeight;

		if ( iDiff !== 0 )
		{
			if ( document.all )
				window.parent.dialogHeight = ( parseInt( window.parent.dialogHeight, 10 ) + iDiff ) + 'px';
			else
				window.parent.resizeBy( 0, iDiff );
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

var previousModeImg = null;
function hightlightMode(mode) {
	// Reset previous button
	if ( previousModeImg )
		previousModeImg.className = '';

	// Highlight new mode
	previousModeImg = $( 'img' + mode );
	previousModeImg.className = 'ActiveMode';
}



/* Call our custom version to protect URLs */

function getMapInnerHTML( imgmap )
{
	var html = '';
	//foreach area properties
	for (var i=0; i< imgmap.areas.length; i++) {
		html+= getAreaHtml( imgmap.areas[i] );
	}
	return(html);
}
// Protect urls and add only the used attributes
function getAreaHtml(area)
{
	if ( !area || area.shape == '')
		return '';

	var html = '<area shape="' + area.shape + '"' +
							' coords="' + area.lastInput + '"';

	if (area.aalt && area.aalt!='') html+= ' alt="' + area.aalt + '"';
	if (area.atitle && area.atitle!='') html+= ' title="' + area.atitle + '"';
	if (area.ahref && area.ahref!='') html+= ' href="' +	area.ahref + '" _fcksavedurl="' +	area.ahref + '"';
	if (area.atarget && area.atarget!='') html+= ' target="' + area.atarget + '"';
						
	html+='/>';
	return html;
}

/* edit the properties of an area */

function SetUrl(value)
{
	var id = currentAreaId;
	if ( id !== null)
	{
		myimgmap.areas[id].ahref = value;
		myimgmap._recalculate(id);
	}
}


function SetTarget(value)
{
	var id = currentAreaId;
	if ( id !== null)
	{
		myimgmap.areas[id].atarget = value;
		myimgmap._recalculate(id);
	}
}


function SetAlt(value)
{
	var id = currentAreaId;
	if ( id !== null)
	{
		myimgmap.areas[id].aalt = value;
		myimgmap._recalculate(id);
	}
}


function SetTitle(value)
{
	var id = currentAreaId;
	if ( id !== null)
	{
		myimgmap.areas[id].atitle = value;
		myimgmap._recalculate(id);
	}
}


/* Browse server */

function BrowseServer()
{
	OpenFileBrowser(
		FCKConfig.LinkBrowserURL,
		FCKConfig.LinkBrowserWindowWidth,
		FCKConfig.LinkBrowserWindowHeight );
}

function SetUrl( url, width, height, alt )
{
	GetE('txtUrl').value = url;

	if ( alt )
		GetE('txtAlt').value = alt;
}

/**
 *	Called from imgmap with new status string.
 */
function gui_statusMessage(str) {
	if (document.getElementById('status_container')) {
		document.getElementById('status_container').innerHTML = str;
	}
	window.defaultStatus = str;//for IE
}

function gui_zoom() {
	var scale = document.getElementById('dd_zoom').value;
	var pic = document.getElementById('pic_container').getElementsByTagName('img')[0];
	if (typeof pic == 'undefined') {return false;}
	if (typeof pic.oldwidth == 'undefined' || !pic.oldwidth) {
		pic.oldwidth = pic.width;
	}
	if (typeof pic.oldheight == 'undefined' || !pic.oldheight) {
		pic.oldheight = pic.height;
	}
	pic.width  = pic.oldwidth * scale;
	pic.height = pic.oldheight * scale;
	myimgmap.scaleAllAreas(scale);
}

