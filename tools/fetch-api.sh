#!/usr/bin/env bash
# Downloads `api.json` for the ref in `bintana-ref.txt`.
#
#   tools/fetch-api.sh
#
# The manifest is the runtime's public surface as data, built by `tools/apijson`
# in the repository that ships the code. This is where a checkout of the
# documentation gets it: one file, at the ref the pages are written against, so
# nothing here needs the runtime's tree, its parser or its build.
set -euo pipefail
cd "$(dirname "$0")/.."

ref=$(tr -d '[:space:]' < bintana-ref.txt)
if [[ -z $ref ]]; then
    echo "bintana-ref.txt is empty -- a tag or a commit, and nothing else" >&2
    exit 2
fi

url="https://raw.githubusercontent.com/getbintana/bintana/${ref}/api.json"
curl -fsSL "$url" -o api.json
echo "api.json from bintana ${ref}"
