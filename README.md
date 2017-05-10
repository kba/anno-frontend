# UB Heidelberg Annotationen Frontend

<!-- BEGIN-MARKDOWN-TOC -->
* [Demo](#demo)
* [Usage](#usage)
	* [`displayAnnotations(options)`](#displayannotationsoptions)
		* [Options](#options)
		* [Events](#events)
	* [Structure of the application](#structure-of-the-application)
	* [Integration into serv7](#integration-into-serv7)
* [Development](#development)
	* [Prerequisites](#prerequisites)
	* [Building the development bundle](#building-the-development-bundle)
	* [Building for deployment](#building-for-deployment)
* [Javascript API ](#javascript-api-)
* [Components](#components)
	* [anno-editor](#anno-editor)
	* [anno-list](#anno-list)
		* [Events](#events-1)
		* [Methods](#methods)
			* [`collapseAll(state)`](#collapseallstate)
	* [anno-viewer](#anno-viewer)
		* [Props](#props)
		* [Events](#events-2)
	* [bootstrap-button](#bootstrap-button)
		* [Properties](#properties)
	* [html-editor](#html-editor)
	* [semtags-editor](#semtags-editor)
	* [tags-editor](#tags-editor)
* [Mixins](#mixins)
	* [`this.api`](#thisapi)
	* [`this.$auth(cond, id)`](#thisauthcond-id)
	* [`this.l10n(text)`](#thisl10ntext)
	* [`this.prefix`](#thisprefix)

<!-- END-MARKDOWN-TOC -->

## Demo

* Standalone: http://anno.ub.uni-heidelberg.de/demo.html
* Integration in DWork: http://digi.ub.uni-heidelberg.de/diglit/annotationen_test/0002?template=ubhd3






## Usage

<!-- BEGIN-RENDER ./src/display-annotations.js -->
### `displayAnnotations(options)`
1) takes the initial state of the Vue store
2) dispatches a `fetchToken` action to retrieve the token from localStorage
   or via HTTP GET to `tokenEndpoint` or fail and force login if clicked, not
   otherwise
3) dispatches a `fetchList` action to retrieve all anotations that match
   `{$target:options.targetSource}`
4) dispatches a `fetchAcl` action to retrieve the resp. permissions
5) starts a Vue App with a single [`<sidebar-app>`](#sidebar-app)
6) Returns the Vue.App which should be kept around (e.g. as window.annoapp)
   and on whose `eventBus` listeners can be added `$on` and which can emit
   events with `$emit`
#### Options
- `container`: Container element to hold the annotation sidebar/modal
- `language`: Language for l10n. Currently: `en`/`eng` or `de`/`deu` (Default)
- `targetSource`: The target of the annotation. Defaults to `window.location.href`
- `targetImage`: The image if any, to annotate on this page
- `targetThumbnail`: Thumbnail view of the image. Defaults to `options.targetImage`
- `annotationList`: Options for the list display
  - `sortedBy`:     Sort key: `date`, `datereverse` or `title`
  - `allCollapsed`: Collapse (`true`) or expand (`false`) all annotations
- `purlTemplate` A string template for the persistent URL. `{{ slug }}` will
  be replaced by the slug of the annotation
- `purlId` Annotation ID of the persistent URL. Should begin with the URL of `annoEndpoint`
- `token`: Function or token. The literal token. Don't use this option
  without SSL/TLS encryption. Function must be synchronous.
- `tokenEndpoint`: URL of the endpoint providing the JSON Webtoken
- `annoEndpoint`: URL of the Open Annotation Protocol server
- `loginEndpoint`: Function or URL of the login mask
- `logoutEndpoint`: Function or URL that logs the user out
- `isLoggedIn`: Function or boolean to designate whether the user is already
  logged in. No login button will be shown in that case, token will still be
  retrieved unless found
#### Events
Either listen/emit via app.eventBus and/or provide listeners as `events` option
- `startHighlighting(annoId)`: $emit this to highlight the annotation
- `stopHighlighting(annoId)`: $emit this to un-highlight the annotation 
- `mouseover(annoId)`: $on this to catch when an annotation is hovered in the list
- `mouseleave(annoId)`: $on this to catch when an annotation is un-hovered in the list
- `fetched(annotationList)`: List of annotations has been fetched from the server

<!-- END-RENDER -->

### Structure of the application

All assets are bundled into a JS file `ubhd-anno.js`

Loading `ubhd-anno.js` binds a class `UBHDAnnoApp` to `window`.

`UBHDAnnoApp` can be instantiated to an object `app` with a set of [config options](#config-options).

`app` has a method 

App is a Vue app, component structure:

* `Sidebar`
  * `AnnoList`
    * ... `AnnoViewer`
  * `AnnoEditorModal`
    * `AnnoEditor`
      * `HtmlEditor`
      * `ZoneEditor`
      * `TagsEditor`
      * `SemtagsEditor`
      * `Preview`

### Integration into serv7

```js
$(function() {
  const base = `http://digi.ub.uni-heidelberg.de`
  const targetImage = img_zoomst[`${projectname}_${pagename}`][0].url
  const targetSource = `${base}/${digipath}/${projectname}/${pagename}`
  const targetThumbnail = `${targetSource}/_thumb_image`
  window.annoapp = displayAnnotations({

    // Metadata
    targetSource,
    targetImage,
    targetThumbnail,

    // Language
    language: lang,

    // Determine login & such
    annoEndpoint:  'http://serv42.ub.uni-heidelberg.de/kba/anno',
    tokenEndpoint: 'https://digi.ub.uni-heidelberg.de/cgi-bin/token',
    loginEndpoint:  document.querySelector('a#login') ? document.querySelector('a#login').href : null,
    logoutEndpoint: null,
    isLoggedIn:     !! document.querySelector('span#user').innerHTML.match(/(Abmelden|Logout)</),

    events: {
      fetched(list)  { window.drawAllPolygons(list)     },
      mouseenter(id) { window.drawAllPolygons(null, id) },
      mouseleave(id) { window.drawAllPolygons()         },
      error(err)     { console.error(err)               },
    }

  })
})
```

## Development

### Prerequisites

Clone the repository

```sh
git clone git@gitlab.ub.uni-heidelberg.de:Webservices/ubhdanno-client
cd ubhdanno-client
```

Install Node.js. @kba recommends [nvm](https://github.com/creationix/nvm).

```sh
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.1/install.sh | bash
nvm install v7.8.0
```

Install all dependencies and devDependencies:

```sh
npm install
```

In particular, [anno](/kba/anno) is required to be built from our repos since
it's not yet published.

### Building the development bundle

This creates a large bundle (~4 MB) that contains all libraries, fonts and images. You
only have to source this in a script-tag, instead of requiring additional CSS,
libraries etc.

Useful for testing but not for deployment.

```
webpack -d
```

To have webpack update the bundle continuously as sources are changed, add `-d` flag.

```
webpack -dw
```

### Building for deployment

```
webpack -p --config webpack.deploy.config.js
```

To `scp` it to serv42: `make deploy`.







## Javascript API 

These are generated from the source files.

## Components

<!-- BEGIN-RENDER ./src/components/anno-editor.js -->
### anno-editor
The editor has three modes: `create`, `reply` and `revise` that represent
the function of the anno-store to be used on `save`
Properties:
Events:
- `close-editor`: The editor was closed
- `removed(id)`: Annotation `id` was removed

<!-- END-RENDER -->

<!-- BEGIN-RENDER ./src/components/anno-list.js -->
### anno-list
List of [anno-viewer](#anno-viewer) components.
#### Events
- `create`: A new annotation on `targetSource` shall be created
#### Methods
##### `collapseAll(state)`
- `@param {String} state` Either `show` or `hide`

<!-- END-RENDER -->

<!-- BEGIN-RENDER ./src/components/anno-viewer.js -->
### anno-viewer
Show an annotation as a bootstrap panel.
#### Props
- **`annotation`**: The annotation this viewer shows
- `asReply`: Whether the annotation should be displayed as a reply (no
  colapsing, smaller etc.)
- `purlTemplate` A string template for the persistent URL. `{{ slug }}` will
  be replaced by the slug of the annotation
- `isPurl` A boolean to highlight the anno as targeted by a purl
- `collapseInitially`: Whether the anntotation should be collapsed after
  first render
- dateFormat: Format of date stamps. Default: `dd.mm.yyyy hh:MM:ss`
#### Events
- `revise`: This annotation should be opened in an editor for revision
- `reply`: A new annotation as a reply to this annotation should be opened in an editor
- `remove`: This annotation should be removed from the store
- `startHighlighting`: Start highlighting this annotation
- `stopHighlighting`: Stop highlighting this annotation
- `mouseenter`: The mouse cursor is now on this annotation
- `mouseleave`: The mouse cursor has left this annotation

<!-- END-RENDER -->

<!-- BEGIN-RENDER ./src/components/bootstrap-button.js -->
### bootstrap-button
A bootstrap button
#### Properties
....

<!-- END-RENDER -->

<!-- BEGIN-RENDER ./src/components/html-editor.js -->
### html-editor
Editor for the `text/html` `TextualBody` body of an annotation.

<!-- END-RENDER -->

<!-- BEGIN-RENDER ./src/components/semtags-editor.js -->
### semtags-editor
Editor for *semantic* tags, i.e. link-label tuples with autocompletion.

<!-- END-RENDER -->

<!-- BEGIN-RENDER ./src/components/tags-editor.js -->
### tags-editor
Editor for the simple text-value-only tags of an annotation.

<!-- END-RENDER -->

<!-- BEGIN-RENDER ./src/components/zone-editor.js -->


<!-- END-RENDER -->




## Mixins

<!-- BEGIN-RENDER ./src/mixin/api.js -->
### `this.api`
Adds `this.api`, a new anno-http-store configured to communicate with `annoEndpoint`
```js
this.api.revise('http://anno1', {...}, (err) => console.error(err))
```

<!-- END-RENDER -->

<!-- BEGIN-RENDER ./src/mixin/auth.js -->
### `this.$auth(cond, [id])`
Check authorization of user against `$store.state.acl`
- `$auth(<cond>, <url>)` should be read as "Is the current user
  authorized to apply action `<cond>` on `<url>`"

<!-- END-RENDER -->

<!-- BEGIN-RENDER ./src/mixin/l10n.js -->
### `this.l10n(text)`
Localization mixin. Will return the localized string in the currently
enabled `language`.
Translations are kept in [`../../l10n-config.json`](./tree/master/l10n-config.json) in an object
```
config.localizations = {
  de: {
    login: 'Anmelden',
  },
  en: {
    login: 'Log in',
  },
}
```
If no translation for the enabled language is available, fall back to the
`defaultLang`.
If there is no translation in the `defaultLang` (which is a bug) just return
the string.

<!-- END-RENDER -->

<!-- BEGIN-RENDER ./src/mixin/prefix.js -->
### `this.prefix`
Sets `this.prefix` to the prefix defined globally.

<!-- END-RENDER -->

