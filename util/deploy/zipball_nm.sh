#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-


function zipball_nm () {
  export LANG{,UAGE}=en_US.UTF-8  # make error messages search engine-friendly
  local SELFPATH="$(readlink -m -- "$BASH_SOURCE"/..)"
  cd -- "$SELFPATH"/../.. || return $?

  local ZIP_FN='tests.nm.snapshot.zip'
  local TESTS_DIR='test/html'

  case " $* " in
    *' PD '* | \
    *' pack '* ) webpack -d || return $?;;
  esac

  local NM_HTML=(
    "$TESTS_DIR"/*.nm.html
    )
  local NM_DEPS=()
  find_nm_deps || return $?

  local TEST_DEPS=(
    -type f
    '(' -name '*.js'
      -o -name '*.css'
      ')'
    )
  readarray -t TEST_DEPS < <(find test/ "${TEST_DEPS[@]}")

  local PACK_FILES=(
    "${NM_HTML[@]}"
    "${NM_DEPS[@]}"
    dist/
    "${TEST_DEPS[@]}"
    util/deploy/
    )

  zip -r9 "$ZIP_FN" -- "${PACK_FILES[@]}" || return $?
  mv --verbose --target-directory="$TESTS_DIR" -- "$ZIP_FN" || return $?

  case " $* " in
    *' PD '* | \
    *' deploy '* ) deploy_to '.git/@/htdocs' .htaccess || return $?;;
  esac
}


function deploy_to () {
  local DEST_DIR="$1"; shift
  local CHECK_FILE="$1"; shift
  [ -z "$CHECK_FILE" ] || CHECK_FILE="$DEST_DIR/$CHECK_FILE"

  local ZIP_ABS="$PWD/$TESTS_DIR/$ZIP_FN"
  local HASH="$(sha1sum --binary -- "$ZIP_ABS")"
  HASH="${HASH:0:8}"
  [ -n "$HASH" ] || return 4$(echo "E: failed to checksum $ZIP_ABS" >&2)
  local SUBDIR="$DEST_DIR/$(date +%y%m%d-%H%M)-$HASH"
  echo "Gonna deploy to: $SUBDIR"
  [ -z "$CHECK_FILE" ] || [ -f "$CHECK_FILE" ] || return 4$(
    echo 'E: check file missing! Is the webspace mounted?' >&2)

  local UNZIP_OPTS=(
    -o    # overwrite existing files
    )
  [ -d "$SUBDIR" ] || mkdir -- "$SUBDIR" || return $?$(
    echo "E: failed to mkdir $SUBDIR" >&2)
  echo -n 'Upload zipball: '
  cp --verbose --no-target-directory \
    -- "$ZIP_ABS" "$SUBDIR"/pack.zip || return $?$(
    echo "E: failed to upload zipball to $SUBDIR" >&2)
  ( cd "$SUBDIR" && unzip "${UNZIP_OPTS[@]}" -- "$ZIP_ABS" ) || return $?$(
    echo "E: failed to deploy to $SUBDIR" >&2)
  echo "Deployed to: $SUBDIR"
}


function find_nm_deps () {
  local RGX='"(\.*/)*node_modules/($\
    |@/anno-common|$\
    |(@æ*/|)æ+)/'
  RGX="${RGX//$'\n'/}"
  RGX="${RGX//æ/[a-z0-9_-]}"
  local PKGS=()
  readarray -t PKGS < <(grep -hoPe "$RGX" -- "${NM_HTML[@]}" \
    | sed -re 's~^["./]+~~' | sort --version-sort --unique)
  for PKG in "${PKGS[@]}"; do
    refine_one_nm_dep "$PKG" || return $?
  done
  local N_FOUND="${#NM_DEPS[@]}"
  [ "$N_FOUND" -ge 10 ] || return 3$(
    echo "E: $FUNCNAME: found suspiciously few ($N_FOUND)" >&2)
  # printf '%s\n' "${NM_DEPS[@]}"; return 8
}


function refine_one_nm_dep () {
  local DEP="${1%/}"
  local ITEM=
  for ITEM in dist; do
    ITEM="$DEP/$ITEM"
    [ -d "$ITEM" ] || continue
    NM_DEPS+=( "$ITEM" )
    return 0
  done

  case "${DEP##*/}" in

    anno-common )
      NM_DEPS+=( "$DEP"/anno-webpack/dist );;

    font-awesome )
      NM_DEPS+=(
        "$DEP"/css
        "$DEP"/fonts
        );;

    semtonotes-client )
      NM_DEPS+=( "$DEP"/*.min.js );;

    * ) echo "E: What to pack for $DEP?" >&2; return 8;;
  esac
}










zipball_nm "$@"; exit $?
