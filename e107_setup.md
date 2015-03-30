# Introduction #

Everything below was tried out with e107 version 0.7.11.
By default e107 uses bbcode editor, so first you have to activate the built in TinyMCE. Go to Settings/Preferences/Text rendering and turn on "Enable WYSIWYG textareas".
It uses TinyMCE 2.x so the basics are the same as for the [TinyMCE\_setup](TinyMCE_setup.md).


# Details #

  1. copy files from plugin\_tinymce{x}.zip to {yourinstance}/e107\_handlers/tiny\_mce/plugins/imgmap/
  1. edit {yourinstance}/e107\_handlers/tiny\_mce/wysiwyg.php, add lines:
```
$text .= ",iespell,zoom,media";//this is original
$text .= ",imgmap";//you need to add this

and

$text .= ",charmap,iespell,media";//this is original
$text .= ",imgmap";//you need to add this

search for 'extended_valid_elements', and add:

img[usemap|class|src|border=0|alt|title|hspace|vspace|width|height|align|onmouseover|onmouseout|name],map[id|name],area[shape|alt|coords|href|target]



```
  1. go to news editor, click on any image, and notice the button highlighted on the toolbar, you are done:)