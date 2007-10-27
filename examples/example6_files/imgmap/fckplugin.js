
imgmapCommand_GetState = function() {
	if ( FCK.EditMode != FCK_EDITMODE_WYSIWYG )
		return FCK_TRISTATE_DISABLED;

	var oImage = FCK.Selection.GetSelectedElement() ;
	if ( oImage && oImage.tagName == 'IMG'  )
	{
		// Does it has an assigned map?
		if (oImage.getAttribute( 'usemap' ))
			return FCK_TRISTATE_ON; 

		// Plain image
		return FCK_TRISTATE_OFF; 
	}
	// No image selected
	return FCK_TRISTATE_DISABLED;
}


FCKCommands.RegisterCommand( 'imgmapPopup', 
	new FCKDialogCommand( FCKLang.imgmapDlgName, FCKLang.imgmapDlgTitle, FCKPlugins.Items['imgmap'].Path + 'popup.html', 700, 600, imgmapCommand_GetState ) ) ;


// create imgmap toolbar button.
var imgmapButton = new FCKToolbarButton('imgmapPopup', FCKLang.imgmapBtn, null, null, false, true);
imgmapButton.IconPath = FCKPlugins.Items['imgmap'].Path + 'images/editor_icon.gif';
FCKToolbarItems.RegisterItem('imgmapPopup', imgmapButton);

// register new contextmenu
FCK.ContextMenu.RegisterListener({
	AddItems : function( menu, tag, tagName ) {
		// under what circumstances do we display this option
		if (tagName == 'IMG') {
			// when the option is displayed, show a separator  the command
			menu.AddSeparator();
			// the command needs the registered command name, the title for the context menu, and the icon path
			menu.AddItem('imgmapPopup', FCKLang.imgmapDlgTitle, imgmapButton.IconPath);
		}
	}
});



// Fix behavior for IE, it doesn't read back the .name on newly created maps 
FCKXHtml.TagProcessors['map'] = function( node, htmlNode )
{
	if ( ! node.attributes.getNamedItem( 'name' ) )
	{
		var name = htmlNode.name ;
		if ( name )
			FCKXHtml._AppendAttribute( node, 'name', name ) ;
	}

	node = FCKXHtml._AppendChildNodes( node, htmlNode, true ) ;

	return node ;
}
