#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-


function webpack_hooks () {
  export LANG{,UAGE}=en_US.UTF-8  # make error messages search engine-friendly
  local SELFPATH="$(readlink -m -- "$BASH_SOURCE"/..)"
  cd -- "$SELFPATH"/.. || return $?

  local BUNDLE_DEST_BFN='dist/anno-frontend'

  wph_"$@" || return $?
}


function wph_on_before_normal_run () { true; }
function wph_on_build_start () { true; }
function wph_on_build_end () { true; }


function wph_on_build_exit () {
  sed -i -rf <(echo '
    # Censor local dev machine paths
    s~^([^A-Za-z0-9]+ \.\./)\S+(/node_modules/)~\1…\2~
    ') -- dist/*.js
}


function wph_on_after_done () {
  echo
  local AUDIENCE='prod'
  grep -qxPe '/\*+\/\s*\w+:' -- "$BUNDLE_DEST_BFN".js && AUDIENCE='dev'

  case "$AUDIENCE" in
    dev )
      cleanup_all_bundles_except "$AUDIENCE" || return $?;;
  esac

  mv --verbose --no-target-directory \
    -- "$BUNDLE_DEST_BFN"{,".$AUDIENCE"}.js || return $?
  du --human-readable -- dist/* || return $?
}


function cleanup_all_bundles_except () {
  local KEEP="$1"
  local FN=
  for FN in "$BUNDLE_DEST_BFN".*; do
    [ -f "$FN" ] || continue
    case "$FN" in
      "$BUNDLE_DEST_BFN.$KEEP".* ) ;;
      "$BUNDLE_DEST_BFN".js ) ;;
      * ) rm --verbose -- "$FN" || return $?;;
    esac
  done
}









webpack_hooks "$@"; exit $?
