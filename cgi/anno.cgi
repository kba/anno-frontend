#!/usr/bin/perl
# todo: r/w_secret dienstabhängig
# todo: dienstweise repositories & secrets
# todo: berechtigung prüfen
# todo: Editiermöglichkeiten eintragen
use lib qw(/usr/local/diglit ../lib);
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

#-----------------------------------------------------------------------------
#
# Helpers
#
#-----------------------------------------------------------------------------

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
#     parse_query
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
	say ref($data) ? $json->encode($data) : $data;
}

#-----------------------------------------------------------------------------
#
# Handlers
#
#-----------------------------------------------------------------------------

#
# handle_GET_targeturl($request)
#
# GET /anno
#
sub handle_GET_targeturl {
	my ($request) = @_;
	my $a_db=Anno::DB->new($dbh);
	send_jsonld($a_db->get_by_url($request->{target_url}));
}

#
# handle_GET_id($request)
#
# GET /anno/{id}
#
sub handle_GET_id {
	my ($request) = @_;
	my $a_db=Anno::DB->new($dbh);
	send_jsonld($a_db->get_revs($request->{id}));
}

#
# handle_GET_id_rev($request)
#
# GET /anno/{id}/{rev}
#
sub handle_GET_id_rev {
	my ($request) = @_;
	my $a_db=Anno::DB->new($dbh);
	send_jsonld($a_db->get_revs($request->{id}, $request->{rev}));
}

#
# handle_POST($q, $body)
#
# POST /anno
#
sub handle_POST {
	my ($request) = @_;
	my $token = $request->{token};

	# XXX ?
	if (!length($token->{user}) || $token->{write} != 1) { error "token " . $json->encode($token); }
	my ($service, $target_url, $uid) = ($token->{service}, $request->{target_url}, $token->{user});
	my $rights = Anno::Rights::rights($service, $target_url, $uid);
	if($rights < 1) { # modi
		error("not enough rights to create (service='$service', target='$target_url', uid='$uid') => $rights", 401);
	}

	my $data = $json->decode($request->{body});
	my $a_db=Anno::DB->new($dbh);
	my ($id,$rev) = $a_db->create_or_update($data);
	return send_jsonld({id => $id, rev => $rev}, $rev == 1 ? 201 : 200);
}

#
# handle_PUT_id($q, $id, $body)
#
# PUT /anno/{id}
#
sub handle_PUT_id {
	my ($request) = @_;

	my $token = $request->{token};
	# XXX ?
	if (!length($token->{user}) || $token->{write} != 1) { error "token " . $json->encode($token); }
	my ($service, $target_url, $uid) = ($token->{service}, $request->{target_url}, $token->{user});
	my $rights = Anno::Rights::rights($service, $target_url, $uid);
	if($rights < 2) { # modi
		error("not enough rights to modify (service='$service', target='$target_url', uid='$uid') => $rights", 401);
	}

	if (!length($request->{body})) {
		error("PUT: q->param(...DATA) empty. Content-Type != application/x-www-form-urlencoded && !=multipart/form-data ?"); # siehe man CGI 
	}

	my $data = $json->decode($request->{body});
	my $a_db=Anno::DB->new($dbh);
	my ($id,$rev) = $a_db->create_or_update($data);
	return send_jsonld({id => $id, rev => $rev}, $rev == 1 ? 201 : 200);
}

#
# handler($cgi_like_object)
#
# Handle the request.
#
sub handler {
	my $cgi = shift;
	$dbh ||= db_connect();

	my $q_param = parse_query;
	my $request = {
		method     => $cgi->request_method,
		token      => eval { token_from_header($cgi) } || {},
		id         => $q_param->{id},
		rev        => $q_param->{rev},
		target_url => $q_param->{'target.url'},
		body       => $cgi->param($cgi->request_method . "DATA")
	};

	$request->{token}->{service} //= 'kba-test-service';

	eval {

		if($request->{method} eq 'GET' &&
			! defined($request->{id})    &&
			! defined($request->{rev})   &&
			defined ($request->{target_url})
		) {

			return handle_GET_targeturl($request);

		} elsif ($request->{method} eq 'GET' &&
			defined($request->{id})            &&
			! defined($request->{rev})) {

			return handle_GET_id($request);

		} elsif ($request->{method} eq 'GET' &&
			defined($request->{id})            &&
			defined($request->{rev})           &&
			! defined($request->{target_url}))
		{

			handle_GET_id_rev($request);

		} elsif ($request->{method} eq 'PUT' &&
			defined($request->{id})            &&
			! defined($request->{rev})         &&
			! defined($request->{target_url})
		) {

			handle_PUT_id($request);

		} elsif ($request->{method} eq 'POST' &&
			! defined($request->{id}) &&
			! defined($request->{rev}) &&
			! defined($request->{target_url})
		) {

			handle_POST($request);

		} else {

			error("Unhandled request $request->{method} " . ($request->{id}?"id=$request->{id}":'') . ($request->{rev}?"&rev=$request->{rev}":''), 406);

		}

		# TODO: Berechtigungsprüfung
		# XXX: Skip right checks if service is 'kba-test-service'
		# unless ($service eq 'kba-test-service') {
		# }

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
	while(my $cgi=CGI::Fast->new) { handler($cgi); }
}

# vim: noet sw=2 ts=2
