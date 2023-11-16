<img src="logo.png" style="width: 100%" />

[![Latest version](https://deno.land/badge/cfwf/version)](https://deno.land/x/cfwf)
[![popularity](https://deno.land/badge/cfwf/popularity)](https://deno.land/x/cfwf)
[![Build status](https://github.com/badele/cfwf/workflows/CI/badge.svg?branch=main)](https://github.com/badele/cfwf/actions/workflows/CI.yml)
[![Code coverage](https://codecov.io/gh/badele/cfwf/branch/main/graph/badge.svg)](https://codecov.io/gh/badele/cfwf)

**cfwf** is a library designed to facilitate the conversion of tables or
dictionaries into a human-readable format compatible with a simple text file
reader.

## Project Motivation

This project was initiated due to a dissatisfaction with the CSV file format,
which is often considered unreadable without the use of dedicated tools. From my
past experiences handling telematic files such as Minitel or BBS, sought to
develop a solution that would provide better readability and usability for
tabular data.

## Features

- **Conversion of Single or Multiple Tables:** The cfwf library enables the
  conversion of one or more tables into a single CFWF dataset file.

- **Commentary and Metadata Inclusion:** Posibility to add comments and metadata
  to the entire CFWF file, also for each table

## Example

### Code

```typescript
import { CFWF } from "./mod.ts";
import { parseCSV } from "./src/utils.ts";

const metas: any = {
  title: "     ATP Tour",
  comment: "Here is a list of the best tennis players in the ATP rankings\n\
from 2012 to 2022, as well as the list of winners of the\n\
4 major Grand Slam tournaments.",
  sources: [
    "https://github.com/JeffSackmann/tennis_atp",
  ],
};

const samples = new CFWF(metas);

const players_txt = Deno.readTextFileSync("samples/players.csv");
const players = parseCSV(players_txt);

const australian_txt = Deno.readTextFileSync("samples/australian_open.csv");
const australian = parseCSV(australian_txt);

samples.addArray(
  "players",
  "The best players (number of winning matches) beetween 2012-2022 ",
  "",
  players.columns,
  players.values,
  {
    aligns: ["left", "right", "left", "center", "right", "right", "right"],
    sources: "https://github.com/JeffSackmann/tennis_atp",
  },
);

samples.addArray(
  "australian_open",
  "Australian Open winners beetween 2012-2022",
"The Australian Open is a tennis tournament held annually at Melbourne Park\n\
in Melbourne, Victoria, Australia. The tournament is the first of the \n\
four Grand Slam tennis events held each year.",
  ["year", "tourney name", "birth nat", "winner"],
  australian.values,
  {
    aligns: ["right", "left", "center", "center"],
    sources: [
      "https://fr.wikipedia.org/wiki/Open_d%27Australie",
      "https://github.com/JeffSackmann/tennis_atp",
    ],
  },
);
```

### Result

```text
            ___   _____ ______    _____                     
           / _ \ |_   _|| ___ \  |_   _|                    
          / /_\ \  | |  | |_/ /    | |    ___   _   _  _ __ 
          |  _  |  | |  |  __/     | |   / _ \ | | | || '__|
          | | | |  | |  | |        | |  | (_) || |_| || |   
          \_| |_/  \_/  \_|        \_/   \___/  \__,_||_|   
                                                            
                             ┈┈┈                             
Here is a list of the best tennis players in the ATP rankings
from 2012 to 2022, as well as the list of winners of the
4 major Grand Slam tournaments.
                             ┈┈┈                             

players
The best players (number of winning matches) beetween 2012-2022 

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
winner_ioc   name_first   name_last   hand   height   birth   nbwins
──────────   ──────────   ─────────   ────   ──────   ─────   ──────
SRB               Novak   Djokovic     R        188    1987       64
ESP              Rafael   Nadal        L        185    1986       46
SUI               Roger   Federer      R        185    1981       33
GBR                Andy   Murray       R        190    1987       25
GER           Alexander   Zverev       R        198    1997       19
AUT             Dominic   Thiem        R        185    1993       17
RUS              Daniil   Medvedev     R        198    1996       16
ESP               David   Ferrer       R        175    1982       16
CRO               Marin   Cilic        R        198    1988       14
RUS              Andrey   Rublev       R        188    1997       13
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The Australian Open is a tennis tournament held annually at Melbourne Park
in Melbourne, Victoria, Australia. The tournament is the first of the 
four Grand Slam tennis events held each year.

australian_open
Australian Open winners beetween 2012-2022

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
year   tourney name      birth nat       winner    
────   ───────────────   ─────────   ──────────────
2022   Australian Open      ESP       Rafael Nadal 
2021   Australian Open      SRB      Novak Djokovic
2020   Australian Open      SRB      Novak Djokovic
2019   Australian Open      SRB      Novak Djokovic
2018   Australian Open      SUI      Roger Federer 
2017   Australian Open      SUI      Roger Federer 
2016   Australian Open      SRB      Novak Djokovic
2015   Australian Open      SRB      Novak Djokovic
2014   Australian Open      SUI      Stan Wawrinka 
2013   Australian Open      SRB      Novak Djokovic
2012   Australian Open      SRB      Novak Djokovic
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Sample dataset

The samples dataset provided by the
[JeffSackmann ATP tennis project](https://github.com/JeffSackmann/tennis_atp)
