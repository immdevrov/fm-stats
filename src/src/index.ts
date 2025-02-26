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

function main() {
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
    const alreadySignedForNextyear = players.filter((p) =>
      [12092862].includes(p.UID)
    );
    const dateFilteredPlayers = [
      filterByContractExpiryDate({
        players,
        currentDate: date,
        options: "THREE_MONTHS",
      }),
      alreadySignedForNextyear,
    ].flat();
    console.log(`${dateFilteredPlayers.length} players on short contract`);

    const cdProcessor = new CentralDefenderProcessor(dateFilteredPlayers);
    cdProcessor.print(cdProcessor.filter());
    const gkProcessor = new GoalKeeperProcessor(dateFilteredPlayers);
    gkProcessor.print(gkProcessor.filter());
    const stProcessor = new StrikersProcessor(dateFilteredPlayers);
    stProcessor.print(stProcessor.filter());
    const fbProcessor = new FullbackProcessor(dateFilteredPlayers);
    fbProcessor.print(fbProcessor.filter());
    const wgProcessor = new WingerProcessor(dateFilteredPlayers);
    wgProcessor.print(wgProcessor.filter());
    const dmProcessor = new DefensiveMidfilderProcessor(dateFilteredPlayers);
    dmProcessor.print(dmProcessor.filter());
    const cmProcessor = new CentralMidfilderProcessor(dateFilteredPlayers);
    cmProcessor.print(cmProcessor.filter());
    const amProcessor = new AttackingMidfilderProcessor(dateFilteredPlayers);
    amProcessor.print(amProcessor.filter());
  } catch (error) {
    console.error("Error:", (error as Error).message);
    process.exit(1);
  }
}

main();
