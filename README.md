# UB Heidelberg Annotationen Frontend

[![Known Vulnerabilities](https://snyk.io/test/github/kba/anno-frontend/badge.svg?targetFile=package.json)](https://snyk.io/test/github/kba/anno-frontend?targetFile=package.json)

<!-- BEGIN-MARKDOWN-TOC -->
* [Demo](#demo)
* [Usage](#usage)
	* [`displayAnnotations(options)`](#displayannotationsoptions)
		* [Options](#options)
		* [Methods](#methods)
			* [`startHighlighting(annoId, open)`](#starthighlightingannoid-open)
			* [`stopHighlighting(annoId)`](#stophighlightingannoid)
			* [`expand(annoId)`](#expandannoid)
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
		* [Methods](#methods-1)
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

* Standalone [CDN-based online demo](test/html/displayAnnotations.dev.html)
* Self-hosted offline demo: See HTML comment in
  [`test/html/displayAnnotations.nm.html`](test/html/displayAnnotations.nm.html)
* Integration in DWork: http://digi.ub.uni-heidelberg.de/diglit/annotationen_test/0002?template=ubhd3






## Usage

See [`src/display-annotations.md`](src/display-annotations.md).



### Structure of the application

All assets are bundled into a JS files in the `dist/` subdirectory:

* `anno-frontend.dev.js`: Development build, optimized for debugging.
* `anno-frontend.prod.js`: Production build, optimized for performance.

Both install the application factory function into the property
`displayAnnotations`
of the window global.

Choose either one and include it as a script tag into the website in which
the annotations sidebar app shall run.

This factory function can then be used to initialize an instance of the
annotations sidebar app into an existing DOM element.

Currently, only one instance of the app can run per browser frame.


### Example

See source code of
[`test/html/displayAnnotations.nm.html`](test/html/displayAnnotations.nm.html).



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
make
```

In particular, [anno](/kba/anno) is required to be built from our repos since
it's not yet published.


### Building for deployment

```
npm install
make build
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
- `purlId` The URL of the persistently adressed annotation
- `collapseInitially`: Whether the anntotation should be collapsed after
  first render
- `imageWidth`: Width of the image this annotation is about, if any
- `imageHeight`: Height of the image this annotation is about, if any
- `iiifUrlTemplate`: URL template for the IIIF link if this annotation
  contains zones about an image. The string `{{ iiifRegion }}` is replaced
  with a IIIF Image API conformant region specification that contains the
  bounding box of all zones in this annotation.
#### Events
- `revise`: This annotation should be opened in an editor for revision
- `reply`: A new annotation as a reply to this annotation should be opened in an editor
- `remove`: This annotation should be removed from the store
- `startHighlighting`: Start highlighting this annotation
- `stopHighlighting`: Stop highlighting this annotation
- `mouseenter`: The mouse cursor is now on this annotation
- `mouseleave`: The mouse cursor has left this annotation
- `setToVersion`: Reset the currently edited annotation to the revision passed

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
@param String prop The property to autocomplete. Either 'source' or 'label'

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


