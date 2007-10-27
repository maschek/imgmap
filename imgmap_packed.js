function imgmap(_1){
this.version="2.0beta3";
this.buildDate="27-10-2007";
this.buildNumber="18";
this.config=new Object();
this.is_drawing=0;
this.strings=new Array();
this.memory=new Array();
this.areas=new Array();
this.props=new Array();
this.logStore=new Array();
this.currentid=0;
this.draggedId=null;
this.nextShape="rectangle";
this.viewmode=0;
this.loadedScripts=new Array();
this.isLoaded=false;
this.cntReloads=0;
this.mapname="";
this.mapid="";
this.DM_RECTANGLE_DRAW=1;
this.DM_RECTANGLE_MOVE=11;
this.DM_RECTANGLE_RESIZE_TOP=12;
this.DM_RECTANGLE_RESIZE_RIGHT=13;
this.DM_RECTANGLE_RESIZE_BOTTOM=14;
this.DM_RECTANGLE_RESIZE_LEFT=15;
this.DM_SQUARE_DRAW=2;
this.DM_SQUARE_MOVE=21;
this.DM_SQUARE_RESIZE_TOP=22;
this.DM_SQUARE_RESIZE_RIGHT=23;
this.DM_SQUARE_RESIZE_BOTTOM=24;
this.DM_SQUARE_RESIZE_LEFT=25;
this.DM_POLYGON_DRAW=3;
this.DM_POLYGON_LASTDRAW=30;
this.DM_POLYGON_MOVE=31;
this.config.mode="editor";
this.config.imgroot="";
this.config.baseroot="";
this.config.lang="en";
this.config.loglevel=0;
this.config.buttons=["add","delete","preview","html"];
this.config.custom_callbacks=new Object();
this.config.CL_DRAW_BOX="#dd2400";
this.config.CL_DRAW_SHAPE="#d00";
this.config.CL_DRAW_BG="#fff";
this.config.CL_NORM_BOX="#dd2400";
this.config.CL_NORM_SHAPE="#d00";
this.config.CL_NORM_BG="#fff";
this.config.CL_HIGHLIGHT_BOX="#dd2400";
this.config.CL_HIGHLIGHT_SHAPE="#d00";
this.config.CL_HIGHLIGHT_BG="#fff";
this.config.CL_KNOB="#ffeeee";
this.config.CL_HIGHLIGHT_PROPS="#e7e7e7";
this.config.bounding_box=true;
this.config.label="%n";
this.config.label_class="imgmap_label";
this.config.label_style="font: bold 10px Arial";
this.config.hint="#%n %h";
this.config.draw_opacity="35";
this.config.norm_opacity="50";
this.config.highlight_opacity="65";
this.config.cursor_default="crosshair";
var ua=navigator.userAgent;
this.isMSIE=(navigator.appName=="Microsoft Internet Explorer");
this.isMSIE5=this.isMSIE&&(ua.indexOf("MSIE 5")!=-1);
this.isMSIE5_0=this.isMSIE&&(ua.indexOf("MSIE 5.0")!=-1);
this.isMSIE7=this.isMSIE&&(ua.indexOf("MSIE 7")!=-1);
this.isGecko=ua.indexOf("Gecko")!=-1;
this.isSafari=ua.indexOf("Safari")!=-1;
this.isOpera=(typeof window.opera!="undefined");
this.addEvent(document,"keydown",this.doc_keydown.bind(this));
this.addEvent(document,"keyup",this.doc_keyup.bind(this));
if(_1){
this.setup(_1);
}
}
imgmap.prototype.assignOID=function(_3){
try{
if(typeof _3=="undefined"){
this.log("Undefined object passed to assignOID.");
return null;
}else{
if(typeof _3=="object"){
return _3;
}else{
if(typeof _3=="string"){
return document.getElementById(_3);
}
}
}
}
catch(err){
this.log("Error in assignOID",1);
}
return null;
};
imgmap.prototype.setup=function(_4){
for(var i in _4){
this.config[i]=_4[i];
}
if(_4){
this.pic_container=this.assignOID(_4.pic_container);
if(this.pic_container){
this.preview=document.createElement("DIV");
this.pic_container.appendChild(this.preview);
}
this.form_container=this.assignOID(_4.form_container);
this.html_container=this.assignOID(_4.html_container);
if(this.html_container){
this.addEvent(this.html_container,"blur",this.html_container_blur.bind(this));
this.addEvent(this.html_container,"focus",this.html_container_focus.bind(this));
}
this.status_container=this.assignOID(_4.status_container);
this.button_container=this.assignOID(_4.button_container);
}
if(!this.config.baseroot){
var _6=document.getElementsByTagName("base");
var _7="";
for(var i=0;i<_6.length;i++){
if(_6[i].href!=""){
_7=_6[i].href;
if(_7.charAt(_7.length-1)!="/"){
_7+="/";
}
break;
}
}
var _8=document.getElementsByTagName("script");
for(var i=0;i<_8.length;i++){
if(_8[i].src&&_8[i].src.match(/imgmap\w*\.js(\?.*?)?$/)){
var _9=_8[i].src;
_9=_9.substring(0,_9.lastIndexOf("/")+1);
if(_7!=""&&_9.indexOf("://")==-1){
this.config.baseroot=_7+_9;
}else{
this.config.baseroot=_9;
}
break;
}
}
}
if(this.isMSIE&&typeof window.CanvasRenderingContext2D=="undefined"&&typeof G_vmlCanvasManager=="undefined"){
this.loadScript(this.config.baseroot+"excanvas.js");
}
if(this.config.lang==""){
this.config.lang="en";
}
this.loadScript(this.config.baseroot+"lang_"+this.config.lang+".js");
if(!this.config.imgroot){
this.config.imgroot=this.config.baseroot;
}
this.addEvent(window,"load",this.onLoad.bind(this));
return true;
};
imgmap.prototype.retryDelayed=function(fn,_b,_c){
if(typeof fn.tries=="undefined"){
fn.tries=0;
}
if(fn.tries++<_c){
window.setTimeout(function(){
fn.apply(this);
},_b);
}
};
imgmap.prototype.onLoad=function(e){
if(this.isLoaded){
return true;
}
if(typeof imgmapStrings=="undefined"){
if(this.cntReloads++<5){
var _e=this;
window.setTimeout(function(){
_e.onLoad(e);
},1200);
this.log("Delaying onload (language not loaded, try: "+this.cntReloads+")");
return false;
}
}
try{
this.loadStrings(imgmapStrings);
}
catch(err){
this.log("Unable to load language strings",1);
}
if(this.isMSIE){
if(typeof window.CanvasRenderingContext2D=="undefined"&&typeof G_vmlCanvasManager=="undefined"){
this.log(this.strings["ERR_EXCANVAS_LOAD"],2);
}
}
if(this.config.mode=="highlighter"){
imgmap_spawnObjects(this.config);
}else{
if(this.button_container){
for(var i=0;i<this.config.buttons.length;i++){
if(this.config.buttons[i]=="add"){
try{
var img=document.createElement("IMG");
img.src=this.config.imgroot+"add.gif";
this.addEvent(img,"click",this.addNewArea.bind(this));
img.alt=this.strings["HINT_ADD"];
img.title=this.strings["HINT_ADD"];
img.style.cursor="pointer";
img.style.margin="0 2px";
this.button_container.appendChild(img);
}
catch(err){
this.log("Unable to add button ("+this.config.buttons[i]+")",1);
}
}else{
if(this.config.buttons[i]=="delete"){
try{
var img=document.createElement("IMG");
img.src=this.config.imgroot+"delete.gif";
this.addEvent(img,"click",this.removeArea.bind(this));
img.alt=this.strings["HINT_DELETE"];
img.title=this.strings["HINT_DELETE"];
img.style.cursor="pointer";
img.style.margin="0 2px";
this.button_container.appendChild(img);
}
catch(err){
this.log("Unable to add button ("+this.config.buttons[i]+")",1);
}
}else{
if(this.config.buttons[i]=="preview"){
try{
var img=document.createElement("IMG");
img.src=this.config.imgroot+"zoom.gif";
this.addEvent(img,"click",this.togglePreview.bind(this));
img.alt=this.strings["HINT_PREVIEW"];
img.title=this.strings["HINT_PREVIEW"];
img.style.cursor="pointer";
img.style.margin="0 2px";
this.i_preview=img;
this.button_container.appendChild(img);
}
catch(err){
this.log("Unable to add button ("+this.config.buttons[i]+")",1);
}
}else{
if(this.config.buttons[i]=="html"){
try{
var img=document.createElement("IMG");
img.src=this.config.imgroot+"html.gif";
this.addEvent(img,"click",this.clickHtml.bind(this));
img.alt=this.strings["HINT_HTML"];
img.title=this.strings["HINT_HTML"];
img.style.cursor="pointer";
img.style.margin="0 2px";
this.button_container.appendChild(img);
}
catch(err){
this.log("Unable to add button ("+this.config.buttons[i]+")",1);
}
}else{
if(this.config.buttons[i]=="clipboard"){
try{
var img=document.createElement("IMG");
img.src=this.config.imgroot+"clipboard.gif";
this.addEvent(img,"click",this.toClipBoard.bind(this));
img.alt=this.strings["HINT_CLIPBOARD"];
img.title=this.strings["HINT_CLIPBOARD"];
img.style.cursor="pointer";
img.style.margin="0 2px";
this.button_container.appendChild(img);
}
catch(err){
this.log("Unable to add button ("+this.config.buttons[i]+")",1);
}
}
}
}
}
}
}
}
}
this.isLoaded=true;
return true;
};
imgmap.prototype.addEvent=function(obj,evt,_13){
if(obj.attachEvent){
return obj.attachEvent("on"+evt,_13);
}else{
if(obj.addEventListener){
obj.addEventListener(evt,_13,false);
return true;
}else{
obj["on"+evt]=_13;
}
}
};
imgmap.prototype.addLoadEvent=function(obj,_15){
if(obj.attachEvent){
return obj.attachEvent("onreadystatechange",_15);
}else{
if(obj.addEventListener){
obj.addEventListener("load",_15,false);
return true;
}else{
obj["onload"]=_15;
}
}
};
imgmap.prototype.loadScript=function(url){
if(url==""){
return false;
}
if(this.loadedScripts[url]==1){
return true;
}
this.log("Loading script: "+url);
var _17=document.getElementsByTagName("head")[0];
var _18=document.createElement("SCRIPT");
_18.setAttribute("language","javascript");
_18.setAttribute("type","text/javascript");
_18.setAttribute("src",url);
_17.appendChild(_18);
this.addLoadEvent(_18,this.script_load.bind(this));
return true;
};
imgmap.prototype.script_load=function(e){
var obj=(document.all)?window.event.srcElement:e.currentTarget;
var url=obj.src;
var _1c=false;
if(typeof obj.readyState!="undefined"){
if(obj.readyState=="complete"){
_1c=true;
}
}else{
_1c=true;
}
if(_1c){
this.loadedScripts[url]=1;
this.log("Loaded script: "+url);
return true;
}
};
imgmap.prototype.loadStrings=function(obj){
for(var key in obj){
this.strings[key]=obj[key];
}
};
imgmap.prototype.loadImage=function(img,_20,_21){
if(!this._getLastArea()){
}
if(typeof img=="string"){
if(typeof this.pic=="undefined"){
this.pic=document.createElement("IMG");
this.pic_container.appendChild(this.pic);
this.addEvent(this.pic,"mousedown",this.img_mousedown.bind(this));
this.addEvent(this.pic,"mouseup",this.img_mouseup.bind(this));
this.addEvent(this.pic,"mousemove",this.img_mousemove.bind(this));
this.pic.style.cursor=this.config.cursor_default;
}
this.log("Loading image: "+img,0);
this.pic.src=img+"? "+(new Date().getTime());
this.fireEvent("onLoadImage");
}else{
if(typeof img=="object"){
var src=img.src;
if(src==""&&img.getAttribute("mce_src")!=""){
src=img.getAttribute("mce_src");
}else{
if(src==""&&img.getAttribute("_fcksavedurl")!=""){
src=img.getAttribute("_fcksavedurl");
}
}
this.loadImage(src,_20,_21);
}
}
};
imgmap.prototype.useImage=function(img){
img=this.assignOID(img);
if(typeof img=="object"){
this.pic=img;
this.addEvent(this.pic,"mousedown",this.img_mousedown.bind(this));
this.addEvent(this.pic,"mouseup",this.img_mouseup.bind(this));
this.addEvent(this.pic,"mousemove",this.img_mousemove.bind(this));
this.pic.style.cursor=this.config.cursor_default;
this.pic_container=this.pic.parentNode;
this.fireEvent("onLoadImage");
}
};
imgmap.prototype.statusMessage=function(str){
if(this.status_container){
this.status_container.innerHTML=str;
}
window.defaultStatus=str;
};
imgmap.prototype.log=function(obj,_26){
if(_26==""||typeof _26=="undefined"){
_26=0;
}
if(this.config.loglevel!=-1&&_26>=this.config.loglevel){
this.logStore.push({level:_26,obj:obj});
}
if(typeof console=="object"){
console.log(obj);
}else{
if(this.isOpera){
opera.postError(_26+": "+obj);
}else{
if(_26>1){
var msg="";
for(var i=0;i<this.logStore.length;i++){
msg+=this.logStore[i].level+": "+this.logStore[i].obj+"\n";
}
alert(msg);
}else{
window.defaultStatus=(_26+": "+obj);
}
}
}
};
imgmap.prototype.getMapHTML=function(){
this.fireEvent("onGetMap");
var _29="<map id=\""+this.getMapId()+"\" name=\""+this.getMapName()+"\">"+this.getMapInnerHTML()+"</map>";
return (_29);
};
imgmap.prototype.getMapInnerHTML=function(){
var _2a="";
for(var i=0;i<this.props.length;i++){
if(this.props[i]){
if(this.props[i].getElementsByTagName("input")[2].value!=""){
_2a+="<area shape=\""+this.props[i].getElementsByTagName("select")[0].value+"\" alt=\""+this.props[i].getElementsByTagName("input")[4].value+"\" coords=\""+this.props[i].getElementsByTagName("input")[2].value+"\" href=\""+this.props[i].getElementsByTagName("input")[3].value+"\" target=\""+this.props[i].getElementsByTagName("select")[1].value+"\" />";
}
}
}
return (_2a);
};
imgmap.prototype.getMapName=function(){
if(this.mapname==""){
if(this.mapid!=""){
return this.mapid;
}
var now=new Date();
this.mapname="imgmap"+now.getFullYear()+(now.getMonth()+1)+now.getDate()+now.getHours()+now.getMinutes()+now.getSeconds();
}
return this.mapname;
};
imgmap.prototype.getMapId=function(){
if(this.mapid==""){
this.mapid=this.getMapName();
}
return this.mapid;
};
imgmap.prototype._normCoords=function(_2d){
_2d=_2d.replace(/(\d)(\D)+(\d)/g,"$1,$3");
_2d=_2d.replace(/,(\D|0)+(\d)/g,",$2");
_2d=_2d.replace(/(\d)(\D)+,/g,"$1,");
_2d=_2d.replace(/^(\D|0)+(\d)/g,"$2");
return _2d;
};
imgmap.prototype.setMapHTML=function(map){
this.fireEvent("onSetMap");
this.removeAllAreas();
var _2f;
if(typeof map=="string"){
var _30=document.createElement("DIV");
_30.innerHTML=map;
_2f=_30.firstChild;
}else{
if(typeof map=="object"){
_2f=map;
}
}
if(!_2f||_2f.nodeName.toLowerCase()!=="map"){
return false;
}
this.mapname=_2f.name;
this.mapid=_2f.id;
var _31=_2f.getElementsByTagName("area");
for(var i=0;i<_31.length;i++){
id=this.addNewArea();
if(_31[i].getAttribute("shape",2)){
shape=_31[i].getAttribute("shape",2).toLowerCase();
if(shape=="rect"){
shape="rectangle";
}else{
if(shape=="circ"){
shape="circle";
}else{
if(shape=="poly"){
shape="polygon";
}
}
}
}else{
shape="rectangle";
}
this.props[id].getElementsByTagName("select")[0].value=shape;
if(_31[i].getAttribute("coords",2)){
var _33=this._normCoords(_31[i].getAttribute("coords",2));
this.props[id].getElementsByTagName("input")[2].value=_33;
}
if(_31[i].getAttribute("href")){
this.props[id].getElementsByTagName("input")[3].value=_31[i].getAttribute("href");
}
if(_31[i].getAttribute("alt")){
this.props[id].getElementsByTagName("input")[4].value=_31[i].getAttribute("alt");
}
if(_31[i].getAttribute("target")){
target=_31[i].getAttribute("target").toLowerCase();
if(target==""){
target="_self";
}
}else{
target="_self";
}
this.props[id].getElementsByTagName("select")[1].value=target;
this.initArea(id,shape);
this._recalculate(id);
this.relaxArea(id);
if(this.html_container){
this.html_container.value=this.getMapHTML();
}
}
};
imgmap.prototype.clickHtml=function(){
this.fireEvent("onHtml");
return true;
};
imgmap.prototype.togglePreview=function(){
if(!this.pic){
return false;
}
if(this.viewmode==0){
this.fireEvent("onPreview");
for(var i=0;i<this.areas.length;i++){
if(this.areas[i]){
this.areas[i].style.display="none";
if(this.areas[i].label){
this.areas[i].label.style.display="none";
}
}
}
var _35=this.form_container.getElementsByTagName("input");
for(var i=0;i<_35.length;i++){
_35[i].disabled=true;
}
var _35=this.form_container.getElementsByTagName("select");
for(var i=0;i<_35.length;i++){
_35[i].disabled=true;
}
this.preview.innerHTML=this.getMapHTML();
this.pic.setAttribute("usemap","#"+this.mapname,0);
this.pic.onmousedown=null;
this.pic.onmouseup=null;
this.pic.onmousemove=null;
this.pic.style.cursor="auto";
this.viewmode=1;
this.i_preview.src=this.config.imgroot+"edit.gif";
this.statusMessage(this.strings["PREVIEW_MODE"]);
}else{
for(var i=0;i<this.areas.length;i++){
if(this.areas[i]){
this.areas[i].style.display="";
if(this.areas[i].label&&this.config.label){
this.areas[i].label.style.display="";
}
}
}
var _35=this.form_container.getElementsByTagName("input");
for(var i=0;i<_35.length;i++){
_35[i].disabled=false;
}
var _35=this.form_container.getElementsByTagName("select");
for(var i=0;i<_35.length;i++){
_35[i].disabled=false;
}
this.preview.innerHTML="";
this.addEvent(this.pic,"mousedown",this.img_mousedown.bind(this));
this.addEvent(this.pic,"mouseup",this.img_mouseup.bind(this));
this.addEvent(this.pic,"mousemove",this.img_mousemove.bind(this));
this.pic.style.cursor=this.config.cursor_default;
this.viewmode=0;
this.i_preview.src=this.config.imgroot+"zoom.gif";
this.statusMessage(this.strings["DESIGN_MODE"]);
}
};
imgmap.prototype.addNewArea=function(){
if(this.viewmode==1){
return;
}
this.fireEvent("onAddArea");
var _36=this._getLastArea();
var id=this.areas.length;
this.areas[id]=document.createElement("DIV");
this.areas[id].id=this.mapname+"area"+id;
this.areas[id].aid=id;
this.areas[id].shape=this.nextShape;
this.props[id]=document.createElement("DIV");
if(this.form_container){
this.form_container.appendChild(this.props[id]);
}
this.props[id].id="img_area_"+id;
this.props[id].aid=id;
this.props[id].className="img_area";
this.addEvent(this.props[id],"mouseover",this.img_area_mouseover.bind(this));
this.addEvent(this.props[id],"mouseout",this.img_area_mouseout.bind(this));
this.addEvent(this.props[id],"click",this.img_area_click.bind(this));
this.props[id].innerHTML="\t\t\t<input type=\"text\"  name=\"img_id\" class=\"img_id\" value=\""+id+"\" readonly=\"1\"/>\t\t\t<input type=\"radio\" name=\"img_active\" class=\"img_active\" id=\"img_active_"+id+"\" value=\""+id+"\">\t\t\tShape:\t<select name=\"img_shape\" class=\"img_shape\">\t\t\t\t<option value=\"rectangle\" >rectangle</option>\t\t\t\t<option value=\"circle\"    >circle</option>\t\t\t\t<option value=\"polygon\"   >polygon</option>\t\t\t\t</select>\t\t\tCoords: <input type=\"text\" name=\"img_coords\" class=\"img_coords\" value=\"\">\t\t\tHref: <input type=\"text\" name=\"img_href\" class=\"img_href\" value=\"\">\t\t\tAlt: <input type=\"text\" name=\"img_alt\" class=\"img_alt\" value=\"\">\t\t\tTarget:\t<select name=\"img_target\" class=\"img_target\">\t\t\t\t<option value=\"_self\"  >this window</option>\t\t\t\t<option value=\"_blank\" >new window</option>\t\t\t\t<option value=\"_top\"   >top window</option>\t\t\t\t</select>";
this.addEvent(this.props[id].getElementsByTagName("input")[1],"keydown",this.img_area_keydown.bind(this));
this.addEvent(this.props[id].getElementsByTagName("input")[2],"keydown",this.img_coords_keydown.bind(this));
this.addEvent(this.props[id].getElementsByTagName("input")[2],"blur",this.img_area_blur.bind(this));
this.addEvent(this.props[id].getElementsByTagName("input")[3],"blur",this.img_area_blur.bind(this));
this.addEvent(this.props[id].getElementsByTagName("input")[4],"blur",this.img_area_blur.bind(this));
this.addEvent(this.props[id].getElementsByTagName("select")[1],"blur",this.img_area_blur.bind(this));
if(_36){
this.props[id].getElementsByTagName("select")[0].value=_36.shape;
}
if(this.nextShape){
this.props[id].getElementsByTagName("select")[0].value=this.nextShape;
}
this.form_selectRow(id,true);
this.currentid=id;
return (id);
};
imgmap.prototype.initArea=function(id,_39){
if(this.areas[id].parentNode){
this.areas[id].parentNode.removeChild(this.areas[id]);
}
if(this.areas[id].label){
this.areas[id].label.parentNode.removeChild(this.areas[id].label);
}
this.areas[id]=null;
this.areas[id]=document.createElement("CANVAS");
this.pic.parentNode.appendChild(this.areas[id]);
this.pic.parentNode.style.position="relative";
if(typeof G_vmlCanvasManager!="undefined"){
this.areas[id]=G_vmlCanvasManager.initElement(this.areas[id]);
}
this.areas[id].id=this.mapname+"area"+id;
this.areas[id].aid=id;
this.areas[id].shape=_39;
this.areas[id].style.position="absolute";
this.areas[id].style.top=this.pic.offsetTop+"px";
this.areas[id].style.left=this.pic.offsetLeft+"px";
this._setopacity(this.areas[id],this.config.CL_DRAW_BG,this.config.draw_opacity);
this.areas[id].onmousedown=this.area_mousedown.bind(this);
this.areas[id].onmouseup=this.area_mouseup.bind(this);
this.areas[id].onmousemove=this.area_mousemove.bind(this);
this.memory[id]=new Object();
this.memory[id].downx=0;
this.memory[id].downy=0;
this.memory[id].left=0;
this.memory[id].top=0;
this.memory[id].width=0;
this.memory[id].height=0;
this.memory[id].xpoints=new Array();
this.memory[id].ypoints=new Array();
this.areas[id].label=document.createElement("DIV");
this.pic.parentNode.appendChild(this.areas[id].label);
this.areas[id].label.className=this.config.label_class;
this.assignCSS(this.areas[id].label,this.config.label_style);
this.areas[id].label.style.position="absolute";
};
imgmap.prototype.relaxArea=function(id){
this.fireEvent("onRelaxArea");
if(this.areas[id].shape=="rectangle"){
this.areas[id].style.borderWidth="1px";
this.areas[id].style.borderStyle="solid";
this.areas[id].style.borderColor=this.config.CL_NORM_SHAPE;
}else{
if(this.areas[id].shape=="circle"||this.areas[id].shape=="polygon"){
if(this.config.bounding_box==true){
this.areas[id].style.borderWidth="1px";
this.areas[id].style.borderStyle="solid";
this.areas[id].style.borderColor=this.config.CL_NORM_BOX;
}else{
this.areas[id].style.border="";
}
}
}
this._setopacity(this.areas[id],this.config.CL_NORM_BG,this.config.norm_opacity);
};
imgmap.prototype.relaxAllAreas=function(){
for(var i=0;i<this.areas.length;i++){
if(this.areas[i]){
this.relaxArea(i);
}
}
};
imgmap.prototype._setopacity=function(_3c,_3d,pct){
_3c.style.backgroundColor=_3d;
_3c.style.opacity="."+pct;
_3c.style.filter="alpha(opacity="+pct+")";
};
imgmap.prototype.removeArea=function(){
if(this.viewmode==1){
return;
}
this.fireEvent("onRemoveArea");
var id=this.currentid;
if(this.props[id]){
var _40=this.props[id].parentNode;
_40.removeChild(this.props[id]);
var _41=_40.lastChild.aid;
this.props[id]=null;
try{
this.form_selectRow(_41,true);
this.currentid=_41;
}
catch(err){
}
try{
this.areas[id].parentNode.removeChild(this.areas[id]);
this.areas[id].label.parentNode.removeChild(this.areas[id].label);
}
catch(err){
}
this.areas[id]=null;
if(this.html_container){
this.html_container.value=this.getMapHTML();
}
}
};
imgmap.prototype.removeAllAreas=function(){
for(var i=0;i<this.props.length;i++){
if(this.props[i]){
if(this.props[i].parentNode){
this.props[i].parentNode.removeChild(this.props[i]);
}
if(this.areas[i].parentNode){
this.areas[i].parentNode.removeChild(this.areas[i]);
}
if(this.areas[i].label){
this.areas[i].label.parentNode.removeChild(this.areas[i].label);
}
this.props[i]=null;
this.areas[i]=null;
if(this.props.length>0&&this.props[i]){
this.form_selectRow((this.props.length-1),true);
}
}
}
};
imgmap.prototype._putlabel=function(id){
if(this.viewmode==1){
return;
}
try{
if(this.config.label==""||this.config.label==false){
this.areas[id].label.innerHTML="";
this.areas[id].label.style.display="none";
}else{
this.areas[id].label.style.display="";
var _44=this.config.label;
_44=_44.replace(/%n/g,String(id));
_44=_44.replace(/%c/g,String(this.props[id].getElementsByTagName("input")[2].value));
_44=_44.replace(/%h/g,String(this.props[id].getElementsByTagName("input")[3].value));
_44=_44.replace(/%a/g,String(this.props[id].getElementsByTagName("input")[4].value));
this.areas[id].label.innerHTML=_44;
}
this.areas[id].label.style.top=this.areas[id].style.top;
this.areas[id].label.style.left=this.areas[id].style.left;
}
catch(err){
this.log("Error putting label",1);
}
};
imgmap.prototype._puthint=function(id){
try{
if(this.config.hint==""||this.config.hint==false){
this.areas[id].title="";
this.areas[id].alt="";
}else{
var _46=this.config.hint;
_46=_46.replace(/%n/g,String(id));
_46=_46.replace(/%c/g,String(this.props[id].getElementsByTagName("input")[2].value));
_46=_46.replace(/%h/g,String(this.props[id].getElementsByTagName("input")[3].value));
_46=_46.replace(/%a/g,String(this.props[id].getElementsByTagName("input")[4].value));
this.areas[id].title=_46;
this.areas[id].alt=_46;
}
}
catch(err){
this.log("Error putting hint",1);
}
};
imgmap.prototype._repaintAll=function(){
for(var i=0;i<this.areas.length;i++){
if(this.areas[i]){
this._repaint(this.areas[i],this.config.CL_NORM_SHAPE);
}
}
};
imgmap.prototype._repaint=function(_48,_49,x,y){
if(_48.shape=="circle"){
var _4c=parseInt(_48.style.width);
var _4d=Math.floor(_4c/2)-1;
var ctx=_48.getContext("2d");
ctx.clearRect(0,0,_4c,_4c);
ctx.beginPath();
ctx.strokeStyle=_49;
ctx.arc(_4d,_4d,_4d,0,Math.PI*2,0);
ctx.stroke();
ctx.closePath();
ctx.strokeStyle=this.config.CL_KNOB;
ctx.strokeRect(_4d,_4d,1,1);
this._putlabel(_48.aid);
this._puthint(_48.aid);
}else{
if(_48.shape=="rectangle"){
this._putlabel(_48.aid);
this._puthint(_48.aid);
}else{
if(_48.shape=="polygon"){
var _4c=parseInt(_48.style.width);
var _4f=parseInt(_48.style.height);
var _50=parseInt(_48.style.left);
var top=parseInt(_48.style.top);
var ctx=_48.getContext("2d");
ctx.clearRect(0,0,_4c,_4f);
ctx.beginPath();
ctx.strokeStyle=_49;
ctx.moveTo(_48.xpoints[0]-_50,_48.ypoints[0]-top);
for(var i=1;i<_48.xpoints.length;i++){
ctx.lineTo(_48.xpoints[i]-_50,_48.ypoints[i]-top);
}
if(this.is_drawing==this.DM_POLYGON_DRAW||this.is_drawing==this.DM_POLYGON_LASTDRAW){
ctx.lineTo(x-_50-5,y-top-5);
}
ctx.lineTo(_48.xpoints[0]-_50,_48.ypoints[0]-top);
ctx.stroke();
ctx.closePath();
this._putlabel(_48.aid);
this._puthint(_48.aid);
}
}
}
};
imgmap.prototype._updatecoords=function(){
var _53=this.props[this.currentid].getElementsByTagName("input")[2];
var _54=parseInt(this.areas[this.currentid].style.left);
var top=parseInt(this.areas[this.currentid].style.top);
var _56=parseInt(this.areas[this.currentid].style.height);
var _57=parseInt(this.areas[this.currentid].style.width);
if(this.areas[this.currentid].shape=="rectangle"){
_53.value=_54+","+top+","+(_54+_57)+","+(top+_56);
this.areas[this.currentid].lastInput=_53.value;
}else{
if(this.areas[this.currentid].shape=="circle"){
var _58=Math.floor(_57/2)-1;
_53.value=(_54+_58)+","+(top+_58)+","+_58;
this.areas[this.currentid].lastInput=_53.value;
}else{
if(this.areas[this.currentid].shape=="polygon"){
_53.value="";
for(var i=0;i<this.areas[this.currentid].xpoints.length;i++){
_53.value+=this.areas[this.currentid].xpoints[i]+","+this.areas[this.currentid].ypoints[i]+",";
}
_53.value=_53.value.substring(0,_53.value.length-1);
this.areas[this.currentid].lastInput=_53.value;
}
}
}
if(this.html_container){
this.html_container.value=this.getMapHTML();
}
};
imgmap.prototype._recalculate=function(id){
var _5b=this.props[id].getElementsByTagName("input")[2];
_5b.value=this._normCoords(_5b.value);
var _5c=_5b.value;
var _5d=_5c.split(",");
try{
if(this.areas[id].shape=="rectangle"){
if(_5d.length!=4){
throw "invalid coords";
}
if(parseInt(_5d[0])>parseInt(_5d[2])){
throw "invalid coords";
}
if(parseInt(_5d[1])>parseInt(_5d[3])){
throw "invalid coords";
}
this.areas[id].style.left=this.pic.offsetLeft+parseInt(_5d[0])+"px";
this.areas[id].style.top=this.pic.offsetTop+parseInt(_5d[1])+"px";
this.areas[id].style.width=(_5d[2]-_5d[0])+"px";
this.areas[id].style.height=(_5d[3]-_5d[1])+"px";
this.areas[id].setAttribute("width",(_5d[2]-_5d[0]));
this.areas[id].setAttribute("height",(_5d[3]-_5d[1]));
this._repaint(this.areas[id],this.config.CL_NORM_SHAPE);
}else{
if(this.areas[id].shape=="circle"){
if(_5d.length!=3){
throw "invalid coords";
}
if(parseInt(_5d[2])<0){
throw "invalid coords";
}
var _5e=2*(1*_5d[2]+1);
this.areas[id].style.width=_5e+"px";
this.areas[id].style.height=_5e+"px";
this.areas[id].setAttribute("width",_5e);
this.areas[id].setAttribute("height",_5e);
this.areas[id].style.left=this.pic.offsetLeft+parseInt(_5d[0])-_5e/2+"px";
this.areas[id].style.top=this.pic.offsetTop+parseInt(_5d[1])-_5e/2+"px";
this._repaint(this.areas[id],this.config.CL_NORM_SHAPE);
}else{
if(this.areas[id].shape=="polygon"){
if(_5d.length<2){
throw "invalid coords";
}
this.areas[id].xpoints=new Array();
this.areas[id].ypoints=new Array();
for(var i=0;i<_5d.length;i+=2){
this.areas[id].xpoints[this.areas[id].xpoints.length]=this.pic.offsetLeft+parseInt(_5d[i]);
this.areas[id].ypoints[this.areas[id].ypoints.length]=this.pic.offsetTop+parseInt(_5d[i+1]);
this._polygongrow(this.areas[id],_5d[i],_5d[i+1]);
}
this._polygonshrink(this.areas[id]);
}
}
}
}
catch(err){
this.log(err.message,1);
this.statusMessage(this.strings["ERR_INVALID_COORDS"]);
if(this.areas[id].lastInput){
_5b.value=this.areas[id].lastInput;
}
this._repaint(this.areas[id],this.config.CL_NORM_SHAPE);
return;
}
this.areas[id].lastInput=_5b.value;
};
imgmap.prototype._polygongrow=function(_60,_61,_62){
var _63=_61-parseInt(_60.style.left);
var _64=_62-parseInt(_60.style.top);
var pad=2;
var _66=pad*2;
if(_61<parseInt(_60.style.left)){
_60.style.left=_61-pad+"px";
_60.style.width=parseInt(_60.style.width)+Math.abs(_63)+_66+"px";
_60.setAttribute("width",parseInt(_60.style.width));
}
if(_62<parseInt(_60.style.top)){
_60.style.top=_62-pad+"px";
_60.style.height=parseInt(_60.style.height)+Math.abs(_64)+_66+"px";
_60.setAttribute("height",parseInt(_60.style.height));
}
if(_61>parseInt(_60.style.left)+parseInt(_60.style.width)){
_60.style.width=_61-parseInt(_60.style.left)+_66+"px";
_60.setAttribute("width",parseInt(_60.style.width));
}
if(_62>parseInt(_60.style.top)+parseInt(_60.style.height)){
_60.style.height=_62-parseInt(_60.style.top)+_66+"px";
_60.setAttribute("height",parseInt(_60.style.height));
}
};
imgmap.prototype._polygonshrink=function(_67){
_67.style.left=(_67.xpoints[0]+1)+"px";
_67.style.top=(_67.ypoints[0]+1)+"px";
_67.style.height="0px";
_67.style.width="0px";
_67.setAttribute("height","0");
_67.setAttribute("width","0");
for(var i=0;i<_67.xpoints.length;i++){
this._polygongrow(_67,_67.xpoints[i],_67.ypoints[i]);
}
this._repaint(_67,this.config.CL_NORM_SHAPE);
};
imgmap.prototype.img_mousemove=function(e){
if(this.viewmode==1){
return;
}
var pos=this._getPos(this.pic);
var x=(window.event)?(window.event.x-this.pic.offsetLeft):(e.pageX-pos.x);
var y=(window.event)?(window.event.y-this.pic.offsetTop):(e.pageY-pos.y);
x=x+this.pic_container.scrollLeft;
y=y+this.pic_container.scrollTop;
if(x<0||y<0||x>this.pic.width||y>this.pic.height){
return;
}
if(this.memory[this.currentid]){
var top=this.memory[this.currentid].top;
var _6e=this.memory[this.currentid].left;
var _6f=this.memory[this.currentid].height;
var _70=this.memory[this.currentid].width;
}
if(this.is_drawing==this.DM_RECTANGLE_DRAW){
this.fireEvent("onDrawArea");
var _71=x-this.memory[this.currentid].downx;
var _72=y-this.memory[this.currentid].downy;
this.areas[this.currentid].style.width=Math.abs(_71)+"px";
this.areas[this.currentid].style.height=Math.abs(_72)+"px";
this.areas[this.currentid].setAttribute("width",Math.abs(_71));
this.areas[this.currentid].setAttribute("height",Math.abs(_72));
if(_71<0){
this.areas[this.currentid].style.left=(x+1)+"px";
}
if(_72<0){
this.areas[this.currentid].style.top=(y+1)+"px";
}
}else{
if(this.is_drawing==this.DM_SQUARE_DRAW){
this.fireEvent("onDrawArea");
var _71=x-this.memory[this.currentid].downx;
var _72=y-this.memory[this.currentid].downy;
var _73;
if(Math.abs(_71)<Math.abs(_72)){
_73=Math.abs(_71);
}else{
_73=Math.abs(_72);
}
this.areas[this.currentid].style.width=_73+"px";
this.areas[this.currentid].style.height=_73+"px";
this.areas[this.currentid].setAttribute("width",_73);
this.areas[this.currentid].setAttribute("height",_73);
if(_71<0){
this.areas[this.currentid].style.left=(this.memory[this.currentid].downx+_73*-1)+"px";
}
if(_72<0){
this.areas[this.currentid].style.top=(this.memory[this.currentid].downy+_73*-1+1)+"px";
}
}else{
if(this.is_drawing==this.DM_POLYGON_DRAW){
this.fireEvent("onDrawArea");
this._polygongrow(this.areas[this.currentid],x,y);
}else{
if(this.is_drawing==this.DM_RECTANGLE_MOVE||this.is_drawing==this.DM_SQUARE_MOVE){
this.fireEvent("onMoveArea");
var x=x-this.memory[this.currentid].rdownx;
var y=y-this.memory[this.currentid].rdowny;
if(x+_70>this.pic.width||y+_6f>this.pic.height){
return;
}
if(x<0||y<0){
return;
}
this.areas[this.currentid].style.left=x+1+"px";
this.areas[this.currentid].style.top=y+1+"px";
}else{
if(this.is_drawing==this.DM_POLYGON_MOVE){
this.fireEvent("onMoveArea");
var x=x-this.memory[this.currentid].rdownx;
var y=y-this.memory[this.currentid].rdowny;
if(x+_70>this.pic.width||y+_6f>this.pic.height){
return;
}
if(x<0||y<0){
return;
}
var _71=x-_6e;
var _72=y-top;
for(var i=0;i<this.areas[this.currentid].xpoints.length;i++){
this.areas[this.currentid].xpoints[i]=this.memory[this.currentid].xpoints[i]+_71;
this.areas[this.currentid].ypoints[i]=this.memory[this.currentid].ypoints[i]+_72;
}
this.areas[this.currentid].style.left=x+1+"px";
this.areas[this.currentid].style.top=y+1+"px";
}else{
if(this.is_drawing==this.DM_SQUARE_RESIZE_LEFT){
this.fireEvent("onResizeArea");
var _73=x-_6e;
if((_70+(-1*_73))>0){
this.areas[this.currentid].style.left=x+1+"px";
this.areas[this.currentid].style.top=(top+(_73/2))+"px";
this.areas[this.currentid].style.width=(_70+(-1*_73))+"px";
this.areas[this.currentid].style.height=(_6f+(-1*_73))+"px";
this.areas[this.currentid].setAttribute("width",parseInt(this.areas[this.currentid].style.width));
this.areas[this.currentid].setAttribute("height",parseInt(this.areas[this.currentid].style.height));
}else{
this.memory[this.currentid].width=0;
this.memory[this.currentid].height=0;
this.memory[this.currentid].left=x;
this.memory[this.currentid].top=y;
this.is_drawing=this.DM_SQUARE_RESIZE_RIGHT;
}
}else{
if(this.is_drawing==this.DM_SQUARE_RESIZE_RIGHT){
this.fireEvent("onResizeArea");
var _73=x-_6e-_70;
if((_70+(_73))-1>0){
this.areas[this.currentid].style.top=(top+(-1*_73/2))+"px";
this.areas[this.currentid].style.width=(_70+(_73))-1+"px";
this.areas[this.currentid].style.height=(_6f+(_73))+"px";
this.areas[this.currentid].setAttribute("width",parseInt(this.areas[this.currentid].style.width));
this.areas[this.currentid].setAttribute("height",parseInt(this.areas[this.currentid].style.height));
}else{
this.memory[this.currentid].width=0;
this.memory[this.currentid].height=0;
this.memory[this.currentid].left=x;
this.memory[this.currentid].top=y;
this.is_drawing=this.DM_SQUARE_RESIZE_LEFT;
}
}else{
if(this.is_drawing==this.DM_SQUARE_RESIZE_TOP){
this.fireEvent("onResizeArea");
var _73=y-top;
if((_70+(-1*_73))>0){
this.areas[this.currentid].style.top=y+1+"px";
this.areas[this.currentid].style.left=(_6e+(_73/2))+"px";
this.areas[this.currentid].style.width=(_70+(-1*_73))+"px";
this.areas[this.currentid].style.height=(_6f+(-1*_73))+"px";
this.areas[this.currentid].setAttribute("width",parseInt(this.areas[this.currentid].style.width));
this.areas[this.currentid].setAttribute("height",parseInt(this.areas[this.currentid].style.height));
}else{
this.memory[this.currentid].width=0;
this.memory[this.currentid].height=0;
this.memory[this.currentid].left=x;
this.memory[this.currentid].top=y;
this.is_drawing=this.DM_SQUARE_RESIZE_BOTTOM;
}
}else{
if(this.is_drawing==this.DM_SQUARE_RESIZE_BOTTOM){
this.fireEvent("onResizeArea");
var _73=y-top-_6f;
if((_70+(_73))-1>0){
this.areas[this.currentid].style.left=(_6e+(-1*_73/2))+"px";
this.areas[this.currentid].style.width=(_70+(_73))-1+"px";
this.areas[this.currentid].style.height=(_6f+(_73))-1+"px";
this.areas[this.currentid].setAttribute("width",parseInt(this.areas[this.currentid].style.width));
this.areas[this.currentid].setAttribute("height",parseInt(this.areas[this.currentid].style.height));
}else{
this.memory[this.currentid].width=0;
this.memory[this.currentid].height=0;
this.memory[this.currentid].left=x;
this.memory[this.currentid].top=y;
this.is_drawing=this.DM_SQUARE_RESIZE_TOP;
}
}else{
if(this.is_drawing==this.DM_RECTANGLE_RESIZE_LEFT){
this.fireEvent("onResizeArea");
var _71=x-_6e;
if(_70+(-1*_71)>0){
this.areas[this.currentid].style.left=x+1+"px";
this.areas[this.currentid].style.width=_70+(-1*_71)+"px";
this.areas[this.currentid].setAttribute("width",parseInt(this.areas[this.currentid].style.width));
}else{
this.memory[this.currentid].width=0;
this.memory[this.currentid].left=x;
this.is_drawing=this.DM_RECTANGLE_RESIZE_RIGHT;
}
}else{
if(this.is_drawing==this.DM_RECTANGLE_RESIZE_RIGHT){
this.fireEvent("onResizeArea");
var _71=x-_6e-_70;
if((_70+(_71))-1>0){
this.areas[this.currentid].style.width=(_70+(_71))-1+"px";
this.areas[this.currentid].setAttribute("width",parseInt(this.areas[this.currentid].style.width));
}else{
this.memory[this.currentid].width=0;
this.memory[this.currentid].left=x;
this.is_drawing=this.DM_RECTANGLE_RESIZE_LEFT;
}
}else{
if(this.is_drawing==this.DM_RECTANGLE_RESIZE_TOP){
this.fireEvent("onResizeArea");
var _72=y-top;
if((_6f+(-1*_72))>0){
this.areas[this.currentid].style.top=y+1+"px";
this.areas[this.currentid].style.height=(_6f+(-1*_72))+"px";
this.areas[this.currentid].setAttribute("height",parseInt(this.areas[this.currentid].style.height));
}else{
this.memory[this.currentid].height=0;
this.memory[this.currentid].top=y;
this.is_drawing=this.DM_RECTANGLE_RESIZE_BOTTOM;
}
}else{
if(this.is_drawing==this.DM_RECTANGLE_RESIZE_BOTTOM){
this.fireEvent("onResizeArea");
var _72=y-top-_6f;
if((_6f+(_72))-1>0){
this.areas[this.currentid].style.height=(_6f+(_72))-1+"px";
this.areas[this.currentid].setAttribute("height",parseInt(this.areas[this.currentid].style.height));
}else{
this.memory[this.currentid].height=0;
this.memory[this.currentid].top=y;
this.is_drawing=this.DM_RECTANGLE_RESIZE_TOP;
}
}
}
}
}
}
}
}
}
}
}
}
}
}
if(this.is_drawing){
this._repaint(this.areas[this.currentid],this.config.CL_DRAW_SHAPE,x,y);
this._updatecoords();
}
};
imgmap.prototype.img_mouseup=function(e){
if(this.viewmode==1){
return;
}
if(!this.props[this.currentid]){
return;
}
var pos=this._getPos(this.pic);
var x=(window.event)?(window.event.x-this.pic.offsetLeft):(e.pageX-pos.x);
var y=(window.event)?(window.event.y-this.pic.offsetTop):(e.pageY-pos.y);
x=x+this.pic_container.scrollLeft;
y=y+this.pic_container.scrollTop;
if(this.is_drawing!=this.DM_RECTANGLE_DRAW&&this.is_drawing!=this.DM_SQUARE_DRAW&&this.is_drawing!=this.DM_POLYGON_DRAW&&this.is_drawing!=this.DM_POLYGON_LASTDRAW){
this.draggedId=null;
this.is_drawing=0;
this.statusMessage(this.strings["READY"]);
this.relaxArea(this.currentid);
if(this.areas[this.currentid]==this._getLastArea()){
return;
}
this.memory[this.currentid].downx=x;
this.memory[this.currentid].downy=y;
}
};
imgmap.prototype.img_mousedown=function(e){
if(this.viewmode==1){
return;
}
var pos=this._getPos(this.pic);
var x=(window.event)?(window.event.x-this.pic.offsetLeft):(e.pageX-pos.x);
var y=(window.event)?(window.event.y-this.pic.offsetTop):(e.pageY-pos.y);
x=x+this.pic_container.scrollLeft;
y=y+this.pic_container.scrollTop;
if(this.is_drawing==this.DM_POLYGON_DRAW){
this.areas[this.currentid].xpoints[this.areas[this.currentid].xpoints.length]=x-5;
this.areas[this.currentid].ypoints[this.areas[this.currentid].ypoints.length]=y-5;
}else{
if(this.is_drawing&&this.is_drawing!=this.DM_POLYGON_DRAW){
if(this.is_drawing==this.DM_POLYGON_LASTDRAW){
this.areas[this.currentid].xpoints[this.areas[this.currentid].xpoints.length]=x-5;
this.areas[this.currentid].ypoints[this.areas[this.currentid].ypoints.length]=y-5;
this._updatecoords();
this.is_drawing=0;
this._polygonshrink(this.areas[this.currentid]);
}
this.is_drawing=0;
this.statusMessage(this.strings["READY"]);
this.relaxArea(this.currentid);
if(this.areas[this.currentid]==this._getLastArea()){
return;
}
}
}
if(this.nextShape==""){
return;
}
this.addNewArea();
this.initArea(this.currentid,this.nextShape);
if(this.areas[this.currentid].shape=="polygon"){
this.is_drawing=this.DM_POLYGON_DRAW;
this.statusMessage(this.strings["POLYGON_DRAW"]);
this.areas[this.currentid].style.left=x+"px";
this.areas[this.currentid].style.top=y+"px";
if(this.config.bounding_box==true){
this.areas[this.currentid].style.borderWidth="1px";
this.areas[this.currentid].style.borderStyle="dotted";
this.areas[this.currentid].style.borderColor=this.config.CL_DRAW_BOX;
}
this.areas[this.currentid].style.width=0;
this.areas[this.currentid].style.height=0;
this.areas[this.currentid].xpoints=new Array();
this.areas[this.currentid].ypoints=new Array();
this.areas[this.currentid].xpoints[0]=x;
this.areas[this.currentid].ypoints[0]=y;
}else{
if(this.areas[this.currentid].shape=="rectangle"){
this.is_drawing=this.DM_RECTANGLE_DRAW;
this.statusMessage(this.strings["RECTANGLE_DRAW"]);
this.areas[this.currentid].style.left=x+"px";
this.areas[this.currentid].style.top=y+"px";
this.areas[this.currentid].style.borderWidth="1px";
this.areas[this.currentid].style.borderStyle="dotted";
this.areas[this.currentid].style.borderColor=this.config.CL_DRAW_SHAPE;
this.areas[this.currentid].style.width=0;
this.areas[this.currentid].style.height=0;
}else{
if(this.areas[this.currentid].shape=="circle"){
this.is_drawing=this.DM_SQUARE_DRAW;
this.statusMessage(this.strings["SQUARE_DRAW"]);
this.areas[this.currentid].style.left=x+"px";
this.areas[this.currentid].style.top=y+"px";
if(this.config.bounding_box==true){
this.areas[this.currentid].style.borderWidth="1px";
this.areas[this.currentid].style.borderStyle="dotted";
this.areas[this.currentid].style.borderColor=this.config.CL_DRAW_BOX;
}
this.areas[this.currentid].style.width=0;
this.areas[this.currentid].style.height=0;
}
}
}
this.memory[this.currentid].downx=x;
this.memory[this.currentid].downy=y;
};
imgmap.prototype.img_area_mouseover=function(e){
if(this.is_drawing){
return;
}
if(this.viewmode==1){
return;
}
var obj=(document.all)?window.event.srcElement:e.currentTarget;
if(typeof obj.aid=="undefined"){
obj=obj.parentNode;
}
var id=obj.aid;
if(this.areas[id]){
this.fireEvent("onFocusArea");
if(this.areas[id].shape=="rectangle"){
this.areas[id].style.borderWidth="1px";
this.areas[id].style.borderStyle="solid";
this.areas[id].style.borderColor=this.config.CL_HIGHLIGHT_SHAPE;
}else{
if(this.areas[id].shape=="circle"||this.areas[id].shape=="polygon"){
if(this.config.bounding_box==true){
this.areas[id].style.borderWidth="1px";
this.areas[id].style.borderStyle="solid";
this.areas[id].style.borderColor=this.config.CL_HIGHLIGHT_BOX;
}
}
}
this._setopacity(this.areas[id],this.config.CL_HIGHLIGHT_BG,this.config.highlight_opacity);
this._repaint(this.areas[id],this.config.CL_HIGHLIGHT_SHAPE);
}
};
imgmap.prototype.img_area_mouseout=function(e){
if(this.is_drawing){
return;
}
if(this.viewmode==1){
return;
}
var obj=(document.all)?window.event.srcElement:e.currentTarget;
if(typeof obj.aid=="undefined"){
obj=obj.parentNode;
}
var id=obj.aid;
if(this.areas[id]){
this.fireEvent("onBlurArea");
if(this.areas[id].shape=="rectangle"){
this.areas[id].style.borderWidth="1px";
this.areas[id].style.borderStyle="solid";
this.areas[id].style.borderColor=this.config.CL_NORM_SHAPE;
}else{
if(this.areas[id].shape=="circle"||this.areas[id].shape=="polygon"){
if(this.config.bounding_box==true){
this.areas[id].style.borderWidth="1px";
this.areas[id].style.borderStyle="solid";
this.areas[id].style.borderColor=this.config.CL_NORM_BOX;
}
}
}
this._setopacity(this.areas[id],this.config.CL_NORM_BG,this.config.norm_opacity);
this._repaint(this.areas[id],this.config.CL_NORM_SHAPE);
}
};
imgmap.prototype.img_area_click=function(e){
if(this.viewmode==1){
return;
}
var obj=(document.all)?window.event.srcElement:e.currentTarget;
if(typeof obj.aid=="undefined"){
obj=obj.parentNode;
}
this.form_selectRow(obj.aid,false);
this.currentid=obj.aid;
};
imgmap.prototype.form_selectRow=function(id,_86){
if(this.is_drawing){
return;
}
if(this.viewmode==1){
return;
}
if(!this.form_container){
return;
}
if(!document.getElementById("img_active_"+id)){
return;
}
this.fireEvent("onSelectRow");
document.getElementById("img_active_"+id).checked=1;
if(_86){
document.getElementById("img_active_"+id).focus();
}
for(var i=0;i<this.props.length;i++){
if(this.props[i]){
this.props[i].style.background="";
}
}
this.props[id].style.background=this.config.CL_HIGHLIGHT_PROPS;
};
imgmap.prototype.img_area_keydown=function(e){
if(this.viewmode==1){
return;
}
var key=(window.event)?event.keyCode:e.keyCode;
if(key==46){
this.removeArea();
}
};
imgmap.prototype.img_area_blur=function(e){
var obj=(document.all)?window.event.srcElement:e.currentTarget;
this._recalculate(obj.parentNode.aid);
if(this.html_container){
this.html_container.value=this.getMapHTML();
}
};
imgmap.prototype.html_container_blur=function(e){
var _8d=this.html_container.getAttribute("oldvalue");
if(_8d!=this.html_container.value){
this.setMapHTML(this.html_container.value);
}
};
imgmap.prototype.html_container_focus=function(e){
this.html_container.setAttribute("oldvalue",this.html_container.value);
this.html_container.select();
};
imgmap.prototype.area_mousemove=function(e){
if(this.viewmode==1){
return;
}
if(this.is_drawing==0){
var obj=(document.all)?window.event.srcElement:e.currentTarget;
if(obj.tagName=="DIV"){
obj=obj.parentNode;
}
if(obj.tagName=="image"||obj.tagName=="group"||obj.tagName=="shape"||obj.tagName=="stroke"){
obj=obj.parentNode.parentNode;
}
var _91=(window.event)?(window.event.offsetX):(e.layerX);
var _92=(window.event)?(window.event.offsetY):(e.layerY);
if(_91<6&&_92>6){
if(obj.shape!="polygon"){
obj.style.cursor="w-resize";
}
}else{
if(_91>parseInt(obj.style.width)-6&&_92>6){
if(obj.shape!="polygon"){
obj.style.cursor="e-resize";
}
}else{
if(_91>6&&_92<6){
if(obj.shape!="polygon"){
obj.style.cursor="n-resize";
}
}else{
if(_92>parseInt(obj.style.height)-6&&_91>6){
if(obj.shape!="polygon"){
obj.style.cursor="s-resize";
}
}else{
obj.style.cursor="move";
}
}
}
}
if(obj.aid!=this.draggedId){
if(obj.style.cursor=="move"){
obj.style.cursor="default";
}
return;
}
if(_91<6&&_92>6){
if(this.areas[this.currentid].shape=="circle"){
this.is_drawing=this.DM_SQUARE_RESIZE_LEFT;
this.statusMessage(this.strings["SQUARE_RESIZE_LEFT"]);
if(this.config.bounding_box==true){
this.areas[this.currentid].style.borderColor=this.config.CL_DRAW_BOX;
}
}else{
if(this.areas[this.currentid].shape=="rectangle"){
this.is_drawing=this.DM_RECTANGLE_RESIZE_LEFT;
this.statusMessage(this.strings["RECTANGLE_RESIZE_LEFT"]);
this.areas[this.currentid].style.borderColor=this.config.CL_DRAW_SHAPE;
}
}
}else{
if(_91>parseInt(this.areas[this.currentid].style.width)-6&&_92>6){
if(this.areas[this.currentid].shape=="circle"){
this.is_drawing=this.DM_SQUARE_RESIZE_RIGHT;
this.statusMessage(this.strings["SQUARE_RESIZE_RIGHT"]);
if(this.config.bounding_box==true){
this.areas[this.currentid].style.borderColor=this.config.CL_DRAW_BOX;
}
}else{
if(this.areas[this.currentid].shape=="rectangle"){
this.is_drawing=this.DM_RECTANGLE_RESIZE_RIGHT;
this.statusMessage(this.strings["RECTANGLE_RESIZE_RIGHT"]);
this.areas[this.currentid].style.borderColor=this.config.CL_DRAW_SHAPE;
}
}
}else{
if(_91>6&&_92<6){
if(this.areas[this.currentid].shape=="circle"){
this.is_drawing=this.DM_SQUARE_RESIZE_TOP;
this.statusMessage(this.strings["SQUARE_RESIZE_TOP"]);
if(this.config.bounding_box==true){
this.areas[this.currentid].style.borderColor=this.config.CL_DRAW_BOX;
}
}else{
if(this.areas[this.currentid].shape=="rectangle"){
this.is_drawing=this.DM_RECTANGLE_RESIZE_TOP;
this.statusMessage(this.strings["RECTANGLE_RESIZE_TOP"]);
this.areas[this.currentid].style.borderColor=this.config.CL_DRAW_SHAPE;
}
}
}else{
if(_92>parseInt(this.areas[this.currentid].style.height)-6&&_91>6){
if(this.areas[this.currentid].shape=="circle"){
this.is_drawing=this.DM_SQUARE_RESIZE_BOTTOM;
this.statusMessage(this.strings["SQUARE_RESIZE_BOTTOM"]);
if(this.config.bounding_box==true){
this.areas[this.currentid].style.borderColor=this.config.CL_DRAW_BOX;
}
}else{
if(this.areas[this.currentid].shape=="rectangle"){
this.is_drawing=this.DM_RECTANGLE_RESIZE_BOTTOM;
this.statusMessage(this.strings["RECTANGLE_RESIZE_BOTTOM"]);
this.areas[this.currentid].style.borderColor=this.config.CL_DRAW_SHAPE;
}
}
}else{
if(this.areas[this.currentid].shape=="circle"){
this.is_drawing=this.DM_SQUARE_MOVE;
this.statusMessage(this.strings["SQUARE_MOVE"]);
if(this.config.bounding_box==true){
this.areas[this.currentid].style.borderColor=this.config.CL_DRAW_BOX;
}
this.memory[this.currentid].rdownx=_91;
this.memory[this.currentid].rdowny=_92;
}else{
if(this.areas[this.currentid].shape=="rectangle"){
this.is_drawing=this.DM_RECTANGLE_MOVE;
this.statusMessage(this.strings["RECTANGLE_MOVE"]);
this.areas[this.currentid].style.borderColor=this.config.CL_DRAW_SHAPE;
this.memory[this.currentid].rdownx=_91;
this.memory[this.currentid].rdowny=_92;
}else{
if(this.areas[this.currentid].shape=="polygon"){
for(var i=0;i<this.areas[this.currentid].xpoints.length;i++){
this.memory[this.currentid].xpoints[i]=this.areas[this.currentid].xpoints[i];
this.memory[this.currentid].ypoints[i]=this.areas[this.currentid].ypoints[i];
}
this.is_drawing=this.DM_POLYGON_MOVE;
this.statusMessage(this.strings["POLYGON_MOVE"]);
if(this.config.bounding_box==true){
this.areas[this.currentid].style.borderColor=this.config.CL_DRAW_BOX;
}
this.memory[this.currentid].rdownx=_91;
this.memory[this.currentid].rdowny=_92;
}
}
}
}
}
}
}
this.memory[this.currentid].width=parseInt(this.areas[this.currentid].style.width);
this.memory[this.currentid].height=parseInt(this.areas[this.currentid].style.height);
this.memory[this.currentid].top=parseInt(this.areas[this.currentid].style.top);
this.memory[this.currentid].left=parseInt(this.areas[this.currentid].style.left);
if(this.areas[this.currentid].shape=="rectangle"){
this.areas[this.currentid].style.borderWidth="1px";
this.areas[this.currentid].style.borderStyle="dotted";
}else{
if(this.areas[this.currentid].shape=="circle"||this.areas[this.currentid].shape=="polygon"){
if(this.config.bounding_box==true){
this.areas[this.currentid].style.borderWidth="1px";
this.areas[this.currentid].style.borderStyle="dotted";
}
}
}
this._setopacity(this.areas[this.currentid],this.config.CL_DRAW_BG,this.config.draw_opacity);
}else{
this.img_mousemove(e);
}
};
imgmap.prototype.area_mouseup=function(e){
if(this.viewmode==1){
return;
}
if(this.is_drawing==0){
var obj=(document.all)?window.event.srcElement:e.currentTarget;
if(obj.tagName=="DIV"){
obj=obj.parentNode;
}
if(obj.tagName=="image"||obj.tagName=="group"||obj.tagName=="shape"||obj.tagName=="stroke"){
obj=obj.parentNode.parentNode;
}
if(this.areas[this.currentid]!=obj){
if(typeof obj.aid=="undefined"){
this.log("Cannot identify target area",1);
return;
}
}
this.draggedId=null;
}else{
this.img_mouseup(e);
}
};
imgmap.prototype.area_mousedown=function(e){
if(this.viewmode==1){
return;
}
if(this.is_drawing==0){
var obj=(document.all)?window.event.srcElement:e.currentTarget;
if(obj.tagName=="DIV"){
obj=obj.parentNode;
}
if(obj.tagName=="image"||obj.tagName=="group"||obj.tagName=="shape"||obj.tagName=="stroke"){
obj=obj.parentNode.parentNode;
}
if(this.areas[this.currentid]!=obj){
if(typeof obj.aid=="undefined"){
this.log("Cannot identify target area",1);
return;
}
this.form_selectRow(obj.aid,true);
this.currentid=obj.aid;
}
this.fireEvent("onSelectArea",this.areas[this.currentid]);
this.draggedId=this.currentid;
}else{
this.img_mousedown(e);
}
};
imgmap.prototype.getSelectionStart=function(obj){
if(obj.createTextRange){
var r=document.selection.createRange().duplicate();
r.moveEnd("character",obj.value.length);
if(r.text==""){
return obj.value.length;
}
return obj.value.lastIndexOf(r.text);
}else{
return obj.selectionStart;
}
};
imgmap.prototype.setSelectionRange=function(obj,_9b,end){
if(typeof end=="undefined"){
end=_9b;
}
if(obj.selectionStart){
obj.setSelectionRange(_9b,end);
obj.focus();
}else{
if(document.selection){
var _9d=obj.createTextRange();
_9d.collapse(true);
_9d.moveStart("character",_9b);
_9d.moveEnd("character",end-_9b);
_9d.select();
}
}
};
imgmap.prototype.img_coords_keydown=function(e){
if(this.viewmode==1){
return;
}
var key=(window.event)?event.keyCode:e.keyCode;
var obj=(document.all)?window.event.srcElement:e.originalTarget;
if(key==40||key==38){
this.fireEvent("onResizeArea");
var _a1=obj.value;
_a1=_a1.split(",");
var s=this.getSelectionStart(obj);
var j=0;
for(var i=0;i<_a1.length;i++){
j+=_a1[i].length;
if(j>s){
if(key==40&&_a1[i]>0){
_a1[i]--;
}
if(key==38){
_a1[i]++;
}
this._recalculate(this.currentid);
break;
}
j++;
}
obj.value=_a1.join(",");
this.setSelectionRange(obj,s);
return true;
}
};
imgmap.prototype.doc_keydown=function(e){
var key=(window.event)?event.keyCode:e.keyCode;
if(key==16){
if(this.is_drawing==this.DM_POLYGON_DRAW){
this.is_drawing=this.DM_POLYGON_LASTDRAW;
}else{
if(this.is_drawing==this.DM_RECTANGLE_DRAW){
this.is_drawing=this.DM_SQUARE_DRAW;
this.statusMessage(this.strings["SQUARE2_DRAW"]);
}
}
}
};
imgmap.prototype.doc_keyup=function(e){
var key=(window.event)?event.keyCode:e.keyCode;
if(key==16){
if(this.is_drawing==this.DM_POLYGON_LASTDRAW){
this.is_drawing=this.DM_POLYGON_DRAW;
}else{
if(this.is_drawing==this.DM_SQUARE_DRAW&&this.areas[this.currentid].shape=="rectangle"){
this.is_drawing=this.DM_RECTANGLE_DRAW;
this.statusMessage(this.strings["RECTANGLE_DRAW"]);
}
}
}
};
imgmap.prototype._getPos=function(_a9){
var _aa=0;
var _ab=0;
if(_a9){
var _ac=_a9.offsetParent;
if(_ac){
while((_ac=_a9.offsetParent)!=null){
_aa+=_a9.offsetLeft;
_ab+=_a9.offsetTop;
_a9=_ac;
}
}else{
_aa=_a9.offsetLeft;
_ab=_a9.offsetTop;
}
}
return new Object({x:_aa,y:_ab});
};
imgmap.prototype._getLastArea=function(){
for(var i=this.areas.length-1;i>=0;i--){
if(this.areas[i]){
return this.areas[i];
}
}
return null;
};
imgmap.prototype.toClipBoard=function(_ae){
this.fireEvent("onClipboard");
if(typeof _ae=="undefined"){
_ae=this.getMapHTML();
}
try{
if(window.clipboardData){
window.clipboardData.setData("Text",_ae);
}else{
if(window.netscape){
netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
var str=Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
if(!str){
return false;
}
str.data=_ae;
var _b0=Components.classes["@mozilla.org/widget/transferable;1"].createInstance(Components.interfaces.nsITransferable);
if(!_b0){
return false;
}
_b0.addDataFlavor("text/unicode");
_b0.setTransferData("text/unicode",str,_ae.length*2);
var _b1=Components.interfaces.nsIClipboard;
var _b2=Components.classes["@mozilla.org/widget/clipboard;1"].getService(_b1);
if(!_b2){
return false;
}
_b2.setData(_b0,null,_b1.kGlobalClipboard);
}
}
}
catch(err){
this.log("Unable to set clipboard data",1);
}
};
imgmap.prototype.assignCSS=function(obj,_b4){
var _b5=_b4.split(";");
for(var i=0;i<_b5.length;i++){
var p=_b5[i].split(":");
var pp=p[0].trim().split("-");
var _b9=pp[0];
for(var j=1;j<pp.length;j++){
_b9+=pp[j].replace(/^./,pp[j].substring(0,1).toUpperCase());
}
_b9=_b9.trim();
value=p[1].trim();
eval("obj.style."+_b9+" = '"+value+"';");
}
};
imgmap.prototype.fireEvent=function(evt,obj){
if(typeof this.config.custom_callbacks[evt]=="function"){
this.config.custom_callbacks[evt](obj);
}
};
Function.prototype.bind=function(_bd){
var _be=this;
return function(){
return _be.apply(_bd,arguments);
};
};
String.prototype.trim=function(){
return this.replace(/^\s+|\s+$/g,"");
};
String.prototype.ltrim=function(){
return this.replace(/^\s+/,"");
};
String.prototype.rtrim=function(){
return this.replace(/\s+$/,"");
};
function imgmap_spawnObjects(_bf){
var _c0=document.getElementsByTagName("map");
var _c1=document.getElementsByTagName("img");
var _c2=new Array();
for(var i=0;i<_c0.length;i++){
for(var j=0;j<_c1.length;j++){
if("#"+_c0[i].name==_c1[j].getAttribute("usemap")){
_bf.mode="";
imapn=new imgmap(_bf);
imapn.useImage(_c1[j]);
imapn.setMapHTML(_c0[i]);
imapn.viewmode=1;
_c2.push(imapn);
}
}
}
}

