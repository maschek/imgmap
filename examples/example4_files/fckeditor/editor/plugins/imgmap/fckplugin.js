
//alert('loading plugin imgmap');

var imgmapCommand = function() {
};
imgmapCommand.prototype.GetState = function() {
       // return FCK_TRISTATE_OFF; //we dont want the button to be toggled
}
imgmapCommand.prototype.Execute = function() {
	window.open(
		FCKPlugins.Items['imgmap'].Path + 'popup.html',
		FCKLang.imgmapDlgName,
		'width=700,height=700,scrollbars=no,scrolling=no,location=no,toolbar=no');
}


// register the related command.
FCKCommands.RegisterCommand(
	'imgmapPopup',
	new imgmapCommand(
		FCKLang.imgmapDlgName,
		FCKLang.imgmapDlgTitle,
		FCKPlugins.Items['imgmap'].Path + 'popup.html', 700, 700));

// create imgmap toolbar button.
var button = new FCKToolbarButton('imgmapPopup', FCKLang.imgmapBtn);
button.IconPath = FCKPlugins.Items['imgmap'].Path + 'images/editor_icon.gif';
FCKToolbarItems.RegisterItem('imgmapPopup', button);

// register new contextmenu
FCK.ContextMenu.RegisterListener({
	AddItems : function( menu, tag, tagName ) {
		// under what circumstances do we display this option
		if (tagName == 'IMG') {
			// when the option is displayed, show a separator  the command
			menu.AddSeparator();
			// the command needs the registered command name, the title for the context menu, and the icon path
			menu.AddItem('imgmapPopup', FCKLang.imgmapDlgTitle, button.IconPath);
		}
	}
});
