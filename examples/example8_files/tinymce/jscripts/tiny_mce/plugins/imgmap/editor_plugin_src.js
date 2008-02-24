

(function() {
	tinymce.PluginManager.requireLangPack('imgmap');
	
	tinymce.create('tinymce.plugins.imgmapPlugin', {
		init : function(ed, url) {
			// Register commands
			ed.addCommand('mceimgmapPopup', function() {
				var e = ed.selection.getNode();

				// Internal image object like a flash placeholder
				if (ed.dom.getAttrib(e, 'class').indexOf('mceItem') != -1)
					return;

				ed.windowManager.open({
					file : url + '/popup.html',
					width : 700,
					height : 560,
					inline : 1
				}, {
					plugin_url : url
				});
			});

			// Register buttons
			//tinyMCE.getButtonHTML(cn, 'lang_imgmap_desc', '{$pluginurl}/images/tinymce_button.gif', 'mceimgmapPopup');
			ed.addButton('imgmap', {
				title : 'imgmap.desc',
				cmd : 'mceimgmapPopup',
				image : url + '/images/tinymce_button.gif'
			});
			
			// Add a node change handler, selects the button in the UI when a image is selected
			ed.onNodeChange.add(function(ed, cm, node) {
				if (node == null)
					return;
					
				//check parents
				//if image parent already has imagemap, toggle selected state, if simple image, use normal state
				do {
					//console.log(node.nodeName);
					if (node.nodeName == "IMG" &&  ed.dom.getAttrib(node, 'class').indexOf('mceItem') == -1) {
						if (ed.dom.getAttrib(node, 'usemap') != '') {
							cm.setDisabled('imgmap', false);
							cm.setActive('imgmap', true);
						}
						else {
							cm.setDisabled('imgmap', false);
							cm.setActive('imgmap', false);
						}
						return true;
					}
				}
				while ((node = node.parentNode));
		
				//button disabled by default
				cm.setDisabled('imgmap', true);
				cm.setActive('imgmap', false);
				return true;
			});
			
		},

		getInfo : function() {
			return {
				longname  : 'Image Map Editor',
				author    : 'Adam Maschek, John Ericksen',
				authorurl : 'http://imgmap.googlecode.com',
				infourl   : 'http://imgmap.googlecode.com',
				version   : "2.0"
			};
		}
	});

	// Register plugin
	tinymce.PluginManager.add('imgmap', tinymce.plugins.imgmapPlugin);
})();


var TinyMCE_imgmapPlugin = {
	


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

//tinyMCE.addPlugin("imgmap", TinyMCE_imgmapPlugin);
//tinymce.PluginManager.add("imgmap", tinymce.plugins.imgmapPlugin);
