#!/bin/sh
# Builds one-file/index.html: a copy of index.html whose code (style.css, marked.min.js, logic.js,
# and through logic.js everything else) loads from this GitHub repository through jsDelivr.
# Run it after committing a release, then commit the result:  sh one-file/make.sh [commit]
# The links are pinned to that commit, so a one-file site only changes when its owner uploads a newer copy.
set -e
cd "$(git rev-parse --show-toplevel)"
sha=$(git rev-parse "${1:-HEAD}")
cdn="https://cdn.jsdelivr.net/gh/Neerg18/lbm@$sha/"
ver=$(git show "$sha:logic.js" | sed -n "s/^const NEERG_VERSION = '\(.*\)';$/\1/p")

git show "$sha:index.html" | sed \
    -e "s#<link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">#<link rel=\"preconnect\" href=\"https://cdn.jsdelivr.net\" crossorigin>\n    &#" \
    -e "s#<!-- The ?v= tag .*-->#<!-- One-file NEERG $ver: the code loads from github.com/Neerg18/lbm through jsDelivr. To update, upload the newest one-file/index.html over this file. -->#" \
    -e "s#href=\"style.css?v=[^\"]*\"#href=\"${cdn}style.css\"#" \
    -e "s#src=\"marked.min.js\"#src=\"${cdn}marked.min.js\"#" \
    -e "s#src=\"logic.js?v=[^\"]*\"#src=\"${cdn}logic.js\"#" \
    > one-file/index.html

# Stop if index.html changed shape and a link was missed
[ "$(grep -c "$cdn" one-file/index.html)" = 3 ] || { echo "make.sh: expected 3 jsDelivr links in one-file/index.html" >&2; exit 1; }
echo "one-file/index.html: NEERG $ver, code from $sha"
