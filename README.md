# Dienstübergreifender Annotationen-Service 

Basiert auf Web Annotation Data Model (https://www.w3.org/TR/annotation-model/)

## Aufruf

Benötigt jQuery ab Version 1.11

Außerdem:

```html
<script type="text/javascript" src="http://anno.ub.uni-heidelberg.de/js/vue.js"></script>                                                                
<script type="text/javascript" src="http://anno.ub.uni-heidelberg.de/js/annotations.js"></script>                                                        
<script type="text/javascript" src="http://anno.ub.uni-heidelberg.de/js/js.cookie-2.1.2.min.js"></script>                                                
<link href="http://anno.ub.uni-heidelberg.de/js/bootstrap-3.2.0/dist/css/bootstrap.min.css" rel="stylesheet" type="text/css">                            
<script type="text/javascript" src="http://anno.ub.uni-heidelberg.de/js/bootstrap-3.2.0/dist/js/bootstrap.min.js"></script>                              
<link href="http://anno.ub.uni-heidelberg.de/js/font-awesome-4.5.0/css/font-awesome.min.css" rel="stylesheet" type="text/css">                           
<link href="http://anno.ub.uni-heidelberg.de/css/annotations.css" rel="stylesheet" type="text/css">                                                      
```

nur für Editor:

```html
<script type="text/javascript" src="http://anno.ub.uni-heidelberg.de/js/tinymce/tinymce.min.js"></script>
```

```js
displayAnnotations(htmlid, annotarget, options)
```

* htmlid: ID des HTML-Elements, in dem die Liste der Annotationen ausgegeben werden soll
* target: ID des Annotationen-Targets, für das die zugehörigen Annotationen ausgegeben werden soll
* options:
 * service:
 * css:
 * sort:
 * lang:
 * no_oai:
** edit_img_url:
** edit_img_width:
** edit_img_thumb:
** highlight:
** iiif_url:
** iiif_img_width:
** iiif_img_height:
** gotopurl: 
** purl:
** login:
** readtoken:
** writetoken:


## Demo

### Standalone
http://anno.ub.uni-heidelberg.de/demo.html

### Integration in DWork

http://digi.ub.uni-heidelberg.de/diglit/annotationen_test/0002?template=ubhd3
