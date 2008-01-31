
function loadFile() {
	var fileToOpen = air.File.documentsDirectory;
	try {
	    fileToOpen.browseForOpen("Open");
	    fileToOpen.addEventListener(air.Event.SELECT, fileSelected);
	}
	catch (error) {
	    air.trace("Failed:", error.message);
	}

	function fileSelected(event) {
	air.Introspector.Console.log(event.target);
	myimgmap.loadImage(event.target.url);
	}
}

function loadUrl(url) {
	myimgmap.loadImage(url);
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
var recentDocuments =
new Array(new air.File("app-storage:/GreatGatsby.pdf"),
new air.File("app-storage:/WarAndPeace.pdf"),
new air.File("app-storage:/Iliad.pdf"));

function createMenus() {
	var fileMenu;

	if (air.NativeWindow.supportsMenu &&
		nativeWindow.systemChrome != air.NativeWindowSystemChrome.NONE) {
		nativeWindow.menu = new air.NativeMenu();
		nativeWindow.menu.addEventListener(air.Event.SELECT, selectCommandMenu);

		fileMenu = nativeWindow.menu.addItem(new air.NativeMenuItem("File"));
		fileMenu.submenu = createFileMenu();
	}
	if (air.NativeApplication.supportsMenu) {
		air.NativeApplication.nativeApplication.menu.addEventListener(air.Event.SELECT, selectCommandMenu);
		
		fileMenu = air.NativeApplication.nativeApplication.menu.addItem(new air.NativeMenuItem("File"));
		fileMenu.submenu = createFileMenu();
	}
}


function createFileMenu() {
	var fileMenu = new air.NativeMenu();
	fileMenu.addEventListener(air.Event.SELECT,selectCommandMenu);
	
	var newCommand = fileMenu.addItem(new air.NativeMenuItem("Get image from file..."));
	newCommand.addEventListener(air.Event.SELECT, selectCommand);

	var saveCommand = fileMenu.addItem(new air.NativeMenuItem("Get image from URL..."));
	saveCommand.addEventListener(air.Event.SELECT, selectCommand);

	var openFile = fileMenu.addItem(new air.NativeMenuItem("Open Recent"));
	openFile.submenu = new air.NativeMenu();
	openFile.submenu.addEventListener(air.Event.DISPLAYING, updateRecentDocumentMenu);
	openFile.submenu.addEventListener(air.Event.SELECT, selectCommandMenu);
	
	var separator = new air.NativeMenuItem("", true);
	fileMenu.addItem(separator);

	var exitCommand = fileMenu.addItem(new air.NativeMenuItem("Exit"));
	exitCommand.addEventListener(air.Event.SELECT, selectCommand);
	
	return fileMenu;
}

function updateRecentDocumentMenu(event) {
	air.trace("Updating recent document menu.");
	var docMenu = air.NativeMenu(event.target);
	for (var i = docMenu.numItems - 1; i >= 0; i--) {
		docMenu.removeItemAt(i);
	}
	for (var file in recentDocuments) {
		var menuItem =
			docMenu.addItem(new air.NativeMenuItem(recentDocuments[file].name));
		menuItem.data = recentDocuments[file];
		menuItem.addEventListener(air.Event.SELECT, selectRecentDocument);
	}
}

function selectRecentDocument(event) {
	air.trace("Selected recent document: " + event.target.data.name);
}

function selectCommand(event) {
	air.trace("Selected command: " + event.target.label);
	if (event.target.label == 'Get image from file...') {
		loadFile();
	}
	if (event.target.label == "Get image from URL...") {
	air.Introspector.Console.log(air.Clipboard.generalClipboard.getData("text/plain"));
		if (air.Clipboard.generalClipboard.hasFormat("text/plain")) {
			var pre = air.Clipboard.generalClipboard.getData("text/plain");
		}
		else {
			pre = "http://";
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
	} else {
		air.trace("Select event for \"" + event.target.label +
		"\" command handled by root menu.");
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

