#!/usr/bin/perl
# todo: r/w_secret dienstabhängig
# todo: dienstweise repositories & secrets
# todo: berechtigung prüfen
# todo: Editiermöglichkeiten eintragen
use strict;
use utf8;
use English;
use CGI::Fast qw(:standard);
use Crypt::JWT qw(encode_jwt decode_jwt);
use JSON;
use URI::Escape;
use List::MoreUtils qw(uniq);
use File::Slurp;
use lib qw(/usr/local/diglit, ../lib);
use Anno::Rights;
use Anno::DB;
$OUTPUT_AUTOFLUSH=1;

my $secret='@9g;WQ_wZECHKz)O(*j/pmb^%$IzfQ,rbe~=dK3S6}vmvQL;F;O]i(W<nl.IHwPlJ)<y8fGOel$(aNbZ';

# Beispiel rtok: eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiamIifQ.H52l5V2CUgilIx5hrqSDHGvwE6kqXpG3zBMupyJrI90

sub error {
	my $mesg=shift;
	my $code = shift() || 400;
	printf 'Status: %s\n', (
        ($code == 401) ? '401 Authorization Required'
        : '400 Bad Request'
    );
#	print "Status: 400 Bad Request\r\n";
	printf "Content-Type: text/plain\r\n\r\nError:\n$0:\n%s\n", $mesg;
	goto next_request;
}

my $UBHDANNO_DB_NAME = $ENV{UBHDANNO_DB_NAME} || 'annotations';
my $UBHDANNO_DB_USER = $ENV{UBHDANNO_DB_USER} || 'diglit';
my $UBHDANNO_DB_PASSWORD = $ENV{UBHDANNO_DB_PASSWORD};
unless ($UBHDANNO_DB_PASSWORD) {
  $UBHDANNO_DB_PASSWORD = read_file("/home/jb/db-passwd");
  $UBHDANNO_DB_PASSWORD = ~s/[^\x20-\x7e]//g;
}
if(!length($UBHDANNO_DB_PASSWORD)) { die "db-passwd not set\n"; }

my $annotation_repository_url = "http://localhost:8080/fedora/rest/annotations";

my $dbh;
while(my $q=new CGI::Fast) {
	$dbh||=DBI->connect("DBI:mysql:database=$UBHDANNO_DB_NAME",
	  $UBHDANNO_DB_USER,
	  $UBHDANNO_DB_PASSWORD, {
	  	mysql_enable_utf8=>1,
	  	RaiseError=>1
	  });
open my $fff, ">>/tmp/anno.log";
print $fff scalar(localtime(time))."\n";

	# bei PUT wird QUERY_STRING nicht ausgewertet, daher geht $q->param(...) nicht. Also selber machen:
	my %q_param;
	my $qs=$ENV{QUERY_STRING};
	$qs=~s/#.*//;
	for my $kv (split /[&;]+/, $qs) {
		my($k,$v)=split /=/, $kv, 2;
		$q_param{$k}=uri_unescape($v);
	}

	my $rtok;
	eval { $rtok=decode_jwt(token=>scalar($q_param{rtok}), key=>$secret) };
	my $ruser;
	if($q->request_method=~/^(GET)$/) {
		if($rtok && ref($rtok) eq "HASH") { 
			$ruser=$rtok->{user};
		}
	}

	my $wtok;
	eval { $wtok=decode_jwt(token=>scalar($q_param{wtok}), key=>$secret) };
	my $wuser;
	if($q->request_method=~/^(PATCH|PUT)$/) {
		if(!length($q->param($q->request_method."DATA"))) {
			error("PUT: q->param(...DATA) empty. Content-Type != application/x-www-form-urlencoded && !=multipart/form-data ?"); # siehe man CGI 
		}
		# TODO! if(!$q->https()) { error "wtok: no https\n"; }
		if(!$wtok || ref($wtok) ne "HASH" || !length($wtok->{user}) || $wtok->{write}!=1) { 
			error "wtok $@\n";
		}
		$wuser=$wtok->{user};
	}

	my $uid=$wuser || $ruser;


	my $target_url=$q_param{"target.url"};
	my $service = $wtok->{service} || $rtok->{service} || $q_param{service} || 'kba-test-service';

	# TODO: Berechtigungsprüfung
	# XXX: Skip right checks if target url contains 'open.sesame'
	unless ($service eq 'kba-test-service') {
		# my $rights = 'foo';
		my $rights = Anno::Rights::rights($service, $target_url, $uid);
		if($q->request_method eq "POST" && $rights < 1) { # create
			error("not enough rights to create (service='$service', target='$target_url', uid='$uid') => $rights", 401);
		}
		if($q->request_method eq "PUT" && $rights < 2) { # modi
			error("not enough rights to modify (service='$service', target='$target_url', uid='$uid') => $rights", 401);
		}
	}

	my $a_db=Anno::DB->new($dbh);
	if($q->request_method eq "GET") {
		print "Content-Type: application/json\r\n";
		print "\r\n";
		if($q_param{id}) {
			print $a_db->get_revs($q_param{id}, $q_param{rev}); # body+target gibt's nur für einzelne revs
			next;
		}
		print $a_db->get_by_url($target_url);
		next;
	}
	elsif($q->request_method=~/^(PUT|POST)$/) { # modify content (title, ...)
		print "Content-Type: application/json\r\n";
		print "\r\n";
		my $data=decode_json($q->param($q->request_method."DATA"));
		if($q->request_method eq "POST" && $data->{id}) {
			error("POST (new anno) not together with id");
		}
		if($q->request_method eq "PUT" && !$data->{id}) {
			error("PUT (modify anno) requires id");
		}
		my($id,$rev)=$a_db->create_or_update($data);
		print qq!{"id": $id, "rev": $rev}!;
		next;
	}

	error("an error occured (request_method=".$q->request_method." not supported)");

	next_request:
}

# vim: noet sw=2
