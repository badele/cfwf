#!/usr/bin/env bash

cd samples || exit
test -d tennis_atp || git clone https://github.com/JeffSackmann/tennis_atp.git && cd tennis_atp && git checkout 3a02d8f

cd ../..
rm -f samples/samples.db
sqlite3 -bail samples/samples.db < samples/scripts/import-atp.sql
