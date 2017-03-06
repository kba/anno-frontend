NO_STDERR = 2>/dev/null
NO_STDOUT = >/dev/null

MYSQL_USER = root
MYSQL_PASSWORD = root
MYSQL = mysql -u "$(MYSQL_USER)" --password="$(MYSQL_PASSWORD)" # $(NO_STDERR)
PORT = 5000

UBHDANNO_DB_NAME     = ubhd_anno_test
UBHDANNO_DB_PASSWORD = ub
UBHDANNO_DB_USER     = dummy
UBHDANNO_USE_CGI     = true

help:
	@echo ""
	@echo "Targets"
	@echo ""
	@echo "    recreate-db       Drop the test database and create it from schema"
	@echo "    start             Start a development backend at port $(PORT)"
	@echo "    stop              Stop the development backend"
	@echo "    integration-test  Run the dev backend, run the integration-tests, stop the dev backend"
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

.PHONY: create-db start stop integration-test
recreate-db:
	echo "DROP DATABASE IF EXISTS $(UBHDANNO_DB_NAME)" | $(MYSQL)
	echo "CREATE DATABASE $(UBHDANNO_DB_NAME) CHARACTER SET 'utf8' COLLATE utf8_unicode_ci;" | $(MYSQL)
	echo "GRANT ALL PRIVILEGES on $(UBHDANNO_DB_NAME).* TO '$(UBHDANNO_DB_USER)'@localhost IDENTIFIED BY '$(UBHDANNO_DB_PASSWORD)';"|$(MYSQL)
	$(MYSQL) $(UBHDANNO_DB_NAME) < doc/annotations.empty.dump

start:
	export UBHDANNO_DB_NAME="$(UBHDANNO_DB_NAME)"; \
	export UBHDANNO_DB_USER="$(UBHDANNO_DB_USER)"; \
	export UBHDANNO_DB_PASSWORD="$(UBHDANNO_DB_PASSWORD)"; \
	export UBHDANNO_USE_CGI="$(UBHDANNO_USE_CGI)"; \
	plackup \
		-Ilib \
		-sFCGI \
		-p $(PORT) \
		-MPlack::App::WrapCGI \
		-e 'Plack::App::WrapCGI->new(script => "./cgi/anno.cgi")->to_app'

stop:
	pkill -f -9 'plackup'

integration-test:
	$(MAKE) start &
	-$(MAKE) -C htdocs test
	$(MAKE) stop
