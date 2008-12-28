/**
 *	Functions to add functionality to the editor as a desktop application.
 *	Includes menu handling, most recently used items (MRU) handling, etc.
 *	@author	Adam Maschek
 *	@date	17-02-2008 19:38:30
 */    

function loadFile() {
	var fileToOpen = air.File.documentsDirectory;
	try {
	    fileToOpen.browseForOpen("Open");
	    fileToOpen.addEventListener(air.Event.SELECT, function (event) {
			loadUrl(event.target.url);
		});
	}
	catch (error) {
	    air.trace("Failed: ", error.message);
	}
}

function loadUrl(url) {
	if (url) {
		//remove em element first
		var ems = document.getElementById('pic_container').getElementsByTagName('em');
		if (ems[0]) {
			document.getElementById('pic_container').removeChild(ems[0]);
		}
		myimgmap.loadImage(url);
		saveRecentDocument(url);//save as mru
	}
}

function rewriteURLs() {
	var links = document.getElementsByTagName('a');
	for (var i = 0; i < links.length; i++) {
		if (links[i].href.match(/^http:/)) {
			links[i].onclick = function () {
				air.navigateToURL(new air.URLRequest(this.href));
				return false;
			};
		}
	}
}

/** DRAG N DROP HANDLING PART *************************************************/

document.getElementById('pic_container').addEventListener("dragenter", preventDefault);
document.getElementById('pic_container').addEventListener("dragover", preventDefault);
document.getElementById('pic_container').addEventListener('drop', fileSelected);

function fileSelected(event) {
	//air.Introspector.Console.log('plain:'+event.dataTransfer.getData("text/plain"));
	//air.Introspector.Console.log('uri:'+event.dataTransfer.getData("text/uri-list"));
	//air.Introspector.Console.log(event.dataTransfer.getData("application/x-vnd.adobe.air.file-list"));
	if (event.dataTransfer.getData("text/uri-list")) {
		loadUrl(event.dataTransfer.getData("text/uri-list"));
		return true;
	}
	else if (event.dataTransfer.getData("text/plain")) {
		loadUrl(event.dataTransfer.getData("text/plain"));
		return true;
	}
	else if (event.dataTransfer.getData("application/x-vnd.adobe.air.file-list")) {
		//get first elment
		loadUrl(event.dataTransfer.getData("application/x-vnd.adobe.air.file-list")[0].url);
		return true;
	}
	return false;
}

function preventDefault(event) {
	event.preventDefault();
}


/** MENU HANDLING PART ********************************************************/

createMenus();

//var application = air.NativeApplication.nativeApplication;
var recentDocuments = [];

function createMenus() {
	
	//create file menu depending on chromes or chromelsess window style
	if (air.NativeWindow.supportsMenu &&
		nativeWindow.systemChrome != air.NativeWindowSystemChrome.NONE) {
		nativeWindow.menu = new air.NativeMenu();
		nativeWindow.menu.addEventListener(air.Event.SELECT, selectCommandMenu);
		
		fileMenu = nativeWindow.menu.addItem(new air.NativeMenuItem("File"));
		fileMenu.submenu = createFileMenu();
		
		helpMenu = nativeWindow.menu.addItem(new air.NativeMenuItem("Help"));
		helpMenu.submenu = createHelpMenu();
	}
	else if (air.NativeApplication.supportsMenu) {
		air.NativeApplication.nativeApplication.menu.addEventListener(air.Event.SELECT, selectCommandMenu);
		
		fileMenu = air.NativeApplication.nativeApplication.menu.addItem(new air.NativeMenuItem("File"));
		fileMenu.submenu = createFileMenu();
		
		helpMenu = air.NativeApplication.nativeApplication.menu.addItem(new air.NativeMenuItem("Help"));
		helpMenu.submenu = createHelpMenu();
	}
}


function createFileMenu() {
	var fileMenu = new air.NativeMenu();
	fileMenu.addEventListener(air.Event.SELECT, selectCommandMenu);
	
	var new1Command = fileMenu.addItem(new air.NativeMenuItem("Get image from file..."));
	new1Command.addEventListener(air.Event.SELECT, selectCommand);

	var new2Command = fileMenu.addItem(new air.NativeMenuItem("Get image from URL..."));
	new2Command.addEventListener(air.Event.SELECT, selectCommand);

	var recentCommand = fileMenu.addItem(new air.NativeMenuItem("Open Recent"));
	recentCommand.submenu = new air.NativeMenu();
	recentCommand.submenu.addEventListener(air.Event.DISPLAYING, loadRecentDocuments);
	//recentCommand.submenu.addEventListener(air.Event.SELECT, selectCommandMenu);
	
	fileMenu.addItem(new air.NativeMenuItem("", true));//separator

	var exitCommand = fileMenu.addItem(new air.NativeMenuItem("Exit"));
	exitCommand.addEventListener(air.Event.SELECT, selectCommand);
	
	return fileMenu;
}

function createHelpMenu() {
	var hm = new air.NativeMenu();
	hm.addEventListener(air.Event.SELECT, selectCommandMenu);

	var help1Command = hm.addItem(new air.NativeMenuItem("Online version"));
	//help11Command.addEventListener(air.Event.SELECT, selectCommand);

	var help2Command = hm.addItem(new air.NativeMenuItem("About"));
	//new2Command.addEventListener(air.Event.SELECT, selectCommand);

	return hm;
}

function showRecentDocumentMenu() {
	var recentMenu = fileMenu.submenu.items[2].submenu;
	var i;
	//first remove all old menuitems
	//have to loop backwards otherwise not good
	for (i = recentMenu.numItems - 1; i >= 0; i--) {
		recentMenu.removeItemAt(i);
	}
	//add new items to the submenu
	for (i = 0; i < recentDocuments.length; i++) {
		var menuItem = recentMenu.addItem(new air.NativeMenuItem(recentDocuments[i]));
		menuItem.data = recentDocuments[i];
		menuItem.addEventListener(air.Event.SELECT, selectRecentDocument);
	}
}

function selectRecentDocument(event) {
	air.trace("Selected recent document: " + event.target.data);
	loadUrl(event.target.data);
}

function selectCommand(event) {
	var temp;
	air.trace("Selected command: " + event.target.label);
	if (event.target.label == 'Get image from file...') {
		loadFile();
	}
	if (event.target.label == "Get image from URL...") {
		//air.Introspector.Console.log(air.Clipboard.generalClipboard.formats);
		var pre = "http://";
		if (air.Clipboard.generalClipboard.hasFormat("air:text")) {
			temp = air.Clipboard.generalClipboard.getData("air:text");
		}
		else if (air.Clipboard.generalClipboard.hasFormat("text/plain")) {
			//i think this never works despite the documentation only contains this one
			temp = air.Clipboard.generalClipboard.getData("text/plain");
		}
		if (temp.match(/^\s*(http:|https:|ftp:|file:|www)/i)) {
			//clipboard most likely contains an url
			pre = temp;
		}
		var url = window.prompt("URL to open", pre);
		if (url) {loadUrl(url);}
	}
	if (event.target.label == "Exit") {
		air.NativeApplication.nativeApplication.exit();
	}
}

function selectCommandMenu(event) {
	if (event.currentTarget.parent !== null) {
		var menuItem = findItemForMenu(event.currentTarget);
		if(menuItem !== null){
			air.trace("Select event for \"" + event.target.label +
			"\" command handled by menu: " + menuItem.label);
		}
	}
	else {
		air.trace("Select event for \"" + event.target.label + "\" command handled by root menu.");
		if (event.target.label == "Online version") {
			air.navigateToURL(new air.URLRequest("http://www.maschek.hu/imagemap/imgmap"));
		}
		else if (event.target.label == "About") {
			aboutwin = window.open("about.html", "aboutwin", "height=215,width=450");
		}
	}
}

function findItemForMenu(menu){
	for (var item in menu.parent.items) {
		if (item !== null) {
			if (item.submenu == menu) {
				return item;
			}
		}
	}
	return null;
}


/** DATABASE HANDLING PART ****************************************************/

var conn = new air.SQLConnection();
conn.addEventListener(air.SQLErrorEvent.ERROR, sql_connError);
var dbFile = air.File.applicationStorageDirectory.resolvePath("imgmap.db");
conn.open(dbFile, air.SQLMode.UPDATE);//sync mode

function sql_connError(event) {
	air.trace("Error message:", event.error.message);
	air.trace("Details:", event.error.details);
}

function query(sql) {
	try {
		var stmt = new air.SQLStatement();
		stmt.sqlConnection = conn;//global
		stmt.text = sql;
		stmt.execute();
		var result = stmt.getResult();
		return result;
	}
	catch (err) {
		if (err.details.match(/no such table: .mru_files./)) {
			createTable('mru_files');
			//recurse
			return query(sql);
		}
		else {
			air.trace("Error message:", err.message);
			air.trace("Details:", err.details);
		}
		return false;
	}
}

function loadRecentDocuments() {
	var result = query("SELECT DISTINCT url FROM mru_files ORDER BY id DESC LIMIT 10");
	if (result && result.data) {
		var numResults = result.data.length;
		recentDocuments = [];//blank out array
		for (var i = 0; i < numResults; i++) {
			var row = result.data[i];
			recentDocuments.push(row.url);
		}
		showRecentDocumentMenu();
	}
}


function saveRecentDocument(url) {
	query("INSERT INTO mru_files (url) VALUES ('" + url + "')");
}

function createTable(name) {
	if (name == 'mru_files') {
		var sql =
		"CREATE TABLE IF NOT EXISTS mru_files (" +
		" id INTEGER PRIMARY KEY AUTOINCREMENT, " +
		" url TEXT " +
		")";
	}
	if (sql) {
		if (query(sql)) {
			air.trace('Created table '+name);
		}
	}
}

