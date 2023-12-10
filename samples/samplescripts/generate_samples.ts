// deno run -A samples/initdatas/initdatas/generate_samples.ts

import { CFWF } from "../../src/cfwf.ts";
import { readCSV } from "../../src/converter.ts";

const samples = new CFWF({});
samples.setDatasetProperties({
  title: "ATP Tour",
  description: "Here is a list of the best tennis players in the ATP rankings\
 from 2012 to 2022, as well as the list of winners of the 4 major Grand Slam\
 tournaments.",
  metadatas: {
    sources: [
      "https://github.com/JeffSackmann/tennis_atp",
    ],
  },
});

const players = await readCSV("samples/initdatas/players.csv");

samples.addTable({
  tablename: "players",
  subtitle: "The best players (number of winning matches) beetween 2012-2022",
  description: "",
  columns: players.columns,
  rows: players.rows,
  metadatas: {
    aligns: ["left", "right", "left", "center", "right", "right", "right"],
    sources: [
      "https://github.com/JeffSackmann/tennis_atp",
    ],
  },
});

const australian_open = await readCSV(
  "samples/initdatas/australian_open.csv",
);
samples.addTable({
  tablename: "australian_open",
  subtitle: "Australian Open winners beetween 2012-2022",
  description:
"The Australian Open is a tennis tournament held annually at Melbourne Park in\
 Melbourne, Victoria, Australia. The tournament is the first of the four Grand\
 Slam tennis events held each year.",
  columns: ["year", "tourney name", "birth nat", "winner"],
  rows: australian_open.rows,
  metadatas: {
    aligns: ["right", "left", "center", "center"],
    sources: [
      "https://fr.wikipedia.org/wiki/Open_d%27Australie",
    ],
  },
});

const rgarros = await readCSV("samples/initdatas/roland_garros.csv");
samples.addTable({
  tablename: "roland_garros",
  subtitle: "Roland Garros winners beetween 2012-2022",
  description:
"The major tennis tournament held over two weeks at the Stade Roland Garros in\
 Paris, France, beginning in late May each year. The tournament and venue are\
 named after the French aviator Roland Garros. The French Open is the premier\
 clay court championship in the world and the only Grand Slam tournament\
 currently held on this surface.",
  columns: ["year", "tourney name", "birth nat", "winner"],
  rows: rgarros.rows,
  metadatas: {
    aligns: ["right", "left", "center", "center"],
    sources: [
      "https://fr.wikipedia.org/wiki/Internationaux_de_France_de_tennis",
    ],
  },
});

const usopen = await readCSV("samples/initdatas/us_open.csv");
samples.addTable({
  tablename: "us_open",
  subtitle: "US Open winners beetween 2012-2022",
  description:
"The US Open Tennis Championships, commonly called the US Open, is a hardcourt\
 tennis tournament held annually in Queens, New York. Since 1987, the US Open\
 has been chronologically the fourth and final Grand Slam tournament of the\
 year.",
  columns: ["year", "tourney name", "birth nat", "winner"],
  rows: usopen.rows,
  metadatas: {
    aligns: ["right", "left", "center", "center"],
    sources: [
      "https://fr.wikipedia.org/wiki/US_Open_de_tennis",
    ],
  },
});

const wimbledon = await readCSV("samples/initdatas/wimbledon.csv");
samples.addTable({
  tablename: "wimbledon",
  subtitle: "Wimbledon winners beetween 2012-2022",
  description:
"The Championships, commonly known simply as Wimbledon, is the oldest tennis\
 tournament in the world and is regarded by many as the most prestigious. It\
 has been held at the All England Lawn Tennis and Croquet Club in Wimbledon,\
 London, since 1877",
  columns: ["year", "tourney name", "birth nat", "winner"],
  rows: wimbledon.rows,
  metadatas: {
    aligns: ["right", "left", "center", "center"],
    sources: [
      "https://fr.wikipedia.org/wiki/Tournoi_de_Wimbledon",
    ],
  },
});

samples.saveCFWF("./samples/generated_by_ts.cfwf", true);
