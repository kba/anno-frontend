# UB Heidelberg Annotationen Frontend

## Building - Required Software

* npm
* GNU make

```
make clean deps
```

will load the required assets from npmjs and store them in `./deps` for easy integration.

## Using - HTML Snippets

```html
    <!-- Omit this one if jQuery is already loaded in the page -->
    <script src="http://anno.ub.uni-heidelberg.de/deps/jquery.js" type="text/javascript"></script> 

    <script src="http://anno.ub.uni-heidelberg.de/deps/vue.js" type="text/javascript"></script>
    <script src="http://anno.ub.uni-heidelberg.de/deps/js.cookie.js" type="text/javascript"></script>
    <script src="http://anno.ub.uni-heidelberg.de/deps/tinymce/tinymce.min.js" type="text/javascript"></script>
    <script src="http://anno.ub.uni-heidelberg.de/deps/bootstrap/js/bootstrap.min.js" type="text/javascript"></script>
    <script src="http://anno.ub.uni-heidelberg.de/js/annotations.js" type="text/javascript"></script>

    <link href="http://anno.ub.uni-heidelberg.de/deps/bootstrap/css/bootstrap.min.css" rel="stylesheet" type="text/css">
    <link href="http://anno.ub.uni-heidelberg.de/deps/font-awesome/css/font-awesome.min.css" rel="stylesheet" type="text/css">
    <link href="http://anno.ub.uni-heidelberg.de/css/annotations.css" rel="stylesheet" type="text/css">
```

nur für Editor:

```html
    <script src="http://anno.ub.uni-heidelberg.de/deps/tinymce/tinymce.min.js" type="text/javascript"></script>
    <script src="http://anno.ub.uni-heidelberg.de/js/tinymce-lang-de.js" type="text/javascript"></script>
```

```js
displayAnnotations(htmlid, annotarget, options)
```

* htmlid: ID des HTML-Elements, in dem die Liste der Annotationen ausgegeben werden soll
* target: ID des Annotationen-Targets, für das die zugehörigen Annotationen ausgegeben werden soll
* options:
