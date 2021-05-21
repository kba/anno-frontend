#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-


function zipball_nm () {
  export LANG{,UAGE}=en_US.UTF-8  # make error messages search engine-friendly
  local SELFPATH="$(readlink -m -- "$BASH_SOURCE"/..)"
  cd -- "$SELFPATH"/../.. || return $?

  local ZIP_FN='test.nm.snapshot.zip'
  local NM_HTML=(
    test/html/*.nm.html
    )
  local NM_DEPS=()
  readarray -t NM_DEPS < <(
    grep -hoPe '"(\.*/)*node_modules/[^"]+' -- "${NM_HTML[@]}" \
    | sed -re 's~^["./]+~~' | sort --version-sort --unique)
  local TEST_DEPS=()
  readarray -t TEST_DEPS < <(find test/ -type f -name '*.js')

  local PACK_FILES=(
    "${NM_HTML[@]}"
    "${NM_DEPS[@]}"
    dist/
    "${TEST_DEPS[@]}"
    )

  zip -r9 "$ZIP_FN" -- "${PACK_FILES[@]}" || return $?
  mv --verbose --target-directory="$SELFPATH" -- "$ZIP_FN" || return $?

  case " $* " in
    *' deploy '* ) deploy_to '.git/@/htdocs' .htaccess || return $?;;
  esac
}


function deploy_to () {
  local DEST_DIR="$1"; shift
  local CHECK_FILE="$1"; shift
  [ -z "$CHECK_FILE" ] || CHECK_FILE="$DEST_DIR/$CHECK_FILE"

  local ZIP_ABS="$SELFPATH/$ZIP_FN"
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










zipball_nm "$@"; exit $?
