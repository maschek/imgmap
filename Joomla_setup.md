# Introduction #

Everything below was tried out with Joomla 1.5.4. By default Joomla uses TinyMCE 2.x so the basics are the same as for the [TinyMCE\_setup](TinyMCE_setup.md).

UPDATE: Newer Joomla use TinyMCE 3.x and the installation is much simpler. Read steps below.

Joomla can also work with FCKeditor, please read [Joomla\_FCK\_setup](Joomla_FCK_setup.md).


# Details #

## Joomla 1.7 as reported by veldjmaxis, Oct 13, 2011 ##


  1. Copy folder "imgmap" to "JOOMLA\_FOLDER/media/editors/tinymce/jscripts/tiny\_mce/plugins/"
  1. Open tinymce.php from "JOOMLA\_FOLDER/plugins/editors/tinymce/"
  1. Find line:
```
    // advimage $advimage = $this->params->def('advimage', 1); 

    if ($advimage) {

        $plugins	= 'advimage'; $elements	= 'img[class|src|border=0|alt|title|hspace|vspace|width|height|align|onmouseover|onmouseout|name|style]'; 

    } 
```
  1. After that add:
```
    // imgmap $imgmap = $this->params->def('imgmap', 1); 

    if ($imgmap) {

        $plugins	= 'imgmap'; $elements	= 'img[usemap|class|src|border=0|alt|title|hspace|vspace|width|height|align|onmouseover|onmouseout|name],map[id|name],area[shape|alt|coords|href|target]'; $buttons4	= 'imgmap'; 

}
```
  1. Save file. Now Imgmap will work with tinymce in JOOMLA 1.7


## New Joomla (Version 1.5.12 for example) ##

  1. copy files from plugin\_tinymce3{x}.zip to {yourjoomlainstance}/plugins/editors/tinymce/jscripts/tiny\_mce/plugins/imgmap/
  1. go to Joomla admin/Plugin manager/Editor - TinyMCE/Advanced Parameters, and enter `imgmap` in both Custom plugin and Custom button input fields. Make sure functionality parameter is set to extended.
  1. Launch up your article editor, and you are ready to use the plugin.



## Older Joomla (Version 1.5.4 for example) ##

  1. copy files from plugin\_tinymce{x}.zip to {yourjoomlainstance}/plugins/editors/tinymce/jscripts/tiny\_mce/plugins/imgmap/
  1. edit {yourjoomlainstance}/plugins/editors/tinymce.xml, after 'directionality' add lines:
```
 		<param name="imgmap" type="radio" default="1" label="Imagemap" description="Imagemap">
 			<option value="0">Hide</option>
 			<option value="1">Show</option>
 		</param>
```
  1. edit {yourjoomlainstance}/plugins/editors/tinymce.php, after 'XHTMLxtras' add lines:
```
		$imgmap			= $this->params->def( 'imgmap', 0 );
		if ( $imgmap ) {
			$plugins[]	= 'imgmap';
			$buttons3[]	= 'imgmap';
			$elements[]	= 'img[usemap|class|src|border=0|alt|title|hspace|vspace|width|height|align|onmouseover|onmouseout|name],map[id|name],area[shape|alt|coords|href|target]';
		}
```
  1. go to Joomla admin/Plugin manager/Editor - TinyMCE 2.0/Advanced Parameters, and make sure Imagemap is set to Show.
  1. go to article editor, click on any image, and notice the button highlighted on the toolbar, you are done:)