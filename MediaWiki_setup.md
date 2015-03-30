Everything below was tested against:
  * MediaWiki 1.14.0
  * Extension:Imagemap latest as of 26/04/2009
  * Extension:FCKeditor latest as of 26/04/2009
  * FCKeditor 2.6.4
  * imgmap latest SVN version (you have to check out from the repository)

# Introduction #

MediaWiki by default comes with a wiki text editor, and no image map support.
Once you install the [wiki imagemap plugin](http://www.mediawiki.org/wiki/Extension:ImageMap), you will be able to add image maps, however editing these will require lot of manual work.
You can have a visual image map editor, if you also install the [FCKeditor extension](http://mediawiki.fckeditor.net/index.php/FCKeditor_integration_guide) along with imgmap plugin, and tweak it a bit to play nicely with imgmap extension and mediawiki. Read on for the steps required.

# Installing ImageMap wiki extension #

Read the instructions carefully here:
http://www.mediawiki.org/wiki/Extension:ImageMap
Once you installed, test the extension.


# Installing FCKEditor #

Read the instructions here:
http://mediawiki.fckeditor.net/index.php/FCKeditor_integration_guide
Once installed, test your new editor.

## Note ##

Older FCKeditors need a patch, otherwise they will not accept 

&lt;imagemap&gt;

 tags. Patch and details can be found [here](http://dev.fckeditor.net/ticket/2432).

# Installing imgmap plugin for FCKEditor #

Put the imgmap plugin at place, general instructions at [FCKEditor\_setup](FCKEditor_setup.md), the only difference is that:
  * You have to copy the plugin to the {yourwiki}/extensions/FCKeditor/plugins/imgmap directory
  * You have to edit {yourwiki}/extensions/FCKeditor/fckeditor\_config.js to add the plugin and to add the toolbar button

# Patching FCK #

You will need to patch two files:
  1. FCKeditorParser.body.php, around line 239, add
```
                    case 'imagemap':
                        $imagelink = substr($content,strpos($content,"Image:")+6,strpos($content,".")-strpos($content,"Image:")-6+4);
                        $url = wfSajaxGetImageUrl($imagelink);
                        $output = '<img _fck_mw_filename="'.$imagelink.'" _sik_img_map="'.str_replace("\n","",substr($content,strpos($content,".")+5)).'" src="'.$url.'" />';//evtl auch +5 da noch ein Leerzeichen vorweg kommt
                        break;
```
  1. plugins/mediawiki/fckplugin.js, around line 552, replace:
```
				case 'img' :
                                //added code here for imgmap. HARMMA.
                                var imgmap = htmlNode.getAttribute( '_sik_img_map' );
                                var bImgmap = false;

                                if ( imgmap && imgmap.length > 0 ){
                                    bImgmap = true;
                                }
							var formula = htmlNode.getAttribute( '_fck_mw_math' ) ;

                                if ( formula && formula.length > 0 ){
								stringBuilder.push( '<math>' ) ;
								stringBuilder.push( formula ) ;
								stringBuilder.push( '</math>' ) ;
								return ;
							}

							var imgName		= htmlNode.getAttribute( '_fck_mw_filename' ) ;
							var imgCaption	= htmlNode.getAttribute( 'alt' ) || '' ;
							var imgType		= htmlNode.getAttribute( '_fck_mw_type' ) || '' ;
							var imgLocation	= htmlNode.getAttribute( '_fck_mw_location' ) || '' ;
							var imgWidth	= htmlNode.getAttribute( '_fck_mw_width' ) || '' ;
							var imgHeight	= htmlNode.getAttribute( '_fck_mw_height' ) || '' ;
							var imgStyleWidth	= ( parseInt(htmlNode.style.width) || '' ) + '' ;
							var imgStyleHeight	= ( parseInt(htmlNode.style.height) || '' ) + '' ;
							var imgRealWidth	= ( htmlNode.getAttribute( 'width' ) || '' ) + '' ;
							var imgRealHeight	= ( htmlNode.getAttribute( 'height' ) || '' ) + '' ;

                                if (bImgmap){
                                    stringBuilder.push ('<imagemap>\n');
                                    stringBuilder.push ('Image:');
                                }
                                else {
                                    stringBuilder.push( '[[Image:' );
                                }

                                stringBuilder.push( imgName );
							if ( imgStyleWidth.length > 0 )
								imgWidth = imgStyleWidth ;
							else if ( imgWidth.length > 0 && imgRealWidth.length > 0 )
								imgWidth = imgRealWidth ;

                                if (!bImgmap){
							if ( imgStyleHeight.length > 0 )
								imgHeight = imgStyleHeight ;
							else if ( imgHeight.length > 0 && imgRealHeight.length > 0 )
								imgHeight = imgRealHeight ;

							if ( imgType.length > 0 )
								stringBuilder.push( '|' + imgType ) ;

							if ( imgLocation.length > 0 )
								stringBuilder.push( '|' + imgLocation ) ;

							if ( imgWidth.length > 0 )
							{
								stringBuilder.push( '|' + imgWidth ) ;

								if ( imgHeight.length > 0 )
									stringBuilder.push( 'x' + imgHeight ) ;

								stringBuilder.push( 'px' ) ;
							}

							if ( imgCaption.length > 0 )
								stringBuilder.push( '|' + imgCaption ) ;
                                    stringBuilder.push( ']]' );
                                }
                                else {
                                    stringBuilder.push('\n');
                                    stringBuilder.push(imgmap.split("]]").join("]]\n"));
                                    stringBuilder.push('</imagemap>');
                                }
				break ;
```
# Final steps #

Clear your browser cache, and try your editor. Note: the patched functionality differs form the original Extension:ImageMap functionality. You will always see your image, even when it has an imagemap associated.


# Credits #

Big thanks for Bjoern Schroeder, for the improvement of the plugin to work with MediaWiki!

