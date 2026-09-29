#!/usr/bin/env bash
# Writes the member rows of docs/llm and docs/reference from `api.json`.
#
#   tools/docs.sh            rewrite the pages whose rows are out of date
#   tools/docs.sh --check    say which, and fail, writing nothing
#
# A member's description lives beside it in the code -- the lines after its
# signature comment in the C, the JSDoc above it in JavaScript -- and the
# runtime publishes it in `api.json`, which is what this reads. The tables and
# the prose around them are written by hand. `./check.sh` runs the same
# comparison and fails while a page is out of date.
set -uo pipefail
cd "$(dirname "$0")/.."

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

exec "$BINTANA" tools/docs "$PWD" "$@"
