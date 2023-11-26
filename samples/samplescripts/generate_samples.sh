#!/usr/bin/env bash

CFWF="deno run -A mod.ts"

$CFWF dataset init -c /tmp/config.json

# Dataset definition
$CFWF dataset set \
  -c /tmp/config.json \
  -t "     ATP Tour" \
  -d "$(cat << EOD
Here is a list of the best tennis players in the ATP rankings
from 2012 to 2022, as well as the list of winners of the
4 major Grand Slam tournaments.
EOD
)" \
  -m '{ "sources": [ "https://github.com/JeffSackmann/tennis_atp" ]}'

# Players
$CFWF dataset table add \
  -c /tmp/config.json \
  -f ./samples/initdatas/players.csv \
  -t players \
  -s "The best players (number of winning matches) beetween 2012-2022" \
  -a "left,right,left,center,right,right,right" \
  -m '{ "sources": [ "https://github.com/JeffSackmann/tennis_atp" ]}'

# Australian Open
$CFWF dataset table add \
  -c /tmp/config.json \
  -f ./samples/initdatas/australian_open.csv \
  -t "australian_open" \
  -s "Australian Open winners beetween 2012-2022" \
  -d "$(cat << EOD
The Australian Open is a tennis tournament held annually at Melbourne Park
in Melbourne, Victoria, Australia. The tournament is the first of the
four Grand Slam tennis events held each year.
EOD
)" \
  -l "year,tourney name,birth nat,winner" \
  -a "right,left,center,center" \
  -m '{ "sources": [ "https://fr.wikipedia.org/wiki/Open_d%27Australie" ]}'

# Roland Garros
$CFWF dataset table add \
  -c /tmp/config.json \
  -f ./samples/initdatas/roland_garros.csv \
  -t "roland_garros" \
  -s "Roland Garros winners beetween 2012-2022" \
  -d "$(cat << EOD
The major tennis tournament held over two weeks at the Stade Roland Garros
in Paris, France, beginning in late May each year. The tournament and venue are
named after the French aviator Roland Garros. The French Open is the premier
clay court championship in the world and the only Grand Slam tournament
currently held on this surface.
EOD
)" \
  -l "year,tourney name,birth nat,winner" \
  -a "right,left,center,center" \
  -m '{ "sources": [ "https://fr.wikipedia.org/wiki/Internationaux_de_France_de_tennis" ]}'

# US Open
$CFWF dataset table add \
  -c /tmp/config.json \
  -f ./samples/initdatas/us_open.csv \
  -t "us_open" \
  -s "US Open winners beetween 2012-2022" \
  -d "$(cat << EOD
The US Open Tennis Championships, commonly called the US Open, is a hardcourt tennis
tournament held annually in Queens, New York. Since 1987, the US Open has been
chronologically the fourth and final Grand Slam tournament of the year.
EOD
)" \
  -l "year,tourney name,birth nat,winner" \
  -a "right,left,center,center" \
  -m '{ "sources": [ "https://fr.wikipedia.org/wiki/US_Open_de_tennis" ]}'

# Wimbledon
$CFWF dataset table add \
  -c /tmp/config.json \
  -f ./samples/initdatas/wimbledon.csv \
  -t "wimbledon" \
  -s "Wimbledon winners beetween 2012-2022" \
  -d "$(cat << EOD
The Championships, commonly known simply as Wimbledon, is the oldest tennis tournament
in the world and is regarded by many as the most prestigious.
It has been held at the All England Lawn Tennis and Croquet Club in Wimbledon, London, since 1877
EOD
)" \
  -l "year,tourney name,birth nat,winner" \
  -a "right,left,center,center" \
  -m '{ "sources": [ "https://fr.wikipedia.org/wiki/Tournoi_de_Wimbledon" ]}'

$CFWF export -c /tmp/config.json -S -f ./samples/generated_by_sh.cfwf
