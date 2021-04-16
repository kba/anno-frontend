#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-


function zipball_nm () {
  export LANG{,UAGE}=en_US.UTF-8  # make error messages search engine-friendly
  local SELFPATH="$(readlink -m -- "$BASH_SOURCE"/..)"
  cd -- "$SELFPATH"/../.. || return $?

  local DEST='test.nm.snapshot.zip'
  local NM_HTML=(
    test/html/*.nm.html
    )
  local NM_DEPS=()
  readarray -t NM_DEPS < <(
    grep -oPe '"(\.*/)*node_modules/[^"]+' -- "${NM_HTML[@]}" \
    | sed -re 's~^["./]+~~' | sort --version-sort --unique)
  local TEST_DEPS=()
  readarray -t TEST_DEPS < <(find test/ -type f -name '*.js')

  local PACK_FILES=(
    "${NM_HTML[@]}"
    "${NM_DEPS[@]}"
    dist/
    "${TEST_DEPS[@]}"
    )

  zip -r9 "$DEST" -- "${PACK_FILES[@]}" || return $?
  mv --verbose --target-directory="$SELFPATH" -- "$DEST" || return $?
}










zipball_nm "$@"; exit $?
