#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-


function webpack_hooks () {
  export LANG{,UAGE}=en_US.UTF-8  # make error messages search engine-friendly
  local SELFPATH="$(readlink -m -- "$BASH_SOURCE"/..)"
  cd -- "$SELFPATH"/.. || return $?
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

function wph_on_after_done () { true; }











webpack_hooks "$@"; exit $?
