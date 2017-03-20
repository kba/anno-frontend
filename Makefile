PATH := ./node_modules/.bin:$(PATH)
NODE_ENV = development
DEPLOY_SERVER = serv7
DEPLOY_PATH = /usr/local/AnnotationService/htdocs/dist

NPM = npm
RM = rm -rf

# .PHONY: check-deps
# check-deps:
#     @for bin in npm webpack;do\
#         bash -c "type -P $$bin" >/dev/null || echo "'$$bin' not in \$$PATH";\
#     done

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
	$(RM) $(NODE_MODULES_DIR)
	$(RM) dist

.PHONY: test
test:
	tap -Rspec test/*.test.js

.PHONY: deploy
deploy: dist
	ssh $(DEPLOY_SERVER) mkdir -p $(DEPLOY_PATH)
	scp dist/* $(DEPLOY_SERVER):$(DEPLOY_PATH)
	
dist: src
	webpack
	cp demo.html dist/index.html

node_modules: package.json
	$(NPM) install
