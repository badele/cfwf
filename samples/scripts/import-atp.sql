.head on
.nullvalue NULL

-- PRAGMA synchronous = OFF;

-- BEGIN TRANSACTION;

.read './samples/scripts/init_schema.sql'

.import --csv '/home/badele/ghq/github.com/JeffSackmann/tennis_atp/atp_players.csv' players

.import --csv '/home/badele/ghq/github.com/JeffSackmann/tennis_atp/atp_rankings_00s.csv' rankings
.import --csv '/home/badele/ghq/github.com/JeffSackmann/tennis_atp/atp_rankings_10s.csv' rankings
.import --csv '/home/badele/ghq/github.com/JeffSackmann/tennis_atp/atp_rankings_20s.csv' rankings

.import --csv '/home/badele/ghq/github.com/JeffSackmann/tennis_atp/atp_matches_2022.csv' matches
.import --csv '/home/badele/ghq/github.com/JeffSackmann/tennis_atp/atp_matches_2021.csv' matches
.import --csv '/home/badele/ghq/github.com/JeffSackmann/tennis_atp/atp_matches_2020.csv' matches
.import --csv '/home/badele/ghq/github.com/JeffSackmann/tennis_atp/atp_matches_2019.csv' matches
.import --csv '/home/badele/ghq/github.com/JeffSackmann/tennis_atp/atp_matches_2018.csv' matches
.import --csv '/home/badele/ghq/github.com/JeffSackmann/tennis_atp/atp_matches_2017.csv' matches
.import --csv '/home/badele/ghq/github.com/JeffSackmann/tennis_atp/atp_matches_2016.csv' matches
.import --csv '/home/badele/ghq/github.com/JeffSackmann/tennis_atp/atp_matches_2015.csv' matches
.import --csv '/home/badele/ghq/github.com/JeffSackmann/tennis_atp/atp_matches_2014.csv' matches
.import --csv '/home/badele/ghq/github.com/JeffSackmann/tennis_atp/atp_matches_2013.csv' matches
.import --csv '/home/badele/ghq/github.com/JeffSackmann/tennis_atp/atp_matches_2012.csv' matches

-- SELECT ranking_date,substr(ranking_date,1,4) as year,ioc,name_first,name_last,points 
-- FROM atp_rankings r INNER JOIN atp_players p ON (r.player=p.player_id) 
-- WHERE rank=1 AND ranking_date>=20000101 
-- GROUP BY year HAVING ranking_date=max(ranking_date)
-- ORDER by ranking_date DESC
-- LIMIT 11;

.separator ","

--Top players
.output samples/players.csv
SELECT  winner_ioc, p.name_first, p.name_last, hand, height, substr(dob,1,4) as birth,count(*) as nbwins from matches m
INNER JOIN players p ON (m.winner_id=p.player_id)
WHERE round="F" 
GROUP BY winner_id
ORDER BY count(*) DESC
LIMIT 10;

-- Australian Open
.output samples/australian_open.csv
SELECT substr(tourney_id,1,4) as year, tourney_name, winner_ioc, winner_name from matches
WHERE tourney_name = "Australian Open" AND round="F"
ORDER BY tourney_id desc
LIMIT 11;

-- Roland Garros
.output samples/roland_garros.csv
SELECT substr(tourney_id,1,4) as year, tourney_name, winner_ioc, winner_name from matches
WHERE tourney_name = "Roland Garros" AND round="F"
ORDER BY tourney_id desc
LIMIT 11;

-- Wimbledon
.output samples/wimbledon.csv
SELECT substr(tourney_id,1,4) as year, tourney_name, winner_ioc, winner_name from matches
WHERE tourney_name = "Wimbledon" AND round="F" 
ORDER BY tourney_id desc
LIMIT 11;

-- Us Open
.output samples/us_open.csv
SELECT substr(tourney_id,1,4) as year, tourney_name, winner_ioc, winner_name from matches
WHERE (tourney_name = "Us Open" OR tourney_name = "US Open") AND round="F"
ORDER BY tourney_id desc
LIMIT 11;



