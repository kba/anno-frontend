MYSQL_USER = root
MYSQL_PASSWORD = root

SHUTUP = 2>/dev/null
MYSQL = mysql -u "$(MYSQL_USER)" --password="$(MYSQL_PASSWORD)" # $(SHUTUP)

UBHDANNO_DB_NAME     = ubhd_anno_test
UBHDANNO_DB_PASSWORD = ub
UBHDANNO_DB_USER     = dummy

.PHONY: create-db serve stop
create-db:
	echo "DROP DATABASE IF EXISTS $(UBHDANNO_DB_NAME)" | $(MYSQL)
	echo "CREATE DATABASE $(UBHDANNO_DB_NAME) CHARACTER SET 'utf8' COLLATE utf8_unicode_ci;" | $(MYSQL)
	echo "GRANT ALL PRIVILEGES on $(UBHDANNO_DB_NAME).* TO '$(UBHDANNO_DB_USER)'@localhost IDENTIFIED BY '$(UBHDANNO_DB_PASSWORD)';"|$(MYSQL)
	$(MYSQL) $(UBHDANNO_DB_NAME) < doc/annotations.empty.dump

serve:
	export UBHDANNO_DB_NAME=$(UBHDANNO_DB_NAME); \
	export UBHDANNO_DB_USER=$(UBHDANNO_DB_USER); \
	export UBHDANNO_DB_PASSWORD=$(UBHDANNO_DB_PASSWORD); \
	plackup \
		-Ilib \
		-p $(PORT) \
		-MPlack::App::WrapCGI \
		-e 'Plack::App::WrapCGI->new(script => "./cgi/anno.cgi")->to_app'

stop:
	pkill -f -9 'plackup'
