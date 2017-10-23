PATH := ./node_modules/.bin:$(PATH)
NODE_ENV = development

NPM = npm
RM = rm -rf

.PHONY: help
help:
	@echo ""
	@echo "Targets:"
	@echo ""
	@echo "    build   webpack"
	@echo "    watch   webpack -w "
	@echo "    serve   webpack-dev-server "
	@echo "    clean   remove dist"
	@echo "    dist    Build js and html"
	@echo "    dist    Build js and html"


.PHONY: build
build: dist node_modules

.PHONY: watch
watch:
	webpack -w

.PHONY: serve
serve:
	webpack-dev-server --content-base .

.PHONY: clean
clean:
	$(RM) dist

.PHONY: test
test:
	tap -Rspec test/*.test.js

.PHONY: dist
dist: src
	NODE_ENV='production' webpack --config webpack.config.prod.js

node_modules: package.json
	$(NPM) install

serve-samples:
	@echo "Open <http://localhost:3001/test> in your browser"
	python2 -mSimpleHTTPServer 3001
