CP = cp -r
MKDIR = mkdir -p
NPM = npm
RM = rm -rf

DEPS_DIR = deps
NODE_MODULES_DIR = node_modules

.PHONY: deps
deps: $(NODE_MODULES_DIR)
	$(MKDIR) $(DEPS_DIR)
	$(RM) $(DEPS_DIR)/bootstrap
	$(CP) $(NODE_MODULES_DIR)/bootstrap/dist $(DEPS_DIR)/bootstrap
	$(MKDIR) $(DEPS_DIR)/font-awesome
	$(CP) $(NODE_MODULES_DIR)/font-awesome/css $(DEPS_DIR)/font-awesome/
	$(CP) $(NODE_MODULES_DIR)/font-awesome/fonts $(DEPS_DIR)/font-awesome/
	$(CP) $(NODE_MODULES_DIR)/jquery/dist/jquery.min.js $(DEPS_DIR)/jquery.js
	$(CP) $(NODE_MODULES_DIR)/js-cookie/src/js.cookie.js $(DEPS_DIR)/js.cookie.js
	$(CP) $(NODE_MODULES_DIR)/tinymce $(DEPS_DIR)/tinymce
	$(CP) $(NODE_MODULES_DIR)/vue/dist/vue.js $(DEPS_DIR)/vue.js
	
$(NODE_MODULES_DIR):
	$(NPM) install

clean:
	$(RM) $(NODE_MODULES_DIR)
