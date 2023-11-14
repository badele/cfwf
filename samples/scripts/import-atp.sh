#!/usr/bin/env bash

# SRCDATAS="/home/badele/ghq/github.com/JeffSackmann/tennis_atp"

rm -f samples/samples.db 
sqlite3 -bail samples/samples.db < samples/scripts/import-atp.sql
