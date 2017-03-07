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
	my $mesg = shift();
	my $code = shift() || 400;
	my $resp = '';
	$resp .= sprintf "Status: %s\n", (
		($code == 401) ? '401 Authorization Required'
		: '400 Bad Request'
	);
	if (ref $mesg) { $mesg = Dumper($mesg) };
	$resp .= sprintf "Content-Type: text/plain\n\nError:\n$0:\n%s\n", $mesg;
	say $resp;
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
		db         => Anno::DB->new($dbh),
	};

	# XXX HACK
	# XXX HACK This is a test service
	# XXX HACK
	$request->{token}->{service} //= 'kba-test-service';

	# Parse body if any was provided
	my $body_raw = $cgi->param($request->{method} . "DATA");
	if ($request->{method} eq 'PUT' && !length($body_raw)) {
		return error("PUT: q->param(...DATA) empty. Content-Type != application/x-www-form-urlencoded && !=multipart/form-data ?"); # siehe man CGI 
	}
	if ($body_raw) {
		$request->{body} = $json->decode($body_raw);
	}

	if($request->{method} eq 'GET' &&
		! defined($request->{id})    &&
		! defined($request->{rev})   &&
		defined ($request->{target_url})
	) {

		return send_jsonld($request->{db}->get_by_url($request->{target_url}));

	} elsif ($request->{method} eq 'GET' &&
		defined($request->{id})            &&
		! defined($request->{rev})) {

		return send_jsonld($request->{db}->get_revs($request->{id}));

	} elsif ($request->{method} eq 'GET' &&
		defined($request->{id})            &&
		defined($request->{rev})           &&
		! defined($request->{target_url}))
	{

		return send_jsonld($request->{db}->get_revs($request->{id}, $request->{rev}));

	} elsif ($request->{method} eq 'PUT' &&
		defined($request->{id})            &&
		! defined($request->{rev})         &&
		! defined($request->{target_url})
	) {

		# TODO: Berechtigungsprüfung
		if (my $err = Anno::Rights::is_request_allowed_to($request, 'admin')) {
			return error($err, 401)
		}

		# TODO: Return representation and/or set Location header
		my ($id,$rev) = $request->{db}->create_or_update($request->{body});
		return send_jsonld({id => $id, rev => $rev}, $rev == 1 ? 201 : 200);

	} elsif ($request->{method} eq 'POST' &&
		! defined($request->{id}) &&
		! defined($request->{rev}) &&
		! defined($request->{target_url})
	) {

		# TODO: Berechtigungsprüfung
		if (my $err = Anno::Rights::is_request_allowed_to($request, 'write')) {
			return error($err, 401)
		}

		# TODO: Return representation and/or set Location header
		my ($id,$rev) = $request->{db}->create_or_update($request->{body});
		return send_jsonld({id => $id, rev => $rev}, $rev == 1 ? 201 : 200);

	} else {

		return error("Unhandled request " . Dumper($request));

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
