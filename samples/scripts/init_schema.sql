CREATE TABLE IF NOT EXISTS "players"(
"player_id" TEXT, "name_first" TEXT, "name_last" TEXT, "hand" TEXT,
 "dob" TEXT, "ioc" TEXT, "height" TEXT, "wikidata_id" TEXT);

CREATE TABLE IF NOT EXISTS "rankings"(
"ranking_date" TEXT, "rank" TEXT, "player" TEXT, "points" TEXT);

CREATE TABLE IF NOT EXISTS "matches"(
"tourney_id" TEXT, "tourney_name" TEXT, "surface" TEXT, "draw_size" TEXT,
 "tourney_level" TEXT, "tourney_date" TEXT, "match_num" INTEGER, "winner_id" TEXT,
 "winner_seed" TEXT, "winner_entry" TEXT, "winner_name" TEXT, "winner_hand" TEXT,
 "winner_ht" TEXT, "winner_ioc" TEXT, "winner_age" TEXT, "loser_id" TEXT,
 "loser_seed" TEXT, "loser_entry" TEXT, "loser_name" TEXT, "loser_hand" TEXT,
 "loser_ht" TEXT, "loser_ioc" TEXT, "loser_age" TEXT, "score" TEXT,
 "best_of" TEXT, "round" TEXT, "minutes" TEXT, "w_ace" TEXT,
 "w_df" TEXT, "w_svpt" TEXT, "w_1stIn" TEXT, "w_1stWon" TEXT,
 "w_2ndWon" TEXT, "w_SvGms" TEXT, "w_bpSaved" TEXT, "w_bpFaced" TEXT,
 "l_ace" TEXT, "l_df" TEXT, "l_svpt" TEXT, "l_1stIn" TEXT,
 "l_1stWon" TEXT, "l_2ndWon" TEXT, "l_SvGms" TEXT, "l_bpSaved" TEXT,
 "l_bpFaced" TEXT, "winner_rank" TEXT, "winner_rank_points" TEXT, "loser_rank" TEXT,
 "loser_rank_points" TEXT);
