#!/usr/bin/env bash
# Does the documentation say what `api.json` says?
#
#   ./check.sh
#
# The check is `check/`, a Bintana console project -- no display and no window.
# It reads `api.json` and the Markdown, and fails when a member has no row, an
# event is documented with the wrong arguments, a long page lists a member and
# never explains it, or a page is not what `tools/docs` would write.
#
#   BINTANA=<path>      the runtime to run it with (else one is looked for)
#   BINTANA_API=<path>  the manifest (else `api.json`, fetched if missing)
#   BINTANA_SRC=<path>  a checkout of the runtime, where links into it are
#                       checked; without it those links are only counted
set -uo pipefail
cd "$(dirname "$0")"

BINTANA=${BINTANA:-}
if [[ -z $BINTANA ]]; then
    for c in ../bintana/build/bintana /usr/bin/bintana /usr/local/bin/bintana; do
        if [[ -x $c ]]; then BINTANA=$c; break; fi
    done
fi

if [[ -z ${BINTANA_API:-} && ! -f api.json ]]; then
    tools/fetch-api.sh
fi

if [[ -z $BINTANA || ! -x $BINTANA ]]; then
    echo "no runtime: set BINTANA=<path to bintana>" >&2
    exit 2
fi

exec "$BINTANA" check "$PWD"
