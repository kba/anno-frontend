# UB Heidelberg Annotationen Frontend

## Structure of the application

All assets are bundled into a JS file `ubhd-anno.js`

Loading `ubhd-anno.js` binds a class `UBHDAnnoApp` to `window`.

`UBHDAnnoApp` can be instantiated to an object `app` with a set of [config options](#config-options).

`app` has a method 

App is a Vue app, component structure:

* `AnnoApp`
  * `EditorModal`
    * `ZoneEditor`
    * `HtmlEditor`
  * `Sidebar`
    * `SidebarThread`
      * `SidebarPost`

## Building - Set up Repository

Clone the repository and initialize submodules.

```sh
git clone git@gitlab.ub.uni-heidelberg.de:Webservices/AnnotationService.git
cd AnnotationService
git submodule init
```

## Building - Required Software

You'll need nodejs/npm.

For development:

```sh
make build    # npm install && webpack
```

This will bundle all the assets (JS, fonts, images, CSS) into a single JS file in the `dist` folder.

To update assets continuously whenever files change:

```sh
make watch    # webpack --watch
```

To build a production version of the script, set the `NODE_ENV` environment variable to `production`, e.g.

```
NODE_ENV=production make build
# or
make build NODE_ENV=production
# or
NODE_ENV=production webpack
```

## Using - HTML Snippets

```html
    <script src="http://anno.ub.uni-heidelberg.de/dist/ubhd-anno.js" type="text/javascript"></script> 
```

## Using - On serv7 / ubhd3 template

Just the idea, actual code is more involved.

```
var projectname = '[% sdhr.projectname %]';
var pagename = '[% IF sdhr.phy_page_full %][% sdhr.phy_page_full %][% ELSE %]0000[% END %]';
var digipath = '[% sdhr.path %]';
var annoid = '[% annoid %]';
var iiif = '[% IF meta.no_oai %]0[% ELSE %]1[% END %]';
var img_zoomst = {/*...*/};
var u = img_zoomst[projectname + '_' + pagename][img_zoomst[projectname + '_' + pagename].length - 1]['url'].split('/');
var iiif_url = 'http://diglit.ub.uni-heidelberg.de/image/' + projectname + '/' + u[u.length - 1] + '/';
displayAnnotations(
    'annotationsblock',
    '/'+projectname+'/'+pagename,
    {
        service: 'diglit',
        lang: '[% sdhr.ui_lang %]',
        purl: 'http://digi.ub.uni-heidelberg.de/'+digipath+'/'+projectname+'/'+pagename,
        css: 'anno',
        highlight: 'annohighlight',
        login: 'http://digi.ub.uni-heidelberg.de/cgi-bin/login?sid=[% sdhr.sid %]',
        readtoken: '[% sdhr.anno_token_read %]',
        writetoken: '[% sdhr.anno_token_write %]',
        edit_img_url: img_zoomst['[% sdhr.projectname %]_[% sdhr.phy_page_full %]'][0].url,
        edit_img_width: img_zoomst['[% sdhr.projectname %]_[% sdhr.phy_page_full %]'][0].width,
        edit_img_thumb: '/'+digipath+'/'+projectname+'/'+pagename+'/_thumb_image',
        iiif_url: iiif_url,
        iiif_img_width: img_zoomst[projectname + '_' + pagename][img_zoomst[projectname + '_' + pagename].length - 1]['width'],
        iiif_img_height: img_zoomst[projectname + '_' + pagename][img_zoomst[projectname + '_' + pagename].length - 1]['height'],
        gotopurl: annoid
    })
```

```js
displayAnnotations(htmlid, annotarget, options)
```

* htmlid: ID des HTML-Elements, in dem die Liste der Annotationen ausgegeben werden soll
* target: ID des Annotationen-Targets, für das die zugehörigen Annotationen ausgegeben werden soll
* options:
 * `service`: Dienst, für den die Annotationen verwaltet werden (z.B. "diglit", zukünftig mit zu target)
 * `css`: Präfix für verwendete CSS-Klassen und IDs
 * `sort`: Sortierung: date, datereverse, title
 * `lang`: Sprache: de, en
 * `no_oai`: Keine Ausgabe von IIIF-URLs (ggf. umbenennen)
 * `edit_img_url`: Editor: URL zu Image, für das Polygone erstellt werden
 * `edit_img_width`: Editor: Breite des Images, für das Zonen erstellt werden, in Pixel
 * `edit_img_thumb`: Editor: URL zu Thumb-Image (Orientierungsthumb im Editor)
 * `highlight`: Callback Funktion für das Highlighting der Zonen
 * `iiif_url`: URL-Anfang für die IIIF-URL (Zonenausschnitt)
 * `iiif_img_width`: TODO: raus aus Optionen, muss automatisch ermittelt werden (Zones)
 * `iiif_img_height`: TODO: raus aus Optionen, muss automatisch ermittelt werden (Zones)
 * `gotopurl`: ID der Annotation, die hervorgehoben werden soll, weil der Dienst über die persistente URL der Annotatione aufgerufen wurde
 * `purl`: URL-Anfang für die persistenten URLs zu der Annotationen
 * `login`: URL für Login-Button in Annotationenanzeige
 * `readtoken`: Read-Token für Annotationenservice
 * `writetoken`: Write-Token für Annotationenservice

<!-- BEGIN-RENDER ./src/display-annotations.js -->

### `displayAnnotations(options)`

- takes the initial state of the Vue store
- dispatches a `fetchList` action to retrieve all anotations that match
  `{$target:options.targetSource}` and the resp. permissions
- starts a Vue App with a single `<anno-sidebar>`

```js
@param Object options
@param DOMElement options.el Element to hold the annotation sidebar/modal
@param String targetSource The target of the annotation. Defaults to `window.location.href`
@param String targetImage The image if any, to annotate on this page
@param String targetThumbnail Thumbnail view of the image. Defaults to `options.targetImage`
@param Object annotationList Options for the list display
@param String annotationList.sortedBy     Sort key: `date`, `datereverse` or `title`
@param String annotationList.allCollapsed Collapse (`true`) or expand (`false`) all annotations
```

<!-- END-RENDER -->


## Demo

### Standalone
http://anno.ub.uni-heidelberg.de/demo.html

### Integration in DWork

http://digi.ub.uni-heidelberg.de/diglit/annotationen_test/0002?template=ubhd3
