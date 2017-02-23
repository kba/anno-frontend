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

[TODO see top level README for API]
