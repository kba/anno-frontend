package Anno::Validate;
use 5.010;
use strict;
use warnings;
use Carp;
use Data::Dumper;
use JSON::Validator;
use File::Slurp qw(read_file);
use JSON qw(decode_json);
use FindBin qw($Bin);

sub new {
	my ($class) = @_;
	my $self = bless({}, $class);
	$self->{swagger} = decode_json(read_file("$Bin/../swagger.json"));
	$self->{validate} = {};
  # for my $k (keys %{ $self->{swagger}->{definitions} }) {
  for my $k ('AnnotationToPost', 'RevisionToPut') {
	  $self->{schema}->{$k} = JSON::Validator->new;
		# $self->{schema}->{$k}->load_and_validate_schema({
	  $self->{schema}->{$k}->schema({
	    %{ $self->{swagger}->{definitions}->{$k} },
	    definitions => $self->{swagger}->{definitions}
    });
  }
  return $self;
}

#
# validate($name, $data)
#
# Validate $data against the schema defined in the swagger definitions for $name
#
# see JSON::Validator::validate_json

sub validate {
  my ($self, $name, $data) = @_;
  my @errors = $self->{schema}->{$name}->validate($data);
  return {
    valid => scalar(@errors) == 0 ? 1 : 0,
    errors => [
      map {
      {
        path => $_->{path},
        message => $_->{message},
      }
      } @errors]
  } ;
}

1;
