# UB Heidelberg Annotationen Frontend

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

[TODO see top level README for API]
