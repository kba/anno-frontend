
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



Configuration
-------------

See default config options and comments in
[`default-config/`](default-config/).



Methods
-------

### `startHighlighting(annoId, open)`
Deprecated. Use `.externalRequest('HighlightByTargetSelector', …)` instead.

### `stopHighlighting(annoId)`
Deprecated. Use `.externalRequest('HighlightByTargetSelector', …)` instead.

### `expand(annoId)`
Open thread tree to reveal anno with id `annoId`.



