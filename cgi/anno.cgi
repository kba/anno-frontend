#!/usr/bin/perl
# todo: r/w_secret dienstabhängig
# todo: dienstweise repositories & secrets
# todo: berechtigung prüfen
# todo: Editiermöglichkeiten eintragen
use lib qw(/usr/local/diglit, ../lib);
use 5.010;
use strict;
use utf8;
use English;
use CGI::Fast qw(:standard);
use Crypt::JWT qw(encode_jwt decode_jwt);
use JSON;
use URI::Escape;
use List::MoreUtils qw(uniq);
use File::Slurp;
use Data::Dumper;
use Anno::Rights;
use Anno::DB;
$OUTPUT_AUTOFLUSH=1;

our $secret='@9g;WQ_wZECHKz)O(*j/pmb^%$IzfQ,rbe~=dK3S6}vmvQL;F;O]i(W<nl.IHwPlJ)<y8fGOel$(aNbZ';
# Beispiel rtok: eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiamIifQ.H52l5V2CUgilIx5hrqSDHGvwE6kqXpG3zBMupyJrI90

my $dbh;
our $json = JSON->new->pretty;


#
# error($mesg, [$code=400])
#
# Print an HTTP text/plain response with $mesg as the body and $code as the
# HTTP return code.
#
sub error {
	my $mesg=shift;
	my $code = shift() || 400;
	my $resp = '';
	$resp .= sprintf 'Status: %s\n', (
		($code == 401) ? '401 Authorization Required'
		: '400 Bad Request'
	);
	$resp .= sprintf "Content-Type: text/plain\r\n\r\nError:\n$0:\n%s\n", $mesg;
	say STDERR "$resp";
	die $resp;
}

#
# db_connect()
#
# Connect to a MySQL database.
#
# $UBHDANNO_DB_NAME, $UBHDANNO_DB_USER, $UBHDANNO_DB_PASSWORD are read from environment variables.
#
# If $UBHDANNO_DB_PASSWORD is not set, is read from /home/jb/db-passwd
#
sub db_connect {
	my $UBHDANNO_DB_NAME = $ENV{UBHDANNO_DB_NAME} || 'annotations';
	my $UBHDANNO_DB_USER = $ENV{UBHDANNO_DB_USER} || 'diglit';
	my $UBHDANNO_DB_PASSWORD = $ENV{UBHDANNO_DB_PASSWORD};
	unless ($UBHDANNO_DB_PASSWORD) {
		$UBHDANNO_DB_PASSWORD = read_file("/home/jb/db-passwd") or die "Could not open password file";
		$UBHDANNO_DB_PASSWORD =~ s/[^\x20-\x7e]//g;
	}
	if(!length($UBHDANNO_DB_PASSWORD)) { die "db-passwd not set\n"; }
	return DBI->connect(
		"DBI:mysql:database=$UBHDANNO_DB_NAME",
		$UBHDANNO_DB_USER, $UBHDANNO_DB_PASSWORD,
		{
			mysql_enable_utf8=>1,
			RaiseError=>1
		});
}

#
# token_from_header($cgi_like_object)
#
# Try to read the JSON web token from the "Authorization" HTTP Header.
#
sub token_from_header {
	my $q = shift;
	my $auth = $q->http('Authorization');
	$auth =~ s/^Bearer //;
	return decode_jwt(token => scalar($auth), key => $secret);
}

#
# parse_query
#
# Parse QUERY_STRING into key-value-pairs
#
sub parse_query {
	my %q_param;
	my $qs = $ENV{QUERY_STRING};
	$qs =~ s/#.*//;
	for my $kv (split /[&;]+/, $qs) {
		my ($k,$v) = split /=/, $kv, 2;
		$q_param{$k} = uri_unescape($v);
	}
	return \%q_param;
}

#
# send_jsonld($data, $code=200)
#
# Send $data as JSON with a JSON-LD header
#
sub send_jsonld {
	my $data = $_[0];
	my $code = $_[1] || 200;
	say "Content-Type: application/ld+json";
	say "";
	say $json->encode($data);
}

#
# handler($cgi_like_object)
#
# Handle the request.
#
sub handler {
	my $q = shift;
	$dbh ||= db_connect();

	# bei PUT wird QUERY_STRING nicht ausgewertet, daher geht $q->param(...) nicht. Also selber machen:
	my $q_param = parse_query();

	my $token = eval { token_from_header($q) };
	$token ||= {};

	eval {

		if($q->request_method=~/^(PATCH|PUT)$/) {
			if(!length($q->param($q->request_method."DATA"))) {
				error("PUT: q->param(...DATA) empty. Content-Type != application/x-www-form-urlencoded && !=multipart/form-data ?"); # siehe man CGI 
			}
			if(!$token || ref($token) ne "HASH" || !length($token->{user}) || $token->{write} != 1) {
				error "token $@\n";
			}
		}

		my $uid = $token->{user}; 

		my $target_url = $q_param->{"target.url"};
		my $service = $token->{service} || $q_param->{service} || 'kba-test-service';

		# TODO: Berechtigungsprüfung
		# XXX: Skip right checks if service is 'kba-test-service'
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
			if($q_param->{id}) {
				print $a_db->get_revs($q_param->{id}, $q_param->{rev}); # body+target gibt's nur für einzelne revs
				return;
			}
			print $a_db->get_by_url($target_url);
			return;
		}
		elsif($q->request_method=~/^(PUT|POST)$/) { # modify content (title, ...)
			my $data = $json->decode($q->param($q->request_method."DATA"));
			if($q->request_method eq "POST" && $data->{id}) {
				error("POST (new anno) not together with id");
			}
			if($q->request_method eq "PUT" && !$data->{id}) {
				error("PUT (modify anno) requires id");
			}
			my($id,$rev)=$a_db->create_or_update($data);
			return send_jsonld({id => $id, rev => $rev}, $rev == 1 ? 201 : 200);
		}

		# XXX UNHANDLED
		error("an error occured (request_method=".$q->request_method." not supported)");

	} or do {
		my ($resp) = @_;
		say STDERR "\$!: $!";
		say STDERR "$resp";
		print $resp;
	}
}

#
# If the UBHDANNO_USE_CGI environment var is set, fall back to legacy CGI.pm
#
# Otherwise use a CGI::Fast while-loop.
#
if ($ENV{UBHDANNO_USE_CGI}) {
	handler(CGI->new);
} else {
	while(my $q=CGI::Fast->new) { handler($q); }
}

# vim: noet sw=2 ts=2
