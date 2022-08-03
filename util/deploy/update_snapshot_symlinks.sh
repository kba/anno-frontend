#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-


function upd_syms () {
  export LANG{,UAGE}=en_US.UTF-8  # make error messages search engine-friendly

  local DEST="${1%/}"; shift
  case "$DEST" in
    '' ) find_unaliased_snapshot_dirs; return $?;;
    [0-9]* ) ;;
    * ) echo "E: dest must start with a digit" >&2; return 3;;
  esac

  [ -d "$DEST" ] || return 3$(echo "E: dest must be a directory." >&2)
  [ ! -L "$DEST" ] || return 3$(echo "E: dest must not be a symlink." >&2)

  local LINK=
  for LINK in "$@"; do
    LINK="${LINK%/}"
    [ -L "$LINK" ] && rm --verbose -- "$LINK"
    ln --verbose --symbolic --no-target-directory \
      -- "$DEST" "$LINK" || return $?
  done

  find_unaliased_snapshot_dirs || return $?
}


function find_unaliased_snapshot_dirs () {
  local SNAP_PATTERN='2*-*-*'
  local FMDT='find -maxdepth 1 -type'
  local SNAPS="$($FMDT d -name "$SNAP_PATTERN" -printf '%f\n')"
  [ -n "$SNAPS" ] || return 4$(
    echo "E: $FUNCNAME: Found no snapshot dirs in: $PWD" >&2)
  local ALIASED="$($FMDT l -lname "$SNAP_PATTERN" -printf '%l\n')"
  [ -n "$ALIASED" ] || return 4$(
    echo "E: $FUNCNAME: Found no snapshot dir aliases in: $PWD" >&2)
  local UN_AL=()
  readarray -t UN_AL < <( <<<"$SNAPS" grep -xvFe "$ALIASED" | LANG=C sort )
  echo "D: un-aliased snapshot directories (n=${#UN_AL[@]}): ${UN_AL[*]:-—}"
}


upd_syms "$@"; exit $?
