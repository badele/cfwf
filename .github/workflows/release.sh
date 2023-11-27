#!/usr/bin/env bash

TAGVERSION=$1

cog changelog --at "$TAGVERSION" -t full_hash > GITHUB_CHANGELOG.md

# Version
sed -i "s/\".*\"/\"$TAGVERSION\"/" src/version.ts

# Readme
sed -i "s/\@[0-9]\.[0-9]\.[0-9]/@$TAGVERSION/" README.md
sed -i "s/Version\: [0-9]\.[0-9]\.[0-9]/Version: $TAGVERSION/" README.md
