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
		myimgmap.loadImage(url);
		saveRecentDocument(url);//save as mru
	}
}

/*
document.getElementById('aa').addEventListener('drop', fileSelected2);
function fileSelected2(event) {
air.Introspector.Console.log(event.target);
}
*/


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
	//air.Introspector.Console.log(fileMenu.submenu.items[2]);
	var recentMenu = fileMenu.submenu.items[2].submenu;
	//first remove all old menuitems
	for (var i = 0; i < recentMenu.numItems; i++) {
		recentMenu.removeItemAt(i);
	}
	//add new items to the submenu
	for (var i = 0; i < recentDocuments.length; i++) {
		air.trace(recentDocuments[i]);
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
	air.trace("Selected command: " + event.target.label);
	if (event.target.label == 'Get image from file...') {
		loadFile();
	}
	if (event.target.label == "Get image from URL...") {
		//air.Introspector.Console.log(air.Clipboard.generalClipboard.formats);
		var pre = "http://";
		if (air.Clipboard.generalClipboard.hasFormat("air:text")) {
			pre = air.Clipboard.generalClipboard.getData("air:text");
		}
		else if (air.Clipboard.generalClipboard.hasFormat("text/plain")) {
			pre = air.Clipboard.generalClipboard.getData("text/plain");
		}
		var url = window.prompt("URL to open", pre);
		if (url) loadUrl(url);
	}
	if (event.target.label == "Exit") {
		air.NativeApplication.nativeApplication.exit()
	}
	
	
}

function selectCommandMenu(event) {
	if (event.currentTarget.parent != null) {
		var menuItem = findItemForMenu(event.currentTarget);
		if(menuItem != null){
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
		if (item != null) {
			if (item.submenu == menu) {
				return item;
			}
		}
	}
	return null;
}


/** DATABASE HANDLING PART ****************************************************/

var conn = new air.SQLConnection();
conn.addEventListener(air.SQLEvent.OPEN, sql_connEvent);
conn.addEventListener(air.SQLErrorEvent.ERROR, sql_connError);
var dbFile = air.File.applicationStorageDirectory.resolvePath("imgmap.db");
conn.openAsync(dbFile);

function sql_connEvent(event) {
	air.trace("Database connection successful");
}

function sql_connError(event) {
	air.trace("Error message:", event.error.message);
	air.trace("Details:", event.error.details);
}


function loadRecentDocuments() {
	var stmt = new air.SQLStatement();
	stmt.sqlConnection = conn;//global
	stmt.text = "SELECT DISTINCT url FROM mru_files ORDER BY id DESC LIMIT 10";
	stmt.addEventListener(air.SQLErrorEvent.ERROR, sql_queryError);
	stmt.addEventListener(air.SQLEvent.RESULT, function (event) {
		var result = stmt.getResult();
		if (result && result.data) {
			var numResults = result.data.length;
			recentDocuments = [];//blank out array
			for (var i = 0; i < numResults; i++) {
				var row = result.data[i];
				recentDocuments.push(row.url);
			}
			showRecentDocumentMenu();
		}
	});
	stmt.execute();
}


function saveRecentDocument(url) {
	var stmt = new air.SQLStatement();
	stmt.sqlConnection = conn;//global
	stmt.text = "INSERT INTO mru_files (url) VALUES ('" + url + "')";
	stmt.addEventListener(air.SQLErrorEvent.ERROR, sql_queryError);
	stmt.addEventListener(air.SQLEvent.RESULT, function (event) {
		air.trace("MRU saved");
	});
	stmt.execute();
}

function sql_queryError(event) {
	//air.Introspector.Console.log(event.error);
	if (event.error.details == 'no such table: mru_files') {
		createTable('mru_files');
	}
	else {
		air.trace("Error message:", event.error.message);
		air.trace("Details:", event.error.details);
	}
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
		var stmt = new air.SQLStatement();
		stmt.sqlConnection = conn;//global
		stmt.text = sql;
		stmt.addEventListener(air.SQLErrorEvent.ERROR, sql_queryError);
		stmt.execute();
	}
}

