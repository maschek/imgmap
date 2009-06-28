Ext.namespace('Ext.ux');

/**
 *
 * @class ImageMapPanel
 * @extends Ext.Panel
 */
Ext.ux.ImageMapPanel = Ext.extend(Ext.Panel, {
	initComponent : function(){
		var defConfig = {
			plain: true,
			border: false,
			autoScroll: true,
			editWinId: 'edit_win_form',
			imageMap : null,
			imageObj : null,
			mapObj : null,
			currentAreaId: null,
			tbar: [
               	{text: '',iconCls: 'pointer', enableToggle: true, toggleGroup: 'shapeselect', handler: function(){this.setMode('pointer');}, scope:this},
               	{text: '',iconCls: 'rectangle', enableToggle: true, toggleGroup: 'shapeselect', pressed: true, handler: function(){this.setMode('rect');}, scope:this},
               	{text: '',iconCls: 'circle', enableToggle: true, toggleGroup: 'shapeselect', handler: function(){this.setMode('circle');}, scope:this},
               	{text: '',iconCls: 'polygon', enableToggle: true, toggleGroup: 'shapeselect', handler: function(){this.setMode('poly');}, scope:this},
                {text: 'Remove',handler: function(){this.imageMap.removeArea(this.imageMap.currentid);}, scope:this},
                {text: 'Preview',enableToggle: true, handler: function(){this.imageMap.togglePreview();}, scope:this},
				'-',
				{text: 'Zoom: '},
                new Ext.form.ComboBox({
					fieldLabel: 'Zoom',
					name: 'dd_zoom',
					id: 'dd_zoom',
					store : new Ext.data.SimpleStore({
						fields: ['id', 'name'],	
						data: [['0.25', '25%'],['0.5', '50%'],['1', '100%'],['2', '200%'],['3', '300%']]
					}),
					width: 60,
					triggerAction: 'all',
					mode: 'local',
					allowBlank: true,
					editable: false,
					displayField: 'name',
					valueField: 'id',
					listeners : {
						select : function(combo, rec, index){
							this.gui_zoom(rec.data.id);
						}.bind(this)
					}
				})
			],
			bbar: [
				'->',
				new Ext.form.Label({
					text : 'Ready',
					id: 'imagemapStatusPanel'
				})
			]
        };
        
		Ext.applyIf(this,defConfig);
		Ext.ux.ImageMapPanel.superclass.initComponent.call(this); 
	},
	
    afterRender : function(){
    	var wh = this.ownerCt.getSize();
        Ext.applyIf(this, wh);
    	Ext.ux.ImageMapPanel.superclass.afterRender.call(this);
    	
    	//this.imagePanel = new Ext.Panel({layout: 'fit', id : 'pic_container'});
    	
    	this.body.id = 'pic_container';
    	this.body.dom.id = 'pic_container';
		
    	//this.add(this.imagePanel);
		//this.doLayout();
		
		//instantiate the imgmap component, setting up some basic config values
		this.imageMap = new imgmap({
			mode : "editor2",
			waterMark : "",
			loglevel: 1,
			custom_callbacks : {
				'onStatusMessage' : function(str) {this.onStatusMessage(str);}.bind(this),//to display status messages on gui
				'onHtmlChanged'   : function(str) {this.gui_htmlChanged(str);}.bind(this),//to display updated html on gui
				'onModeChanged'   : function(mode) {this.gui_modeChanged(mode);}.bind(this),//to switch normal and preview modes on gui
				'onAddArea'       : function(id)  {this.onAddArea(id);}.bind(this),//to add new form element on gui
				'onRemoveArea'    : function(id)  {this.onRemoveArea(id);}.bind(this),//to remove form elements from gui
				'onSelectArea'    : function(obj) {this.onSelectArea(obj);}.bind(this),//to select form element when an area is clicked
				'onDblClickArea'    : function(obj) {this.onEditArea(obj);}.bind(this)
			},
			pic_container: document.getElementById('pic_container'),
			bounding_box : false
		});
		
		this.imageMap.onLoad();
    },
    
    getImageMap : function(){
    	return(this.imageMap);
    },

	inputChange : function(obj, id) {
		if (this.imageMap.viewmode === 1) {return;}//exit if preview mode
		if (this.imageMap.is_drawing) {return;}//exit if drawing
		if (obj.name == 'img_href')        {this.imageMap.areas[id].ahref   = obj.getValue();}
		else if (obj.name == 'img_alt')    {this.imageMap.areas[id].aalt    = obj.getValue();}
		else if (obj.name == 'img_title')  {this.imageMap.areas[id].atitle  = obj.getValue();}
		else if (obj.name == 'img_target') {this.imageMap.areas[id].atarget = obj.getValue();}
		else if (obj.name == 'img_shape') {
			if (this.imageMap.areas[id].shape != obj.value && this.imageMap.areas[id].shape != 'undefined') {
				//shape changed, adjust coords intelligently inside _normCoords
				var coords = '';
				coords = this.imageMap.areas[id].lastInput || '' ;
				coords = this.imageMap._normCoords(coords, obj.value, 'from'+this.imageMap.areas[id].shape);
				this.imageMap.areas[id].shape = obj.getValue();
				this.imageMap._recalculate(id, coords);
				this.imageMap.areas[id].lastInput = coords;
			}
			else if (this.imageMap.areas[id].shape == 'undefined') {
				this.imageMap.nextShape = obj.getValue();
			}
		}
		if (this.imageMap.areas[id] && this.imageMap.areas[id].shape != 'undefined') {
			this.imageMap._recalculate(id, this.imageMap.areas[id].lastInput);
			this.imageMap.fireEvent('onHtmlChanged', this.imageMap.getMapHTML());//temp ## shouldnt be here
		}
	},
	
	/**
	*	Called from imgmap with the new html code when changed.
	*/
	gui_htmlChanged : function(str) {
		this.html_container = str;
	},
	
	/**
	*	Called from imgmap with new status string.
	*/
	onStatusMessage : function(str) {
		Ext.getCmp('imagemapStatusPanel').setText(str);
	},

	onAddArea : function(id) {
		this.currentAreaId = id;
	},
	
	cleanUp : function(){
		if(Ext.getCmp(this.editWinId)){Ext.getCmp(this.editWinId).close();}
	},
	
	onSelectArea : function(obj) {
		this.currentAreaId = obj.aid;
	},
	
	onEditArea : function(obj) {
		if(Ext.getCmp(this.editWinId)){Ext.getCmp(this.editWinId).close();}
		this.editWin = new Ext.Window({
			title: 'Edit',
			id: this.editWinId,
			border: false,
			mask: true,
			width:300,
            height:200,
            items: [new Ext.form.FormPanel({
            	style:'margin:5px;background-color: #FFFFFF;',
            	border: false,
            	defaults: {width: 155},
            	defaultType: 'textfield',
            	autoHeight:true,
    			items: [
                	new Ext.form.ComboBox({
						fieldLabel: 'Shape',
						name: 'img_shape',
						store : new Ext.data.SimpleStore({
							fields: ['id', 'name'],	
							data: [['rect', 'Rectangle'],['circle', 'Circle'],['poly', 'Polygon'],['bezier1', 'Bezier']]
						}),
						triggerAction: 'all',
						mode: 'local',
						allowBlank: true,
						editable: false,
						displayField: 'name',
						valueField: 'id',
						value: this.imageMap.areas[obj.aid].shape,
						listeners : {
							select : function(combo, rec, index){
								this.inputChange(combo, obj.aid);
							}.bind(this)
						}
					}),
					{
                    	fieldLabel: 'Coordinates',
                    	name: 'img_coords',
                    	enableKeyEvents: true,
                    	value: this.imageMap.areas[obj.aid].lastInput,
						allowBlank: true,
						listeners : {
							keyup : function(field, event){
								this.inputChange(field, obj.aid);
							}.bind(this)
						}
                	},
    				{
                    	fieldLabel: 'Title',
                    	name: 'img_title',
                    	enableKeyEvents: true,
                    	value: this.imageMap.areas[obj.aid].atitle,
						allowBlank: true,
						listeners : {
							keyup : function(field, event){
								this.inputChange(field, obj.aid);
							}.bind(this)
						}
                	},
    				{
                    	fieldLabel: 'Link',
                    	name: 'img_href',
                    	enableKeyEvents: true,
                    	value: this.imageMap.areas[obj.aid].ahref,
						allowBlank: true,
						listeners : {
							keyup : function(field, event){
								this.inputChange(field, obj.aid);
							}.bind(this)
						}
                	},
    				{
                    	fieldLabel: 'Alt',
                    	name: 'img_alt',
                    	enableKeyEvents: true,
                    	value: this.imageMap.areas[obj.aid].aalt,
						allowBlank: true,
						listeners : {
							keyup : function(field, event){
								this.inputChange(field, obj.aid);
							}.bind(this)
						}
                	},
                	new Ext.form.ComboBox({
						fieldLabel: 'Target',
						name: 'img_target',
						store : new Ext.data.SimpleStore({
							fields: ['id', 'name'],	
							data: [['', 'Not Set'],['_self', 'This Window'],['_blank', 'New Window'],['_top', 'Top Window']]
						}),
						triggerAction: 'all',
						mode: 'local',
						allowBlank: true,
						editable: false,
						displayField: 'name',
						valueField: 'id',
						value: this.imageMap.areas[obj.aid].atarget,
						listeners : {
							select : function(combo, rec, index){
								this.inputChange(combo, obj.aid);
							}.bind(this)
						}
					})
                ]
    		})]
		});
		this.editWin.show();
	},
	
	setMode : function(mode) {
		if (mode == 'pointer') {
			this.imageMap.is_drawing = 0;
			this.imageMap.nextShape = '';
		}
		else {
			this.imageMap.nextShape = mode;
		}
	},
	
	
	/**
	*	Called from imgmap when an area was removed.
	*/

	onRemoveArea : function(id) {
		this.currentAreaId = null;
	},
	
	/**
	*	Called from imgmap when mode changed to a given value (preview or normal)
	*/
	gui_modeChanged : function(mode) {
		var nodes, i;
		if (mode == 1) {
			Ext.getCmp('dd_zoom').disabled = true;
		}
		else {
			Ext.getCmp('dd_zoom').disabled = false;
		}
	},
	
	gui_outputChanged : function(){
		var temp, i;
		var clipboard_enabled = (window.clipboardData || typeof air == 'object');
		temp = 'This is the generated image map HTML code. ';
		temp+= 'Click into the textarea below and press Ctrl+C to copy the code to your clipboard. ';
		if (clipboard_enabled) {
			temp+= 'Alternatively you can use the clipboard icon on the right. ';
			temp+= '<img src="example1_files/clipboard.gif" onclick="gui_toClipBoard()" style="float: right; margin: 4px; cursor: pointer;"/>';
		}
		temp+= 'Please note, that you have to attach this code to your image, via the usemap property ';
		temp+= '(<a href="http://www.htmlhelp.com/reference/html40/special/map.html">read more</a>). '; 
		document.getElementById('output_help').innerHTML = temp;
		//this will reload areas and sets dropdown restrictions
		this.imageMap.setMapHTML(this.imageMap.getMapHTML());
		outputmode = output;
		return true;
	},
	
	gui_zoom : function(scale) {
		var pic = document.getElementById('pic_container').getElementsByTagName('img')[0];
		if (typeof pic == 'undefined') {return false;}
		if (typeof pic.oldwidth == 'undefined' || !pic.oldwidth) {
			pic.oldwidth = pic.width;
		}
		if (typeof pic.oldheight == 'undefined' || !pic.oldheight) {
			pic.oldheight = pic.height;
		}
		pic.width  = pic.oldwidth * scale;
		pic.height = pic.oldheight * scale;
		this.imageMap.scaleAllAreas(scale);
	},
	
	//remove the map object and unset the usemap attribute
	removeMap : function() {
		if (this.imageObj !== null && this.imageObj.nodeName == "IMG") {
			this.imageObj.removeAttribute('usemap', 0);
		}
		if (typeof this.mapObj != 'undefined' && this.mapObj !== null) {
			this.mapObj.parentNode.removeChild(this.mapObj);
		}
	},
	
	getAreaHtml : function(area){
		if ( !area || area.shape == '')
			return '';

		var html = '<area shape="' + area.shape + '"' + ' coords="' + area.lastInput + '"' ;

		if (area.aalt && area.aalt!='') html+= ' alt="' + area.aalt + '"' ;
		if (area.atitle && area.atitle!='') html+= ' title="' + area.atitle + '"' ;
		if (area.ahref && area.ahref!='') html+= ' href="' +	area.ahref + '"' ;
		if (area.atarget && area.atarget!='') html+= ' target="' + area.atarget + '"' ;
						
		html+='/>';
		return html;
	},
	
	getMapInnerHTML : function(){
		var html = '' ;
		//foreach area properties
		for (var i=0; i< this.imageMap.areas.length; i++) {
			html+= this.getAreaHtml(this.imageMap.areas[i] ) ;
		}
		return(html);
	},
	
	saveMap : function() {
		if (this.imageObj !== null && this.imageObj.nodeName == "IMG") {
			var MapInnerHTML = this.getMapInnerHTML();

			// If there are no areas, then exit (and remove if neccesary the map).
			if (MapInnerHTML == ''){
				this.removeMap();
				return ;
			}

			if (typeof this.mapObj == 'undefined' || this.mapObj === null) {
				this.mapObj = this._getImageDomParentDoc().createElement('map');
				this.imageObj.parentNode.appendChild(this.mapObj);
			}
		
			this.mapObj.innerHTML = MapInnerHTML ;
	
			// IE bug: it's not possible to directly assing the name and make it work easily
			// We remove the previous name
			if (this.mapObj.name )
				this.mapObj.removeAttribute( 'name' ) ;
	
			this.mapObj.name = this.imageMap.getMapName();
			this.mapObj.id   = this.imageMap.getMapId();
			
			this.imageObj.setAttribute('usemap', "#" + this.imageMap.getMapName(), 0);
		}

		return true;
	},
	
	/* FINDS THE DOCUMENT FROM WHICH THE IMAGE CAME FROM (may have been an iframe) */
	_getImageDomParentDoc : function(){
		var parent = this.imageObj.parentNode;
		var nParent = parent;
		while(parent != null){
			nParent = parent;
			parent = parent.parentNode;
		}
		
		return(nParent);
	},
	
	loadImage : function(img_obj) {
		//reset zoom dropdown
		Ext.getCmp('dd_zoom').setValue('1');
		var pic = document.getElementById('pic_container').getElementsByTagName('img')[0];
		if (typeof pic != 'undefined') {
			//delete already existing pic
			pic.parentNode.removeChild(pic);
			delete this.imageMap.pic;
		}
		this.imageMap.loadImage(img_obj);
		this.imageObj = img_obj;
		
		//check if the image has a valid map already assigned
		var mapname = img_obj.getAttribute('usemap', 2) || img_obj.usemap ;
		if ( typeof mapname == 'string' && mapname !== '') {
			mapname = mapname.substr(1);
			var maps = this._getImageDomParentDoc().getElementsByTagName('MAP');
			for (var i=0; i < maps.length; i++) {
				if (maps[i].name == mapname) {
					this.mapObj = maps[i];
					this.imageMap.setMapHTML(this.mapObj);
					break;
				}
			}
		}
	}
    
    
});
 
Ext.reg('imagemappanel',Ext.ux.ImageMapPanel); 