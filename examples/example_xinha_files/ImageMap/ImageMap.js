/**
 *	Image Map Editor (imgmap) - plugin for Xinha
 *	Copyright (C) 2006 - 2009 Adam Maschek (adam.maschek @ gmail.com)
 *	
 *	This program is free software; you can redistribute it and/or
 *	modify it under the terms of the GNU General Public License
 *	as published by the Free Software Foundation; either version 2
 *	of the License, or (at your option) any later version.
 *	
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU General Public License for more details.
 *	
 *	You should have received a copy of the GNU General Public License
 *	along with this program; if not, write to the Free Software
 *	Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *	
 *  FOR INSTALLATION INSTRUCTIONS SEE INSTALL.TXT
 */
function ImageMap(editor)
{
	this.editor = editor;
	var cfg = editor.config;
	var self = this;
	
	//get base url of the plugin
	var plugin_base = Xinha.getPluginDir("ImageMap");
	
	cfg.registerButton(
	{
                id       : "ImageMap",
                tooltip  : HTMLArea._lc("Image Map Editor"),
                image    : plugin_base + '/images/button.gif',
                textMode : false,
                //only activate in image context
				context  : "img",
                action   : function(editor, id)
                {
					self.buttonPress(editor, id);
                }
        })

	//add after insertimage button
	cfg.addToolbarElement("ImageMap", ["insertimage"], 1);


	ImageMap._pluginInfo = {
		name          : "ImageMap",
		version       : "1.0",
		developer     : "Adam Maschek",
		developer_url : "http://www.maschek.hu",
		sponsor       : "",
		sponsor_url   : "",
		c_owner       : "Adam Maschek",
		license       : "GPL"
	};
	
	
	ImageMap.prototype.buttonPress = function(editor, id)
	{
		//opera might have problems with this
		var el = editor.activeElement(editor.getSelection());
		//only activate in image context
		if (typeof el != 'undefined' && el.nodeName.toLowerCase() == 'img') {
			//we have an image
			editor._popupDialog(
				"../../../" + plugin_base + "/popup.html",
				function(value){
					//do nothing
				},
				{img: el}
				);
		}
	}

}
