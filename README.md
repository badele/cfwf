<img src="logo.png" style="width: 100%" />

[![Latest version](https://deno.land/badge/cfwf/version)](https://deno.land/x/cfwf)
[![popularity](https://deno.land/badge/cfwf/popularity)](https://deno.land/x/cfwf)
[![Build status](https://github.com/badele/cfwf/workflows/CI/badge.svg)](https://github.com/badele/cfwf/actions/workflows/CI.yml)
[![Code coverage](https://codecov.io/gh/badele/cfwf/branch/main/graph/badge.svg)](https://codecov.io/gh/badele/cfwf)

**cfwf** is a tool and library designed to facilitate the conversion of tables
into a human-readable format compatible with a simple text file reader.

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

## Installation

```shell
curl -fsSL https://deno.land/x/install/install.sh | sh
deno install -A -fn cfwf https://deno.land/x/cfwf@0.0.1/mod.ts
cfwf convert -i https://media.githubusercontent.com/media/datablist/sample-csv-files/main/files/people/people-100.csv -o /tmp/people.cfwf
less -S /tmp/people.cfwf
```

## Usage

### Simple file conversion

```text
Usage:   cfwf convert --input <intput> --output <output>
Version: 0.0.1

Description:

  Convert files

Options:

  -h, --help                    - Show this help.
  -i, --input      <intput>     - Input filenme                 (required)
  -o, --output     <output>     - Output filenme                (required)
  -t, --tablename  <tablename>  - Define table name
  -s, --subtitle   <subtitle>   - Define table subtitle
  -l, --columns    <column>     - Columns name                  (Default: [])
  -a, --aligns     <column>     - Aligns for each columns
  -S, --separate                - Separate content & metadatas
```

```shell
cfwf convert -i https://media.githubusercontent.com/media/datablist/sample-csv-files/main/files/people/people-100.csv -o /tmp/people.cfwf
less -S /tmp/people.cfwf
```

### Multiples files conversion

```shell
cfwf dataset init -c /tmp/config.json

cfwf dataset set \
-c /tmp/config.json \
-t "     CSV Samples" \
-d "$(cat << EOD
This is an example of how to convert a CSV file into a CFWF file.
The data comes from the https://github.com/datablist/sample-csv-files project.
Thanks to the author for providing the example data.
EOD
)
" \
-m '{ "sources": [ "https://github.com/datablist/sample-csv-files" ]}'

cfwf table add \
-c /tmp/config.json \
-f https://media.githubusercontent.com/media/datablist/sample-csv-files/main/files/people/people-100.csv \
-t peoples \
-s "The peoples list" \
-l "Index,User Id,First Name,Last Name,Sex,Email,Phone,Date of birth,Job Title" \
-a "right,right,right,left,center,left,left,center,left" \
-m '{ "sources": [ "https://github.com/datablist/sample-csv-files/tree/main/files/people" ]}'

cfwf table add \
-c /tmp/config.json \
-f https://media.githubusercontent.com/media/datablist/sample-csv-files/main/files/customers/customers-100.csv \
-t customers \
-s "The customers list" \
-l "Index,Customer Id,First Name,Last Name,Company,City,Country,Phone 1,Phone 2,Email,Subscription Date,Website" \
-a "right,right,right,left,right,left,right,right,left,left,center,left" \
-m '{ "sources": [ "https://github.com/datablist/sample-csv-files/tree/main/files/customers" ]}'

cfwf export -c /tmp/config.json -o | less -S
```

#### Result

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

## Samples

You can see more examples in the `samples/samplesscripts/` folder

## Sample dataset

The samples dataset provided by :

- [JeffSackmann ATP tennis project](https://github.com/JeffSackmann/tennis_atp)
- [datablist sample csv files](https://github.com/datablist/sample-csv-files)
