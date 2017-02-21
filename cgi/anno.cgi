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
use LWP::UserAgent;
use JSON::XS;
use Time::HiRes qw(gettimeofday);
use MIME::Base64;
use URI::Escape;
use List::MoreUtils qw(uniq);
use lib qw(/usr/local/diglit, ../lib);
use Anno::Rights;
$|++;

sub htime {
	my ($seconds, $microseconds) = gettimeofday;
	return $seconds-$BASETIME +$microseconds*1e-6;
}

my $annotation_repository_url = "http://localhost:8080/fedora/rest/annotations";
my $secret='@9g;WQ_wZECHKz)O(*j/pmb^%$IzfQ,rbe~=dK3S6}vmvQL;F;O]i(W<nl.IHwPlJ)<y8fGOel$(aNbZ';

# Beispiel rtok: eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiamIifQ.H52l5V2CUgilIx5hrqSDHGvwE6kqXpG3zBMupyJrI90

# TODO: Exporting large trees of resources may fail because of memory limitations.  Exporting 250,000 simple objects (only the system-defined properties) was successful and resulted in a 400MB export file, but exporting larger sets of resources failed.  To work around this limitation, you can segment your repository (for example, into several top-level directories each containing 250,000 or fewer resources) and export each top-level directory as a separate export file.

sub error {
	my $mesg=shift;
#	print "Status: 400 Bad Request\r\n";
	printf "Content-Type: text/plain\r\n\r\nError:\n$0:\n%s\n", $mesg;
	goto next_request;
}

# target-beispiel: /salVII95/0537/46ba7b951f9bb
# logs in /usr/local/diglit-tomcat/logs/catalina.out

sub addRightTagsAndReplaceNames {
	my($xml, $service, $target, $uid)=@_;
	for my $acc_n ($xml->findnodes('//sv:property[@sv:name="foaf:account"]')) {
		if($acc_n->getAttribute("sv:type") ne "String") { error "account not string\n"; }
		for my $val_n ($acc_n->findnodes("sv:value")) {
			my $acc=$val_n->textContent;
			my $right=Anno::Rights::rights($service, $target, $uid);
			if($acc eq $uid) { $right=2; } # edit
			my $display_name=Anno::Rights::display_name($acc);
			if(length($display_name)) {
				$val_n->removeChildNodes;
				$val_n->appendText($display_name);
			}
			if($right) {
				my $sv_prop=XML::LibXML::Element->new("sv:property");
				$sv_prop->setAttribute("sv:name", "user_rights");
				$sv_prop->setAttribute("sv:type", "String");
				my $sv_value=XML::LibXML::Element->new("sv:value");
				$sv_value->addChild(XML::LibXML::Text->new($right>1?"edit":"comment"));
				$sv_prop->addChild($sv_value);
				$acc_n->parentNode->addChild($sv_prop);
			}
		}
	}

	if(scalar($xml->findnodes('sv:property[@sv:name="user_rights"]'))) { return; }
	my $right=Anno::Rights::rights($service, $target, $uid);
	if(!$right) { return; }

	my $sv_prop=XML::LibXML::Element->new("sv:property");
	$sv_prop->setAttribute("sv:name", "user_rights");
	$sv_prop->setAttribute("sv:type", "String");
	my $sv_value=XML::LibXML::Element->new("sv:value");
	$sv_value->addChild(XML::LibXML::Text->new("comment"));
	$sv_prop->addChild($sv_value);
	$xml->addChild($sv_prop);
}

sub decodeBinary {
	my $xml=shift;

	for  my $parent_n ($xml->findnodes('//*[@sv:type="Binary"]')) {
		for my $val_n ($parent_n->findnodes("sv:value")) {
			my $t=decode_base64($val_n->textContent);
			$val_n->removeChildNodes;
			$val_n->appendText($t);
		}
		$parent_n->setAttribute("sv:type", "String");
	}
}

sub turtleEscape {
	my $s=shift;
	$s=~s/\\/\\\\/g;
	$s=~s/\n/\\t/g;
	$s=~s/\n/\\n/g;
	$s=~s/\n/\\r/g;
	$s=~s/"/\\"/g;
	$s=~s/([\x00-\x1F])/sprintf("\\u%04x", ord($1))/gex;
	return $s;
}

while(my $q=new CGI::Fast) {

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
	if(substr($target,0,1) ne "/") { $target="/$target"; }
	if(index($target, "/.")>=0) { error "target: containing /. not allowed"; }
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
	my $url=$annotation_repository_url.$service_path.$target;
	my $ua=LWP::UserAgent->new;
	my $h=HTTP::Headers->new;
#	$h->header("Accept"=>"application/jcr+xml"); # nicht zusammen mir /fcr:versions - dort nur Turtle-Ausgabe, sonst "500"
#	$h->header("Prefer"=>q{return=representation; include="http://fedora.info/definitions/v4/repository#EmbedResources"});
#	$h->header("Limit"=>"-1");

# http://anno.ub.uni-heidelberg.de/cgi-bin/anno.cgi?target=/cpg389/0018

	if($q->request_method eq "GET") {
# http://anno.ub.uni-heidelberg.de/cgi-bin/anno.cgi?rtok=eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiamIifQ.H52l5V2CUgilIx5hrqSDHGvwE6kqXpG3zBMupyJrI90&func=getAnnotations&target=/cpg148/0074/09a70a00f6719/fcr:versions/version1476734038
# curl -X GET 'http://anno.ub.uni-heidelberg.de/cgi-bin/anno.cgi?rtok=eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiamIifQ.H52l5V2CUgilIx5hrqSDHGvwE6kqXpG3zBMupyJrI90&target=/testjbx/0001'
		if(index($url, "/fcr:versions")<0) { $url.="/fcr:export?recurse=true&skipBinary=false"; } # weil normales GET nicht funktioniert, auch nicht mit Prefer-Header (s.o.)
		my $resp=$ua->request(HTTP::Request->new($q->request_method, $url, $h));
		if($resp->is_success && index($url, "/fcr:versions")<0) {
			printf "Status: %s\r\n", $resp->status_line;
			for my $header_line (split(/\r\n/, $resp->headers->as_string, -1)) {
				if($header_line=~/^Content-Length/i) { next; }
				print "$header_line\r\n";
			}
			use XML::LibXML;
			my $doc;
			my $start=htime;
			eval { $doc=XML::LibXML->new->parse_string($resp->content) };
			if($@) { error $@; }
			addRightTagsAndReplaceNames($doc->documentElement, $service, $target, $uid);
			decodeBinary($doc->documentElement);
			my $stop=htime;
			print $doc->toString(1);
			printf "<!-- process xml: %.0f req/s -->\n", 1/($stop-$start +1e-10);
		}
		else {
			printf "Status: %s\r\n", $resp->status_line;
			print $resp->headers->as_string;
			print "\r\n";
			print $resp->content;
		}
		next;
	}
	elsif($q->request_method eq "PUT") { # modify content (title, ...)
		if($q_param{new_version}) { # erst POST
			my $version="version".time();
			$h->header("SLUG"=>$version);
			my $req=HTTP::Request->new("POST", $url, $h); # Abweichung!
			my $resp=$ua->request($req);
			if(!$resp->is_success) { error "can't create new version '$version' for '$url'"; }
			$h->remove_header("SLUG");
			$url=$resp->headers->header("Location"); # The slug you provide does not guarantee the location of the created resource. Clients must check the Location header for the path to the created resource.
		}

		my $json;
		eval  { $json=decode_json($q->param($q->request_method."DATA")) };
		if($@ || !$json || ref($json) ne "ARRAY") { error "...DATA: decode_json: $@"; }

		my $sparql=q!PREFIX dc: <http://purl.org/dc/elements/1.1/> 
PREFIX svg: <http://www.w3.org/2000/svg#> 
DELETE {
<> !;
		my @delwhe; # DELETE und WHERE-Konstrukte
		for my $href (@{$json}) {
			my($k,$v)=%{$href};
			if($k!~/^(dc|svg):\w+$/) { next; }
			my $kvar=$k; $kvar=~s/\W//g;
			push @delwhe, "$k ?$kvar";
		}
		@delwhe=uniq @delwhe;
		$sparql.=join(";\n", @delwhe)." .\n}\nINSERT {\n<> ";
		my @ins;
		for my $href (@{$json}) {
			my($k,$v)=%{$href};
			if($k!~/^(dc|svg):\w+$/) { next; }
			push @ins, "$k ".turtleEscape($v);
		}
		$sparql.=join(";\n", @ins)." .\n}\nWHERE {\n<> "; # TODO!!! WHERE ohne dc:identifier ?
		$sparql.=join(";\n", @delwhe)." .\n}\n";

		$h->header("Content-Type"=>"application/sparql-update"); # TODO: charset?
		my $req=HTTP::Request->new("PATCH", $url, $h, $sparql);
		my $resp=$ua->request($req);
		printf "Status: %s\r\n", $resp->status_line;
		print $resp->headers->as_string;
		print "\r\n";
		print $resp->content;
		next;
	}
	elsif($q->request_method eq "POST") { # insert a new annotation/ fedora/node
		my $json;
		use UUID::Tiny ':std';
		my $uuid=create_uuid(UUID_RANDOM);
		my $target="$target/$uuid";

		eval  { $json=decode_json($q->param($q->request_method."DATA")) };
		if($@ || !$json || ref($json) ne "ARRAY") { error "...DATA: decode_json: $@"; }
		my $turtle=q{PREFIX dc: <http://purl.org/dc/elements/1.1/> 
PREFIX svg: <http://www.w3.org/2000/svg#> 
PREFIX foaf:<http://xmlns.com/foaf/0.1/> 
PREFIX fedora:<http://fedora.info/definitions/v4/indexing#>
<> foaf:account "}.turtleEscape($uid).qq{" .
<> dc:identifier "$uuid" .
};
		for my $href (@{$json}) {
			my($k,$v)=%{$href};
			if($k!~/^(dc|svg|foaf|fedora):\w+$/) { next; }
			if($k eq "foaf:account") { next; }
			if($k eq "dc:identifier") { next; }
			$v=turtleEscape($v);
			$turtle.=qq{<> $k "$v" .\n};
		}

		$h->header("Content-Type"=>"text/turtle"); # TODO: charset?
		my $req=HTTP::Request->new("PUT", $url, $h, $turtle);
		my $resp=$ua->request($req);
		printf "Status: %s\r\n", $resp->status_line;
		print $resp->headers->as_string;
		print "\r\n";
		print $resp->content;
		next;
	}

	error "an error occured (request_method=".$q->request_method.")";

	next_request:
}

