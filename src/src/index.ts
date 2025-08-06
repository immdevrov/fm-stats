import { filterByContractExpiryDate } from "./fields/expires";
import { readCsvFile, parsePlayerStats } from "./parser";
import { AttackingMidfilderProcessor } from "./roles/attacking-midfilder";
import { CentralDefenderProcessor } from "./roles/central-defender";
import { CentralMidfilderProcessor } from "./roles/central-midfilder";
import { DefensiveMidfilderProcessor } from "./roles/defensive-midfilder";
import { FullbackProcessor } from "./roles/fullback";
import { GoalKeeperProcessor } from "./roles/goalkeeper";
import { StrikersProcessor } from "./roles/striker";
import { WingerProcessor } from "./roles/winger";
import { arrayToCSV, saveCSVToFile } from "./save";
import { printTable } from "./utils";

function getCurrentDateFromFilePath(filePath: string) {
  const dateRegex = /(\d{2}_\d{2}_\d{4})\.csv$/;
  const match = filePath.match(dateRegex);
  if (!match) {
    console.error("No date found in the string, taking current date");
    return new Date();
  }
  const dateString = match[1];

  const [day, month, year] = dateString.split("_").map(Number);
  return new Date(year, month - 1, day);
}

async function main() {
  try {
    // Get the file path from command line arguments
    const filePath = process.argv[2];

    if (!filePath) {
      console.error("Please provide a CSV file path as an argument");
      process.exit(1);
    }
    console.log(`Processing filePath ${filePath}`);
    const csvContent = readCsvFile(filePath);
    const players = parsePlayerStats(csvContent);
    console.log(`Successfully loaded ${players.length} players`);

    const date = getCurrentDateFromFilePath(filePath);

    const dateFilteredPlayers = players;
    // const dateFilteredPlayers = [
    //   filterByContractExpiryDate({
    //     players,
    //     currentDate: date,
    //     options: "SIX_MONTHS",
    //   }),
    //   // alreadySignedForNextyear,
    // ].flat();
    //
    // console.log(`${dateFilteredPlayers.length} players on short contract`);

    const constructors = [
      CentralDefenderProcessor,
      GoalKeeperProcessor,
      StrikersProcessor,
      FullbackProcessor,
      WingerProcessor,
      DefensiveMidfilderProcessor,
      CentralMidfilderProcessor,
      AttackingMidfilderProcessor,
    ];

    const processors = constructors.map((func) => new func(dateFilteredPlayers));

    const analizedPromises = processors.map((processor) => {
      const name: string = Object.getPrototypeOf(processor).constructor.name;
      const filtered = processor.filter();
      const analized = processor.analize(filtered as any);

      const withBadges = analized.filter((p) => p.badges.length);
      const groupedBadges = withBadges.reduce((prev: any, curr) => {
        curr.badges.forEach((archetype) => {
          if (!prev[archetype]) {
            prev[archetype] = [
              { uid: curr.uid, name: curr.name, score: curr.ratingScores[archetype] },
            ];
          } else {
            prev[archetype].push({
              uid: curr.uid,
              name: curr.name,
              score: curr.ratingScores[archetype],
            });
          }
        });
        return prev;
      }, {});

      Object.keys(groupedBadges).forEach((archetype) => {
        const playersEvaluated = groupedBadges[archetype];
        const sorted = playersEvaluated.toSorted(
          (a: any, b: any) => Number(b.score) - Number(a.score)
        );
        const first10 = sorted.slice(0, 10);
        console.log(`[name: ${name}] top ${archetype}s`);
        console.log(first10);
      });

      // save all to csv
      const csvOutput = arrayToCSV(analized);
      return saveCSVToFile(
        csvOutput,
        `${name.toLowerCase()}_analyzed.csv`.replaceAll("processor", ""),
        "./output"
      );
    });
    await Promise.allSettled(analizedPromises);
  } catch (error) {
    console.error("Error:", (error as Error).message);
    process.exit(1);
  }
}

main();
