#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-

function build_cli () {
  export LANG{,UAGE}=en_US.UTF-8  # make error messages search engine-friendly
  local REPO_TOP="$(readlink -m -- "$BASH_SOURCE"/../..)"
  cd -- "$REPO_TOP" || return $?

  local FLAVOR="${1:-all}"; shift
  build_"$FLAVOR" "$@" || return $?
}


function build_lint () {
  echo 'Lint…'
  local LINT_CMD=(
    eslint
    --ext='js,mjs'
    --
    src/
    *.js
    )
  SECONDS=0
  "${LINT_CMD[@]}" || return $?
  echo "Linter had no complaints, took $SECONDS sec."
}


function build_dev () {
  WEBPACK_AUDIENCE= webpack || return $?
}


function build_prod () {
  WEBPACK_AUDIENCE='prod' webpack || return $?
}


function build_all () {
  build_lint || return $?
  build_dev || return $?
  build_prod || return $?
}






build_cli "$@"; exit $?
