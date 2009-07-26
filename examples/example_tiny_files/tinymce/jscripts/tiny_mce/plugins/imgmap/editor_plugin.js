
/* Import plugin specific language pack */
tinyMCE.importPluginLanguagePack('imgmap');

var TinyMCE_imgmapPlugin = {
	
	getInfo : function() {
		return {
			longname  : 'Image Map Editor',
			author    : 'Adam Maschek, John Ericksen',
			authorurl : 'http://imgmap.googlecode.com',
			infourl   : 'http://imgmap.googlecode.com',
			version   : "1.1"
		};
	},

	getControlHTML : function(cn) {
		switch (cn) {
			case "imgmap":
				return tinyMCE.getButtonHTML(cn, 'lang_imgmap_desc', '{$pluginurl}/images/tinymce_button.gif', 'mceimgmapPopup');
		}
		return "";
	},

	execCommand : function(editor_id, element, command, user_interface, value) {
		switch (command) {
			case "mceimgmapPopup":
				var template = new Array();
				template['file']   = '../../plugins/imgmap/popup.html';
				template['width']  = 700;
				template['height'] = 670;

				var inst = tinyMCE.getInstanceById(editor_id);
				var elm  = inst.getFocusElement();

				if (elm != null && tinyMCE.getAttrib(elm, 'class').indexOf('mceItem') != -1)
					return true;

				tinyMCE.openWindow(template, {editor_id : editor_id, scrollbars : "yes", resizable: "yes"});
				return true;
		}
		return false;
	},

	handleNodeChange : function(editor_id, node, undo_index, undo_levels, visual_aid, any_selection) {

		if (node == null)
			return;
			
		//check parents
		//if image parent already has imagemap, toggle selected state, if simple image, use normal state
		do {
			//console.log(node.nodeName);
			if (node.nodeName == "IMG" && tinyMCE.getAttrib(node, 'class').indexOf('mceItem') == -1) {
				if (tinyMCE.getAttrib(node, 'usemap') != '') {
					tinyMCE.switchClass(editor_id + '_imgmap', 'mceButtonSelected');
				}
				else {
					tinyMCE.switchClass(editor_id + '_imgmap', 'mceButtonNormal');
				}
				return true;
			}
		}
		while ((node = node.parentNode));

		//button disabled by default
		tinyMCE.switchClass(editor_id + '_imgmap', 'mceButtonDisabled');
		return true;
	}

};

tinyMCE.addPlugin("imgmap", TinyMCE_imgmapPlugin);
