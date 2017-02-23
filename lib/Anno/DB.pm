package Anno::DB;

use strict;
use warnings;
no warnings "uninitialized";
use Carp;
use DBI;
use UUID::Tiny ':std';
use JSON;

sub new {
	my($class, $dbh)=@_;
	my $self=bless({}, $class);
	if(ref($dbh) ne "DBI::db") { croak "...->new(\$dbh): ref(\$dbh) ne \"DBI::db\""; }
	$self->{dbh}=$dbh;
	$self->{json}=new JSON;
	$self->{json}->pretty(1);
	$self->{json}->canonical(1);
	$self->{dbh}->{RaiseError}=1;
	return $self;
}

my $u=undef;
my $slice={Slice=>{}};

sub create_or_update { # falls ref($o->{target})==SCALAR -> target ist anno_id
	my($self, $o)=@_;
	my $dbh=$self->{dbh};

	my $id=$$o{id}||create_uuid_as_string(UUID_RANDOM);
	my $rev;

	if(ref($$o{target}) ne "ARRAY" && $id eq $$o{target}) { croak "target_id == id"; return; } # keine Zirkelbezüge!
	if(ref($$o{body}) ne "ARRAY") { croak "body is not ARRAY"; return; }

	my $ret=eval {
		$dbh->begin_work;

		if(ref($$o{target}) ne "ARRAY") {
			my @target_ex=$dbh->selectrow_array("select rev from latest_rev where id=?",$u, $$o{target});
			if(!$target_ex[0]) { croak "target annotation $$o{target} does not exist"; return; }
		}

		my @latest_rev=$dbh->selectrow_array("select rev from latest_rev where id=?",$u, $id);	
		if($$o{id} && !$latest_rev[0]) { croak "requesting new revision for non-existent annotation $$o{id}"; return; }
		$rev=$latest_rev[0] + 1;
		if( ! $latest_rev[0]) {
			$dbh->do("insert latest_rev (id,rev) values (?,?)",$u, $id, $rev);
			$dbh->do("insert into anno_dest (anno_id,dest_id,dest_type) values (?,?,?)",$u, $id, $$o{target}||$id, ref($$o{target}) ne "ARRAY"?"anno":"target");
#			$dbh->do("insert into anno_body (anno_id,body_id) values (?,?)",$u, $id, $id);
		}
		else { # es gibt ältere Versionen
			$dbh->do("update latest_rev set rev=? where id=?",$u, $rev, $id);
			$dbh->do("update anno   set is_latest=0 where id=? and rev=?",$u, $id, $latest_rev[0]);
			$dbh->do("update target set is_latest=0 where id=? and rev=?",$u, $id, $latest_rev[0]);
			$dbh->do("update body   set is_latest=0 where id=? and rev=?",$u, $id, $latest_rev[0]);
		}

		$dbh->do("insert into anno (id,rev,is_latest,created, canonical,creator,motivation,rights,via) values (?,?,1,now(), ?,?,?,?,?)",$u, $id, $rev, 
			$$o{canonical}, $$o{creator}, $$o{motivation}, $$o{rights}, $$o{via});

		my $seq=1;
		for my $b (@{$$o{body}}) {
			$dbh->do("insert into body (id,rev,seq,is_latest, dc_title,format,languages,purpose,rights,type,value) values (?,?,?,1, ?,?,?,?,?,?,?)",$u, $id, $rev, $seq++,
				$$b{dc_title}, $$b{"format"}, $$b{languages}, $$b{purpose}, $$b{rights}, $$b{type}, $$b{value});
		}

		if(ref($$o{target}) ne "ARRAY") { $dbh->commit; return "ok"; }

		$seq=1;
		for my $t (@{$$o{target}}) {
			$dbh->do("insert into target (id,rev,seq,is_latest, format,languages,selector,service,url) values (?,?,?,1, ?,?,?,?,?)",$u, $id, $rev, $seq++,
				$$t{"format"}, $$t{languages}, $self->{json}->encode($$t{selector}), $$t{service}, $$t{url});
		}

		$dbh->commit;	return "ok";
	};
	if($ret ne "ok" || $@) {
		if($@) { croak $@; }
		eval { $dbh->rollback; };
		return;
	}
	return ($id, $rev);
}

sub ld_ish {
	my($x,$path)=@_;
	if(ref($x) eq "ARRAY") {
		for my $y (@{$x}) { ld_ish($y, $path); }
	}
	elsif(ref($x) eq "HASH") {
		my $rev=$x->{rev};
		my $seq=$x->{seq};

		my $tmp=$x->{creator};
		$x->{creator}=$x->{name};
		delete $x->{name};
		$x->{__creator_id}=$tmp;

		for my $k (keys %{$x}) {
			if(!defined($x->{$k})) {
				delete $x->{$k};
				next;
			}
			if($k eq "id") {
				$x->{$k}.="/rev$rev";
				if($path=~m!/(body|target)$!) {
					$x->{$k}.="/$1/seq$seq";
				}
				next;
			}
			if($k eq "id") {
#				$x->{$k}="http://.../".$x->{$k}; 
				next;
			}
			if($k eq "dc_title") {
				$x->{"dc:title"}=$x->{dc_title};
				delete $x->{dc_title};
				next;
			}
			if($k=~/^(rev|is_latest|seq)$/) {
				$x->{"__$k"}=$x->{$k};
				delete $x->{$k};
				next;
			}
			ld_ish($x->{$k}, "$path/$k");
		}
	}
	elsif(ref($x) ne "") {
		die sprintf("ref(%s) = %s ?\n", $path, ref($x));
	}
}

sub get_comments {
	my($self,$aid)=@_;
	my $dbh=$self->{dbh};

	my @comments;
	for my $row (@{$dbh->selectall_arrayref("select anno.*,name from anno_dest,anno left join creator on (anno.creator=creator.id) where anno_id=anno.id and dest_id=? and dest_type='anno' order by created",$slice, $aid)}) {
		push @comments, $row;
		$comments[$#comments]->{body}=$dbh->selectall_arrayref("select * from body where id=? and is_latest=1 order by seq",$slice, $row->{id});
		$comments[$#comments]->{'@context'}="http://www.w3.org/ns/anno.jsonld";
		my $c=$self->get_comments($row->{id});
		if(defined($c)) { $comments[$#comments]->{targeted_by}=$c; }
	}
	if(!scalar(@comments)) { return undef; }
	# kein ld_ish
	return \@comments;
}

sub get_by_url {
	my($self,$url)=@_;
	my $dbh=$self->{dbh};

	my @annos;
	for my $anno (@{$dbh->selectall_arrayref("select anno.*,name from target,anno left join creator on (anno.creator=creator.id) where url=? and target.is_latest=1 and anno.id=target.id and anno.is_latest=1 order by created",$slice, $url)}) {
		push @annos, $anno;
		$annos[$#annos]->{'@context'}="http://www.w3.org/ns/anno.jsonld";
		my $c=$self->get_comments($anno->{id});
		if(defined($c)) { $annos[$#annos]->{targeted_by}=$c; }
		$annos[$#annos]->{body}  =$dbh->selectall_arrayref("select * from body   where id=? and is_latest=1 order by seq",$slice, $anno->{id});
		$annos[$#annos]->{target}=$dbh->selectall_arrayref("select * from target where id=? and is_latest=1 order by seq",$slice, $anno->{id});
		for my $target (@{ $annos[$#annos]->{target} }) {
			$target->{selector}=$self->{json}->decode($target->{selector});
		}
	}
	ld_ish(\@annos);
	return $self->{json}->encode(\@annos);
}

sub get_revs {
	my($self,$aid,$rev)=@_;
	my $dbh=$self->{dbh};

	$rev=~s/\D//g;
	my $revsql=$rev?"and rev=$rev":"";
	my @annos;
	for my $anno (@{$dbh->selectall_arrayref("select * from anno,name left join creator on (anno.creator=creator.id) where id=? $revsql order by rev",$slice, $aid)}) {
		push @annos, $anno;
		$annos[$#annos]->{'@context'}="http://www.w3.org/ns/anno.jsonld";
	}

	if(scalar(@annos)==1) { # aus Performancegründen: body+target gibts nur bei 1er anno
	#print "here\n";
		$annos[$#annos]->{body}  =$dbh->selectall_arrayref("select * from body   where id=? and rev=? order by seq",$slice, $aid, $annos[$#annos]->{rev});
		$annos[$#annos]->{target}=$dbh->selectall_arrayref("select * from target where id=? and rev=? order by seq",$slice, $aid, $annos[$#annos]->{rev});
		for my $target (@{ $annos[$#annos]->{target} }) {
			$target->{selector}=$self->{json}->decode($target->{selector});
		}
	}

	ld_ish(\@annos);
	return $self->{json}->encode(\@annos);
}

1;

