#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-


function ci_test () {
  local REPO_DIR="$(readlink -m -- "$BASH_SOURCE"/../..)"
  cd -- "$REPO_DIR" || return $?
  [ -f 'webpack.config.js' ] || return $?$(
    echo 'E: Failed to determine REPO_DIR' >&2)

  npm install --global npm@7 || return $?
  npm install . || return $?
  npm run build || return $?
  npm test || return $?
}


ci_test "$@"; exit $?
