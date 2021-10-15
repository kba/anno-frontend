
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
6) Returns the Vue.App which should be kept around (e.g. as window.annoapp)
   and on whose `eventBus` listeners can be added `$on` and which can emit
   events with `$emit`



Options
-------

- `container`: Container element to hold the annotation sidebar/modal
- `language`: Language for l10n. Currently: `en`/`eng` or `de`/`deu` (Default)
- `collection`: Anno Collection
- `targetSource`: The target of the annotation. Defaults to `window.location.href`
- `targetImage`: The image if any, to annotate on this page
- `targetThumbnail`: Thumbnail view of the image. Defaults to `options.targetImage`
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

- `isLoggedIn`: Function or boolean to designate whether the user is already
  logged in. No login button will be shown in that case, token will still be
  retrieved unless found


Methods
-------

### `startHighlighting(annoId, open)`

Highlight the annotation with `id` annoId

### `stopHighlighting(annoId)`

Stop highlighting the annotation with `id` annoId

### `expand(annoId)`

Open thread tree to reveal anno with id `annoId`



Events
------

Either listen/emit via app.eventBus and/or provide listeners as `events` option

- `mouseover(annoId)`: $on this to catch when an annotation is hovered in the list
- `mouseleave(annoId)`: $on this to catch when an annotation is un-hovered in the list
- `fetched(annotationList)`: List of annotations has been fetched from the server




