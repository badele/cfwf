#!/usr/bin/env bash

TAGVERSION=$1
TAGVERSION="v0.1.0"
VERSION="${TAGVERSION:1}"

cog changelog --at "$TAGVERSION" -t full_hash > GITHUB_CHANGELOG.md
sed -i "s/\".*\"/\"$VERSION\"/" src/version.ts
sed -i "s/\@[0-9]\.[0-9]\.[0-9]/@$VERSION/" README.md

