#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-


function anno_common_npm_symlinks () {
  export LANG{,UAGE}=en_US.UTF-8  # make error messages search engine-friendly
  local SELFPATH="$(readlink -m -- "$BASH_SOURCE"/..)"
  cd -- "$SELFPATH"/../.. || return $?

  local PKGS=(
    anno-errors
    anno-queries
    anno-schema
    anno-store
    anno-store-http
    anno-util
    )
  local PKG= LINK=
  for PKG in "${PKGS[@]}"; do
    LINK="node_modules/@kba/$PKG"
    [ -L "$LINK" ] && rm -- "$LINK"
    ln --symbolic --verbose --no-target-directory \
      -- "../../../anno-backend/anno-common/$PKG" "$LINK" || return $?
  done
}










anno_common_npm_symlinks "$@"; exit $?
