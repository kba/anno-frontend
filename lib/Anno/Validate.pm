package Anno::Validate;
use 5.010;
use strict;
use warnings;
use Carp;
use Data::Dumper;
use JSON::Validator qw(validate_json);
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
	  $self->{schema}->{$k}->load_and_validate_schema({
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
  return $self->{schema}->{$name}->validate($data);
}

#
# TODO use JSON::Validator and the JSON Schema in swagger.yml
#
# validate_post($anno)
#
# Validate that an object conforms to the input expected for a new top-level annotation
#
# Return an arrayref of error messages, empty if it's valid.
#
sub validate_post {
  my $obj = shift;
  my @errors;
  if (!$obj || ! ref($obj) || ref($obj) ne 'HASH') {
    push @errors, 'New annotation must be an object';
  } else {
    my %required_keys = ('target' => 'ARRAY', 'body' => 'ARRAY');
    for my $k (keys %required_keys) {
      if (!defined($obj->{$k})) {
        push @errors, "Missing required key '$k'";
      } else {
        if ((ref($obj->{$k}) ||'') ne $required_keys{$k}) {
          push @errors, "'$k' must be a " . $required_keys{$k};
        }
      }
    }
    for my $k (keys %{ $obj }) {
      if (!$required_keys{$k}) {
        push @errors, "Provided undeclared key '$k'";
      }
    }
  }
  return \@errors;
}

1;
