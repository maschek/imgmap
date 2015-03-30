# How to reload and edit existing maps? #

Often you want to save your created maps in a database, then load it back and be able to edit it again.
Imgmap can do this quite easily.

After initializing the map object, you simply have to call:
```

// your existing map code
var mapcode = '<map id="imgmap201212285935" name="imgmap201212285935"><area shape="rect" alt="" title="" coords="234,208,318,271" href="" target="" /><area shape="rect" alt="" title="" coords="125,81,205,164" href="" target="" /><area shape="rect" alt="" title="" coords="187,30,283,76" href="" target="" /><!-- Created by Online Image Map Editor (http://www.maschek.hu/imagemap/index) --></map>';

// your existing image
var imgurl  = 'http://wisefoodstorage.com/media/wysiwyg/max.jpg';

myimgmap.loadImage(imgurl);
myimgmap.setMapHTML(mapcode);


```

Notes:
  * you have to call loadImage() BEFORE setMapHTML(), because loadImage() initializes and clears existing maps
  * setMapHTML supports ONLY <map style imagemap. CSS style for example is not supported
  * How you get the image url and the <map code in your javascript variables is up to you. You can write them there with your backend code (PHP for example), or you can load them via AJAX