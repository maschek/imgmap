[//lasso
/*
 * FCKeditor - The text editor for Internet - http://www.fckeditor.net
 * Copyright (C) 2003-2007 Frederico Caldeira Knabben
 * 
 * == BEGIN LICENSE ==
 * 
 * Licensed under the terms of any of the following licenses at your
 * choice:
 * 
 *  - GNU General Public License Version 2 or later (the "GPL")
 *    http://www.gnu.org/licenses/gpl.html
 * 
 *  - GNU Lesser General Public License Version 2.1 or later (the "LGPL")
 *    http://www.gnu.org/licenses/lgpl.html
 * 
 *  - Mozilla Public License Version 1.1 or later (the "MPL")
 *    http://www.mozilla.org/MPL/MPL-1.1.html
 * 
 * == END LICENSE ==
 * 
 * File Name: fckeditor.lasso
 * 	This is the integration file for Lasso.
 * 
 * 	It defines the FCKeditor class ("custom type" in Lasso terms) that can 
 * 	be used to create editor instances in Lasso pages on server side.
 * 
 * File Authors:
 * 		Jason Huck (jason.huck@corefive.com)
 */

	define_type(
		'editor', 
		-namespace='fck_', 
		-description='Creates an instance of FCKEditor.'
	);
		local(
			'instancename'	=	'FCKEditor1',
			'width'			=	'100%',
			'height'		=	'200',
			'toolbarset'	=	'Default',
			'initialvalue'	=	string,
			'basepath'		=	'/fckeditor/',
			'config'		=	array,
			'checkbrowser'	=	true,
			'displayerrors'	=	false
		);
	
		define_tag(
			'onCreate',
			-required='instancename', -type='string',
			-optional='width', -type='string',
			-optional='height', -type='string',
			-optional='toolbarset', -type='string',
			-optional='initialvalue', -type='string',
			-optional='basepath', -type='string',
			-optional='config', -type='array'
		);			
			self->instancename = #instancename;
			local_defined('width') ? self->width = #width;
			local_defined('height') ? self->height = #height;
			local_defined('toolbarset') ? self->toolbarset = #toolbarset;
			local_defined('initialvalue') ? self->initialvalue = #initialvalue;
			local_defined('basepath') ? self->basepath = #basepath;
			local_defined('config') ? self->config = #config;
		/define_tag;
		
		define_tag('create');
			if(self->isCompatibleBrowser);
				local('out' = '
					<div>
						<input type="hidden" id="' + self->instancename + '" name="' + self->instancename + '" value="' + encode_html(self->initialvalue) + '" style="display:none" />
						' + self->parseConfig + '
						<iframe id="' + self->instancename + '___Frame" src="' + self->basepath + 'editor/fckeditor.html?InstanceName=' + self->instancename + '&Toolbar=' + self->toolbarset + '" width="' + self->width + '" height="' + self->height + '" frameborder="0" scrolling="no"></iframe>
					</div>
				');
			else;
				local('out' = '
					<div>
						<textarea name="' + self->instancename + '" rows="4" cols="40" style="width: ' + self->width + '; height: ' + self->height + '">' + encode_html(self->initialvalue) + '</textarea>
					</div>	
				');
			/if;		
			return(@#out);
		/define_tag;
		
		define_tag('isCompatibleBrowser');
			local('result' = true);		
			(client_browser >> 'Apple' || client_browser >> 'Opera' || client_browser >> 'KHTML') ? #result = false;		
			return(#result);
		/define_tag;
		
		define_tag('parseConfig');
			if(self->config->size);
				local('out' = '<input type="hidden" id="' + self->instancename + '___Config" value="');			
				iterate(self->config, local('this'));
					loop_count > 1 ? #out += '&amp;';			
					#out += encode_html(#this->first) + '=' + encode_html(#this->second);
				/iterate;			
				#out += '" style="display:none" />\n';			
				return(@#out);
			/if;
		/define_tag;
	/define_type;	
]
