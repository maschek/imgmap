# Introduction #

Adding tinymce to your project is easy using maven.  Javascript dependencies are completely possible and a snap to reference from your application using the [Maven-JSTools-Plugin](http://dev.abiss.gr/mvn-jstools/).  Once the JSTools plugin is set up, simply add the imgmap repository and the appropriate imgmap dependency.

**Note, just the imgmap plugin is available currently.**

# Details #

### JSTools Plugin ###
Install and set up JSTools Plugin: [Setup](http://dev.abiss.gr/mvn-jstools/usage.html)

pom.xml:
```
<dependency>  
   <groupId>gr.abiss.mvn.plugins</groupId>  
   <artifactId>maven-jstools-plugin</artifactId>  
   <version>0.6</version>  
   <exclusions>  
      <exclusion>  
      <groupId>rhino</groupId>  
      <artifactId>js</artifactId>  
   </exclusion> 
</dependency>  
```


web.xml:
```
 <!-- Maven Javascript dependency provider -->

<filter> 
   <filter-name>javascriptDependencyFilter</filter-name>
   <filter-class>gr.abiss.mvn.plugins.jstools.web.JavascriptDependencyFilter</filter-class>

   <init-param>
      <param-name>allowedExtentions</param-name>
      <param-value>js png jpg gif txt html htm xml xsl xslt svg svgz swf css</param-value>
   </init-param>

   <init-param>
      <param-name>basePath</param-name>
      <param-value>/lib/js/</param-value>
   </init-param>
</filter>

<filter-mapping>
   <filter-name>javascriptDependencyFilter</filter-name>
      <url-pattern>/lib/js/*</url-pattern>
</filter-mapping>
```


### Repository ###
Add the imgmap repository:

pom.xml:
```
<repository>
   <id>imgmap</id>
   <url>http://imgmap.googlecode.com/svn/repo/</url>
</repository>
```

### Dependency ###
Add the imgmap-tinymce-plugin dependency:

pom.xml:
```
<dependency>
   <groupId>org.imgmap</groupId>
   <artifactId>imgmap-tinymce-plugin</artifactId>
   <version>2.2</version>
</dependency>
```

### Javascript usage ###
Then use tinymce with the imgmap plugin as follows:

tinymce.html:
```
<script type="text/javascript" src="lib/js/com/moxiecode/tinymce/tiny_mce.js"></script>

<script language="javascript" type="text/javascript">
	tinyMCE.init({
    
     plugins : "imgmap,safari,spellchecker ... ",

     // Theme options
     theme_advanced_buttons1 : "imgmap,save,newdocument, ... ",
    }); 
</script>

<textarea  tag="textarea" >
</textarea>
```
See [TinyMCE\_setup](TinyMCE_setup.md) for more details on tinymce setup