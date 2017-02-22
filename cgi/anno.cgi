#!/usr/bin/perl
# todo: dienstweise repositories & secrets
# todo: berechtigung prüfen
# todo: ids zu namen ersetzen
# todo: r/w_secret dienstabhängig
# todo: Editiermöglichkeiten eintragen
use strict;
use utf8;
use English;
use CGI::Fast qw(:standard);
use Crypt::JWT qw(encode_jwt decode_jwt);
use JSON::XS;
use URI::Escape;
use List::MoreUtils qw(uniq);
use File::Slurp;
use lib qw(/usr/local/diglit, ../lib);
use Anno::Rights;
use Anno::DB;
$|++;

my $annotation_repository_url = "http://localhost:8080/fedora/rest/annotations";
my $secret='@9g;WQ_wZECHKz)O(*j/pmb^%$IzfQ,rbe~=dK3S6}vmvQL;F;O]i(W<nl.IHwPlJ)<y8fGOel$(aNbZ';

# Beispiel rtok: eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiamIifQ.H52l5V2CUgilIx5hrqSDHGvwE6kqXpG3zBMupyJrI90

sub error {
	my $mesg=shift;
#	print "Status: 400 Bad Request\r\n";
	printf "Content-Type: text/plain\r\n\r\nError:\n$0:\n%s\n", $mesg;
	goto next_request;
}

my $dbpasswd=read_file("/home/jb/db-passwd");
$dbpasswd=~s/[^\x20-\x7e]//g;
if(!length($dbpasswd)) { die "db-passwd not set\n"; }

my $dbh;
while(my $q=new CGI::Fast) {
	$dbh||=DBI->connect("DBI:mysql:database=annotations", "root", $dbpasswd, {mysql_enable_utf8=>1, RaiseError=>1});
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


	my $target=$q_param{target};
#	if(substr($target,0,1) ne "/") { $target="/$target"; }
#	if(index($target, "/.")>=0) { error "target: containing /. not allowed"; }
	my $service=$q_param{service};
	if(!length($service)) { error "service=?"; }

	# TODO: Berechtigungsprüfung
	if($q->request_method eq "POST" && Anno::Rights::rights($service, $target, $uid)<1) { # create
		error "not enough rights to create";
	}
	if($q->request_method eq "PUT" && Anno::Rights::rights($service, $target, $uid)<2) { # modi
		error "not enough rights to modify";
	}

	my $service_path=Anno::Rights::service_path($service);
	if(!length($service_path)) { error "service_path?"; }


	my $a_db=Anno::DB->new($dbh);
	if($q->request_method eq "GET") {
#		print "HTTP/1.1 200 OK\r\n";
		print "Content-Type: application/json\r\n";
		print "\r\n";
		if($q_param{id}) {
			print $a_db->get_revs($q_param{$id});
			next;
		}
		print $a_db->get_by_url($target);
		next;
	}
	elsif($q->request_method=~/^(PUT|POST)$/) { # modify content (title, ...)
#		print "HTTP/1.1 200 OK\r\n";
		print "Content-Type: application/json\r\n";
		print "\r\n";
		my($id,$rev)=$a_db->create_or_update(decode_json($q->get($q->request_method."DATA")));
		print qq!{"id": $id, "rev": $rev}!;
		next;
	}

	error "an error occured (request_method=".$q->request_method.")";

	next_request:
}

