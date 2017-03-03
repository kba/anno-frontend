package Anno::Rights;
use strict;
use List::Util qw(first min max);

my %level=(
	"read"=>0,
	"write"=>1,
	"admin"=>2,
);

my %service_groupcache;
my %conf=(
	user=>{
		'wgd@DWork'=>'Projekt ›Welscher	 Gast digital‹',
	},
	usergroup=>{
		admindiglit=>['rt126@uni-heidelberg.de'],
	},
	service=>{
		diglit=>{
			name=>'Heidelberger historische Bestände - digital',
			path=>'/de/uni-heidelberg/ub/digi/diglit',
			groupservice=>sub { 
				my $obj=shift;
				my ($nix, $pn)=split m!/!, $obj;
				if(length($service_groupcache{diglit}->{$pn})) {
					return $service_groupcache{diglit};
				}
				my $result="sammlung1,handschriften";
				$service_groupcache{diglit}->{$pn}=$result;
				return $result;
			}, # liefert Smlg; => Cache
			indexservice=>'http://',
		},
	},
	access=>{ # Owner hat immer Write-Recht; bestehende Anno dürfen nur von Owner o. admin editiert werden.
		diglit=>{
			''=>{
				'@admindiglit'=>'admin',
			},
			'/@sammlung1'=>{
				'wp417@uni-heidelberg.de'=>'write',
			},
			'/cpg389'=>{
			},
			# ...
		},
		service2=>{},
	},
);

sub service_path {
	my $service=shift;
	return $conf{service}->{$service}->{path};
}

sub display_name {
	my $uid=shift;
	return $conf{user}->{$uid}; 
}

sub find_uid_groups {	
	my $uid=shift;
	my @uid_groups;
	while(my($group_name, $uid_list)=each %{$conf{usergroup}}) {
		my @match=grep { $_ eq $uid } @{$uid_list};
		if(scalar(@match)) { push @uid_groups, $group_name; }
	}
	return @uid_groups;
}

sub usergroup_rights {
	my($uid, $uid_groups, $a_subj_rights)=@_;
	my $right=0;
	while(my($a_ug, $a_rightstr)=each %{$a_subj_rights}) {
		if($a_ug ne $uid && !length(first {'@'.$_ eq $a_ug} @{$uid_groups})) { next; }
		$right=max($right, $level{$a_rightstr});
	}
	return $right;
}

sub common_obj {
	my($a, $b)=@_;
	my @aa=split m!/!, $a;
	my @ba=split m!/!, $b;
	my $minlen=min(scalar(@aa), scalar(@ba));
	for(my $i=0; $i<$minlen; $i++) {
		if($aa[$i] ne $ba[$i]) { return 0; }
	}
	return 1;
}

sub rights {
	my($service, $obj, $uid)=@_;
	if (!$service) {
        # XXX TODO what to do with undefined groups?
        return -1;
    }
	my $service_config = $conf{service}->{$service};
	if (!$service_config) {
        # XXX TODO what to do with unconfigured groups?
        return -1;
    }
	my @uid_groups=find_uid_groups($uid);
	my @obj_groups=grep { length($_) } split /[ ,;]+/, $service_config->{groupservice}->($obj);
	my $right;
	while(my($a_obj, $a_subj_rights)=each %{$conf{access}->{$service}}) { # alle "access" durchgehen...
		if(substr($a_obj, 0, 2) ne '/@') {
			if(common_obj($obj, $a_obj)) {
				$right=max($right, usergroup_rights($uid, \@uid_groups, $a_subj_rights));
			}
			next;
		}
		# $a_obj fängt doch mit /@ an...
		for my $obj_group (@obj_groups) {
			if($a_obj ne '/@'.$obj_group) { next; }
			$right=max($right, usergroup_rights($uid, \@uid_groups, $a_subj_rights));
		}
	}
	return $right;
}

1;

