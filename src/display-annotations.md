
`displayAnnotations(options)`
=============================

1) takes the initial state of the Vue store
2) dispatches a `fetchToken` action to retrieve the token from localStorage
   or via HTTP GET to `tokenEndpoint` or fail and force login if clicked, not
   otherwise
3) dispatches a `fetchList` action to retrieve all anotations that match
   `{$target:options.targetSource}`
4) dispatches a `fetchAcl` action to retrieve the resp. permissions
5) starts a Vue App with a single [`<sidebar-app>`](#sidebar-app)
6) Returns a reference to the Vue.App which can be stored to use its API.



Options
-------

- `events`: Event handlers. See chapter `events` below.
- `container`: Container element to hold the annotation sidebar/modal
- `language`: Language for l10n. Currently: `en`/`eng` or `de`/`deu` (Default)
- `collection`: Anno Collection
- `targetSource`: The target of the annotation. Defaults to `window.location.href`
- `targetImage`: The image if any, to annotate on this page
- `targetThumbnail`: Thumbnail view of the image. Defaults to `options.targetImage`
- `thumbStrikeColor`: SVG color for the outline of highlighted areas in thumbnail.
- `thumbFillColor`: SVG color for the inner area of highlighted areas in thumbnail.
- `enableIIIF`: Show IIIF-Image-URL (rectangular section that encloses all SVG zones of an annotation)
- `iiifUrlTemplate`: Template for the IIIF-Image-URL
- `annotationList`: Options for the list display
  - `sortedBy`:     Sort key: `created_az`, `created_za` or `title_az`
  - `allCollapsed`: Collapse (`true`) or expand (`false`) all annotations
- `purlTemplate` A string template for the persistent URL. `{{ slug }}` will
  be replaced by the slug of the annotation
- `purlId` Annotation ID of the persistent URL. Should begin with the URL of `annoEndpoint`
- `purlAnnoInitiallyOpen` Whether the persistently adressed annotation
  should be made visible initially, if necessary by opening parent threads
- `token`: Function or token. The literal token. Don't use this option
  without SSL/TLS encryption. Function must be synchronous.
- `tokenEndpoint`: URL of the endpoint providing the JSON Webtoken
- `annoEndpoint`: URL of the Open Annotation Protocol server
- `loginEndpoint`: Function or URL of the login mask
- `logoutEndpoint`: Function or URL that logs the user out
- `isLoggedIn`: Function or boolean to designate whether the user is already
  logged in. No login button will be shown in that case, token will still be
  retrieved unless found
- `targetFragmentButtonTitle`: Hover title (not caption) of the Fragment
  Identifier button. Usually, this should be a description of what the
  `targetFragmentButtonClicked` event handler does.
- `modalTeleportTarget`: Reference to, or id of, the DOM element
  into which to install modal popups. Default: The `body` element.
- `helpUrlTemplate`: Template for generating help URLs. For details, see
  [this source code](src/components/help-button/help-url.js).



Methods
-------

### `startHighlighting(annoId, open)`
Deprecated. Use `.externalRequest('HighlightByTargetSelector', …)` instead.

### `stopHighlighting(annoId)`
Deprecated. Use `.externalRequest('HighlightByTargetSelector', …)` instead.

### `expand(annoId)`
Open thread tree to reveal anno with id `annoId`



Events
------

The `events` option to `displayAnnotation` may hold a dictionary object
that may define event handlers (event name &rarr; function).
Currently, these are supported:

- `mouseover`, `mouseleave`:
  Fired when the mouse pointer hovers/unhovers an annotation.
  For details, see the anno-viewer component documentation.

- `targetFragmentButtonClicked`:
  Fired when the Fragment Identifier button is clicked.
  For details, see the anno-viewer component documentation.

- `fetched`:
  Deprecated.
  Fired when the list of annotations has been fetched from the server.

- `updatedPermissions`:
  Fires when the user's permissions have been modified.


