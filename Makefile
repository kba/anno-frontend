MYSQL_USER = root
MYSQL_PASSWORD = root

PUBLIC_HTML = htdocs/dist

SHUTUP = 2>/dev/null
MYSQL = mysql -u "$(MYSQL_USER)" --password="$(MYSQL_PASSWORD)" # $(SHUTUP)

UBHDANNO_DB_NAME     = ubhd_anno_test
UBHDANNO_DB_PASSWORD = ub
UBHDANNO_DB_USER     = dummy
UBHDANNO_USE_CGI     = true

MKDIR = mkdir -p

help:
	@echo ""
	@echo "Targets"
	@echo ""
	@echo "    recreate-db       Drop the test database and create it from schema"
	@echo "    start             Start a development backend at port $(PORT)"
	@echo "    stop              Stop the development backend"
	@echo "    integration-test  Run the dev backend, run the integration-tests, stop the dev backend"
	@echo "    public            Generate statically served files"
	@echo ""
	@echo "Variables"
	@echo ""
	@echo "    MYSQL_USER            MySQL user with db-creating and all-rights-granting power. Default: $(MYSQL_USER)"
	@echo "    MYSQL_PASSWORD        Password for said user. Default: $(MYSQL_PASSWORD)"
	@echo "    UBHDANNO_DB_NAME      Database to use. Default $(UBHDANNO_DB_NAME)"
	@echo "    UBHDANNO_DB_USER      Database user. Default $(UBHDANNO_DB_USER)"
	@echo "    UBHDANNO_DB_PASSWORD  Database user password. Default $(UBHDANNO_DB_PASSWORD)"
	@echo "    UBHDANNO_USE_CGI      Whether to run anno.cgi as a plain old CGI script"
	@echo "    PORT                  Port to run the backend dev at. Default: $(PORT)"


.PHONY: recreate-db
recreate-db:
	echo "DROP DATABASE IF EXISTS $(UBHDANNO_DB_NAME)" | $(MYSQL)
	echo "CREATE DATABASE $(UBHDANNO_DB_NAME) CHARACTER SET 'utf8' COLLATE utf8_unicode_ci;" | $(MYSQL)
	echo "GRANT ALL PRIVILEGES on $(UBHDANNO_DB_NAME).* TO '$(UBHDANNO_DB_USER)'@localhost IDENTIFIED BY '$(UBHDANNO_DB_PASSWORD)';"|$(MYSQL)
	$(MYSQL) $(UBHDANNO_DB_NAME) < doc/annotations.empty.dump

.PHONY: start
start:
	export UBHDANNO_DB_NAME="$(UBHDANNO_DB_NAME)"; \
	export UBHDANNO_DB_USER="$(UBHDANNO_DB_USER)"; \
	export UBHDANNO_DB_PASSWORD="$(UBHDANNO_DB_PASSWORD)"; \
	export UBHDANNO_USE_CGI="$(UBHDANNO_USE_CGI)"; \
	plackup -Ilib -p $(PORT) -MPlack::App::WrapCGI \
		-e 'Plack::App::WrapCGI->new(script => "./cgi/anno.cgi")->to_app'

.PHONY: stop
stop:
	pkill -f -9 'plackup'

#
# Swagger Defaults:
#
# docExpansion: "none",
# jsonEditor: false,
# defaultModelRendering: 'schema',
# showRequestHeaders: false,
# showOperationIds: false
.PHONY: public
public: $(PUBLIC_HTML)/swagger.json
	$(MKDIR) $(PUBLIC_HTML)/swagger-ui
	cp -r vendor/swagger-ui/dist/* $(PUBLIC_HTML)/swagger-ui
	sed -i \
		-e 's,http://petstore.swagger.io/v2/swagger.json,/dist/swagger.json,' \
		-e 's/docExpansion:.*/docExpansion: "list",/' \
		-e 's/jsonEditor:.*/jsonEditor: true,/' \
		$(PUBLIC_HTML)/swagger-ui/index.html

$(PUBLIC_HTML)/swagger.json: swagger.yml
	$(MKDIR) $(dir $@)
	ruby -ryaml -rjson -e 'puts JSON.pretty_generate(YAML.load(ARGF))' "$<" > "$@"

