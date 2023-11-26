#!/usr/bin/env bash

VERSION="3a02d8f"
DSTDIR="samples/initdatas"

if [ ! -d "${DSTDIR}/tennis_atp" ]; then
  pushd ${DSTDIR} || exit
  test -d tennis_atp || git clone https://github.com/JeffSackmann/tennis_atp.git && cd tennis_atp && git checkout ${VERSION}
  popd || exit

  rm -f "${DSTDIR}/samples.db"
  sqlite3 -bail "${DSTDIR}/samples.db" < samples/initdatas/import-atp.sql
fi

