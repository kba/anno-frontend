PATH := ./node_modules/.bin:$(PATH)
NODE_ENV = development

NPM = npm
RM = rm -rf

# .PHONY: check-deps
# check-deps:
#     @for bin in npm webpack;do\
#         bash -c "type -P $$bin" >/dev/null || echo "'$$bin' not in \$$PATH";\
#     done

.PHONY: build
build: node_modules
	webpack
	cp demo.html dist/index.html

.PHONY: watch
watch:
	webpack -w

.PHONY: serve
serve:
	webpack-dev-server --content-base .

node_modules: package.json
	$(NPM) install

.PHONY: clean
clean:
	$(RM) $(NODE_MODULES_DIR)
	$(RM) dist

.PHONY: test
test:
	tap -Rspec test/*.test.js
