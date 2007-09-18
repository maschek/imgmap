var TinyMCE_ImageMapPlugin = {
	/**
	 * Returns information about the plugin as a name/value array.
	 * The current keys are longname, author, authorurl, infourl and version.
	 *
	 * @returns Name/value array containing information about the plugin.
	 * @type Array 
	 */
	getInfo : function() {
		return {
			longname : 'Your plugin',
			author : 'Your name',
			authorurl : 'http://www.yoursite.com',
			infourl : 'http://www.yoursite.com/docs/template.html',
			version : "1.0"
		};
	},

	/**
	 * Gets executed when a TinyMCE editor instance is initialized.
	 *
	 * @param {TinyMCE_Control} Initialized TinyMCE editor control instance. 
	 *
	initInstance : function(inst) {
		// You can take out plugin specific parameters
		//alert("Initialization parameter:" + tinyMCE.getParam("imagemap_someparam", false));

		// Register custom keyboard shortcut
		inst.addShortcut('ctrl', 't', 'lang_imagemap_desc', 'imagemap');
		
		
	},*


	/**
	 * Returns the HTML code for a specific control or empty string if this plugin doesn't have that control.
	 * A control can be a button, select list or any other HTML item to present in the TinyMCE user interface.
	 * The variable {$editor_id} will be replaced with the current editor instance id and {$pluginurl} will be replaced
	 * with the URL of the plugin. Language variables such as {$lang_somekey} will also be replaced with contents from
	 * the language packs.
	 *
	 * @param {string} cn Editor control/button name to get HTML for.
	 * @return HTML code for a specific control or empty string.
	 * @type string
	 */
	getControlHTML : function(cn) {
		switch (cn) {
			case "imagemap":
				return tinyMCE.getButtonHTML(cn, 'lang_imagemap_desc', '{$pluginurl}/images/template.gif', 'imagemap');
		}

		return "";
	},

	/**
	 * Executes a specific command, this function handles plugin commands.
	 *
	 * @param {string} editor_id TinyMCE editor instance id that issued the command.
	 * @param {HTMLElement} element Body or root element for the editor instance.
	 * @param {string} command Command name to be executed.
	 * @param {string} user_interface True/false if a user interface should be presented.
	 * @param {mixed} value Custom value argument, can be anything.
	 * @return true/false if the command was executed by this plugin or not.
	 * @type
	 */
	execCommand : function(editor_id, element, command, user_interface, value) {
		// Handle commands
		switch (command) {
			// Remember to have the "mce" prefix for commands so they don't intersect with built in ones in the browser.
			case "imagemap":
				var template = new Array();

				template['file']   = '../../plugins/imagemapper/imagemapper.htm';
				template['width']  = 480;
				template['height'] = 380;

				// Language specific width and height addons
				template['width']  += tinyMCE.getLang('lang_advimage_delta_width', 0);
				template['height'] += tinyMCE.getLang('lang_advimage_delta_height', 0);

				var inst = tinyMCE.getInstanceById(editor_id);
				var elm = inst.getFocusElement();

				if (elm != null && tinyMCE.getAttrib(elm, 'class').indexOf('mceItem') != -1)
					return true;

				tinyMCE.openWindow(template, {editor_id : editor_id, inline : "yes"});

				return true;
			case "getImageMap":
			
				alert('hello');
				
				return true;
		}

		// Pass to next handler in chain
		return false;
	},

	/**
	 * Gets called ones the cursor/selection in a TinyMCE instance changes. This is useful to enable/disable
	 * button controls depending on where the user are and what they have selected. This method gets executed
	 * alot and should be as performance tuned as possible.
	 *
	 * @param {string} editor_id TinyMCE editor instance id that was changed.
	 * @param {HTMLNode} node Current node location, where the cursor is in the DOM tree.
	 * @param {int} undo_index The current undo index, if this is -1 custom undo/redo is disabled.
	 * @param {int} undo_levels The current undo levels, if this is -1 custom undo/redo is disabled.
	 * @param {boolean} visual_aid Is visual aids enabled/disabled ex: dotted lines on tables.
	 * @param {boolean} any_selection Is there any selection at all or is there only a cursor.
	 */
	handleNodeChange : function(editor_id, node, undo_index, undo_levels, visual_aid, any_selection) {
	    if (node == null)
			return;

		do {
			if (node.nodeName == "A" && tinyMCE.getAttrib(node, 'href') != "") {
				tinyMCE.switchClass(editor_id + '_advlink', 'mceButtonSelected');
				return true;
			}
		} while ((node = node.parentNode));
		

		if (any_selection) {
			tinyMCE.switchClass(editor_id + '_imagemap', 'mceButtonNormal');
			return true;
		}

		tinyMCE.switchClass(editor_id + '_imagemap', 'mceButtonDisabled');

		return true;
	},

	/**
	 * Gets called when the contents of a TinyMCE area is modified, in other words when a undo level is
	 * added.
	 *
	 * @param {TinyMCE_Control} inst TinyMCE editor area control instance that got modified.
	 */
	onChange : function(inst) {
	},

};

// Adds the plugin class to the list of available TinyMCE plugins
tinyMCE.addPlugin("imagemap", TinyMCE_ImageMapPlugin);