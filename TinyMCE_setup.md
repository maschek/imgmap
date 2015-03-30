# TinyMCE 2.x and 3.x #

  1. for TinyMCE 2.x copy files from plugin\_tinymce{x}.zip to {yourtinyinstance}/plugins/imgmap/
  1. for TinyMCE 3.x copy files from plugin\_tinymce3.{x}.zip to {yourtinyinstance}/plugins/imgmap/
  1. set up your instance in the tinyMCE.init() method to use the plugin, like:
> > `plugins : "table,save,advhr,advimage,imgmap,...",`
  1. set up your instance to use the imgmap button, for example:
> > `theme_advanced_buttons3_add : "emotions,iespell,...,imgmap",`
  1. you will most likely need to add:
> > `extended_valid_elements: "img[usemap|class|src|border=0|alt|title|hspace|vspace|width|height|align|onmouseover|onmouseout|name],map[id|name],area[shape|alt|coords|href|target]",`

Notes:
  * You may only add extra buttons to your tiny instance if you are using the advanced theme
  * In some cases TinyMCE includes editor\_plugin\_src.js instead of editor\_plugin.js. Since this file was not part of some earlier versions, you can simply copy editor\_plugin.js as editor\_plugin\_src.js in your plugin directory.
  * Please do NOT use the files copied from the examples/ directory, use the plugin\_tinymce{x}.zip files for deployment, where {x} marks the imgmap build number.