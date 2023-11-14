import { CFWF } from "../../src/cfwf.ts";
import { parseCSV } from "../../src/utils.ts";

// deno-lint-ignore no-explicit-any
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

const rgarros_txt = Deno.readTextFileSync("samples/roland_garros.csv");
const rgarros = parseCSV(rgarros_txt);

const usopen_txt = Deno.readTextFileSync("samples/us_open.csv");
const usopen = parseCSV(usopen_txt);

const wimbledon_txt = Deno.readTextFileSync("samples/wimbledon.csv");
const wimbledon = parseCSV(wimbledon_txt);

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

samples.addArray(
  "roland_garros",
  "Roland Garros winners beetween 2012-2022",
"The major tennis tournament held over two weeks at the Stade Roland Garros \n\
in Paris, France, beginning in late May each year. The tournament and venue are\n\
named after the French aviator Roland Garros. The French Open is the premier\n\
clay court championship in the world and the only Grand Slam tournament\n\
currently held on this surface.",
  ["year", "tourney name", "birth nat", "winner"],
  rgarros.values,
  {
    aligns: ["right", "left", "center", "center"],
    sources: [
      "https://fr.wikipedia.org/wiki/Internationaux_de_France_de_tennis",
      "https://github.com/JeffSackmann/tennis_atp",
    ],
  },
);

samples.addArray(
  "us_open",
  "US Open winners beetween 2012-2022",
"The US Open Tennis Championships, commonly called the US Open, is a hardcourt tennis\n\
tournament held annually in Queens, New York. Since 1987, the US Open has been \n\
chronologically the fourth and final Grand Slam tournament of the year.",
  ["year", "tourney name", "birth nat", "winner"],
  usopen.values,
  {
    aligns: ["right", "left", "center", "center"],
    sources: [
      "https://fr.wikipedia.org/wiki/US_Open_de_tennis",
      "https://github.com/JeffSackmann/tennis_atp",
    ],
  },
);

samples.addArray(
  "wimbledon",
  "wimbledon winners beetween 2012-2022",
"The Championships, commonly known simply as Wimbledon, is the oldest tennis tournament\n\
in the world and is regarded by many as the most prestigious.\n\
It has been held at the All England Lawn Tennis and Croquet Club in Wimbledon, London, since 1877",
  ["year", "tourney name", "birth nat", "winner"],
  wimbledon.values,
  {
    aligns: ["right", "left", "center", "center"],
    sources: [
      "https://fr.wikipedia.org/wiki/Tournoi_de_Wimbledon",
      "https://github.com/JeffSackmann/tennis_atp",
    ],
  },
);

const content = await samples.toCFWF({});
Deno.writeTextFileSync("samples.cfwf", content);
