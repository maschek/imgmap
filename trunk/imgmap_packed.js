function imgmap(_1){
this.version="2.0beta2";
this.releaseDate="2007-02-11";
this.config=new Object();
this.is_drawing=0;
this.strings=new Array();
this.memory=new Array();
this.areas=new Array();
this.props=new Array();
this.logStore=new Array();
this.currentid=0;
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
this.config.button_callbacks=new Array();
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
this.log("Undefined object passed to assignOID. Called from: "+arguments.callee.caller,1);
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
if(this.isMSIE){
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
img.onclick=this.addNewArea.bind(this);
if(this.config.button_callbacks[i]){
this.addEvent(img,"click",this.config.button_callbacks[i]);
}
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
img.onclick=this.removeArea.bind(this);
if(this.config.button_callbacks[i]){
this.addEvent(img,"click",this.config.button_callbacks[i]);
}
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
img.onclick=this.togglePreview.bind(this);
if(this.config.button_callbacks[i]){
this.addEvent(img,"click",this.config.button_callbacks[i]);
}
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
if(this.config.button_callbacks[i]){
this.addEvent(img,"click",this.config.button_callbacks[i]);
}
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
img.onclick=this.toClipBoard.bind(this);
if(this.config.button_callbacks[i]){
this.addEvent(img,"click",this.config.button_callbacks[i]);
}
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
this.addNewArea();
}
if(typeof img=="string"){
if(typeof this.pic=="undefined"){
this.pic=document.createElement("IMG");
this.pic_container.appendChild(this.pic);
this.pic.onmousedown=this.img_mousedown.bind(this);
this.pic.onmousemove=this.img_mousemove.bind(this);
this.pic.style.cursor=this.config.cursor_default;
}
var ts=new Date().getTime();
this.pic.src=img+"?"+ts;
}else{
if(typeof img=="object"){
if(img.getAttribute("src")==""&&img.getAttribute("mce_src")!=""){
this.loadImage(img.getAttribute("mce_src"),_20,_21);
}else{
this.loadImage(img.getAttribute("src"),_20,_21);
}
}
}
};
imgmap.prototype.useImage=function(img){
img=this.assignOID(img);
if(typeof img=="object"){
this.pic=img;
this.pic.onmousedown=this.img_mousedown.bind(this);
this.pic.onmousemove=this.img_mousemove.bind(this);
this.pic.style.cursor=this.config.cursor_default;
this.pic_container=this.pic.parentNode;
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
if(this.mapname==""){
var now=new Date();
this.mapname="imgmap"+now.getFullYear()+(now.getMonth()+1)+now.getDate()+now.getHours()+now.getMinutes()+now.getSeconds();
}
if(this.mapid==""){
this.mapid=this.mapname;
}
html="<map id=\""+this.mapid+"\" name=\""+this.mapname+"\">"+this.getMapInnerHTML()+"</map>";
return (html);
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
return this.mapname;
};
imgmap.prototype.getMapId=function(){
return this.mapid;
};
imgmap.prototype._normCoords=function(_2c){
_2c=_2c.replace(/(\d)(\D)+(\d)/g,"$1,$3");
_2c=_2c.replace(/,(\D|0)+(\d)/g,",$2");
_2c=_2c.replace(/(\d)(\D)+,/g,"$1,");
_2c=_2c.replace(/^(\D|0)+(\d)/g,"$2");
return _2c;
};
imgmap.prototype.setMapHTML=function(_2d){
this.removeAllAreas();
this.log("setmap");
var div=document.createElement("DIV");
if(typeof _2d=="string"){
div.innerHTML=_2d;
}else{
if(typeof _2d=="object"){
div.appendChild(_2d);
}
}
if(!div.getElementsByTagName("map")[0]){
return false;
}
this.mapname=div.getElementsByTagName("map")[0].name;
this.mapid=div.getElementsByTagName("map")[0].id;
var _2f=div.getElementsByTagName("area");
for(var i=0;i<_2f.length;i++){
id=this.addNewArea();
if(_2f[i].getAttribute("shape")){
shape=_2f[i].getAttribute("shape").toLowerCase();
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
if(_2f[i].getAttribute("coords")){
var _31=this._normCoords(_2f[i].getAttribute("coords"));
this.props[id].getElementsByTagName("input")[2].value=_31;
}
if(_2f[i].getAttribute("href")){
this.props[id].getElementsByTagName("input")[3].value=_2f[i].getAttribute("href");
}
if(_2f[i].getAttribute("alt")){
this.props[id].getElementsByTagName("input")[4].value=_2f[i].getAttribute("alt");
}
if(_2f[i].getAttribute("target")){
target=_2f[i].getAttribute("target").toLowerCase();
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
imgmap.prototype.togglePreview=function(){
if(!this.pic){
return false;
}
if(this.viewmode==0){
for(var i=0;i<this.areas.length;i++){
if(this.areas[i]){
this.areas[i].style.display="none";
if(this.areas[i].label){
this.areas[i].label.style.display="none";
}
}
}
var _33=this.form_container.getElementsByTagName("input");
for(var i=0;i<_33.length;i++){
_33[i].disabled=true;
}
var _33=this.form_container.getElementsByTagName("select");
for(var i=0;i<_33.length;i++){
_33[i].disabled=true;
}
this.preview.innerHTML=this.getMapHTML();
this.pic.setAttribute("usemap","#"+this.mapname,0);
this.pic.onmousedown=null;
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
var _33=this.form_container.getElementsByTagName("input");
for(var i=0;i<_33.length;i++){
_33[i].disabled=false;
}
var _33=this.form_container.getElementsByTagName("select");
for(var i=0;i<_33.length;i++){
_33[i].disabled=false;
}
this.preview.innerHTML="";
this.pic.onmousedown=this.img_mousedown.bind(this);
this.pic.onmousemove=this.img_mousemove.bind(this);
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
var _34=this._getLastArea();
var id=this.areas.length;
this.areas[id]=document.createElement("DIV");
this.areas[id].id=this.mapname+"area"+id;
this.areas[id].aid=id;
this.areas[id].shape="unknown";
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
if(_34){
this.props[id].getElementsByTagName("select")[0].value=_34.shape;
}
this.form_selectRow(id,true);
this.currentid=id;
return (id);
};
imgmap.prototype.initArea=function(id,_37){
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
this.areas[id].shape=_37;
this.areas[id].style.position="absolute";
this.areas[id].style.top=this.pic.offsetTop+"px";
this.areas[id].style.left=this.pic.offsetLeft+"px";
this._setopacity(this.areas[id],this.config.CL_DRAW_BG,this.config.draw_opacity);
this.areas[id].onmousedown=this.area_mousedown.bind(this);
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
imgmap.prototype._setopacity=function(_3a,_3b,pct){
_3a.style.backgroundColor=_3b;
_3a.style.opacity="."+pct;
_3a.style.filter="alpha(opacity="+pct+")";
};
imgmap.prototype.removeArea=function(){
if(this.viewmode==1){
return;
}
var id=this.currentid;
if(this.props[id]){
var _3e=this.props[id].parentNode;
_3e.removeChild(this.props[id]);
var _3f=_3e.lastChild.aid;
this.props[id]=null;
try{
this.form_selectRow(_3f,true);
this.currentid=_3f;
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
var _42=this.config.label;
_42=_42.replace(/%n/g,String(id));
_42=_42.replace(/%c/g,String(this.props[id].getElementsByTagName("input")[2].value));
_42=_42.replace(/%h/g,String(this.props[id].getElementsByTagName("input")[3].value));
_42=_42.replace(/%a/g,String(this.props[id].getElementsByTagName("input")[4].value));
this.areas[id].label.innerHTML=_42;
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
var _44=this.config.hint;
_44=_44.replace(/%n/g,String(id));
_44=_44.replace(/%c/g,String(this.props[id].getElementsByTagName("input")[2].value));
_44=_44.replace(/%h/g,String(this.props[id].getElementsByTagName("input")[3].value));
_44=_44.replace(/%a/g,String(this.props[id].getElementsByTagName("input")[4].value));
this.areas[id].title=_44;
this.areas[id].alt=_44;
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
imgmap.prototype._repaint=function(_46,_47,x,y){
if(_46.shape=="circle"){
var _4a=parseInt(_46.style.width);
var _4b=Math.floor(_4a/2)-1;
var ctx=_46.getContext("2d");
ctx.clearRect(0,0,_4a,_4a);
ctx.beginPath();
ctx.strokeStyle=_47;
ctx.arc(_4b,_4b,_4b,0,Math.PI*2,0);
ctx.stroke();
ctx.closePath();
ctx.strokeStyle=this.config.CL_KNOB;
ctx.strokeRect(_4b,_4b,1,1);
this._putlabel(_46.aid);
this._puthint(_46.aid);
}else{
if(_46.shape=="rectangle"){
this._putlabel(_46.aid);
this._puthint(_46.aid);
}else{
if(_46.shape=="polygon"){
var _4a=parseInt(_46.style.width);
var _4d=parseInt(_46.style.height);
var _4e=parseInt(_46.style.left);
var top=parseInt(_46.style.top);
var ctx=_46.getContext("2d");
ctx.clearRect(0,0,_4a,_4d);
ctx.beginPath();
ctx.strokeStyle=_47;
ctx.moveTo(_46.xpoints[0]-_4e,_46.ypoints[0]-top);
for(var i=1;i<_46.xpoints.length;i++){
ctx.lineTo(_46.xpoints[i]-_4e,_46.ypoints[i]-top);
}
if(this.is_drawing==this.DM_POLYGON_DRAW||this.is_drawing==this.DM_POLYGON_LASTDRAW){
ctx.lineTo(x-_4e-5,y-top-5);
}
ctx.lineTo(_46.xpoints[0]-_4e,_46.ypoints[0]-top);
ctx.stroke();
ctx.closePath();
this._putlabel(_46.aid);
this._puthint(_46.aid);
}
}
}
};
imgmap.prototype._updatecoords=function(){
var _51=this.props[this.currentid].getElementsByTagName("input")[2];
var _52=parseInt(this.areas[this.currentid].style.left);
var top=parseInt(this.areas[this.currentid].style.top);
var _54=parseInt(this.areas[this.currentid].style.height);
var _55=parseInt(this.areas[this.currentid].style.width);
if(this.areas[this.currentid].shape=="rectangle"){
_51.value=_52+","+top+","+(_52+_55)+","+(top+_54);
this.areas[this.currentid].lastInput=_51.value;
}else{
if(this.areas[this.currentid].shape=="circle"){
var _56=Math.floor(_55/2)-1;
_51.value=(_52+_56)+","+(top+_56)+","+_56;
this.areas[this.currentid].lastInput=_51.value;
}else{
if(this.areas[this.currentid].shape=="polygon"){
_51.value="";
for(var i=0;i<this.areas[this.currentid].xpoints.length;i++){
_51.value+=this.areas[this.currentid].xpoints[i]+","+this.areas[this.currentid].ypoints[i]+",";
}
_51.value=_51.value.substring(0,_51.value.length-1);
this.areas[this.currentid].lastInput=_51.value;
}
}
}
if(this.html_container){
this.html_container.value=this.getMapHTML();
}
};
imgmap.prototype._recalculate=function(id){
var _59=this.props[id].getElementsByTagName("input")[2];
_59.value=this._normCoords(_59.value);
var _5a=_59.value;
var _5b=_5a.split(",");
try{
if(this.areas[id].shape=="rectangle"){
if(_5b.length!=4){
throw "invalid coords";
}
if(parseInt(_5b[0])>parseInt(_5b[2])){
throw "invalid coords";
}
if(parseInt(_5b[1])>parseInt(_5b[3])){
throw "invalid coords";
}
this.areas[id].style.left=this.pic.offsetLeft+parseInt(_5b[0])+"px";
this.areas[id].style.top=this.pic.offsetTop+parseInt(_5b[1])+"px";
this.areas[id].style.width=(_5b[2]-_5b[0])+"px";
this.areas[id].style.height=(_5b[3]-_5b[1])+"px";
this.areas[id].setAttribute("width",(_5b[2]-_5b[0]));
this.areas[id].setAttribute("height",(_5b[3]-_5b[1]));
this._repaint(this.areas[id],this.config.CL_NORM_SHAPE);
}else{
if(this.areas[id].shape=="circle"){
if(_5b.length!=3){
throw "invalid coords";
}
if(parseInt(_5b[2])<0){
throw "invalid coords";
}
var _5c=2*(1*_5b[2]+1);
this.areas[id].style.width=_5c+"px";
this.areas[id].style.height=_5c+"px";
this.areas[id].setAttribute("width",_5c);
this.areas[id].setAttribute("height",_5c);
this.areas[id].style.left=this.pic.offsetLeft+parseInt(_5b[0])-_5c/2+"px";
this.areas[id].style.top=this.pic.offsetTop+parseInt(_5b[1])-_5c/2+"px";
this._repaint(this.areas[id],this.config.CL_NORM_SHAPE);
}else{
if(this.areas[id].shape=="polygon"){
if(_5b.length<2){
throw "invalid coords";
}
this.areas[id].xpoints=new Array();
this.areas[id].ypoints=new Array();
for(var i=0;i<_5b.length;i+=2){
this.areas[id].xpoints[this.areas[id].xpoints.length]=this.pic.offsetLeft+parseInt(_5b[i]);
this.areas[id].ypoints[this.areas[id].ypoints.length]=this.pic.offsetTop+parseInt(_5b[i+1]);
this._polygongrow(this.areas[id],_5b[i],_5b[i+1]);
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
_59.value=this.areas[id].lastInput;
}
this._repaint(this.areas[id],this.config.CL_NORM_SHAPE);
return;
}
this.areas[id].lastInput=_59.value;
};
imgmap.prototype._polygongrow=function(_5e,_5f,_60){
var _61=_5f-parseInt(_5e.style.left);
var _62=_60-parseInt(_5e.style.top);
var pad=2;
var _64=pad*2;
if(_5f<parseInt(_5e.style.left)){
_5e.style.left=_5f-pad+"px";
_5e.style.width=parseInt(_5e.style.width)+Math.abs(_61)+_64+"px";
_5e.setAttribute("width",parseInt(_5e.style.width));
}
if(_60<parseInt(_5e.style.top)){
_5e.style.top=_60-pad+"px";
_5e.style.height=parseInt(_5e.style.height)+Math.abs(_62)+_64+"px";
_5e.setAttribute("height",parseInt(_5e.style.height));
}
if(_5f>parseInt(_5e.style.left)+parseInt(_5e.style.width)){
_5e.style.width=_5f-parseInt(_5e.style.left)+_64+"px";
_5e.setAttribute("width",parseInt(_5e.style.width));
}
if(_60>parseInt(_5e.style.top)+parseInt(_5e.style.height)){
_5e.style.height=_60-parseInt(_5e.style.top)+_64+"px";
_5e.setAttribute("height",parseInt(_5e.style.height));
}
};
imgmap.prototype._polygonshrink=function(_65){
_65.style.left=(_65.xpoints[0]+1)+"px";
_65.style.top=(_65.ypoints[0]+1)+"px";
_65.style.height="0px";
_65.style.width="0px";
_65.setAttribute("height","0");
_65.setAttribute("width","0");
for(var i=0;i<_65.xpoints.length;i++){
this._polygongrow(_65,_65.xpoints[i],_65.ypoints[i]);
}
this._repaint(_65,this.config.CL_NORM_SHAPE);
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
var _6c=this.memory[this.currentid].left;
var _6d=this.memory[this.currentid].height;
var _6e=this.memory[this.currentid].width;
}
if(this.is_drawing==this.DM_RECTANGLE_DRAW){
var _6f=x-this.memory[this.currentid].downx;
var _70=y-this.memory[this.currentid].downy;
this.areas[this.currentid].style.width=Math.abs(_6f)+"px";
this.areas[this.currentid].style.height=Math.abs(_70)+"px";
this.areas[this.currentid].setAttribute("width",Math.abs(_6f));
this.areas[this.currentid].setAttribute("height",Math.abs(_70));
if(_6f<0){
this.areas[this.currentid].style.left=(x+1)+"px";
}
if(_70<0){
this.areas[this.currentid].style.top=(y+1)+"px";
}
}else{
if(this.is_drawing==this.DM_SQUARE_DRAW){
var _6f=x-this.memory[this.currentid].downx;
var _70=y-this.memory[this.currentid].downy;
var _71;
if(Math.abs(_6f)<Math.abs(_70)){
_71=Math.abs(_6f);
}else{
_71=Math.abs(_70);
}
this.areas[this.currentid].style.width=_71+"px";
this.areas[this.currentid].style.height=_71+"px";
this.areas[this.currentid].setAttribute("width",_71);
this.areas[this.currentid].setAttribute("height",_71);
if(_6f<0){
this.areas[this.currentid].style.left=(this.memory[this.currentid].downx+_71*-1)+"px";
}
if(_70<0){
this.areas[this.currentid].style.top=(this.memory[this.currentid].downy+_71*-1+1)+"px";
}
}else{
if(this.is_drawing==this.DM_POLYGON_DRAW){
this._polygongrow(this.areas[this.currentid],x,y);
}else{
if(this.is_drawing==this.DM_RECTANGLE_MOVE||this.is_drawing==this.DM_SQUARE_MOVE){
var x=x-this.memory[this.currentid].rdownx;
var y=y-this.memory[this.currentid].rdowny;
if(x+_6e>this.pic.width||y+_6d>this.pic.height){
return;
}
if(x<0||y<0){
return;
}
this.areas[this.currentid].style.left=x+1+"px";
this.areas[this.currentid].style.top=y+1+"px";
}else{
if(this.is_drawing==this.DM_POLYGON_MOVE){
var x=x-this.memory[this.currentid].rdownx;
var y=y-this.memory[this.currentid].rdowny;
if(x+_6e>this.pic.width||y+_6d>this.pic.height){
return;
}
if(x<0||y<0){
return;
}
var _6f=x-_6c;
var _70=y-top;
for(var i=0;i<this.areas[this.currentid].xpoints.length;i++){
this.areas[this.currentid].xpoints[i]=this.memory[this.currentid].xpoints[i]+_6f;
this.areas[this.currentid].ypoints[i]=this.memory[this.currentid].ypoints[i]+_70;
}
this.areas[this.currentid].style.left=x+1+"px";
this.areas[this.currentid].style.top=y+1+"px";
}else{
if(this.is_drawing==this.DM_SQUARE_RESIZE_LEFT){
var _71=x-_6c;
if((_6e+(-1*_71))>0){
this.areas[this.currentid].style.left=x+1+"px";
this.areas[this.currentid].style.top=(top+(_71/2))+"px";
this.areas[this.currentid].style.width=(_6e+(-1*_71))+"px";
this.areas[this.currentid].style.height=(_6d+(-1*_71))+"px";
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
var _71=x-_6c-_6e;
if((_6e+(_71))-1>0){
this.areas[this.currentid].style.top=(top+(-1*_71/2))+"px";
this.areas[this.currentid].style.width=(_6e+(_71))-1+"px";
this.areas[this.currentid].style.height=(_6d+(_71))+"px";
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
var _71=y-top;
if((_6e+(-1*_71))>0){
this.areas[this.currentid].style.top=y+1+"px";
this.areas[this.currentid].style.left=(_6c+(_71/2))+"px";
this.areas[this.currentid].style.width=(_6e+(-1*_71))+"px";
this.areas[this.currentid].style.height=(_6d+(-1*_71))+"px";
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
var _71=y-top-_6d;
if((_6e+(_71))-1>0){
this.areas[this.currentid].style.left=(_6c+(-1*_71/2))+"px";
this.areas[this.currentid].style.width=(_6e+(_71))-1+"px";
this.areas[this.currentid].style.height=(_6d+(_71))-1+"px";
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
var _6f=x-_6c;
if(_6e+(-1*_6f)>0){
this.areas[this.currentid].style.left=x+1+"px";
this.areas[this.currentid].style.width=_6e+(-1*_6f)+"px";
this.areas[this.currentid].setAttribute("width",parseInt(this.areas[this.currentid].style.width));
}else{
this.memory[this.currentid].width=0;
this.memory[this.currentid].left=x;
this.is_drawing=this.DM_RECTANGLE_RESIZE_RIGHT;
}
}else{
if(this.is_drawing==this.DM_RECTANGLE_RESIZE_RIGHT){
var _6f=x-_6c-_6e;
if((_6e+(_6f))-1>0){
this.areas[this.currentid].style.width=(_6e+(_6f))-1+"px";
this.areas[this.currentid].setAttribute("width",parseInt(this.areas[this.currentid].style.width));
}else{
this.memory[this.currentid].width=0;
this.memory[this.currentid].left=x;
this.is_drawing=this.DM_RECTANGLE_RESIZE_LEFT;
}
}else{
if(this.is_drawing==this.DM_RECTANGLE_RESIZE_TOP){
var _70=y-top;
if((_6d+(-1*_70))>0){
this.areas[this.currentid].style.top=y+1+"px";
this.areas[this.currentid].style.height=(_6d+(-1*_70))+"px";
this.areas[this.currentid].setAttribute("height",parseInt(this.areas[this.currentid].style.height));
}else{
this.memory[this.currentid].height=0;
this.memory[this.currentid].top=y;
this.is_drawing=this.DM_RECTANGLE_RESIZE_BOTTOM;
}
}else{
if(this.is_drawing==this.DM_RECTANGLE_RESIZE_BOTTOM){
var _70=y-top-_6d;
if((_6d+(_70))-1>0){
this.areas[this.currentid].style.height=(_6d+(_70))-1+"px";
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
imgmap.prototype.img_mousedown=function(e){
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
this.addNewArea();
return;
}
}else{
if(this.props[this.currentid].getElementsByTagName("select")[0].value=="polygon"){
if(this.areas[this.currentid].shape!=this.props[this.currentid].getElementsByTagName("select")[0].value){
this.initArea(this.currentid,"polygon");
}
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
if(this.props[this.currentid].getElementsByTagName("select")[0].value=="rectangle"){
if(this.areas[this.currentid].shape!=this.props[this.currentid].getElementsByTagName("select")[0].value){
this.initArea(this.currentid,"rectangle");
}
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
if(this.props[this.currentid].getElementsByTagName("select")[0].value=="circle"){
if(this.areas[this.currentid].shape!=this.props[this.currentid].getElementsByTagName("select")[0].value){
this.initArea(this.currentid,"circle");
}
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
imgmap.prototype.form_selectRow=function(id,_80){
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
document.getElementById("img_active_"+id).checked=1;
if(_80){
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
var _87=this.html_container.getAttribute("oldvalue");
if(_87!=this.html_container.value){
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
if(obj.tagName=="image"||obj.tagName=="group"||obj.tagName=="shape"||obj.tagName=="stroke"){
obj=obj.parentNode.parentNode;
}
var _8b=(window.event)?(window.event.offsetX):(e.layerX);
var _8c=(window.event)?(window.event.offsetY):(e.layerY);
if(_8b<10&&_8c<10){
obj.style.cursor="move";
}else{
if(_8b<6&&_8c>6){
if(obj.shape!="polygon"){
obj.style.cursor="w-resize";
}
}else{
if(_8b>parseInt(obj.style.width)-6&&_8c>6){
if(obj.shape!="polygon"){
obj.style.cursor="e-resize";
}
}else{
if(_8b>6&&_8c<6){
if(obj.shape!="polygon"){
obj.style.cursor="n-resize";
}
}else{
if(_8c>parseInt(obj.style.height)-6&&_8b>6){
if(obj.shape!="polygon"){
obj.style.cursor="s-resize";
}
}else{
obj.style.cursor="move";
}
}
}
}
}
}else{
this.img_mousemove(e);
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
var _8f=(window.event)?(window.event.offsetX):(e.layerX);
var _90=(window.event)?(window.event.offsetY):(e.layerY);
if(_8f<6&&_90>6){
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
if(_8f>parseInt(this.areas[this.currentid].style.width)-6&&_90>6){
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
if(_8f>6&&_90<6){
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
if(_90>parseInt(this.areas[this.currentid].style.height)-6&&_8f>6){
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
this.memory[this.currentid].rdownx=_8f;
this.memory[this.currentid].rdowny=_90;
}else{
if(this.areas[this.currentid].shape=="rectangle"){
this.is_drawing=this.DM_RECTANGLE_MOVE;
this.statusMessage(this.strings["RECTANGLE_MOVE"]);
this.areas[this.currentid].style.borderColor=this.config.CL_DRAW_SHAPE;
this.memory[this.currentid].rdownx=_8f;
this.memory[this.currentid].rdowny=_90;
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
this.memory[this.currentid].rdownx=_8f;
this.memory[this.currentid].rdowny=_90;
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
imgmap.prototype.setSelectionRange=function(obj,_95,end){
if(typeof end=="undefined"){
end=_95;
}
if(obj.selectionStart){
obj.setSelectionRange(_95,end);
obj.focus();
}else{
if(document.selection){
var _97=obj.createTextRange();
_97.collapse(true);
_97.moveStart("character",_95);
_97.moveEnd("character",end-_95);
_97.select();
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
var _9b=obj.value;
_9b=_9b.split(",");
var s=this.getSelectionStart(obj);
var j=0;
for(var i=0;i<_9b.length;i++){
j+=_9b[i].length;
if(j>s){
if(key==40&&_9b[i]>0){
_9b[i]--;
}
if(key==38){
_9b[i]++;
}
this._recalculate(this.currentid);
break;
}
j++;
}
obj.value=_9b.join(",");
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
imgmap.prototype._getPos=function(_a3){
var _a4=0;
var _a5=0;
if(_a3){
var _a6=_a3.offsetParent;
if(_a6){
while((_a6=_a3.offsetParent)!=null){
_a4+=_a3.offsetLeft;
_a5+=_a3.offsetTop;
_a3=_a6;
}
}else{
_a4=_a3.offsetLeft;
_a5=_a3.offsetTop;
}
}
return new Object({x:_a4,y:_a5});
};
imgmap.prototype._getLastArea=function(){
for(var i=this.areas.length-1;i>=0;i--){
if(this.areas[i]){
return this.areas[i];
}
}
return null;
};
imgmap.prototype.toClipBoard=function(_a8){
if(typeof _a8=="undefined"){
_a8=this.getMapHTML();
}
try{
if(window.clipboardData){
window.clipboardData.setData("Text",_a8);
}else{
if(window.netscape){
netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
var str=Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
if(!str){
return false;
}
str.data=_a8;
var _aa=Components.classes["@mozilla.org/widget/transferable;1"].createInstance(Components.interfaces.nsITransferable);
if(!_aa){
return false;
}
_aa.addDataFlavor("text/unicode");
_aa.setTransferData("text/unicode",str,_a8.length*2);
var _ab=Components.interfaces.nsIClipboard;
var _ac=Components.classes["@mozilla.org/widget/clipboard;1"].getService(_ab);
if(!_ac){
return false;
}
_ac.setData(_aa,null,_ab.kGlobalClipboard);
}
}
}
catch(err){
this.log("Unable to set clipboard data",1);
}
};
imgmap.prototype.assignCSS=function(obj,_ae){
var _af=_ae.split(";");
for(var i=0;i<_af.length;i++){
var p=_af[i].split(":");
var pp=p[0].trim().split("-");
var _b3=pp[0];
for(var j=1;j<pp.length;j++){
_b3+=pp[j].replace(/^./,pp[j].substring(0,1).toUpperCase());
}
_b3=_b3.trim();
eval("obj.style."+_b3+" = '"+p[1]+"';");
}
};
Function.prototype.bind=function(_b5){
var _b6=this;
return function(){
return _b6.apply(_b5,arguments);
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
function imgmap_spawnObjects(_b7){
var _b8=document.getElementsByTagName("map");
var _b9=document.getElementsByTagName("img");
var _ba=new Array();
for(var i=0;i<_b8.length;i++){
for(var j=0;j<_b9.length;j++){
if("#"+_b8[i].name==_b9[j].getAttribute("usemap")){
_b7.mode="";
imapn=new imgmap(_b7);
imapn.useImage(_b9[j]);
imapn.setMapHTML(_b8[i]);
imapn.viewmode=1;
_ba.push(imapn);
}
}
}
}

