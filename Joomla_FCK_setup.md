# Introduction #

You can get FCKeditor working with Joomla by downloading [Joomla FCKEditor plugin](http://www.joomlafckeditor.com/downloads).
Steps below tested with Joomla 1.5.12 and JoomlaFCK 2.6.4.1.


# Details #

  1. Install imgmap plugin into `{joomla}\plugins\editors\fckeditor\editor\plugins\imgmap\`
  1. In `{joomla}\plugins\editors\fckeditor\fckconfig.js` somewhere at the end of the file add:
```
FCKConfig.Plugins.Add( 'imgmap', 'en') ;
```
  1. In `{joomla}\plugins\editors\fckeditor\editor\jtoolbarsetconfig.xml` you will find the toolbar sets (Advanced/Creative/Blog/Default). Locate
```
<plugin name="Image" acl="*"/>
```
> in the toolbarset you want to use, and add:
```
<plugin name="imgmapPopup" acl="*"/>
```

**Finally** Clear your browser cache and launch article editor. You should see the imgmap icon next to the image icon. (Note: in case of the default Office2007 skin you only see a missing icon, this will be fixed in the next release)